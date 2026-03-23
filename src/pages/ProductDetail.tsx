"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Star, ShoppingCart, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleFavorite, favorites, loading } = useApp();
  
  const product = products.find(p => p.id === id);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" size={40} /></div>;
  if (!product) return <div className="p-10 text-center font-bold">Product not found</div>;

  return (
    <div className="pb-24 bg-white min-h-screen">
      {/* Header Image */}
      <div className="relative h-80">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => toggleFavorite(product.id)} className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg">
            <Heart size={24} className={favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-8 relative bg-white rounded-t-[32px] pt-8">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-5 h-5 border-2 flex items-center justify-center ${product.isVeg ? 'border-green-600' : 'border-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-600 border-none">
            <Star size={14} className="fill-orange-600 mr-1" /> {product.rating || '4.5'} (New)
          </Badge>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">{product.name}</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description || 'Delicious and fresh food prepared with high-quality ingredients.'}</p>

        <div className="flex items-center space-x-6 mb-8">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Delivery</p>
              <p className="text-xs font-bold">25-30 min</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Quality</p>
              <p className="text-xs font-bold">100% Fresh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex items-center justify-between z-50 max-w-md mx-auto">
        <div>
          <p className="text-xs text-gray-400 font-bold">Price</p>
          <p className="text-2xl font-black text-orange-600">₹{product.price}</p>
        </div>
        <Button 
          className="bg-orange-600 hover:bg-orange-700 h-14 px-8 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200"
          onClick={() => {
            addToCart(product);
            navigate('/cart');
          }}
        >
          <ShoppingCart className="mr-2" size={20} /> Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;