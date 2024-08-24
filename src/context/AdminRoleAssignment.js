// context/AdminRoleAssignment.js
import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const AdminRoleAssignment = () => {
  const [uid, setUid] = useState("");

  const handleAssignRole = async () => {
    try {
      await setDoc(doc(db, "users", uid), { role: "admin" });
      console.log("Admin role assigned successfully");
    } catch (error) {
      console.error("Error assigning admin role: ", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter User UID"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
      />
      <button onClick={handleAssignRole}>Assign Admin Role</button>
    </div>
  );
};

export default AdminRoleAssignment;