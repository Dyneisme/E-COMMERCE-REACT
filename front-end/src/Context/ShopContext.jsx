// ShopContext.jsx

import React, { createContext, useState, useEffect } from 'react';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [allProduct, setAllProduct] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cartItems')) || {};
    setCartItems(savedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (productId) => {
    setCartItems((prevItems) => ({
      ...prevItems,
      [productId]: (prevItems[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const updatedItems = { ...prevItems };
      if (updatedItems[productId] > 1) {
        updatedItems[productId] -= 1;
      } else {
        delete updatedItems[productId];
      }
      return updatedItems;
    });
  };

  const getTotalCartAmount = () => {
    return Object.keys(cartItems).reduce((total, itemId) => {
      const item = allProduct.find((product) => product.id === parseInt(itemId));
      return total + (item ? item.new_price * cartItems[itemId] : 0);
    }, 0);
  };

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        allProduct,
        setAllProduct,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
