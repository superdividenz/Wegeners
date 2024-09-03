import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaInfoCircle,
  FaDollarSign,
  FaComment,
  FaLink,
} from "react-icons/fa";

const SharedJobView = () => {
  const { shareId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [showCommentArea, setShowCommentArea] = useState(false);

  useEffect(() => {
    const fetchSharedJob = async () => {
      try {
        const shareRef = doc(db, "shared_jobs", shareId);
        const shareDoc = await getDoc(shareRef);
        if (shareDoc.exists()) {
          const data = shareDoc.data();
          if (new Date(data.expiresAt.toDate()) > new Date()) {
            setJob(data);
            setComment(data.comment || "");
          } else {
            setError("This shared link has expired.");
          }
        } else {
          setError("Shared job not found.");
        }
      } catch (err) {
        setError("Error fetching shared job.");
      } finally {
        setLoading(false);
      }
    };
    fetchSharedJob();
  }, [shareId]);

  useEffect(() => {
    if (job) {
      document.title = `Job Details: ${job.name}`;
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute("content", `Details for job: ${job.name}`);
      }
    }
  }, [job]);

  const handleCommentSubmit = async () => {
    try {
      const shareRef = doc(db, "shared_jobs", shareId);
      await updateDoc(shareRef, { comment });
      setJob((prevJob) => ({ ...prevJob, comment }));
      setShowCommentArea(false);
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const handleEmailShare = () => {
    if (job) {
      const subject = encodeURIComponent(`Job Details: ${job.name}`);
      const body = encodeURIComponent(
        `Check out this job: ${window.location.href}`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };

  const handleSMSShare = () => {
    const message = encodeURIComponent(
      `Check out this job: ${window.location.href}`
    );
    window.location.href = `sms:?&body=${message}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert("Link copied to clipboard!"))
      .catch((err) => console.error("Failed to copy: ", err));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-red-500">
        {error}
      </div>
    );
  if (!job)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        No job data available.
      </div>
    );

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {job.name || "Unnamed Job"}
            </h1>
            {job.completed !== undefined && (
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  job.completed
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {job.completed ? "Completed" : "Not Completed"}
              </span>
            )}
          </div>

          <div className="p-6 space-y-4">
            {job.address && (
              <p className="flex items-center text-gray-700">
                <FaMapMarkerAlt className="mr-3 text-gray-500" /> {job.address}
              </p>
            )}

            {job.date && (
              <p className="flex items-center text-gray-700">
                <FaCalendarAlt className="mr-3 text-gray-500" /> {job.date}
              </p>
            )}

            {job.description && (
              <p className="flex items-center text-gray-700">
                <FaInfoCircle className="mr-3 text-gray-500" />{" "}
                {job.description}
              </p>
            )}

            {job.price && (
              <p className="flex items-center text-gray-700">
                <FaDollarSign className="mr-3 text-gray-500" /> {job.price}
              </p>
            )}

            {job.comment && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="flex items-center text-gray-700 mb-2">
                  <FaComment className="mr-3 text-gray-500" /> Comment:
                </p>
                <p className="text-gray-600 italic">{job.comment}</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-6">
            <button
              onClick={() => setShowCommentArea(!showCommentArea)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              {showCommentArea ? "Hide Comment Area" : "Add Comment"}
            </button>

            {showCommentArea && (
              <div className="mt-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your comment here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
                <button
                  onClick={handleCommentSubmit}
                  className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                  Submit Comment
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-100 p-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleEmailShare}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              <FaEnvelope className="mr-2" /> Share via Email
            </button>
            <button
              onClick={handleSMSShare}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              <FaPhone className="mr-2" /> Share via SMS
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              <FaLink className="mr-2" /> Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedJobView;
