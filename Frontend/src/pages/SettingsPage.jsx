import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [language, setLanguage] = useState("th");
  const [prefsSaved, setPrefsSaved] = useState("");

  const [passwordStrength, setPasswordStrength] = useState("");

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem("settings:prefs") || "{}");
      if (prefs.emailNotifications !== undefined) setEmailNotifications(prefs.emailNotifications);
      if (prefs.pushNotifications !== undefined) setPushNotifications(prefs.pushNotifications);
      if (prefs.language) setLanguage(prefs.language);
    } catch (e) {
      // ignore
    }
  }, []);

  function checkStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return "weak";
    if (score === 2) return "medium";
    return "strong";
  }

  // ---- UPDATED handlePasswordSubmit: checks token, logs, sends Authorization header ----
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("รหัสผ่านใหม่กับยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    const strength = checkStrength(newPassword);
    if (strength === "weak") {
      setPasswordError("รหัสผ่านอ่อนเกินไป — กรุณาใช้รหัสผ่านที่ยาวขึ้นและรวมตัวอักษร/ตัวเลข/สัญลักษณ์");
      return;
    }

    // get token from localStorage (adjust key if your app uses different key)
    const token = localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("userToken");
    console.log("DEBUG: token from localStorage:", token);

    if (!token) {
      setPasswordError("No token provided");
      console.warn("No token found in localStorage. Ensure login stores the token (localStorage.setItem('token', data.token)).");
      return;
    }

    try {
      // If frontend origin != backend origin, replace the URL with full backend URL:
      // e.g. const url = "http://localhost:5000/api/users/change-password";
      const url = "/api/users/change-password";

      console.log("DEBUG: Sending request to:", url);
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // important
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      console.log("DEBUG: fetch response status:", res.status);
      const data = await res.json().catch(() => ({}));
      console.log("DEBUG: fetch response body:", data);

      if (!res.ok) {
        // server returned error message
        setPasswordError(data.message || `Error ${res.status}`);
        return;
      }

      setPasswordSuccess("เปลี่ยนรหัสผ่านสำเร็จ");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength("");
    } catch (err) {
      console.error("fetch error:", err);
      setPasswordError("เซิร์ฟเวอร์มีปัญหา โปรดลองใหม่ภายหลัง");
    }
  }

  function handlePrefsSave() {
    const prefs = { emailNotifications, pushNotifications, language };
    localStorage.setItem("settings:prefs", JSON.stringify(prefs));
    setPrefsSaved("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    setTimeout(() => setPrefsSaved(""), 3000);
  }

  const EyeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322c1.3 4.416 5.33 7.678 9.964 7.678 4.636 0 8.665-3.262 9.964-7.678C20.665 7.906 16.636 4.644 12 4.644c-4.635 0-8.664 3.262-9.964 7.678z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
    </svg>
  );

  const EyeOffIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.45 10.45 0 001.5 12c2.1 4.085 6.56 7.5 10.5 7.5 1.65 0 3.3-.45 4.8-1.305M7.362 7.362A4.492 4.492 0 0112 7.5c2.485 0 4.5 2.015 4.5 4.5 0 .793-.21 1.536-.577 2.185M3 3l18 18" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">การตั้งค่า</h1>

        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">เปลี่ยนรหัสผ่าน</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* รหัสผ่านปัจจุบัน */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านปัจจุบัน</label>

              <div className="mt-1 relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <div className="absolute inset-y-0 right-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowCurrent((s) => !s)}
                    className="text-gray-400 hover:text-gray-600 transition transform hover:scale-110"
                    aria-label={showCurrent ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showCurrent ? EyeOffIcon : EyeIcon}
                  </button>
                </div>
              </div>
            </div>

            {/* รหัสผ่านใหม่ */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านใหม่</label>

              <div className="mt-1 relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordStrength(checkStrength(e.target.value));
                  }}
                  placeholder="กรอกรหัสผ่านใหม่"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <div className="absolute inset-y-0 right-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="text-gray-400 hover:text-gray-600 transition transform hover:scale-110"
                    aria-label={showNew ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showNew ? EyeOffIcon : EyeIcon}
                  </button>
                </div>
              </div>

              {/* Strength indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-40 h-2 rounded bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full transition-all`}
                        style={{
                          width:
                            passwordStrength === "weak"
                              ? "33%"
                              : passwordStrength === "medium"
                                ? "66%"
                                : passwordStrength === "strong"
                                  ? "100%"
                                  : "0%",
                          background:
                            passwordStrength === "weak"
                              ? "#ef4444"
                              : passwordStrength === "medium"
                                ? "#d97706"
                                : "#16a34a",
                        }}
                      />
                    </div>
                    <div className={`text-sm ${passwordStrength === "weak" ? "text-red-600" :
                      passwordStrength === "medium" ? "text-yellow-700" : "text-green-600"
                      }`}>
                      {passwordStrength === "weak" && "Weak"}
                      {passwordStrength === "medium" && "Medium"}
                      {passwordStrength === "strong" && "Strong"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ยืนยันรหัสผ่านใหม่ */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่านใหม่</label>

              <div className="mt-1 relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <div className="absolute inset-y-0 right-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="text-gray-400 hover:text-gray-600 transition transform hover:scale-110"
                    aria-label={showConfirm ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showConfirm ? EyeOffIcon : EyeIcon}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-start mt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-black text-white rounded-lg shadow hover:opacity-95"
              >
                บันทึกรหัสผ่านใหม่
              </button>
            </div>

            {passwordError && <div className="text-sm text-red-600">{passwordError}</div>}
            {passwordSuccess && <div className="text-sm text-green-600">{passwordSuccess}</div>}
          </form>
        </div>

        {/* Notifications card */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">การแจ้งเตือน</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">แจ้งเตือนทางอีเมล</div>
                <div className="text-xs text-gray-500">รับการแจ้งเตือนผ่านอีเมล</div>
              </div>
              <div>
                <button
                  onClick={() => setEmailNotifications((s) => !s)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${emailNotifications ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  aria-pressed={emailNotifications}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${emailNotifications ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">แจ้งเตือนแบบพุช</div>
                <div className="text-xs text-gray-500">รับการแจ้งเตือนบนอุปกรณ์</div>
              </div>
              <div>
                <button
                  onClick={() => setPushNotifications((s) => !s)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${pushNotifications ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  aria-pressed={pushNotifications}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${pushNotifications ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button onClick={handlePrefsSave} className="px-4 py-2 bg-black text-white rounded-lg">
                บันทึกการตั้งค่าแจ้งเตือน
              </button>
              {prefsSaved && <div className="mt-2 text-sm text-green-600">{prefsSaved}</div>}
            </div>
          </div>
        </div>

        {/* Language card */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">ภาษา</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เลือกภาษา</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="th">ไทย</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
