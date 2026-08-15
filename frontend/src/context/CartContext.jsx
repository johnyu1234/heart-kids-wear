import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    total_items: 0,
    subtotal: 0,
    bulk_discount: 0,
    estimated_shipping: 60,
    estimated_total: 60,
  });
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], total_items: 0, subtotal: 0, bulk_discount: 0, estimated_shipping: 60, estimated_total: 60 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get("/cart");
      setCart(res.data);
    } catch (err) {
      console.error("Error fetching cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (variantId, quantity = 1) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    try {
      await api.post("/cart/add", { variant_id: variantId, quantity });
      await fetchCart();
      setIsDropdownOpen(true);
    } catch (err) {
      alert(err.response?.data?.detail || "加入購物車失敗");
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await api.post("/cart/update", { cart_item_id: cartItemId, quantity });
      await fetchCart();
    } catch (err) {
      alert("更新購物車失敗");
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await api.post("/cart/remove", { cart_item_id: cartItemId });
      await fetchCart();
    } catch (err) {
      alert("移除商品失敗");
    }
  };

  const clearCart = async () => {
    await fetchCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isDropdownOpen,
        setIsDropdownOpen,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
