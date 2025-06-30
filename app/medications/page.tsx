'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import CommandHub from '@/components/CommandHub';
import { 
  Pill, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Bell,
  Edit,
  Trash2,
  Search
} from 'lucide-react';

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  is_active: boolean;
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: 'once_daily',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });
  const router = useRouter();

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, we'll create sample data since we don't have a medications table
      // In a real app, you'd query the medications table
      const sampleMedications = [
        {
          id: '1',
          medication_name: 'Vitamin D3',
          dosage: '1000 IU',
          frequency: 'once_daily',
          start_date: '2024-01-01',
          end_date: null,
          notes: 'Take with food',
          is_active: true
        },
        {
          id: '2',
          medication_name: 'Omega-3',
          dosage: '500mg',
          frequency: 'twice_daily',
          start_date: '2024-01-15',
          end_date: null,
          notes: 'Fish oil supplement',
          is_active: true
        },
        {
          id: '3',
          medication_name: 'Multivitamin',
          dosage: '1 tablet',
          frequency: 'once_daily',
          start_date: '2024-02-01',
          end_date: '2024-03-01',
          notes: 'Completed course',
          is_active: false
        }
      ];

      setMedications(sampleMedications);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, you'd insert into the medications table
      const newMedication = {
        id: Date.now().toString(),
        ...formData,
        is_active: true
      };

      setMedications(prev => [newMedication, ...prev]);
      setShowAddModal(false);
      setFormData({
        medication_name: '',
        dosage: '',
        frequency: 'once_daily',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const filteredMedications = medications.filter(med =>
    med.medication_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMedications = filteredMedications.filter(med => med.is_active);
  const inactiveMedications = filteredMedications.filter(med => !med.is_active);

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'once_daily': return 'Once daily';
      case 'twice_daily': return 'Twice daily';
      case 'three_times_daily': return 'Three times daily';
      case 'as_needed': return 'As needed';
      case 'weekly': return 'Weekly';
      default: return frequency;
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
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Medications</h1>
                  <p className="text-sm text-gray-400">Track your medications and supplements</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-purple-600 to-red-600 px-6 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Medication</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 pb-24">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Active Medications', value: activeMedications.length, icon: Pill, color: 'purple' },
              { label: 'Due Today', value: '3', icon: Clock, color: 'red' },
              { label: 'Reminders Set', value: '5', icon: Bell, color: 'purple' },
              { label: 'Adherence Rate', value: '94%', icon: CheckCircle, color: 'red' },
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

          {/* Search */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medications..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Active Medications */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Active Medications</h2>
            {activeMedications.length === 0 ? (
              <div className="text-center py-8 bg-white/5 rounded-2xl">
                <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No active medications</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeMedications.map((medication) => (
                  <div key={medication.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
                        <Pill className="w-6 h-6 text-white" />
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

                    <h3 className="text-lg font-semibold mb-2">{medication.medication_name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{medication.dosage}</p>
                    <p className="text-gray-400 text-sm mb-4">{getFrequencyLabel(medication.frequency)}</p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Since {new Date(medication.start_date).toLocaleDateString()}</span>
                      </div>
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">
                        Active
                      </span>
                    </div>

                    {medication.notes && (
                      <div className="mt-4 p-3 bg-white/5 rounded-xl">
                        <p className="text-sm text-gray-300">{medication.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inactive Medications */}
          {inactiveMedications.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Past Medications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveMedications.map((medication) => (
                  <div key={medication.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 opacity-75">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center">
                        <Pill className="w-6 h-6 text-white" />
                      </div>
                      <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs">
                        Completed
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{medication.medication_name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{medication.dosage}</p>
                    <p className="text-gray-400 text-sm mb-4">{getFrequencyLabel(medication.frequency)}</p>

                    <div className="text-sm text-gray-400">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(medication.start_date).toLocaleDateString()} - {medication.end_date ? new Date(medication.end_date).toLocaleDateString() : 'Ongoing'}</span>
                      </div>
                    </div>

                    {medication.notes && (
                      <div className="mt-4 p-3 bg-white/5 rounded-xl">
                        <p className="text-sm text-gray-300">{medication.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          
          <div className="relative w-full max-w-md bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6">Add New Medication</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Medication Name</label>
                <input
                  type="text"
                  value={formData.medication_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, medication_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="e.g., Vitamin D3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dosage</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="e.g., 1000 IU"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="once_daily">Once daily</option>
                  <option value="twice_daily">Twice daily</option>
                  <option value="three_times_daily">Three times daily</option>
                  <option value="as_needed">As needed</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="e.g., Take with food"
                />
              </div>

              <div className="flex space-x-3 pt-4">
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
                  Add Medication
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