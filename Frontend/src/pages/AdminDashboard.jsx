import { useEffect, useState } from "react";
import { useDonations } from "../context/DonationContext";
import { Link } from "react-router-dom";
import axios from "axios";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

export default function AdminDashboard() {
    const { donations } = useDonations();
    const [users, setUsers] = useState([]);

    const available = donations.filter(
        d => d.status === "available"
    ).length;

    const claimed = donations.filter(
        d => d.status === "claimed"
    ).length;

    const completed = donations.filter(
        d => d.status === "completed"
    ).length;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/user"
                );

                setUsers(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchUsers();
    }, []);

    const admins = users.filter(
        user => user.role === "admin"
    ).length;

    const mealsSaved = completed * 5;

    const categoryData = [
        {
            name: "Food Sharing",
            value: donations.filter(
                d => d.category === "Food Sharing"
            ).length,
        },
        {
            name: "Animal Food",
            value: donations.filter(
                d => d.category === "Animal Food"
            ).length,
        },
        {
            name: "Organic Waste",
            value: donations.filter(
                d => d.category === "Organic Waste"
            ).length,
        },
    ];

    const statusData = [
        {
            name: "Available",
            value: available,
        },
        {
            name: "Claimed",
            value: claimed,
        },
        {
            name: "Completed",
            value: completed,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-100 p-8">

            <h1 className="text-4xl font-bold mb-8">
                Food Waste Vanish Admin
            </h1>

            <div className="mt-4 mb-8 flex gap-3">

                <Link
                    to="/admin"
                    className="bg-slate-800 text-white px-5 py-3 rounded-xl"
                >
                    Dashboard
                </Link>

                <Link
                    to="/admin/donations"
                    className="bg-emerald-600 text-white px-5 py-3 rounded-xl"
                >
                    Donations
                </Link>

                <Link
                    to="/admin/users"
                    className="bg-blue-600 text-white px-5 py-3 rounded-xl"
                >
                    Users
                </Link>

                <Link
                    to="/admin/feedbacks"
                    className="bg-purple-600 text-white px-5 py-3 rounded-xl"
                >
                    Feedbacks
                </Link>

            </div>

            <div className="grid md:grid-cols-8 gap-4">

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Total Donations</h3>
                    <p className="text-3xl font-bold">
                        {donations.length}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Available</h3>
                    <p className="text-3xl font-bold">
                        {available}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Claimed</h3>
                    <p className="text-3xl font-bold">
                        {claimed}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Completed</h3>
                    <p className="text-3xl font-bold">
                        {completed}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>People Helped</h3>
                    <p className="text-3xl font-bold">
                        {completed}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Meals Saved</h3>
                    <p className="text-3xl font-bold">
                        {mealsSaved}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Total Users</h3>
                    <p className="text-3xl font-bold">
                        {users.length}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3>Total Admins</h3>
                    <p className="text-3xl font-bold">
                        {admins}
                    </p>
                </div>

            </div>
            

        </div>
    );
}