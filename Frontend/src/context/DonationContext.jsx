import { createContext, useContext, useState } from "react";

const DonationContext = createContext();

export const useDonations = () => useContext(DonationContext);

export const DonationProvider = ({ children }) => {
  const [donations, setDonations] = useState([]);

  const addDonation = (donation) => {
    setDonations((prev) => [...prev, donation]);
  };

  const claimDonation = (id, userId) => {
    setDonations((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, claimedBy: userId, status: "claimed" }
          : d
      )
    );
  };

  const completeDonation = (id) => {
    setDonations(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, status: "completed" }
          : d
      )
    );
  };

  return (
    <DonationContext.Provider value={{ donations, addDonation, claimDonation, completeDonation }}>
      {children}
    </DonationContext.Provider>
  );
};