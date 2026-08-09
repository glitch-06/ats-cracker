import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  BorderStyle,
  AlignmentType,
} from "docx";
import pkg from "file-saver";
const { saveAs } = pkg;

function sectionHeading(text: string) {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    border: {
      bottom: { color: "999999", space: 2, style: BorderStyle.SINGLE, size: 6 },
    },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: "1F4E79" }),
    ],
  });
}

function bullet(text: string) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

export async function downloadOptimizedResume(resume: any, candidateName = "Your Name") {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: candidateName.toUpperCase(), bold: true, size: 32 })],
    }),
  );

  const contactBits = [
    resume.links?.linkedin,
    resume.links?.github,
    resume.links?.portfolio,
  ].filter(Boolean);

  if (contactBits.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: contactBits.join(" | "), size: 20, color: "444444" })],
      }),
    );
  }

  if (resume.summary) {
    children.push(sectionHeading("Professional Summary"));
    children.push(new Paragraph({ text: resume.summary, spacing: { after: 120 } }));
  }

  if (resume.skills?.length) {
    children.push(sectionHeading("Core Skills"));
    children.push(new Paragraph({ text: resume.skills.join(" • "), spacing: { after: 120 } }));
  }

  if (resume.experience?.length) {
    children.push(sectionHeading("Professional Experience"));
    for (const exp of resume.experience) {
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 40 },
          children: [
            new TextRun({ text: `${exp.title} — ${exp.company}`, bold: true, size: 22 }),
            new TextRun({ text: `\t${exp.dates ?? ""}`, italics: true, size: 20 }),
          ],
        }),
      );
      for (const b of exp.bullets ?? []) {
        children.push(bullet(b));
      }
    }
  }

  if (resume.projects?.length) {
    children.push(sectionHeading("Key Projects"));
    for (const p of resume.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({ text: p.name, bold: true, size: 21 }),
            p.link ? new TextRun({ text: `  —  ${p.link}`, size: 19, color: "1155CC" }) : new TextRun(""),
          ],
        }),
      );
      if (p.description) children.push(new Paragraph({ text: p.description, spacing: { after: 80 } }));
    }
  }

  if (resume.education?.length) {
    children.push(sectionHeading("Education"));
    for (const ed of resume.education) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${ed.degree} — ${ed.school}`, bold: true, size: 21 }),
            new TextRun({ text: `  (${ed.dates ?? ""})`, italics: true, size: 19 }),
          ],
        }),
      );
    }
  }

  if (resume.certifications?.length) {
    children.push(sectionHeading("Certifications"));
    for (const c of resume.certifications) {
      children.push(bullet(c.link ? `${c.name} — ${c.link}` : c.name));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "ATS_Optimized_Resume.docx");
}