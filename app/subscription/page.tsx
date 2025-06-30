'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { PayPalService, PAYPAL_PLANS } from '@/lib/paypal';
import CommandHub from '@/components/CommandHub';
import { 
  Crown, 
  Check, 
  X, 
  CreditCard, 
  Shield, 
  Zap, 
  Users, 
  FileText,
  Star,
  ArrowRight
} from 'lucide-react';

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  current_period_end: string | null;
  paypal_subscription_id: string | null;
}

export default function SubscriptionPage() {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setProcessingPlan(planId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (planId === 'free') {
        // Downgrade to free
        await supabase
          .from('subscriptions')
          .update({
            plan_type: 'free',
            status: 'active',
            paypal_subscription_id: null
          })
          .eq('user_id', user.id);

        loadSubscription();
        return;
      }

      // Create PayPal subscription
      const subscription = await PayPalService.createSubscription(planId, user.id);
      
      if (subscription.links) {
        const approvalUrl = subscription.links.find((link: any) => link.rel === 'approve')?.href;
        if (approvalUrl) {
          window.location.href = approvalUrl;
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      if (!currentSubscription?.paypal_subscription_id) return;

      await PayPalService.cancelSubscription(currentSubscription.paypal_subscription_id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancel_at_period_end: true
          })
          .eq('user_id', user.id);

        loadSubscription();
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-red-600/5 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-red-600 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Subscription</h1>
                  <p className="text-sm text-gray-400">Manage your HealthIQ plan</p>
                </div>
              </div>

              {currentSubscription && (
                <div className="text-sm">
                  <span className="text-gray-400">Current Plan: </span>
                  <span className="font-semibold capitalize text-purple-400">
                    {currentSubscription.plan_type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 pb-24">
          {/* Current Subscription Status */}
          {currentSubscription && (
            <div className="mb-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">Current Subscription</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-400 text-sm">Plan</p>
                  <p className="text-xl font-semibold capitalize">{currentSubscription.plan_type}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className={`text-xl font-semibold capitalize ${
                    currentSubscription.status === 'active' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {currentSubscription.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Next Billing</p>
                  <p className="text-xl font-semibold">
                    {currentSubscription.current_period_end 
                      ? new Date(currentSubscription.current_period_end).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {currentSubscription.plan_type !== 'free' && currentSubscription.status === 'active' && (
                <div className="mt-6">
                  <button
                    onClick={handleCancelSubscription}
                    className="px-6 py-2 border border-red-600 text-red-400 rounded-xl hover:bg-red-600/10 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pricing Plans */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
              <p className="text-xl text-gray-300">Unlock the full potential of AI-powered health insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.values(PAYPAL_PLANS).map((plan) => {
                const isCurrentPlan = currentSubscription?.plan_type === plan.id;
                const isPopular = plan.id === 'pro';

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white/5 backdrop-blur-sm border rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2 ${
                      isPopular 
                        ? 'border-purple-600 ring-2 ring-purple-600/30' 
                        : 'border-white/10'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-purple-600 to-red-600 px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span>Most Popular</span>
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-gray-400 mb-4">{plan.description}</p>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-gray-400">/{plan.interval}</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrentPlan || processingPlan === plan.id}
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        isCurrentPlan
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : plan.id === 'free'
                          ? 'border border-white/20 hover:bg-white/10'
                          : 'bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 transform hover:scale-105'
                      }`}
                    >
                      {processingPlan === plan.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : isCurrentPlan ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Current Plan</span>
                        </>
                      ) : (
                        <>
                          <span>{plan.id === 'free' ? 'Downgrade' : 'Upgrade'}</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features Comparison */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-8 text-center">Feature Comparison</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4">Feature</th>
                    <th className="text-center py-4 px-4">Free</th>
                    <th className="text-center py-4 px-4">Pro</th>
                    <th className="text-center py-4 px-4">Premium</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {[
                    { feature: 'Monthly Scans', free: '5', pro: 'Unlimited', premium: 'Unlimited' },
                    { feature: 'AI Analysis', free: 'Basic', pro: 'Advanced', premium: 'Advanced' },
                    { feature: 'Health Insights', free: '❌', pro: '✅', premium: '✅' },
                    { feature: 'Data Export', free: '❌', pro: '✅', premium: '✅' },
                    { feature: 'Family Accounts', free: '❌', pro: '❌', premium: '✅' },
                    { feature: 'Doctor Collaboration', free: '❌', pro: '❌', premium: '✅' },
                    { feature: 'Priority Support', free: '❌', pro: '✅', premium: '✅' },
                    { feature: 'Custom Reports', free: '❌', pro: '❌', premium: '✅' }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-4 px-4 font-medium">{row.feature}</td>
                      <td className="py-4 px-4 text-center text-gray-400">{row.free}</td>
                      <td className="py-4 px-4 text-center text-purple-400">{row.pro}</td>
                      <td className="py-4 px-4 text-center text-red-400">{row.premium}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-12 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-600/30 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold">Secure Payments</h3>
            </div>
            <p className="text-gray-300">
              All payments are processed securely through PayPal. Your financial information is never stored on our servers. 
              You can cancel your subscription at any time with no hidden fees.
            </p>
          </div>
        </main>
      </div>

      <CommandHub />
    </div>
  );
}