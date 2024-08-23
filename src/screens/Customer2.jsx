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
} from "firebase/firestore";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";

const Customer = () => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [searchname, setSearchLastName] = useState("");
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const jobDocRef = doc(db, "jobs", selectedJob.id);
    try {
      await updateDoc(jobDocRef, data);
      alert("Job updated successfully");
      reset();
      setSelectedJob(null);
      setMatchingJobs([]);
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
        for (const row of results.data) {
          try {
            const docId = row.id || uuidv4();
            const docRef = doc(db, "jobs", docId);
            await setDoc(docRef, { ...row, id: docId });
          } catch (error) {
            console.error(
              "Error adding job from CSV:",
              error.message,
              error.stack
            );
          }
        }
        alert("CSV data uploaded successfully");
        setMatchingJobs([]);
      },
      error: (error) => {
        console.error("Error parsing CSV: ", error);
      },
    });
  };

  const handleDownload = () => {
    const csv = Papa.unparse(matchingJobs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "jobs_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddJob = async (data) => {
    const db = getFirestore();
    const docId = uuidv4();
    const docRef = doc(db, "jobs", docId);
    try {
      await setDoc(docRef, { ...data, id: docId });
      alert("Job added successfully");
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Error adding job: ", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Management</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchname}
          onChange={handleSearch}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-2"
        />
        <button
          onClick={handleDownload}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Download CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Matching Jobs</h2>
          <ul>
            {matchingJobs.map((job) => (
              <li
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="cursor-pointer hover:bg-gray-100 p-2"
              >
                {job.name} - {job.date}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Job Details</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              {...register("name")}
              placeholder="Name"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              {...register("date")}
              type="text"
              placeholder="Date"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              {...register("address")}
              placeholder="Address"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              {...register("phone")}
              placeholder="Phone"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              {...register("email")}
              placeholder="Email"
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              {...register("info")}
              placeholder="Additional Info"
              className="w-full p-2 border rounded mb-2"
            />
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Update Job
            </button>
          </form>
        </div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
      >
        Add New Job
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h2 className="text-xl font-semibold mb-2">Add New Job</h2>
            <form onSubmit={handleSubmit(handleAddJob)}>
              <input
                {...register("name")}
                placeholder="Name"
                className="w-full p-2 border rounded mb-2"
              />
              <input
                {...register("date")}
                type="text"
                placeholder="Date"
                className="w-full p-2 border rounded mb-2"
              />
              <input
                {...register("address")}
                placeholder="Address"
                className="w-full p-2 border rounded mb-2"
              />
              <input
                {...register("phone")}
                placeholder="Phone"
                className="w-full p-2 border rounded mb-2"
              />
              <input
                {...register("email")}
                placeholder="Email"
                className="w-full p-2 border rounded mb-2"
              />
              <textarea
                {...register("info")}
                placeholder="Additional Info"
                className="w-full p-2 border rounded mb-2"
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Add Job
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
