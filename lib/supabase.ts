import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          user_mode: 'patient' | 'doctor' | 'teen' | 'parent' | 'specialist' | 'admin';
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          phone_number: string | null;
          address: any | null;
          emergency_contact_id: string | null;
          medical_id: string | null;
          is_verified: boolean;
          onboarding_completed: boolean;
          privacy_settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          user_mode?: 'patient' | 'doctor' | 'teen' | 'parent' | 'specialist' | 'admin';
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          phone_number?: string | null;
          address?: any | null;
          emergency_contact_id?: string | null;
          medical_id?: string | null;
          is_verified?: boolean;
          onboarding_completed?: boolean;
          privacy_settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          user_mode?: 'patient' | 'doctor' | 'teen' | 'parent' | 'specialist' | 'admin';
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          phone_number?: string | null;
          address?: any | null;
          emergency_contact_id?: string | null;
          medical_id?: string | null;
          is_verified?: boolean;
          onboarding_completed?: boolean;
          privacy_settings?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: 'free' | 'pro' | 'premium' | 'enterprise';
          status: 'active' | 'cancelled' | 'expired' | 'suspended';
          paypal_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          features: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type?: 'free' | 'pro' | 'premium' | 'enterprise';
          status?: 'active' | 'cancelled' | 'expired' | 'suspended';
          paypal_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          features?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: 'free' | 'pro' | 'premium' | 'enterprise';
          status?: 'active' | 'cancelled' | 'expired' | 'suspended';
          paypal_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          features?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};