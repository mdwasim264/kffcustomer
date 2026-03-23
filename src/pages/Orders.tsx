"use client";

import React from 'react';
import { Package, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Orders = () => {
  const { orders } = useApp();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Package size={48} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">No orders yet</h2>
        <p className="text-gray-500 mt-2">Your order history will appear here once you place an order.</p>
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
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <header className="bg-white px-4 py-4 sticky top-0 z-40 shadow-sm">
        <h1 className="text-xl font-bold">My Orders</h1>
      </header>

      <div className="p-4 space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-4 border-none shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Order ID</p>
                <p className="font-black text-gray-900">{order.id}</p>
              </div>
              <Badge className={`border-none ${getStatusColor(order.status)}`}>
                {order.status}
              </Badge>
            </div>

            <div className="flex items-center space-x-3 py-2 border-y border-gray-50">
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map((item, i) => (
                  <img key={i} src={item.image} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                ))}
              </div>
              <p className="text-xs font-medium text-gray-600">
                {order.items[0].name} {order.items.length > 1 ? `+ ${order.items.length - 1} more` : ''}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center text-gray-400 text-[10px] font-bold">
                <Clock size={12} className="mr-1" /> {order.date}
              </div>
              <p className="font-black text-orange-600">₹{order.total}</p>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Track Order</span>
                <ChevronRight size={16} />
              </div>
              {/* Simple Progress Bar */}
              <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 w-1/4 animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;