// SharedDayJobsView.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

const SharedDayJobsView = () => {
  const { shareId } = useParams();
  const [sharedJobs, setSharedJobs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedJobs = async () => {
      try {
        const shareRef = doc(db, "shared_day_jobs", shareId);
        const shareDoc = await getDoc(shareRef);
        if (shareDoc.exists()) {
          setSharedJobs(shareDoc.data());
        }
      } catch (error) {
        console.error("Error fetching shared jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedJobs();
  }, [shareId]);

  if (loading) return <div>Loading...</div>;
  if (!sharedJobs) return <div>Shared jobs not found or link has expired.</div>;

  return (
    <div>
      <h1>Shared Jobs {sharedJobs.date}</h1>
      <ul>
        {sharedJobs.jobs.map((job) => (
          <li key={job.id}>
            {job.name} - {job.address}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SharedDayJobsView;
