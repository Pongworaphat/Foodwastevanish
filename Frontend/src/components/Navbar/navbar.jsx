import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import NotificationBell from "./NotificationBell";
import UserMenu from "./DropdownMenu/UserMenu";
import ButtonSignIn from "./ButtonSingin";

export default function Navbar() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const checkSignedIn = () => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    setIsSignedIn(Boolean(token || user));
  };

  useEffect(() => {
    checkSignedIn();
  }, [location]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authToken" || e.key === "user") {
        checkSignedIn();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsSignedIn(false);
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between px-8 py-3 bg-white shadow-sm">
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-1">
        <span className="w-8 h-8">
          <img src="/src/assets/imgfoodwaste/Logofoodwaste.png" alt="logo" />
        </span>
        <span className="font-bold text-lg">Foodwaste</span>
        <span className="font-bold text-lg text-green-600">vanish</span>
      </Link>

      <div className="hidden md:flex space-x-6 text-lg text-gray-700">
        <Link to="/browse" className="hover:text-green-600">Browse Donations</Link>
        <Link to="/mydonations" className="hover:text-green-600">My Donations</Link>
        <Link to="/received" className="hover:text-green-600">Received</Link>
      </div>

      <div className="flex items-center space-x-4">
        <Link
          to="/donate"
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Donate Food
        </Link>

        {isSignedIn && (
          <div className="relative">
            <NotificationBell isSignedIn={isSignedIn} />
          </div>
        )}

        <div className="flex justify-center items-center w-42">
          {!isSignedIn ? (
            <Link to="/signin" className="flex items-center h-10">
              <ButtonSignIn />
            </Link>
          ) : (
            <UserMenu onSignOut={handleSignOut} />
          )}
        </div>
      </div>
    </nav>
  );
}
