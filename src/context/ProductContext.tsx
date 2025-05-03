
'use client';

import type * as React from 'react';
import { createContext, useState, useContext, useCallback } from 'react';
import type { ProductSubmission } from '@/libs/types';

interface ProductContextType {
  products: ProductSubmission[];
  addProduct: (product: ProductSubmission) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ProductSubmission[]>([]);

  const addProduct = useCallback((product: ProductSubmission) => {
    setProducts((prevProducts) => [...prevProducts, product]);
  }, []);

  return (
    <ProductContext.Provider value={{ products, addProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
