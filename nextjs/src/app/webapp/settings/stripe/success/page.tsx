"use client";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verifyCheckout = async () => {
      const url = new URL(window.location.href);
      const sessionId = url.searchParams.get("session_id");

      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        // Appel backend pour vérifier la session Stripe
        const res = await fetch(`/api/checkout/verify?session_id=${sessionId}`);
        if (!res.ok) throw new Error("Verification failed");
        setStatus("success");
      } catch (e) {
        setStatus("error");
      }
    };

    verifyCheckout();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      {status === "loading" && <p>Processing your payment...</p>}
      {status === "success" && (
        <>
          <h1 className="text-2xl font-bold text-green-600">✅ Payment Successful!</h1>
          <p>Your subscription is now active.</p>
          <a href="/webapp" className="mt-4 px-4 py-2 bg-primary-600 text-white rounded">
            Go to Dashboard
          </a>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold text-red-600">❌ Payment Verification Failed</h1>
          <p>Something went wrong while confirming your payment.</p>
          <a href="/webapp/settings/checkout" className="mt-4 px-4 py-2 bg-gray-200 rounded">
            Try Again
          </a>
        </>
      )}
    </div>
  );
}
