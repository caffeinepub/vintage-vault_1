import { motion } from "motion/react";
import { useState } from "react";
import type { Product } from "../backend.d";
import { useProducts } from "../hooks/useQueries";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const { data: products, isLoading } = useProducts();
  const [showAll, setShowAll] = useState(false);

  const displayProducts = products ?? [];
  const featured = showAll ? displayProducts : displayProducts.slice(0, 8);
  const newArrivals = displayProducts.slice(-4);

  return (
    <>
      {/* Featured Discoveries */}
      <section
        id="featured-products"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-vintage-cream"
        aria-labelledby="featured-heading"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p
              className="font-body text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: "var(--vintage-gold)" }}
            >
              Handpicked for You
            </p>
            <h2
              id="featured-heading"
              className="font-display text-4xl sm:text-5xl font-bold tracking-tight uppercase"
              style={{ color: "var(--vintage-dark)" }}
            >
              Featured Discoveries
            </h2>
            <div
              className="w-16 h-px mx-auto mt-6"
              style={{ background: "var(--vintage-gold)" }}
            />
          </motion.div>

          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8"
            data-ocid="products.list"
          >
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                  <ProductCardSkeleton key={i} />
                ))
              : featured.map((product, i) => (
                  <ProductCard
                    key={String(product.id)}
                    product={product}
                    index={i}
                    onAddToCart={onAddToCart}
                  />
                ))}
          </div>

          {!isLoading && displayProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
              data-ocid="products.empty_state"
            >
              <p className="font-display text-2xl text-muted-foreground mb-3">
                No pieces yet
              </p>
              <p className="font-body text-sm text-muted-foreground">
                Our curators are sourcing new arrivals. Check back soon.
              </p>
            </motion.div>
          )}

          {!isLoading && displayProducts.length > 8 && !showAll && (
            <div className="text-center mt-14">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                data-ocid="products.load_more.button"
                className="font-body text-xs font-semibold tracking-[0.2em] uppercase px-10 py-4 border-2 border-vintage-gold text-vintage-gold hover:bg-vintage-gold hover:text-vintage-darker transition-all rounded-sm"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Editorial Split */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-vintage-tan"
        aria-labelledby="curation-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <img
                src="/assets/generated/vintage-vault-editorial.dim_800x600.jpg"
                alt="The curation process at Vintage Vault"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col gap-6"
            >
              <p
                className="font-body text-xs tracking-[0.3em] uppercase"
                style={{ color: "var(--vintage-gold)" }}
              >
                Behind the Vault
              </p>
              <h2
                id="curation-heading"
                className="font-display text-3xl sm:text-4xl font-bold uppercase leading-tight"
                style={{ color: "var(--vintage-dark)" }}
              >
                The Curation Process
              </h2>
              <div
                className="w-12 h-px"
                style={{ background: "var(--vintage-gold)" }}
              />
              <p
                className="font-body text-base leading-relaxed"
                style={{ color: "var(--vintage-text-muted)" }}
              >
                Every garment in our collection is personally sourced by our
                team of vintage specialists. We travel to estate sales, private
                collections, and specialty markets to find pieces with genuine
                history and enduring style.
              </p>
              <p
                className="font-body text-base leading-relaxed"
                style={{ color: "var(--vintage-text-muted)" }}
              >
                Each item is then carefully authenticated, cleaned, and assessed
                for quality before joining the Vintage Vault. We believe that
                true luxury lies in the stories our clothes carry.
              </p>
              <button
                type="button"
                data-ocid="curation.learn_more.button"
                className="self-start font-body text-xs font-semibold tracking-[0.2em] uppercase px-8 py-4 bg-vintage-dark text-vintage-ivory hover:bg-vintage-darker transition-colors rounded-sm"
              >
                Our Story
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* New Arrivals + Stripe Promo */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-vintage-cream"
        aria-labelledby="arrivals-heading"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p
              className="font-body text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: "var(--vintage-gold)" }}
            >
              Just In
            </p>
            <h2
              id="arrivals-heading"
              className="font-display text-4xl sm:text-5xl font-bold tracking-tight uppercase"
              style={{ color: "var(--vintage-dark)" }}
            >
              New Arrivals
            </h2>
            <div
              className="w-16 h-px mx-auto mt-6"
              style={{ background: "var(--vintage-gold)" }}
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-5" data-ocid="arrivals.list">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                      <ProductCardSkeleton key={i} />
                    ))
                  : newArrivals.length > 0
                    ? newArrivals.map((product, i) => (
                        <ProductCard
                          key={String(product.id)}
                          product={product}
                          index={i}
                          onAddToCart={onAddToCart}
                        />
                      ))
                    : Array.from({ length: 4 }).map((_, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                        <ProductCardSkeleton key={i} />
                      ))}
              </div>
            </div>

            {/* Stripe Promo Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col"
            >
              <div className="bg-vintage-ivory rounded-2xl p-8 shadow-vintage h-full flex flex-col justify-between border border-border">
                <div>
                  <div className="w-10 h-10 rounded-full bg-vintage-gold/20 flex items-center justify-center mb-6">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: "var(--vintage-gold)" }}
                      aria-hidden="true"
                    >
                      <title>Credit card</title>
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <h3
                    className="font-display text-xl font-bold mb-3"
                    style={{ color: "var(--vintage-dark)" }}
                  >
                    Secure Checkout with Stripe
                  </h3>
                  <p
                    className="font-body text-sm leading-relaxed"
                    style={{ color: "var(--vintage-text-muted)" }}
                  >
                    Your payment is protected with industry-leading encryption.
                    We accept all major credit and debit cards.
                  </p>
                </div>
                <div className="mt-8">
                  <p
                    className="font-body text-xs tracking-wider uppercase mb-4"
                    style={{ color: "var(--vintage-text-muted)" }}
                  >
                    Accepted Payments
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["VISA", "MC", "AMEX", "DISCOVER"].map((card) => (
                      <div
                        key={card}
                        className="px-3 py-1.5 rounded border border-border bg-white font-body text-xs font-bold tracking-wider"
                        style={{ color: "var(--vintage-text-muted)" }}
                      >
                        {card}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ color: "var(--vintage-gold)" }}
                      aria-hidden="true"
                    >
                      <title>Security shield</title>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <p
                      className="font-body text-xs"
                      style={{ color: "var(--vintage-text-muted)" }}
                    >
                      256-bit SSL encryption on all transactions
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
