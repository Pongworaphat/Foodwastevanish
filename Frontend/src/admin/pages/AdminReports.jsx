import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import { Search, AlertCircle } from "lucide-react";

export default function AdminReports() {
    const [reports, setReports] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => { fetchReports(); }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await axios.get("http://localhost:5000/api/reports", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReports(res.data);
        } catch (err) { console.error("Failed to fetch reports", err); }
    };

    const handleResolve = async (id) => {
        try {
            const token = localStorage.getItem("authToken");
            await axios.patch(`http://localhost:5000/api/reports/${id}/resolve`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchReports();
        } catch (err) { console.error(err); }
    };

    const filteredReports = reports.filter(
        (report) =>
            report.reason?.toLowerCase().includes(search.toLowerCase()) ||
            report.reporter?.username?.toLowerCase().includes(search.toLowerCase()) ||
            report.reportedUser?.username?.toLowerCase().includes(search.toLowerCase()) ||
            report.donation?.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-100 p-8 text-slate-800 font-sans antialiased">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Report Management</h1>
                    <p className="text-sm text-slate-500 mt-1">ตรวจสอบความพึงพอใจและเคสรายงานปัญหาจากสมาชิก</p>
                </div>
                <AdminSidebar />
            </div>

            <div className="mb-6 flex justify-between items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm text-slate-700">
                    Total Reports: <span className="text-slate-900 font-bold">{filteredReports.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">Reporter</th>
                                <th className="p-4">Reported User</th>
                                <th className="p-4">Donation</th>
                                <th className="p-4">Reason</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 pr-6 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReports.length > 0 ? (
                                filteredReports.map((report) => (
                                    <tr key={report._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 pl-6 font-semibold text-slate-900">{report.reporter?.username}</td>
                                        <td className="p-4 text-slate-600">{report.reportedUser?.username}</td>
                                        <td className="p-4 text-slate-600 max-w-[150px] truncate">{report.donation?.title}</td>
                                        <td className="p-4 text-slate-500 max-w-xs truncate">{report.reason}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.status === "resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-center">
                                            {report.status === "pending" && (
                                                <button onClick={() => handleResolve(report._id)} className="bg-green-500 hover:bg-green-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all">
                                                    Resolve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                                        <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" />No reports found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}