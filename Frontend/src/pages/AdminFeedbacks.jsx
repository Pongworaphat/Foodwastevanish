import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AdminFeedbacks() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [newPassword, setNewPassword] = useState("");

    const resetPassword = async (userId) => {
        try {

            const token =
                localStorage.getItem("authToken");

            await axios.put(
                `http://localhost:5000/api/user/${userId}/reset-password`,
                {
                    password: newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Password Reset Success");

            setNewPassword("");

        } catch (err) {
            console.error(err);
            alert("Reset Failed");
        }
    };

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

                                <td className="p-4 flex gap-2">

                                    <button
                                        onClick={() => setSelectedFeedback(item)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                    >
                                        View
                                    </button>

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
            {selectedFeedback && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white rounded-2xl p-6 w-full max-w-xl">

                        <h2 className="text-2xl font-bold mb-4">
                            Feedback Detail
                        </h2>

                        <div className="space-y-3">

                            <p>
                                <strong>User:</strong>{" "}
                                {selectedFeedback.user?.username}
                            </p>

                            <p>
                                <strong>Category:</strong>{" "}
                                {selectedFeedback.category}
                            </p>

                            <p>
                                <strong>Title:</strong>{" "}
                                {selectedFeedback.title}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {selectedFeedback.contactEmail}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {selectedFeedback.status}
                            </p>

                            <div>
                                <strong>Message:</strong>

                                <div className="mt-2 p-3 bg-slate-100 rounded-xl">
                                    {selectedFeedback.message}
                                </div>
                            </div>

                            <hr className="my-4" />

                            <h3 className="font-bold mb-2">
                                Reset Password
                            </h3>

                            <input
                                type="text"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                                placeholder="New Password"
                                className="w-full border rounded-lg px-3 py-2"
                            />

                            <button
                                onClick={() => resetPassword(selectedFeedback.user._id)}
                                className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                            >
                                Reset Password
                            </button>

                        </div>

                        <div className="mt-6 flex justify-end">

                            <button
                                onClick={() =>
                                    setSelectedFeedback(null)
                                }
                                className="bg-slate-800 text-white px-4 py-2 rounded-xl"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}