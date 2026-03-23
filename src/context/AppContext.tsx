"use client";

import React, { createContext, useContext, useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  rating: number;
  discount?: number;
  description?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  fullAddress: string;
}

type OrderType = 'delivery' | 'pickup' | 'dine-in';
type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Out for Delivery' | 'Delivered';

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  type: OrderType;
  status: OrderStatus;
  address?: Address;
  date: string;
}

interface AppContextType {
  cart: CartItem[];
  favorites: string[];
  addresses: Address[];
  selectedAddress: Address | null;
  orderType: OrderType;
  orders: Order[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  toggleFavorite: (productId: string) => void;
  setOrderType: (type: OrderType) => void;
  addAddress: (address: Address) => void;
  setSelectedAddress: (address: Address) => void;
  placeOrder: () => string;
  totalAmount: number;
  deliveryCharge: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddressState] = useState<Address | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const addAddress = (address: Address) => {
    setAddresses(prev => [...prev, address]);
    if (!selectedAddress) setSelectedAddressState(address);
  };

  const setSelectedAddress = (address: Address) => {
    setSelectedAddressState(address);
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = (orderType === 'delivery' && totalAmount < 150 && totalAmount > 0) ? 30 : 0;

  const placeOrder = () => {
    const newOrder: Order = {
      id: `KFF-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [...cart],
      total: totalAmount + deliveryCharge,
      type: orderType,
      status: 'Pending',
      address: orderType === 'delivery' ? selectedAddress || undefined : undefined,
      date: new Date().toLocaleString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    return newOrder.id;
  };

  return (
    <AppContext.Provider value={{ 
      cart, favorites, addresses, selectedAddress, orderType, orders,
      addToCart, removeFromCart, updateQuantity, toggleFavorite, 
      setOrderType, addAddress, setSelectedAddress, placeOrder,
      totalAmount, deliveryCharge 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};