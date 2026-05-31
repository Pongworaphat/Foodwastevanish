import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useDonations } from "../../context/DonationContext";

const NotificationBell = ({ isSignedIn }) => {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(isSignedIn);
  const dropdownRef = useRef(null);
  const { notifications, markAllNotificationsAsRead, } = useDonations();

  useEffect(() => {
    const stored = localStorage.getItem("isSignedIn") === "true";
    setSignedIn(isSignedIn || stored);
  }, [isSignedIn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const notificationStyles = {
    claim: {
      icon: "🤝",
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
    },

    message: {
      icon: "💬",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
    },

    complete: {
      icon: "✅",
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
    },

    default: {
      icon: "🔔",
      bg: "bg-gray-50",
      iconBg: "bg-gray-100",
    },
  };

  const formatTimeAgo = (timestamp) => {

    if (!timestamp) return "just now";

    const time =
      timestamp.seconds
        ? timestamp.seconds * 1000
        : timestamp;

    const seconds =
      Math.floor((Date.now() - time) / 1000);

    if (seconds < 60) {
      return "just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days}d ago`;
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* ปุ่มกระดิ่ง */}
      <button
        onClick={() => {

          setOpen(!open);

        }}
        className="relative p-2.5 rounded-full bg-white/70 backdrop-blur-md border border-white/40 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {notifications.filter((n) => !n.read).length > 0 && (
          <span className="
              absolute -top-1 -right-1
              min-w-[18px] h-[18px]
              px-1
              flex items-center justify-center
              rounded-full
              bg-red-500 text-white
              text-[10px] font-bold
            ">
            {notifications.filter((n) => !n.read).length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-h-[420px] overflow-y-auto rounded-2xl border border-white/30 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">

          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white/40 backdrop-blur-md">

            <h3 className="text-sm font-semibold text-gray-800">
              Notifications
            </h3>

            {notifications.some((n) => !n.read) && (
              <button
                onClick={() => {
                  markAllNotificationsAsRead();
                }}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Mark all read
              </button>
            )}

          </div>

          {signedIn ? (

            notifications.filter((n) => !n.read).length > 0 ? (

              notifications
                .filter((n) => !n.read)
                .map((notification) => {

                  const style =
                    notificationStyles[notification.type] ||
                    notificationStyles.default;

                  return (

                    <div
                      key={notification.id}
                      className={`
                        flex items-start gap-3
                        px-5 py-4
                        border-b border-gray-100/70

                        hover:bg-white/60
                        hover:translate-x-1

                        transition-all duration-200
                        cursor-pointer

                        ${style.bg}
                      `}
                    >

                      <div
                        className={`
                        w-10 h-10 rounded-full
                        flex items-center justify-center
                        text-lg shrink-0
                        ${style.iconBg}
                      `}
                      >
                        {style.icon}
                      </div>

                      <div className="flex-1">

                        <p className="text-sm text-gray-700 leading-relaxed">
                          {notification.text}
                        </p>

                        <span className="text-xs text-gray-400 mt-1 block">
                          {formatTimeAgo(notification.createdAt)}
                        </span>

                      </div>

                    </div>

                  );

                })

            ) : (

              <div className="py-12 flex flex-col items-center justify-center text-gray-400">

                <div className="text-3xl mb-2">
                  🔔
                </div>

                <p className="font-medium text-gray-500">
                  All caught up
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  No new notifications
                </p>

              </div>

            )
          ) : (
            <div className="py-10 text-center text-sm text-gray-400">
              กรุณาเข้าสู่ระบบเพื่อดูการแจ้งเตือน
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
