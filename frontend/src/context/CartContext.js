import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; 

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth(); 
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const getCartKey = useCallback(() => {
    return user ? `cart_${user._id}` : null; 
  }, [user]);

  useEffect(() => {
    const cartKey = getCartKey();
    if (cartKey) {
      try {
        const localData = localStorage.getItem(cartKey);
        const parsedData = localData ? JSON.parse(localData) : [];
        setCartItems(parsedData);
        setSelectedItems(new Set(parsedData.map(item => item._id)));
      } catch (error) {
        console.error("Could not parse cart from localStorage", error);
        setCartItems([]);
        setSelectedItems(new Set());
      }
    } else {
      setCartItems([]);
      setSelectedItems(new Set());
    }
  }, [user, getCartKey]); 

  useEffect(() => {
    const cartKey = getCartKey();
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
      setSelectedItems(prev => {
         const currentItemIds = new Set(cartItems.map(item => item._id));
         const newSelected = new Set(prev);
         prev.forEach(id => {
             if (!currentItemIds.has(id)) newSelected.delete(id);
         });
         return newSelected;
      });
    }
  }, [cartItems, user, getCartKey]);


  const addToCart = (productToAdd) => {
    if (!user) {
      console.warn("Attempted to add to cart while not logged in.");
      return; 
    }
    setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item._id === productToAdd._id);
        if (existingItem) {
          const newQuantity = Math.min(productToAdd.stock, existingItem.quantity + (productToAdd.quantity || 1));
          return prevItems.map(item =>
            item._id === productToAdd._id ? { ...item, quantity: newQuantity } : item
          );
        }
        const initialQuantity = Math.min(productToAdd.stock, productToAdd.quantity || 1);
        return [...prevItems, { ...productToAdd, quantity: initialQuantity }];
    });
  };

  const removeFromCart = (productId) => {
    if (!user) return;
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (!user) return;
    const item = cartItems.find(item => item._id === productId);
    if (!item) return;

    const clampedQuantity = Math.max(0, Math.min(item.stock, newQuantity));

    if (clampedQuantity === 0) {
      if (window.confirm(`Bạn có chắc muốn xóa ${item.name} khỏi giỏ hàng?`)) {
        removeFromCart(productId);
      }
    } else {
      setCartItems(prevItems =>
        prevItems.map(cartItem =>
          cartItem._id === productId ? { ...cartItem, quantity: clampedQuantity } : cartItem
        )
      );
    }
  };

  const toggleItemSelected = (productId) => {
    if (!user) return;
    setSelectedItems(prevSelected => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(productId)) newSelected.delete(productId);
        else newSelected.add(productId);
        return newSelected;
    });
  };

  const toggleSelectAll = () => {
      if (!user) return;
      if (selectedItems.size === cartItems.length) {
          setSelectedItems(new Set()); 
      } else {
          setSelectedItems(new Set(cartItems.map(item => item._id))); 
      }
  };

  const clearCartState = () => { 
      setCartItems([]);
      setSelectedItems(new Set());
  };


  const value = {
    cartItems: user ? cartItems : [],
    selectedItems: user ? selectedItems : new Set(),
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleItemSelected,
    toggleSelectAll, 
    clearCartState,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};