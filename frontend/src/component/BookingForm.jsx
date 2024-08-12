import React, { useState } from "react";

const BookingForm = ({ onSubmit }) => {
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [payment, setPayment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ venue, date, time, payment });
    // Clear form fields after submission
    setVenue("");
    setDate("");
    setTime("");
    setPayment("");
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <input
        type="text"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        placeholder="Venue"
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
      />
      <input
        type="number"
        value={payment}
        onChange={(e) => setPayment(e.target.value)}
        placeholder="Payment"
        required
      />
      <button type="submit">Book Gig</button>
    </form>
  );
};

export default BookingForm;
