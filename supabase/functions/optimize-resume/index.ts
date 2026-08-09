// supabase/functions/optimize-resume/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Identify the caller from their JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const {
      jobDescription,
      resumeText,
      links, // { linkedin, github, portfolio, profiles: [], projects: [], certifications: [] }
    } = body;

    if (!jobDescription || !resumeText) {
      return new Response(JSON.stringify({ error: "Missing jobDescription or resumeText" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check free-use quota
    const { data: profile } = await supabase
      .from("profiles")
      .select("free_uses_remaining")
      .eq("id", userId)
      .single();

    if (!profile || profile.free_uses_remaining <= 0) {
      return new Response(JSON.stringify({ error: "No free uses remaining" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the LLM prompt
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume optimizer.
Given a job description and a candidate's raw resume text, produce a rewritten,
ATS-optimized resume as STRICT JSON only (no markdown, no commentary), matching
exactly this schema:

{
  "name": string (the candidate's full name, extracted from the resume text — if not found, use "Candidate"),
  "ats_score": number (0-100, estimated match score of the ORIGINAL resume vs JD before optimization),
  "match_keywords_added": string[],
  "summary": string,
  "skills": string[],
  "experience": [
    { "title": string, "company": string, "dates": string, "bullets": string[] }
  ],
  "education": [ { "degree": string, "school": string, "dates": string } ],
  "projects": [ { "name": string, "description": string, "link": string } ],
  "certifications": [ { "name": string, "link": string } ],
  "links": { "linkedin": string, "github": string, "portfolio": string }
}

Rules:
- Extract the candidate's name exactly as it appears at the top of the resume text.
- Rewrite bullet points using strong action verbs and quantify impact where plausible.
- Naturally weave in keywords/skills from the job description that genuinely match the candidate's background — never fabricate experience or skills they don't have.
- Keep it truthful to the original resume content, just better phrased and better matched to the JD.
- Include the provided links in the "links", "projects", and "certifications" fields exactly as given.`;

    const userPrompt = `JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME TEXT:
${resumeText}

OPTIONAL LINKS PROVIDED:
${JSON.stringify(links ?? {})}`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq API error: ${errText}`);
    }

    const groqData = await groqRes.json();
    const optimizedResume = JSON.parse(groqData.choices[0].message.content);

    // Save the result
    const { data: inserted, error: insertErr } = await supabase
      .from("optimizations")
      .insert({
        user_id: userId,
        job_description: jobDescription,
        ats_score: optimizedResume.ats_score ?? null,
        optimized_resume: optimizedResume,
        status: "done",
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // Decrement free uses
    await supabase
      .from("profiles")
      .update({ free_uses_remaining: profile.free_uses_remaining - 1 })
      .eq("id", userId);

    return new Response(JSON.stringify({ optimization: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});