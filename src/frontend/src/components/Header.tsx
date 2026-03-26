import { Badge } from "@/components/ui/badge";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

interface HeaderProps {
  cartCount: number;
  onCartOpen: () => void;
  onAdminClick: () => void;
}

const NAV_LINKS = ["Shop", "Collections", "About", "Sale"];

export default function Header({
  cartCount,
  onCartOpen,
  onAdminClick,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearchToggle = () => {
    setSearchOpen((prev) => {
      if (!prev) {
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      return !prev;
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-vintage-dark shadow-vintage">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex-shrink-0">
            <button
              type="button"
              className="font-display text-xl sm:text-2xl font-bold tracking-[0.2em] text-vintage-ivory uppercase cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Vintage Vault
            </button>
          </div>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                type="button"
                data-ocid={`nav.${link.toLowerCase()}.link`}
                className="font-body text-xs font-medium tracking-[0.15em] uppercase text-vintage-ivory/80 hover:text-vintage-gold transition-colors relative group"
              >
                {link}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-vintage-gold transition-all group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSearchToggle}
              data-ocid="header.search_input"
              className="flex items-center gap-1.5 text-vintage-ivory/70 hover:text-vintage-gold transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline font-body text-xs tracking-wider uppercase">
                Search
              </span>
            </button>

            <button
              type="button"
              onClick={onAdminClick}
              data-ocid="header.login.button"
              className="hidden sm:flex items-center gap-1.5 text-vintage-ivory/70 hover:text-vintage-gold transition-colors"
              aria-label="User login"
            >
              <User className="w-4 h-4" />
              <span className="font-body text-xs tracking-wider uppercase">
                Login
              </span>
            </button>

            <button
              type="button"
              onClick={onCartOpen}
              data-ocid="header.cart.button"
              className="relative flex items-center gap-1.5 text-vintage-ivory/70 hover:text-vintage-gold transition-colors"
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-vintage-gold text-[10px] font-bold text-vintage-darker rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-vintage-ivory/70 hover:text-vintage-gold transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-vintage-ivory/10"
            >
              <div className="py-3">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search for vintage pieces…"
                  className="w-full bg-transparent text-vintage-ivory placeholder:text-vintage-ivory/40 font-body text-sm border-b border-vintage-gold/50 pb-2 outline-none focus:border-vintage-gold transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-vintage-darker border-t border-vintage-ivory/10"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link}
                  type="button"
                  data-ocid={`mobile.nav.${link.toLowerCase()}.link`}
                  className="text-left font-body text-sm tracking-[0.12em] uppercase text-vintage-ivory/80 hover:text-vintage-gold transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onAdminClick();
                }}
                data-ocid="mobile.login.button"
                className="text-left font-body text-sm tracking-[0.12em] uppercase text-vintage-ivory/60 hover:text-vintage-gold transition-colors"
              >
                Store Login
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <Badge className="hidden" />
    </header>
  );
}
