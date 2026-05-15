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
    setDonations((prev) =>
      prev.map((d) =>
        d.id === id
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
        addDonation,
        claimDonation,
        completeDonation,
        deleteDonation,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};