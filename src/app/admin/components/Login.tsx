"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginProps {
  onLogin?: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Đăng nhập thất bại");
      }

      if (onLogin) {
        onLogin();
      } else {
        router.push("/admin/dashboard");
      }
    } catch (errorValue) {
      console.error(errorValue);
      setError("Sai email hoặc mật khẩu.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-foreground text-background mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl mb-2">Đăng nhập quản trị</h1>
          <p className="meta text-muted-foreground">The Daily Chronicle</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border p-8">
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
                placeholder="admin@mock.local"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Đăng nhập
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">Tài khoản demo: admin@mock.local / mock</p>
          </div>
        </form>
      </div>
    </div>
  );
}
