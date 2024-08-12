import React from "react";

const EquipmentInventoryItem = ({ name, type, status, lastMaintenance }) => {
  return (
    <div className="equipment-inventory-item">
      <h4>{name}</h4>
      <p>Type: {type}</p>
      <p>Status: {status}</p>
      <p>Last Maintenance: {lastMaintenance}</p>
    </div>
  );
};

export default EquipmentInventoryItem;
