import React from "react";
import Calendar from "../components/Calendar";
import GigListItem from "../components/GigListItem";

const Dashboard = () => {
  // You would typically fetch this data from your Firebase backend
  const upcomingGigs = [
    { venue: "Rock Arena", date: "2024-08-15", time: "20:00", payment: 1000 },
    { venue: "Jazz Club", date: "2024-08-20", time: "21:00", payment: 800 },
  ];

  const calendarEvents = upcomingGigs.map((gig) => ({
    title: `Gig at ${gig.venue}`,
    date: gig.date,
  }));

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <section>
        <h2>Upcoming Gigs</h2>
        {upcomingGigs.map((gig, index) => (
          <GigListItem key={index} {...gig} />
        ))}
      </section>
      <section>
        <h2>Calendar</h2>
        <Calendar events={calendarEvents} />
      </section>
    </div>
  );
};

export default Dashboard;
