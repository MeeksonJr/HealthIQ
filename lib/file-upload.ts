import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
}

export class FileUploadService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'image/tiff'
  ];

  static async uploadScanFile(
    file: File,
    userId: string,
    scanType: 'medical' | 'food' | 'medication'
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${scanType}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('health-scans')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('health-scans')
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        path: fileName,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  static async uploadAvatar(file: File, userId: string): Promise<UploadResult> {
    try {
      this.validateFile(file, ['image/jpeg', 'image/png', 'image/webp']);

      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${userId}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        path: fileName,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  static async deleteFile(path: string, bucket: string = 'health-scans'): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error('Failed to delete file');
    }
  }

  private static validateFile(file: File, allowedTypes?: string[]): void {
    const types = allowedTypes || this.ALLOWED_TYPES;
    
    if (!types.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${this.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}