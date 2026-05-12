import React from "react";
import { Link } from "react-router-dom";
import landingPageImage from "../../assets/img/baby-banner.svg";
import video from "../../assets/video/video_testing.mp4";
import bannerImage from "../../assets/img/banner_item.svg";
import footerImage from "../../assets/img/powered_by_telkom.svg";
import background from "./login_bg.svg";
import NavbarComp from "../../components/layout/Navbar";
import { Container } from "react-bootstrap";
import "./landingPage.css"; // Retain for custom button and description-banner styles

const BackgroundComponent = () => (
  <div
    className="absolute top-[50px] left-0 w-full h-full min-h-screen z-[-10000] bg-no-repeat bg-center bg-cover"
    style={{ backgroundImage: `url(${background})` }}
  />
);

const BannerBackground = () => (
  <div
    className="absolute w-full max-w-[600px] h-auto aspect-[600/629] left-[940px] top-[150px] z-[-1] hidden lg:block"
    style={{
      backgroundImage: `url(${landingPageImage})`,
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
    }}
  />
);

export default function LandingPage() {
  return (
    <>
      <BackgroundComponent />
      <NavbarComp />
      <Container fluid="md">
        <div className=" flex flex-col items-center">
          <div className="flex justify-center w-full mt-[30px]">
            <div
              className="flex flex-col lg:flex-row items-center w-full max-w-[1600px]"
              style={{ backgroundColor: "transparent" }}
            >
              <div className="w-full lg:w-1/2">
                <div className="flex flex-col items-start text-left">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-[#b14444]">
                    Track Your Child's Growth
                  </h2>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-[#b14444]">
                    Anywhere
                  </h2>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-[#b14444]">
                    Anytime
                  </h2>
                  <div className="description-banner text-base sm:text-lg mb-6">
                    Keep track of children's growth and development using
                    GiziBalita
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[300px]">
                    <div className="flex-1">
                      <Link to="/sign-in">
                        <button className="button w-full">Login</button>
                      </Link>
                    </div>
                    <div className="flex-1">
                      <Link to="/sign-up">
                        <button className="button w-full">Sign Up</button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2"></div>
            </div>
          </div>
          <div className="md:w-1/2 w-[80%] mx-auto bg-white rounded-2xl shadow-lg overflow-hidden mt-10">
            <div className="relative aspect-video">
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/oYwKLxEDNXU?autoplay=1&mute=1&loop=1&playlist=oYwKLxEDNXU&iv_load_policy=3&rel=0&vq=hd1080"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="flex justify-center w-full mt-[50px]">
            <img
              src={bannerImage}
              alt="Banner"
              className="w-full max-w-[1180px] h-auto px-4 sm:px-6"
            />
          </div>

          <BannerBackground />
        </div>
      </Container>
      <div className="flex justify-center w-full mt-[100px] bg-[#FFB4B4] py-6">
        <img
          src={footerImage}
          alt="Footer"
          className="w-full max-w-[300px] h-auto"
        />
      </div>
    </>
  );
}
