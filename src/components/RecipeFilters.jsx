import React from "react";

const difficulties = ["Easy", "Medium", "Hard"];

export default function RecipeFilters({ filters, setFilters, onShow }) {
  return (
  <div className="bg-gradient-to-br from-white/90 via-purple-50 to-pink-50 backdrop-blur-xl rounded-3xl p-6 shadow-2xl flex flex-col gap-4 mb-8 border-2 border-purple-200 animate-popin mt-8">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
        <div className="flex items-center gap-2">
          <label className="font-bold text-purple-700">Difficulty:</label>
          <select
            className="p-2 rounded-lg border-2 border-purple-300 focus:ring-4 focus:ring-pink-300 transition-all text-black bg-white min-w-[90px]"
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            <option value="">Any</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-bold text-purple-700">Max Cooking Time (min):</label>
          <input
            type="number"
            min="0"
            className="p-2 rounded-lg border-2 border-pink-300 focus:ring-4 focus:ring-yellow-300 transition-all text-black bg-white w-24"
            value={filters.cookingTime}
            onChange={(e) => setFilters({ ...filters, cookingTime: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-bold text-purple-700">Serving Size:</label>
          <input
            type="number"
            min="1"
            className="p-2 rounded-lg border-2 border-yellow-400 focus:ring-4 focus:ring-pink-300 transition-all text-black bg-white w-20"
            value={filters.servingSize || ''}
            onChange={(e) => setFilters({ ...filters, servingSize: e.target.value })}
          />
        </div>
        <button
          className="ml-4 px-7 py-2 rounded-full bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-500 text-white font-bold shadow-lg border-2 border-pink-200 drop-shadow-lg hover:scale-105 transition-transform text-lg animate-pulse"
          style={{ minWidth: 100, marginTop: 8 }}
          onClick={onShow}
        >
          Show
        </button>
      </div>
      <style>{`
        @keyframes popin { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-popin { animation: popin 0.4s cubic-bezier(.4,2,.6,1) both; }
      `}</style>
    </div>
  );
}
