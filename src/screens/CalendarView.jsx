import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarView = ({ jobs, bids, selectedDate, onDateChange }) => {
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const formattedDate = date.toISOString().split("T")[0];

    // Ensure jobs and bids are arrays and have a date property
    const hasJob =
      Array.isArray(jobs) &&
      jobs.some((job) => job.date && job.date.split("T")[0] === formattedDate);
    const hasBid =
      Array.isArray(bids) &&
      bids.some((bid) => bid.date && bid.date.split("T")[0] === formattedDate);

    if (hasJob && hasBid) return <div className="has-event has-job has-bid" />;
    if (hasJob) return <div className="has-event has-job" />;
    if (hasBid) return <div className="has-event has-bid" />;
    return null;
  };

  return (
    <Calendar
      onChange={onDateChange}
      value={selectedDate}
      tileContent={tileContent}
    />
  );
};

export default CalendarView;
