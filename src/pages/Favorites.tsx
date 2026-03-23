"use client";

import React from 'react';
import { Heart, ShoppingCart, Star, ChevronLeft, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const { favorites, toggleFavorite, addToCart, products, loading } = useApp();
  const navigate = useNavigate();
  
  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" size={40} /></div>;

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <header className="bg-white px-4 py-4 sticky top-0 z-40 shadow-sm flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">My Favorites</h1>
      </header>

      <div className="p-4">
        {favoriteProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Heart size={40} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">No favorites yet</h2>
            <p className="text-gray-500 text-sm mt-1">Tap the heart icon on any dish to save it here.</p>
            <Button className="mt-6 bg-orange-600" onClick={() => navigate('/')}>Explore Menu</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="bg-white p-3 rounded-2xl shadow-sm flex items-center space-x-4 relative">
                <img src={product.image} alt={product.name} className="w-24 h-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-center space-x-1 mb-1">
                    <div className={`w-2.5 h-2.5 border flex items-center justify-center ${product.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                      <div className={`w-1 h-1 rounded-full ${product.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                    </div>
                    <span className="text-[10px] text-gray-400 flex items-center">
                      <Star size={10} className="fill-yellow-400 text-yellow-400 mr-0.5" /> {product.rating || '4.5'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm">{product.name}</h3>
                  <p className="text-orange-600 font-black mt-1">₹{product.price}</p>
                  <Button 
                    size="sm" 
                    className="mt-2 h-8 bg-orange-600 hover:bg-orange-700 rounded-lg text-xs"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart size={14} className="mr-1" /> Add to Cart
                  </Button>
                </div>
                <button 
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 right-3 p-1.5 bg-gray-50 rounded-full"
                >
                  <Heart size={18} className="fill-red-500 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;