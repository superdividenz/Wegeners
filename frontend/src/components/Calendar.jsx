import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "../firebase/firebase"; // Adjust the import path as necessary
import { collection, getDocs } from "firebase/firestore";

const CalendarComponent = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [nextWeekActivities, setNextWeekActivities] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, "jobs");
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchNextWeekActivities = () => {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      const activities = events.filter((event) => {
        const eventDate = new Date(event.date.seconds * 1000);
        return eventDate >= today && eventDate < nextWeek;
      });
      setNextWeekActivities(activities);
    };

    fetchNextWeekActivities();
  }, [events]);

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const eventDates = events.map((event) =>
        new Date(event.date.seconds * 1000).toDateString()
      );
      if (eventDates.includes(date.toDateString())) {
        return "bg-blue-500 text-white rounded-full"; // Highlight event dates
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-start min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mb-4 md:mb-0 md:mr-4">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
          Calendar
        </h2>
        <Calendar
          onChange={setDate}
          value={date}
          tileClassName={tileClassName}
          className="border-none"
        />
        <p className="mt-4 text-center text-gray-600">
          Selected Date: {date.toDateString()}
        </p>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
          Next Week's Activities
        </h2>
        {nextWeekActivities.length > 0 ? (
          <ul className="space-y-2">
            {nextWeekActivities.map((activity) => (
              <li key={activity.id} className="border-b pb-2">
                <p className="font-semibold">{activity.title}</p>
                <p className="text-gray-600">
                  {new Date(activity.date.seconds * 1000).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600">
            No activities scheduled for next week.
          </p>
        )}
      </div>
    </div>
  );
};

export default CalendarComponent;
