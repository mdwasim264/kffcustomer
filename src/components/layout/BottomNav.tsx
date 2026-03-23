"use client";

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, Package, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const BottomNav = () => {
  const { cart } = useApp();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { icon: Home, label: 'HOME', path: '/' },
    { icon: ShoppingCart, label: 'CART', path: '/cart', badge: cartCount },
    { icon: Package, label: 'ORDER', path: '/orders' },
    { icon: User, label: 'PROFILE', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50 pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `flex flex-col items-center space-y-1 transition-colors ${isActive ? 'text-orange-600' : 'text-gray-500'}`
          }
        >
          <div className="relative">
            <item.icon size={24} />
            {item.badge > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;