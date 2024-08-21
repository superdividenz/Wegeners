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

const AddData = () => {
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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day).toISOString();
  };

  const onSubmit = async (data) => {
    if (!selectedJob) return;
    const db = getFirestore();
    const jobDocRef = doc(db, "jobs", selectedJob.id);
    try {
      const formattedDate = formatDate(data.date);
      await updateDoc(jobDocRef, { ...data, date: formattedDate });
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
        const db = getFirestore();
        for (const row of results.data) {
          try {
            const docId = row.id || uuidv4();
            const formattedDate = formatDate(row.date);
            const docRef = doc(db, "jobs", docId);
            await setDoc(docRef, { ...row, id: docId, date: formattedDate });
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
      const formattedDate = formatDate(data.date);
      await setDoc(docRef, { ...data, id: docId, date: formattedDate });
      alert("Job added successfully");
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error("Error adding job: ", error);
    }
  };

  const handleClickOutside = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Job Management</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchname}
          onChange={handleSearch}
          className="w-full p-2 border rounded"
        />
      </div>

      {matchingJobs.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Matching Jobs:</h2>
          <ul>
            {matchingJobs.map((job) => (
              <li
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="cursor-pointer hover:bg-gray-100 p-2"
              >
                {job.name} - {job.position}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedJob && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Edit Job:</h2>
          <input
            {...register("name")}
            placeholder="Name"
            className="w-full p-2 border rounded mb-2"
          />
          <input
            {...register("position")}
            placeholder="Position"
            className="w-full p-2 border rounded mb-2"
          />
          <input
            {...register("company")}
            placeholder="Company"
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            {...register("date")}
            placeholder="Date (DD/MM/YYYY)"
            className="w-full p-2 border rounded mb-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Update Job
          </button>
        </form>
      )}

      <div className="mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-2"
        />
        <button
          onClick={handleDownload}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 ml-2"
        >
          Download CSV
        </button>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
      >
        Add New Job
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay"
          onClick={handleClickOutside}
        >
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Add New Job</h2>
            <form onSubmit={handleSubmit(handleAddJob)}>
              <input
                {...register("name")}
                placeholder="Name"
                className="w-full p-2 border rounded mb-2"
              />
              <input
                {...register("position")}
                placeholder="Position"
                className="w-full p-2 border rounded mb-2"
              />
              <input
                {...register("company")}
                placeholder="Company"
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="text"
                {...register("date")}
                placeholder="Date (DD/MM/YYYY)"
                className="w-full p-2 border rounded mb-2"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
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

export default AddData;
