import React from "react";
import { Link } from "react-router-dom";
import landingPageImage from "../../assets/img/baby-banner.svg";
import bannerImage from "../../assets/img/banner_item.svg";
import footerImage from "../../assets/img/powered_by_telkom.svg";
import background from "./login_bg.svg";
import NavbarComp from "../../components/layout/Navbar";

export default function LandingPage() {
  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${background})` }}
      />
      <NavbarComp />
      <main className="relative min-h-screen">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center pt-8 md:pt-16">
            <div className="flex flex-col lg:flex-row items-center w-full max-w-6xl gap-8">
              <div className="w-full lg:w-1/2">
                <div className="flex flex-col items-start text-left">
                  <h1 className="text-h1 md:text-display font-display text-primary-700 leading-tight mb-4">
                    Pantau Tumbuh Kembang Anak
                    <br />
                    Kapan Saja, Di Mana Saja
                  </h1>
                  <p className="text-body-lg text-neutral-700 mb-8 max-w-md">
                    Catat pengukuran balita dan ikuti perkembangan gizi dengan
                    KMS Digital.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    <Link to="/masuk" className="flex-1">
                      <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 min-h-[3.5rem] rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold text-body-lg shadow-raised active:scale-[0.98] transition-all duration-150 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2">
                        Masuk
                      </button>
                    </Link>
                    <Link to="/sign-up" className="flex-1">
                      <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 min-h-[3.5rem] rounded-button bg-white hover:bg-primary-50 text-primary-700 border border-primary-200 font-display font-semibold text-body-lg active:scale-[0.98] transition-all duration-150 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2">
                        Daftar
                      </button>
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

            <div className="w-full md:w-3/4 lg:w-1/2 mx-auto bg-white rounded-card shadow-card overflow-hidden mt-12">
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

            <div className="flex justify-center w-full mt-12 px-4">
              <img
                src={bannerImage}
                alt=""
                className="w-full max-w-5xl h-auto"
              />
            </div>
          </div>
        </div>

        <footer className="flex justify-center w-full mt-20 bg-primary-300 py-6">
          <img
            src={footerImage}
            alt="Didukung oleh Telkom"
            className="w-full max-w-[280px] h-auto"
          />
        </footer>
      </main>
    </>
  );
}
