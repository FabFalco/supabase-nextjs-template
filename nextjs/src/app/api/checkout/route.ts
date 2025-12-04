import Stripe from "stripe"
import { createSSRSassClient } from "@/lib/supabase/server"
import PlanService from "@/lib/billing/back/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover"
})

export async function POST(req: Request) {
  const { plan } = await req.json();
  const plans = PlanService.getPlans();
  const supabase = await createSSRSassClient()
  const client = supabase.getSupabaseClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) return new Response("Unauthorized", { status: 401 })
  if (!plans[plan]) return Response.json({ error: "Invalid plan" }, { status: 400 });

  const selected = plans[plan];
  const stripePriceId = selected.stripePriceId;
  if (!stripePriceId) {
    return Response.json(
      { error: "This plan cannot be purchased (no Stripe price ID)" },
      { status: 400 }
    );
  }

  // Récupérer customer Stripe
  const { data: profile } = await client
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single()

  let customerId = profile?.stripe_customer_id
  if (!customerId) {//return new Response("Unauthorized Stripe", { status: 401 })
    console.log("Si pas encore de client Stripe, on le crée");
        const customer = await stripe.customers.create({
        email: user.email!,
        name: user.user_metadata?.full_name || user.email,
        metadata: {
            supabase_user_id: user.id,
        },
        });

        console.log(customer);

        // On sauvegarde le Stripe ID dans Supabase
        await client
        .from("profiles")
        .update({ stripe_customer_id: customer.id })
        .eq("id", user.id);

        // On affecte la valeur
        customerId = customer.id;

        console.log("On sauvegarde le Stripe ID dans Supabase");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/webapp/settings/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/webapp/settings/stripe/cancel`,
    metadata: {
      user_id: user.id,
      price_id: stripePriceId,
      planKey: plan,
    },
  })
  
  return new Response(JSON.stringify({ url: session.url }))
}
