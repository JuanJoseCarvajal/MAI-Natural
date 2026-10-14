import type {Product} from './products';

export const anhydrousCollection = 'cosmetica-anhidra';
export const anhydrousShopUrl = `/products?collection=${anhydrousCollection}`;

export function isAnhydrousProduct(product: Product): boolean {
  const text = `${product.name} ${product.description}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return product.active !== false && (/\b(?:anhidr[a-z]*|solidos?)\b/.test(text) || product.id==='jabon-corporal-saponificado');
}
