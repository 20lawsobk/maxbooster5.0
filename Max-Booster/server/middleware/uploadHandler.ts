import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { storageService } from '../services/storageService.js';

// Configure multer to use memory storage
// Files will be stored via storageService after parsing
const storage = multer.memoryStorage();

// File filter for audio files with strict MIME and extension validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'audio/mpeg',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/flac',
    'audio/x-flac',
    'audio/ogg',
    'audio/aac',
    'audio/webm',
    'audio/mp4',
    'audio/x-m4a'
  ];
  
  const allowedExts = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.webm', '.mp4', '.m4a'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedExts.join(', ')}`));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10, // Maximum 10 files per request
  },
});

// Error handler middleware for multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json({ 
          message: 'File too large. Maximum size is 100MB.',
          code: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(413).json({ 
          message: 'Too many files. Maximum is 10 files per request.',
          code: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          message: 'Unexpected field name for file upload.',
          code: 'UNEXPECTED_FIELD'
        });
      default:
        return res.status(400).json({ 
          message: error.message,
          code: 'UPLOAD_ERROR'
        });
    }
  } else if (error) {
    return res.status(400).json({ 
      message: error.message || 'Upload failed',
      code: 'UPLOAD_ERROR'
    });
  }
  next();
};

/**
 * Store an uploaded file using storageService
 * Call this after multer has parsed the file
 */
export async function storeUploadedFile(
  file: Express.Multer.File,
  userId: string,
  category: string = 'uploads'
): Promise<{ key: string; url: string }> {
  try {
    if (!file.buffer) {
      throw new Error('File buffer is missing');
    }

    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${timestamp}_${sanitizedName}${ext}`;

    const key = await storageService.uploadFile(
      file.buffer,
      `${category}/${userId}`,
      filename,
      file.mimetype
    );

    const url = await storageService.getDownloadUrl(key);

    return { key, url };
  } catch (error) {
    console.error('Error storing uploaded file:', error);
    throw new Error('Failed to store uploaded file');
  }
}

/**
 * Generate a presigned upload URL for direct client uploads (S3 only)
 * For local storage, this returns null and clients should use the standard upload endpoint
 */
export async function generateUploadUrl(
  userId: string,
  filename: string,
  contentType: string,
  category: string = 'uploads'
): Promise<{ uploadUrl: string | null; key: string }> {
  try {
    const timestamp = Date.now();
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const sanitizedFilename = `${timestamp}_${sanitizedName}${ext}`;

    const { url, key } = await storageService.getUploadUrl(
      `${category}/${userId}`,
      sanitizedFilename,
      contentType,
      3600 // 1 hour expiration
    );

    return { uploadUrl: url, key };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}