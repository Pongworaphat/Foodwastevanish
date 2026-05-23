import { createContext, useState, useContext, useEffect, } from "react";

const DonationContext = createContext();

export const useDonations = () => useContext(DonationContext);

export const DonationProvider = ({ children }) => {

  const [donations, setDonations] = useState([]);
  useEffect(() => {

    const fetchDonations = async () => {

      try {

        const res = await fetch(
          "http://localhost:5000/api/donations"
        );

        const data = await res.json();

        setDonations(data);

      } catch (err) {

        console.error("Fetch donations failed:", err);

      }
    };

    fetchDonations();

  }, []);

  const [notifications, setNotifications] = useState([]);


  const addNotification = (text, type = "default") => {

    const newNotification = {
      id: Date.now(),
      text,
      read: false,
      type,
      createdAt: Date.now(),
    };

    setNotifications((prev) => [
      newNotification,
      ...prev,
    ].slice(0, 10));
  };

  const markAllNotificationsAsRead = () => {

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );

  };

  const claimDonation = (id, userId) => {

    addNotification(
      "Someone claimed your donation 🤝",
      "claim"
    );

    setDonations((prev) =>
      prev.map((d) =>
        d._id === id
          ? { ...d, receiver: userId, status: "claimed" }
          : d
      )
    );
  };

  const completeDonation = (id) => {

    addNotification(
      "Donation completed ✅",
      "complete"
    );

    setDonations((prev) =>
      prev.map((d) =>
        d._id === id
          ? { ...d, status: "completed" }
          : d
      )
    );
  };

  const deleteDonation = (id) => {
    setDonations((prev) =>
      prev.filter((d) =>
        (d._id || d.id) !== id
      )
    );
  };

  return (
    <DonationContext.Provider
      value={{
        donations,
        setDonations,
        claimDonation,
        completeDonation,
        deleteDonation,
        notifications,
        addNotification,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};