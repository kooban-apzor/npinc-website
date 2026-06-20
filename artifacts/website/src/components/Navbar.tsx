import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
const logoPath = "/npinc/logo.png";

const navLinks = [
  { href: "/services", label: "Practice Areas" },
  { href: "/people", label: "Our People" },
  { href: "/insights", label: "Insights" },
  { href: "/events", label: "Events" },
  { href: "/awards", label: "Awards" },
  { href: "/calculator", label: "Calculator" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0E0E0E]/95 backdrop-blur-sm border-b border-[#2A2A2A]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        <Link href="/" data-testid="link-logo">
          <img src={logoPath} alt="Nike Pillay Inc" className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8" data-testid="nav-desktop">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-testid={`link-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`text-sm tracking-wide transition-colors duration-200 ${
                location === l.href
                  ? "text-[#C6A15B]"
                  : "text-[#B8B8B8] hover:text-[#C6A15B]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-[#B8B8B8] hover:text-[#C6A15B] transition-colors"
          onClick={() => setOpen(!open)}
          data-testid="button-mobile-menu"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0E0E0E] border-t border-[#2A2A2A] px-6 py-6 flex flex-col gap-5" data-testid="nav-mobile">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-testid={`link-mobile-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[#B8B8B8] hover:text-[#C6A15B] text-base transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
