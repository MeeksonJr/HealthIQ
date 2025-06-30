/*
  # Comprehensive Health AI Platform Database Schema

  1. New Tables
    - `profiles` - User profile information with role-based access
    - `subscriptions` - User subscription management
    - `medical_scans` - Medical imaging and scan data
    - `food_scans` - Food analysis and nutrition data
    - `medication_scans` - Medication identification and tracking
    - `health_insights` - AI-generated health insights
    - `health_logs` - Daily health tracking logs
    - `scan_results` - AI analysis results for all scan types
    - `user_preferences` - User settings and preferences
    - `ai_analysis_history` - Historical AI analysis data
    - `emergency_contacts` - Emergency contact information
    - `medical_history` - Comprehensive medical history
    - `appointments` - Medical appointments tracking
    - `notifications` - System notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure data access based on user roles and ownership

  3. Features
    - Multi-role user system (patient, doctor, teen, parent, etc.)
    - Comprehensive health tracking
    - AI-powered analysis and insights
    - Subscription management
    - Emergency contact system
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles with role-based access
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  user_mode text NOT NULL DEFAULT 'patient' CHECK (user_mode IN ('patient', 'doctor', 'teen', 'parent', 'specialist', 'admin')),
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  phone_number text,
  address jsonb,
  emergency_contact_id uuid,
  medical_id text,
  is_verified boolean DEFAULT false,
  onboarding_completed boolean DEFAULT false,
  privacy_settings jsonb DEFAULT '{"data_sharing": false, "analytics": true, "notifications": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Subscription management
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'premium', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  paypal_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  features jsonb DEFAULT '{"max_scans": 10, "ai_analysis": true, "export_data": false}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medical scans (X-rays, MRIs, CT scans, etc.)
CREATE TABLE IF NOT EXISTS medical_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_type text NOT NULL CHECK (scan_type IN ('xray', 'mri', 'ct', 'ultrasound', 'blood_test', 'other')),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_size integer,
  file_type text,
  body_part text,
  scan_date date,
  doctor_name text,
  facility_name text,
  is_processed boolean DEFAULT false,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  tags text[],
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Food scans and nutrition analysis
CREATE TABLE IF NOT EXISTS food_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text NOT NULL,
  identified_foods jsonb,
  nutrition_data jsonb,
  calories_total numeric,
  meal_type text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  consumed_at timestamptz DEFAULT now(),
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  is_verified boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medication scans and identification
CREATE TABLE IF NOT EXISTS medication_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  identified_medication jsonb,
  medication_name text,
  dosage text,
  manufacturer text,
  ndc_number text,
  active_ingredients text[],
  warnings text[],
  side_effects text[],
  interactions text[],
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  is_verified boolean DEFAULT false,
  prescription_related boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI-generated health insights
CREATE TABLE IF NOT EXISTS health_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('nutrition', 'medical', 'medication', 'lifestyle', 'preventive')),
  title text NOT NULL,
  description text NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  recommendations text[],
  data_sources uuid[],
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Daily health tracking logs
CREATE TABLE IF NOT EXISTS health_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  weight numeric,
  height numeric,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  heart_rate integer,
  temperature numeric,
  blood_sugar numeric,
  mood_score integer CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_hours numeric,
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  exercise_minutes integer DEFAULT 0,
  water_intake_ml integer DEFAULT 0,
  symptoms text[],
  medications_taken text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- AI analysis results for all scan types
CREATE TABLE IF NOT EXISTS scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL,
  scan_type text NOT NULL CHECK (scan_type IN ('medical', 'food', 'medication')),
  ai_model_used text NOT NULL,
  analysis_data jsonb NOT NULL,
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  processing_time_ms integer,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  reviewed_by_doctor boolean DEFAULT false,
  doctor_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_settings jsonb DEFAULT '{"email": true, "push": true, "sms": false}',
  privacy_settings jsonb DEFAULT '{"data_sharing": false, "analytics": true}',
  health_goals jsonb,
  dietary_restrictions text[],
  allergies text[],
  chronic_conditions text[],
  preferred_units jsonb DEFAULT '{"weight": "kg", "height": "cm", "temperature": "celsius"}',
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- AI analysis history for tracking and improvements
CREATE TABLE IF NOT EXISTS ai_analysis_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type text NOT NULL,
  input_data jsonb,
  output_data jsonb,
  model_version text,
  processing_time_ms integer,
  accuracy_feedback numeric CHECK (accuracy_feedback >= 0 AND accuracy_feedback <= 1),
  user_feedback text,
  created_at timestamptz DEFAULT now()
);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL,
  phone_number text NOT NULL,
  email text,
  address jsonb,
  is_primary boolean DEFAULT false,
  medical_power_of_attorney boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comprehensive medical history
CREATE TABLE IF NOT EXISTS medical_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  condition_name text NOT NULL,
  diagnosis_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic', 'monitoring')),
  severity text CHECK (severity IN ('mild', 'moderate', 'severe')),
  doctor_name text,
  facility_name text,
  treatment text,
  medications text[],
  notes text,
  is_family_history boolean DEFAULT false,
  family_member text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medical appointments tracking
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name text NOT NULL,
  specialty text,
  facility_name text,
  appointment_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  appointment_type text CHECK (appointment_type IN ('checkup', 'consultation', 'follow_up', 'emergency', 'procedure')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  reason text,
  notes text,
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- System notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'reminder')),
  category text CHECK (category IN ('health', 'medication', 'appointment', 'system', 'insight')),
  is_read boolean DEFAULT false,
  action_url text,
  action_label text,
  expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for medical_scans
CREATE POLICY "Users can manage own medical scans"
  ON medical_scans FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for food_scans
CREATE POLICY "Users can manage own food scans"
  ON food_scans FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for medication_scans
CREATE POLICY "Users can manage own medication scans"
  ON medication_scans FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for health_insights
CREATE POLICY "Users can manage own health insights"
  ON health_insights FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for health_logs
CREATE POLICY "Users can manage own health logs"
  ON health_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for scan_results
CREATE POLICY "Users can read own scan results"
  ON scan_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medical_scans WHERE id = scan_results.scan_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM food_scans WHERE id = scan_results.scan_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM medication_scans WHERE id = scan_results.scan_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for ai_analysis_history
CREATE POLICY "Users can read own AI analysis history"
  ON ai_analysis_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can manage own emergency contacts"
  ON emergency_contacts FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for medical_history
CREATE POLICY "Users can manage own medical history"
  ON medical_history FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for appointments
CREATE POLICY "Users can manage own appointments"
  ON appointments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can manage own notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_mode ON profiles(user_mode);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_scans_user_id ON medical_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_scans_scan_type ON medical_scans(scan_type);
CREATE INDEX IF NOT EXISTS idx_food_scans_user_id ON food_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_food_scans_consumed_at ON food_scans(consumed_at);
CREATE INDEX IF NOT EXISTS idx_medication_scans_user_id ON medication_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_health_insights_user_id ON health_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_health_insights_severity ON health_insights(severity);
CREATE INDEX IF NOT EXISTS idx_health_logs_user_id ON health_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_log_date ON health_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_scan_results_scan_id ON scan_results(scan_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_scans_updated_at BEFORE UPDATE ON medical_scans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_food_scans_updated_at BEFORE UPDATE ON food_scans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medication_scans_updated_at BEFORE UPDATE ON medication_scans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_insights_updated_at BEFORE UPDATE ON health_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_logs_updated_at BEFORE UPDATE ON health_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scan_results_updated_at BEFORE UPDATE ON scan_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_history_updated_at BEFORE UPDATE ON medical_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();