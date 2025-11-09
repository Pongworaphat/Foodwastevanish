import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Notification & language states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [language, setLanguage] = useState("th");
  const [prefsSaved, setPrefsSaved] = useState("");

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem("settings:prefs") || "{}");
      if (prefs.emailNotifications !== undefined) setEmailNotifications(prefs.emailNotifications);
      if (prefs.pushNotifications !== undefined) setPushNotifications(prefs.pushNotifications);
      if (prefs.language) setLanguage(prefs.language);
    } catch (e) {
    }
  }, []);

  function handlePasswordSubmit(e) {
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

    setPasswordSuccess("บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function handlePrefsSave() {
    const prefs = { emailNotifications, pushNotifications, language };
    localStorage.setItem("settings:prefs", JSON.stringify(prefs));
    setPrefsSaved("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    setTimeout(() => setPrefsSaved(""), 3000);
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">การตั้งค่า</h1>
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">เปลี่ยนรหัสผ่าน</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านปัจจุบัน</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านปัจจุบัน"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านใหม่</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่านใหม่</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={(e) => setShowPasswords(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded text-indigo-600 border-gray-300"
                />
                แสดงรหัสผ่าน
              </label>

              <button
                type="submit"
                className="inline-flex items-center px-5 py-2 bg-black text-white rounded-lg shadow hover:opacity-95"
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
