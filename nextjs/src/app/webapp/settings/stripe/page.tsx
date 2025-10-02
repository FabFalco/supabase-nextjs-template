'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/webapp/ui/card';
import { Button } from '@/components/webapp/ui/button';
import { ArrowLeft, CreditCard, ExternalLink, CircleAlert as AlertCircle } from 'lucide-react';
import TopNavBar from '@/components/webapp/TopNavBar';

export default function StripeSettingsPage() {
  const router = useRouter();
  const [stripeConnected, setStripeConnected] = useState(false);

  const handleConnectStripe = () => {
    window.open('https://bolt.new/setup/stripe', '_blank');
  };

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.push('/webapp')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <Card className="bg-white mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Stripe Payment Settings</CardTitle>
                  <CardDescription>Manage your Stripe integration and payment processing</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-2">Connect Stripe for Payments</h4>
                    <p className="text-sm text-blue-800 mb-4">
                      To accept payments in your application, you'll need to use Stripe, which is the industry standard for secure payment processing.
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium text-blue-900">Before you begin:</p>
                      <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                        <li>Create a Stripe account if you haven't already</li>
                        <li>Navigate to the Developers section in your Stripe Dashboard</li>
                        <li>Get your Stripe API keys</li>
                      </ol>
                    </div>

                    <Button
                      onClick={handleConnectStripe}
                      className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Setup Stripe Integration
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Stripe Connection</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {stripeConnected ? 'Connected and ready to accept payments' : 'Not configured yet'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      stripeConnected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {stripeConnected ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">Important Information</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Never share your Stripe secret keys publicly</li>
                  <li>• Use test mode during development</li>
                  <li>• Review Stripe's security best practices</li>
                  <li>• Monitor your payment activity regularly</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Helpful Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="https://dashboard.stripe.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">Create Stripe Account</p>
                  <p className="text-sm text-gray-600">Sign up for a new Stripe account</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </a>

              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">API Keys</p>
                  <p className="text-sm text-gray-600">Access your Stripe API keys</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </a>

              <a
                href="https://stripe.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">Stripe Documentation</p>
                  <p className="text-sm text-gray-600">Learn more about Stripe integration</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
