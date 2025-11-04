import Stripe from "stripe"
import { createSSRSassClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover"
})

export async function POST(req: Request) {
  const supabase = await createSSRSassClient()
  const client = supabase.getSupabaseClient()
  const { data: { user } } = await client.auth.getUser()
  
  //console.log(user);

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

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/webapp/settings/stripe/management`,
  });

  console.log(portalSession);

  return new Response(JSON.stringify({ url: portalSession.url }))
}
