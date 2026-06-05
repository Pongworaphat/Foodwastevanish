import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import { MessageSquare } from "lucide-react";

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/feedback", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`http://localhost:5000/api/feedback/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFeedbacks();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 text-slate-800 font-sans antialiased">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Feedback</h1>
          <p className="text-sm text-slate-500 mt-1">กล่องรับความคิดเห็นและข้อเสนอแนะในการพัฒนาแอปพลิเคชัน</p>
        </div>
        <AdminSidebar />
      </div>

      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">⏳ Loading Feedbacks...</div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            <MessageSquare size={24} className="mx-auto mb-2 text-slate-300" />ไม่มีข้อเสนอแนะในระบบ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Title</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbacks.map((fb) => (
                  <tr key={fb._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-slate-900">{fb.user?.username || "Guest"}</td>
                    <td className="p-4 text-slate-600 font-medium">{fb.category}</td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{fb.title}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${fb.status === "resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {fb.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-center">
                      {fb.status === "pending" && (
                        <button onClick={() => handleResolve(fb._id)} className="bg-green-500 hover:bg-green-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all">
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}