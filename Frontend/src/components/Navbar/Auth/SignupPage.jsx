import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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