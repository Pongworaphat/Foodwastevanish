import { useEffect, useState } from "react";
import { useDonations } from "../context/DonationContext";
import { Link } from "react-router-dom";

export default function AdminDonations() {

    const { donations, deleteDonation } =
        useDonations();

    return (
        <div className="p-8">

            <h1 className="text-3xl font-bold mb-6">
                Donation Management
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

            <div className="bg-white rounded-xl shadow overflow-hidden">

                <table className="w-full">

                    <thead className="bg-slate-100">

                        <tr>

                            <th className="p-4 text-left">
                                Food
                            </th>

                            <th className="text-left">
                                Donor
                            </th>

                            <th className="text-left">
                                Category
                            </th>

                            <th className="text-left">
                                Status
                            </th>

                            <th className="text-left">
                                Action
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {donations.map((item) => (

                            <tr
                                key={item._id}
                                className="border-t"
                            >

                                <td className="p-4">
                                    {item.title}
                                </td>

                                <td>
                                    {item.donor?.username}
                                </td>

                                <td>
                                    {item.category}
                                </td>

                                <td>
                                    {item.status}
                                </td>

                                <td>
                                    <button
                                        onClick={async () => {

                                            try {

                                                const token = localStorage.getItem("authToken");

                                                console.log(token);

                                                await fetch(
                                                    `http://localhost:5000/api/donations/${item._id}`,
                                                    {
                                                        method: "DELETE",
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                    }
                                                );

                                                deleteDonation(item._id);

                                            } catch (error) {
                                                console.error(error);
                                            }
                                        }}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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