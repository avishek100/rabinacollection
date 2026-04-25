import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Instagram, Facebook, ShieldCheck } from "lucide-react";
import { getStoreInfo } from "@/lib/api";

const Footer = () => {
  const { data: storeInfo } = useQuery({
    queryKey: ["store"],
    queryFn: getStoreInfo,
  });

  const socials = {
    instagram: storeInfo?.socials.find((social) => social.platform === "Instagram")?.url,
    facebook: storeInfo?.socials.find((social) => social.platform === "Facebook")?.url,
    tiktok: storeInfo?.socials.find((social) => social.platform === "TikTok")?.url,
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading text-xl mb-4">{storeInfo?.brand || "Rabina Closet"}</h3>
            <p className="text-sm opacity-80 leading-relaxed">Curated fashion for the modern woman. Style that speaks you.</p>
          </div>
          <div>
            <h4 className="font-medium text-sm uppercase tracking-widest mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[{ to: "/shop", label: "Shop" }, { to: "/about", label: "About" }, { to: "/contact", label: "Contact" }].map((link) => (
                <Link key={link.to} to={link.to} className="block text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transition-all">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm uppercase tracking-widest mb-4">Customer Care</h4>
            <div className="space-y-2 text-sm opacity-80">
              <p>Shipping & Returns</p>
              <p>Size Guide</p>
              <p>FAQs</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm uppercase tracking-widest mb-4">Follow Us</h4>
            <div className="flex gap-4">
              {socials.instagram ? (
                <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="opacity-80 hover:opacity-100 transition-opacity">
                  <Instagram size={20} />
                </a>
              ) : (
                <span aria-label="Instagram" className="opacity-50">
                  <Instagram size={20} />
                </span>
              )}
              {socials.facebook ? (
                <a href={socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="opacity-80 hover:opacity-100 transition-opacity">
                  <Facebook size={20} />
                </a>
              ) : (
                <span aria-label="Facebook" className="opacity-50">
                  <Facebook size={20} />
                </span>
              )}
              {socials.tiktok ? (
                <a href={socials.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" className="opacity-80 hover:opacity-100 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.26 6.26 0 0 0 0 12.52 6.27 6.27 0 0 0 6.26-6.27V8.55a8.16 8.16 0 0 0 3.84.96V6.09a4.84 4.84 0 0 1-1-.1z" /></svg>
                </a>
              ) : (
                <span aria-label="TikTok" className="opacity-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.26 6.26 0 0 0 0 12.52 6.27 6.27 0 0 0 6.26-6.27V8.55a8.16 8.16 0 0 0 3.84.96V6.09a4.84 4.84 0 0 1-1-.1z" /></svg>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs opacity-60">
          <p>&copy; {new Date().getFullYear()} Rabina Closet. All rights reserved.</p>
          <Link to="/admin" className="mt-4 sm:mt-0 hover:opacity-100 transition-opacity flex items-center gap-1">
            <ShieldCheck size={12} />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
