"use client";

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginProps {
  onLogin?: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      // Success
      onLogin ? onLogin() : router.push('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-foreground text-background mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl mb-2">Admin Login</h1>
          <p className="meta text-muted-foreground">
            The Daily Chronicle
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border p-8">
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                // value={email}
                value="admin@dailychronicle.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
                placeholder="admin@dailychronicle.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2">Password</label>
              <input
                type="password"
                // value={password}
                value="admin123"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input focus:border-foreground focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Demo: admin@dailychronicle.com / admin123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
