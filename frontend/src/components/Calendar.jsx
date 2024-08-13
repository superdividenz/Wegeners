import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from '../firebase/firebase'; // Adjust the import path as necessary
import { collection, getDocs } from 'firebase/firestore';

const CalendarComponent = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const onChange = (newDate) => {
    setDate(newDate);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const eventDates = events.map(event => new Date(event.date.seconds * 1000).toDateString());
      if (eventDates.includes(date.toDateString())) {
        return 'bg-blue-500 text-white rounded-full'; // Highlight event dates
      }
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Calendar</h2>
      <Calendar
        onChange={onChange}
        value={date}
        tileClassName={tileClassName}
        className="border-none"
      />
      <p className="mt-4">Selected Date: {date.toDateString()}</p>
    </div>
  );
};

export default CalendarComponent;