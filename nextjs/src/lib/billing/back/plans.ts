export type PlanKey = string;

export interface PlanDefinition {
  name: string;
  monthlyPrice: number;
  stripePriceId: string | null;
}

export function getPlans(): Record<PlanKey, PlanDefinition> {
  const names = process.env.NEXT_PUBLIC_TIERS_NAMES?.split(",") ?? [];
  const prices = process.env.NEXT_PUBLIC_TIERS_PRICES?.split(",").map(Number) ?? [];
  const stripeIds = process.env.STRIPE_PRIVATE_TIERS_PRICESID?.split(",") ?? [];

  if (names.length !== prices.length || names.length !== stripeIds.length) {
    throw new Error("Invalid tier environment variables: lengths differ");
  }

  const plans: Record<PlanKey, PlanDefinition> = {};

  names.forEach((name, i) => {
    const key = name.toLowerCase(); // "Free" → "free"

    plans[key] = {
      name,
      monthlyPrice: prices[i],
      stripePriceId: stripeIds[i] === "null" ? null : stripeIds[i],
    };
  });

  return plans;
}
