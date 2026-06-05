import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../components/AdminSidebar";
import { Search, Trash2, ShieldCheck, ShieldAlert, Calendar, Mail } from "lucide-react";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/user");
                setUsers(res.data);
            } catch (error) { console.error("Failed to fetch users", error); }
        };
        fetchUsers();
    }, []);

    const changeRole = async (id, role) => {
        try {
            await axios.put(`http://localhost:5000/api/user/${id}/role`, { role });
            setUsers(users.map((u) => u._id === id ? { ...u, role } : u));
        } catch (err) { console.error(err); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("ต้องการลบผู้ใช้งานรายนี้ใช่หรือไม่?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/user/${id}`);
            setUsers(users.filter((u) => u._id !== id));
        } catch (err) { console.error(err); }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.username?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-100 p-8 text-slate-800 font-sans antialiased">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">User Management</h1>
                    <p className="text-sm text-slate-500 mt-1">ตรวจสอบสิทธิ์ เปลี่ยนสถานะ และจัดการผู้ใช้งานในระบบทั้งหมด</p>
                </div>
                <AdminSidebar />
            </div>

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none"><Search size={18} /></span>
                    <input
                        type="text"
                        placeholder="Search username or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
                <div className="text-sm font-medium text-slate-500 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
                    Registered Users: <span className="text-slate-900 font-bold">{filteredUsers.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow border border-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                <th className="p-4 pl-6">Username</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Created</th>
                                <th className="p-4 pr-6 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 pl-6 font-semibold text-slate-900">{user.username}</td>
                                        <td className="p-4 text-slate-600">
                                            <div className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /><span>{user.email}</span></div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === "admin" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                                                <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />{user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /><span>{new Date(user.createdAt).toLocaleDateString()}</span></div>
                                        </td>
                                        <td className="p-4 pr-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => changeRole(user._id, user.role === "admin" ? "user" : "admin")}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-xs border shadow-sm transition-colors ${user.role === "admin" ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-300" : "bg-blue-500 hover:bg-blue-600 text-white border-transparent"}`}
                                                >
                                                    {user.role === "admin" ? (<><ShieldAlert size={13} />Demote</>) : (<><ShieldCheck size={13} />Promote</>)}
                                                </button>
                                                <button onClick={() => deleteUser(user._id)} className="inline-flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-3 py-1.5 rounded-xl shadow-sm transition-colors">
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-medium bg-slate-50/30">🔍 ไม่พบข้อมูลผู้ใช้งานที่ค้นหา</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}