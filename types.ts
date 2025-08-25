
export enum ProductType {
  INVENTORY = 'INVENTORY', // For retail items with stock
  SERVICE = 'SERVICE',   // For restaurant/service items without stock
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  description: string;
  imageUrl: string;
  type: ProductType;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id:string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  tax: number;
  subtotal: number;
  date: string;
}

export interface AiService {
  generateProductImage: (productName: string) => Promise<string>;
  generateProductDescription: (productName: string) => Promise<string>;
  summarizeSales: (transactions: Transaction[], products: Product[]) => Promise<string>;
  isConfigured: () => boolean;
  getProviderName: () => string;
}
