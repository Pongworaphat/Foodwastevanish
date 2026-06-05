import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../../assets/imgfoodwaste/Gemini_Generated_Foodwastevanish.png";

export default function SigninPage() {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "เข้าสู่ระบบไม่สำเร็จ");

      localStorage.setItem("authToken", data.token);

      const profileRes = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const profileData = await profileRes.json();
      if (!profileRes.ok)
        throw new Error(profileData.message || "ไม่สามารถโหลดโปรไฟล์ได้");

      const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      if (profileData.user?.avatar && profileData.user.avatar.startsWith("/")) {
        profileData.user.avatar = `${backend}${profileData.user.avatar}`;
      }

      localStorage.setItem("user", JSON.stringify(profileData.user));

      window.dispatchEvent(new Event("user:updated"));

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center lg:justify-between px-6 lg:px-24 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >

      {/* SOFT BLUR OVERLAY */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-black/10 z-0"></div>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-0"></div>

      {/* GLOW */}
      <div className="absolute left-[-150px] top-[120px] w-[500px] h-[500px] bg-emerald-400/20 blur-3xl rounded-full z-0 animate-pulse"></div>

      {/* ส่วนข้อความด้านซ้าย  */}
      <div className="hidden lg:flex flex-col text-white  max-w-2xl z-10 -mt-20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center overflow-hidden">
            <img
              src="/src/assets/imgfoodwaste/Logofoodwaste.png"
              alt="FoodwasteVanish Logo"
              className="w-9 h-9 object-contain"
            />
          </div>
          <div className="flex items-center text-3xl font-black tracking-tight">
            <span className="text-white">Foodwaste</span>
            <span className="text-emerald-400">Vanish</span>
          </div>
        </div>
        <h1 className="text-7xl animate-[fadeIn_1.2s_ease-out] font-black tracking-tight leading-[0.9] text-white">
          ลดขยะอาหาร
          <br />
          <span className="text-emerald-400 block">
            แบ่งปันก่อนจะ
          </span>
          <span className="text-emerald-400 block">
            สูญเปล่า
          </span>
        </h1>

        <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
          แพลตฟอร์มแบ่งปันอาหารส่วนเกิน
          เพื่อช่วยลด Food Waste และส่งต่อมื้ออาหารให้ผู้คนที่ต้องการ
        </p>
      </div>

      {/* ส่วน Card ฟอร์มด้านขวา */}
      <div className="relative z-10 w-full max-w-[420px] hover:scale-[1.01] transition-all duration-500 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-10 shadow-[0_8px_40px_rgba(0,0,0,0.45)] before:absolute before:inset-0 before:rounded-[2.5rem] before:border before:border-white/10 before:pointer-events-none">
        <h2 className="text-3xl font-extrabold text-white text-center mb-8 drop-shadow-md">
          เข้าสู่ระบบ
        </h2>

        <form onSubmit={handleSignIn} className="space-y-5">
          {/* ช่องชื่อผู้ใช้ / อีเมล */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <input
              type="text"
              placeholder="ชื่อผู้ใช้ / อีเมล"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-full focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition"
              required
            />
          </div>

          {/* ช่องรหัสผ่าน */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-full focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700">
              {showPassword ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm text-center font-bold">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold text-lg py-3.5 rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] transition-all duration-300 mt-4"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        {/* ปุ่ม Social */}
        <div className="mt-8 flex justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <button className="w-12 h-12 bg-white/10 border border-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition hover:-translate-y-1">
              <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-6 h-6" />
            </button>
            <span className="text-xs text-white drop-shadow-md">Facebook</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button className="w-12 h-12 bg-white/10 border border-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition hover:-translate-y-1">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
            </button>
            <span className="text-xs text-white drop-shadow-md">Google</span>
          </div>
        </div>

        <p className="text-center text-sm text-white mt-8 drop-shadow-sm">
          ยังไม่มีบัญชี?{" "}
          <span onClick={() => navigate("/signup")} className="text-green-300 font-bold cursor-pointer hover:underline">
            สมัครสมาชิก
          </span>
        </p>
      </div>
      <div className="absolute bottom-20 left-[30%] w-32 h-32 border border-white/10 rounded-full"></div>

      <div className="absolute top-32 left-[45%] w-16 h-16 border border-white/10 rounded-full"></div>
    </div>
  );
}