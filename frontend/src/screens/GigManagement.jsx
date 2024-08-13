import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import GigListItem from "../components/GigListItem";
import BookingForm from "../components/BookingForm";

const GigManagement = () => {
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    setIsLoading(true);
    try {
      const gigsCollection = collection(db, "gigs");
      const gigSnapshot = await getDocs(gigsCollection);
      const gigList = gigSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGigs(gigList);
    } catch (error) {
      console.error("Error fetching gigs:", error);
      setError("Failed to load gigs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const addGig = async (newGig) => {
    try {
      const gigWithTimestamp = {
        ...newGig,
        date: Timestamp.fromDate(new Date(newGig.date)),
      };
      const docRef = await addDoc(collection(db, "gigs"), gigWithTimestamp);
      console.log("Document written with ID: ", docRef.id);
      await fetchGigs(); // Refresh the gig list
    } catch (error) {
      console.error("Error adding gig:", error);
      setError("Failed to add gig. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gig Management</h1>
      <BookingForm onSubmit={addGig} />
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Gigs</h2>
        {gigs.length > 0 ? (
          gigs.map((gig) => <GigListItem key={gig.id} {...gig} />)
        ) : (
          <p>No gigs scheduled.</p>
        )}
      </div>
    </div>
  );
};

export default GigManagement;
