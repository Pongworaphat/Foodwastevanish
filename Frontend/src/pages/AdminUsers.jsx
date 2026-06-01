import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function AdminUsers() {

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {

        const fetchUsers = async () => {
            try {

                const res = await axios.get(
                    "http://localhost:5000/api/user"
                );

                setUsers(res.data);

            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };

        fetchUsers();

    }, []);

    const changeRole = async (
        id,
        role
    ) => {
        try {

            await axios.put(
                `http://localhost:5000/api/user/${id}/role`,
                { role }
            );

            setUsers(
                users.map((u) =>
                    u._id === id
                        ? { ...u, role }
                        : u
                )
            );

        } catch (err) {
            console.error(err);
        }
    };

    const deleteUser = async (
        id
    ) => {

        if (
            !window.confirm(
                "Delete this user?"
            )
        )
            return;

        try {

            await axios.delete(
                `http://localhost:5000/api/user/${id}`
            );

            setUsers(
                users.filter(
                    (u) => u._id !== id
                )
            );

        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.username
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            user.email
                ?.toLowerCase()
                .includes(search.toLowerCase())
    );

    return (
        <div className="p-8">

            <h1 className="text-3xl font-bold mb-6">
                User Management
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

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="🔍 Search username or email..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="w-full max-w-md border rounded-xl px-4 py-3"
                />
            </div>

            <div className="bg-white shadow rounded-xl overflow-hidden">

                <table className="w-full">

                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-4 text-left">
                                Username
                            </th>

                            <th className="text-left">
                                Email
                            </th>

                            <th className="text-left">
                                Role
                            </th>

                            <th className="text-left">
                                Created
                            </th>

                            <th className="text-left">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody>

                        {filteredUsers.map((user) => (

                            <tr
                                key={user._id}
                                className="border-t"
                            >

                                <td className="p-4">
                                    {user.username}
                                </td>

                                <td>
                                    {user.email}
                                </td>

                                <td>

                                    <span
                                        className={`px-2 py-1 rounded text-sm font-medium ${user.role === "admin"
                                            ? "bg-red-100 text-red-600"
                                            : "bg-emerald-100 text-emerald-600"
                                            }`}
                                    >
                                        {user.role}
                                    </span>

                                </td>

                                <td>
                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString()}
                                </td>

                                <td>

                                    <button
                                        onClick={() =>
                                            changeRole(
                                                user._id,
                                                user.role === "admin"
                                                    ? "user"
                                                    : "admin"
                                            )
                                        }
                                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                    >
                                        {user.role === "admin"
                                            ? "Demote"
                                            : "Promote"}
                                    </button>

                                    <button
                                        onClick={() =>
                                            deleteUser(user._id)
                                        }
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}