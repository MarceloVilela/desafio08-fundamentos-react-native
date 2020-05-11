import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStoraged = await AsyncStorage.getItem('products');

      if (productsStoraged) {
        setProducts(JSON.parse(productsStoraged));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const exists = products.some(item => item.id === product.id);

      if (!exists) {
        const productsToSet = [...products, { ...product, quantity: 1 }];
        setProducts(productsToSet);
        await AsyncStorage.setItem('products', JSON.stringify(productsToSet));
      } else {
        const productsIncrecremented = products.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );

        setProducts(productsIncrecremented);
        await AsyncStorage.setItem(
          'products',
          JSON.stringify(productsIncrecremented),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsIncrecremented = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );

      setProducts(productsIncrecremented);
      await AsyncStorage.setItem(
        'products',
        JSON.stringify(productsIncrecremented),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsDecremented = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
      );

      const productsRemaining = productsDecremented.filter(
        item => item.quantity > 0,
      );

      setProducts(productsRemaining);
      await AsyncStorage.setItem('products', JSON.stringify(productsRemaining));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
