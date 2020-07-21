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
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const listProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products1',
      );

      if (listProducts) {
        setProducts(JSON.parse(listProducts));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function updateStoredProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products1',
        JSON.stringify(products),
      );
    }

    updateStoredProducts();
  }, [products]);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(item => item.id === id);

      products[productIndex].quantity += 1;

      setProducts([...products]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(item => item.id === id);

      if (products[productIndex].quantity > 1) {
        products[productIndex].quantity -= 1;

        setProducts([...products]);
      } else {
        const cartProducts = products.filter(item => item.id !== id);
        setProducts([...cartProducts]);
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async ({ id, title, image_url, price }: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      const productIndex = products.findIndex(item => item.id === id);

      if (productIndex > -1) {
        increment(id);
      } else {
        const newCart = [
          ...products,
          { id, title, image_url, price, quantity: 1 },
        ];

        setProducts([...newCart]);
      }
    },
    [products, increment],
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
