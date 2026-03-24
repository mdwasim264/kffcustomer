"use client";

import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Star, ShoppingCart, Clock, ShieldCheck, Loader2, Share2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, toggleFavorite, favorites, loading } = useApp();
  
  const product = products.find(p => p.id === id);

  // Recommended products (same category, excluding current)
  const recommendedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" size={40} /></div>;
  if (!product) return <div className="p-10 text-center font-bold">Product not found</div>;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this delicious ${product.name} at Kolkatta Fast Food!`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="pb-32 bg-white min-h-screen">
      {/* Header Image & Actions */}
      <div className="relative h-[45vh] w-full">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-gray-900 active:scale-90 transition-transform"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex space-x-3">
            <button 
              onClick={handleShare}
              className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-gray-900 active:scale-90 transition-transform"
            >
              <Share2 size={20} />
            </button>
            <button 
              onClick={() => toggleFavorite(product.id)} 
              className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl active:scale-90 transition-transform"
            >
              <Heart size={20} className={favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-6 -mt-10 relative bg-white rounded-t-[40px] pt-8 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-5 h-5 border-2 flex items-center justify-center rounded-sm ${product.isVeg ? 'border-green-600' : 'border-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
            </div>
            <span className={`text-xs font-bold ${product.isVeg ? 'text-green-600' : 'text-red-600'}`}>
              {product.isVeg ? 'VEG' : 'NON-VEG'}
            </span>
          </div>
          <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-none px-3 py-1 rounded-full font-bold">
            <Star size={14} className="fill-orange-600 mr-1" /> {product.rating || '4.5'}
          </Badge>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3 leading-tight">{product.name}</h1>
        
        <div className="flex items-center space-x-6 mb-8 py-4 border-y border-gray-50">
          <div className="flex items-center space-x-2">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Delivery</p>
              <p className="text-sm font-bold">25-30 min</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-2xl">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Quality</p>
              <p className="text-sm font-bold">100% Fresh</p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-black text-gray-900 mb-2">Description</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {product.description || 'Experience the authentic taste of Kolkatta with our specially prepared dishes. Made with fresh ingredients and traditional spices to give you a burst of flavor in every bite.'}
          </p>
        </div>

        {/* Recommended Section */}
        {recommendedProducts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-black text-gray-900 mb-4">Recommended for You</h2>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4">
              {recommendedProducts.map((item) => (
                <Card 
                  key={item.id} 
                  className="min-w-[160px] p-2 border-none shadow-sm bg-gray-50 rounded-2xl cursor-pointer"
                  onClick={() => {
                    navigate(`/product/${item.id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <img src={item.image} alt={item.name} className="w-full h-28 object-cover rounded-xl mb-2" />
                  <h3 className="text-xs font-bold truncate px-1">{item.name}</h3>
                  <p className="text-orange-600 font-black text-sm px-1">₹{item.price}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex items-center justify-between z-50 max-w-md mx-auto rounded-t-[32px]">
        <div className="flex flex-col">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Price</p>
          <p className="text-3xl font-black text-orange-600">₹{product.price}</p>
        </div>
        <Button 
          className="bg-orange-600 hover:bg-orange-700 h-16 px-10 rounded-[24px] font-black text-lg shadow-2xl shadow-orange-200 active:scale-95 transition-all"
          onClick={() => {
            addToCart(product);
            navigate('/cart');
          }}
        >
          <ShoppingCart className="mr-2" size={22} /> Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;