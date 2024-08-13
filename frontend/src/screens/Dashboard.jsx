import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

const Dashboard = () => {
  const [upcomingGigs, setUpcomingGigs] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Band Management Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Gigs Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Gigs</h2>
          {upcomingGigs.length > 0 ? (
            <ul>
              {upcomingGigs.map((gig) => (
                <li key={gig.id} className="mb-2">
                  <span className="font-medium">{gig.venue}</span> - {gig.date}
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

        {/* Quick Actions Section */}
        <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Add New Gig
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Add New Member
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded">
              Manage Equipment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
