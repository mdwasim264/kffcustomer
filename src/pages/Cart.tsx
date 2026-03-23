"use client";

import React, { useState } from 'react';
import { Trash2, Plus, Minus, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Cart = () => {
  const { cart, updateQuantity, totalAmount, deliveryCharge, orderType, setOrderType, selectedAddress, placeOrder } = useApp();
  const navigate = useNavigate();
  const [isOrderTypeOpen, setIsOrderTypeOpen] = useState(false);

  const handlePlaceOrder = () => {
    if (orderType === 'delivery' && !selectedAddress) {
      toast.error("Please select a delivery address first!");
      navigate('/profile');
      return;
    }
    
    const orderId = placeOrder();
    toast.success(`Order ${orderId} placed successfully!`);
    navigate('/orders');
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag size={48} className="text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Add some delicious food from the menu to get started!</p>
        <Button className="mt-6 bg-orange-600 hover:bg-orange-700 w-full" onClick={() => navigate('/')}>
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      <header className="bg-white px-4 py-4 sticky top-0 z-40 shadow-sm flex items-center">
        <h1 className="text-xl font-bold">My Cart ({cart.length})</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Order Type Selector */}
        <Card className="p-4 border-none shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Order Type</p>
              <p className="font-bold text-orange-600 capitalize">{orderType}</p>
            </div>
            <Dialog open={isOrderTypeOpen} onOpenChange={setIsOrderTypeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg">Change</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>How do you want it?</DialogTitle>
                </DialogHeader>
                <RadioGroup defaultValue={orderType} onValueChange={(val) => {
                  setOrderType(val as any);
                  setIsOrderTypeOpen(false);
                }} className="space-y-3 mt-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-xl cursor-pointer hover:bg-orange-50 transition-colors">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="flex-1 cursor-pointer font-bold">Delivery (Home)</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-xl cursor-pointer hover:bg-orange-50 transition-colors">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex-1 cursor-pointer font-bold">Self Pickup</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-xl cursor-pointer hover:bg-orange-50 transition-colors">
                    <RadioGroupItem value="dine-in" id="dine-in" />
                    <Label htmlFor="dine-in" className="flex-1 cursor-pointer font-bold">Dine-in (At Restaurant)</Label>
                  </div>
                </RadioGroup>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Address Section (Only for Delivery) */}
        {orderType === 'delivery' && (
          <Card className="p-4 border-none shadow-sm" onClick={() => navigate('/profile')}>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Delivery Address</p>
                {selectedAddress ? (
                  <p className="font-medium text-sm line-clamp-1">{selectedAddress.fullAddress}</p>
                ) : (
                  <p className="font-medium text-sm text-red-500">No address selected</p>
                )}
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </Card>
        )}

        {/* Cart Items */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-700 px-1">Items in Cart</h2>
          {cart.map((item) => (
            <Card key={item.id} className="p-3 border-none shadow-sm flex items-center space-x-3">
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  <div className={`w-2.5 h-2.5 border flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                    <div className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                  </div>
                  <h3 className="font-bold text-sm">{item.name}</h3>
                </div>
                <p className="text-orange-600 font-black text-sm">₹{item.price}</p>
              </div>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-500 hover:text-orange-600">
                  <Minus size={16} />
                </button>
                <span className="px-2 font-bold text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-500 hover:text-orange-600">
                  <Plus size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Bill Details */}
        <Card className="p-4 border-none shadow-sm space-y-3">
          <h2 className="font-bold text-gray-700">Bill Details</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Item Total</span>
            <span className="font-medium">₹{totalAmount}</span>
          </div>
          {orderType === 'delivery' && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery Fee</span>
              <span className={deliveryCharge === 0 ? "text-green-600 font-bold" : "font-medium"}>
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>
          )}
          <div className="pt-3 border-t flex justify-between items-center">
            <span className="font-black text-lg">Total Amount</span>
            <span className="font-black text-lg text-orange-600">₹{totalAmount + deliveryCharge}</span>
          </div>
        </Card>
      </div>

      {/* Checkout Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t z-40 max-w-md mx-auto">
        <Button 
          className="w-full bg-orange-600 hover:bg-orange-700 h-12 rounded-xl font-bold text-lg shadow-lg shadow-orange-200"
          onClick={handlePlaceOrder}
        >
          Place Order (COD)
        </Button>
      </div>
    </div>
  );
};

export default Cart;