"use client";

import React, { useState } from 'react';
import { Search, Filter, Heart, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MOCK_BANNERS = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
];

const CATEGORIES = [
  { name: 'Burgers', icon: '🍔' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Rolls', icon: '🌯' },
  { name: 'Drinks', icon: '🥤' },
  { name: 'Desserts', icon: '🍰' },
];

const MOCK_PRODUCTS = [
  { id: '1', name: 'KFF Special Burger', price: 120, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80', category: 'Burgers', isVeg: true, rating: 4.5, discount: 10 },
  { id: '2', name: 'Chicken Tikka Roll', price: 150, image: 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&w=400&q=80', category: 'Rolls', isVeg: false, rating: 4.8 },
  { id: '3', name: 'Paneer Pizza', price: 250, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80', category: 'Pizza', isVeg: true, rating: 4.2, discount: 15 },
  { id: '4', name: 'Cold Coffee', price: 80, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80', category: 'Drinks', isVeg: true, rating: 4.6 },
];

const Index = () => {
  const { addToCart, toggleFavorite, favorites } = useApp();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold italic">KFF</div>
          <h1 className="text-xl font-black text-orange-600 tracking-tighter">KOLKATTA FAST FOOD</h1>
        </div>
        <Button variant="ghost" size="icon" className="text-red-500">
          <Heart fill={favorites.length > 0 ? "currentColor" : "none"} />
        </Button>
      </header>

      {/* Search Bar */}
      <div className="px-4 mt-4 flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search delicious food..." 
            className="pl-10 bg-white border-none shadow-sm rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="secondary" size="icon" className="rounded-xl bg-white shadow-sm">
          <Filter size={18} />
        </Button>
      </div>

      {/* Hero Banner */}
      <div className="mt-6 px-4 overflow-x-auto flex space-x-4 no-scrollbar">
        {MOCK_BANNERS.map((banner, i) => (
          <div key={i} className="min-w-[85%] h-40 rounded-2xl overflow-hidden relative shadow-md">
            <img src={banner} alt="Offer" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <p className="text-white font-bold text-lg">Special Weekend Offer!</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="mt-8 px-4">
        <h2 className="text-lg font-bold mb-4">Categories</h2>
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="flex flex-col items-center space-y-2 min-w-[70px]">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-2xl border border-gray-100">
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-gray-600">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="mt-8 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Popular Dishes</h2>
          <Button variant="link" className="text-orange-600 p-0">View All</Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {MOCK_PRODUCTS.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm"
              >
                <Heart size={16} className={favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
              </button>
              <div className="h-32 overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="flex items-center space-x-1 mb-1">
                  <div className={`w-3 h-3 border flex items-center justify-center ${product.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${product.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                  </div>
                  <span className="text-[10px] text-gray-400 flex items-center">
                    <Star size={10} className="fill-yellow-400 text-yellow-400 mr-0.5" /> {product.rating}
                  </span>
                </div>
                <h3 className="font-bold text-sm truncate cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="font-black text-orange-600">₹{product.price}</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="h-7 px-3 bg-orange-600 hover:bg-orange-700 rounded-lg text-[10px]"
                    onClick={() => addToCart(product)}
                  >
                    ADD
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;