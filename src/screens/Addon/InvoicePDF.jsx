// InvoicePDF.jsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Define styles for the PDF, inspired by Tailwind CSS
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f9fafb", // Tailwind's gray-50
    padding: 24, // Tailwind's p-6
  },
  header: {
    fontSize: 24, // Tailwind's text-2xl
    textAlign: "center",
    marginBottom: 16, // Tailwind's mb-4
    color: "#1f2937", // Tailwind's gray-800
  },
  section: {
    marginBottom: 16, // Tailwind's mb-4
    padding: 16, // Tailwind's p-4
    backgroundColor: "#ffffff", // Tailwind's white
    borderRadius: 8, // Tailwind's rounded-lg
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", // Tailwind's shadow
  },
  title: {
    fontSize: 20, // Tailwind's text-xl
    marginBottom: 8, // Tailwind's mb-2
    color: "#3b82f6", // Tailwind's blue-500
  },
  text: {
    fontSize: 14, // Tailwind's text-sm
    marginBottom: 4, // Tailwind's mb-1
    color: "#4b5563", // Tailwind's gray-600
  },
  footer: {
    position: "absolute",
    bottom: 24, // Tailwind's bottom-6
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12, // Tailwind's text-xs
    color: "#9ca3af", // Tailwind's gray-400
  },
});

// Define the InvoicePDF component
const InvoicePDF = ({ job }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}>Company Name</Text>

      {/* Invoice Section */}
      <View style={styles.section}>
        <Text style={styles.title}>Invoice</Text>
        <Text style={styles.text}>Job: {job.name}</Text>
        <Text style={styles.text}>Date: {job.date}</Text>
        <Text style={styles.text}>Price: ${job.price}</Text>
        <Text style={styles.text}>Address: {job.address}</Text>
        <Text style={styles.text}>Email: {job.email}</Text>
        <Text style={styles.text}>Phone: {job.phone}</Text>
        <Text style={styles.text}>Additional Info: {job.info}</Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Thank you for your business!</Text>
    </Page>
  </Document>
);

export default InvoicePDF;
