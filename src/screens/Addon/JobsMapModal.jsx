import React, { useState } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useApiIsLoaded,
} from "@vis.gl/react-google-maps";

const JobsMapModal = ({ jobs, apiKey, onClose }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const defaultCenter = { lat: 40.7128, lng: -74.006 };

  const extractCoordinates = (googleMapsUrl) => {
    const match = googleMapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    return match
      ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
      : null;
  };

  const validJobs = jobs
    .filter((job) => job.googleMapsUrl)
    .map((job) => ({
      ...job,
      coordinates: extractCoordinates(job.googleMapsUrl),
    }))
    .filter((job) => job.coordinates);

  const MapContent = () => {
    const isLoaded = useApiIsLoaded();

    if (!isLoaded)
      return (
        <div className="h-full flex items-center justify-center">
          Loading map...
        </div>
      );

    return (
      <Map
        center={defaultCenter}
        zoom={10}
        style={{ width: "100%", height: "100%" }}
      >
        {validJobs.map((job) => (
          <Marker
            key={job.id}
            position={job.coordinates}
            onClick={() => setSelectedJob(job)}
          />
        ))}
        {selectedJob && (
          <InfoWindow
            position={selectedJob.coordinates}
            onCloseClick={() => setSelectedJob(null)}
          >
            <div>
              <h3 className="font-bold">{selectedJob.name}</h3>
              <p>{selectedJob.address}</p>
              <p>{selectedJob.date}</p>
            </div>
          </InfoWindow>
        )}
      </Map>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col relative">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Jobs Map</h2>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close map"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-grow">
          <APIProvider apiKey={apiKey}>
            <MapContent />
          </APIProvider>
        </div>
      </div>
    </div>
  );
};

export default JobsMapModal;
