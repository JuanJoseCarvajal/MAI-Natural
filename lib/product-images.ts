import path from 'node:path';
export const imageCategories = ['facial', 'capilar', 'corporal', 'kits'] as const;
export const maxImageBytes = 5 * 1024 * 1024;
export function imageDirectory() {
  return process.env.PRODUCT_IMAGES_DIR || path.join(process.cwd(), 'assets', 'product-images');
}
export function imageExtension(bytes: Uint8Array): string | null {
  const b = Buffer.from(bytes);
  if (b.length >= 24 && b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png';
  if (b.length >= 4 && b[0] === 255 && b[1] === 216 && b[2] === 255) return 'jpg';
  if (b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}
