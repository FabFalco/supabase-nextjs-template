export interface PricingTier {
    key: string;
    name: string;
    price: number;
    priceId: string;
    description: string;
    features: string[];
    popular?: boolean;
    planLevel: number;
}

class PricingService {
    private static tiers: PricingTier[] = [];
    private static planKey: string[] = [];

    static initialize() {
        const keys = process.env.NEXT_PUBLIC_TIERS_KEYS?.split(',') || [];
        const names = process.env.NEXT_PUBLIC_TIERS_NAMES?.split(',') || [];
        const prices = process.env.NEXT_PUBLIC_TIERS_PRICES?.split(',').map(Number) || [];
        const pricesId = process.env.STRIPE_PRIVATE_TIERS_PRICESID?.split(',') || [];
        const descriptions = process.env.NEXT_PUBLIC_TIERS_DESCRIPTIONS?.split(',') || [];
        const features = process.env.NEXT_PUBLIC_TIERS_FEATURES?.split(',').map(f => f.split('|')) || [];
        const popularTier = process.env.NEXT_PUBLIC_POPULAR_TIER;

        this.tiers = names.map((name, index) => ({
            key: keys[index],
            name,
            price: prices[index],
            priceId: pricesId[index],
            description: descriptions[index],
            features: features[index] || [],
            popular: name === popularTier,
            planLevel: index,
        }));
        this.planKey = keys;
    }

    static getAllTiers(): PricingTier[] {
        if (this.tiers.length === 0) {
            this.initialize();
        }
        return this.tiers;
    }

    /** Retourne un tier unique */
    static getTier(planKey: string | null): PricingTier | null {
        if (!planKey) return null;
        if (this.tiers.length === 0) {
            this.initialize();
        }
        return this.tiers.find((tier) => tier.key === planKey) ?? null;
    }

    static getCommonFeatures(): string[] {
        return process.env.NEXT_PUBLIC_COMMON_FEATURES?.split(',') || [];
    }

    static formatPrice(price: number): string {
        return `$${price}`;
    }

    /** Retourne le niveau du plan (0 = free, 1 = pro, 2 = enterprise...) */
    static getPlanLevel(planKey?: string | null): number {
        const tier = this.getTier(planKey ?? "");
        return tier?.planLevel ?? 0; // fallback = free
    }

    /** Retourne la clé 0 => free*/
    static getFreePlanKey(): string {
        return this.planKey[0];
    }

    /** True si c'est le plan gratuit */
    static isPlanFree(planKey?: string | null): boolean {
        return this.getPlanLevel(planKey) === 0;
    }

    /** True si c'est un plan payant */
    static isPlanNotFree(planKey?: string | null): boolean {
        return this.getPlanLevel(planKey) > 0;
    }

    /** True si un plan est >= un niveau donné */
    static hasAtLeastPlan(planKey: string | null, minLevel: number): boolean {
        return this.getPlanLevel(planKey) >= minLevel;
    }
}

export default PricingService;