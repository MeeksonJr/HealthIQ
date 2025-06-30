'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import CommandHub from '@/components/CommandHub';
import { 
  Camera, 
  Upload, 
  FileText, 
  Pill, 
  Heart, 
  Plus,
  Eye,
  Download,
  Trash2,
  Filter,
  Search
} from 'lucide-react';

interface Scan {
  id: string;
  title: string;
  scan_type: string;
  file_url: string;
  created_at: string;
  is_processed: boolean;
  processing_status: string;
}

export default function ScansPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'medical' | 'food' | 'medication'>('medical');
  const router = useRouter();

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load all scan types
      const [medicalScans, foodScans, medicationScans] = await Promise.all([
        supabase.from('medical_scans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('food_scans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('medication_scans').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      const allScans = [
        ...(medicalScans.data?.map(scan => ({ ...scan, scan_type: 'medical' })) || []),
        ...(foodScans.data?.map(scan => ({ ...scan, scan_type: 'food', file_url: scan.image_url })) || []),
        ...(medicationScans.data?.map(scan => ({ ...scan, scan_type: 'medication', file_url: scan.image_url })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setScans(allScans);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredScans = scans.filter(scan => {
    const matchesFilter = filter === 'all' || scan.scan_type === filter;
    const matchesSearch = scan.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getScanIcon = (type: string) => {
    switch (type) {
      case 'medical': return FileText;
      case 'food': return Heart;
      case 'medication': return Pill;
      default: return Camera;
    }
  };

  const getScanColor = (type: string) => {
    switch (type) {
      case 'medical': return 'purple';
      case 'food': return 'red';
      case 'medication': return 'purple';
      default: return 'gray';
    }
  };

  const handleUpload = async (file: File) => {
    // This would integrate with your file upload service
    console.log('Uploading file:', file);
    setShowUploadModal(false);
    // Reload scans after upload
    loadScans();
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
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Scans & Analysis</h1>
                  <p className="text-sm text-gray-400">Manage your medical, food, and medication scans</p>
                </div>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-purple-600 to-red-600 px-6 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Scan</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 pb-24">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex space-x-2">
              {['all', 'medical', 'food', 'medication'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === filterType
                      ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search scans..."
                className="w-full pl-12 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Scans Grid */}
          {filteredScans.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No scans found</h3>
              <p className="text-gray-400 mb-6">Start by uploading your first scan</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-purple-600 to-red-600 px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
              >
                Upload Scan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScans.map((scan) => {
                const IconComponent = getScanIcon(scan.scan_type);
                const color = getScanColor(scan.scan_type);
                
                return (
                  <div
                    key={scan.id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${
                        color === 'purple' 
                          ? 'from-purple-600 to-purple-800' 
                          : 'from-red-600 to-red-800'
                      } rounded-xl flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{scan.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 capitalize">{scan.scan_type} Scan</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        scan.is_processed 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {scan.is_processed ? 'Processed' : 'Processing'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
          
          <div className="relative w-full max-w-md bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6">Upload New Scan</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scan Type</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="medical">Medical Scan</option>
                  <option value="food">Food Scan</option>
                  <option value="medication">Medication Scan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload File</label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-600/50 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Drag and drop your file here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-all">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <CommandHub />
    </div>
  );
}