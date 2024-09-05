import React from "react";
import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20 },
  subtitle: { fontSize: 18, marginBottom: 10 },
  text: { fontSize: 12, marginBottom: 5 },
  table: {
    display: "table",
    width: "auto",
  },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableCol: {
    width: "20%",
  },
  tableCell: { margin: "auto", marginTop: 5, fontSize: 10 },
});

const ReportPDF = ({ reportData }) => {
  const formatRate = (rate) => {
    if (typeof rate === "number" && !isNaN(rate)) {
      return rate.toFixed(2);
    }
    return "N/A";
  };

  if (!reportData) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>No report data available</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>
            {reportData.type || "Unknown"} Report
          </Text>
          {reportData.type === "Monthly Revenue" && (
            <>
              <Text style={styles.subtitle}>Monthly Revenue Breakdown</Text>
              {reportData.data &&
                Object.entries(reportData.data).map(([month, revenue]) => (
                  <Text key={month} style={styles.text}>
                    Month {parseInt(month) + 1}: $
                    {typeof revenue === "number" ? revenue.toFixed(2) : "N/A"}
                  </Text>
                ))}
            </>
          )}
          {reportData.type === "Job Completion Rate" && (
            <>
              <Text style={styles.subtitle}>Job Completion Statistics</Text>
              <Text style={styles.text}>
                Total Jobs: {reportData.data?.total ?? "N/A"}
              </Text>
              <Text style={styles.text}>
                Completed Jobs: {reportData.data?.completed ?? "N/A"}
              </Text>
              <Text style={styles.text}>
                Completion Rate: {formatRate(reportData.data.rate)}%
              </Text>
              {reportData.data?.jobs &&
                Array.isArray(reportData.data.jobs) &&
                reportData.data.jobs.length > 0 && (
                  <>
                    <Text style={styles.subtitle}>Job Details</Text>
                    {reportData.data.jobs.map((job, index) => (
                      <React.Fragment key={job.id ?? index}>
                        <Text style={styles.text}>Job {index + 1}:</Text>
                        <Text style={styles.text}>
                          {" "}
                          Title: {job.title ?? "N/A"}
                        </Text>
                        <Text style={styles.text}>
                          {" "}
                          Status: {job.status ?? "N/A"}
                        </Text>
                        <Text style={styles.text}>
                          {" "}
                          Date: {job.date ?? "N/A"}
                        </Text>
                      </React.Fragment>
                    ))}
                  </>
                )}
              {reportData.data?.jobDetails &&
                reportData.data.jobDetails.length > 0 && (
                  <View style={styles.table}>
                    <View style={styles.tableRow}>
                      {/* Remove the ID column */}
                      <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>Date</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>Description</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>Price</Text>
                      </View>
                      <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>Completed</Text>
                      </View>
                    </View>
                    {reportData.data.jobDetails.map((job, index) => (
                      <View style={styles.tableRow} key={index}>
                        {/* Remove the ID column */}
                        <View style={styles.tableCol}>
                          <Text style={styles.tableCell}>{job.date}</Text>
                        </View>
                        <View style={styles.tableCol}>
                          <Text style={styles.tableCell}>
                            {job.description}
                          </Text>
                        </View>
                        <View style={styles.tableCol}>
                          <Text style={styles.tableCell}>{job.price}</Text>
                        </View>
                        <View style={styles.tableCol}>
                          <Text style={styles.tableCell}>{job.completed}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
            </>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;
