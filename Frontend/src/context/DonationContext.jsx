import { createContext, useState, useContext, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

const DonationContext = createContext();

export const useDonations = () => useContext(DonationContext);

export const DonationProvider = ({ children }) => {
  const [backendDonations, setBackendDonations] = useState([]);
  const [overrides, setOverrides] = useState({}); // สเตตเก็บสัญญาณปุ่มกดเรียลไทม์ข้ามบราวเซอร์
  const [notifications, setNotifications] = useState([]);
  const currentUser =
    JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!currentUser?._id) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser._id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      data.sort(
        (a, b) =>
          (b.createdAt?.seconds || 0) -
          (a.createdAt?.seconds || 0)
      );

      setNotifications(data);
    });

    return () => unsubscribe();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/donations");
      const data = await res.json();
      setBackendDonations(data);
    } catch (err) {
      console.error("Fetch donations failed:", err);
    }
  };

  useEffect(() => {
    fetchDonations();

    const unsubscribe = onSnapshot(
      doc(db, "realtime", "donations"),
      () => {
        fetchDonations();
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "donation_status"), (snapshot) => {
      const newOverrides = {};
      snapshot.docs.forEach((doc) => {
        newOverrides[doc.id] = doc.data();
      });
      setOverrides(newOverrides);
    });
    return () => unsubscribe();
  }, []);

  const donations = backendDonations.map((d) => {
    const id = d._id || d.id;
    if (overrides[id]) {
      return { ...d, ...overrides[id] };
    }
    return d;
  });

  const addNotification = async (
    userId,
    text,
    type = "default"
  ) => {
    try {
      await addDoc(
        collection(db, "notifications"),
        {
          userId,
          text,
          type,
          read: false,
          createdAt: serverTimestamp(),
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {

      const unread = notifications.filter((n) => !n.read);

      await Promise.all(
        unread.map((n) =>
          updateDoc(
            doc(db, "notifications", n.id),
            {
              read: true,
            }
          )
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  const claimDonation = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`http://localhost:5000/api/donations/${id}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Claim failed");
      }

      const donation = backendDonations.find(
        (d) => (d._id || d.id) === id
      );

      if (donation?.donor?._id) {
        await addNotification(
          donation.donor._id,
          `${currentUser.username} claimed your donation 🤝`,
          "claim"
        );
      }

      await setDoc(doc(db, "realtime", "donations"), {
        updatedAt: serverTimestamp(),
      });

      fetchDonations();
    } catch (err) {
      console.error("Claim failed:", err);
    }
  };

  const completeDonation = async (id, role) => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        `http://localhost:5000/api/donations/${id}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Complete failed");
      }

      const currentOverride = overrides[id] || {
        ownerConfirmed: false,
        receiverConfirmed: false,
        status: "claimed",
      };

      const updated = {
        ownerConfirmed: currentOverride.ownerConfirmed || false,
        receiverConfirmed: currentOverride.receiverConfirmed || false,
        status: currentOverride.status || "claimed",
      };

      if (role === "owner") updated.ownerConfirmed = true;
      if (role === "receiver") updated.receiverConfirmed = true;

      if (updated.ownerConfirmed && updated.receiverConfirmed) {
        updated.status = "completed";
      }

      if (
        updated.ownerConfirmed &&
        updated.receiverConfirmed
      ) {
        updated.status = "completed";

        const donation = backendDonations.find(
          (d) => (d._id || d.id) === id
        );

        if (donation?.donor?._id) {
          await addNotification(
            donation.donor._id,
            `Donation "${donation.title}" completed successfully 🎉`,
            "completed"
          );
        }

        if (donation?.receiver?._id) {
          await addNotification(
            donation.receiver._id,
            `You received "${donation.title}" successfully 🎉`,
            "completed"
          );
        }
      }

      await setDoc(
        doc(db, "donation_status", id),
        updated,
        { merge: true }
      );

      await setDoc(doc(db, "realtime", "donations"), {
        updatedAt: serverTimestamp(),
      });

      fetchDonations();

    } catch (error) {
      console.error(error);
    }
  };

  const deleteDonation = (id) => {
    setBackendDonations((prev) => prev.filter((d) => (d._id || d.id) !== id));
  };

  return (
    <DonationContext.Provider
      value={{
        donations,
        claimDonation,
        setDonations: setBackendDonations,
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