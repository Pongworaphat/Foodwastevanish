// ProfilePage.jsx (แก้แล้ว)
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
    avatar: "",
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

  // อ่านค่าเริ่มต้นจาก localStorage เมื่อ mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw);

      setProfile((p) => ({
        ...p,
        name: u.username || p.name,
        email: u.email || p.email,
        phone: u.phone || p.phone,
        about: u.about || p.about,
        city: u.city || p.city,
        country: u.country || p.country,
        address: u.address || p.address,
        avatar: u.avatar || p.avatar,
      }));

      if (u.social && typeof u.social === "object") {
        setSocial((s) => ({ ...s, ...u.social }));
      }

      if (u.avatar) {
        const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        const avatarUrl = u.avatar.startsWith("/")
          ? `${backend}${u.avatar}`
          : u.avatar;
        setAvatarPreview(avatarUrl);
      }
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

  // เปลี่ยนรูป (ส่งเป็น multipart/form-data ด้วย fetch)
  async function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;

    // แสดง preview ทันที
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
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // อย่าใส่ Content-Type เมื่อตั้ง body เป็น FormData — เบราว์เซอร์จะเซ็ต boundary ให้เอง
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      // แปลง avatar เป็น full URL ถ้ามาจาก path เช่น /uploads/...
      const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      if (data.user && data.user.avatar && data.user.avatar.startsWith("/")) {
        data.user.avatar = `${backend}${data.user.avatar}`;
      }

      // อัปเดต localStorage + state ให้ UI แสดงค่าล่าสุดทันที
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setProfile((prev) => ({
          ...prev,
          name: data.user.username || prev.name,
          email: data.user.email || prev.email,
          phone: data.user.phone || prev.phone,
          about: data.user.about || prev.about,
          city: data.user.city || prev.city,
          country: data.user.country || prev.country,
          address: data.user.address || prev.address,
          avatar: data.user.avatar || prev.avatar,
        }));

        if (data.user.social && typeof data.user.social === "object") {
          setSocial((s) => ({ ...s, ...data.user.social }));
        }

        if (data.user.avatar) {
          setAvatarPreview(data.user.avatar);
        }
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

  // บันทึกข้อมูล (profile, social, address)
  async function handleSave(section) {
    if (saving) return;
    setSaving(true);

    try {
      if (section === "profile" && !profile.name.trim()) {
        alert("กรุณากรอกชื่อ");
        setSaving(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        // ถ้าไม่มี token ก็เก็บแค่ใน localStorage (offline mode)
        const localUserRaw = localStorage.getItem("user");
        let localUser = localUserRaw ? JSON.parse(localUserRaw) : {};
        localUser = {
          ...localUser,
          username: profile.name,
          email: profile.email,
          phone: profile.phone,
          about: profile.about,
          city: profile.city,
          country: profile.country,
          address: profile.address,
          social: { ...localUser.social, ...social },
        };
        localStorage.setItem("user", JSON.stringify(localUser));
        alert("บันทึก (local) สำเร็จ — ไม่มี token ให้ส่งไปยังเซิร์ฟเวอร์");
        setSaving(false);
        return;
      }

      const payload = { ...profile, social: { ...social } };
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "ไม่สามารถบันทึกข้อมูลบนเซิร์ฟเวอร์ได้");

      // อัปเดต localStorage + state ตาม response เพื่อให้ UI แสดงผลทันที
      if (data.user) {
        // แปลง avatar เป็น full url ถ้าจำเป็น
        const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
        if (data.user.avatar && data.user.avatar.startsWith("/")) {
          data.user.avatar = `${backend}${data.user.avatar}`;
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        setProfile((prev) => ({
          ...prev,
          name: data.user.username || prev.name,
          email: data.user.email || prev.email,
          phone: data.user.phone || prev.phone,
          about: data.user.about || prev.about,
          city: data.user.city || prev.city,
          country: data.user.country || prev.country,
          address: data.user.address || prev.address,
          avatar: data.user.avatar || prev.avatar,
        }));

        if (data.user.social && typeof data.user.social === "object") {
          setSocial((s) => ({ ...s, ...data.user.social }));
        }

        if (data.user.avatar) setAvatarPreview(data.user.avatar);
      }

      alert("บันทึกสำเร็จ");
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
                    src={avatarPreview}
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
                เลือกรูป
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">ชื่อผู้ใช้</span>
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
                    disabled
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">หมายเลขโทรศัพท์</span>
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
                    {saving ? "กำลังบันทึก..." : "บันทึก"}
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
