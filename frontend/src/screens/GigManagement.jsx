import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import GigListItem from "../components/GigListItem";
import BookingForm from "../components/BookingForm";

const GigManagement = () => {
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    const fetchGigs = async () => {
      const gigsCollection = collection(db, "gigs");
      const gigSnapshot = await getDocs(gigsCollection);
      const gigList = gigSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGigs(gigList);
    };

    fetchGigs();
  }, []);

  const addGig = async (newGig) => {
    try {
      const docRef = await addDoc(collection(db, "gigs"), newGig);
      console.log("Document written with ID: ", docRef.id);
      // Refresh the gig list or add the new gig to the state
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div>
      <h1>Gig Management</h1>
      <BookingForm onSubmit={addGig} />
      {gigs.map((gig) => (
        <GigListItem key={gig.id} {...gig} />
      ))}
    </div>
  );
};

export default GigManagement;
