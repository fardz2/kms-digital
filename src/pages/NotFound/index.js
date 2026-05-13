import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-display font-display text-primary mb-4 tabular-nums">404</div>
        <h1 className="text-h1 font-display text-neutral-900 mb-3">
          Halaman tidak ditemukan
        </h1>
        <p className="text-body-lg text-neutral-600 mb-8">
          Alamat yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-tap rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
