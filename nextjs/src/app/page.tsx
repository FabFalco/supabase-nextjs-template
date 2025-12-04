import React from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, Shield, Users, Key, Database, Clock, Calendar, TreeDeciduous, FolderKanban, ListTodo } from 'lucide-react';
import AuthAwareButtons from '@/components/AuthAwareButtons';
import HomePricing from "@/components/HomePricing";
import { Treemap } from 'recharts';

export default function Home() {
  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME;

  const features = [
    {
      icon: ListTodo,
      title: 'Organize your tasks',
      description: 'Drag and drop. Easy to use.',
      color: 'text-green-600'
    },
    {
      icon: FolderKanban,
      title: 'See clearly instantly',
      description: 'A summary view that improves your productivity.',//A summary view that structures your progress.
      color: 'text-blue-600'
    },
    {
      icon: Clock,
      title: 'Generate your automatic summary',
      description: 'Summary, actions, blocks: all in one click.',
      color: 'text-red-600'
    },
    /*{
      icon: Shield,
      title: 'Robust Authentication',
      description: 'Secure login with email/password, Multi-Factor Authentication, and SSO providers',
      color: 'text-green-600'
    },
    {
      icon: Database,
      title: 'File Management',
      description: 'Built-in file storage with secure sharing, downloads, and granular permissions',
      color: 'text-orange-600'
    },
    {
      icon: Users,
      title: 'User Settings',
      description: 'Complete user management with password updates, MFA setup, and profile controls',
      color: 'text-red-600'
    },
    {
      icon: Clock,
      title: 'Task Management',
      description: 'Built-in todo system with real-time updates and priority management',
      color: 'text-teal-600'
    },
    {
      icon: Globe,
      title: 'Legal Documents',
      description: 'Pre-configured privacy policy, terms of service, and refund policy pages',
      color: 'text-purple-600'
    },
    {
      icon: Key,
      title: 'Cookie Consent',
      description: 'GDPR-compliant cookie consent system with customizable preferences',
      color: 'text-blue-600'
    }*/
  ];

  const badfeatures = [
    {
      icon: Users,
      title: 'Meetings without follow-up',
      //description: 'Drag and drop, statuses, simple columns.',
      color: 'text-green-600'
    },
    {
      icon: Key,
      title: 'Tasks scattered',
      //description: 'A summary view that structures your progress.',
      color: 'text-blue-600'
    },
    {
      icon: Clock,
      title: 'Reports to be completedy',
      //description: 'Summary, actions, blocks: all in one click.',
      color: 'text-teal-600'
    },
  ];

  const stats = [
    { label: 'Active Users', value: '10K+' },
    { label: 'Organizations', value: '2K+' },
    { label: 'Countries', value: '50+' },
    { label: 'Uptime', value: '99.9%' }
  ];

  return (
      <div className="min-h-screen">
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                {productName}
              </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-gray-600 hover:text-gray-900">
                  Features
                </Link>

                <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
                {/*<Link
                    href="https://github.com/FabFalco/supabase-nextjs-template"
                    className="text-gray-600 hover:text-gray-900"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  Documentation
                </Link>

                <Link
                    href="https://github.com/FabFalco/supabase-nextjs-template"
                    className="bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  Grab This Template
                </Link>*/}

                <AuthAwareButtons variant="nav" />
              </div>
            </div>
          </div>
        </nav>

        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Kanban that writes your reports for you.
                <span className="block text-primary-600">No pain. No report to write.</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                Easily manage your tasks, projects and meetings. Generate summaries in one click.
              </p>
              <div className="mt-10 flex gap-4 justify-center">

                <AuthAwareButtons />
              </div>
            </div>
          </div>
        </section>

        {/*<section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl font-bold text-primary-600">{stat.value}</div>
                    <div className="mt-2 text-sm text-gray-600">{stat.label}</div>
                  </div>
              ))}
            </div>
          </div>
        </section>*/}

        {/* Features Section */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">The simplest way to reports</h2>
              <p className="mt-4 text-xl text-gray-600">
                Just don't do it.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                  <div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-gray-600">{feature.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        <HomePricing />

{/* Bad Features Section 
        <section id="badfeatures" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">You spend too much time organizing... and even more time summarizing.</h2>
              <p className="mt-4 text-xl text-gray-600">
                No one really knows "where we stand".
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {badfeatures.map((feature, index) => (
                  <div
                      key={index}
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                    <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-gray-600">{feature.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>
        */}

        <section className="py-24 bg-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to Transform Your project management ?
            </h2>
            <p className="mt-4 text-xl text-primary-100">
              Join the users who save time with {productName}
            </p>
            <Link
                href="/webapp"
                className="mt-8 inline-flex items-center px-6 py-3 rounded-lg bg-white text-primary-600 font-medium hover:bg-primary-50 transition-colors"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Product</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="#features" className="text-gray-600 hover:text-gray-900">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Resources</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="https://github.com/FabFalco/supabase-nextjs-template" className="text-gray-600 hover:text-gray-900">
                      Documentation
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
                <ul className="mt-4 space-y-2">
                  <li>
                    <Link href="/legal/privacy" className="text-gray-600 hover:text-gray-900">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal/terms" className="text-gray-600 hover:text-gray-900">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-600">
                © {new Date().getFullYear()} {productName}. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
  );
}