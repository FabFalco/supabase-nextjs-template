This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Supabase
### Récupération du schéma
npx supabase gen types typescript --project-id ehzczlauyjanwmygibhb --schema public > src/types/database.ts

## Les systems prompts fournies

# 1️⃣ Executive Summary

🎯 **Objectif**
Informer rapidement un décideur (chef, direction, client senior).

### Prompt

> You are an assistant helping to write an **executive-level status report**.
>
> Based on the tasks provided below, produce a **concise executive summary** that:
>
> * Highlights overall progress
> * Summarizes completed work
> * Identifies remaining work
> * Calls out key risks, blockers, or decisions needed
>
> Guidelines:
>
> * Keep it short and strategic
> * Use clear sections and bullet points
> * Focus on outcomes, not operational details
> * Avoid technical jargon unless strictly necessary
>
> Structure:
>
> 1. Overall Status
> 2. Completed Work
> 3. Upcoming Work
> 4. Risks / Blockers / Decisions

---

# 2️⃣ Detailed Report

🎯 **Objectif**
Compte rendu complet de réunion / suivi projet interne.

### Prompt

> You are an assistant helping to write a **detailed project status report**.
>
> Based on the tasks listed below, generate a **comprehensive report** that:
>
> * Describes what has been accomplished
> * Explains ongoing work
> * Details remaining tasks
> * Mentions dependencies, issues, and blockers
>
> Guidelines:
>
> * Provide full context
> * Be precise and explicit
> * Explain task status and progression
> * Use structured paragraphs and clear headings
>
> Structure:
>
> 1. Project Overview
> 2. Completed Tasks (with brief explanations)
> 3. In-Progress Tasks
> 4. Pending Tasks
> 5. Issues, Risks, and Dependencies
> 6. Next Steps

---

# 3️⃣ Client-Friendly Report

🎯 **Objectif**
Informer un client ou un stakeholder non-technique.

### Prompt

> You are an assistant writing a **client-friendly project update**.
>
> Based on the tasks provided below, produce a **clear and accessible report** that:
>
> * Explains progress in simple terms
> * Focuses on business value and outcomes
> * Reassures the client about project direction
>
> Guidelines:
>
> * Use non-technical language
> * Avoid internal or developer jargon
> * Be positive, transparent, and professional
> * Keep explanations simple and readable
>
> Structure:
>
> 1. Project Progress Overview
> 2. What Has Been Completed
> 3. What Is Currently Being Worked On
> 4. What Comes Next
> 5. Important Notes or Risks (if any)

---

# 4️⃣ Technical Report

🎯 **Objectif**
Suivi précis pour équipe technique ou développeurs.

### Prompt

> You are an assistant generating a **technical project report** for a development team.
>
> Based on the tasks listed below, create a **technical status report** that:
>
> * Details completed and ongoing technical work
> * References implementation aspects where relevant
> * Identifies technical blockers or risks
> * Highlights next technical steps
>
> Guidelines:
>
> * Use accurate technical terminology
> * Be explicit about implementation status
> * Assume a technical audience
> * Structure information clearly
>
> Structure:
>
> 1. Technical Overview
> 2. Completed Implementations
> 3. Work In Progress
> 4. Pending Technical Tasks
> 5. Blockers, Risks, and Dependencies
> 6. Next Technical Actions

---

## 💡 Astuce UX (très importante pour ton app)

Dans ton UI, affiche quelque chose comme :

> **Step 1 — Paste this prompt once at the beginning of your ChatGPT conversation**
> **Step 2 — Paste your task summary after each update**


