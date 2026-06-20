import { Link } from "wouter";
import { Mail, Phone } from "lucide-react";
const logoPath = "/npinc/logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#0E0E0E] border-t border-[#2A2A2A] mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1">
          <img src={logoPath} alt="Nike Pillay Inc" className="h-10 w-auto object-contain mb-6" />
          <p className="text-[#B8B8B8] text-sm leading-relaxed mb-6">
            A premier South African commercial law firm trusted by corporations, investors, and entrepreneurs.
          </p>
          <div className="inline-block border border-[#C6A15B]/40 text-[#C6A15B] text-xs tracking-widest uppercase px-4 py-2 font-medium">
            B-BBEE Level 1 Provider
          </div>
        </div>

        <div>
          <h6 className="text-[#F7F4EE] text-xs uppercase tracking-widest font-semibold mb-6">Practice Areas</h6>
          <ul className="space-y-3 text-sm text-[#B8B8B8]">
            {[
              ["Litigation", "/services/litigation"],
              ["Labour", "/services/labour"],
              ["Property & Conveyancing", "/services/property-conveyancing"],
              ["Corporate & Commercial Law", "/services/corporate-commercial"],
              ["Tax", "/services/tax"],
              ["Project Finance", "/services/project-finance"],
              ["Estate Planning", "/services/estate-planning"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href!} className="hover:text-[#C6A15B] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h6 className="text-[#F7F4EE] text-xs uppercase tracking-widest font-semibold mb-6">Firm</h6>
          <ul className="space-y-3 text-sm text-[#B8B8B8]">
            {[
              ["Our People", "/people"],
              ["Insights", "/insights"],
              ["Events", "/events"],
              ["Awards", "/awards"],
              ["Careers", "/careers"],
              ["Documents", "/documents"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href!} className="hover:text-[#C6A15B] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h6 className="text-[#F7F4EE] text-xs uppercase tracking-widest font-semibold mb-6">Contact</h6>
          <ul className="space-y-4 text-sm text-[#B8B8B8]">
            <li className="flex items-center gap-3">
              <Phone size={14} className="text-[#C6A15B] shrink-0" />
              <a href="tel:0823820843" className="hover:text-[#C6A15B] transition-colors">082 382 0843</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={14} className="text-[#C6A15B] shrink-0" />
              <a href="tel:0871839891" className="hover:text-[#C6A15B] transition-colors">087 183 9891</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={14} className="text-[#C6A15B] shrink-0" />
              <a href="mailto:nike@npinc.co.za" className="hover:text-[#C6A15B] transition-colors">nike@npinc.co.za</a>
            </li>
            <li className="text-[#B8B8B8]">Durban, South Africa</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#2A2A2A] px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#B8B8B8]">
          <p>&copy; {new Date().getFullYear()} Nike Pillay Inc. All rights reserved.</p>
          <Link href="/calculator" className="hover:text-[#C6A15B] transition-colors">
            Conveyancing Calculator
          </Link>
        </div>
      </div>
    </footer>
  );
}
