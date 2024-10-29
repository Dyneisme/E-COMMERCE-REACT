import React, { createContext, useEffect, useState } from 'react';



export const ShopContext = createContext(null);

const getDefaultCart = () =>{
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    fetch('https://e-commerce-react-xp0f.onrender.com/allproducts')
   .then((response) => response.json())
   .then((data) => {
     console.log('Fetched Products:', data); 
     setAll_Product(data);
   })
   .catch((error) => console.error('Error fetching products:', error));
  
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
          console.log('Fetched Cart:', data); // Log the cart items
          setCartItems(data);
        });
    }
  }, []);
  

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (localStorage.getItem('auth-token')) {
      fetch('https://e-commerce-react-xp0f.onrender.com/addtocart', { // Updated URL
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data));
    }
  };

const removeFromCart = (itemId) => {
   setCartItems((prev) => ({...prev,[itemId]: Math.max((prev[itemId] || 0) - 1, 0) // Ensures cart count doesn't go below 0
   }));
    if (localStorage.getItem('auth-token')) {
      fetch('https://e-commerce-react-xp0f.onrender.com/removefromcart', { // Updated URL
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId }),
      })
        .then((response) => response.json())
        .then((data) => console.log(data));
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = all_product.find((product) => product.id === Number(item));
        if (itemInfo) { // Ensure itemInfo is found
          totalAmount += itemInfo.new_price * cartItems[item];
        }
      }
    }

    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];
      }
    }
    return totalItem;
  };

  const contextValue = { getTotalCartItems, getTotalCartAmount, all_product, cartItems, addToCart, removeFromCart };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
