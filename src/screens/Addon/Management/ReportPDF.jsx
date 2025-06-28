import React from "react";
import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20 },
  subtitle: { fontSize: 18, marginBottom: 10, marginTop: 20 },
  text: { fontSize: 12, marginBottom: 5 },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableCol: {
    width: "16.66%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: { margin: "auto", marginTop: 5, fontSize: 8, padding: 5 },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  summaryText: { fontSize: 12, marginTop: 10, fontWeight: "bold" },
});

const ReportPDF = ({ reportData }) => {
  
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
          <Text style={styles.title}>{reportData.data.month} {reportData.data.year} Report</Text>
          
          <Text style={styles.subtitle}>Monthly Summary</Text>
          <Text style={styles.text}>Total Jobs: {reportData.data.totalJobs}</Text>
          <Text style={styles.text}>Completed Jobs: {reportData.data.completedJobs}</Text>
          <Text style={styles.text}>Total Revenue: ${reportData.data.totalRevenue.toFixed(2)}</Text>
          <Text style={styles.text}>Completion Rate: {reportData.data.completionRate.toFixed(2)}%</Text>
          
          {reportData.jobDetails && reportData.jobDetails.length > 0 && (
            <>
              <Text style={styles.subtitle}>Job Details</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>Date</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>Description</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>Price</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>Completed</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>Client</Text></View>
                  <View style={styles.tableCol}><Text style={styles.tableCell}>Location</Text></View>
                </View>
                {reportData.jobDetails.map((job, index) => (
                  <View style={styles.tableRow} key={index}>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>{job.date}</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>{job.description}</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>${job.price}</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>{job.completed}</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>{job.client}</Text></View>
                    <View style={styles.tableCol}><Text style={styles.tableCell}>{job.location}</Text></View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;