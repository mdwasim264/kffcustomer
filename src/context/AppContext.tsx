"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  query, 
  where,
  getDocs
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
  discount?: number;
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
type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Out for Delivery' | 'Delivered';

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  type: OrderType;
  status: OrderStatus;
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
  removeFromCart: (productId: string) => void;
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

  // 1. Auth State & Initial Data Fetching
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Fetch Products (Real-time)
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      console.log("Products Loaded:", items.length);
      setProducts(items);
    });

    // Fetch Categories (Real-time) - Trying both 'categories' and 'Categories'
    const unsubscribeCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        console.log("Categories Loaded (lowercase):", items.length, items);
        setCategories(items);
      } else {
        // If empty, try uppercase 'Categories'
        getDocs(collection(db, "Categories")).then(snap => {
          if (!snap.empty) {
            const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            console.log("Categories Loaded (Uppercase):", items.length, items);
            setCategories(items);
          } else {
            console.log("No categories found in either 'categories' or 'Categories' collection.");
          }
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  // 2. User Specific Data
  useEffect(() => {
    if (!user) {
      setCart([]);
      setFavorites([]);
      setOrders([]);
      setAddresses([]);
      return;
    }

    const qOrders = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      const sortedOrders = fetchedOrders.sort((a, b) => {
        // Handle both Timestamp and Number for createdAt
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (typeof a.createdAt === 'number' ? a.createdAt : 0);
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (typeof b.createdAt === 'number' ? b.createdAt : 0);
        return dateB - dateA;
      });
      setOrders(sortedOrders);
    });

    const unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCart(data.cart || []);
        setFavorites(data.favorites || []);
        setAddresses(data.addresses || []);
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProfile();
    };
  }, [user]);

  const updateUserData = async (newData: any) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), newData, { merge: true });
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Logged in successfully!");
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
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    updateUserData({ cart: newCart });
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0);
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

  const setSelectedAddress = (address: Address) => {
    setSelectedAddressState(address);
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
        createdAt: Date.now(), // Using number for consistency
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
      login, logout, addToCart, removeFromCart: (id) => updateQuantity(id, -cart.find(i => i.id === id)!.quantity), 
      updateQuantity, toggleFavorite, 
      setOrderType, addAddress, setSelectedAddress, placeOrder,
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