import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Users,
  Stethoscope,
  Building2,
  CheckCircle2,
  BookOpen,
  BarChart3,
  Sparkles,
} from "lucide-react";
import landingPageImage from "../../assets/img/baby-banner.svg";
import NavbarComp from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";

const ROLES = [
  {
    Icon: Heart,
    title: "Orang Tua",
    desc: "Pantau berat badan, tinggi, dan status gizi anak Anda dari rumah.",
  },
  {
    Icon: Users,
    title: "Kader Posyandu",
    desc: "Catat pengukuran balita setiap bulan dengan form yang ramah HP.",
  },
  {
    Icon: Stethoscope,
    title: "Tenaga Kesehatan",
    desc: "Jawab pertanyaan orang tua, pantau balita perlu perhatian khusus.",
  },
  {
    Icon: Building2,
    title: "Pemerintah Desa",
    desc: "Lihat rekap gizi se-desa, unduh laporan CSV dan PDF untuk rapat bulanan.",
  },
];

const FEATURES = [
  {
    Icon: BookOpen,
    title: "Artikel kesehatan terkurasi",
    desc: "Bacaan singkat tentang gizi, imunisasi, dan tumbuh kembang balita, ditulis oleh tenaga kesehatan desa.",
  },
  {
    Icon: BarChart3,
    title: "Laporan bulanan otomatis",
    desc: "Rekap partisipasi posyandu, sebaran status gizi, dan daftar balita perlu perhatian khusus.",
  },
  {
    Icon: CheckCircle2,
    title: "Persetujuan berlapis",
    desc: "Kader meninjau pendaftaran orang tua dan anak baru sebelum masuk ke sistem.",
  },
];

const STATS = [
  { value: "1", label: "Desa Posyandu", eyebrow: "Lebakwangi" },
  { value: "4", label: "Peran pengguna", eyebrow: "Terintegrasi" },
  { value: "100%", label: "Berbahasa Indonesia", eyebrow: "Ramah Kader" },
];

