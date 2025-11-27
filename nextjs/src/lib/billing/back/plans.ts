export type PlanKey = string;

export interface PlanDefinition {
  key: string;
  name: string;
  monthlyPrice: number;
  stripePriceId: string | null;
}

class PlanService {
  private static plans: PlanDefinition[] = [];

  static initialize() {
    const names = process.env.NEXT_PUBLIC_TIERS_NAMES?.split(",") ?? [];
    const prices = process.env.NEXT_PUBLIC_TIERS_PRICES?.split(",").map(Number) ?? [];
    const stripeIds = process.env.STRIPE_PRIVATE_TIERS_PRICESID?.split(",") ?? [];

    if (names.length !== prices.length || names.length !== stripeIds.length) {
      throw new Error("Invalid tier environment variables: lengths differ");
    }

    this.plans = names.map((name, index) => ({
      key: name.toLowerCase(), // "Free" → "free"
      name,
      monthlyPrice: prices[index],
      stripePriceId: stripeIds[index] === "null" ? null : stripeIds[index],
    }));
  }

  static getPlans(): PlanDefinition[] {
    if (this.plans.length === 0) {
      this.initialize();
    }
    return this.plans;
  }

  static getPlanKey(priceId: string | null): string {
    if (this.plans.length === 0) {
      this.initialize();
    }
    if(priceId === null) return this.plans[0].key;
    return this.plans.filter((element) => element.stripePriceId==priceId)[0].key;
  }
}

export default PlanService;