import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      let token = data.token || null;

      if (!token) {
        const signinRes = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernameOrEmail: email, password }),
        });

        const signinData = await signinRes.json();
        if (!signinRes.ok) throw new Error(signinData.message || "Auto sign-in failed after signup");
        token = signinData.token;
      }

      if (!token) throw new Error("No token received after signup/signin");

      localStorage.setItem("authToken", token);

      const profileRes = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.message || "Failed to load profile");

      if (profileData.user?.avatar && profileData.user.avatar.startsWith("/")) {
        profileData.user.avatar = `${backend}${profileData.user.avatar}`;
      }

      localStorage.setItem("user", JSON.stringify(profileData.user));
      window.dispatchEvent(new Event("user:updated"));

      setLoading(false);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "สมัครสมาชิกไม่สำเร็จ");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-emerald-50">
      <div className="bg-neutral-900 text-white shadow-lg rounded-2xl p-8 w-[380px]">
        <h1 className="text-2xl font-bold text-center mb-6 whitespace-nowrap flex justify-center">
          สมัครสมาชิก <span className="ml-1 text-green-400">FoodwasteVanish</span>
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อผู้ใช้งาน"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 
               focus:outline-none focus:ring-2 focus:ring-green-500 pr-12"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? (
                // ไอคอน hide (eye-slash)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.45 10.45 0 001.5 12c2.1 4.085 6.56 7.5 10.5 7.5 1.65 0 3.3-.45 4.8-1.305M7.362 7.362A4.492 4.492 0 0112 7.5c2.485 0 4.5 2.015 4.5 4.5 0 .793-.21 1.536-.577 2.185M3 3l18 18" />
                </svg>
              ) : (
                // ไอคอน show (eye)
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322c1.3 4.416 5.33 7.678 9.964 7.678 4.636 0 8.665-3.262 9.964-7.678C20.665 7.906 16.636 4.644 12 4.644c-4.635 0-8.664 3.262-9.964 7.678z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
                </svg>
              )}
            </button>
          </div>


          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
          >
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>

          <div className="mt-6 space-y-2">
            <button type="button" className="w-full bg-neutral-800 text-white py-2 rounded-lg">
              ดำเนินการต่อด้วย Facebook
            </button>
            <button type="button" className="w-full bg-neutral-800 text-white py-2 rounded-lg">
              ดำเนินการต่อด้วย Google
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          มีบัญชีอยู่แล้ว?{" "}
          <span
            onClick={() => navigate("/signin")}
            className="text-green-400 cursor-pointer hover:underline"
          >
            เข้าสู่ระบบ
          </span>
        </p>
      </div>
    </div>
  );
} 