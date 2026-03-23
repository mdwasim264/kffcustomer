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
  where
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

type OrderType = 'delivery' | 'pickup' | 'dine-in';
interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  type: OrderType;
  status: string;
  address?: Address;
  date: string;
  createdAt: any;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  favorites: string[];
  addresses: Address[];
  selectedAddress: Address | null;
  orderType: OrderType;
  orders: Order[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, delta: number) => void;
  toggleFavorite: (productId: string) => void;
  setOrderType: (type: OrderType) => void;
  addAddress: (address: Address) => void;
  setSelectedAddress: (address: Address) => void;
  placeOrder: () => Promise<string | null>;
  totalAmount: number;
  deliveryCharge: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddressState] = useState<Address | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // 1. Fetch Categories from Realtime Database
    const categoriesRef = ref(rtdb, 'Categories');
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) as Category[];
        console.log("RTDB Categories Loaded:", items);
        setCategories(items);
      } else {
        // Try lowercase if uppercase fails
        onValue(ref(rtdb, 'categories'), (snap) => {
          const d = snap.val();
          if (d) {
            const items = Object.keys(d).map(k => ({ id: k, ...d[k] })) as Category[];
            setCategories(items);
          }
        });
      }
    });

    // 2. Fetch Products from Realtime Database
    const productsRef = ref(rtdb, 'Products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) as Product[];
        console.log("RTDB Products Loaded:", items);
        setProducts(items);
      } else {
        // Try lowercase
        onValue(ref(rtdb, 'products'), (snap) => {
          const d = snap.val();
          if (d) {
            const items = Object.keys(d).map(k => ({ id: k, ...d[k] })) as Product[];
            setProducts(items);
          }
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, []);

  // User Specific Data (Firestore for Profile/Orders)
  useEffect(() => {
    if (!user) {
      setCart([]); setFavorites([]); setOrders([]); setAddresses([]);
      return;
    }

    const unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCart(data.cart || []);
        setFavorites(data.favorites || []);
        setAddresses(data.addresses || []);
      }
    });

    const qOrders = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(fetchedOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    });

    return () => {
      unsubscribeProfile();
      unsubscribeOrders();
    };
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

  return (
    <AppContext.Provider value={{ 
      user, loading, products, categories, cart, favorites, addresses, selectedAddress, orderType, orders,
      login, logout, addToCart, updateQuantity, toggleFavorite, 
      setOrderType, addAddress, setSelectedAddress: setSelectedAddressState, placeOrder,
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