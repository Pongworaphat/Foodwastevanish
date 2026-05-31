import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function UserMenu({ onSignOut }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const [user, setUser] = useState(null);

  const backendUrl = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_URL)
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:5000";

  const loadUserFromStorage = () => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setUser(null);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.avatar && typeof parsed.avatar === "string") {
        if (parsed.avatar.startsWith("/uploads") || parsed.avatar.startsWith("/")) {
          parsed.avatar = `${backendUrl}${parsed.avatar}`;
        }
      }
      setUser(parsed);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      setUser(null);
    }
  };

  useEffect(() => { loadUserFromStorage(); }, []);

  useEffect(() => {
    const onStorage = (e) => { if (e.key === "user") loadUserFromStorage(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const onUserUpdated = () => loadUserFromStorage();
    window.addEventListener("user:updated", onUserUpdated);
    return () => window.removeEventListener("user:updated", onUserUpdated);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/4140/4140037.png";

  const MenuLink = ({ to, icon, label }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="flex items-center gap-3.5 px-3.5 py-2.5 text-[15px] font-semibold text-slate-600 rounded-xl hover:bg-emerald-50/50 hover:text-emerald-600 transition-all duration-200"
    >
      <div className="w-[18px] h-[18px] opacity-80 flex items-center justify-center">
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(!open)} className="focus:outline-none block rounded-full">
        <img
          src={user?.avatar || defaultAvatar}
          alt="User"
          className="w-9 h-9 rounded-full border border-slate-200 hover:border-emerald-500 hover:scale-105 active:scale-95 transition-all duration-300 object-cover"
          onError={(e) => { e.currentTarget.src = defaultAvatar; }}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2.5 w-80 origin-top-right rounded-2xl border border-slate-100 bg-white p-2.5 shadow-xl shadow-slate-100/70 ring-1 ring-black/5 focus:outline-none animate-fadeIn z-50">
          
          
          <div className="flex items-center gap-3.5 px-3.5 py-3 bg-slate-50/60 rounded-xl mb-2 border border-slate-100/40">
            
            <div className="w-11 h-11 rounded-full overflow-hidden border border-white shadow-sm flex-shrink-0">
              <img
                src={user?.avatar || defaultAvatar}
                alt="User"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = defaultAvatar; }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-slate-800 truncate">
                {user?.username || "ผู้ใช้"}
              </span>
              <span className="text-xs text-slate-400 truncate font-light">
                {user?.email || "—"}
              </span>
            </div>
          </div>

          <div className="my-1.5 border-t border-slate-100" />

          {/* เมนูท่อนที่ 1 */}
          <div className="space-y-0.5">
            <MenuLink 
              to="/profile" 
              label="จัดการโปรไฟล์" 
              icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <MenuLink 
              to="/settings" 
              label="การตั้งค่า" 
              icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
          </div>

          <div className="my-1.5 border-t border-slate-100" />

          {/* เมนูท่อนที่ 2 */}
          <div className="space-y-0.5">
            <MenuLink 
              to="/help" 
              label="ความช่วยเหลือ" 
              icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            <MenuLink 
              to="/feedback" 
              label="ส่งความคิดเห็น" 
              icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              }
            />
          </div>

          <div className="my-1.5 border-t border-slate-100" />

          <div className="p-0.5">
            <button
              onClick={() => {
                setOpen(false);
                if (typeof onSignOut === "function") onSignOut();
              }}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 text-[15px] font-bold text-rose-600 rounded-xl hover:bg-rose-50/60 transition-all duration-150 text-left"
            >
              <div className="w-[18px] h-[18px] flex items-center justify-center">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span>ออกจากระบบ</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}