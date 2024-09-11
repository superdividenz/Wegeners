import React from "react";

const EventList = ({ jobs, bids, selectedDate, onJobClick, onBidClick }) => {
  return (
    <div>
      <h2>Events for {selectedDate.toDateString()}</h2>
      {/* Implement the list of jobs and bids here */}
    </div>
  );
};

export default EventList;
