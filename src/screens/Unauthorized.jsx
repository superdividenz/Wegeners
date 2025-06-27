import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Lock className="text-red-500 w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-700 mb-6">You do not have permission to view this page.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
