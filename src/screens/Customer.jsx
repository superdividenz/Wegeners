import React, { useState } from "react";
import Papa from "papaparse";
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { parse, isValid } from "date-fns";  // Import date-fns for date parsing

const AddData = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setError("");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return null; // If the date is undefined or empty, return null
    }
  
    let formattedDateString = dateString;
  
    // Check if the date is in M/D/YYYY format (e.g., 3/4/2025)
    if (dateString.includes("/")) {
      formattedDateString = dateString.replace(/\//g, "-"); // Replace '/' with '-'
    } else {
      // Ensure the date is in D-M-YYYY format (with single or double digits)
      formattedDateString = dateString.replace(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/, (match, p1, p2, p3) => {
        const year = p3.length === 2 ? `20${p3}` : p3;
        return `${p1.padStart(2, "0")}-${p2.padStart(2, "0")}-${year}`;
      });
    }
  
    const parsedDate = parse(formattedDateString, "dd-MM-yyyy", new Date());
    return isValid(parsedDate) ? parsedDate : null;  // Return valid date or null if invalid
  };
  

  const handleCSVImport = async () => {
    if (!file) return; // If no file is selected, do nothing

    setLoading(true);
    setError(""); // Reset error state

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const jobsData = result.data;
        const db = getFirestore();
        const jobsRef = collection(db, "jobs");

        try {
          // Get existing jobs from Firestore
          const querySnapshot = await getDocs(jobsRef);
          const existingJobs = new Map();
          querySnapshot.forEach((doc) => {
            const jobData = doc.data();
            existingJobs.set(jobData.name, { id: doc.id, ...jobData });
          });

          // Process each row from the CSV file
          const promises = jobsData.map(async (job) => {
            const existingJob = existingJobs.get(job.name);
            const jobId = existingJob ? existingJob.id : uuidv4();
            const jobRef = doc(db, "jobs", jobId);

            const formattedDate = formatDate(job.date);  // Format the date

            if (!formattedDate) {
              console.error(`Invalid date for job ${job.name}: ${job.date}`);
              return;  // Skip invalid date entries
            }

            const jobData = {
              name: job.name,
              email: job.email,
              phone: job.phone,
              address: job.address,
              date: formattedDate,  // Save formatted date
              price: job.price,
              info: job.info,
            };

            if (existingJob) {
              // If the job already exists, update it
              await updateDoc(jobRef, jobData);
            } else {
              // If the job is new, add it
              await setDoc(jobRef, jobData);
            }
          });

          // Wait for all operations to finish
          await Promise.all(promises);
          setLoading(false);
          alert("CSV imported successfully!");
        } catch (err) {
          setError("Error importing CSV: " + err.message);
          setLoading(false);
        }
      },
      error: (error) => {
        setError("Error reading CSV file: " + error.message);
        setLoading(false);
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-center text-4xl font-bold mb-6 text-gray-800">
        Import Jobs from CSV
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {file && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Selected file: {file.name}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-500 text-sm">
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleCSVImport}
          disabled={loading || !file}
          className={`${
            loading || !file
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          } text-white px-4 py-3 mt-6 rounded-md transition duration-200 w-full`}
        >
          {loading ? "Importing..." : "Import CSV"}
        </button>
      </div>
    </div>
  );
};

export default AddData;
