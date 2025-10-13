import { TFunction } from 'i18next';

export function getCategoryLabel(category: string, t: TFunction): string {
  const categoryMap: Record<string, string> = {
    'Electronics': t('product.categories.electronics'),
    'Clothing': t('product.categories.clothing'),
    'Food & Beverage': t('product.categories.food'),
    'Furniture': t('product.categories.furniture'),
    'Toys': t('product.categories.toys'),
    'Books': t('product.categories.books'),
    'Sports': t('product.categories.sports'),
    'Other': t('product.categories.other'),
  };
  
  return categoryMap[category] || category;
}
