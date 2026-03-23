"use client";

import React, { useState } from 'react';
import { User, MapPin, Package, LogOut, Plus, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AddressForm from '@/components/address/AddressForm';

const Profile = () => {
  const { addresses, selectedAddress, setSelectedAddress } = useApp();
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <header className="bg-white px-4 py-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Guest User</h1>
            <p className="text-sm text-gray-500">Login to sync your data</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col items-center justify-center space-y-2 border-none shadow-sm">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Package size={24} />
            </div>
            <span className="text-sm font-bold">My Orders</span>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center space-y-2 border-none shadow-sm">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <LogOut size={24} />
            </div>
            <span className="text-sm font-bold">Logout</span>
          </Card>
        </div>

        {/* Saved Addresses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-gray-700">Saved Addresses</h2>
            <Dialog open={isAddressOpen} onOpenChange={setIsAddressOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-orange-600 font-bold">
                  <Plus size={16} className="mr-1" /> Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Address</DialogTitle>
                </DialogHeader>
                <AddressForm onSuccess={() => setIsAddressOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {addresses.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 bg-transparent">
              <MapPin className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-400">No addresses saved yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <Card 
                  key={addr.id} 
                  className={`p-4 border-none shadow-sm cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'ring-2 ring-orange-600' : ''}`}
                  onClick={() => setSelectedAddress(addr)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <MapPin size={18} className="text-gray-400 mt-1" />
                      <div>
                        <p className="font-bold text-sm">{addr.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{addr.fullAddress}, {addr.city}, {addr.pincode}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Phone: {addr.phone}</p>
                      </div>
                    </div>
                    {selectedAddress?.id === addr.id && (
                      <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded">SELECTED</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* App Info */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between text-gray-500 text-sm px-1">
            <span>About KFF</span>
            <ChevronRight size={18} />
          </div>
          <div className="flex items-center justify-between text-gray-500 text-sm px-1">
            <span>Terms & Conditions</span>
            <ChevronRight size={18} />
          </div>
          <div className="flex items-center justify-between text-gray-500 text-sm px-1">
            <span>Support</span>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;