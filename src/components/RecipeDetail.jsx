
import React from "react";
import { toast } from 'react-toastify';
import { getSubstitutions } from '../utils/substitutions';

export default function RecipeDetail({ recipe, onClose, onRate, userRating, handleAddFavorite, isFavorite }) {
  const [servings, setServings] = React.useState(recipe ? Number(recipe.RecipeServings) || 1 : 1);
  const [rating, setRating] = React.useState(userRating || 0);
  const [suggestionSubmitted, setSuggestionSubmitted] = React.useState(false);
  const [reviewSubmitted, setReviewSubmitted] = React.useState(false);
  const [addedToFavSession, setAddedToFavSession] = React.useState(false);

  React.useEffect(() => {
    setServings(recipe ? Number(recipe.RecipeServings) || 1 : 1);
    setRating(userRating || 0);
  }, [recipe, userRating]);

  

  
  function scaleIngredient(qty, part) {
    if (!qty || isNaN(Number(qty)) || !recipe.RecipeServings) return `${qty} ${part}`;
    const scaled = parseFloat(qty) * (servings / Number(recipe.RecipeServings));
    return `${scaled % 1 === 0 ? scaled : scaled.toFixed(2)} ${part}`;
  }

  
  function parseField(field) {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      let cleaned = field.trim().replace(/^c\(|\)$/g, '');
      cleaned = cleaned.replace(/^"|"$/g, '');
      let arr = cleaned.split(/",\s*"/).map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
      if (!arr.length) {
        arr = cleaned.split(',').map(s => s.trim()).filter(Boolean);
      }
      return arr;
    }
    return [];
  }

  const ingredientParts = parseField(recipe.RecipeIngredientParts);
  const ingredientQuantities = parseField(recipe.RecipeIngredientQuantities);
  const instructionsArr = parseField(recipe.RecipeInstructions);

  
  function showToastMessage(msg) {
    toast.success(`💖 ${msg}`, {
      position: 'bottom-right',
      style: {
        background: 'linear-gradient(90deg, #f472b6 0%, #facc15 50%, #a78bfa 100%)',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)',
        padding: '1.2rem 2rem',
        letterSpacing: '0.03em',
        border: '2px solid #fff6',
      },
      icon: '🎉',
      progressStyle: {
        background: '#fff',
        height: '6px',
        borderRadius: '3px',
      },
    });
  }

  function handleAddFavoriteClick() {
    if (typeof handleAddFavorite === 'function') {
      handleAddFavorite(recipe);
    } else {
      window.dispatchEvent(new CustomEvent('addFavorite', { detail: recipe }));
    }
    setAddedToFavSession(true);
    showToastMessage('Added to Favorites!');
  }

  function handleSuggestionSubmit() {
    setSuggestionSubmitted(true);
    showToastMessage('Suggestion submitted!');
    setTimeout(() => setSuggestionSubmitted(false), 2000);
  }

  function handleReviewSubmit() {
    setReviewSubmitted(true);
    showToastMessage('Review submitted!');
    window.dispatchEvent(new CustomEvent('reviewSubmit', { detail: recipe }));
  }

  
  React.useEffect(() => {
    setSuggestionSubmitted(false);
    setReviewSubmitted(false);
    setAddedToFavSession(false);
  }, [recipe]);

  
  let imageUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
  if (typeof recipe.Images === 'string') {
    let cleaned = recipe.Images.trim().replace(/^c\(|\)$/g, '');
    cleaned = cleaned.replace(/^"|"$/g, '');
    let urls = cleaned
      ? cleaned
          .split(/",\s*"/)
          .map((s) => s.replace(/^"|"$/g, '').trim())
          .filter(Boolean)
      : [];
    const validUrl = urls.find(u => u.startsWith('http'));
    if (validUrl) imageUrl = validUrl;
    else {
  const urlMatch = recipe.Images.match(/https?:\/\/[^"\s]+/);
      if (urlMatch && urlMatch[0]) imageUrl = urlMatch[0];
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-200 backdrop-blur-2xl rounded-3xl p-0 max-w-2xl w-full shadow-2xl relative text-purple-900 border-4 border-pink-200 animate-popin overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        <div className="overflow-y-auto p-8" style={{ maxHeight: '90vh' }}>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-200 via-yellow-200 to-purple-200 rounded-full blur-2xl opacity-60 z-0"></div>
          <button
            className="absolute top-4 right-4 text-xl font-bold text-pink-500 hover:text-pink-700 z-10"
            onClick={onClose}
          >
            ✖
          </button>
          <div className="w-full aspect-[5/3] flex items-center justify-center bg-gray-100 rounded-xl mb-4 border-4 border-white/40 z-10 overflow-hidden">
            <img
              src={imageUrl}
              alt={recipe.Name}
              className="w-full h-full object-cover object-center"
              style={{ minHeight: '180px', minWidth: '300px', background: '#eee' }}
              onError={e => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>
          <h2 className="text-3xl font-extrabold mb-2 z-10 text-center">{recipe.Name}</h2>
          {recipe.Description && (
            <div className="mb-3 text-center text-base italic text-purple-700 bg-white/60 rounded-xl px-3 py-2 shadow-inner">
              {recipe.Description}
            </div>
          )}
          <div className="flex flex-wrap gap-4 justify-center mb-4">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold shadow">
              Category: {recipe.RecipeCategory || '-'}
            </span>
            <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full font-semibold shadow">
              Prep Time: {recipe.PrepTime || '-'}
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold shadow">
              Cook Time:{' '}
              {(() => {
                let cook = recipe.CookTime;
                if (typeof cook === 'string') {
                  cook = cook.replace(/^c\(|\)$/g, '').replace(/^\["\s]+|["\s]+$/g, '');
                  if (cook.includes(',')) cook = cook.split(',')[0];
                }
                return cook && cook !== '' ? cook : '-';
              })()}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold shadow">
              Servings: {recipe.RecipeServings || '-'}
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2 z-10 text-pink-700">Ingredients</h3>
              <ul className="list-disc ml-6 mb-4 z-10">
                {ingredientParts.length > 0 ? (
                  ingredientParts.map((part, idx) => {
                    const qty = ingredientQuantities[idx];
                    return (
                      <li key={idx} className="mb-1">
                        <span className="font-semibold text-purple-700">
                          {qty ? scaleIngredient(qty, part) : part}
                        </span>
                        {servings !== Number(recipe.RecipeServings) && (
                          <span className="text-xs text-purple-500"> (for {servings} servings)</span>
                        )}
                        {getSubstitutions && getSubstitutions(part).length > 0 && (
                          <span className="ml-2 text-xs text-pink-500">
                            (Substitute: {getSubstitutions(part).join(', ')})
                          </span>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li>No ingredients listed.</li>
                )}
              </ul>
            </div>
            <div className="w-80 mt-1">
              <h3 className="font-bold text-lg mb-2 text-pink-700">Instructions</h3>
              <div className="max-h-40 overflow-y-auto bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-100 rounded-xl p-3 shadow-inner border border-pink-200">
                <ol className="list-decimal list-inside space-y-2 text-purple-900">
                  {instructionsArr.length > 0 ? (
                    instructionsArr.map((step, idx) => <li key={idx}>{step.trim()}</li>)
                  ) : (
                    <li>No instructions listed.</li>
                  )}
                </ol>
              </div>
              <div className="mt-3">
                <span className="text-sm text-gray-600">Servings:</span>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value) || 1)}
                  className="w-16 px-2 py-1 rounded border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-purple-900 font-semibold bg-white ml-2"
                />
              </div>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2 z-10 text-green-700">Nutritional Information</h3>
            <div className="flex flex-wrap gap-4 text-sm z-10 justify-center">
              <span className="bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full font-semibold shadow">
                Calories: {recipe.Calories || '-'}
              </span>
              <span className="bg-pink-50 text-pink-800 px-3 py-1 rounded-full font-semibold shadow">
                Protein: {recipe.ProteinContent || '-'}g
              </span>
              <span className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full font-semibold shadow">
                Carbs: {recipe.CarbohydrateContent || '-'}g
              </span>
              <span className="bg-green-50 text-green-800 px-3 py-1 rounded-full font-semibold shadow">
                Fat: {recipe.FatContent || '-'}g
              </span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8 mt-6">
            <div className="flex flex-col items-center flex-1 justify-start gap-4">
              <button
                className={`bg-gradient-to-r from-pink-400 to-yellow-400 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform text-xl mb-2 drop-shadow-lg border-2 border-pink-200 ${(isFavorite || addedToFavSession) ? 'opacity-70 cursor-default' : 'hover:scale-110'}`}
                onClick={(isFavorite || addedToFavSession) ? undefined : handleAddFavoriteClick}
                disabled={isFavorite || addedToFavSession}
              >
                {(isFavorite || addedToFavSession) ? '✔ Added to Favorites' : '♥ Add to Favorites'}
              </button>
              <div className="flex flex-col items-center gap-1 w-full">
                <span className="font-semibold text-purple-700">Rate this recipe:</span>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`text-3xl transition-transform ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300'} hover:scale-125`}
                      onClick={() => {
                        setRating(star);
                        if (onRate) onRate(star);
                      }}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-lg mb-2 text-pink-700">Any suggestions:</h3>
                <textarea
                  className="w-full rounded-xl border-2 border-pink-300 bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-100 p-3 text-purple-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all resize-none"
                  rows={3}
                  placeholder="Share your suggestions for this recipe..."
                ></textarea>
                <button
                  className={`mt-2 px-6 py-2 rounded-full bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-500 text-white font-bold shadow-lg transition-transform border-2 border-pink-200 drop-shadow-lg ${suggestionSubmitted ? 'opacity-70 cursor-default' : 'hover:scale-105 animate-pulse'}`}
                  onClick={suggestionSubmitted ? undefined : handleSuggestionSubmit}
                  disabled={suggestionSubmitted}
                >
                  {suggestionSubmitted ? 'Suggestion submitted' : 'Submit Suggestion'}
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gradient-to-br from-purple-50 via-yellow-50 to-pink-100 rounded-2xl p-4 shadow-md flex flex-col gap-3">
              <h3 className="font-bold text-lg mb-1 text-pink-700">Reviews</h3>
              <div className="max-h-40 overflow-y-auto mb-2 rounded-xl bg-white/70 p-3 shadow-inner border border-pink-200">
                {Array.isArray(recipe.reviews) && recipe.reviews.length > 0 ? (
                  recipe.reviews.map((rev, idx) => (
                    <div key={idx} className="mb-2 pb-2 border-b border-yellow-200 last:border-b-0">
                      <div className="font-semibold text-pink-600 flex items-center gap-2">
                        <span className="text-lg">{rev.AuthorName || 'Anonymous'}</span>
                        {rev.Rating && (
                          <span className="text-yellow-500">
                            {'★'.repeat(Math.round(Number(rev.Rating)))}
                            <span className="text-gray-300">
                              {'★'.repeat(5 - Math.round(Number(rev.Rating)))}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="italic text-purple-900">{rev.Review || rev.review}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No reviews yet. Be the first to review!</div>
                )}
              </div>
              <textarea
                className="w-full rounded-xl border-2 border-pink-300 bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-100 p-3 text-purple-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all resize-none"
                rows={3}
                placeholder="Write your review here..."
              ></textarea>
              <button
                className={`mt-1 px-6 py-2 rounded-full bg-gradient-to-r from-purple-400 via-yellow-400 to-pink-500 text-white font-bold shadow-lg transition-transform ${reviewSubmitted ? 'opacity-70 cursor-default' : 'hover:scale-105 animate-pulse'}`}
                onClick={reviewSubmitted ? undefined : handleReviewSubmit}
                disabled={reviewSubmitted}
              >
                {reviewSubmitted ? 'Review submitted' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes popin { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          .animate-popin { animation: popin 0.4s cubic-bezier(.4,2,.6,1) both; }
          @keyframes toastIn { 0% { transform: translateY(40px) scale(0.95); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
          @keyframes toastOut { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(40px) scale(0.95); opacity: 0; } }
        `}</style>
      </div>
    </div>
  );
}
