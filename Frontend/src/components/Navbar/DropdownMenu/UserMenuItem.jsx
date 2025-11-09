import React from "react";
import UserMenu from "./DropdownMenu/UserMenu";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    return (
        <nav className="px-4 py-3 bg-white shadow">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div>Logo</div>
                <div className="flex items-center gap-3">
                    <UserMenu onSignOut={handleSignOut} />
                </div>
            </div>
        </nav>
    );
}
