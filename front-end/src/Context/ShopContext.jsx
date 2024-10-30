import React, { createContext, useEffect, useState } from 'react';

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState({}); // Use an empty object for flexibility

  // Fetch products and cart on initial load
  useEffect(() => {
    fetch('https://e-commerce-react-xp0f.onrender.com/allproducts')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched Products:', data);
        setAll_Product(data);
      });

    if (localStorage.getItem('auth-token')) {
      fetch('https://e-commerce-react-xp0f.onrender.com/getcart', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Fetched Cart:', data);
          setCartItems(data); // Assuming `data` has the correct structure for cartItems
        })
        .catch((error) => console.error('Error fetching cart:', error));
    }
  }, []);

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (localStorage.getItem('auth-token')) {
      try {
        await fetch('https://e-commerce-react-xp0f.onrender.com/addtocart', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'auth-token': `${localStorage.getItem('auth-token')}`,
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
    if (localStorage.getItem('auth-token')) {
      try {
        await fetch('https://e-commerce-react-xp0f.onrender.com/removefromcart', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'auth-token': `${localStorage.getItem('auth-token')}`,
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
      const itemCount = cartItems[itemId];
      if (itemCount > 0) {
        const itemInfo = all_product.find((product) => product.id === Number(itemId));
        return itemInfo ? totalAmount + itemInfo.new_price * itemCount : totalAmount;
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
