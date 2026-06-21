import { useState } from "react";
import { useAdminLogin, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ShieldAlert, Lock } from "lucide-react";

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

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm({ onSwitchToReset }: { onSwitchToReset: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [lockMinutes, setLockMinutes] = useState(15);

  const login = useAdminLogin();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAttemptsLeft(null);

    login.mutate({ data: { username, password } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
        setLocation("/admin");
      },
      onError: async (err) => {
        // Try to parse structured error from the response
        const raw = (err as { response?: { data?: unknown } }).response?.data;
        if (raw && typeof raw === "object") {
          const body = raw as Record<string, unknown>;
          if (body["locked"]) {
            setLocked(true);
            const secs = typeof body["secondsLeft"] === "number" ? body["secondsLeft"] : 900;
            setLockMinutes(Math.ceil(secs / 60));
            return;
          }
          if (typeof body["attemptsLeft"] === "number") {
            setAttemptsLeft(body["attemptsLeft"]);
            setError("Invalid username or password.");
            return;
          }
          if (typeof body["error"] === "string") {
            if ((body["error"] as string).toLowerCase().includes("too many")) {
              setLocked(true);
              setLockMinutes(15);
              return;
            }
            setError(body["error"] as string);
            return;
          }
        }
        setError("Invalid username or password.");
      },
    });
  };

  if (locked) {
    return (
      <div className="text-center space-y-6">
        <div className="border border-red-500/30 bg-red-500/10 px-6 py-6">
          <Lock size={28} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-400 text-sm font-semibold mb-2">Access Locked</p>
          <p className="text-[#B8B8B8] text-xs leading-relaxed">
            Too many failed login attempts. Access is temporarily locked for {lockMinutes} minute{lockMinutes !== 1 ? "s" : ""}.
          </p>
          <p className="text-[#555] text-xs mt-3">Please try again later, or use the password reset option below.</p>
        </div>
        <button
          type="button"
          onClick={onSwitchToReset}
          className="w-full border border-[#2A2A2A] text-[#B8B8B8] py-4 text-sm hover:border-[#C6A15B] hover:text-[#C6A15B] transition-colors"
        >
          Reset password with secret phrase →
        </button>
      </div>
    );
  }

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
        <div className="space-y-1">
          <p className="text-red-400 text-sm flex items-center gap-2" data-testid="text-login-error">
            <ShieldAlert size={14} className="shrink-0" /> {error}
          </p>
          {attemptsLeft !== null && attemptsLeft > 0 && (
            <p className="text-[#B8B8B8] text-xs pl-5">
              {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining before a 15-minute lockout.
            </p>
          )}
        </div>
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

// ─── Reset form ───────────────────────────────────────────────────────────────

function ResetForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [secretPhrase, setSecretPhrase] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "rate-limited">("idle");
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
      } else if (res.status === 429) {
        setStatus("rate-limited");
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

  if (status === "rate-limited") {
    return (
      <div className="text-center space-y-6">
        <div className="border border-red-500/30 bg-red-500/10 px-6 py-6">
          <Lock size={28} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-400 text-sm font-semibold mb-2">Too Many Attempts</p>
          <p className="text-[#B8B8B8] text-xs">Too many reset attempts from this IP. Please try again in 1 hour.</p>
        </div>
        <button type="button" onClick={onSwitchToLogin}
          className="w-full border border-[#2A2A2A] text-[#B8B8B8] py-4 text-sm hover:border-[#C6A15B] transition-colors">
          ← Back to Sign In
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
        <p className="text-red-400 text-sm flex items-center gap-2">
          <ShieldAlert size={14} /> {errorMsg}
        </p>
      )}

      <button type="submit"
        className="w-full bg-[#C6A15B] text-[#0E0E0E] py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors">
        Reset Password
      </button>

      <p className="text-center pt-2">
        <button type="button" onClick={onSwitchToLogin}
          className="text-[#B8B8B8] text-xs hover:text-[#C6A15B] transition-colors">
          ← Back to Sign In
        </button>
      </p>
    </form>
  );
}
