import { useState } from "react";
import { useDonations } from "../../context/DonationContext";
import AdminSidebar from "../components/AdminSidebar";
import { Search, Trash2, User, Tag } from "lucide-react";

export default function AdminDonations() {
    const { donations, deleteDonation } = useDonations();
    const [search, setSearch] = useState("");

    const filteredDonations = donations.filter(
        (item) =>
            item.title?.toLowerCase().includes(search.toLowerCase()) ||
            item.category?.toLowerCase().includes(search.toLowerCase()) ||
            item.donor?.username?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case "available": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "claimed": return "bg-amber-50 text-amber-700 border-amber-200";
            case "completed": return "bg-rose-50 text-rose-700 border-rose-200";
            default: return "bg-slate-50 text-slate-600 border-slate-200";
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 text-slate-800 font-sans antialiased">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Donation Management</h1>
                    <p className="text-sm text-slate-500 mt-1">จัดการและตรวจสอบรายการบริจาคอาหารทั้งหมดในระบบ</p>
                </div>
                <AdminSidebar />
            </div>

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search food, category or donor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <div className="text-sm font-medium text-slate-500 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
                    Total Items: <span className="text-slate-900 font-bold">{filteredDonations.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                <th className="p-4 pl-6">Food</th>
                                <th className="p-4">Donor</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-6 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredDonations.length > 0 ? (
                                filteredDonations.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 pl-6 font-semibold text-slate-900 max-w-[240px] truncate">{item.title}</td>
                                        <td className="p-4 text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><User size={14} /></div>
                                                <span className="font-medium">{item.donor?.username || "Unknown"}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            <div className="flex items-center gap-1.5"><Tag size={14} className="text-slate-400" /><span>{item.category}</span></div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(item.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />{item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-center">
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm(`ต้องการลบรายการ "${item.title}" ใช่หรือไม่?`)) {
                                                        try {
                                                            const token = localStorage.getItem("authToken");
                                                            await fetch(`http://localhost:5000/api/donations/${item._id}`, {
                                                                method: "DELETE",
                                                                headers: { Authorization: `Bearer ${token}` },
                                                            });
                                                            deleteDonation(item._id);
                                                        } catch (error) { console.error(error); }
                                                    }
                                                }}
                                                className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors"
                                            >
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-slate-400 font-medium bg-slate-50/30">📭 ไม่พบข้อมูลรายการบริจาคที่ค้นหา</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}