import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Product } from "../backend.d";

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
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
  const dollars = Number(cents) / 100;
  return `₹${dollars.toFixed(0)}`;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="w-full aspect-[3/4] rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export default function ProductCard({
  product,
  index,
  onAddToCart,
}: ProductCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const gradient =
    CATEGORY_GRADIENTS[product.category] || CATEGORY_GRADIENTS.Accessories;
  const hasImage = product.imageId && !imgError;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.07 }}
        data-ocid={`products.item.${index + 1}`}
        className="group flex flex-col"
      >
        {/* Image */}
        <button
          type="button"
          className="relative overflow-hidden rounded-lg mb-3 aspect-[3/4] w-full text-left"
          onClick={() => setDetailOpen(true)}
          aria-label={`View ${product.name}`}
        >
          {hasImage ? (
            <img
              src={`/api/v1/blobs/${product.imageId}`}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: gradient }}
            >
              <span className="font-display text-5xl font-bold text-white/60">
                {product.category[0]}
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 rounded-full p-2.5">
              <Eye className="w-4 h-4 text-[#4B2A2A]" />
            </span>
          </div>

          {/* Out of Stock */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="font-body text-xs tracking-widest uppercase text-white font-semibold bg-black/50 px-3 py-1">
                Sold Out
              </span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="font-body text-[10px] tracking-wider uppercase bg-vintage-ivory/90 text-vintage-text"
            >
              {product.category}
            </Badge>
          </div>
        </button>

        {/* Info */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-body text-sm font-medium text-foreground truncate">
              {product.name}
            </h3>
            <p
              className="font-body text-base font-semibold mt-0.5"
              style={{ color: "var(--vintage-gold)" }}
            >
              {formatPrice(product.price)}
            </p>
          </div>
          {product.inStock && (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              data-ocid={`products.add_cart_inline.button.${index + 1}`}
              className="flex-shrink-0 mt-0.5 p-2 rounded-full border border-border hover:border-vintage-gold hover:text-vintage-gold transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Product Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent
          className="max-w-2xl bg-vintage-cream"
          data-ocid="product.detail.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {product.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="aspect-[3/4] rounded-lg overflow-hidden">
              {hasImage ? (
                <img
                  src={`/api/v1/blobs/${product.imageId}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: gradient }}
                >
                  <span className="font-display text-6xl font-bold text-white/60">
                    {product.category[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4 py-2">
              <div>
                <Badge
                  variant="secondary"
                  className="font-body text-xs tracking-wider uppercase"
                >
                  {product.category}
                </Badge>
              </div>
              <p
                className="font-display text-3xl font-bold"
                style={{ color: "var(--vintage-gold)" }}
              >
                {formatPrice(product.price)}
              </p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {product.description ||
                  "A beautifully preserved vintage piece with exceptional character and quality."}
              </p>
              <div className="mt-auto">
                {product.inStock ? (
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(product);
                      setDetailOpen(false);
                    }}
                    data-ocid="product.detail.add_to_cart.button"
                    className="w-full font-body text-xs font-semibold tracking-[0.2em] uppercase px-6 py-4 bg-vintage-gold text-vintage-darker hover:bg-vintage-gold-light transition-colors rounded-sm"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="w-full font-body text-xs font-semibold tracking-[0.2em] uppercase px-6 py-4 bg-muted text-muted-foreground text-center rounded-sm">
                    Sold Out
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
