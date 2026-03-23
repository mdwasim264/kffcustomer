"use client";

import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Wait for fade out animation
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-orange-600 flex flex-col items-center justify-center transition-opacity duration-500">
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-orange-600 text-4xl font-black italic shadow-2xl animate-bounce">
        KFF
      </div>
      <h1 className="text-white text-2xl font-black mt-6 tracking-widest animate-pulse">
        KOLKATTA FAST FOOD
      </h1>
      <p className="text-orange-100 text-sm mt-2 font-medium">Deliciousness Delivered</p>
      
      <div className="absolute bottom-12 flex space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export default SplashScreen;