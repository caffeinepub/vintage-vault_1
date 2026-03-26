import { motion } from "motion/react";

export default function Hero() {
  const scrollToProducts = () => {
    document
      .getElementById("featured-products")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-[85vh] flex items-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/assets/generated/vintage-vault-hero.dim_1600x900.jpg"
          alt="Vintage Vault Store"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(30,18,15,0.75)] via-[rgba(30,18,15,0.55)] to-[rgba(30,18,15,0.25)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-body text-xs tracking-[0.3em] uppercase text-vintage-gold mb-6"
          >
            New Collection · Spring 2026
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-vintage-ivory leading-[1.05] tracking-tight uppercase mb-6"
          >
            Timeless
            <br />
            Style
            <br />
            <span style={{ color: "var(--vintage-gold)" }}>Reimagined</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-body text-base sm:text-lg text-vintage-ivory/75 leading-relaxed mb-10 max-w-md"
          >
            Discover handpicked vintage garments from the finest eras. Each
            piece tells a story — curated for the discerning collector.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap gap-4"
          >
            <button
              type="button"
              onClick={scrollToProducts}
              data-ocid="hero.shop_now.primary_button"
              className="font-body text-xs font-semibold tracking-[0.2em] uppercase px-8 py-4 bg-vintage-gold text-vintage-darker hover:bg-vintage-gold-light transition-colors rounded-sm"
            >
              Shop Now
            </button>
            <button
              type="button"
              data-ocid="hero.explore.secondary_button"
              className="font-body text-xs font-semibold tracking-[0.2em] uppercase px-8 py-4 border border-vintage-ivory/50 text-vintage-ivory hover:border-vintage-gold hover:text-vintage-gold transition-colors rounded-sm"
            >
              Explore Collections
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
      >
        <div className="w-px h-12 bg-vintage-gold/50 mx-auto" />
      </motion.div>
    </section>
  );
}
