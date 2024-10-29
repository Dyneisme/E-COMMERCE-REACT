import React, { createContext, useEffect, useState } from 'react';

export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index <= 300; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [error, setError] = useState(null);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/allproducts`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();
        setAll_Product(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Unable to load products. Please try again later.');
      }
    };

    const fetchCart = async () => {
      if (localStorage.getItem('auth-token')) {
        try {
          const response = await fetch(`${apiBaseUrl}/getcart`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'auth-token': localStorage.getItem('auth-token'),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch cart: ${response.statusText}`);
          }

          const data = await response.json();
          setCartItems(data);
        } catch (error) {
          console.error('Error fetching cart:', error);
          setError('Unable to load cart items. Please try again later.');
        }
      }
    };

    fetchProducts();
    fetchCart();
  }, [apiBaseUrl]);

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (localStorage.getItem('auth-token')) {
      try {
        await fetch(`${apiBaseUrl}/addtocart`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'auth-token': localStorage.getItem('auth-token'),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId }),
        });
      } catch (error) {
        console.error('Error adding to cart:', error);
        setError('Failed to add item to cart. Please try again.');
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
    if (localStorage.getItem('auth-token')) {
      try {
        await fetch(`${apiBaseUrl}/removefromcart`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'auth-token': localStorage.getItem('auth-token'),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId }),
        });
      } catch (error) {
        console.error('Error removing from cart:', error);
        setError('Failed to remove item from cart. Please try again.');
      }
    }
  };

  const getTotalCartAmount = () => {
    return Object.keys(cartItems).reduce((totalAmount, itemId) => {
      if (cartItems[itemId] > 0) {
        const itemInfo = all_product.find((product) => product.id === Number(itemId));
        return itemInfo ? totalAmount + itemInfo.new_price * cartItems[itemId] : totalAmount;
      }
      return totalAmount;
    }, 0);
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((total, count) => total + count, 0);
  };

  const contextValue = {
    getTotalCartItems,
    getTotalCartAmount,
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    error, // Add error state to the context
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {error && <p className="error-message">{error}</p>}
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
