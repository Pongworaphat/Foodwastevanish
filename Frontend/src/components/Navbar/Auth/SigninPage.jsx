import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SigninPage() {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
    <div className="flex justify-center items-center min-h-screen bg-emerald-50">
      <div className="bg-neutral-900 text-white shadow-lg rounded-2xl p-8 w-[380px]">
        <h1 className="text-2xl font-bold text-center mb-6 whitespace-nowrap flex justify-center">
          เข้าสู่ระบบ <span className="ml-1 text-green-400">FoodwasteVanish</span>
        </h1>

        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อผู้ใช้ / อีเมล"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <button className="w-full bg-neutral-800 text-white py-2 rounded-lg">
            ดำเนินการต่อด้วย Facebook
          </button>
          <button className="w-full bg-neutral-800 text-white py-2 rounded-lg">
            ดำเนินการต่อด้วย Google
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          ยังไม่มีบัญชี?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-green-400 cursor-pointer hover:underline"
          >
            สมัครสมาชิก
          </span>
        </p>
      </div>
    </div>
  );
}