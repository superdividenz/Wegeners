// Notification.jsx
import React from "react";

const Notification = ({ message }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm sm:text-base">
      {message}
    </div>
  );
};

export default Notification;
