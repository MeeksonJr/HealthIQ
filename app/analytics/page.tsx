'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { AnalyticsService, HealthMetrics } from '@/lib/analytics';
import CommandHub from '@/components/CommandHub';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  Heart, 
  Brain,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setRefreshing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const healthMetrics = await AnalyticsService.getHealthMetrics(user.id, timeRange);
      setMetrics(healthMetrics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const report = await AnalyticsService.generateHealthReport(user.id, timeRange);
      
      // Create and download report as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
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
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Health Analytics</h1>
                  <p className="text-sm text-gray-400">Comprehensive health insights and trends</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={loadAnalytics}
                  disabled={refreshing}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={generateReport}
                  className="bg-gradient-to-r from-purple-600 to-red-600 px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 pb-24">
          {/* Time Range Filter */}
          <div className="flex items-center space-x-4 mb-8">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex space-x-2">
              {[
                { key: '7d', label: '7 Days' },
                { key: '30d', label: '30 Days' },
                { key: '90d', label: '90 Days' },
                { key: '1y', label: '1 Year' }
              ].map((range) => (
                <button
                  key={range.key}
                  onClick={() => setTimeRange(range.key as any)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    timeRange === range.key
                      ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {metrics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Health Score</h3>
                    <Heart className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">{metrics.healthScore}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${metrics.healthScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-600/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Total Scans</h3>
                    <Activity className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-3xl font-bold text-red-400 mb-2">{metrics.totalScans}</div>
                  <div className="text-sm text-gray-400">
                    Medical: {metrics.scansByType.medical}, Food: {metrics.scansByType.food}, Meds: {metrics.scansByType.medication}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Medication Adherence</h3>
                    <Calendar className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-400 mb-2">{metrics.medicationAdherence}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${metrics.medicationAdherence}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">AI Insights</h3>
                    <Brain className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">{metrics.insightsSummary.total}</div>
                  <div className="text-sm text-gray-400">
                    Critical: {metrics.insightsSummary.bySeverity.critical || 0}, 
                    High: {metrics.insightsSummary.bySeverity.high || 0}
                  </div>
                </div>
              </div>

              {/* Health Trends Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Weight Trend */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span>Weight Trend</span>
                  </h3>
                  {metrics.healthTrends.weight.length > 0 ? (
                    <div className="space-y-4">
                      {metrics.healthTrends.weight.slice(-7).map((point, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-400">{new Date(point.date).toLocaleDateString()}</span>
                          <span className="font-semibold">{point.value} kg</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No weight data available
                    </div>
                  )}
                </div>

                {/* Mood & Energy */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span>Mood & Energy</span>
                  </h3>
                  {metrics.healthTrends.mood.length > 0 || metrics.healthTrends.energy.length > 0 ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Average Mood Score</h4>
                        <div className="text-2xl font-bold text-purple-400">
                          {metrics.healthTrends.mood.length > 0 
                            ? (metrics.healthTrends.mood.reduce((sum, p) => sum + p.value, 0) / metrics.healthTrends.mood.length).toFixed(1)
                            : 'N/A'
                          }/10
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Average Energy Level</h4>
                        <div className="text-2xl font-bold text-red-400">
                          {metrics.healthTrends.energy.length > 0 
                            ? (metrics.healthTrends.energy.reduce((sum, p) => sum + p.value, 0) / metrics.healthTrends.energy.length).toFixed(1)
                            : 'N/A'
                          }/10
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No mood/energy data available
                    </div>
                  )}
                </div>
              </div>

              {/* Insights Breakdown */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-12">
                <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-blue-400" />
                  <span>Health Insights Breakdown</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* By Type */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">By Type</h4>
                    <div className="space-y-3">
                      {Object.entries(metrics.insightsSummary.byType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="capitalize text-gray-300">{type}</span>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-600 to-red-600 h-2 rounded-full"
                                style={{ width: `${(count / metrics.insightsSummary.total) * 100}%` }}
                              />
                            </div>
                            <span className="font-semibold w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Severity */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">By Severity</h4>
                    <div className="space-y-3">
                      {Object.entries(metrics.insightsSummary.bySeverity).map(([severity, count]) => {
                        const colors = {
                          critical: 'from-red-600 to-red-800',
                          high: 'from-orange-600 to-orange-800',
                          medium: 'from-yellow-600 to-yellow-800',
                          low: 'from-green-600 to-green-800',
                          info: 'from-blue-600 to-blue-800'
                        };
                        
                        return (
                          <div key={severity} className="flex items-center justify-between">
                            <span className="capitalize text-gray-300">{severity}</span>
                            <div className="flex items-center space-x-3">
                              <div className="w-24 bg-gray-700 rounded-full h-2">
                                <div 
                                  className={`bg-gradient-to-r ${colors[severity as keyof typeof colors]} h-2 rounded-full`}
                                  style={{ width: `${(count / metrics.insightsSummary.total) * 100}%` }}
                                />
                              </div>
                              <span className="font-semibold w-8 text-right">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scan Activity */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  <span>Scan Activity</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(metrics.scansByType).map(([type, count]) => {
                    const colors = {
                      medical: 'from-purple-600 to-purple-800',
                      food: 'from-red-600 to-red-800',
                      medication: 'from-blue-600 to-blue-800'
                    };
                    
                    return (
                      <div key={type} className={`bg-gradient-to-br ${colors[type as keyof typeof colors]}/20 border border-white/10 rounded-xl p-4`}>
                        <h4 className="text-lg font-semibold capitalize mb-2">{type} Scans</h4>
                        <div className="text-3xl font-bold mb-2">{count}</div>
                        <div className="text-sm text-gray-400">
                          {timeRange === '7d' ? 'This week' : 
                           timeRange === '30d' ? 'This month' : 
                           timeRange === '90d' ? 'Last 3 months' : 'This year'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <CommandHub />
    </div>
  );
}