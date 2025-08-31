import React from "react";

export default function Rating({ value, onRate }) {
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-2xl cursor-pointer ${value >= star ? "text-yellow-400" : "text-gray-300"}`}
          onClick={() => onRate(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
