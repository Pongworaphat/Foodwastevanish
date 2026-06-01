import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AdminFeedbacks() {
    const [feedbacks, setFeedbacks] = useState([]);

    const token = localStorage.getItem("authToken");

    const fetchFeedbacks = async () => {
        try {
            const res = await axios.get(
                "http://localhost:5000/api/feedback",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setFeedbacks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const resolveFeedback = async (id) => {
        try {
            await axios.put(
                `http://localhost:5000/api/feedback/${id}/resolve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            fetchFeedbacks();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-4xl font-bold mb-6">
                Feedback Management
            </h1>

            <div className="mb-6 flex gap-3">

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

            <div className="bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 text-left">Category</th>
                            <th className="p-4 text-left">User</th>
                            <th className="p-4 text-left">Title</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {feedbacks.map((item) => (
                            <tr
                                key={item._id}
                                className="border-t"
                            >
                                <td className="p-4">
                                    {item.category}
                                </td>

                                <td className="p-4">
                                    {item.user?.username}
                                </td>

                                <td className="p-4">
                                    {item.title}
                                </td>

                                <td className="p-4">
                                    {item.status}
                                </td>

                                <td className="p-4">
                                    {item.status === "pending" && (
                                        <button
                                            onClick={() =>
                                                resolveFeedback(item._id)
                                            }
                                            className="bg-green-500 text-white px-4 py-2 rounded"
                                        >
                                            Resolve
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}