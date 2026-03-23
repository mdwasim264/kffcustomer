"use client";

import React, { useState, useRef } from 'react';
import { User as UserIcon, MapPin, Package, LogOut, Plus, ChevronRight, LogIn, Camera, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddressForm from '@/components/address/AddressForm';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { toast } from 'sonner';
import { updateProfile } from 'firebase/auth';

const Profile = () => {
  const { user, login, logout, addresses, selectedAddress, setSelectedAddress } = useApp();
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      
      // Firebase में यूजर की प्रोफाइल फोटो अपडेट करना
      await updateProfile(user, { photoURL: imageUrl });
      
      toast.success("Profile picture updated!");
      // पेज रिफ्रेश करने की जरूरत पड़ सकती है या स्टेट अपडेट करना होगा
      window.location.reload(); 
    } catch (error) {
      toast.error("Failed to upload image. Check your Cloudinary config.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <header className="bg-white px-4 py-8 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 overflow-hidden border-4 border-white shadow-sm">
              {isUploading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={40} />
              )}
            </div>
            {user && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-orange-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm hover:bg-orange-700 transition-colors"
              >
                <Camera size={14} />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900">
              {user ? user.displayName : 'Welcome Guest'}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {user ? user.email : 'Login to save your orders'}
            </p>
          </div>
        </div>
        
        {!user ? (
          <Button 
            onClick={login} 
            className="w-full mt-6 bg-orange-600 hover:bg-orange-700 h-12 rounded-xl font-bold shadow-lg shadow-orange-100"
          >
            <LogIn className="mr-2" size={20} /> Login with Google
          </Button>
        ) : (
          <Button 
            onClick={logout} 
            variant="outline"
            className="w-full mt-6 border-red-100 text-red-600 hover:bg-red-50 h-12 rounded-xl font-bold"
          >
            <LogOut className="mr-2" size={20} /> Logout
          </Button>
        )}
      </header>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center space-y-2 border-none shadow-sm bg-white">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Package size={24} />
            </div>
            <span className="text-sm font-bold text-gray-700">My Orders</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center space-y-2 border-none shadow-sm bg-white">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <MapPin size={24} />
            </div>
            <span className="text-sm font-bold text-gray-700">Addresses</span>
          </Card>
        </div>

        {/* Saved Addresses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-black text-gray-800 text-lg">Saved Addresses</h2>
            <Dialog open={isAddressOpen} onOpenChange={setIsAddressOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-orange-600 font-bold hover:bg-orange-50">
                  <Plus size={18} className="mr-1" /> Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-[32px] p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black">Add New Address</DialogTitle>
                </DialogHeader>
                <AddressForm onSuccess={() => setIsAddressOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {addresses.length === 0 ? (
            <Card className="p-10 text-center border-dashed border-2 border-gray-200 bg-transparent rounded-[24px]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-gray-400" size={32} />
              </div>
              <p className="text-sm text-gray-400 font-medium">No addresses saved yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <Card 
                  key={addr.id} 
                  className={`p-4 border-none shadow-sm cursor-pointer transition-all rounded-2xl ${selectedAddress?.id === addr.id ? 'ring-2 ring-orange-600 bg-orange-50/30' : 'bg-white'}`}
                  onClick={() => setSelectedAddress(addr)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${selectedAddress?.id === addr.id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{addr.name}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{addr.fullAddress}, {addr.city}, {addr.pincode}</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">Phone: {addr.phone}</p>
                      </div>
                    </div>
                    {selectedAddress?.id === addr.id && (
                      <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-full">SELECTED</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;