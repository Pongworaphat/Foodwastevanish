import { useEffect, useState } from "react";
import { useDonations } from "../../context/DonationContext";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import {
    LayoutDashboard,
    Gift,
    Users,
    MessageSquare,
    CheckCircle,
    Clock,
    Flame,
    Utensils
} from "lucide-react";

export default function AdminDashboard() {
    const { donations } = useDonations();
    const [users, setUsers] = useState([]);

    const available = donations.filter(d => d.status === "available").length;
    const claimed = donations.filter(d => d.status === "claimed").length;
    const completed = donations.filter(d => d.status === "completed").length;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/user");
                setUsers(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchUsers();
    }, []);

    const admins = users.filter(user => user.role === "admin").length;
    const mealsSaved = completed * 5;

    const categoryData = [
        {
            name: "Food Sharing",
            value: donations.filter(d => d.category === "Food Sharing").length,
            color: "bg-emerald-500",
        },
        {
            name: "Animal Food",
            value: donations.filter(d => d.category === "Animal Food").length,
            color: "bg-amber-500",
        },
        {
            name: "Organic Waste",
            value: donations.filter(d => d.category === "Organic Waste").length,
            color: "bg-lime-500",
        },
    ];

    const statusData = [
        { name: "Available", value: available, color: "bg-emerald-500" },
        { name: "Claimed", value: claimed, color: "bg-amber-500" },
        { name: "Completed", value: completed, color: "bg-red-500" },
    ];

    const maxCategoryValue = Math.max(...categoryData.map(c => c.value), 1);
    const totalStatusValue = (available + claimed + completed) || 1;

    return (
        <div className="min-h-screen bg-slate-100 p-8 text-slate-800 font-sans antialiased">

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Food Waste Vanish Admin</h1>
                    <p className="text-sm text-slate-500 mt-1">ระบบวิเคราะห์ข้อมูลและภาพรวมแดชบอร์ดจัดการแอปพลิเคชัน</p>
                </div>
                <AdminSidebar />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Donations Shared</h3>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{donations.length}</p>
                    </div>
                    <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Gift size={20} /></div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Available</h3>
                        <p className="text-3xl font-bold text-amber-600 mt-2">{available}</p>
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Claimed</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{claimed}</p>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Flame size={20} /></div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completed</h3>
                        <p className="text-3xl font-bold text-emerald-600 mt-2">{completed}</p>
                    </div>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle size={20} /></div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">People Helped</h3>
                        <p className="text-3xl font-bold text-purple-600 mt-2">{completed}</p>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20} /></div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Meals Saved</h3>
                        <p className="text-3xl font-bold text-emerald-600 mt-2">{mealsSaved}</p>
                    </div>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Utensils size={20} /></div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Users</h3>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{users.length}</p>
                    </div>
                    <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Users size={20} /></div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-all flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Admins</h3>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{admins}</p>
                    </div>
                    <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Users size={20} /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between">
                    <div className="mb-6">
                        <h4 className="text-lg font-bold text-slate-900">Donation Categories</h4>
                        <p className="text-xs text-slate-400 mt-1">สัดส่วนประเภทอาหารในระบบ</p>
                    </div>
                    <div className="h-64 flex items-end justify-around border-b border-l border-slate-300 px-4 pb-2 pt-8 relative bg-slate-50/50 rounded-tl-lg">
                        <div className="absolute inset-x-0 top-1/4 border-t border-slate-200/60 border-dashed pointer-events-none" />
                        <div className="absolute inset-x-0 top-2/4 border-t border-slate-200/60 border-dashed pointer-events-none" />
                        <div className="absolute inset-x-0 top-3/4 border-t border-slate-200/60 border-dashed pointer-events-none" />

                        {categoryData.map((item, index) => {
                            const heightPercent = item.value > 0 ? Math.round((item.value / maxCategoryValue) * 100) : 0;
                            return (
                                <div key={index} className="flex flex-col items-center justify-end h-full flex-1 group max-w-[85px] z-10 mx-2">
                                    <span className="text-xs font-bold text-slate-800 mb-2 bg-white border border-slate-300 px-2.5 py-0.5 rounded-md shadow-sm">
                                        {item.value}
                                    </span>
                                    <div className="w-full flex items-end" style={{ height: `${heightPercent}%` }}>
                                        <div className={`${item.color} w-full h-full rounded-t-md transition-all duration-700 shadow-md border border-white/10`} />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-500 mt-3 text-center truncate w-full" title={item.name}>
                                        {item.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow flex flex-col justify-between">
                    <div className="mb-6">
                        <h4 className="text-lg font-bold text-slate-900">Donation Status Ratio</h4>
                        <p className="text-xs text-slate-400 mt-1">สถานะการดำเนินการปัจจุบัน</p>
                    </div>
                    <div className="space-y-5 py-2">
                        {statusData.map((item, index) => {
                            const percentage = Math.round((item.value / totalStatusValue) * 100);
                            return (
                                <div key={index} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold text-slate-600 flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                            {item.name}
                                        </span>
                                        <span className="font-bold text-slate-900">{item.value} รายการ ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200/60">
                                        <div className={`${item.color} h-full rounded-full transition-all duration-750`} style={{ width: `${percentage}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}