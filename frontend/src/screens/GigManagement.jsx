import React from "react";
import GigListItem from "../components/GigListItem";
import BookingForm from "../components/BookingForm";

const GigManagement = () => {
  // You would typically fetch this data from your Firebase backend
  const gigs = [
    { venue: "Rock Arena", date: "2024-08-15", time: "20:00", payment: 1000 },
    { venue: "Jazz Club", date: "2024-08-20", time: "21:00", payment: 800 },
    {
      venue: "Music Festival",
      date: "2024-09-01",
      time: "14:00",
      payment: 1500,
    },
  ];

  const handleBooking = (newGig) => {
    // Here you would typically save the new gig to your Firebase backend
    console.log("New gig booked:", newGig);
  };

  return (
    <div className="gig-management">
      <h1>Gig Management</h1>
      <section>
        <h2>All Gigs</h2>
        {gigs.map((gig, index) => (
          <GigListItem key={index} {...gig} />
        ))}
      </section>
      <section>
        <h2>Book a New Gig</h2>
        <BookingForm onSubmit={handleBooking} />
      </section>
    </div>
  );
};

export default GigManagement;
