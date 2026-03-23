"use client";

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-orange-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-orange-500">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 font-black italic shadow-inner">
            KFF
          </div>
          <div>
            <p className="font-bold text-sm">Install KFF App</p>
            <p className="text-[10px] text-orange-100">Fast & easy ordering from home!</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            className="bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-lg h-8 text-xs"
            onClick={handleInstall}
          >
            <Download size={14} className="mr-1" /> INSTALL
          </Button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 text-orange-200 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;