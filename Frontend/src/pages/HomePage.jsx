import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import HomeMap from "./HomeMap";


const slides = [
  {
    id: 1,
    englishTitle: "Share Food,",
    gradientTitle: "Share Love.",
    thaiDesc: "เชื่อมโยงผู้ให้กับผู้รับ เพื่อลดขยะอาหารและส่งต่อคุณค่า ผ่านการแบ่งปันอาหารส่วนเกิน อาหารสำหรับสัตว์จร และขยะอินทรีย์เพื่อการทำปุ๋ยหมัก",
    imgSrc: "/src/assets/imgfoodwaste/ShareFood.png"
  },
  {
    id: 2,
    englishTitle: "Transform Surplus,",
    gradientTitle: "Redefine Giving.",
    thaiDesc: "เปลี่ยนทุกเศษขยะอินทรีย์และวัตถุดิบเหลือใช้ ให้กลายเป็นทรัพยากรใหม่ คืนความสมบูรณ์และต่อชีวิตให้ธรรมชาติ",
    imgSrc: "/src/assets/imgfoodwaste/TransformSurplus.png"
  },
  {
    id: 3,
    englishTitle: "Care for Strays,",
    gradientTitle: "Share Your Heart.",
    thaiDesc: "มอบอาหารและความห่วงใยให้สัตว์จร เพราะทุกมื้อที่แบ่งปัน อาจเป็นความหวังของอีกหนึ่งชีวิต",
    imgSrc: "/src/assets/imgfoodwaste/CareforStrays.png"
  },
  {
    id: 4,
    englishTitle: "Rethink Waste,",
    gradientTitle: "Protect Tomorrow.",
    thaiDesc: "เริ่มต้นลดขยะอาหารวันนี้ เพื่อสร้างอนาคตที่สะอาด ยั่งยืน และดีต่อโลกในวันข้างหน้า",
    imgSrc: "/src/assets/imgfoodwaste/RethinkWaste.png"
  }
];

