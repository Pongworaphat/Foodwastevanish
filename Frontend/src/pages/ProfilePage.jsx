import React, { useState, useRef, useEffect } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    about: "",
    city: "",
    country: "",
    address: "",
  });

  const [social, setSocial] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw);
      setProfile((p) => ({
        ...p,
        name: u.username || p.name,
        email: u.email || p.email,
      }));
      if (u.avatar) setAvatarPreview(u.avatar);
    } catch (err) {
      console.error("Failed to parse user from localStorage", err);
    }
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }

  function handleSocialChange(e) {
    const { name, value } = e.target;
    setSocial((s) => ({ ...s, [name]: value }));
  }

  // เปลี่ยนรูป
  async function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const previewUrl = URL.createObjectURL(f);
    setAvatarPreview(previewUrl);

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("ต้องล็อกอินก่อนเปลี่ยนรูป");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", f);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      if (data.user) {
        const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        if (data.user.avatar && data.user.avatar.startsWith("/")) {
          data.user.avatar = `${backend}${data.user.avatar}`;
        }
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event('user:updated'));
        setAvatarPreview(data.user.avatar);
      }
      alert("เปลี่ยนรูปสำเร็จ");
    } catch (err) {
      console.error(err);
      alert(err.message || "เกิดข้อผิดพลาดขณะอัปโหลด");
    }
  }

  function triggerUpload() {
    fileRef.current?.click();
  }

  async function handleSave(section) {
    if (saving) return;
    setSaving(true);

    try {
      if (section === "profile") {
        if (!profile.name.trim()) {
          alert("กรุณากรอกชื่อ");
          setSaving(false);
          return;
        }
      }

      const token = localStorage.getItem("authToken");
      if (token) {
        const payload = { profile, social };
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "ไม่สามารถบันทึกข้อมูลบนเซิร์ฟเวอร์ได้");
        }

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        alert("บันทึกสำเร็จ");
      } else {
        const localUserRaw = localStorage.getItem("user");
        let localUser = localUserRaw ? JSON.parse(localUserRaw) : {};
        localUser = { ...localUser, username: profile.name, email: profile.email };
        localStorage.setItem("user", JSON.stringify(localUser));
        alert("บันทึก (local) สำเร็จ — ไม่มี token ให้ส่งไปยังเซิร์ฟเวอร์");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "เกิดข้อผิดพลาดขณะบันทึก");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    const ok = window.confirm(
      "การกระทำนี้ไม่สามารถย้อนกลับได้\n\nต้องการลบบัญชีทั้งหมดของคุณหรือไม่?"
    );
    if (!ok) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("ต้องล็อกอินเพื่อทำการลบบัญชี");
      return;
    }

    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "ไม่สามารถลบบัญชีได้");
      }
      // ทำความสะอาด localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      alert("บัญชีถูกลบเรียบร้อย");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(err.message || "เกิดข้อผิดพลาดขณะลบบัญชี");
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">จัดการโปรไฟล์</h1>
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img
                    src={
                      avatarPreview?.startsWith("/uploads/")
                        ? `http://localhost:5000${avatarPreview}`
                        : avatarPreview
                    }
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />

                ) : (
                  <span className="text-gray-400">ผู้ใช้</span>
                )}
              </div>
              <button
                type="button"
                onClick={triggerUpload}
                className="mt-3 inline-block text-sm px-3 py-1 border rounded-md bg-white text-gray-700 hover:bg-gray-50"
              >
                เปลี่ยนรูปโปรไฟล์
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">ชื่อ</span>
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="กรอกชื่อของคุณ"
                    className="px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">อีเมล</span>
                  <input
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder="Foodwastevanish@email.com"
                    className="px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    disabled // ปกติไม่ให้แก้อีเมลผ่าน frontend แบบนี้ ถ้าจะอนุญาตต้องมี flow ยืนยันอีเมล
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">เบอร์โทรศัพท์</span>
                  <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="xxx-xxx-xxxx"
                    className="px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">ประวัติย่อ</span>
                  <textarea
                    name="about"
                    value={profile.about}
                    onChange={handleChange}
                    placeholder="เกี่ยวกับคุณ"
                    rows={3}
                    className="px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </label>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => handleSave("profile")}
                    className={`px-4 py-2 rounded-md text-white ${saving ? "bg-gray-400" : "bg-gray-900"}`}
                    disabled={saving}
                  >
                    {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address card */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">ที่อยู่</h2>

          <div className="grid grid-cols-1 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">เมือง</span>
              <input
                name="city"
                value={profile.city}
                onChange={handleChange}
                placeholder="กรุงเทพมหานคร"
                className="px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">ประเทศ</span>
              <input
                name="country"
                value={profile.country}
                onChange={handleChange}
                placeholder="ประเทศไทย"
                className="px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">ที่อยู่เต็ม (ไม่บังคับ)</span>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
                rows={3}
                className="px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => handleSave("address")}
                className={`px-4 py-2 rounded-md text-white ${saving ? "bg-gray-400" : "bg-gray-900"}`}
                disabled={saving}
              >
                {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </button>
            </div>
          </div>
        </div>

        {/* Social links card */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">โซเชียลมีเดีย</h2>

          <div className="grid grid-cols-1 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1 flex items-center gap-2">Facebook</span>
              <input
                name="facebook"
                value={social.facebook}
                onChange={handleSocialChange}
                placeholder="https://facebook.com/username"
                className="px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1 flex items-center gap-2">Instagram</span>
              <input
                name="instagram"
                value={social.instagram}
                onChange={handleSocialChange}
                placeholder="https://instagram.com/username"
                className="px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1 flex items-center gap-2">Twitter (X)</span>
              <input
                name="twitter"
                value={social.twitter}
                onChange={handleSocialChange}
                placeholder="https://twitter.com/username"
                className="px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1 flex items-center gap-2">LinkedIn</span>
              <input
                name="linkedin"
                value={social.linkedin}
                onChange={handleSocialChange}
                placeholder="https://linkedin.com/in/username"
                className="px-4 py-2 bg-gray-50 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => handleSave("social")}
                className={`px-4 py-2 rounded-md text-white ${saving ? "bg-gray-400" : "bg-gray-900"}`}
                disabled={saving}
              >
                {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </button>
            </div>
          </div>
        </div>

        {/* Dangerous actions */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium text-red-700 mb-2">โซนอันตราย</h2>
          <p className="text-red-600 mb-4">การกระทำเหล่านี้ไม่สามารถย้อนกลับได้</p>

          <div className="bg-white border rounded-md p-4">
            <p className="text-sm text-gray-700 mb-4">ลบบัญชี</p>
            <p className="text-sm text-gray-500 mb-4">ลบบัญชีและข้อมูลทั้งหมดของคุณอย่างถาวร</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                ลบบัญชี
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
