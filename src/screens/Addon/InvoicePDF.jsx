import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// Register fonts for a professional look
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf", fontWeight: 300 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 11,
    color: "#333333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: "1 solid #e0e0e0",
    paddingBottom: 15,
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1a73e8",
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 10,
    color: "#666666",
    lineHeight: 1.5,
  },
  logo: {
    width: 70,
    height: 70,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#333333",
    textAlign: "right",
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    border: "1 solid #e0e0e0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1a73e8",
    marginBottom: 10,
    borderBottom: "1 solid #e0e0e0",
    paddingBottom: 5,
  },
  table: {
    display: "flex",
    flexDirection: "column",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottom: "0.5 solid #e0e0e0",
  },
  tableLabel: {
    width: "35%",
    fontWeight: 700,
    color: "#555555",
    paddingRight: 10,
  },
  tableValue: {
    width: "65%",
    color: "#333333",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 10,
    marginTop: 10,
    borderTop: "1 solid #e0e0e0",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1a73e8",
    marginRight: 15,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: "#333333",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#999999",
    borderTop: "0.5 solid #e0e0e0",
    paddingTop: 10,
  },
  note: {
    marginTop: 20,
    fontSize: 10,
    color: "#666666",
    textAlign: "center",
    fontStyle: "italic",
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