import { supabase } from './supabase';

export interface HealthMetrics {
  totalScans: number;
  scansByType: Record<string, number>;
  healthScore: number;
  healthTrends: {
    weight: Array<{ date: string; value: number }>;
    bloodPressure: Array<{ date: string; systolic: number; diastolic: number }>;
    mood: Array<{ date: string; value: number }>;
    energy: Array<{ date: string; value: number }>;
  };
  medicationAdherence: number;
  insightsSummary: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

export interface UserEngagement {
  loginFrequency: number;
  featuresUsed: string[];
  timeSpentPerSession: number;
  lastActiveDate: string;
}

export class AnalyticsService {
  // Get comprehensive health metrics for a user
  static async getHealthMetrics(userId: string, timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<HealthMetrics> {
    try {
      const startDate = this.getStartDate(timeRange);

      // Get all scan data
      const [medicalScans, foodScans, medicationScans] = await Promise.all([
        supabase.from('medical_scans').select('*').eq('user_id', userId).gte('created_at', startDate),
        supabase.from('food_scans').select('*').eq('user_id', userId).gte('created_at', startDate),
        supabase.from('medication_scans').select('*').eq('user_id', userId).gte('created_at', startDate)
      ]);

      // Get health logs
      const { data: healthLogs } = await supabase
        .from('health_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .order('log_date', { ascending: true });

      // Get health insights
      const { data: insights } = await supabase
        .from('health_insights')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate);

      // Calculate metrics
      const totalScans = (medicalScans.data?.length || 0) + 
                        (foodScans.data?.length || 0) + 
                        (medicationScans.data?.length || 0);

      const scansByType = {
        medical: medicalScans.data?.length || 0,
        food: foodScans.data?.length || 0,
        medication: medicationScans.data?.length || 0
      };

      // Calculate health score based on various factors
      const healthScore = this.calculateHealthScore(healthLogs || [], insights || []);

      // Extract health trends
      const healthTrends = this.extractHealthTrends(healthLogs || []);

      // Calculate medication adherence (placeholder - would need medication schedule data)
      const medicationAdherence = this.calculateMedicationAdherence(userId);

      // Insights summary
      const insightsSummary = this.summarizeInsights(insights || []);

      return {
        totalScans,
        scansByType,
        healthScore,
        healthTrends,
        medicationAdherence,
        insightsSummary
      };
    } catch (error) {
      console.error('Get health metrics error:', error);
      throw new Error('Failed to get health metrics');
    }
  }

  // Get user engagement analytics
  static async getUserEngagement(userId: string): Promise<UserEngagement> {
    try {
      // This would typically come from user activity tracking
      // For now, we'll return mock data based on available information
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at, updated_at')
        .eq('user_id', userId)
        .single();

      const { data: recentActivity } = await supabase
        .from('health_logs')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        loginFrequency: recentActivity?.length || 0,
        featuresUsed: ['dashboard', 'scans', 'health-log', 'insights'],
        timeSpentPerSession: 15, // minutes - would track this in real app
        lastActiveDate: profile?.updated_at || profile?.created_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Get user engagement error:', error);
      throw new Error('Failed to get user engagement data');
    }
  }

  // Generate health report
  static async generateHealthReport(userId: string, timeRange: '30d' | '90d' | '1y' = '30d'): Promise<any> {
    try {
      const metrics = await this.getHealthMetrics(userId, timeRange);
      const engagement = await this.getUserEngagement(userId);

      const report = {
        period: timeRange,
        generatedAt: new Date().toISOString(),
        summary: {
          healthScore: metrics.healthScore,
          totalScans: metrics.totalScans,
          insightsGenerated: metrics.insightsSummary.total,
          medicationAdherence: metrics.medicationAdherence
        },
        trends: metrics.healthTrends,
        insights: metrics.insightsSummary,
        engagement,
        recommendations: this.generateRecommendations(metrics)
      };

      return report;
    } catch (error) {
      console.error('Generate health report error:', error);
      throw new Error('Failed to generate health report');
    }
  }

  // Track user activity (for analytics)
  static async trackActivity(userId: string, activity: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await supabase
        .from('ai_analysis_history')
        .insert({
          user_id: userId,
          analysis_type: 'user_activity',
          input_data: { activity, metadata },
          output_data: { timestamp: new Date().toISOString() }
        });
    } catch (error) {
      console.error('Track activity error:', error);
    }
  }

  private static getStartDate(timeRange: string): string {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private static calculateHealthScore(healthLogs: any[], insights: any[]): number {
    if (healthLogs.length === 0) return 75; // Default score

    let score = 100;
    const recentLogs = healthLogs.slice(-7); // Last 7 days

    // Deduct points for concerning trends
    const criticalInsights = insights.filter(i => i.severity === 'critical').length;
    const highInsights = insights.filter(i => i.severity === 'high').length;

    score -= criticalInsights * 15;
    score -= highInsights * 10;

    // Add points for consistent logging
    if (recentLogs.length >= 5) score += 5;

    // Add points for good vital signs (simplified)
    const avgMood = recentLogs.reduce((sum, log) => sum + (log.mood_score || 5), 0) / recentLogs.length;
    const avgEnergy = recentLogs.reduce((sum, log) => sum + (log.energy_level || 5), 0) / recentLogs.length;

    if (avgMood >= 7) score += 5;
    if (avgEnergy >= 7) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private static extractHealthTrends(healthLogs: any[]): HealthMetrics['healthTrends'] {
    return {
      weight: healthLogs
        .filter(log => log.weight)
        .map(log => ({ date: log.log_date, value: log.weight })),
      bloodPressure: healthLogs
        .filter(log => log.blood_pressure_systolic && log.blood_pressure_diastolic)
        .map(log => ({
          date: log.log_date,
          systolic: log.blood_pressure_systolic,
          diastolic: log.blood_pressure_diastolic
        })),
      mood: healthLogs
        .filter(log => log.mood_score)
        .map(log => ({ date: log.log_date, value: log.mood_score })),
      energy: healthLogs
        .filter(log => log.energy_level)
        .map(log => ({ date: log.log_date, value: log.energy_level }))
    };
  }

  private static calculateMedicationAdherence(userId: string): number {
    // Placeholder - would calculate based on medication schedule vs. actual intake
    return Math.floor(Math.random() * 20) + 80; // 80-100%
  }

  private static summarizeInsights(insights: any[]): HealthMetrics['insightsSummary'] {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    insights.forEach(insight => {
      byType[insight.insight_type] = (byType[insight.insight_type] || 0) + 1;
      bySeverity[insight.severity] = (bySeverity[insight.severity] || 0) + 1;
    });

    return {
      total: insights.length,
      byType,
      bySeverity
    };
  }

  private static generateRecommendations(metrics: HealthMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.healthScore < 70) {
      recommendations.push('Consider scheduling a check-up with your healthcare provider');
    }

    if (metrics.totalScans < 5) {
      recommendations.push('Regular health monitoring can provide valuable insights');
    }

    if (metrics.medicationAdherence < 90) {
      recommendations.push('Set up medication reminders to improve adherence');
    }

    if (metrics.insightsSummary.bySeverity.critical > 0) {
      recommendations.push('Address critical health insights with your doctor immediately');
    }

    return recommendations;
  }
}