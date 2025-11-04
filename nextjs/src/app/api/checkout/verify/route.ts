import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSSRSassClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  console.log(session);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
  }

  // Update Supabase user subscription
  const supabase = await createSSRSassClient();
  const client = supabase.getSupabaseClient()
  const userId = session.metadata?.user_id;

  // session.payment_status
  if (userId) {
    await client.from("profiles").update({
      subscription_status: session.metadata?.plan_id,
    }).eq("id", userId);
  }

  return NextResponse.json({ success: true });
}
