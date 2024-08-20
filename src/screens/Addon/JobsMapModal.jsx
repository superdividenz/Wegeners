// JobsMapModal.jsx
import React from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const JobsMapModal = ({ jobs, apiKey, onClose }) => {
  const defaultCenter = { lat: 40.7128, lng: -74.006 }; // Example: New York City

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full">
        <button onClick={onClose} className="mb-2 text-red-500">
          Close
        </button>
        <APIProvider apiKey={apiKey}>
          <div style={{ height: "500px", width: "100%" }}>
            <Map center={defaultCenter} zoom={10}>
              {jobs.map((job, index) => (
                <Marker
                  key={index}
                  position={{ lat: job.latitude, lng: job.longitude }}
                />
              ))}
            </Map>
          </div>
        </APIProvider>
      </div>
    </div>
  );
};

export default JobsMapModal;
