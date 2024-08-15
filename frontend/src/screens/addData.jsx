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
  addDoc,
} from "firebase/firestore";
import Papa from "papaparse";

const AddData = () => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const [searchLastName, setSearchLastName] = useState("");
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleSearch = async (e) => {
    const input = e.target.value;
    setSearchLastName(input);

    if (input.length > 0) {
      const db = getFirestore();
      const jobsRef = collection(db, "jobs");
      const q = query(
        jobsRef,
        where("lastName", ">=", input),
        where("lastName", "<=", input + "\uf8ff")
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
      if (key !== "id") setValue(key, job[key]);
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
        const db = getFirestore();
        const jobsRef = collection(db, "jobs");

        for (const row of results.data) {
          try {
            await addDoc(jobsRef, row);
          } catch (error) {
            console.error("Error adding job from CSV: ", error);
          }
        }
        alert("CSV data uploaded successfully");
        setMatchingJobs([]); // Clear matching jobs after upload
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-center text-4xl font-bold mb-6 text-gray-800">
        Job Management
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <input
          type="text"
          value={searchLastName}
          onChange={handleSearch}
          placeholder="Search by Last Name"
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
                <span className="font-medium text-gray-700">
                  {job.lastName}
                </span>{" "}
                - {job.firstName}
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
              {...register("firstName", { required: true })}
              placeholder="First Name"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("lastName", { required: true })}
              placeholder="Last Name"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("email", { required: true })}
              placeholder="Email"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("address", { required: true })}
              placeholder="Address"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("date", { required: true })}
              type="date"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("time", { required: true })}
              type="time"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              {...register("yardage", { required: true })}
              placeholder="Yardage"
              className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              {...register("description", { required: true })}
              placeholder="Description"
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
        </div>
      </div>
    </div>
  );
};

export default AddData;
