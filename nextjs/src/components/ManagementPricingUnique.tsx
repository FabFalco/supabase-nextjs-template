"use client";
import React, { useEffect, useState } from "react";
import { Check } from 'lucide-react';
import PricingService from "@/lib/billing/front/pricing";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader as Loader2 } from 'lucide-react';
import { createSPASassClient } from '@/lib/supabase/client';
import { useGlobal } from '@/lib/context/GlobalContext';
import { PricingTier } from '@/lib/billing/front/pricing';


const ManagementPricing = () => {
    /*const { user } = useGlobal();
    // Sécurisation : fallback si user ou user.plan pas chargé
    const plan = user?.plan ?? "Pro";

    const tiers = PricingService.getTier(plan);*/
    const commonFeatures = PricingService.getCommonFeatures();
    
    const { user } = useGlobal(); // peut être undefined au début
    const [planKey, setPlanKey] = useState<string | null>(null);
    const [tiers, setTiers] = useState<PricingTier[]>([]);
    //const [commonFeatures, setCommonFeatures] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Dès que user change, on met à jour planKey
    useEffect(() => {
        // sécurité : user peut être null/undefined ou avoir plan undefined
        const p = user?.plan ?? null;
        setPlanKey(p);
    }, [user]);

    // charge les tiers quand planKey est disponible (ou fallback)
    useEffect(() => {
        let mounted = true;

        async function loadTiers() {
        setLoading(true);
        try {
            // PricingService.getTier peut retourner un array ou un objet. On gère les deux cas.
            const result = await PricingService.getTier(planKey);
            const normalized = Array.isArray(result) ? result : [result];
            //const features = await PricingService.getCommonFeatures?.() ?? [];
            if (!mounted) return;
            setTiers(normalized);
            //setCommonFeatures(features);
        } catch (err) {
            console.error("Erreur lors du chargement des tiers :", err);
            if (mounted) {
            setTiers([]); // safe fallback
            //setCommonFeatures([]);
            }
        } finally {
            if (mounted) setLoading(false);
        }
        }

        loadTiers();

        return () => {
        mounted = false;
        };
    }, [planKey]);

    const handleManagePlan = async (tierName: string, price: number) => {
        //if(price === 0) return;

        const supabase = await createSPASassClient();
        const client = supabase.getSupabaseClient();
        try {
        const {
            data: { session },
        } = await client.auth.getSession();

        if (session) {
            // 🔹 Utilisateur connecté → démarrer le checkout Stripe
            const res = await fetch("/api/checkout/manage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({tierName}),
            });

            if (!res.ok) throw new Error("Checkout failed");
            const data = await res.json();

            if (data.url) {
            window.location.href = data.url; // 🔁 redirection Stripe Checkout
            } else {
            alert(data.error || "Unable to start checkout");
            }
        } else {
            // 🔹 Pas connecté → rediriger vers /auth/register avec callback
            const redirectUrl = `/auth/register?redirect=/webapp/setting/stripe/management`;
            window.location.href = redirectUrl;
        }
        } catch (err) {
        console.error("Error starting checkout:", err);
        alert("Something went wrong. Please try again.");
        }
    };

    return (
        <section id="pricing" className="py-24 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-gray-600 text-lg">Choose the plan that&#39;s right for your business</p>
                </div>

                {loading ? 
                <div className="flex justify-center items-center min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
                : (<div className="grid md:grid-cols-3 gap-8 mb-12">
                    {tiers.map((tier) => (
                        <Card
                            key={tier.name}
                            className={`relative flex flex-col ${
                                /*tier.popular ? */'border-primary-500 shadow-lg'/* : ''*/
                            }`}
                        >
                            {tier.popular ? (
                                <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
                                    Most Popular
                                </div>
                            ) : <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-primary-500 text-white text-sm rounded-full">
                                    Your choice
                                </div>
                            }  

                            <CardHeader>
                                <CardTitle>{tier.name}</CardTitle>
                                <CardDescription>{tier.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-grow flex flex-col">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{PricingService.formatPrice(tier.price)}</span>
                                    <span className="text-gray-600 ml-2">/month</span>
                                </div>

                                <ul className="space-y-3 mb-8 flex-grow">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <Check className="h-5 w-5 text-green-500" />
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleManagePlan(tier.name, tier.price)}
                                    className={`w-full text-center px-6 py-3 rounded-lg font-medium transition-colors ${
                                        /*tier.popular
                                        ? */"bg-primary-600 text-white hover:bg-primary-700"
                                        /*: "bg-gray-50 text-gray-900 hover:bg-gray-100"*/
                                    }`}
                                    >
                                    Manage your plan
                                </button>
                            </CardContent>
                        </Card>
                    ))}
                </div>)}

                <div className="text-center">
                    <p className="text-gray-600">
                        All plans include: {commonFeatures.join(', ')}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ManagementPricing;
