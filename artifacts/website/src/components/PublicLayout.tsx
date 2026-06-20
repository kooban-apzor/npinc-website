import Navbar from "./Navbar";
import Footer from "./Footer";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0E0E0E] text-[#F7F4EE]">
      <Navbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
