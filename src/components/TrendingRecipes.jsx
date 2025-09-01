import React from "react";

export default function TrendingRecipes({ recipes, onSelect, showAll, setShowAll, setShowInitial }) {
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function getUniqueRecipes(arr, count) {
    const seen = new Set();
    const unique = [];
    for (const r of arr) {
      const key = r.RecipeId || r.Name;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
      if (unique.length === count) break;
    }
    return unique;
  }
  const shuffled = React.useMemo(() => shuffle(recipes), [recipes]);
  const trending = React.useMemo(() => getUniqueRecipes(shuffled, 16), [shuffled]);
  const gridCount = showAll ? 40 : 20; 
  const allTrending = React.useMemo(() => getUniqueRecipes(shuffled, gridCount), [shuffled, gridCount]);
  if (!recipes || recipes.length === 0) return null;
  return (
    <div className="mt-2 relative">
      {showAll ? (
        <button
          onClick={() => setShowAll && setShowAll(false)}
          className="fixed top-48 left-8 bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-500 text-white font-bold py-3 px-10 rounded-full shadow-lg hover:scale-105 transition-transform text-xl border-2 border-white/30 drop-shadow-lg z-50"
          style={{ minWidth: 120 }}
        >
          &#8592; Back
        </button>
      ) : (
        <button
          onClick={() => setShowInitial && setShowInitial(true)}
          className="fixed top-48 left-8 bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-500 text-white font-bold py-3 px-10 rounded-full shadow-lg hover:scale-105 transition-transform text-xl border-2 border-white/30 drop-shadow-lg z-50"
          style={{ minWidth: 120 }}
        >
          &#8592; Back
        </button>
      )}
      <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg tracking-wide animate-gradient-x" style={{letterSpacing: '0.04em'}}>
        <span role="img" aria-label="fire">🔥</span> Trending Recipes <span role="img" aria-label="fire">🔥</span>
      </h2>
      {!showAll && <TrendingCarousel trending={trending} onSelect={onSelect} />}
      {!showAll && (
        <div className="w-full flex justify-center mt-4">
          <button
            className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-white font-bold py-3 px-10 rounded-full shadow-lg hover:scale-105 transition-transform text-xl border-2 border-white/30 animate-pulse drop-shadow-lg"
            onClick={() => setShowAll(true)}
          >
            See More
          </button>
        </div>
      )}
      {showAll && (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white/0">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-center items-stretch px-2 mt-8 animate-fadein">
            {allTrending.map((recipe, i) => {
              if (!recipe || !recipe.Name || !recipe.RecipeIngredientParts || !recipe.RecipeInstructions) return null;
              let imgUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
              if (typeof recipe.Images === 'string') {
                const urls = recipe.Images.replace(/^c\(|\)$/g, '')
                  .split(/",\s*"/)
                  // .map(s => s.replace(/^"|"$/g, ''));
                  .map(s => s.replace(/^"|"$/g, ''))
                  .filter(s => s && s !== 'character(0)');
                if (urls[0]) imgUrl = urls[0];
              }
              let rating = null;
              if (recipe.AggregatedRating) {
                rating = parseFloat(recipe.AggregatedRating).toFixed(1);
              }
              return (
                <div
                  key={(recipe.RecipeId || recipe.Name) + '-' + i}
                  className="bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300 rounded-3xl shadow-2xl p-8 flex flex-col gap-5 cursor-pointer hover:scale-105 hover:shadow-yellow-300/60 transition-transform border-2 border-transparent hover:border-yellow-400 relative overflow-hidden group animate-fadein"
                  style={{ minWidth: '260px', minHeight: '420px', height: '420px', boxSizing: 'border-box', animationDelay: `${i * 0.05}s` }}
                  onClick={() => onSelect(recipe)}
                >
                  <div className="absolute -top-10 -left-10 w-36 h-36 bg-gradient-to-br from-pink-200 via-yellow-200 to-purple-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-all z-0"></div>
                  <img
                    src={imgUrl}
                    alt={recipe.Name}
                    className="w-full object-cover rounded-xl mb-0 border-4 border-white/40 bg-gray-100 z-10"
                    style={{ aspectRatio: '1 / 1', objectFit: 'cover', height: '180px', boxShadow: '0 0 0 6px #f472b6, 0 0 0 12px #facc15' }}
                    onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'; }}
                  />
                  <h3 className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-600 bg-clip-text drop-shadow text-center mb-0" style={{marginTop: '-10px'}}>{recipe.Name}</h3>
                  {rating && (
                    <div className="flex items-center justify-center gap-2 text-2xl font-extrabold text-yellow-500 z-10 bg-white/80 rounded-full px-6 py-2 mt-2 shadow-lg border-2 border-yellow-300 animate-pulse">
                      <span role="img" aria-label="star">⭐</span> {rating}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TrendingCarousel({ trending, onSelect }) {
  const [index, setIndex] = React.useState(0);
  const cardCount = trending.length;
  const visibleCount = 8; 

  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 4) % cardCount);
    }, 3000);
    return () => clearInterval(interval);
  }, [cardCount]);

  
  const visible = [];
  for (let i = 0; i < visibleCount; i++) {
    visible.push(trending[(index + i) % cardCount]);
  }

  const fallbackImg = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-6xl flex items-center justify-center">
        <div
          className="flex gap-12 justify-center items-stretch overflow-x-auto w-full"
          style={{ minHeight: '440px', padding: '30px 0' }}
        >
          {visible.map((recipe, i) => {
            if (!recipe || !recipe.Name || !recipe.RecipeIngredientParts || !recipe.RecipeInstructions) return null;
            let imgUrl = fallbackImg;
            if (typeof recipe.Images === 'string') {
              const urls = recipe.Images.replace(/^c\(|\)$/g, '')
                .split(/",\s*"/)
                .map(s => s.replace(/^"|"$/g, ''));
              if (urls[0]) imgUrl = urls[0];
            }
            let rating = null;
            if (recipe.AggregatedRating) {
              rating = parseFloat(recipe.AggregatedRating).toFixed(1);
            }
            return (
              <div
                key={(recipe.RecipeId || recipe.Name) + '-' + i}
                className="bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-100 rounded-3xl shadow-2xl p-14 flex flex-col gap-5 cursor-pointer hover:scale-105 hover:shadow-pink-300/60 transition-transform border-2 border-transparent hover:border-pink-400 relative overflow-hidden group"
                style={{ width: '400px', minWidth: '400px', minHeight: '420px', height: '420px', boxSizing: 'border-box' }}
                onClick={() => onSelect(recipe)}
              >
                <div className="absolute -top-10 -left-10 w-36 h-36 bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-all z-0"></div>
                <img
                  src={imgUrl}
                  alt={recipe.Name}
                  className="w-full object-cover rounded-xl mb-0 border-4 border-white/40 bg-gray-100 z-10"
                  style={{ aspectRatio: '1 / 1', objectFit: 'cover', height: '240px' }}
                  onError={e => { e.target.onerror = null; e.target.src = fallbackImg; }}
                />
                <h3 className="text-2xl font-bold text-purple-700 z-10 text-center mb-0" style={{marginTop: '-10px'}}>{recipe.Name}</h3>
                {rating && (
                  <div className="flex items-center justify-center gap-1 text-lg font-semibold text-yellow-600 z-10">
                    <span role="img" aria-label="star">⭐</span> {rating}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
