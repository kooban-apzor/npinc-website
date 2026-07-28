import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0E0E0E] px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-[#C6A15B]" />
        </div>
        <h1 className="text-6xl font-serif font-bold text-[#F7F4EE] mb-4">404</h1>
        <p className="text-2xl font-serif text-[#F7F4EE] mb-4">Page Not Found</p>
        <p className="text-[#B8B8B8] mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#C6A15B] text-[#0E0E0E] px-6 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors"
        >
          <ArrowLeft size={16} />
          Return Home
        </Link>
      </div>
    </div>
  );
}
