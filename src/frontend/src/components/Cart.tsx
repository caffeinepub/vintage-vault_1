import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { CartItem } from "../App";
import { useCreateCheckoutSession } from "../hooks/useQueries";

interface CartProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (productId: bigint) => void;
  onUpdateQuantity: (productId: bigint, quantity: number) => void;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Dresses: "linear-gradient(135deg, #c9a0a0 0%, #e8c9c9 100%)",
  Jackets: "linear-gradient(135deg, #8b6f5e 0%, #c4a882 100%)",
  Tops: "linear-gradient(135deg, #8a9e8a 0%, #b8cdb8 100%)",
  Bottoms: "linear-gradient(135deg, #6e7fa0 0%, #a8b8d0 100%)",
  Coats: "linear-gradient(135deg, #4a7a7a 0%, #8ab8b8 100%)",
  Skirts: "linear-gradient(135deg, #9a7a9a 0%, #c8a8c8 100%)",
  Accessories: "linear-gradient(135deg, #b89a5a 0%, #d4c080 100%)",
};

function formatPrice(cents: bigint): string {
  return `₹${(Number(cents) / 100).toFixed(0)}`;
}

export default function Cart({
  open,
  onClose,
  items,
  onRemove,
  onUpdateQuantity,
}: CartProps) {
  const createCheckout = useCreateCheckoutSession();
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (items.length === 0) return;
    const successUrl = `${window.location.origin}${window.location.pathname}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}${window.location.pathname}`;
    createCheckout.mutate(
      {
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: BigInt(item.quantity),
        })),
        successUrl,
        cancelUrl,
      },
      {
        onSuccess: (url) => {
          window.location.href = url;
        },
        onError: (err) => {
          toast.error(`Checkout failed: ${err.message}`);
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 bg-vintage-cream"
        data-ocid="cart.sheet"
      >
        <SheetHeader className="px-6 py-5 bg-vintage-dark">
          <SheetTitle className="font-display text-lg font-bold tracking-wider text-vintage-ivory">
            Your Cart
            {items.length > 0 && (
              <span className="font-body text-sm font-normal text-vintage-gold ml-2">
                ({items.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-60 gap-4 text-center"
                data-ocid="cart.empty_state"
              >
                <ShoppingBag className="w-12 h-12 text-muted-foreground/40" />
                <p className="font-body text-sm text-muted-foreground">
                  Your cart is empty
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  data-ocid="cart.continue_shopping.button"
                  className="font-body text-xs tracking-widest uppercase text-vintage-gold hover:underline"
                >
                  Continue Shopping
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-5">
                {items.map((item, idx) => {
                  const idStr = String(item.product.id);
                  const hasImgError = imgErrors.has(idStr);
                  const hasImage = item.product.imageId && !hasImgError;
                  const gradient =
                    CATEGORY_GRADIENTS[item.product.category] ||
                    CATEGORY_GRADIENTS.Accessories;
                  return (
                    <motion.div
                      key={idStr}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      data-ocid={`cart.item.${idx + 1}`}
                      className="flex gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-20 rounded-md overflow-hidden flex-shrink-0">
                        {hasImage ? (
                          <img
                            src={`/api/v1/blobs/${item.product.imageId}`}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={() =>
                              setImgErrors((prev) => {
                                const next = new Set(prev);
                                next.add(idStr);
                                return next;
                              })
                            }
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: gradient }}
                          >
                            <span className="font-display text-lg font-bold text-white/60">
                              {item.product.category[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-body text-sm font-medium truncate">
                            {item.product.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => onRemove(item.product.id)}
                            data-ocid={`cart.remove.button.${idx + 1}`}
                            className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-body text-xs text-muted-foreground mb-2">
                          {item.product.category}
                        </p>
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                )
                              }
                              data-ocid={`cart.qty_decrease.button.${idx + 1}`}
                              className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-vintage-gold transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-body text-sm w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                )
                              }
                              data-ocid={`cart.qty_increase.button.${idx + 1}`}
                              className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-vintage-gold transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p
                            className="font-body text-sm font-semibold"
                            style={{ color: "var(--vintage-gold)" }}
                          >
                            {formatPrice(
                              item.product.price * BigInt(item.quantity),
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border bg-vintage-ivory">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-sm text-muted-foreground">
                Subtotal
              </span>
              <span className="font-body text-sm font-semibold">
                ₹${(subtotal / 100).toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="font-body text-xs text-muted-foreground">
                Shipping
              </span>
              <span className="font-body text-xs text-muted-foreground">
                {subtotal / 100 >= 75 ? "Free" : "Calculated at checkout"}
              </span>
            </div>
            <Separator className="mb-4" />
            <div className="flex items-center justify-between mb-6">
              <span className="font-body text-base font-semibold">Total</span>
              <span
                className="font-display text-xl font-bold"
                style={{ color: "var(--vintage-gold)" }}
              >
                ₹${(subtotal / 100).toFixed(0)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={createCheckout.isPending}
              data-ocid="cart.checkout.primary_button"
              className="w-full font-body text-xs font-bold tracking-[0.2em] uppercase px-6 py-4 bg-vintage-dark text-vintage-ivory hover:bg-vintage-darker disabled:opacity-60 disabled:cursor-not-allowed transition-colors rounded-sm flex items-center justify-center gap-2"
            >
              {createCheckout.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                </>
              ) : (
                "Proceed to Checkout"
              )}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
