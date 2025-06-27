import React from "react";

const PDFPreviewModal = ({ isOpen, fileUrl, onClose }) => {
  console.log('PDFPreviewModal rendered:', isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden relative">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b">
          <h2 className="text-lg font-semibold">Invoice Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl font-bold"
          >
            &times;
          </button>
        </div>
        <iframe
          src={fileUrl}
          title="Invoice PDF"
          className="w-full h-[75vh]"
        />
      </div>
    </div>
  );
};

export default PDFPreviewModal;
