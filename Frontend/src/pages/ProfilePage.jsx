import React, { useState, useRef, useEffect } from "react";
import {
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function ProfilePage() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState({
    name: currentUser.username || "",
    email: currentUser.email || "",
    phone: currentUser.phone || "",
    about: currentUser.about || "",
    avatar: currentUser.avatar || "",
  });

  const [preferences, setPreferences] = useState(
    currentUser.preferences || []
  );

  const [social, setSocial] = useState({ facebook: "", instagram: "", });
  const [stats, setStats] = useState({
    donationsShared: 0,
    peopleHelped: 0,
    completedDonations: 0,
    trustScore: 0,
    reviews: 0,
  });

  const [interests, setInterests] = useState({
    counts: {},
    percentages: {},
  });

  const favoriteCategory =
    Object.entries(
      interests.percentages || {}
    ).sort((a, b) => b[1] - a[1])[0];

  const [activities, setActivities] = useState([]);

  const [joinedDate, setJoinedDate] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(() => {
    if (currentUser.avatar) {
      return currentUser.avatar.startsWith("/")
        ? `${backend}${currentUser.avatar}`
        : currentUser.avatar;
    }
    return null;
  });

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);
  const fileRef = useRef(null);

  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "alert", onConfirm: null });

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      fetch(`${backend}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const user = data.user;

          setPreferences(
            user.preferences || []
          );

          setStats({
            donationsShared: data.stats?.donationsShared || 0,
            completedDonations: data.stats?.completedDonations || 0,
            peopleHelped: data.stats?.peopleHelped || 0,
            trustScore: data.stats?.trustScore || 0,
          });

          setJoinedDate(
            new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          );

          setProfile((p) => ({
            ...p,
            name: user.username || "",
            email: user.email || "",
            phone: user.phone || "",
            about: user.about || "",
            avatar: user.avatar || "",
          }));

          setSocial({
            facebook: user.social?.facebook || "",
            instagram: user.social?.instagram || "",
          });

          setPreferences(
            user.preferences || []
          );

          if (user.avatar) {
            const avatarUrl = user.avatar.startsWith("/")
              ? `${backend}${user.avatar}`
              : user.avatar;

            setAvatarPreview(avatarUrl);
          }

          localStorage.setItem("user", JSON.stringify(user));

          fetch(`${backend}/api/user/activity`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((data) => {
              setActivities(data);
            })
            .catch(console.error);
        })
        .catch(console.error);
    }

    fetch(`${backend}/api/user/interests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setInterests(data);
        console.log("INTERESTS", data)
      })
      .catch(console.error);
  }, []);

  const showAlert = (title, message, type = "alert", onConfirm = null) => {
    setModal({ isOpen: true, title, message, type, onConfirm });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: "", message: "", type: "alert", onConfirm: null });
  };

  function handleChange(e) {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      const res = await fetch(`${backend}/api/user/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.user) {
        const current = JSON.parse(localStorage.getItem("user") || "{}");

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
        social,
        preferences,
      };
      console.log("SAVE PAYLOAD:", payload);

      const res = await fetch(`${backend}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "อัปโหลดรูปไม่สำเร็จ");

      const current = JSON.parse(localStorage.getItem("user") || "{}");

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

  const totalCompleted =
    Object.values(
      interests.counts || {}
    ).reduce(
      (sum, value) => sum + value,
      0
    );

  const trustScore = stats.trustScore || 0;

  const trustColor =
    trustScore >= 70
      ? {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-600",
        label: "🥇 High Trust",
      }
      : trustScore >= 40
        ? {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-600",
          label: "🥈 Reliable Donor",
        }
        : {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-600",
          label: "🥉 New Donor",
        };

  const categoryIcons = {
    "Food Sharing": "🍱",
    "Animal Food": "🐶",
    "Organic Waste": "🌱",
  };

  return (
    <div className="min-h-screen font-sans antialiased bg-gradient-to-br from-emerald-50 via-white to-emerald-100 antialiased font-sans">
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
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="w-full h-full object-cover" />
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

              <div className="flex items-center justify-center gap-4 py-2">
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 hover:scale-110 transition"
                  >
                    <FaFacebook size={18} />
                  </a>
                )}

                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 hover:scale-110 transition"
                  >
                    <FaInstagram size={18} />
                  </a>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3.5 w-full mt-6">
                <div className="bg-emerald-50/60 border border-emerald-100/50 rounded-2xl p-3.5 transition-all hover:bg-emerald-50">
                  <p className="text-2xl font-bold tracking-tight text-emerald-600">{stats.donationsShared || 0}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">🍱 Donations Shared</p>
                </div>
                <div className="bg-blue-50/60 border border-blue-100/50 rounded-2xl p-3.5 transition-all hover:bg-blue-50">
                  <p className="text-2xl font-bold tracking-tight text-blue-600">{stats.completedDonations || 0}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">🎉 Completed</p>
                </div>
                <div className="bg-yellow-50/60 border border-yellow-100/50 rounded-2xl p-3.5 transition-all hover:bg-yellow-50">
                  <p className="text-2xl font-bold tracking-tight text-yellow-600">{stats.peopleHelped || 0}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">❤️ People Helped</p>
                </div>
                <div
                  className={`${trustColor.bg} border ${trustColor.border} rounded-2xl p-3.5 transition-all`}
                >
                  <p
                    className={`text-2xl font-bold tracking-tight ${trustColor.text}`}
                  >
                    {trustScore}%
                  </p>

                  <p className="text-xs font-medium text-gray-500 mt-0.5">
                    ⭐ Trust Score
                  </p>

                  <p className={`text-[11px] font-semibold mt-1 ${trustColor.text}`}>
                    {trustColor.label}
                  </p>
                </div>
              </div>

              <div className="w-full mt-5 pt-4 border-t border-gray-100 flex items-center justify-center text-xs font-medium text-gray-400 gap-1">
                <span>📅 Member since:</span>
                <span className="text-gray-600">
                  {joinedDate || "Recently"}
                </span>
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

            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-900/5 ring-1 ring-black/5 ">
              <h3 className="text-sm font-bold text-gray-700 mb-4">
                🧠 Recommendation Insights
              </h3>

              {totalCompleted < 5 ? (

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🧠</span>

                    <div>
                      <h4 className="font-semibold text-emerald-700">
                        Learning your interests...
                      </h4>

                      <p className="text-sm text-emerald-600">
                        Complete more donations to improve recommendations
                      </p>
                    </div>
                  </div>

                  {/* Progress */}

                  <div className="mb-2 flex justify-between text-sm">
                    <span>Learning Progress</span>
                    <span>{totalCompleted}/5</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${(totalCompleted / 5) * 100}%`,
                      }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {5 - totalCompleted > 0
                      ? `Need ${5 - totalCompleted
                      } more completed donations`
                      : "Ready"}
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                    <h4 className="font-semibold text-emerald-700">
                      Personalized Recommendations Active
                    </h4>

                    <p className="text-sm text-emerald-600 mt-1">
                      Your donation feed is ranked using:
                    </p>

                    <ul className="mt-2 text-sm text-emerald-700 space-y-1">
                      <li>✔ Completed donation history</li>
                      <li>✔ Distance ranking</li>
                      <li>✔ Expiry urgency</li>
                    </ul>

                    <p className="text-xs text-emerald-500 mt-3">
                      Based on {totalCompleted} completed donations
                    </p>

                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-4">

                    <div className="text-xs text-gray-500 mb-1">
                      Favorite Category
                    </div>

                    <div className="text-lg font-semibold text-gray-800">
                      {favoriteCategory?.[0]
                        ? `${categoryIcons[favoriteCategory[0]]} ${favoriteCategory[0]}`
                        : "No data"}
                    </div>

                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>🍱 Food Sharing</span>
                      <span>
                        {interests.percentages?.["Food Sharing"] || 0}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-emerald-500 h-3 rounded-full"
                        style={{
                          width: `${interests.percentages?.["Food Sharing"] || 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>🐶 Animal Food</span>
                      <span>
                        {interests.percentages?.["Animal Food"] || 0}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-orange-500 h-3 rounded-full"
                        style={{
                          width: `${interests.percentages?.["Animal Food"] || 0}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>🌱 Organic Waste</span>
                      <span>
                        {interests.percentages?.["Organic Waste"] || 0}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-lime-500 h-3 rounded-full"
                        style={{
                          width: `${interests.percentages?.["Organic Waste"] || 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

              )}

            </div>

            {/* SOCIAL */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-900/5 ring-1 ring-black/5">
              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-emerald-500 rounded-full inline-block"></span>
                โซเชียลมีเดีย (Social Media)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-2">
                    <FaFacebook className="text-blue-600" />
                    Facebook URL
                  </label>

                  <input
                    name="facebook"
                    value={social.facebook}
                    onChange={handleSocialChange}
                    placeholder="https://facebook.com/..."
                    className="px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm text-gray-700"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-2">
                    <FaInstagram className="text-pink-500" />
                    Instagram URL
                  </label>

                  <input
                    name="instagram"
                    value={social.instagram}
                    onChange={handleSocialChange}
                    placeholder="https://instagram.com/..."
                    className="px-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200/80 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-sm text-gray-700"
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-3">

                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 hover:scale-110 transition"
                  >
                    <FaFacebook size={20} />
                  </a>
                )}

                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 hover:scale-110 transition"
                  >
                    <FaInstagram size={20} />
                  </a>
                )}

              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl shadow-emerald-900/5 ring-1 ring-black/5">
              <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-emerald-500 rounded-full inline-block"></span>
                  กิจกรรมล่าสุด (Recent activity)
                </h2>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                  {activities.length} กิจกรรม
                </span>
              </div>

              {activities.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between pb-3 ${index !== activities.length - 1
                        ? "border-b border-gray-100"
                        : ""
                        }`}
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          🍱 {activity.title}
                        </p>

                        <p className="text-sm text-gray-500">
                          {
                            activity.status === "available"
                              ? "🟢 Active"
                              : activity.status === "claimed"
                                ? "🟡 Claimed"
                                : activity.status === "completed"
                                  ? "🔵 Completed"
                                  : "🔴 Expired"
                          }
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  ยังไม่มีกิจกรรม
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