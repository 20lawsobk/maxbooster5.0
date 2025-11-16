# Replit App Storage Setup

## Overview

Max Booster Platform is now integrated with **Replit App Storage** for production-ready cloud file storage. This provides persistent, scalable storage for:

- Audio files (beats, samples, stems)
- Cover art and images
- User uploads
- Export files

## Configuration

### Automatic Detection (Recommended)

The platform automatically detects and uses Replit App Storage when the `REPLIT_BUCKET_ID` secret is available. No manual configuration needed!

### Manual Configuration

If you want to explicitly set the storage provider, add this secret:

```
STORAGE_PROVIDER=replit
```

### Storage Providers

The platform supports three storage providers:

1. **`local`** - Local filesystem (development only)
2. **`s3`** - AWS S3 or S3-compatible storage
3. **`replit`** - Replit App Storage (recommended for Replit deployments)

## Replit Bucket ID

Your Replit App Storage bucket ID is already configured:

```
REPLIT_BUCKET_ID=replit-objstore-0194b979-7a8f-4a3b-ba0c-d5d3e460acbc
```

This is automatically set when you create a Replit App Storage bucket.

## Features

### Upload Files

```typescript
import { storageService } from './services/storageService';

// Upload a file
const key = await storageService.uploadFile(
  buffer,       // File buffer
  'audio',      // Category (audio, images, exports, etc.)
  'song.mp3',   // Filename
  'audio/mpeg'  // MIME type
);

// Result: 'audio/uuid-here/song.mp3'
```

### Download Files

```typescript
// Download file as buffer
const buffer = await storageService.downloadFile(key);

// Get public URL
const url = await storageService.getDownloadUrl(key);
// Result: 'https://storage.replit.com/bucket-id/audio/uuid/song.mp3'
```

### Delete Files

```typescript
// Delete immediately
await storageService.deleteFile(key);

// Delete with TTL (for temp files)
await storageService.deleteWithTTL(key, 3600000); // 1 hour
```

### Check File Existence

```typescript
const exists = await storageService.fileExists(key);
```

## File Categories

The platform organizes files into categories:

- `audio` - Music files, beats, samples
- `images` - Cover art, profile pictures
- `exports` - Exported projects, stems
- `temp` - Temporary files (auto-deleted)
- `uploads` - General user uploads

## Benefits of Replit App Storage

✅ **Native Integration** - Built into Replit, no external accounts needed
✅ **Automatic Authentication** - Uses Replit's built-in auth
✅ **Scalable** - Powered by Google Cloud Storage
✅ **Persistent** - Survives deployments and restarts
✅ **Secure** - Isolated per-deployment
✅ **Cost-Effective** - Included in Replit plans

## Migration from Local Storage

To migrate existing files from local storage to Replit:

1. Existing local files in `./uploads` remain accessible
2. New uploads automatically go to Replit App Storage
3. Gradually migrate old files as needed:

```typescript
// Example migration script
const fs = require('fs');
const { storageService } = require('./services/storageService');

async function migrateFile(localPath: string, category: string, filename: string) {
  const buffer = await fs.promises.readFile(localPath);
  const mimeType = 'audio/mpeg'; // Detect based on file
  
  const key = await storageService.uploadFile(buffer, category, filename, mimeType);
  console.log(`Migrated: ${localPath} -> ${key}`);
}
```

## Monitoring

Check storage usage via Replit's dashboard:

1. Go to your Repl
2. Click "Tools"
3. Select "Object Storage"
4. View usage, files, and manage storage

## Troubleshooting

### Storage Provider Not Detected

If the system uses 'local' instead of 'replit':

1. Verify `REPLIT_BUCKET_ID` secret exists
2. Check startup logs for "📦 Using Replit App Storage provider"
3. Restart the deployment

### Upload Failures

If uploads fail:

1. Check bucket ID is correct
2. Verify Replit storage is enabled for your plan
3. Check file size limits (default 100MB)
4. Review server logs for detailed error messages

### File Not Found

If downloads fail:

1. Verify the file key is correct
2. Check the file exists: `await storageService.fileExists(key)`
3. Ensure you're using the correct storage provider

## Production Deployment

When deploying to production on Replit Reserved VM:

1. ✅ `REPLIT_BUCKET_ID` is automatically available
2. ✅ Storage provider auto-detects and uses Replit
3. ✅ No additional configuration needed
4. ✅ Files persist across deployments

## API Implementation

The storage abstraction layer (`storageService.ts`) provides a consistent API across all providers:

```typescript
export interface StorageProvider {
  uploadFile(file: Buffer, key: string, contentType?: string): Promise<string>;
  downloadFile(key: string): Promise<Buffer>;
  deleteFile(key: string): Promise<void>;
  getUploadUrl(key: string, contentType: string, expiresIn?: number): Promise<string | null>;
  getDownloadUrl(key: string, expiresIn?: number): Promise<string>;
  fileExists(key: string): Promise<boolean>;
}
```

This means switching providers requires **zero code changes** - just change the environment variable!

## Next Steps

1. ✅ Replit App Storage integrated and ready
2. ✅ Auto-detection enabled
3. Test file uploads through the application
4. Monitor storage usage in Replit dashboard
5. Consider implementing file cleanup for old temp files

## Support

For issues with Replit App Storage:

- **Replit Docs**: https://docs.replit.com/hosting/deployments/object-storage
- **Platform Logs**: Check server startup logs
- **Storage Dashboard**: Replit Tools > Object Storage
