"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, rtdb, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  collection,
  query,
  where,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { toast } from 'sonner';

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  rating: number;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  fullAddress: string;
}

export type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type UserRole = 'customer' | 'admin' | 'delivery';

interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: CartItem[];
  total: number;
  type: string;
  status: OrderStatus;
  address?: Address;
  date: string;
  createdAt: number;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
}

interface AppContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  favorites: string[];
  addresses: Address[];
  selectedAddress: Address | null;
  orderType: 'delivery' | 'pickup' | 'dine-in';
  orders: Order[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  toggleFavorite: (productId: string) => void;
  setOrderType: (type: any) => void;
  addAddress: (address: Address) => void;
  setSelectedAddress: (address: Address) => void;
  placeOrder: () => Promise<string | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus, deliveryInfo?: any) => Promise<void>;
  totalAmount: number;
  deliveryCharge: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddressState] = useState<Address | null>(null);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine-in'>('delivery');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user role from Firestore
        const userDoc = doc(db, "users", currentUser.uid);
        onSnapshot(userDoc, (snap) => {
          if (snap.exists()) {
            setRole(snap.data().role || 'customer');
          } else {
            // Create user doc if not exists
            setDoc(userDoc, { 
              email: currentUser.email, 
              name: currentUser.displayName, 
              role: 'customer',
              createdAt: Date.now() 
            }, { merge: true });
            setRole('customer');
          }
        });
      } else {
        setRole('customer');
      }
      setLoading(false);
    });

    // Fetch Categories & Products from RTDB
    const categoriesRef = ref(rtdb, 'Categories');
    onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setCategories(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });

    const productsRef = ref(rtdb, 'Products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setProducts(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });

    return () => unsubscribeAuth();
  }, []);

  // Order Fetching Logic based on Role
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    let q;
    if (role === 'admin') {
      // Admin sees all orders
      q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    } else if (role === 'delivery') {
      // Delivery boy sees orders that are 'Accepted', 'Preparing', or assigned to them
      q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      // Note: In a real app, you'd filter more strictly, but for now we show all to let them pick
    } else {
      // Customer sees only their orders
      q = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    }

    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(fetchedOrders);
    });

    return () => unsubscribeOrders();
  }, [user, role]);

  // User Profile Data
  useEffect(() => {
    if (!user) return;
    const unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCart(data.cart || []);
        setFavorites(data.favorites || []);
        setAddresses(data.addresses || []);
      }
    });
    return () => unsubscribeProfile();
  }, [user]);

  const updateUserData = async (newData: any) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), newData, { merge: true });
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Logged in!");
    } catch (error) {
      toast.error("Login failed!");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out!");
    } catch (error) {
      toast.error("Logout failed!");
    }
  };

  const addToCart = (product: Product) => {
    if (!user) return toast.error("Please login first!");
    const existing = cart.find(item => item.id === product.id);
    let newCart = existing 
      ? cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];
    updateUserData({ cart: newCart });
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart.map(item => 
      item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0);
    updateUserData({ cart: newCart });
  };

  const toggleFavorite = (productId: string) => {
    if (!user) return toast.error("Please login first!");
    const newFavorites = favorites.includes(productId) 
      ? favorites.filter(id => id !== productId) 
      : [...favorites, productId];
    updateUserData({ favorites: newFavorites });
  };

  const addAddress = (address: Address) => {
    const newAddresses = [...addresses, address];
    updateUserData({ addresses: newAddresses });
    if (!selectedAddress) setSelectedAddressState(address);
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = (orderType === 'delivery' && totalAmount < 150 && totalAmount > 0) ? 30 : 0;

  const placeOrder = async () => {
    if (!user) return null;
    try {
      const orderData = {
        userId: user.uid,
        userName: user.displayName || 'Guest',
        userPhone: selectedAddress?.phone || '',
        items: [...cart],
        total: totalAmount + deliveryCharge,
        type: orderType,
        status: 'Pending',
        address: orderType === 'delivery' ? selectedAddress : null,
        date: new Date().toLocaleString(),
        createdAt: Date.now(),
      };
      const docRef = await addDoc(collection(db, "orders"), orderData);
      await updateUserData({ cart: [] });
      return docRef.id;
    } catch (error) {
      toast.error("Failed to place order");
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, deliveryInfo?: any) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { 
        status,
        ...deliveryInfo
      });
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, role, loading, products, categories, cart, favorites, addresses, selectedAddress, orderType, orders,
      login, logout, addToCart, updateQuantity, toggleFavorite, 
      setOrderType, addAddress, setSelectedAddress: setSelectedAddressState, placeOrder, updateOrderStatus,
      totalAmount, deliveryCharge 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};