"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Heart, Star, X, Loader2, UtensilsCrossed, Check, Tag } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SplashScreen from '@/components/layout/SplashScreen';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const Index = () => {
  const { products, categories, banners, addToCart, toggleFavorite, favorites, loading } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Use sessionStorage to ensure splash only shows once per session
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('splashShown');
    }
    return true;
  });

  const navigate = useNavigate();

  // Filter States
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('splashShown', 'true');
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesVeg = isVegOnly ? product.isVeg === true : true;
      return matchesSearch && matchesCategory && matchesVeg;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [search, selectedCategory, products, isVegOnly, sortBy]);

  const resetFilters = () => {
    setIsVegOnly(false);
    setSortBy('default');
  };

  const activeFiltersCount = (isVegOnly ? 1 : 0) + (sortBy !== 'default' ? 1 : 0);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" size={40} /></div>;

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      
      <div className="pb-24 bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold italic">KFF</div>
            <h1 className="text-xl font-black text-orange-600 tracking-tighter">KOLKATTA FAST FOOD</h1>
          </div>
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => navigate('/favorites')}>
              <Heart fill={favorites.length > 0 ? "currentColor" : "none"} />
            </Button>
            {favorites.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </div>
        </header>

        {/* Search Bar & Filter */}
        <div className="px-4 mt-4 flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search delicious food..." 
              className="pl-10 bg-white border-none shadow-sm rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={16} />
              </button>
            )}
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-xl bg-white shadow-sm relative">
                <Filter size={18} className={activeFiltersCount > 0 ? "text-orange-600" : "text-gray-600"} />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[32px] h-[60vh]">
              <SheetHeader className="flex flex-row items-center justify-between border-b pb-4">
                <SheetTitle className="text-xl font-black">Filters</SheetTitle>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-orange-600 font-bold">Reset</Button>
              </SheetHeader>
              
              <div className="py-6 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Veg Only</Label>
                    <p className="text-xs text-gray-500">Show only vegetarian dishes</p>
                  </div>
                  <Switch 
                    checked={isVegOnly} 
                    onCheckedChange={setIsVegOnly}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-bold">Sort By</Label>
                  <RadioGroup value={sortBy} onValueChange={setSortBy} className="grid grid-cols-1 gap-3">
                    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${sortBy === 'default' ? 'border-orange-600 bg-orange-50' : 'border-gray-100'}`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="default" id="default" className="sr-only" />
                        <Label htmlFor="default" className="font-medium cursor-pointer">Relevance (Default)</Label>
                      </div>
                      {sortBy === 'default' && <Check size={18} className="text-orange-600" />}
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${sortBy === 'rating' ? 'border-orange-600 bg-orange-50' : 'border-gray-100'}`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="rating" id="rating" className="sr-only" />
                        <Label htmlFor="rating" className="font-medium cursor-pointer">Top Rated</Label>
                      </div>
                      {sortBy === 'rating' && <Check size={18} className="text-orange-600" />}
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${sortBy === 'price-low' ? 'border-orange-600 bg-orange-50' : 'border-gray-100'}`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="price-low" id="price-low" className="sr-only" />
                        <Label htmlFor="price-low" className="font-medium cursor-pointer">Price: Low to High</Label>
                      </div>
                      {sortBy === 'price-low' && <Check size={18} className="text-orange-600" />}
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${sortBy === 'price-high' ? 'border-orange-600 bg-orange-50' : 'border-gray-100'}`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="price-high" id="price-high" className="sr-only" />
                        <Label htmlFor="price-high" className="font-medium cursor-pointer">Price: High to Low</Label>
                      </div>
                      {sortBy === 'price-high' && <Check size={18} className="text-orange-600" />}
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <SheetFooter className="pt-4">
                <SheetClose asChild>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12 rounded-xl font-bold text-lg">
                    Apply Filters
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Banners Slider */}
        {banners.length > 0 && (
          <div className="mt-6 px-4">
            <Carousel className="w-full">
              <CarouselContent>
                {banners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    <div className="relative h-40 rounded-2xl overflow-hidden shadow-md">
                      <img src={banner.image} alt={banner.title || 'Offer'} className="w-full h-full object-cover" />
                      {banner.title && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                          <h3 className="text-white font-bold text-lg">{banner.title}</h3>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}

        {/* Categories */}
        <div className="mt-8 px-4">
          <h2 className="text-lg font-bold mb-4">Categories</h2>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
            <button 
              onClick={() => setSelectedCategory('All')}
              className="flex flex-col items-center space-y-2 min-w-[70px] outline-none"
            >
              <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center text-2xl border transition-all ${selectedCategory === 'All' ? 'bg-orange-600 border-orange-600 scale-110 text-white' : 'bg-white border-gray-100 text-orange-600'}`}>
                <UtensilsCrossed size={24} />
              </div>
              <span className={`text-xs font-bold ${selectedCategory === 'All' ? 'text-orange-600' : 'text-gray-500'}`}>All</span>
            </button>

            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.name)}
                className="flex flex-col items-center space-y-2 min-w-[70px] outline-none"
              >
                <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center overflow-hidden border transition-all ${selectedCategory === cat.name ? 'border-orange-600 scale-110 ring-2 ring-orange-100' : 'bg-white border-gray-100'}`}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🍽️</span>
                  )}
                </div>
                <span className={`text-xs font-bold ${selectedCategory === cat.name ? 'text-orange-600' : 'text-gray-500'}`}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mt-8 px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              {search ? `Results for "${search}"` : selectedCategory === 'All' ? 'Popular Dishes' : selectedCategory}
            </h2>
            <div className="flex items-center space-x-2">
              {isVegOnly && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Veg Only</span>}
              <span className="text-xs text-gray-400 font-bold">{filteredProducts.length} Items</span>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No dishes found matching your filters.</p>
              <Button variant="link" onClick={resetFilters} className="text-orange-600 mt-2">Clear all filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
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
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        <div className={`w-3 h-3 border flex items-center justify-center ${product.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${product.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                        </div>
                        <span className="text-[10px] text-gray-400 flex items-center">
                          <Star size={10} className="fill-yellow-400 text-yellow-400 mr-0.5" /> {product.rating || '4.5'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Category Name */}
                    <div className="flex items-center text-[9px] font-bold text-orange-500 uppercase tracking-wider mb-0.5">
                      <Tag size={8} className="mr-1" /> {product.category}
                    </div>
                    
                    <h3 className="font-bold text-sm truncate cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>{product.name}</h3>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-black text-orange-600">₹{product.price}</span>
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
          )}
        </div>
      </div>
    </>
  );
};

export default Index;