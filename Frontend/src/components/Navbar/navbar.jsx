import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import UserMenu from "./DropdownMenu/UserMenu";
import ButtonSignIn from "./ButtonSingin";

export default function Navbar() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsSignedIn(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-3.5 bg-white/80 backdrop-blur-md border-b border-slate-100/80 shadow-sm transition-all">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 group">
        <div className="w-9 h-9 transition-transform duration-500 group-hover:rotate-12">
          <img src="/src/assets/imgfoodwaste/Logofoodwaste.png" alt="logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center tracking-tight">
          <span className="font-black text-lg text-slate-800">Foodwaste</span>
          <span className="font-extrabold text-lg text-emerald-500 sm:ml-0.5">vanish</span>
        </div>
      </Link>

      <div className="hidden md:flex items-center space-x-5 text-base font-semibold text-slate-700">
        {[
          { to: "/browse", label: "Browse Donations" },
          { to: "/mydonations", label: "My Donations" },
          { to: "/received", label: "Received" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="relative px-4 py-2 rounded-full transition-all duration-300 hover:text-emerald-600 hover:bg-slate-50 group"
          >
            {item.label}
            <span className="absolute bottom-1.5 left-4 right-4 h-[2.5px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full" />
          </Link>
        ))}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3.5">
        {/* แสดงเฉพาะตอนล็อกอิน */}
        {isSignedIn && (
          <Link
            to="/donate"
            className="group relative overflow-hidden inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/10 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 select-none"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-white/10 skew-x-[-25deg] -translate-x-full group-hover:animate-[shine_0.75s_ease-in-out]" />
            <span className="relative z-10">
              Donate Food
            </span>
          </Link>
        )}

        {/* กระดิ่งแจ้งเตือน */}
        {isSignedIn && (
          <div className="relative p-1.5 rounded-full text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/60 transition-all duration-300 active:scale-95 cursor-pointer border border-transparent hover:border-emerald-100/50">
            <NotificationBell isSignedIn={isSignedIn} />
          </div>
        )}

        {/* ปุ่ม Sign In หรือ เมนูจัดการโปรไฟล์ (ลบตัวซ้ำด้านล่างออกหมดแล้ว) */}
        <div className="flex items-center justify-center min-w-[40px]">
          {!isSignedIn ? (
            <Link to="/signin" className="flex items-center transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <ButtonSignIn />
            </Link>
          ) : (
            <div className="p-0.5 rounded-full border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all duration-300">
              <UserMenu onSignOut={handleSignOut} />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}