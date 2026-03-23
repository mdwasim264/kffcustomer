"use client";

import React from 'react';
import { Package, Clock, MapPin, ChevronRight, Phone, User, CheckCircle2, Truck } from 'lucide-react';
import { useApp, OrderStatus } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Orders = () => {
  const { orders, role, user, updateOrderStatus } = useApp();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Package size={48} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">No orders yet</h2>
        <p className="text-gray-500 mt-2">Orders will appear here once they are placed.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Accepted': return 'bg-blue-100 text-blue-700';
      case 'Preparing': return 'bg-purple-100 text-purple-700';
      case 'Out for Delivery': return 'bg-orange-100 text-orange-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <header className="bg-white px-4 py-4 sticky top-0 z-40 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold">
          {role === 'admin' ? 'All Orders (Admin)' : role === 'delivery' ? 'Delivery Tasks' : 'My Orders'}
        </h1>
        <Badge variant="outline" className="capitalize">{role}</Badge>
      </header>

      <div className="p-4 space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-4 border-none shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order ID: {order.id.slice(-6)}</p>
                <div className="flex items-center mt-1">
                  <User size={14} className="text-gray-400 mr-1" />
                  <p className="font-bold text-gray-900">{order.userName}</p>
                </div>
              </div>
              <Badge className={`border-none ${getStatusColor(order.status)}`}>
                {order.status}
              </Badge>
            </div>

            {/* Items List */}
            <div className="space-y-2 py-2 border-y border-gray-50">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-gray-600">{item.quantity}x {item.name}</span>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Address & Contact (For Admin/Delivery) */}
            {(role === 'admin' || role === 'delivery') && order.address && (
              <div className="bg-gray-50 p-3 rounded-xl space-y-2">
                <div className="flex items-start space-x-2 text-xs">
                  <MapPin size={14} className="text-orange-600 mt-0.5" />
                  <p className="text-gray-600">{order.address.fullAddress}, {order.address.city}</p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <Phone size={14} className="text-green-600" />
                  <a href={`tel:${order.userPhone}`} className="text-blue-600 font-bold">{order.userPhone}</a>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-400 text-[10px] font-bold">
                <Clock size={12} className="mr-1" /> {order.date}
              </div>
              <p className="font-black text-orange-600 text-lg">₹{order.total}</p>
            </div>

            {/* Action Buttons based on Role */}
            <div className="pt-2 flex gap-2">
              {role === 'admin' && order.status === 'Pending' && (
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 rounded-xl text-xs font-bold"
                  onClick={() => updateOrderStatus(order.id, 'Accepted')}
                >
                  Accept Order
                </Button>
              )}
              
              {role === 'admin' && order.status === 'Accepted' && (
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 h-10 rounded-xl text-xs font-bold"
                  onClick={() => updateOrderStatus(order.id, 'Preparing')}
                >
                  Start Preparing
                </Button>
              )}

              {(role === 'admin' || role === 'delivery') && order.status === 'Preparing' && (
                <Button 
                  className="flex-1 bg-orange-600 hover:bg-orange-700 h-10 rounded-xl text-xs font-bold"
                  onClick={() => updateOrderStatus(order.id, 'Out for Delivery', { 
                    deliveryBoyId: user?.uid, 
                    deliveryBoyName: user?.displayName 
                  })}
                >
                  <Truck size={16} className="mr-2" /> Out for Delivery
                </Button>
              )}

              {role === 'delivery' && order.status === 'Out for Delivery' && (
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 h-10 rounded-xl text-xs font-bold"
                  onClick={() => updateOrderStatus(order.id, 'Delivered')}
                >
                  <CheckCircle2 size={16} className="mr-2" /> Mark Delivered
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;