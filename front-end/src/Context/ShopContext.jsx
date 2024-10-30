import React, { createContext, useState, useEffect } from 'react';

// Create Context for Shop
export const ShopContext = createContext();

// Mock default cart function
const getDefaultCart = () => {
  // Returns an empty cart with 0 quantity for each product (adjust as needed)
  return {};
};

export const ShopProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [allProduct, setAllProduct] = useState([]);
  
  // Function to fetch the total cart amount
  const getTotalCartAmount = () => {
    return allProduct.reduce((acc, product) => {
      const quantity = cartItems[product.id] || 0;
      return acc + product.new_price * quantity;
    }, 0);
  };

  // Fetch products and cart items after component mounts
  useEffect(() => {
    // Fetch all products
    fetch('https://e-commerce-react-xp0f.onrender.com/all-products')
      .then((response) => response.json())
      .then((data) => setAllProduct(data))
      .catch((error) => console.error('Error fetching products:', error));
    
    // Fetch user cart items
    const fetchCartData = () => {
      fetch('https://e-commerce-react-xp0f.onrender.com/getcart', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`, // Corrected format
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched Cart:', data);
        setCartItems(data); // Assumes 'data' is a cart object in the form of { productId: quantity }
      })
      .catch((error) => console.error('Failed to fetch cart data:', error));
    };

    // Fetch cart data on mount if token exists
    if (localStorage.getItem('auth-token')) {
      fetchCartData();
    }
  }, []);

  // Function to remove item from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const updatedCart = { ...prevItems };
      delete updatedCart[productId];
      return updatedCart;
    });
    // Consider adding a fetch call to sync this with the backend
  };

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        allProduct,
        getTotalCartAmount,
        removeFromCart,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
