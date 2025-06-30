'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, User, Calendar, Phone, MapPin, Heart, Shield, CheckCircle } from 'lucide-react';

interface OnboardingData {
  userMode: 'patient' | 'doctor' | 'teen' | 'parent' | 'specialist' | 'admin';
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInfo: {
    allergies: string[];
    chronicConditions: string[];
    medications: string[];
  };
  preferences: {
    notifications: boolean;
    dataSharing: boolean;
    analytics: boolean;
  };
}

const userModeOptions = [
  { value: 'patient', label: 'Patient', description: 'I want to track my health and get insights', icon: Heart },
  { value: 'doctor', label: 'Doctor', description: 'I want to monitor patients and provide care', icon: User },
  { value: 'teen', label: 'Teen', description: 'I\'m under 18 and want to track my health', icon: User },
  { value: 'parent', label: 'Parent', description: 'I want to manage my family\'s health', icon: User },
  { value: 'specialist', label: 'Specialist', description: 'I\'m a medical specialist or researcher', icon: User },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const [data, setData] = useState<OnboardingData>({
    userMode: 'patient',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    medicalInfo: {
      allergies: [],
      chronicConditions: [],
      medications: [],
    },
    preferences: {
      notifications: true,
      dataSharing: false,
      analytics: true,
    },
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser(user);

      // Check if onboarding is already completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    
    try {
      console.log('Starting onboarding completion...');
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          user_mode: data.userMode,
          date_of_birth: data.dateOfBirth || null,
          gender: data.gender,
          phone_number: data.phoneNumber || null,
          address: data.address,
          onboarding_completed: true,
          privacy_settings: data.preferences,
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      console.log('Profile updated successfully');

      // Create emergency contact if provided
      if (data.emergencyContact.name && data.emergencyContact.phone) {
        const { error: emergencyError } = await supabase
          .from('emergency_contacts')
          .insert({
            user_id: user.id,
            name: data.emergencyContact.name,
            relationship: data.emergencyContact.relationship,
            phone_number: data.emergencyContact.phone,
            is_primary: true,
          });

        if (emergencyError) {
          console.error('Emergency contact error:', emergencyError);
          // Don't throw here, emergency contact is optional
        } else {
          console.log('Emergency contact created successfully');
        }
      }

      // Create user preferences
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          notification_settings: {
            email: data.preferences.notifications,
            push: data.preferences.notifications,
            sms: false,
          },
          privacy_settings: {
            data_sharing: data.preferences.dataSharing,
            analytics: data.preferences.analytics,
          },
          allergies: data.medicalInfo.allergies,
          chronic_conditions: data.medicalInfo.chronicConditions,
        });

      if (preferencesError) {
        console.error('Preferences error:', preferencesError);
        // Don't throw here, preferences are optional
      } else {
        console.log('User preferences created successfully');
      }

      // Create default subscription
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'free',
          status: 'active',
        });

      if (subscriptionError) {
        console.error('Subscription error:', subscriptionError);
        // Don't throw here, subscription can be created later
      } else {
        console.log('Subscription created successfully');
      }

      console.log('Onboarding completed successfully, redirecting to dashboard...');
      
      // Small delay to ensure database updates are processed
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('Onboarding error:', error);
      setError(error.message || 'An error occurred during setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToArray = (field: keyof OnboardingData['medicalInfo'], value: string) => {
    if (value.trim()) {
      setData(prev => ({
        ...prev,
        medicalInfo: {
          ...prev.medicalInfo,
          [field]: [...prev.medicalInfo[field], value.trim()],
        },
      }));
    }
  };

  const removeFromArray = (field: keyof OnboardingData['medicalInfo'], index: number) => {
    setData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        [field]: prev.medicalInfo[field].filter((_, i) => i !== index),
      },
    }));
  };

  if (!user) {
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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-red-600/10 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 lg:p-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-red-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">HealthIQ</span>
            </div>
            <div className="text-sm text-gray-400">
              Step {currentStep} of 5
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-red-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            {/* Step 1: User Mode */}
            {currentStep === 1 && (
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to HealthIQ</h1>
                <p className="text-xl text-gray-300 mb-12">Let's personalize your experience. What describes you best?</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userModeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData(prev => ({ ...prev, userMode: option.value as any }))}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                        data.userMode === option.value
                          ? 'border-purple-600 bg-purple-600/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                    >
                      <option.icon className="w-8 h-8 mb-4 text-purple-400" />
                      <h3 className="text-xl font-semibold mb-2">{option.label}</h3>
                      <p className="text-gray-400">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div>
                <h1 className="text-4xl font-bold mb-4 text-center">Personal Information</h1>
                <p className="text-xl text-gray-300 mb-12 text-center">Help us provide better personalized insights</p>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={data.dateOfBirth}
                          onChange={(e) => setData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                      <select
                        value={data.gender}
                        onChange={(e) => setData(prev => ({ ...prev, gender: e.target.value as any }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="prefer_not_to_say">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={data.phoneNumber}
                        onChange={(e) => setData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <div>
                <h1 className="text-4xl font-bold mb-4 text-center">Address Information</h1>
                <p className="text-xl text-gray-300 mb-12 text-center">This helps us provide location-based health insights</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={data.address.street}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, street: e.target.value }
                        }))}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="Enter your street address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                      <input
                        type="text"
                        value={data.address.city}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                      <input
                        type="text"
                        value={data.address.state}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, state: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={data.address.zipCode}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, zipCode: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="ZIP Code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                      <select
                        value={data.address.country}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, country: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Emergency Contact & Medical Info */}
            {currentStep === 4 && (
              <div>
                <h1 className="text-4xl font-bold mb-4 text-center">Emergency Contact & Medical Info</h1>
                <p className="text-xl text-gray-300 mb-12 text-center">Important information for your safety</p>
                
                <div className="space-y-8">
                  {/* Emergency Contact */}
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Emergency Contact</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={data.emergencyContact.name}
                          onChange={(e) => setData(prev => ({ 
                            ...prev, 
                            emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                          }))}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                          placeholder="Contact name"
                        />
                        <input
                          type="text"
                          value={data.emergencyContact.relationship}
                          onChange={(e) => setData(prev => ({ 
                            ...prev, 
                            emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                          }))}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                          placeholder="Relationship"
                        />
                      </div>
                      <input
                        type="tel"
                        value={data.emergencyContact.phone}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Medical Information (Optional)</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Allergies</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {data.medicalInfo.allergies.map((allergy, index) => (
                            <span
                              key={index}
                              className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                            >
                              <span>{allergy}</span>
                              <button
                                onClick={() => removeFromArray('allergies', index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addToArray('allergies', e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                          placeholder="Type an allergy and press Enter"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Chronic Conditions</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {data.medicalInfo.chronicConditions.map((condition, index) => (
                            <span
                              key={index}
                              className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                            >
                              <span>{condition}</span>
                              <button
                                onClick={() => removeFromArray('chronicConditions', index)}
                                className="text-purple-400 hover:text-purple-300"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addToArray('chronicConditions', e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                          placeholder="Type a condition and press Enter"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Preferences */}
            {currentStep === 5 && (
              <div>
                <h1 className="text-4xl font-bold mb-4 text-center">Privacy & Preferences</h1>
                <p className="text-xl text-gray-300 mb-12 text-center">Customize your HealthIQ experience</p>
                
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Notifications</h3>
                          <p className="text-gray-400">Receive health insights and reminders</p>
                        </div>
                        <button
                          onClick={() => setData(prev => ({ 
                            ...prev, 
                            preferences: { ...prev.preferences, notifications: !prev.preferences.notifications }
                          }))}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            data.preferences.notifications ? 'bg-purple-600' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            data.preferences.notifications ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Data Sharing</h3>
                          <p className="text-gray-400">Share anonymized data to improve AI models</p>
                        </div>
                        <button
                          onClick={() => setData(prev => ({ 
                            ...prev, 
                            preferences: { ...prev.preferences, dataSharing: !prev.preferences.dataSharing }
                          }))}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            data.preferences.dataSharing ? 'bg-purple-600' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            data.preferences.dataSharing ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">Analytics</h3>
                          <p className="text-gray-400">Help us improve the app with usage analytics</p>
                        </div>
                        <button
                          onClick={() => setData(prev => ({ 
                            ...prev, 
                            preferences: { ...prev.preferences, analytics: !prev.preferences.analytics }
                          }))}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            data.preferences.analytics ? 'bg-purple-600' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            data.preferences.analytics ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-600/20 to-red-600/20 border border-purple-600/30 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="w-6 h-6 text-purple-400" />
                      <h3 className="text-lg font-semibold">Your Privacy Matters</h3>
                    </div>
                    <p className="text-gray-300">
                      Your health data is encrypted and stored securely. You have full control over your information 
                      and can modify these preferences anytime in your settings.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-600/20 border border-red-600/30 rounded-xl p-4 text-red-400">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-6 py-3 border border-white/20 rounded-xl hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-red-600 px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{currentStep === 5 ? 'Complete Setup' : 'Next'}</span>
                    {currentStep === 5 ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}