import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  collection as firestoreCollection,
  getDoc,
} from "firebase/firestore";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";

const AddData = () => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [searchname, setSearchLastName] = useState("");
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const handleSearch = async (e) => {
    const input = e.target.value;
    setSearchLastName(input);

    if (input.length > 0) {
      const db = getFirestore();
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef,
        where("name", ">=", input),
        where("name", "<=", input + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const jobsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMatchingJobs(jobsData);
    } else {
      setMatchingJobs([]);
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    Object.keys(job).forEach((key) => {
      setValue(key, job[key]);
    });
  };

  const onSubmit = async (data) => {
    if (!selectedJob) return;

    const db = getFirestore();
    const jobsRef = collection(db, "jobs");
    const q = query(
      jobsRef,
      where("name", "==", data.name),
      where("id", "!=", selectedJob.id)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("A job with this name already exists.");
      return;
    }

    const jobDocRef = doc(db, "jobs", selectedJob.id);

    try {
      await updateDoc(jobDocRef, data);
      alert("Job updated successfully");
      reset();
      setSelectedJob(null);
      setMatchingJobs([]); // Clear matching jobs after update
    } catch (error) {
      console.error("Error updating job: ", error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        console.log("Parsed CSV data:", results.data);
        const db = getFirestore();
        const jobsRef = collection(db, "jobs");

        // Get all existing jobs
        const existingJobsSnapshot = await getDocs(jobsRef);
        const existingJobs = new Map(
          existingJobsSnapshot.docs.map((doc) => [
            doc.data().name,
            { id: doc.id, ...doc.data() },
          ])
        );

        for (const row of results.data) {
          try {
            const existingJob = existingJobs.get(row.name);

            if (existingJob) {
              // Update existing job
              const docRef = doc(db, "jobs", existingJob.id);
              await updateDoc(docRef, { ...row, id: existingJob.id });
              existingJobs.set(row.name, { ...row, id: existingJob.id });
            } else {
              // Add new job
              const docId = uuidv4();
              const docRef = doc(db, "jobs", docId);
              await setDoc(docRef, { ...row, id: docId });
              existingJobs.set(row.name, { ...row, id: docId });
            }
          } catch (error) {
            console.error(
              "Error processing job from CSV:",
              error.message,
              error.stack
            );
          }
        }

        // Remove jobs that are not in the CSV
        for (const [name, job] of existingJobs) {
          if (!results.data.some((row) => row.name === name)) {
            await deleteDoc(doc(db, "jobs", job.id));
          }
        }

        alert("CSV data processed successfully");
        setMatchingJobs([]);
      },
      error: (error) => {
        console.error("Error parsing CSV: ", error);
      },
    });
  };

  const handleDownload = async () => {
    const db = getFirestore();
    const jobsRef = collection(db, "jobs");
    const querySnapshot = await getDocs(jobsRef);
    const allJobs = querySnapshot.docs.map((doc) => doc.data());

    const csv = Papa.unparse(allJobs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "all_jobs_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addEventToCalendar = async (jobData) => {
    const db = getFirestore();
    const eventsRef = firestoreCollection(db, "events");

    try {
      console.log("Attempting to add event to calendar for job:", jobData);

      // Check if an event with this jobId already exists
      const q = query(eventsRef, where("jobId", "==", jobData.id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No existing event found, so add a new one
        const eventData = {
          title: jobData.name,
          start: new Date(jobData.date).toISOString(),
          end: new Date(jobData.date).toISOString(),
          description: jobData.info || "",
          jobId: jobData.id,
        };

        const docRef = await addDoc(eventsRef, eventData);
        console.log("Event added to calendar successfully with ID:", docRef.id);
        console.log("Event data:", eventData);
      } else {
        console.log("Event already exists in calendar for job:", jobData.id);
      }
    } catch (error) {
      console.error("Error adding event to calendar: ", error);
      alert(
        "Error adding event to calendar. Please check console for details."
      );
    }
  };

  const handleAddJob = async (data) => {
    const db = getFirestore();
    const jobsRef = collection(db, "jobs");
    const q = query(jobsRef, where("name", "==", data.name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("A job with this name already exists.");
      return;
    }

    const docId = uuidv4();
    const docRef = doc(db, "jobs", docId);

    try {
      const jobData = { ...data, id: docId };
      await setDoc(docRef, jobData);
      console.log("Job added successfully:", jobData);

      // Add the job to the calendar
      await addEventToCalendar(jobData);

      alert("Job added successfully and event added to calendar");
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Error adding job: ", error);
      alert("Error adding job. Please check console for details.");
    }
  };

  const handleAddBid = async (data) => {
    const db = getFirestore();
    const bidsRef = collection(db, "bids");
    const q = query(bidsRef, where("name", "==", data.name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert("A bid with this name already exists.");
      return;
    }

    const docId = uuidv4();
    const docRef = doc(db, "bids", docId);

    try {
      const bidData = { ...data, id: docId, status: "pending" };
      await setDoc(docRef, bidData);
      console.log("Bid added successfully:", bidData);

      alert("Bid added successfully");
      setIsBidModalOpen(false);
      reset();
    } catch (error) {
      console.error("Error adding bid: ", error);
      alert("Error adding bid. Please check console for details.");
    }
  };

  const handleAcceptBid = async (bidId) => {
    const db = getFirestore();
    const bidRef = doc(db, "bids", bidId);
    const jobsRef = collection(db, "jobs");

    try {
      const bidSnapshot = await getDoc(bidRef);
      if (bidSnapshot.exists()) {
        const bidData = bidSnapshot.data();

        // Add to jobs collection
        const jobDocId = uuidv4();
        const jobDocRef = doc(db, "jobs", jobDocId);
        const jobData = { ...bidData, id: jobDocId };
        await setDoc(jobDocRef, jobData);

        // Add to calendar
        await addEventToCalendar(jobData);

        // Update bid status
        await updateDoc(bidRef, { status: "accepted" });

        alert("Bid accepted and added to jobs and calendar");
      } else {
        alert("Bid not found");
      }
    } catch (error) {
      console.error("Error accepting bid: ", error);
      alert("Error accepting bid. Please check console for details.");
    }
  };

  const handleClickOutside = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      setIsModalOpen(false);
      setIsBidModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-center text-4xl font-bold mb-6 text-gray-800">
        Customer Input
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <input
          type="text"
          value={searchname}
          onChange={handleSearch}
          placeholder="Search by Name"
          className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
        {matchingJobs.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {matchingJobs.map((job) => (
              <li
                key={job.id}
                className="p-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleJobClick(job)}
              >
                <span className="font-medium text-gray-700">{job.name}</span> -{" "}
                {job.name}
              </li>
            ))}
          </ul>
        )}
        {selectedJob && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-700">
              Edit Job Details
            </h3>

            <input
              {...register("name", { required: true })}
              placeholder="Name"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("email", { required: false })}
              placeholder="Email"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("phone", { required: false })}
              placeholder="Phone"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("address", { required: true })}
              placeholder="Address"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("date", { required: true })}
              type="text"
              placeholder="Date"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("price", { required: true })}
              type="Price"
              placeholder="Price"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              {...register("info", { required: false })}
              placeholder="Info"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600 transition duration-200 w-full"
            >
              Update
            </button>
          </form>
        )}
        <div className="mt-6">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleDownload}
            className="bg-blue-500 text-white px-4 py-3 mt-4 rounded-md hover:bg-blue-600 transition duration-200 w-full"
          >
            Download Data
          </button>
          <button
            onClick={() => setIsModalOpen(true)} // Open the modal on click
            className="bg-purple-500 text-white px-4 py-3 mt-4 rounded-md hover:bg-purple-600 transition duration-200 w-full"
          >
            Add Job Manually
          </button>
          <button
            onClick={() => setIsBidModalOpen(true)}
            className="bg-yellow-500 text-white px-4 py-3 mt-4 rounded-md hover:bg-yellow-600 transition duration-200 w-full"
          >
            Add Bid
          </button>
        </div>
      </div>

      {/* Modal for adding a job manually */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center modal-overlay"
          onClick={handleClickOutside}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-700 mb-4">
              Add New Job
            </h3>
            <form onSubmit={handleSubmit(handleAddJob)} className="space-y-4">
              <input
                {...register("name", { required: true })}
                placeholder="Name"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("email", { required: false })}
                placeholder="Email"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("phone", { required: false })}
                placeholder="Phone"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("address", { required: true })}
                placeholder="Address"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("date", { required: true })}
                type="text"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                {...register("price", { required: true })}
                placeholder="price"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                {...register("info", { required: false })}
                placeholder="info"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)} // Close the modal
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
                >
                  Add Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for adding a bid */}
      {isBidModalOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center modal-overlay"
          onClick={handleClickOutside}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-700 mb-4">
              Add New Bid
            </h3>
            <form onSubmit={handleSubmit(handleAddBid)} className="space-y-4">
              <input
                {...register("name", { required: true })}
                placeholder="Name"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("email", { required: false })}
                placeholder="Email"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("phone", { required: false })}
                placeholder="Phone"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("address", { required: true })}
                placeholder="Address"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("date", { required: true })}
                type="text"
                placeholder="Date"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                {...register("price", { required: true })}
                type="number"
                placeholder="Price"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                {...register("info", { required: false })}
                placeholder="Info"
                className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsBidModalOpen(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200"
                >
                  Add Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddData;
