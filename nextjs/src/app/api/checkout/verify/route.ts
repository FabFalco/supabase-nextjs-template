import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSSRSassClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });
  console.log(session);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not confirmed" }, { status: 400 });
  }

  // Update Supabase user subscription
  const supabase = await createSSRSassClient();
  const client = supabase.getSupabaseClient()
  const userId = session.metadata?.user_id;
  const planId = session.metadata?.price_id;
  const subscription = session.subscription as Stripe.Subscription;

  console.log(userId);
  console.log(planId);
  console.log(subscription);
  // session.payment_status
  if (userId) {
    await client.from("profiles").update({
      stripe_subscription_id: subscription.id,
      subscription_plan_id: planId,
      subscription_status: subscription.status,
    }).eq("id", userId);
  }

  return NextResponse.json({ success: true });
}
