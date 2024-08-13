import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  query,
  limit,
  addDoc,
  Timestamp,
} from "firebase/firestore";

const Dashboard = () => {
  const [upcomingGigs, setUpcomingGigs] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingDummyData, setIsAddingDummyData] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Fetch upcoming gigs
      const gigsQuery = query(collection(db, "gigs"), limit(3));
      const gigSnapshot = await getDocs(gigsQuery);
      const gigData = gigSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUpcomingGigs(gigData);

      // Fetch recent members
      const membersQuery = query(collection(db, "members"), limit(5));
      const memberSnapshot = await getDocs(membersQuery);
      const memberData = memberSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentMembers(memberData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const addDummyData = async () => {
    setIsAddingDummyData(true);
    try {
      // Add dummy gigs
      const gigsCollection = collection(db, "gigs");
      const dummyGigs = [
        {
          venue: "The Blue Note",
          date: Timestamp.fromDate(new Date(2023, 7, 15)),
          status: "upcoming",
        },
        {
          venue: "Red Rocks Amphitheatre",
          date: Timestamp.fromDate(new Date(2023, 8, 1)),
          status: "upcoming",
        },
        {
          venue: "Madison Square Garden",
          date: Timestamp.fromDate(new Date(2023, 8, 20)),
          status: "upcoming",
        },
      ];

      for (const gig of dummyGigs) {
        await addDoc(gigsCollection, gig);
      }

      // Add dummy members
      const membersCollection = collection(db, "members");
      const dummyMembers = [
        {
          name: "John Doe",
          instrument: "Guitar",
          joinDate: Timestamp.fromDate(new Date(2022, 1, 1)),
        },
        {
          name: "Jane Smith",
          instrument: "Vocals",
          joinDate: Timestamp.fromDate(new Date(2022, 2, 15)),
        },
        {
          name: "Mike Johnson",
          instrument: "Drums",
          joinDate: Timestamp.fromDate(new Date(2022, 3, 10)),
        },
        {
          name: "Sarah Williams",
          instrument: "Bass",
          joinDate: Timestamp.fromDate(new Date(2022, 4, 5)),
        },
        {
          name: "Tom Brown",
          instrument: "Keyboard",
          joinDate: Timestamp.fromDate(new Date(2022, 5, 20)),
        },
      ];

      for (const member of dummyMembers) {
        await addDoc(membersCollection, member);
      }

      console.log("Dummy data added successfully");
      await fetchDashboardData(); // Refresh the dashboard data
    } catch (error) {
      console.error("Error adding dummy data:", error);
    } finally {
      setIsAddingDummyData(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Band Management Dashboard</h1>

      {/* Add Dummy Data Button */}
      <button
        onClick={addDummyData}
        disabled={isAddingDummyData}
        className="mb-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
      >
        {isAddingDummyData ? "Adding Dummy Data..." : "Add Dummy Data"}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Gigs Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Gigs</h2>
          {upcomingGigs.length > 0 ? (
            <ul>
              {upcomingGigs.map((gig) => (
                <li key={gig.id} className="mb-2">
                  <span className="font-medium">{gig.venue}</span> -{" "}
                  {gig.date.toDate().toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming gigs scheduled.</p>
          )}
        </div>

        {/* Recent Members Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Members</h2>
          {recentMembers.length > 0 ? (
            <ul>
              {recentMembers.map((member) => (
                <li key={member.id} className="mb-2">
                  {member.name} - {member.instrument}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent members added.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
