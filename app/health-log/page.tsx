'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import CommandHub from '@/components/CommandHub';
import { 
  Activity, 
  Plus, 
  Calendar, 
  Heart, 
  Thermometer, 
  Droplets, 
  Moon, 
  Zap,
  TrendingUp,
  Edit,
  Trash2
} from 'lucide-react';

interface HealthLog {
  id: string;
  log_date: string;
  weight: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  mood_score: number | null;
  energy_level: number | null;
  sleep_hours: number | null;
  exercise_minutes: number | null;
  water_intake_ml: number | null;
  notes: string | null;
}

export default function HealthLogPage() {
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    weight: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    temperature: '',
    mood_score: 5,
    energy_level: 5,
    sleep_hours: '',
    exercise_minutes: '',
    water_intake_ml: '',
    notes: ''
  });
  const router = useRouter();

  useEffect(() => {
    loadHealthLogs();
  }, []);

  const loadHealthLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('health_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setHealthLogs(data || []);
    } catch (error) {
      console.error('Error loading health logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const logData = {
        user_id: user.id,
        log_date: selectedDate,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        mood_score: formData.mood_score,
        energy_level: formData.energy_level,
        sleep_hours: formData.sleep_hours ? parseFloat(formData.sleep_hours) : null,
        exercise_minutes: formData.exercise_minutes ? parseInt(formData.exercise_minutes) : null,
        water_intake_ml: formData.water_intake_ml ? parseInt(formData.water_intake_ml) : null,
        notes: formData.notes || null
      };

      const { error } = await supabase
        .from('health_logs')
        .upsert(logData, { onConflict: 'user_id,log_date' });

      if (error) throw error;

      setShowAddModal(false);
      setFormData({
        weight: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        temperature: '',
        mood_score: 5,
        energy_level: 5,
        sleep_hours: '',
        exercise_minutes: '',
        water_intake_ml: '',
        notes: ''
      });
      loadHealthLogs();
    } catch (error) {
      console.error('Error saving health log:', error);
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'weight': return Activity;
      case 'blood_pressure': return Heart;
      case 'heart_rate': return Heart;
      case 'temperature': return Thermometer;
      case 'sleep': return Moon;
      case 'exercise': return Zap;
      case 'water': return Droplets;
      default: return Activity;
    }
  };

  const formatMetricValue = (log: HealthLog, metric: string) => {
    switch (metric) {
      case 'weight':
        return log.weight ? `${log.weight} kg` : 'Not logged';
      case 'blood_pressure':
        return log.blood_pressure_systolic && log.blood_pressure_diastolic 
          ? `${log.blood_pressure_systolic}/${log.blood_pressure_diastolic} mmHg`
          : 'Not logged';
      case 'heart_rate':
        return log.heart_rate ? `${log.heart_rate} bpm` : 'Not logged';
      case 'temperature':
        return log.temperature ? `${log.temperature}°C` : 'Not logged';
      case 'sleep':
        return log.sleep_hours ? `${log.sleep_hours} hours` : 'Not logged';
      case 'exercise':
        return log.exercise_minutes ? `${log.exercise_minutes} minutes` : 'Not logged';
      case 'water':
        return log.water_intake_ml ? `${log.water_intake_ml} ml` : 'Not logged';
      default:
        return 'Not logged';
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
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Health Log</h1>
                  <p className="text-sm text-gray-400">Track your daily health metrics</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-purple-600 to-red-600 px-6 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Entry</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 pb-24">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Entries This Month', value: healthLogs.length, icon: Calendar, color: 'purple' },
              { label: 'Avg Mood Score', value: '7.2/10', icon: Heart, color: 'red' },
              { label: 'Avg Sleep', value: '7.5h', icon: Moon, color: 'purple' },
              { label: 'Total Exercise', value: '450min', icon: Zap, color: 'red' },
            ].map((stat, index) => (
              <div key={index} className={`bg-gradient-to-br ${
                stat.color === 'purple' 
                  ? 'from-purple-600/20 to-purple-800/20 border-purple-600/30' 
                  : 'from-red-600/20 to-red-800/20 border-red-600/30'
              } border rounded-2xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-300">{stat.label}</h3>
                  <stat.icon className={`w-5 h-5 ${
                    stat.color === 'purple' ? 'text-purple-400' : 'text-red-400'
                  }`} />
                </div>
                <div className={`text-2xl font-bold ${
                  stat.color === 'purple' ? 'text-purple-400' : 'text-red-400'
                }`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Health Logs */}
          {healthLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No health logs yet</h3>
              <p className="text-gray-400 mb-6">Start tracking your daily health metrics</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-purple-600 to-red-600 px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
              >
                Add First Entry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {healthLogs.map((log) => (
                <div key={log.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold">
                        {new Date(log.log_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: 'weight', label: 'Weight' },
                      { key: 'blood_pressure', label: 'Blood Pressure' },
                      { key: 'heart_rate', label: 'Heart Rate' },
                      { key: 'temperature', label: 'Temperature' },
                      { key: 'sleep', label: 'Sleep' },
                      { key: 'exercise', label: 'Exercise' },
                      { key: 'water', label: 'Water Intake' },
                    ].map((metric) => {
                      const IconComponent = getMetricIcon(metric.key);
                      return (
                        <div key={metric.key} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                          <IconComponent className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">{metric.label}</p>
                            <p className="font-medium">{formatMetricValue(log, metric.key)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mood and Energy */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Mood Score</span>
                        <span className="font-medium">{log.mood_score || 'Not logged'}/10</span>
                      </div>
                      {log.mood_score && (
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-red-600 h-2 rounded-full"
                            style={{ width: `${(log.mood_score / 10) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Energy Level</span>
                        <span className="font-medium">{log.energy_level || 'Not logged'}/10</span>
                      </div>
                      {log.energy_level && (
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-red-600 to-purple-600 h-2 rounded-full"
                            style={{ width: `${(log.energy_level / 10) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {log.notes && (
                    <div className="mt-4 p-3 bg-white/5 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Notes</p>
                      <p className="text-gray-200">{log.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          
          <div className="relative w-full max-w-2xl bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">Add Health Log Entry</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="70.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, heart_rate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="72"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Systolic BP</label>
                  <input
                    type="number"
                    value={formData.blood_pressure_systolic}
                    onChange={(e) => setFormData(prev => ({ ...prev, blood_pressure_systolic: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Diastolic BP</label>
                  <input
                    type="number"
                    value={formData.blood_pressure_diastolic}
                    onChange={(e) => setFormData(prev => ({ ...prev, blood_pressure_diastolic: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="36.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sleep Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.sleep_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, sleep_hours: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Exercise (minutes)</label>
                  <input
                    type="number"
                    value={formData.exercise_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, exercise_minutes: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Water Intake (ml)</label>
                  <input
                    type="number"
                    value={formData.water_intake_ml}
                    onChange={(e) => setFormData(prev => ({ ...prev, water_intake_ml: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="2000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mood Score (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.mood_score}
                    onChange={(e) => setFormData(prev => ({ ...prev, mood_score: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>1</span>
                    <span className="font-medium text-white">{formData.mood_score}</span>
                    <span>10</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Energy Level (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.energy_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, energy_level: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>1</span>
                    <span className="font-medium text-white">{formData.energy_level}</span>
                    <span>10</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Any additional notes about your day..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CommandHub />
    </div>
  );
}