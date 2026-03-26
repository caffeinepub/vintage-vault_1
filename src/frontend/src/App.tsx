import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "./backend.d";
import AdminPanel from "./components/AdminPanel";
import Cart from "./components/Cart";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import { useVerifyPayment } from "./hooks/useQueries";

export interface CartItem {
  product: Product;
  quantity: number;
}

type View = "storefront" | "admin";

export default function App() {
  const [view, setView] = useState<View>("storefront");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const verifyPayment = useVerifyPayment();
  const verifyMutateRef = useRef(verifyPayment.mutate);
  verifyMutateRef.current = verifyPayment.mutate;

  // Check for Stripe return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      verifyMutateRef.current(sessionId, {
        onSuccess: (result) => {
          if (result === "paid") {
            setPaymentSuccess(true);
            setCart([]);
            toast.success("Payment successful! Your order is confirmed.");
          } else {
            toast.error(`Payment failed: ${result.replace("failed:", "")}`);
          }
          window.history.replaceState({}, "", window.location.pathname);
        },
        onError: () => {
          toast.error("Unable to verify payment. Please contact support.");
          window.history.replaceState({}, "", window.location.pathname);
        },
      });
    }
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
    toast.success(`${product.name} added to cart`);
  }, []);

  const removeFromCart = useCallback((productId: bigint) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: bigint, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.product.id !== productId)
        : prev.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
    );
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-vintage-cream">
      <Toaster richColors position="top-right" />

      <AnimatePresence mode="wait">
        {view === "storefront" ? (
          <motion.div
            key="storefront"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Announcement Bar */}
            <div className="bg-vintage-dark text-center py-2 px-4">
              <p className="text-xs font-body tracking-widest uppercase text-vintage-gold">
                Free shipping on orders over $75 &nbsp;·&nbsp; Authentic vintage
                pieces, carefully curated
              </p>
            </div>

            <Header
              cartCount={cartCount}
              onCartOpen={() => setCartOpen(true)}
              onAdminClick={() => setView("admin")}
            />

            <main>
              {paymentSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-800 text-center py-4 px-6"
                >
                  <p className="font-body font-semibold">
                    🎉 Payment Successful! Your order is confirmed. Check your
                    email for details.
                  </p>
                </motion.div>
              )}

              <Hero />
              <ProductGrid onAddToCart={addToCart} />
            </main>

            <Footer onAdminClick={() => setView("admin")} />
          </motion.div>
        ) : (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminPanel onBack={() => setView("storefront")} />
          </motion.div>
        )}
      </AnimatePresence>

      <Cart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
    </div>
  );
}
