interface PayPalPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export const PAYPAL_PLANS: Record<string, PayPalPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Basic health tracking',
    price: 0,
    interval: 'month',
    features: [
      '5 scans per month',
      'Basic AI analysis',
      'Health logging',
      'Email support'
    ]
  },
  pro: {
    id: 'P-1234567890', // Replace with actual PayPal plan ID
    name: 'Pro',
    description: 'Advanced health insights',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited scans',
      'Advanced AI analysis',
      'Health insights',
      'Export data',
      'Priority support'
    ]
  },
  premium: {
    id: 'P-0987654321', // Replace with actual PayPal plan ID
    name: 'Premium',
    description: 'Complete health platform',
    price: 19.99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Family accounts',
      'Doctor collaboration',
      'Custom reports',
      'Phone support'
    ]
  }
};

export class PayPalService {
  private static readonly CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  private static readonly SECRET = process.env.PAYPAL_SECRET_KEY!;
  private static readonly BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.paypal.com' 
    : 'https://api.sandbox.paypal.com';

  static async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.CLIENT_ID}:${this.SECRET}`).toString('base64');
      
      const response = await fetch(`${this.BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('PayPal token error:', error);
      throw new Error('Failed to get PayPal access token');
    }
  }

  static async createSubscription(planId: string, userId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.BASE_URL}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          plan_id: planId,
          subscriber: {
            name: {
              given_name: 'User',
              surname: userId
            }
          },
          application_context: {
            brand_name: 'HealthIQ',
            locale: 'en-US',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            payment_method: {
              payer_selected: 'PAYPAL',
              payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
            },
            return_url: `${window.location.origin}/subscription/success`,
            cancel_url: `${window.location.origin}/subscription/cancel`
          }
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PayPal subscription creation error:', error);
      throw new Error('Failed to create subscription');
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      await fetch(`${this.BASE_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'User requested cancellation'
        })
      });
    } catch (error) {
      console.error('PayPal subscription cancellation error:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  static async getSubscriptionDetails(subscriptionId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PayPal subscription details error:', error);
      throw new Error('Failed to get subscription details');
    }
  }
}