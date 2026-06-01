import React, { useState } from "react";
import {
  MessageSquare,
  Sparkles,
  Send,
  RotateCcw,
} from "lucide-react";

export default function FeedbackPage() {
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        "http://localhost:5000/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category: type,
            title,
            message: details,
            contactEmail: email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Submit failed"
        );
      }

      alert("ส่งความคิดเห็นสำเร็จ 🎉");

      setType("");
      setTitle("");
      setDetails("");
      setEmail("");

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleReset = () => {
    setType("");
    setTitle("");
    setDetails("");
    setEmail("");
    setSuccess("");
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-300/20 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-200/20 blur-3xl rounded-full animate-pulse" />

      <div className="relative max-w-4xl mx-auto px-4 py-16">

        {/* HERO */}
        <div className="text-center mb-12">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm text-emerald-600 text-sm font-semibold">
            <Sparkles size={16} />
            Feedback Center
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900">
            ส่งความคิดเห็น 💬
          </h1>

          <p className="mt-4 text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            ทุกความคิดเห็นของคุณช่วยให้ Food Waste Vanish
            พัฒนาให้ดีขึ้นสำหรับทุกคน
          </p>

        </div>

        {/* MAIN CARD */}
        <div className="
          bg-white/75
          backdrop-blur-2xl
          border border-white/50
          shadow-2xl
          shadow-emerald-500/5
          rounded-[32px]
          p-6 md:p-10
        ">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* TYPE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                ประเภทความคิดเห็น
              </label>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="
                  w-full
                  h-14
                  px-5
                  rounded-2xl
                  border border-gray-200/80
                  bg-white/70
                  backdrop-blur-xl
                  text-gray-700
                  focus:outline-none
                  focus:ring-4
                  focus:ring-emerald-100
                  focus:border-emerald-400
                  transition-all
                "
              >
                <option value="">เลือกประเภท</option>
                <option value="suggestion">ข้อเสนอแนะ</option>
                <option value="problem">รายงานปัญหา</option>
                <option value="feature">เสนอฟีเจอร์ใหม่</option>
                <option value="other">อื่น ๆ</option>
              </select>
            </div>

            {/* TITLE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                หัวข้อ
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="สรุปความคิดเห็นของคุณ"
                className="
                  w-full
                  h-14
                  px-5
                  rounded-2xl
                  border border-gray-200/80
                  bg-white/70
                  backdrop-blur-xl
                  text-gray-700
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:ring-4
                  focus:ring-emerald-100
                  focus:border-emerald-400
                  transition-all
                "
              />
            </div>

            {/* DETAILS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                รายละเอียด
              </label>

              <textarea
                rows="6"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="บอกเราเพิ่มเติมเกี่ยวกับความคิดเห็นของคุณ..."
                className="
                  w-full
                  px-5
                  py-4
                  rounded-2xl
                  border border-gray-200/80
                  bg-white/70
                  backdrop-blur-xl
                  text-gray-700
                  placeholder:text-gray-400
                  resize-none
                  focus:outline-none
                  focus:ring-4
                  focus:ring-emerald-100
                  focus:border-emerald-400
                  transition-all
                "
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                อีเมลสำหรับติดต่อกลับ (ไม่บังคับ)
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="foodwastevanish@email.com"
                className="
                  w-full
                  h-14
                  px-5
                  rounded-2xl
                  border border-gray-200/80
                  bg-white/70
                  backdrop-blur-xl
                  text-gray-700
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:ring-4
                  focus:ring-emerald-100
                  focus:border-emerald-400
                  transition-all
                "
              />
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">

              <button
                type="submit"
                className="
                  w-full sm:w-auto
                  inline-flex items-center justify-center gap-2
                  px-8
                  h-14
                  rounded-2xl
                  bg-gradient-to-r
                  from-emerald-500
                  to-emerald-600
                  text-white
                  font-semibold
                  shadow-lg
                  shadow-emerald-500/20
                  hover:scale-[1.02]
                  hover:shadow-xl
                  active:scale-95
                  transition-all
                "
              >
                <Send size={18} />
                ส่งความคิดเห็น
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="
                  w-full sm:w-auto
                  inline-flex items-center justify-center gap-2
                  px-8
                  h-14
                  rounded-2xl
                  border border-gray-200
                  bg-white/70
                  backdrop-blur-xl
                  text-gray-700
                  font-semibold
                  hover:bg-gray-50
                  active:scale-95
                  transition-all
                "
              >
                <RotateCcw size={18} />
                ล้างฟอร์ม
              </button>

            </div>

            {/* SUCCESS */}
            {success && (
              <div className="
                mt-6
                rounded-2xl
                border border-emerald-200
                bg-emerald-50/80
                px-5
                py-4
                text-sm
                font-medium
                text-emerald-700
                flex items-center gap-2
              ">
                <MessageSquare size={18} />
                {success}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}