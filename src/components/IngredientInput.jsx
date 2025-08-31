import React, { useState } from "react";
import { toast } from 'react-toastify';
import { recognizeIngredientsFromImage } from '../services/ingredientRecognition';


const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Low-Carb",
  "High-Protein",
];

export default function IngredientInput({ onSubmit }) {
  const [ingredients, setIngredients] = useState("");
  const [dietary, setDietary] = useState([]);
  const [image, setImage] = useState(null);

  async function handleImageChange(e) {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      try {
        setIngredients('Recognizing ingredients...');
        const recognized = await recognizeIngredientsFromImage(file);
        const uniqueIngredients = Array.from(new Set(recognized.map(i => i.trim().toLowerCase()))).filter(Boolean);
        if (uniqueIngredients.length > 0) {
          setIngredients(uniqueIngredients.join(', '));
        } else {
          setIngredients('');
          toast.error('🥲 No ingredients could be recognized from the image.', {
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
            icon: '🥲',
            progressStyle: {
              background: '#fff',
              height: '6px',
              borderRadius: '3px',
            },
          });
        }
      } catch (err) {
        setIngredients('');
        toast.error('🥲 Could not recognize ingredients from image.', {
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
          icon: '🥲',
          progressStyle: {
            background: '#fff',
            height: '6px',
            borderRadius: '3px',
          },
        });
      }
    }
  }

  function handleDietaryChange(option) {
    setDietary((prev) =>
      prev.includes(option)
        ? prev.filter((d) => d !== option)
        : [...prev, option]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ingredients, dietary, image });
  }

  return (
    <form
      className="rounded-3xl p-8 shadow-2xl flex flex-col gap-6 animate-popin"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 60%, #e0e7ef 100%)',
        border: '3px solid #e0e7ef',
        boxShadow: '0 8px 40px 0 rgba(124,58,237,0.10)',
        backdropFilter: 'blur(18px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
        opacity: 0.97,
      }}
      onSubmit={handleSubmit}
    >
  <label className="font-extrabold text-xl text-transparent bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text drop-shadow">Enter Ingredients (comma separated):</label>
      <input
        type="text"
        className="p-3 rounded-lg border-2 border-purple-400 focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-200 bg-white/70 text-purple-900 font-semibold shadow-md"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="e.g. Tomato, Onion, Cheese"
        style={{ fontSize: '1.1rem' }}
      />
  <label className="font-extrabold text-lg text-transparent bg-gradient-to-r from-pink-600 via-yellow-500 to-purple-600 bg-clip-text drop-shadow">Or upload a photo:</label>
  <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" style={{ color: '#a78bfa', fontWeight: 600 }} />
      <div>
  <label className="font-extrabold text-lg text-transparent bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600 bg-clip-text drop-shadow">Dietary Preferences:</label>
        <div className="flex flex-wrap gap-3 mt-2">
          {dietaryOptions.map((option) => (
            <button
              type="button"
              key={option}
              className={`px-5 py-2 rounded-full border-2 border-purple-400 text-purple-900 font-bold shadow-md transition-all duration-200 hover:bg-purple-200 hover:text-pink-700 focus:ring-2 focus:ring-pink-400 ${dietary.includes(option) ? "bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 text-pink-700 border-pink-400" : "bg-white/80"}`}
              onClick={() => handleDietaryChange(option)}
              style={{ fontSize: '1.08rem', letterSpacing: 0.5 }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="mt-6 bg-gradient-to-r from-yellow-400 via-pink-400 to-fuchsia-500 text-white font-extrabold py-3 px-8 rounded-full shadow-2xl hover:scale-105 hover:shadow-pink-300/40 transition-transform text-lg tracking-wide drop-shadow-lg border-2 border-white/30 animate-pulse"
        style={{ boxShadow: '0 4px 24px 0 rgba(250,204,21,0.13)' }}
      >
        Find Recipes
      </button>
      <style>{`
        @keyframes popin { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-popin { animation: popin 0.4s cubic-bezier(.4,2,.6,1) both; }
      `}</style>
    </form>
  );
}
