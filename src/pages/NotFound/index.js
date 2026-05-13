import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-faint-fog flex items-center justify-center p-[25px]">
      <div className="text-center max-w-md space-y-[17px]">
        <div className="text-display-lg font-bold text-deep-slate tabular-nums leading-none">404</div>
        <h1 className="text-heading-lg font-bold text-deep-slate">
          Halaman tidak ditemukan
        </h1>
        <p className="text-body-sm text-graphite">
          Alamat yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link to="/" className="inline-block pt-[8px]">
          <Button
            variant="primary"
            size="md"
            leadingIcon={<ArrowLeft size={20} strokeWidth={1.75} />}
          >
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
