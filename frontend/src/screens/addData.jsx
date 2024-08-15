import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import Modal from "../components/Modal";

const AddData = () => {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchLastName, setSearchLastName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const db = getFirestore();
    const jobsRef = collection(db, "jobs");
    const jobSnapshot = await getDocs(jobsRef);
    const jobList = jobSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setJobs(jobList);
  };

  const searchJobByLastName = async () => {
    const db = getFirestore();
    const jobsRef = collection(db, "jobs");
    const q = query(jobsRef, where("lastName", "==", searchLastName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const jobData = querySnapshot.docs[0].data();
      setSelectedJob({ id: querySnapshot.docs[0].id, ...jobData });
      setIsModalOpen(true);
      Object.keys(jobData).forEach((key) => setValue(key, jobData[key]));
    } else {
      console.log("No job found with this last name!");
    }
  };

  const onSubmit = async (data) => {
    const db = getFirestore();
    const jobsRef = collection(db, "jobs");
    const jobData = {
      ...data,
      date: Timestamp.fromDate(new Date(data.date)),
      timestamp: new Date().toISOString(),
    };

    try {
      if (selectedJob) {
        await updateDoc(doc(db, "jobs", selectedJob.id), jobData);
        setSuccessMessage("Job updated successfully");
      } else {
        await addDoc(jobsRef, jobData);
        setSuccessMessage("Job added successfully");
      }
      reset();
      setIsModalOpen(false);
      setSelectedJob(null);
      fetchJobs();

      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding/updating job: ", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {successMessage && (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        <div className="mb-6 text-center">
          <input
            type="text"
            placeholder="Enter Last Name"
            value={searchLastName}
            onChange={(e) => setSearchLastName(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchJobByLastName}
            className="bg-blue-500 text-white px-4 py-2 mt-3 rounded-md hover:bg-blue-600 transition duration-200 w-full"
          >
            Search by Last Name
          </button>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register("firstName", { required: true })}
              placeholder="First Name"
              className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("lastName", { required: true })}
              placeholder="Last Name"
              className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("email", { required: true })}
              placeholder="Email"
              className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("address", { required: true })}
              placeholder="Address"
              className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("date", { required: true })}
              type="date"
              className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("time", { required: true })}
              type="time"
              className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("yardage", { required: true })}
              placeholder="Yardage"
              className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              {...register("description", { required: true })}
              placeholder="Description"
              className="border border-gray-300 p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200 w-full"
            >
              Submit
            </button>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default AddData;
