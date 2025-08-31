import React from "react";

export default function RecipeList({ recipes, onSelect }) {
  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center text-xl text-pink-600 font-bold mt-8">No recipes found. Try different ingredients or preferences!</div>
    );
  }
  return (
    <div style={{ border: '3px solid red', background: '#fffbe6', padding: 16 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {recipes.map((recipe) => (
        <div
          key={recipe.id}
          style={{ border: '3px solid blue', background: '#e6f7ff', position: 'relative' }}
          className="bg-white/80 rounded-3xl shadow-2xl p-6 flex flex-col gap-3 hover:scale-[1.04] hover:shadow-pink-300/60 transition-all cursor-pointer border-2 border-transparent hover:border-pink-400 relative overflow-hidden group"
          onClick={() => onSelect(recipe)}
        >
          <div style={{position:'absolute',top:4,left:4,color:'blue',fontWeight:'bold',zIndex:99}}>CARD DEBUG</div>
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-pink-200 via-yellow-200 to-purple-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-all z-0"></div>
          <img
            src={recipe.image || 'https://placehold.co/400x240?text=No+Image'}
            alt={recipe.name}
            className="w-full h-40 object-cover rounded-xl mb-2 border-4 border-white/40 bg-gray-100 z-10"
            onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x240?text=No+Image'; }}
          />
          <h3 className="text-2xl font-bold text-purple-700 z-10">{recipe.name}</h3>
          <div className="flex flex-wrap gap-2 z-10">
            {(Array.isArray(recipe.dietary) ? recipe.dietary : typeof recipe.Dietary === 'string' && recipe.Dietary.startsWith('c(')
              ? recipe.Dietary.replace(/^c\(|\)$/g, '').split(/",\s*"/).map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean)
              : [])
              .map((d, idx) => (
                <span key={recipe.id + '-' + d + '-' + idx} className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full text-xs font-semibold">{d}</span>
              ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 z-10">
            <span>⏱️ {recipe.cookingTime} min</span>
            <span>⭐ {recipe.difficulty}</span>
            <span>🍽️ {recipe.servings} servings</span>
          </div>
        </div>
      ))}
    </div>
  );
}
