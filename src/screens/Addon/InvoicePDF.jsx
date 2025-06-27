import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 12,
    padding: 40,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  companyDetails: {
    flexDirection: "column",
  },
  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a73e8",
  },
  companyInfo: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  logo: {
    width: 100,
    height: 50,
    objectFit: "contain",
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a73e8",
    marginBottom: 10,
  },
  table: {
    // Optional container for table rows if needed
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  tableLabel: {
    width: "35%",
    fontWeight: "bold",
    color: "#555",
    paddingRight: 10,
  },
  tableValue: {
    width: "65%",
    color: "#333",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 10,
  },
  totalValue: {
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#999",
  },
  note: {
    marginTop: 20,
    fontSize: 10,
    color: "#555",
    textAlign: "center",
  },
});

const InvoicePDF = ({ job = {}, companyInfo = {} }) => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>
              {companyInfo.name || "Wegener Asphalt"}
            </Text>
            <Text style={styles.companyInfo}>
              {companyInfo.address || "10200 Quail Run Dr. 63128"}
            </Text>
            <Text style={styles.companyInfo}>
              {companyInfo.phone || "314-300-6562"}
            </Text>
          </View>

          {companyInfo.logoUrl && (
            <Image style={styles.logo} src={companyInfo.logoUrl} />
          )}
        </View>

        {/* Invoice Title */}
        <Text style={styles.invoiceTitle}>Invoice #{job.id || "N/A"}</Text>

        {/* Job Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer & Job Details</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Customer Name:</Text>
              <Text style={styles.tableValue}>{job.name || "N/A"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Date:</Text>
              <Text style={styles.tableValue}>{job.date || "Not scheduled"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Address:</Text>
              <Text style={styles.tableValue}>{job.address || "N/A"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Email:</Text>
              <Text style={styles.tableValue}>{job.email || "N/A"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Phone:</Text>
              <Text style={styles.tableValue}>{job.phone || "N/A"}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Additional Info:</Text>
              <Text style={styles.tableValue}>{job.info || "N/A"}</Text>
            </View>
          </View>

          {/* Total Price */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              ${parseFloat(job.price || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Invoice Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Information</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Invoice Date:</Text>
              <Text style={styles.tableValue}>{currentDate}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Status:</Text>
              <Text style={styles.tableValue}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          © {new Date().getFullYear()} {companyInfo.name || "Wegener Asphalt"}. All rights reserved.
        </Text>

        <Text style={styles.note}>
          Thank you for your business! Please remit payment within 30 days.
        </Text>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
