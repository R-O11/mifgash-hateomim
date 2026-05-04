import React, { createContext, useState, useContext, useMemo } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product, selectedOptions, quantity, internalNotes) => {
    // Generate a unique signature for this configuration
    const optionIds = selectedOptions.map(o => o.itemId).sort().join(',');
    const cartItemId = `${product.id}-${optionIds}-${internalNotes || ''}`;

    setCartItems(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Calculate configuration unit price
      let unitPrice = Number(product.base_price);
      selectedOptions.forEach(opt => {
        unitPrice += Number(opt.price_change || 0);
      });

      return [...prev, {
        cartItemId,
        product,
        selectedOptions,
        quantity,
        unitPrice,
        notes: internalNotes || ''
      }];
    });
    
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  const toggleCart = () => setIsCartOpen(prev => !prev);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCart,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
