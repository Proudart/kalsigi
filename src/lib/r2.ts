import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

// Generate file paths
export function generateR2Paths(type: 'series' | 'chapter', groupSlug: string, seriesUrl: string, chapterNumber?: string) {
  if (type === 'series') {
    return {
      pending: `komic/pending/series/${groupSlug}-${seriesUrl}.webp`,
      final: `komic/${groupSlug}/${seriesUrl}/${seriesUrl}.webp`
    };
  } else {
    return {
      pending: `komic/pending/chapters/${groupSlug}-${seriesUrl}-${chapterNumber}`,
      final: `komic/${groupSlug}/${seriesUrl}/chapter-${chapterNumber}`
    };
  }
}

// Convert and optimize images
export async function convertToWebP(buffer: Buffer, type: 'cover' | 'page' | 'extra'): Promise<Buffer> {
  const sharpInstance = sharp(buffer);
  
  switch (type) {
    case 'cover':
      return await sharpInstance
        .resize(400, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
    case 'page':
      return await sharpInstance
        .webp({ quality: 85, effort: 4 })
        .toBuffer();
    case 'extra':
      return await sharpInstance
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
    default:
      return await sharpInstance.webp({ quality: 80 }).toBuffer();
  }
}

// Upload to R2
export async function uploadToR2(key: string, buffer: Buffer): Promise<string> {
  await r2Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000',
  }));
  
  return `${PUBLIC_URL}/${key}`;
}

// Move files from pending to final
export async function moveFileInR2(fromKey: string, toKey: string): Promise<void> {
  await r2Client.send(new CopyObjectCommand({
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}/${fromKey}`,
    Key: toKey,
  }));
  
  await r2Client.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fromKey,
  }));
}

// Delete files
export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  }));
}