export default function Homepage() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const checkSignedIn = () => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    setIsSignedIn(Boolean(token || user));
  };

  useEffect(() => {
    checkSignedIn();
  }, [location]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authToken" || e.key === "user") {
        checkSignedIn();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      handleAutoPlay();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, isAnimating]);

  const handleAutoPlay = () => {
    if (isAnimating) return;
    const nextIndex = (currentSlide + 1) % slides.length;
    executeSlideChange(nextIndex);
  };

  const executeSlideChange = (nextIndex) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(nextIndex);
      setIsAnimating(false);
    }, 500);
  };

  const handleSlideChange = (nextIndex) => {
    if (nextIndex === currentSlide || isAnimating) return;
    executeSlideChange(nextIndex);
  };

  return (
    <div className="min-h-screen bg-emerald-50">
      <header className="relative overflow-hidden bg-white hero-grain">
        <div className="absolute inset-0 overflow-hidden" />
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-200/30 rounded-full blur-3xl animate-aurora" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[42rem] h-[42rem] bg-green-200/20 rounded-full blur-3xl animate-aurora [animation-delay:4s]" />
        <div className="absolute top-[30%] left-[40%] w-[22rem] h-[22rem] bg-lime-100/30 rounded-full blur-3xl animate-float-slow" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* ลูกคนที่ 1 ของ Grid: เนื้อหาและปุ่มฝั่งซ้าย */}
            <div>
              <p className="inline-flex items-center text-emerald-700 font-medium rounded-full bg-white/80 px-4 py-1.5 border border-emerald-100 shadow-sm mb-6 backdrop-blur-md">
                Zero Waste • Infinite Impact
              </p>

              <div
                className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAnimating
                  ? "opacity-0 blur-[2px] translate-y-1"
                  : "opacity-100 blur-0 translate-y-0"
                  }`}
              >
                <h1 className="text-5xl sm:text-6xl min-h-[170px] font-bold leading-tight tracking-tight text-emerald-950">
                  <span className="block">
                    {slides[currentSlide].englishTitle}
                  </span>
                  <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300">
                    {slides[currentSlide].gradientTitle}
                  </span>
                </h1>

                <p className="text-lg text-slate-500 max-w-xl leading-relaxed mt-5">
                  {slides[currentSlide].thaiDesc}
                </p>
              </div>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/browse"
                  className="group relative overflow-hidden inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-white font-medium shadow-lg shadow-emerald-500/20 hover:scale-105 hover:bg-emerald-700 transition-all duration-300"
                >
                  <span className="relative z-10">Browse Donations</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>

                {isSignedIn && (
                  <Link
                    to="/donate"
                    className="inline-flex items-center justify-center rounded-full px-6 py-3 font-medium border border-emerald-200 text-emerald-800 bg-white/70 backdrop-blur-md hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    Start Donating
                  </Link>
                )}
              </div>
            </div>

            {/* ลูกคนที่ 2 ของ Grid: สไลเดอร์รูปภาพฝั่งขวา (แยกออกมาอยู่นอกฝั่งซ้ายแล้ว) */}
            <div className="relative flex justify-center">
              <div className="relative w-full rounded-[2rem] overflow-hidden border border-white/40 bg-white/30 backdrop-blur-2xl shadow-[0_10px_50px_rgba(16,185,129,0.10)] group">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/5 to-transparent pointer-events-none z-10" />
                <div className="absolute -top-20 -left-20 w-40 h-[140%] rotate-12 bg-white/10 blur-2xl group-hover:translate-x-[500%] transition-transform duration-[2500ms]" />

                <img
                  src={slides[currentSlide].imgSrc}
                  alt={slides[currentSlide].englishTitle}
                  className={`w-full object-cover h-96 md:h-[430px] transition-all duration-700 group-hover:scale-[1.03] ${isAnimating ? "opacity-40 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"}`}
                />

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-lg z-20">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => handleSlideChange(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-7 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" : "w-2 bg-white/60 hover:bg-white"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-emerald-900">
              📍 Active Food Donations
            </h2>

            <p className="text-slate-500 mt-2">
              Discover available food donations around your area
            </p>
          </div>

          <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 p-5 overflow-hidden">
            <HomeMap />
          </div>

        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-8 text-center shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform-gpu hover:rotate-1 hover:scale-105">
              <h2 className="text-4xl font-black text-emerald-500">12K+</h2>
              <p className="mt-3 text-gray-600 font-medium">Meals Saved</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-8 text-center shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform-gpu hover:rotate-1 hover:scale-105">
              <h2 className="text-4xl font-black text-emerald-500">4.5K+</h2>
              <p className="mt-3 text-gray-600 font-medium">Active Donors</p>
            </div>
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-8 text-center shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform-gpu hover:rotate-1 hover:scale-105">
              <h2 className="text-4xl font-black text-emerald-500">8 Tons</h2>
              <p className="mt-3 text-gray-600 font-medium">Food Waste Reduced</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl font-semibold mb-2 animate-reveal">Platform Features</h2>
          <p className="text-gray-500 mb-10">Built for safety, convenience, and trust</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            <Feature title="User Verification" desc="All users are verified through phone, email, or social media for safe transactions" icon={shieldIcon} />
            <Feature title="GPS Integration" desc="Easy location sharing and pickup coordination with built-in maps" icon={pinIcon} />
            <Feature title="Review System" desc="Rate and review users to build trust and transparency in the community" icon={starIcon} />
            <Feature title="Organization Accounts" desc="Special accounts for charities, schools, and community centers" icon={usersIcon} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-48 h-48 bg-emerald-300/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-48 h-48 bg-teal-300/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white py-10 px-6 text-center shadow-[0_15px_40px_rgba(16,185,129,0.25)] border border-emerald-400/10 group">
            <div className="absolute -top-20 -left-20 w-36 h-36 bg-white/15 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-emerald-400/20 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 max-w-xl mx-auto">
              {isSignedIn ? (
                <>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200 font-semibold mb-2.5 bg-emerald-950/40 inline-block px-3 py-1 rounded-full border border-emerald-400/10 backdrop-blur-sm">
                    Change Maker
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight drop-shadow-sm">
                    Ready for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-green-100">A Greener Tomorrow?</span>
                  </h3>
                  <p className="mb-6 text-sm text-emerald-100/80 font-light leading-relaxed">
                    ร่วมสร้างคุณค่าใหม่ให้เศษอาหารส่วนเกิน และส่งต่อสิ่งดีๆ ไปกับเราในวันนี้
                  </p>
                  <div className="inline-block transform-gpu active:scale-95 transition-transform">
                    <Link to="/browse" className="inline-flex items-center justify-center bg-white text-emerald-800 px-7 py-2.5 rounded-full text-sm font-bold shadow-[0_8px_20px_rgba(11,66,48,0.2)] hover:bg-emerald-50 hover:-translate-y-0.5 transition-all duration-300 gap-1.5 tracking-wide">
                      Explore Today’s Donations
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight drop-shadow-sm">
                    Join Our Community Today
                  </h3>
                  <p className="mb-6 text-sm text-emerald-50/90 font-light">
                    Start making a difference by sharing food and reducing waste
                  </p>
                  <div className="inline-block transform-gpu active:scale-95 transition-transform">
                    <Link to="/signup" className="inline-flex items-center justify-center bg-white text-emerald-700 px-7 py-2.5 rounded-full text-sm font-semibold shadow-[0_8px_20px_rgba(25,114,83,0.15)] hover:bg-emerald-50 hover:-translate-y-0.5 transition-all duration-300 gap-1.5">
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col items-center text-center">
      <div className="mb-5 flex justify-center items-center">
        <div className="w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] rounded-2xl bg-emerald-100 group-hover:scale-110 group-hover:bg-emerald-200 transition-all duration-300 flex items-center justify-center">
          <div className="w-[26px] h-[26px] flex items-center justify-center text-emerald-600">
            <svg
              className="w-full h-full object-contain"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              dangerouslySetInnerHTML={{ __html: icon }}
            />
          </div>
        </div>
      </div>
      <h4 className="font-semibold mb-2 text-gray-800 tracking-tight">{title}</h4>
      <p className="text-sm text-gray-400 leading-relaxed font-light">{desc}</p>
    </div>
  );
}

const shieldIcon = `<path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 2l7 3v5c0 5-3 9-7 11-4-2-7-6-7-11V5l7-3z" />`;
const pinIcon = `<path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 2c3 0 7 3.5 7 8.5 0 5.5-5 9.5-7 11-2-1.5-7-5.5-7-11C5 5.5 9 2 12 2z" />`;
const starIcon = `<path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />`;
const usersIcon = `<path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />`;