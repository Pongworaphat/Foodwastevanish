import React, { useState, useRef, useEffect } from "react";

const backend =import.meta.env.VITE_BACKEND_URL ||"http://localhost:5000";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", about: "", city: "", country: "", address: "", avatar: "",
  });

  const [social, setSocial] = useState({ facebook: "", instagram: "", twitter: "", linkedin: "" });
  const [stats, setStats] = useState({ donations: 0, foodSaved: 0, mealsShared: 0, rating: 0, reviews: 0 });
  const [activities, setActivities] = useState([]);
  const [joinedDate, setJoinedDate] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "alert", onConfirm: null });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;

      const u = JSON.parse(raw);
      setProfile((p) => ({
        ...p,
        name: u.username || "",
        email: u.email || "",
        phone: u.phone || "",
        about: u.about || "",
        city: u.city || "",
        country: u.country || "",
        address: u.address || "",
        avatar: u.avatar || "",
      }));

      if (u.social) setSocial((s) => ({ ...s, ...u.social }));
      if (u.stats) setStats((prev) => ({ ...prev, ...u.stats }));
      if (u.activities) setActivities(u.activities);

      if (u.createdAt) {
        const date = new Date(u.createdAt);
        const formatted = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        setJoinedDate(formatted);
      }

      if (u.avatar) {
        const avatarUrl = u.avatar.startsWith("/") ? `${backend}${u.avatar}` : u.avatar;
        setAvatarPreview(avatarUrl);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const showAlert = (title, message, type = "alert", onConfirm = null) => {
    setModal({ isOpen: true, title, message, type, onConfirm });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: "", message: "", type: "alert", onConfirm: null });
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }

  function handleSocialChange(e) {
    const { name, value } = e.target;
    setSocial((prev) => ({ ...prev, [name]: value }));
  }

  function triggerUpload() {
    fileRef.current?.click();
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedAvatar(file);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);

  }

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function askConfirmAvatarSave() {
    if (!selectedAvatar) return;
    showAlert(
      "ยืนยันการเปลี่ยนรูปโปรไฟล์",
      "คุณต้องการอัปโหลดและเปลี่ยนรูปภาพโปรไฟล์ใหม่ใช่หรือไม่ ระบบจะทำการอัปเดตข้อมูลของคุณทันที",
      "confirm",
      executeAvatarSave
    );
  }

  async function executeAvatarSave() {
    closeModal();
    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        showAlert("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบก่อนทำรายการ", "error");
        return;
      }
      const formData = new FormData();
      formData.append("avatar", selectedAvatar);

      const res = await fetch(`${backend}/api/user/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.user) {
        const current =
          JSON.parse(localStorage.getItem("user"));

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...current,
            ...data.user,
          })
        );
        setProfile((prev) => ({ ...prev, avatar: data.user.avatar }));
        const avatarUrl = data.user.avatar.startsWith("/") ? `${backend}${data.user.avatar}` : data.user.avatar;
        setAvatarPreview(avatarUrl);
      }
      setSelectedAvatar(null);
      showAlert("สำเร็จ 🎉", "อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว!", "success");
    } catch (err) {
      console.error(err);
      showAlert("เกิดข้อผิดพลาด", err.message, "error");
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleAvatarCancel() {
    setSelectedAvatar(null);
    if (profile.avatar) {
      const avatarUrl = profile.avatar.startsWith("/") ? `${backend}${profile.avatar}` : profile.avatar;
      setAvatarPreview(avatarUrl);
    } else {
      setAvatarPreview(null);
    }
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showAlert("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบก่อนทำรายการ", "error");
        return;
      }

      const payload = {
        username: profile.name,
        phone: profile.phone,
        about: profile.about,
        city: profile.city,
        country: profile.country,
        address: profile.address,
        social,
      };
      const res = await fetch(`${backend}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const current =
        JSON.parse(localStorage.getItem("user"));

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...current,
          ...data.user,
        })
      );
      setProfile((prev) => ({
        ...prev,
        name: data.user.username || prev.name,
        phone: data.user.phone || prev.phone,
        about: data.user.about || prev.about,
        city: data.user.city || prev.city,
        country: data.user.country || prev.country,
        address: data.user.address || prev.address,
      }));

      showAlert("บันทึกสำเร็จ ✨", "อัปเดตข้อมูลโปรไฟล์ของคุณเรียบร้อยแล้ว", "success");
    } catch (err) {
      console.error(err);
      showAlert("เกิดข้อผิดพลาด", err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteAccount() {
    showAlert(
      "แจ้งเตือนระบบ ⚠️",
      "การลบบัญชีไม่สามารถย้อนกลับได้ คุณต้องการลบข้อมูลทั้งหมดจริงหรือไม่?",
      "danger",
      executeDeleteAccount
    );
  }

  async function executeDeleteAccount() {
    closeModal();
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${backend}/api/user`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("ลบบัญชีไม่สำเร็จ");

      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      showAlert("เกิดข้อผิดพลาด", err.message, "error");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 antialiased font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT SIDEBAR */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl shadow-emerald-900/5 h-fit ring-1 ring-black/5">
            <div className="flex flex-col items-center text-center">

              {/* Avatar Container */}
              <div className="relative w-36 h-36 group">
                <div className="absolute inset-0 rounded-full bg-emerald-400 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 scale-110" />
                <div className="relative w-full h-full rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                      ผู้ใช้
                    </div>
                  )}
                </div>
              </div>

              {/* Avatar Action Buttons */}
              {selectedAvatar ? (
                <div className="flex gap-2.5 mt-5 w-full max-w-[240px]">
                  <button
                    onClick={handleAvatarCancel}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={askConfirmAvatarSave}
                    disabled={uploadingAvatar}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {uploadingAvatar ? "กำลังอัปโหลด..." : "บันทึกรูป"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={triggerUpload}
                  className="mt-5 px-6 py-2 rounded-xl border-2 border-emerald-100 bg-emerald-50/50 text-emerald-600 font-semibold text-sm hover:bg-emerald-100 hover:border-emerald-200 active:scale-95 transition-all shadow-sm"
                >
                  เปลี่ยนรูปโปรไฟล์
                </button>
              )}

              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

              <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-800">
                {profile.name || "Unknown User"}
              </h2>

              {profile.about && (
                <p className="mt-3 text-sm leading-relaxed text-gray-500 max-w-[250px] italic">
                  “{profile.about}”
                </p>
              )}

              <div className="w-full border-t border-gray-100 my-5" />

              {/* Trust & Stats */}
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Community Trust</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex text-yellow-400 text-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= Math.round(stats.rating) ? "text-yellow-400" : "text-gray-200"}>★</span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-500">({stats.reviews || 0} รีวิว)</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3.5 w-full mt-6">
                <div className="bg-emerald-50/60 border border-emerald-100/50 rounded-2xl p-3.5 transition-all hover:bg-emerald-50">
                  <p className="text-2xl font-bold tracking-tight text-emerald-600">{stats.donations || "-"}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">🍱 Food Shared</p>
                </div>
                <div className="bg-blue-50/60 border border-blue-100/50 rounded-2xl p-3.5 transition-all hover:bg-blue-50">
                  <p className="text-2xl font-bold tracking-tight text-blue-600">{stats.foodSaved > 0 ? `${stats.foodSaved}kg` : "-"}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">🌍 Waste Reduced</p>
                </div>
                <div className="bg-yellow-50/60 border border-yellow-100/50 rounded-2xl p-3.5 transition-all hover:bg-yellow-50">
                  <p className="text-2xl font-bold tracking-tight text-yellow-600">{stats.mealsShared || "-"}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">❤️ People Helped</p>
                </div>
                <div className="bg-pink-50/60 border border-pink-100/50 rounded-2xl p-3.5 transition-all hover:bg-pink-50">
                  <p className="text-2xl font-bold tracking-tight text-pink-600">{stats.rating > 0 ? stats.rating.toFixed(1) : "-"}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">⭐ Trust Score</p>
                </div>
              </div>

              <div className="w-full mt-5 pt-4 border-t border-gray-100 flex items-center justify-center text-xs font-medium text-gray-400 gap-1">
                <span>📅 เป็นสมาชิกเมื่อ:</span>
                <span className="text-gray-600">{joinedDate || "Recently"}</span>
              </div>

            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-2 space-y-6">

            {/* PROFILE INFO */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-900/5 ring-1 ring-black/5">
              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-emerald-500 rounded-full inline-block"></span>
                ข้อมูลส่วนตัว (Profile Information)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1">ชื่อผู้ใช้</label>
                  <input name="name" value={profile.name} onChange={handleChange} placeholder="ชื่อผู้ใช้" className="px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm text-gray-700" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 ml-1">อีเมล (ไม่สามารถเปลี่ยนได้)</label>
                  <input name="email" value={profile.email} disabled placeholder="อีเมล" className="px-4 py-3 rounded-xl bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed text-sm" />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">เบอร์โทรศัพท์</label>
                  <input name="phone" value={profile.phone} onChange={handleChange} placeholder="เบอร์โทรศัพท์" className="px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm text-gray-700" />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">เกี่ยวกับฉัน</label>
                  <textarea name="about" value={profile.about} onChange={handleChange} rows={3} placeholder="เล่าเป้าหมายในการช่วยลด Food Waste ของคุณ..." className="px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm text-gray-700 resize-none" />
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-900/5 ring-1 ring-black/5">
              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-emerald-500 rounded-full inline-block"></span>
                ข้อมูลที่อยู่ (Address)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1">เมือง / จังหวัด</label>
                  <input name="city" value={profile.city} onChange={handleChange} placeholder="เมือง" className="px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm text-gray-700" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1">ประเทศ</label>
                  <input name="country" value={profile.country} onChange={handleChange} placeholder="ประเทศ" className="px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm text-gray-700" />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">รายละเอียดที่อยู่</label>
                  <textarea name="address" value={profile.address} onChange={handleChange} rows={3} placeholder="บ้านเลขที่, ถนน, อำเภอ/เขต..." className="px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm text-gray-700 resize-none" />
                </div>
              </div>
            </div>

            {/* SOCIAL */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-900/5 ring-1 ring-black/5">
              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-emerald-500 rounded-full inline-block"></span>
                โซเชียลมีเดีย (Social Media)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1">Facebook URL</label>
                  <input name="facebook" value={social.facebook} onChange={handleSocialChange} placeholder="https://facebook.com/..." className="px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm text-gray-700" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1">Instagram URL</label>
                  <input name="instagram" value={social.instagram} onChange={handleSocialChange} placeholder="https://instagram.com/..." className="px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm text-gray-700" />
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl shadow-emerald-900/5 ring-1 ring-black/5">
              <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-emerald-500 rounded-full inline-block"></span>
                  กิจกรรมล่าสุด
                </h2>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                  {activities.length} กิจกรรม
                </span>
              </div>

              {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <h3 className="text-sm font-semibold text-gray-700">ไม่มีประวัติกิจกรรมในขณะนี้</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">ประวัติการแบ่งปันอาหารและกิจกรรมในชุมชนของคุณจะแสดงตรงนี้</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/40 border border-gray-100 hover:bg-gray-50 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center text-lg flex-shrink-0">
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-800 truncate">{activity.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-1.5 flex items-center gap-1">⏰ {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SAVE BUTTON */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm active:scale-98 transition-all hover:shadow-lg hover:shadow-emerald-500/20 shadow-md"
              >
                {saving ? "กำลังบันทึก..." : "บันทึกข้อมูลทั้งหมด"}
              </button>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-red-50/40 backdrop-blur-xl border border-red-100 rounded-3xl p-6 shadow-xl shadow-red-900/5 ring-1 ring-red-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
                <p className="text-xs text-red-500 mt-0.5">การลบบัญชีไม่สามารถเรียกคืนข้อมูลใดๆ กลับมาได้อีก</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 active:scale-95 transition-all shadow-sm shadow-red-600/10"
              >
                ลบบัญชีถาวร
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* PREMIUM CUSTOM POP-UP MODAL CONTAINER */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          {/* Blur & Dark Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-300"
            onClick={modal.type === "alert" || modal.type === "success" || modal.type === "error" ? closeModal : undefined}
          />

          {/* Modern Premium Modal Box */}
          <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-white/60 ring-1 ring-black/5 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">

            {/* Dynamic Status Icons */}
            <div className="flex flex-col items-center text-center">
              {modal.type === "confirm" && (
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-4">
                  📸
                </div>
              )}
              {modal.type === "success" && (
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 mb-4 animate-bounce">
                  ✨
                </div>
              )}
              {modal.type === "error" && (
                <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-4">
                  ❌
                </div>
              )}
              {modal.type === "danger" && (
                <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-4">
                  ⚠️
                </div>
              )}

              {/* Title & Description */}
              <h3 className="text-xl font-bold tracking-tight text-gray-800 md:text-2xl">
                {modal.title}
              </h3>
              <p className="text-sm text-gray-500/90 mt-3 leading-relaxed max-w-sm">
                {modal.message}
              </p>
            </div>

            {/* Action Buttons Layout */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
              {modal.type === "confirm" || modal.type === "danger" ? (
                <>
                  <button
                    onClick={closeModal}
                    className="w-full sm:w-auto px-5 py-3 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100/80 active:scale-95 rounded-xl border border-gray-200/60 transition-all text-center"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={modal.onConfirm}
                    className={`w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white shadow-md active:scale-95 rounded-xl transition-all text-center ${modal.type === "danger"
                      ? "bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/10 hover:from-red-600 hover:to-red-700"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/10 hover:from-emerald-600 hover:to-emerald-700"
                      }`}
                  >
                    ตกลงยืนยัน
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="w-full px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/10 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 rounded-xl transition-all text-center"
                >
                  รับทราบ
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}