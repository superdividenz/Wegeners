import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { currentUser, loading } = useContext(AuthContext);

  console.log("Dashboard rendering, currentUser:", currentUser, "loading:", loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div className="container mx-auto px-20 py-10">
      <h1 className="text-3xl font-bold mt-10 mb-4 flex justify-center">
        Job Dashboard
      </h1>
      {/* Rest of your dashboard content */}
    </div>
  );
};

export default Dashboard;
