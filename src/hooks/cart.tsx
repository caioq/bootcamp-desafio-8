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

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productIndex = products.findIndex(item => item.id === product.id);

      products[productIndex].quantity += 1;

      setProducts(products);
      await AsyncStorage.setItem(
        '@GoMarketPlace:products1',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(item => item.id === id);

      products[productIndex].quantity += 1;

      setProducts(products);

      await AsyncStorage.setItem(
        '@GoMarketPlace:products1',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(item => item.id === id);

      if (products[productIndex].quantity > 1) {
        products[productIndex].quantity -= 1;

        setProducts(products);

        await AsyncStorage.setItem(
          '@GoMarketPlace:products1',
          JSON.stringify(products),
        );
      } else {
        // const cartProducts = products.filter(item => item.id !== id);
        // setProducts(cartProducts);
        // await AsyncStorage.setItem(
        //   '@GoMarketPlace:products1',
        //   JSON.stringify(cartProducts),
        // );
      }
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
