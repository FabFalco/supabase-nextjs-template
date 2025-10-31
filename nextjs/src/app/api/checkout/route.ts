import Stripe from "stripe"
import { createSSRSassClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover"
})

export async function POST(req: Request) {
  const { priceId } = await req.json()
  const supabase = await createSSRSassClient()
  const client = supabase.getSupabaseClient()
  const { data: { user } } = await client.auth.getUser()
  
  console.log(priceId);
  console.log(user);

  if (!user) return new Response("Unauthorized", { status: 401 })

  // Récupérer customer Stripe
  const { data: profile } = await client
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single()

  let customerId = profile?.stripe_customer_id
  console.log(customerId);

  if (!customerId) return new Response("Unauthorized Stripe", { status: 401 })

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: "price_1SH17kRukCqEibod9Z4M5rv6", quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/webapp/settings/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/webapp/settings/stripe/cancel`,
  })

  console.log(session);
  
  return new Response(JSON.stringify({ url: session.url }))
}
