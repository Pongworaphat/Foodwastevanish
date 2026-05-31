import React, { useState } from "react";
import {
  ChevronDown,
  Search,
  LifeBuoy,
  Mail,
  MessageCircle,
} from "lucide-react";

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      question: "ฉันจะเปลี่ยนรหัสผ่านได้อย่างไร?",
      answer:
        "ไปที่หน้า Settings → เปลี่ยนรหัสผ่าน จากนั้นกรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ แล้วกดบันทึก.",
    },
    {
      question: "ฉันจะอัปเดตโปรไฟล์ได้อย่างไร?",
      answer:
        "ไปที่หน้า Profile แล้วกดแก้ไขข้อมูล จากนั้นบันทึกการเปลี่ยนแปลงได้ทันที.",
    },
    {
      question: "ฉันจะดูกิจกรรมของฉันได้ที่ไหน?",
      answer:
        "คุณสามารถตรวจสอบกิจกรรมทั้งหมดได้ที่หน้า My Activities.",
    },
    {
      question: "การแจ้งเตือนทำงานอย่างไร?",
      answer:
        "ระบบสามารถแจ้งเตือนผ่านแอปและอีเมลได้ โดยตั้งค่าได้ในหน้า Settings.",
    },
    {
      question: "ฉันจะติดต่อฝ่ายสนับสนุนได้อย่างไร?",
      answer:
        "คุณสามารถติดต่อ support@foodwastevanish.com หรือใช้แบบฟอร์มติดต่อในเว็บไซต์.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-300/20 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-200/20 blur-3xl rounded-full animate-pulse" />

      <div className="relative max-w-5xl mx-auto px-4 py-16">

        {/* HERO */}
        <div className="text-center mb-14">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-sm text-emerald-600 text-sm font-semibold">
            <LifeBuoy size={16} />
            Help Center
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900">
            เราช่วยคุณได้ 👋
          </h1>

          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            ค้นหาคำตอบเกี่ยวกับการใช้งาน Food Waste Vanish
            และเรียนรู้วิธีใช้งานระบบให้มีประสิทธิภาพมากขึ้น
          </p>

          {/* SEARCH */}
          <div className="mt-8 max-w-2xl mx-auto relative">

            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />

            <input
              type="text"
              placeholder="ค้นหาคำถามหรือปัญหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full
                h-16
                pl-14
                pr-5
                rounded-3xl
                border border-white/60
                bg-white/80
                backdrop-blur-xl
                shadow-xl
                shadow-emerald-500/5
                text-gray-800
                placeholder:text-gray-400
                focus:outline-none
                focus:ring-4
                focus:ring-emerald-100
                transition-all
              "
            />
          </div>
        </div>

        {/* QUICK SUPPORT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">

          <div className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Mail />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-800">
              Email Support
            </h3>

            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              ติดต่อทีมงานผ่านอีเมลเพื่อขอความช่วยเหลือเพิ่มเติม
            </p>
          </div>

          <div className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
              <MessageCircle />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-800">
              Community
            </h3>

            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              พูดคุยและแชร์ประสบการณ์กับผู้ใช้งานคนอื่น
            </p>
          </div>

          <div className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <LifeBuoy />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-800">
              FAQ Guide
            </h3>

            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              คำถามที่พบบ่อยเกี่ยวกับระบบและฟีเจอร์ต่าง ๆ
            </p>
          </div>

        </div>

        {/* FAQ SECTION */}
        <div className="space-y-4">

          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="
                  bg-white/75
                  backdrop-blur-xl
                  border border-white/50
                  rounded-3xl
                  overflow-hidden
                  shadow-lg
                  transition-all
                "
              >

                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="
                    w-full
                    flex
                    items-center
                    justify-between
                    px-6
                    py-5
                    text-left
                    hover:bg-white/60
                    transition-all
                  "
                >
                  <span className="text-lg font-semibold text-gray-800">
                    {faq.question}
                  </span>

                  <ChevronDown
                    className={`transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`
                    grid transition-all duration-300 ease-in-out
                    ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }
                  `}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-gray-500 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}