import { useState } from "react";
import { useAdminLogin, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
const logoPath = "/npinc/logo.png";

type Mode = "login" | "reset";

export default function AdminLoginPage() {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src={logoPath} alt="Nike Pillay Inc" className="h-10 w-auto mx-auto mb-6 object-contain" />
          <p className="text-[#B8B8B8] text-xs uppercase tracking-widest">Admin Access</p>
        </div>

        {mode === "login" ? (
          <LoginForm onSwitchToReset={() => setMode("reset")} />
        ) : (
          <ResetForm onSwitchToLogin={() => setMode("login")} />
        )}

        <p className="text-center mt-8 text-[#B8B8B8] text-xs">
          <a href="/" className="hover:text-[#C6A15B] transition-colors">← Return to site</a>
        </p>
      </div>
    </div>
  );
}

function LoginForm({ onSwitchToReset }: { onSwitchToReset: () => void }) {
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
    <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-admin-login">
      <div>
        <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          data-testid="input-admin-username"
          autoComplete="username"
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
          autoComplete="current-password"
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
        {login.isPending ? "Signing in…" : "Sign In"}
      </button>

      <p className="text-center pt-2">
        <button
          type="button"
          onClick={onSwitchToReset}
          className="text-[#B8B8B8] text-xs hover:text-[#C6A15B] transition-colors"
        >
          Forgot password?
        </button>
      </p>
    </form>
  );
}

function ResetForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [secretPhrase, setSecretPhrase] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretPhrase, newPassword }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMsg((body as { error?: string }).error ?? "Reset failed. Check your secret phrase.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center space-y-6">
        <div className="border border-[#C6A15B]/30 bg-[#C6A15B]/10 px-6 py-5">
          <p className="text-[#C6A15B] text-sm font-semibold mb-1">Password reset successfully</p>
          <p className="text-[#B8B8B8] text-xs">You can now sign in with your new password.</p>
        </div>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="w-full bg-[#C6A15B] text-[#0E0E0E] py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="border border-[#2A2A2A] bg-[#151515] px-4 py-3 mb-2">
        <p className="text-[#B8B8B8] text-xs leading-relaxed">
          Enter the firm's secret phrase to reset the admin password without needing your current credentials.
        </p>
      </div>

      <div>
        <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Secret Phrase</label>
        <input
          type="password"
          value={secretPhrase}
          onChange={e => setSecretPhrase(e.target.value)}
          required
          autoComplete="off"
          placeholder="Enter the secret phrase"
          className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 focus:border-[#C6A15B] focus:outline-none transition-colors placeholder:text-[#555]"
        />
      </div>
      <div>
        <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="At least 6 characters"
          className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 focus:border-[#C6A15B] focus:outline-none transition-colors placeholder:text-[#555]"
        />
      </div>
      <div>
        <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3">Confirm New Password</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full bg-[#151515] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 focus:border-[#C6A15B] focus:outline-none transition-colors"
        />
      </div>

      {status === "error" && (
        <p className="text-red-400 text-sm">{errorMsg}</p>
      )}

      <button
        type="submit"
        className="w-full bg-[#C6A15B] text-[#0E0E0E] py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors"
      >
        Reset Password
      </button>

      <p className="text-center pt-2">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#B8B8B8] text-xs hover:text-[#C6A15B] transition-colors"
        >
          ← Back to Sign In
        </button>
      </p>
    </form>
  );
}
