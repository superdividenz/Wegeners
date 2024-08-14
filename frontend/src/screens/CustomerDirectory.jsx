// src/screens/CustomerDirectory.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import CustomerCard from "../components/CustomerCard";

const CustomerDirectory = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerData = async () => {
    try {
      const customersCollection = collection(db, "customers");
      const customerSnapshot = await getDocs(customersCollection);
      const customerData = customerSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(customerData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customer data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="customer-directory">
      <h1>Customer Directory</h1>
      <div className="customer-list">
        {customers.length > 0 ? (
          customers.map((customer) => (
            <CustomerCard key={customer.id} {...customer} />
          ))
        ) : (
          <p>No customers found.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerDirectory;
