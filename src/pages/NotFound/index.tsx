import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-faint-fog flex items-center justify-center p-[25px]">
      <div className="text-center max-w-md space-y-[17px]">
        <div className="text-display-lg font-bold text-primary-600 tabular-nums leading-none">
          404
        </div>
        <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600">
          Halaman tidak ditemukan
        </p>
        <h1 className="text-heading-lg font-bold text-deep-slate leading-[1.1] tracking-tight">
          Halaman yang Anda cari<br />tidak tersedia
        </h1>
        <p className="text-body-lg text-graphite">
          Alamat yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link to="/" className="inline-block pt-[13px]">
          <Button
            variant="primary"
            size="lg"
            leadingIcon={<ArrowLeft size={20} strokeWidth={2} />}
          >
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
