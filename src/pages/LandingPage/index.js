import React from "react";
import { Link } from "react-router-dom";
import landingPageImage from "../../assets/img/baby-banner.svg";
import bannerImage from "../../assets/img/banner_item.svg";
import footerImage from "../../assets/img/powered_by_telkom.svg";
import NavbarComp from "../../components/layout/Navbar";
import Button from "../../components/ui/Button";

export default function LandingPage() {
  return (
    <>
      <NavbarComp />
      <main className="min-h-screen bg-faint-fog">
        <div className="max-w-page mx-auto px-[17px] md:px-[25px]">
          <section className="pt-[67px] pb-[50px] md:pt-[90px] md:pb-[67px]">
            <div className="flex flex-col lg:flex-row items-center gap-[50px]">
              <div className="w-full lg:w-1/2">
                <div className="flex flex-col items-start text-left">
                  <span className="text-caption font-semibold uppercase tracking-wider text-primary-600 mb-[13px]">
                    KMS Digital · Posyandu
                  </span>
                  <h1 className="text-heading-lg md:text-display font-bold text-deep-slate leading-[1.1] mb-[17px]">
                    Pantau tumbuh kembang anak,<br />
                    dari posyandu ke genggaman.
                  </h1>
                  <p className="text-body-sm md:text-base text-graphite mb-[29px] max-w-[500px]">
                    Catat pengukuran balita, akses artikel kesehatan, dan ikuti perkembangan gizi anak Anda bersama kader posyandu desa.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-[13px] w-full max-w-[360px]">
                    <Link to="/masuk" className="flex-1">
                      <Button variant="primary" size="lg" className="w-full">
                        Masuk
                      </Button>
                    </Link>
                    <Link to="/sign-up" className="flex-1">
                      <Button variant="default" size="lg" className="w-full">
                        Daftar
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 hidden lg:block">
                <img
                  src={landingPageImage}
                  alt=""
                  className="w-full max-w-[500px] mx-auto"
                />
              </div>
            </div>
          </section>

          <section className="pb-[67px]">
            <div className="w-full md:w-3/4 lg:w-2/3 mx-auto bg-white rounded-default border border-light-ash overflow-hidden">
              <div className="relative aspect-video">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/oYwKLxEDNXU?autoplay=1&mute=1&loop=1&playlist=oYwKLxEDNXU&iv_load_policy=3&rel=0&vq=hd1080"
                  title="Video perkenalan KMS Digital"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>

          <section className="flex justify-center pb-[90px]">
            <img
              src={bannerImage}
              alt=""
              className="w-full max-w-[900px] h-auto"
            />
          </section>
        </div>

        <footer className="border-t border-light-ash bg-white py-[29px]">
          <div className="max-w-page mx-auto px-[17px] md:px-[25px] flex flex-col sm:flex-row items-center justify-between gap-[17px]">
            <p className="text-caption text-graphite">
              © {new Date().getFullYear()} KMS Digital. Seluruh hak cipta dilindungi.
            </p>
            <img
              src={footerImage}
              alt="Didukung oleh Telkom"
              className="h-[32px] w-auto opacity-70"
            />
          </div>
        </footer>
      </main>
    </>
  );
}
