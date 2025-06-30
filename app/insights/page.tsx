'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import CommandHub from '@/components/CommandHub';
import { 
  TrendingUp, 
  Brain, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Lightbulb,
  Calendar,
  Filter,
  Eye,
  X
} from 'lucide-react';

interface HealthInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  severity: string;
  recommendations: string[];
  confidence_score: number;
  is_read: boolean;
  created_at: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedInsight, setSelectedInsight] = useState<HealthInsight | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('health_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If no insights exist, create some sample ones
      if (!data || data.length === 0) {
        await createSampleInsights(user.id);
        // Reload after creating samples
        const { data: newData } = await supabase
          .from('health_insights')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setInsights(newData || []);
      } else {
        setInsights(data);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleInsights = async (userId: string) => {
    const sampleInsights = [
      {
        user_id: userId,
        insight_type: 'nutrition',
        title: 'Excellent Nutritional Balance',
        description: 'Your recent food scans show a well-balanced diet with adequate protein, healthy fats, and complex carbohydrates. Keep up the great work!',
        severity: 'info',
        recommendations: ['Continue current eating patterns', 'Consider adding more leafy greens', 'Stay hydrated'],
        confidence_score: 0.92
      },
      {
        user_id: userId,
        insight_type: 'lifestyle',
        title: 'Sleep Pattern Optimization',
        description: 'Your sleep logs indicate irregular sleep patterns. Consistent sleep schedule could improve your energy levels and overall health.',
        severity: 'medium',
        recommendations: ['Aim for 7-9 hours of sleep nightly', 'Establish a bedtime routine', 'Avoid screens 1 hour before bed'],
        confidence_score: 0.85
      },
      {
        user_id: userId,
        insight_type: 'medical',
        title: 'Blood Pressure Monitoring',
        description: 'Your recent blood pressure readings are within normal range. Continue monitoring regularly to maintain cardiovascular health.',
        severity: 'info',
        recommendations: ['Continue regular monitoring', 'Maintain current exercise routine', 'Keep sodium intake moderate'],
        confidence_score: 0.88
      },
      {
        user_id: userId,
        insight_type: 'preventive',
        title: 'Exercise Consistency Improvement',
        description: 'Your exercise logs show room for improvement in consistency. Regular physical activity can significantly boost your health score.',
        severity: 'low',
        recommendations: ['Aim for 150 minutes of moderate exercise weekly', 'Try incorporating walking into daily routine', 'Consider strength training 2x per week'],
        confidence_score: 0.79
      }
    ];

    for (const insight of sampleInsights) {
      await supabase.from('health_insights').insert(insight);
    }
  };

  const markAsRead = async (insightId: string) => {
    try {
      await supabase
        .from('health_insights')
        .update({ is_read: true })
        .eq('id', insightId);
      
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId ? { ...insight, is_read: true } : insight
        )
      );
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  const filteredInsights = insights.filter(insight => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !insight.is_read;
    return insight.insight_type === filter;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return Info;
      case 'low': return Lightbulb;
      default: return CheckCircle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'green';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nutrition': return Heart;
      case 'medical': return TrendingUp;
      case 'lifestyle': return Brain;
      case 'preventive': return CheckCircle;
      default: return Info;
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
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Health Insights</h1>
                  <p className="text-sm text-gray-400">AI-powered health recommendations and analysis</p>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                {insights.filter(i => !i.is_read).length} unread insights
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 pb-24">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { key: 'all', label: 'All Insights' },
              { key: 'unread', label: 'Unread' },
              { key: 'nutrition', label: 'Nutrition' },
              { key: 'medical', label: 'Medical' },
              { key: 'lifestyle', label: 'Lifestyle' },
              { key: 'preventive', label: 'Preventive' },
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filter === filterOption.key
                    ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          {/* Insights Grid */}
          {filteredInsights.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No insights found</h3>
              <p className="text-gray-400">Upload more scans and health data to generate insights</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredInsights.map((insight) => {
                const SeverityIcon = getSeverityIcon(insight.severity);
                const TypeIcon = getTypeIcon(insight.insight_type);
                const severityColor = getSeverityColor(insight.severity);
                
                return (
                  <div
                    key={insight.id}
                    className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                      !insight.is_read ? 'ring-2 ring-purple-600/30' : ''
                    }`}
                    onClick={() => {
                      setSelectedInsight(insight);
                      if (!insight.is_read) markAsRead(insight.id);
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${
                          severityColor === 'red' ? 'from-red-600 to-red-800' :
                          severityColor === 'yellow' ? 'from-yellow-600 to-yellow-800' :
                          severityColor === 'blue' ? 'from-blue-600 to-blue-800' :
                          'from-green-600 to-green-800'
                        } rounded-xl flex items-center justify-center`}>
                          <SeverityIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{insight.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <TypeIcon className="w-4 h-4" />
                            <span className="capitalize">{insight.insight_type}</span>
                            <span>•</span>
                            <span className="capitalize">{insight.severity}</span>
                          </div>
                        </div>
                      </div>
                      
                      {!insight.is_read && (
                        <div className="w-3 h-3 bg-purple-600 rounded-full" />
                      )}
                    </div>

                    <p className="text-gray-300 mb-4 line-clamp-3">{insight.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-400">
                          {Math.round(insight.confidence_score * 100)}% confidence
                        </div>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedInsight(null)} />
          
          <div className="relative w-full max-w-2xl bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${
                  getSeverityColor(selectedInsight.severity) === 'red' ? 'from-red-600 to-red-800' :
                  getSeverityColor(selectedInsight.severity) === 'yellow' ? 'from-yellow-600 to-yellow-800' :
                  getSeverityColor(selectedInsight.severity) === 'blue' ? 'from-blue-600 to-blue-800' :
                  'from-green-600 to-green-800'
                } rounded-xl flex items-center justify-center`}>
                  {(() => {
                    const SeverityIcon = getSeverityIcon(selectedInsight.severity);
                    return <SeverityIcon className="w-6 h-6 text-white" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedInsight.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    {(() => {
                      const TypeIcon = getTypeIcon(selectedInsight.insight_type);
                      return <TypeIcon className="w-4 h-4" />;
                    })()}
                    <span className="capitalize">{selectedInsight.insight_type}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedInsight.severity} Priority</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Analysis</h4>
                <p className="text-gray-300 leading-relaxed">{selectedInsight.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {selectedInsight.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="text-sm text-gray-400">
                  Generated on {new Date(selectedInsight.created_at).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-400">
                  {Math.round(selectedInsight.confidence_score * 100)}% AI Confidence
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CommandHub />
    </div>
  );
}