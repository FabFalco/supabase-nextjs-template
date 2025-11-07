import Stripe from "stripe"
import { createSSRSassClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover"
})

async function updateSubscriptionInDatabase(
  client: any,
  customerId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price.id || null;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  console.log(`Updating subscription for customer ${customerId}:`, {
    priceId,
    subscriptionId,
    status
  });

  await client
    .from("profiles")
    .update({
      subscription_status: status,
      subscription_plan_id: priceId,
      stripe_subscription_id: subscriptionId
    })
    .eq("stripe_customer_id", customerId);
}

async function handleSubscriptionCreated(
  client: any,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  console.log(`Subscription created for customer ${customerId}`);

  await updateSubscriptionInDatabase(client, customerId, subscription);
}

async function handleSubscriptionUpdated(
  client: any,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  console.log(`Subscription updated for customer ${customerId}`);

  await updateSubscriptionInDatabase(client, customerId, subscription);
}

async function handleSubscriptionDeleted(
  client: any,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  console.log(`Subscription deleted for customer ${customerId}`);

  await client
    .from("profiles")
    .update({
      subscription_status: subscription.status,
      subscription_plan_id: null,
      stripe_subscription_id: null
    })
    .eq("stripe_customer_id", customerId);
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!
  const body = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    const supabase = await createSSRSassClient()
    const client = supabase.getSupabaseClient()

    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(client, subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(client, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(client, subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
}
