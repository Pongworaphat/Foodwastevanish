import React, { useState } from "react";

export default function FeedbackPage() {
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!type || !title || !details) {
      setSuccess("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    console.log({ type, title, details, email });

    setSuccess("ส่งความคิดเห็นเรียบร้อยแล้ว ขอบคุณสำหรับคำแนะนำของคุณ!");

    setType("");
    setTitle("");
    setDetails("");
    setEmail("");
  };

  const handleReset = () => {
    setType("");
    setTitle("");
    setDetails("");
    setEmail("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">ส่งความคิดเห็น</h1>
        <p className="text-gray-600 mb-6">
          เราอยากรับฟังความคิดเห็นของคุณเพื่อพัฒนาระบบให้ดียิ่งขึ้น
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทความคิดเห็น
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">เลือกประเภท</option>
              <option value="suggestion">ข้อเสนอแนะ</option>
              <option value="problem">รายงานปัญหา</option>
              <option value="feature">เสนอฟีเจอร์ใหม่</option>
              <option value="other">อื่น ๆ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หัวข้อ
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="สรุปความคิดเห็นของคุณ"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียด
            </label>
            <textarea
              rows="5"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="บอกเราเพิ่มเติมเกี่ยวกับความคิดเห็นของคุณ..."
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อีเมลสำหรับติดต่อกลับ (ไม่บังคับ)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Foodwastevanish@email.com"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="bg-black text-white px-5 py-2 rounded-lg hover:opacity-90"
            >
              ส่งความคิดเห็น
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-100 px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-200"
            >
              ล้างฟอร์ม
            </button>
          </div>

          {success && (
            <div className="text-center text-sm mt-3 text-green-600">
              {success}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
