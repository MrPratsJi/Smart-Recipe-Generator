import React from "react";

export default function MyRecipesSlider({ recipes, onSelect }) {
  if (!recipes || recipes.length === 0) return null;
  return (
    <div className="w-full mt-8">
      <h2 className="text-2xl font-extrabold text-center mb-4 bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg tracking-wide animate-gradient-x">
        <span role="img" aria-label="chef">👨‍🍳</span> Your Added Recipes <span role="img" aria-label="chef">👩‍🍳</span>
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-4 px-2 scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-yellow-100">
        {recipes.map((recipe, i) => {
          let imgUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
          if (typeof recipe.Images === 'string') {
            const urls = recipe.Images.replace(/^c\(|\)$/g, '')
              .split(/",\s*"/)
              .map(s => s.replace(/^"|"$/g, ''));
            if (urls[0]) imgUrl = urls[0];
          }
          return (
            <div
              key={(recipe.RecipeId || recipe.Name) + '-' + i}
              className="bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300 rounded-3xl shadow-2xl p-6 flex flex-col gap-3 cursor-pointer hover:scale-105 hover:shadow-yellow-300/60 transition-transform border-2 border-transparent hover:border-yellow-400 relative min-w-[260px] max-w-[280px] w-[260px] animate-fadein"
              style={{ height: '370px', boxSizing: 'border-box', animationDelay: `${i * 0.05}s` }}
              onClick={() => onSelect && onSelect(recipe)}
            >
              <img
                src={imgUrl}
                alt={recipe.Name}
                className="w-full object-cover rounded-xl mb-0 border-4 border-white/40 bg-gray-100 z-10"
                style={{ aspectRatio: '1 / 1', objectFit: 'cover', height: '140px', boxShadow: '0 0 0 4px #f472b6, 0 0 0 8px #facc15' }}
                onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'; }}
              />
              <h3 className="text-lg font-extrabold text-transparent bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-600 bg-clip-text drop-shadow text-center mb-0" style={{marginTop: '-6px'}}>{recipe.Name}</h3>
              <div className="flex-1 text-sm text-gray-700 overflow-hidden" style={{maxHeight: '60px'}}>
                {recipe.Description}
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {recipe.RecipeCategory && <span className="bg-pink-200 text-pink-700 px-3 py-1 rounded-full text-xs font-bold">{recipe.RecipeCategory}</span>}
                {recipe.Calories && <span className="bg-yellow-200 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">{recipe.Calories} kcal</span>}
                {recipe.ProteinContent && <span className="bg-purple-200 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">{recipe.ProteinContent}g protein</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
