'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUploadService } from '@/lib/file-upload';
import { AIAnalysisService } from '@/lib/ai-services';
import { supabase } from '@/lib/supabase';
import { NotificationService } from '@/lib/notifications';
import { 
  Upload, 
  Camera, 
  FileText, 
  Pill, 
  Heart, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader
} from 'lucide-react';

interface ScanUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  defaultType?: 'medical' | 'food' | 'medication';
}

export default function ScanUpload({ isOpen, onClose, onUploadComplete, defaultType = 'medical' }: ScanUploadProps) {
  const [scanType, setScanType] = useState<'medical' | 'food' | 'medication'>(defaultType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setError('');
      // Auto-generate title if not provided
      if (!title) {
        setTitle(`${scanType.charAt(0).toUpperCase() + scanType.slice(1)} scan - ${new Date().toLocaleDateString()}`);
      }
    }
  }, [scanType, title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleUpload = async () => {
    if (!uploadedFile || !title) {
      setError('Please provide a file and title');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload file
      const uploadResult = await FileUploadService.uploadScanFile(uploadedFile, user.id, scanType);

      // Save scan record to database
      let scanRecord;
      switch (scanType) {
        case 'medical':
          const { data: medicalScan, error: medicalError } = await supabase
            .from('medical_scans')
            .insert({
              user_id: user.id,
              scan_type: 'other',
              title,
              description,
              file_url: uploadResult.url,
              file_size: uploadResult.size,
              file_type: uploadResult.type,
              is_processed: false,
              processing_status: 'pending'
            })
            .select()
            .single();

          if (medicalError) throw medicalError;
          scanRecord = medicalScan;
          break;

        case 'food':
          const { data: foodScan, error: foodError } = await supabase
            .from('food_scans')
            .insert({
              user_id: user.id,
              title,
              image_url: uploadResult.url,
              is_verified: false
            })
            .select()
            .single();

          if (foodError) throw foodError;
          scanRecord = foodScan;
          break;

        case 'medication':
          const { data: medicationScan, error: medicationError } = await supabase
            .from('medication_scans')
            .insert({
              user_id: user.id,
              image_url: uploadResult.url,
              is_verified: false
            })
            .select()
            .single();

          if (medicationError) throw medicationError;
          scanRecord = medicationScan;
          break;
      }

      setUploading(false);
      setAnalyzing(true);

      // Start AI analysis
      let analysisResult;
      switch (scanType) {
        case 'medical':
          analysisResult = await AIAnalysisService.analyzeMedicalScan(uploadResult.url, 'other');
          break;
        case 'food':
          analysisResult = await AIAnalysisService.analyzeFoodScan(uploadResult.url);
          break;
        case 'medication':
          analysisResult = await AIAnalysisService.analyzeMedicationScan(uploadResult.url);
          break;
      }

      // Save analysis results
      await supabase
        .from('scan_results')
        .insert({
          scan_id: scanRecord.id,
          scan_type: scanType,
          ai_model_used: 'groq-llama3',
          analysis_data: analysisResult,
          confidence_score: analysisResult.confidence,
          status: 'completed'
        });

      // Update scan status
      const updateTable = scanType === 'medical' ? 'medical_scans' : 
                         scanType === 'food' ? 'food_scans' : 'medication_scans';
      
      await supabase
        .from(updateTable)
        .update({ 
          is_processed: true, 
          processing_status: 'completed',
          ...(scanType === 'food' && { 
            identified_foods: analysisResult.findings,
            confidence_score: analysisResult.confidence 
          }),
          ...(scanType === 'medication' && { 
            identified_medication: analysisResult.findings,
            confidence_score: analysisResult.confidence 
          })
        })
        .eq('id', scanRecord.id);

      // Create notification
      await NotificationService.createScanAnalysisComplete(user.id, scanType, title);

      // Generate health insight if needed
      if (analysisResult.severity === 'high' || analysisResult.severity === 'critical') {
        await NotificationService.createHealthInsightNotification(
          user.id,
          `${scanType} scan analysis requires attention`,
          analysisResult.severity
        );
      }

      setAnalyzing(false);
      onUploadComplete();
      handleClose();

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleClose = () => {
    setUploadedFile(null);
    setTitle('');
    setDescription('');
    setError('');
    setUploading(false);
    setAnalyzing(false);
    onClose();
  };

  const getScanIcon = (type: string) => {
    switch (type) {
      case 'medical': return FileText;
      case 'food': return Heart;
      case 'medication': return Pill;
      default: return Camera;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-2xl bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Upload New Scan</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-600/20 border border-red-600/30 rounded-xl p-3 text-red-400 text-sm mb-6 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Scan Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Scan Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'medical', label: 'Medical', icon: FileText, color: 'purple' },
                { type: 'food', label: 'Food', icon: Heart, color: 'red' },
                { type: 'medication', label: 'Medication', icon: Pill, color: 'blue' }
              ].map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => setScanType(option.type as any)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      scanType === option.type
                        ? `border-${option.color}-600 bg-${option.color}-600/20`
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <IconComponent className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Upload File</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-purple-600 bg-purple-600/10'
                  : uploadedFile
                  ? 'border-green-600 bg-green-600/10'
                  : 'border-white/20 hover:border-purple-600/50'
              }`}
            >
              <input {...getInputProps()} />
              
              {uploadedFile ? (
                <div className="space-y-2">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
                  <p className="text-green-400 font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-400">
                    {FileUploadService.formatFileSize(uploadedFile.size)}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-400">
                    {isDragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                  </p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                  <p className="text-xs text-gray-500">
                    Supports: JPEG, PNG, WebP, PDF (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter scan title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Upload Button */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleClose}
              disabled={uploading || analyzing}
              className="flex-1 px-4 py-3 border border-white/20 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadedFile || !title || uploading || analyzing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 px-4 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : analyzing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}