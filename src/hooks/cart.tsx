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

  async function updateStoredProducts(items: Product[]): Promise<void> {
    console.log('call async storage');
    await AsyncStorage.setItem(
      '@GoMarketplace:products1',
      JSON.stringify(items),
    );
  }

  // const increment = useCallback(
  //   async id => {
  //     // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
  //     const productIndex = products.findIndex(item => item.id === id);

  //     products[productIndex].quantity += 1;

  //     setProducts([...products]);

  //     // await updateStoredProducts([...products]);
  //     await AsyncStorage.setItem(
  //       '@GoMarketplace:products1',
  //       JSON.stringify([...products]),
  //     );
  //   },
  //   [products],
  // );

  // const decrement = useCallback(
  //   async id => {
  //     // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
  //     const productIndex = products.findIndex(item => item.id === id);

  //     if (products[productIndex].quantity > 1) {
  //       products[productIndex].quantity -= 1;

  //       setProducts([...products]);

  //       await AsyncStorage.setItem(
  //         '@GoMarketplace:products1',
  //         JSON.stringify(products),
  //       );
  //       // await updateStoredProducts(products);
  //     } else {
  //       const cartProducts = products.filter(item => item.id !== id);
  //       setProducts([...cartProducts]);

  //       await AsyncStorage.setItem(
  //         '@GoMarketplace:products1',
  //         JSON.stringify([...cartProducts]),
  //       );
  //       // await updateStoredProducts(cartProducts);
  //     }
  //   },
  //   [products],
  // );

  // const addToCart = useCallback(
  //   async ({ id, title, image_url, price }: Product) => {
  //     // TODO ADD A NEW ITEM TO THE CART
  //     const productIndex = products.findIndex(item => item.id === id);

  //     if (productIndex > -1) {
  //       await increment(id);
  //     } else {
  //       const newCart = [
  //         ...products,
  //         { id, title, image_url, price, quantity: 1 },
  //       ];

  //       setProducts([...newCart]);

  //       // await updateStoredProducts(newCart);
  //       await AsyncStorage.setItem(
  //         '@GoMarketplace:products1',
  //         JSON.stringify(newCart),
  //       );
  //     }
  //   },
  //   [products, increment],
  // );

  const increment = useCallback(
    async id => {
      const requestProduct = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      setProducts(requestProduct);
      await AsyncStorage.setItem(
        '@GoMarketplace:product',
        JSON.stringify(requestProduct),
      );
      return requestProduct;
    },

    [products],
  );

  const decrement = useCallback(
    async id => {
      const filterProduct = products.filter(product => product.id !== id);
      const productExists = products.find(product => product.id === id);

      if (filterProduct && productExists && productExists.quantity > 1) {
        const requestProduct = products.map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity - 1 }
            : product,
        );
        setProducts(requestProduct);
        await AsyncStorage.setItem(
          '@GoMarketplace:product',
          JSON.stringify(requestProduct),
        );
      } else {
        await AsyncStorage.setItem(
          '@GoMarketplace:product',
          JSON.stringify([...filterProduct]),
        );
        setProducts([...filterProduct]);
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      const productExists = products.find(p => p.id === product.id);

      if (productExists) {
        increment(product.id);
        return;
      }

      const newProduct = { ...product, quantity: 1 };

      setProducts(oldState => [...oldState, newProduct]);

      await AsyncStorage.setItem(
        '@GoMarketplace:product',
        JSON.stringify([...products, newProduct]),
      );
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
