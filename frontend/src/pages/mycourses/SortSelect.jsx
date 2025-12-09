import React from "react";

export default function SortSelect({ value, onChange }) {
  return (
    <select
      className="sort-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="recent">最終アクセス順</option>
      <option value="title">タイトル順（A→Z）</option>
      <option value="progress_desc">進行度が高い順</option>
      <option value="progress_asc">進行度が低い順</option>
    </select>
  );
}
