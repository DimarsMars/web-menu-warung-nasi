"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email atau password salah. Coba lagi ya."
          : `Terjadi kesalahan: ${error.message}`
      );
      setLoading(false);
      return;
    }

    // Sukses — refresh agar middleware membaca session baru, lalu masuk dashboard
    router.refresh();
    router.push("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-warung-krem px-4">
      <div className="animate-fade-up w-full max-w-md">
        {/* Card Login */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-warung-hijau/10 ring-1 ring-stone-200/70">
          {/* Header gradasi */}
          <div className="relative bg-gradient-to-br from-warung-hijau via-warung-hijau-muda to-warung-hijau px-8 py-8 text-center">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-warung-emas/15 blur-2xl" />
            <Image
              src="/logo.svg"
              alt="Logo Warung"
              width={64}
              height={64}
              className="mx-auto rounded-full ring-2 ring-warung-emas"
              priority
            />
            <h1 className="mt-3 text-xl font-extrabold text-white">
              Admin Warung
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Login untuk mengelola menu
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 px-8 py-8">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-warung-hijau-tua"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@warung.com"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-warung-emas focus:bg-white focus:ring-2 focus:ring-warung-emas/30"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-semibold text-warung-hijau-tua"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-warung-emas focus:bg-white focus:ring-2 focus:ring-warung-emas/30"
              />
            </div>

            {/* Pesan Error */}
            {error && (
              <div className="animate-fade-up rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
                ⚠️ {error}
              </div>
            )}

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-warung-hijau to-warung-hijau-muda py-3.5 text-sm font-bold text-warung-emas shadow-lg shadow-warung-hijau/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-warung-hijau/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>
        </div>

        {/* Link kembali */}
        <p className="mt-5 text-center text-sm text-stone-500">
          <Link
            href="/"
            className="font-semibold text-warung-hijau transition-colors hover:text-warung-emas-tua"
          >
            ← Kembali ke halaman menu
          </Link>
        </p>
      </div>
    </main>
  );
}
