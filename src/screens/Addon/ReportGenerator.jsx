// Reportgenerator.jsx
import React, { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
// import ReportPDF from "./ReportPDF";

const ReportGenerator = ({ jobs }) => {
  const [reportType, setReportType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const generateReportData = () => {
    if (reportType === "monthly" && !selectedMonth) return null;
    if (reportType === "annual" && !selectedYear) return null;

    let startDate, endDate, filteredJobs;

    if (reportType === "monthly") {
      const [year, month] = selectedMonth.split("-");
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else {
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31);
    }

    filteredJobs = jobs.filter((job) => {
      const jobDate = new Date(job.date);
      return jobDate >= startDate && jobDate <= endDate;
    });

    const totalRevenue = filteredJobs.reduce(
      (sum, job) => sum + parseFloat(job.price || 0),
      0
    );
    const completedJobs = filteredJobs.filter((job) => job.completed).length;
    const completionRate =
      filteredJobs.length > 0 ? (completedJobs / filteredJobs.length) * 100 : 0;

    return {
      type: reportType === "monthly" ? "Monthly Report" : "Annual Report",
      data: {
        month:
          reportType === "monthly"
            ? startDate.toLocaleString("default", { month: "long" })
            : null,
        year: reportType === "monthly" ? startDate.getFullYear() : selectedYear,
        totalJobs: filteredJobs.length,
        completedJobs: completedJobs,
        totalRevenue: totalRevenue,
        completionRate: completionRate,
      },
      jobDetails: filteredJobs.map((job) => ({
        date: job.date,
        description: job.description,
        price: job.price,
        completed: job.completed ? "Yes" : "No",
        client: job.client || "N/A",
        location: job.location || "N/A",
      })),
    };
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Generate Report</h2>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="border rounded px-2 py-1 w-full sm:w-auto"
        >
          <option value="monthly">Monthly Report</option>
          <option value="annual">Annual Report</option>
        </select>
        {reportType === "monthly" ? (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded px-2 py-1 w-full sm:w-auto"
          />
        ) : (
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            placeholder="Enter year (e.g., 2023)"
            className="border rounded px-2 py-1 w-full sm:w-auto"
          />
        )}
      </div>
      {((reportType === "monthly" && selectedMonth) ||
        (reportType === "annual" && selectedYear)) && (
        <PDFDownloadLink
          document={<ReportPDF reportData={generateReportData()} />}
          fileName={`${reportType}-report-${
            reportType === "monthly" ? selectedMonth : selectedYear
          }.pdf`}
        >
          {({ blob, url, loading }) => (
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
              disabled={loading}
            >
              {loading
                ? "Generating report..."
                : `Download ${
                    reportType === "monthly" ? "Monthly" : "Annual"
                  } Report`}
            </button>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
};

export default ReportGenerator;
