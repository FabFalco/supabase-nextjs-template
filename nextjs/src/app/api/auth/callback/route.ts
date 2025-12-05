// src/app/api/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createSSRSassClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover"
})

//export const dynamic = "force-dynamic"; // ✅ important pour Next.js 15+

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
        // If no code provided, redirect to login
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const supabase = await createSSRSassClient()
    const client = supabase.getSupabaseClient()
    
    // Exchange the code for a session
    //await supabase.exchangeCodeForSession(code)
    const { data: sessionData, error: sessionError } = await supabase.exchangeCodeForSession(code)
    if (sessionError) {
        console.error("Session exchange error:", sessionError);
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const user = sessionData?.user;
    if (!user) {
        console.error("Not User in session exchange");
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Check MFA status
    const { data: aal, error: aalError } = await client.auth.mfa.getAuthenticatorAssuranceLevel()

    if (aalError) {
        console.error('Error checking MFA status:', aalError)
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // If user needs to complete MFA verification
    if (aal.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
        return NextResponse.redirect(new URL('/auth/2fa', request.url))
    }

    console.log("Récupère ton profil Supabase");
    console.log(user);

    // Récupère ton profil Supabase (ou table users/profiles)
    const { data: profile } = await client
        .from("profiles")
        .select("id, stripe_customer_id")
        .eq("id", user.id)
        .single();

    console.log(profile);
    // Si pas encore de client Stripe, on le crée
    if (!profile?.stripe_customer_id) {
        /*console.log("Si pas encore de client Stripe, on le crée");
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

        console.log("On sauvegarde le Stripe ID dans Supabase");*/
    }

    // If MFA is not required or already verified, proceed to app
    return NextResponse.redirect(new URL('/webapp', request.url))
}