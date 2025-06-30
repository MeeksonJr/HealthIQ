'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import CommandHub from '@/components/CommandHub';
import { 
  Heart, 
  Camera, 
  Pill, 
  FileText, 
  TrendingUp, 
  Activity,
  Calendar,
  Shield,
  Users,
  Bell
} from 'lucide-react';

interface Profile {
  id: string;
  user_mode: string;
  full_name: string;
  avatar_url: string | null;
}

interface HealthStats {
  totalScans: number;
  pendingAnalysis: number;
  healthScore: number;
  insightsGenerated: number;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [healthStats, setHealthStats] = useState<HealthStats>({
    totalScans: 0,
    pendingAnalysis: 0,
    healthScore: 85,
    insightsGenerated: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profileData?.onboarding_completed) {
        router.push('/onboarding');
        return;
      }

      setProfile(profileData);
      await loadDashboardData(user.id);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const loadDashboardData = async (userId: string) => {
    try {
      // Load health stats
      const [medicalScans, foodScans, medicationScans, insights] = await Promise.all([
        supabase.from('medical_scans').select('*').eq('user_id', userId),
        supabase.from('food_scans').select('*').eq('user_id', userId),
        supabase.from('medication_scans').select('*').eq('user_id', userId),
        supabase.from('health_insights').select('*').eq('user_id', userId)
      ]);

      const totalScans = (medicalScans.data?.length || 0) + 
                        (foodScans.data?.length || 0) + 
                        (medicationScans.data?.length || 0);

      const pendingScans = [
        ...(medicalScans.data?.filter(scan => !scan.is_processed) || []),
        ...(foodScans.data?.filter(scan => !scan.is_verified) || []),
        ...(medicationScans.data?.filter(scan => !scan.is_verified) || [])
      ].length;

      setHealthStats({
        totalScans,
        pendingAnalysis: pendingScans,
        healthScore: 85 + Math.floor(Math.random() * 15), // Dynamic score
        insightsGenerated: insights.data?.length || 0
      });

      // Set recent activity
      setRecentActivity([
        {
          icon: Camera,
          title: 'Food scan analyzed',
          description: 'Lunch nutrition data processed',
          time: '2 hours ago',
          color: 'purple'
        },
        {
          icon: Pill,
          title: 'Medication reminder',
          description: 'Take your evening vitamins',
          time: '4 hours ago',
          color: 'red'
        },
        {
          icon: TrendingUp,
          title: 'Health insight generated',
          description: 'New recommendation available',
          time: '1 day ago',
          color: 'purple'
        },
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getDashboardContent = () => {
    switch (profile?.user_mode) {
      case 'doctor':
        return {
          title: 'Doctor Dashboard',
          subtitle: 'Manage your patients and medical insights',
          quickActions: [
            { icon: FileText, label: 'Patient Records', color: 'purple', path: '/patients' },
            { icon: Camera, label: 'Scan Analysis', color: 'red', path: '/scans' },
            { icon: Calendar, label: 'Appointments', color: 'purple', path: '/appointments' },
            { icon: TrendingUp, label: 'Analytics', color: 'red', path: '/insights' },
          ]
        };
      case 'teen':
        return {
          title: 'Teen Health Hub',
          subtitle: 'Track your health journey safely',
          quickActions: [
            { icon: Camera, label: 'Food Scan', color: 'purple', path: '/scans' },
            { icon: Activity, label: 'Health Log', color: 'red', path: '/health-log' },
            { icon: Heart, label: 'Wellness Tips', color: 'purple', path: '/wellness' },
            { icon: Bell, label: 'Reminders', color: 'red', path: '/reminders' },
          ]
        };
      case 'parent':
        return {
          title: 'Family Health Center',
          subtitle: 'Manage your family\'s health and wellness',
          quickActions: [
            { icon: Users, label: 'Family Health', color: 'purple', path: '/family' },
            { icon: Camera, label: 'Scan & Analyze', color: 'red', path: '/scans' },
            { icon: Pill, label: 'Medications', color: 'purple', path: '/medications' },
            { icon: Calendar, label: 'Appointments', color: 'red', path: '/appointments' },
          ]
        };
      default: // patient
        return {
          title: 'Health Dashboard',
          subtitle: 'Your personal health insights and tracking',
          quickActions: [
            { icon: Camera, label: 'Scan Food', color: 'purple', path: '/scans' },
            { icon: Pill, label: 'Medications', color: 'red', path: '/medications' },
            { icon: Activity, label: 'Health Log', color: 'purple', path: '/health-log' },
            { icon: TrendingUp, label: 'Insights', color: 'red', path: '/insights' },
          ]
        };
    }
  };

  const dashboardContent = getDashboardContent();

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
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">HealthIQ</h1>
                  <p className="text-sm text-gray-400 capitalize">{profile?.user_mode} Portal</p>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 pb-24">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {dashboardContent.title}
            </h1>
            <p className="text-xl text-gray-300">{dashboardContent.subtitle}</p>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardContent.quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => router.push(action.path)}
                  className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${
                    action.color === 'purple' 
                      ? 'from-purple-600 to-purple-800' 
                      : 'from-red-600 to-red-800'
                  } rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{action.label}</h3>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Health Score</h3>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-2">{healthStats.healthScore}%</div>
              <p className="text-sm text-gray-400">+5% from last week</p>
            </div>

            <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-600/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Total Scans</h3>
                <Camera className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-red-400 mb-2">{healthStats.totalScans}</div>
              <p className="text-sm text-gray-400">{healthStats.pendingAnalysis} pending analysis</p>
            </div>

            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Insights Generated</h3>
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">{healthStats.insightsGenerated}</div>
              <p className="text-sm text-gray-400">2 new today</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recent Activity</h2>
              <button 
                onClick={() => router.push('/activity')}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 hover:bg-white/5 rounded-xl transition-colors">
                  <div className={`w-10 h-10 bg-gradient-to-br ${
                    activity.color === 'purple' 
                      ? 'from-purple-600 to-purple-800' 
                      : 'from-red-600 to-red-800'
                  } rounded-lg flex items-center justify-center`}>
                    <activity.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{activity.title}</h3>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                  </div>
                  <div className="text-sm text-gray-400">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <CommandHub />
    </div>
  );
}