import React from "react";

export default function StatusTabs({ value, onChange }) {
  return (
    <div className="tabs-wrapper">
      <button
        className={
          "tab-item" + (value === "learning" ? " tab-item-active" : "")
        }
        onClick={() => onChange("learning")}
      >
        受講中
      </button>
      <button
        className={
          "tab-item" + (value === "completed" ? " tab-item-active" : "")
        }
        onClick={() => onChange("completed")}
      >
        修了済み
      </button>
    </div>
  );
}
