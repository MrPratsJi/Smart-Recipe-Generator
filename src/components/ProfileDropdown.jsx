

import React, { useState, useEffect } from 'react';

export default function ProfileDropdown({ favorites, reviews, myRecipes, user, onRecipeSelect, onRemoveFavorite, onShowSuggested, onShowDietary }) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState({ open: false, title: '', items: [] });
  const [isMobile, setIsMobile] = useState(false);

  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  
  const handleViewMore = (title, items) => {
    setModal({ open: true, title, items });
  };
  
  const closeModal = () => setModal({ open: false, title: '', items: [] });

  
  const renderSection = (title, items, emptyMsg, color, isFavoriteSection = false) => (
    <div className="py-3 px-4">
      <div className="flex items-center mb-2">
        <h4 className={`font-bold ${color}`}>{title}</h4>
        {Array.isArray(items) && items.length > 2 && (
          <button
            className="ml-3 px-4 py-1.5 rounded-full font-bold text-base bg-gradient-to-r from-pink-500 via-yellow-400 to-purple-500 text-purple-800 border-2 border-pink-400 shadow-xl hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-pink-400 animate-gradient-x drop-shadow-lg"
            style={{letterSpacing: '0.04em', boxShadow: '0 2px 16px 0 rgba(236,72,153,0.22)', borderWidth: 2, borderStyle: 'solid'}}
            onClick={e => { e.stopPropagation(); handleViewMore(title, items); }}
          >
            <span role="img" aria-label="more" className="mr-2">✨</span> <span style={{fontWeight:700}}>View More</span>
          </button>
        )}
      </div>
      {Array.isArray(items) && items.length > 0 ? (
        <ul className="max-h-32 overflow-y-auto space-y-1">
          {items.slice(0, 2).map((item, idx) => (
            <li
              key={idx}
              className="text-purple-900 text-sm truncate hover:underline cursor-pointer transition-colors duration-200 flex items-center justify-between"
              onClick={() => onRecipeSelect && onRecipeSelect(item)}
            >
              <span>{item.Name || item.title || item.RecipeName || 'Untitled'}</span>
              {isFavoriteSection && onRemoveFavorite && (
                <button
                  className="ml-2 text-pink-500 hover:text-pink-700 text-lg"
                  onClick={e => { e.stopPropagation(); onRemoveFavorite(item._id); }}
                  title="Remove from favorites"
                >
                  ♥
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-400 italic text-xs">{emptyMsg}</div>
      )}
    </div>
  );

  return (
    <div className="relative inline-block text-left">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 hover:bg-white/40 border-2 border-pink-400 shadow"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open profile menu"
      >
        <img
          src={user?.photoURL || '/default-avatar.png'}
          alt="avatar"
          className="w-8 h-8 rounded-full border-2 border-pink-400 object-cover"
          onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
        />
      </button>
      {open && (
        isMobile ? (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fadein">
            <div className="profile-mobile-sidebar w-72 bg-white h-full shadow-2xl p-6 border-l-4 border-pink-300  overflow-y-auto flex flex-col">
              <button className="self-end mb-4 text-2xl text-pink-500 font-bold" onClick={() => setOpen(false)}>✖</button>
              <div className="flex flex-col gap-2">
                <img
                  src={user?.photoURL || '/default-avatar.png'}
                  alt="avatar"
                  className="w-16 h-16 rounded-full border-2 border-pink-400 object-cover mx-auto mb-2"
                  onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                />
                {renderSection('My Favourite Recipes', favorites, 'No favorites yet.', 'text-pink-600', true)}
                {renderSection('Reviewed Recipes', reviews, 'No reviews yet.', 'text-yellow-600')}
                {renderSection('My Recipes', myRecipes, 'No recipes yet.', 'text-purple-600')}
                <button
                  className="w-full text-left py-3 px-4 font-bold text-blue-600 hover:bg-blue-50 rounded-lg mb-2"
                  onClick={() => { setOpen(false); onShowSuggested && onShowSuggested(); }}
                >✨ Suggested Recipes</button>
                <button
                  className="w-full text-left py-3 px-4 font-bold text-pink-600 hover:bg-pink-50 rounded-lg mb-2"
                  onClick={() => { setOpen(false); onShowDietary && onShowDietary(); }}
                >🚫 Dietary Restrictions</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="profile-dropdown-desktop absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl z-50 border-2 border-pink-200 animate-popin">
            <div className="divide-y divide-pink-100 flex flex-col gap-2 w-80">
              {renderSection('My Favourite Recipes', favorites, 'No favorites yet.', 'text-pink-600', true)}
              {renderSection('Reviewed Recipes', reviews, 'No reviews yet.', 'text-yellow-600')}
              {renderSection('My Recipes', myRecipes, 'No recipes yet.', 'text-purple-600')}
            </div>
          </div>
        )
      )}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 animate-fadein">
          <div className="bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-200 rounded-2xl shadow-2xl p-6 w-full max-w-md border-4 border-pink-300 relative mt-32 max-h-80 overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-xl font-bold text-pink-500 hover:text-pink-700 z-10"
              onClick={closeModal}
            >✖</button>
            <h2 className="text-2xl font-extrabold text-center mb-4 bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-600 bg-clip-text text-transparent drop-shadow animate-gradient-x">{modal.title}</h2>
            <ul className="space-y-2">
              {modal.items.map((item, idx) => (
                <li
                  key={idx}
                  className="text-purple-900 text-base font-semibold bg-white/80 rounded-lg px-4 py-2 shadow hover:bg-pink-100 hover:scale-105 transition-all cursor-pointer border border-pink-200"
                  onClick={() => { onRecipeSelect && onRecipeSelect(item); closeModal(); }}
                >
                  {item.Name || item.title || item.RecipeName || 'Untitled'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
