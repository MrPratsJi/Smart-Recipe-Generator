import React from "react";

export default function Favorites({ favorites, onSelect, onRemove }) {
  if (!favorites || favorites.length === 0) {
    return <div className="text-center text-pink-500 font-bold mt-4">No favorite recipes yet!</div>;
  }
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">💖 Your Favorites</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favorites.map((recipe, idx) => (
          <div
            key={recipe.RecipeId || recipe.id || idx}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-4 flex flex-col gap-2 relative border-2 border-yellow-200 hover:border-pink-400 transition-all group animate-popin overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-all z-0"></div>
            <img
              src={recipe.image || 'https://placehold.co/400x180?text=No+Image'}
              alt={recipe.name}
              className="w-full h-32 object-cover rounded-xl mb-2 border-4 border-white/40 bg-gray-100 z-10"
              onClick={() => onSelect(recipe)}
              onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x180?text=No+Image'; }}
            />
            <h3 className="text-xl font-bold text-purple-700 cursor-pointer z-10" onClick={() => onSelect(recipe)}>{recipe.name}</h3>
            <button className="absolute top-2 right-2 text-pink-500 hover:text-pink-700 text-2xl z-20 transition-transform hover:scale-125" onClick={() => onRemove(recipe.id)} title="Remove from favorites">♥</button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes popin { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-popin { animation: popin 0.4s cubic-bezier(.4,2,.6,1) both; }
      `}</style>
    </div>
  );
}
