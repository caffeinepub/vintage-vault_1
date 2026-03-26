import { SiFacebook, SiInstagram, SiPinterest, SiX } from "react-icons/si";

interface FooterProps {
  onAdminClick: () => void;
}

const FOOTER_LINKS = [
  "FAQ",
  "Contact Us",
  "Shipping & Returns",
  "Size Guide",
  "Sustainability",
];

export default function Footer({ onAdminClick }: FooterProps) {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer>
      {/* Gold accent band */}
      <div className="h-1 bg-vintage-gold" />

      <div className="bg-vintage-dark py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div className="sm:col-span-1">
              <h2 className="font-display text-2xl font-bold tracking-[0.2em] uppercase text-vintage-ivory mb-4">
                Vintage Vault
              </h2>
              <p className="font-body text-sm leading-relaxed text-vintage-ivory/50 max-w-xs">
                Curating timeless fashion with purpose. Each piece is
                authenticated, preserved, and ready for its next chapter.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-body text-xs tracking-[0.2em] uppercase text-vintage-gold mb-5">
                Information
              </h3>
              <ul className="flex flex-col gap-3">
                {FOOTER_LINKS.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      data-ocid={`footer.${link.toLowerCase().replace(/\s+/g, "_").replace(/[&]/g, "")}.link`}
                      className="font-body text-sm text-vintage-ivory/50 hover:text-vintage-gold transition-colors text-left"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-body text-xs tracking-[0.2em] uppercase text-vintage-gold mb-5">
                Follow Us
              </h3>
              <div className="flex gap-4">
                {[
                  { icon: SiInstagram, label: "Instagram" },
                  { icon: SiFacebook, label: "Facebook" },
                  { icon: SiPinterest, label: "Pinterest" },
                  { icon: SiX, label: "X (Twitter)" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    className="w-9 h-9 rounded-full border border-vintage-ivory/20 flex items-center justify-center text-vintage-ivory/50 hover:border-vintage-gold hover:text-vintage-gold transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-vintage-ivory/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body text-xs text-vintage-ivory/30">
              &copy; {year} Vintage Vault. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-vintage-gold transition-colors"
              >
                caffeine.ai
              </a>
            </p>

            <button
              type="button"
              onClick={onAdminClick}
              data-ocid="footer.store_owner_login.button"
              className="font-body text-xs tracking-[0.15em] uppercase text-vintage-ivory/30 hover:text-vintage-gold transition-colors"
            >
              Store Owner Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
