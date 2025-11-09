// src/components/DropdownMenu/UserMenu.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function UserMenu({ onSignOut }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const [user, setUser] = useState(null);

  const backendUrl = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_URL)
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:5000";

  const loadUserFromStorage = () => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setUser(null);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.avatar && typeof parsed.avatar === "string") {
        // ถ้าเป็น relative path ที่เริ่มด้วย /uploads ให้ชี้ไป backend
        if (parsed.avatar.startsWith("/uploads")) {
          parsed.avatar = `${backendUrl}${parsed.avatar}`;
        } else if (parsed.avatar.startsWith("/")) {
          // ถ้าเป็น path อื่น ๆ ที่เริ่มด้วย / ก็ให้เติม backend ด้วยเช่นกัน
          parsed.avatar = `${backendUrl}${parsed.avatar}`;
        }
        // ถ้าเป็น full URL อยู่แล้ว (http/https) ก็ปล่อยไป
      }
      setUser(parsed);
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      setUser(null);
    }
  };

  // ตอน mount ให้โหลด user
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        loadUserFromStorage();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const onUserUpdated = () => loadUserFromStorage();
    window.addEventListener("user:updated", onUserUpdated);
    return () => window.removeEventListener("user:updated", onUserUpdated);
  }, []);

  // ปิดเมนูเมื่อคลิกนอก
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const MenuLink = ({ to, children }) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-150"
    >
      {children}
    </Link>
  );

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/4140/4140037.png";

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen(!open)} className="focus:outline-none">
        <img
          src={user?.avatar || defaultAvatar}
          alt="User"
          className="w-9 h-9 rounded-full border border-gray-200 hover:opacity-90 transition-opacity object-cover"
          onError={(e) => { e.currentTarget.src = defaultAvatar; }}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
            <img
              src={user?.avatar || defaultAvatar}
              alt="User"
              className="w-11 h-11 rounded-full border object-cover"
              onError={(e) => { e.currentTarget.src = defaultAvatar; }}
            />
            <div>
              <div className="font-semibold text-gray-800">{user?.username || "ผู้ใช้"}</div>
              <div className="text-xs text-gray-500">{user?.email || "—"}</div>
            </div>
          </div>

          <div className="py-1">
            <MenuLink to="/profile">
              <span>จัดการโปรไฟล์</span>
            </MenuLink>
            <MenuLink to="/settings">
              <span>การตั้งค่า</span>
            </MenuLink>
          </div>

          <div className="border-t border-gray-100" />
          <div className="py-1">
            <MenuLink to="/help">
              <span>ความช่วยเหลือ</span>
            </MenuLink>
            <MenuLink to="/feedback">
              <span>ส่งความคิดเห็น</span>
            </MenuLink>
          </div>

          <div className="border-t border-gray-100" />
          <div className="p-1">
            <button
              onClick={() => {
                setOpen(false);
                if (typeof onSignOut === "function") onSignOut();
              }}
              className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
            >
              <span className="font-medium">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
