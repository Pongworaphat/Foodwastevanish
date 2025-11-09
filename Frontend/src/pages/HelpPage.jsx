import React, { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      question: "ฉันจะเปลี่ยนรหัสผ่านได้อย่างไร?",
      answer:
        "ไปที่หน้า 'การตั้งค่า' จากนั้นเลือก 'เปลี่ยนรหัสผ่าน' กรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่ แล้วกด 'บันทึกรหัสผ่านใหม่' เพื่อยืนยัน.",
    },
    {
      question: "ฉันจะอัพเดทข้อมูลโปรไฟล์ได้อย่างไร?",
      answer:
        "ไปที่หน้าโปรไฟล์ของคุณ แล้วกดปุ่ม 'แก้ไขโปรไฟล์' เพื่ออัพเดทชื่อ รูปภาพ หรือข้อมูลติดต่อ จากนั้นกด 'บันทึก'.",
    },
    {
      question: "ฉันจะดูกิจกรรมของฉันได้ที่ไหน?",
      answer:
        "คุณสามารถตรวจสอบกิจกรรมทั้งหมดของคุณได้ในหน้า 'ประวัติกิจกรรม' ซึ่งจะแสดงรายการบริจาคและการรับบริจาคที่ผ่านมา.",
    },
    {
      question: "การแจ้งเตือนทำงานอย่างไร?",
      answer:
        "คุณสามารถเปิดหรือปิดการแจ้งเตือนได้ในหน้า 'การตั้งค่า' ภายใต้ส่วน 'การแจ้งเตือน' เพื่อรับข้อมูลอัปเดตผ่านอีเมลหรือการแจ้งเตือนบนอุปกรณ์.",
    },
    {
      question: "ฉันจะติดต่อฝ่ายสนับสนุนได้อย่างไร?",
      answer:
        "หากต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อเราผ่านอีเมล support@foodwastevanish.com หรือใช้แบบฟอร์ม 'ติดต่อเรา' บนเว็บไซต์.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">ความช่วยเหลือ</h1>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาคำถามที่พบบ่อย..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* FAQ List */}
        <div className="bg-white rounded-xl shadow divide-y divide-gray-200">
          <div className="px-4 py-3 font-medium text-gray-700 text-lg">คำถามที่พบบ่อย</div>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center px-4 py-4 text-left hover:bg-gray-50 focus:outline-none"
                >
                  <span className="text-gray-800">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4 text-sm text-gray-600 bg-gray-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-gray-500 text-sm">ไม่พบคำถามที่ตรงกับการค้นหา</div>
          )}
        </div>
      </div>
    </div>
  );
}
