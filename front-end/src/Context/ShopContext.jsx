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

  useEffect(() => {
    // Fetch all products from API
    fetch('https://e-commerce-react-xp0f.onrender.com/allproducts')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched Products:', data); // Log the products
        setAll_Product(data);
      })
      .catch((error) => console.error('Error fetching products:', error));

    // If the user is authenticated, fetch cart items
    const authToken = localStorage.getItem('auth-token');
    if (authToken) {
      fetch('https://e-commerce-react-xp0f.onrender.com/getcart', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Fetched Cart:', data); // Log the cart items
          setCartItems(data);
        })
        .catch((error) => console.error('Error fetching cart:', error));
    }
  }, []);

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    const authToken = localStorage.getItem('auth-token');
    if (authToken) {
      try {
        await fetch('https://e-commerce-react-xp0f.onrender.com/addtocart', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'auth-token': authToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId }),
        });
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
    const authToken = localStorage.getItem('auth-token');
    if (authToken) {
      try {
        await fetch('https://e-commerce-react-xp0f.onrender.com/removefromcart', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'auth-token': authToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId }),
        });
      } catch (error) {
        console.error('Error removing from cart:', error);
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
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