export default function LandingPage() {
  return (
    <>
      <NavbarComp />
      <main className="bg-faint-fog">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #b32e2e 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative max-w-page mx-auto px-[17px] md:px-[25px] pt-[67px] pb-[84px] md:pt-[95px] md:pb-[134px]">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-[50px] items-center">
              <div>
                <span className="inline-flex items-center gap-[8px] text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[25px]">
                  <Sparkles size={14} strokeWidth={2.25} />
                  KMS Digital · Posyandu Lebakwangi
                </span>
                <h1 className="text-display md:text-display-lg font-bold text-deep-slate leading-[0.98] tracking-tight mb-[25px]">
                  Tumbuh kembang anak,{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10">lebih tenang</span>
                    <span
                      aria-hidden
                      className="absolute left-0 right-0 bottom-[8px] h-[14px] bg-primary-200/70 -z-0"
                    />
                  </span>
                  <br />
                  dipantau dari{" "}
                  <span className="text-primary-600">genggaman.</span>
                </h1>
                <p className="text-body-lg text-graphite mb-[33px] max-w-[560px] leading-relaxed">
                  Catat pengukuran balita, akses artikel kesehatan, dan ikuti
                  perkembangan gizi anak bersama kader posyandu desa Anda —
                  dalam satu aplikasi sederhana.
                </p>
                <div className="flex flex-col sm:flex-row gap-[13px] max-w-[420px]">
                  <Link to="/masuk" className="flex-1">
                    <Button
                      variant="primary"
                      size="lg"
                      trailingIcon={<ArrowRight size={20} strokeWidth={2.25} />}
                      className="w-full"
                    >
                      Masuk ke Akun
                    </Button>
                  </Link>
                  <Link to="/sign-up" className="flex-1">
                    <Button variant="default" size="lg" className="w-full">
                      Daftar Baru
                    </Button>
                  </Link>
                </div>
                <div className="mt-[33px] flex items-center gap-[17px] text-caption text-graphite">
                  <div className="flex items-center gap-[6px]">
                    <CheckCircle2
                      size={16}
                      strokeWidth={2.25}
                      className="text-success"
                    />
                    Gratis untuk warga
                  </div>
                  <div className="w-[1px] h-[14px] bg-light-ash" />
                  <div className="flex items-center gap-[6px]">
                    <CheckCircle2
                      size={16}
                      strokeWidth={2.25}
                      className="text-success"
                    />
                    Diperbarui tiap bulan
                  </div>
                </div>
              </div>

              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-[25px] bg-primary-50/60 rounded-default -z-10 hidden lg:block"
                />
                <img
                  src={landingPageImage}
                  alt=""
                  className="relative w-full max-w-[520px] mx-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="bg-white border-y border-light-ash">
          <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-light-ash">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`py-[17px] md:py-0 ${i === 0 ? "md:pl-0" : "md:pl-[33px]"} ${i === STATS.length - 1 ? "md:pr-0" : "md:pr-[33px]"}`}
                >
                  <p className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[6px]">
                    {s.eyebrow}
                  </p>
                  <div className="flex items-baseline gap-[13px]">
                    <span className="text-display font-bold text-deep-slate tabular-nums leading-none">
                      {s.value}
                    </span>
                    <span className="text-body-sm text-graphite">
                      {s.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="max-w-page mx-auto px-[17px] md:px-[25px] py-[67px] md:py-[95px]">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-[50px] mb-[50px]">
            <div>
              <p className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[13px]">
                Untuk Semua Peran
              </p>
              <h2 className="text-heading-lg md:text-display font-bold text-deep-slate leading-[1.05] tracking-tight">
                Satu aplikasi,
                <br />
                <span className="text-primary-600">empat cara</span> memakai.
              </h2>
            </div>
            <p className="text-body-lg text-graphite leading-relaxed md:pt-[25px]">
              KMS Digital dirancang untuk semua orang yang terlibat dalam
              perjalanan gizi balita di desa — orang tua, kader, bidan, dan
              pemerintah desa. Satu akun, sesuai peran.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[17px]">
            {ROLES.map(({ Icon, title, desc }, i) => (
              <article
                key={title}
                className="group relative bg-white border border-light-ash rounded-default p-[29px] transition-all duration-150 ease-out-quart hover:border-primary-300 hover:shadow-card"
              >
                <div className="flex items-start gap-[17px]">
                  <span className="flex items-center justify-center w-[52px] h-[52px] rounded-full bg-primary-50 text-primary-600 shrink-0 transition-colors group-hover:bg-primary-500 group-hover:text-white">
                    <Icon size={24} strokeWidth={2} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-bold uppercase tracking-[0.12em] text-graphite mb-[6px]">
                      Peran {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="text-heading font-bold text-deep-slate mb-[8px] tracking-tight">
                      {title}
                    </h3>
                    <p className="text-body-sm text-graphite leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Features — editorial list */}
        <section className="bg-white border-y border-light-ash">
          <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[67px] md:py-[95px]">
            <div className="max-w-[720px] mb-[50px]">
              <p className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[13px]">
                Yang Anda Dapatkan
              </p>
              <h2 className="text-heading-lg md:text-display font-bold text-deep-slate leading-[1.05] tracking-tight mb-[17px]">
                Dirancang untuk kader yang sibuk,
                <br />
                <span className="text-primary-600">bukan untuk insinyur</span>.
              </h2>
              <p className="text-body-lg text-graphite leading-relaxed">
                Tombol besar. Teks jelas. Bahasa Indonesia sehari-hari.
                Aplikasinya mengikuti alur posyandu, bukan sebaliknya.
              </p>
            </div>

            <div className="border-t border-light-ash">
              {FEATURES.map(({ Icon, title, desc }, i) => (
                <article
                  key={title}
                  className="grid grid-cols-[auto_1fr_auto] items-start gap-[25px] py-[33px] border-b border-light-ash"
                >
                  <div className="text-display font-bold text-primary-200 tabular-nums leading-none select-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="pt-[8px]">
                    <h3 className="text-heading font-bold text-deep-slate mb-[8px] tracking-tight">
                      {title}
                    </h3>
                    <p className="text-body-sm text-graphite leading-relaxed max-w-[560px]">
                      {desc}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center justify-center w-[52px] h-[52px] rounded-full bg-primary-50 text-primary-600 mt-[6px]">
                    <Icon size={22} strokeWidth={2} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-page mx-auto px-[17px] md:px-[25px] py-[67px] md:py-[95px]">
          <div className="relative bg-deep-slate rounded-default overflow-hidden px-[33px] py-[50px] md:px-[67px] md:py-[84px]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-[33px] items-end">
              <div className="max-w-[640px]">
                <p className="text-caption font-bold uppercase tracking-[0.14em] text-primary-300 mb-[17px]">
                  Mulai Hari Ini
                </p>
                <h2 className="text-heading-lg md:text-display font-bold text-white leading-[1.05] tracking-tight">
                  Akun untuk orang tua dan kader
                  <br />
                  <span className="text-primary-300">siap dibuat.</span>
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-[13px] md:shrink-0">
                <Link to="/sign-up">
                  <Button
                    variant="primary"
                    size="lg"
                    trailingIcon={<ArrowRight size={20} strokeWidth={2.25} />}
                  >
                    Daftar Sekarang
                  </Button>
                </Link>
                <Link to="/masuk">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="!text-white hover:!bg-white/10"
                  >
                    Sudah punya akun
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-light-ash bg-white">
          <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] flex flex-col sm:flex-row items-center justify-between gap-[17px]">
            <div>
              <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600">
                KMS Digital
              </p>
              <p className="text-caption text-graphite mt-1">
                © {new Date().getFullYear()} Posyandu Lebakwangi. Seluruh hak cipta dilindungi.
              </p>
            </div>
            <nav className="flex items-center gap-[25px] text-body-sm text-graphite">
              <Link to="/artikel" className="hover:text-deep-slate transition-colors">
                Artikel
              </Link>
              <Link to="/masuk" className="hover:text-deep-slate transition-colors">
                Masuk
              </Link>
              <Link to="/sign-up" className="hover:text-deep-slate transition-colors">
                Daftar
              </Link>
            </nav>
          </div>
        </footer>
      </main>
    </>
  );
}
