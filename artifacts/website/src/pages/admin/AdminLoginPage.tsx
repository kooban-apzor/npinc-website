import { useState } from "react";
import { useAdminLogin, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import logoPath from "@assets/np-inc-logo.svg";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAdminLogin();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate({ data: { username, password } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
        setLocation("/admin");
      },
      onError: () => {
        setError("Invalid username or password");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src={logoPath} alt="Nike Pillay Inc" className="h-10 w-auto mx-auto mb-6 object-contain" />
          <p className="text-[#B8B8B8] text-xs uppercase tracking-widest">Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-admin-login">
          <div>
            <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              data-testid="input-admin-username"
              className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 focus:border-[#C6A15B] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              data-testid="input-admin-password"
              className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 focus:border-[#C6A15B] focus:outline-none transition-colors"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm" data-testid="text-login-error">{error}</p>
          )}
          <button
            type="submit"
            disabled={login.isPending}
            data-testid="button-admin-login"
            className="w-full bg-[#C6A15B] text-[#0E0E0E] py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors disabled:opacity-50"
          >
            {login.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-8 text-[#B8B8B8] text-xs">
          <a href="/" className="hover:text-[#C6A15B] transition-colors">← Return to site</a>
        </p>
      </div>
    </div>
  );
}
