import { supabase } from "./supabase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export async function buyCreditPack(
  packId: string,
  onSuccess: (creditsAdded: number) => void,
  onError: (message: string) => void,
) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) throw new Error("Please log in first.");

    // 1. Create order via our Edge Function
    const orderRes = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ packId }),
      },
    );
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(orderData.error);

    if (typeof window.Razorpay === "undefined") {
      throw new Error("Payment system is still loading — please try again in a moment.");
    }

    // 2. Open Razorpay checkout popup
    const rzp = new window.Razorpay({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "ATS Cracker",
      description: orderData.packName,
      order_id: orderData.orderId,
      handler: async function (response: any) {
        // 3. Verify payment via our Edge Function
        const verifyRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          },
        );
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          onError(verifyData.error ?? "Payment verification failed.");
          return;
        }
        onSuccess(verifyData.creditsAdded ?? 0);
      },
      modal: {
        ondismiss: function () {
          onError("Payment cancelled.");
        },
      },
      theme: { color: "#a3e635" },
    });

    rzp.on("payment.failed", function () {
      onError("Payment failed. Please try again.");
    });

    rzp.open();
  } catch (err: any) {
    onError(err.message ?? "Something went wrong.");
  }
}