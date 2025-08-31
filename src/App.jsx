import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchUserData, saveUserRecipe, fetchUserFavorites, addUserFavorite, removeUserFavorite, saveUserReview } from './services/firestoreUser';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './services/firebase';
import bgImage from './assets/background1.jpg';
import AuthModal from './components/AuthModal';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import IngredientInput from './components/IngredientInput';
import { fetchRecipesByIngredientsAndDiet } from './services/spoonacular';
import RecipeFilters from './components/RecipeFilters';
import RecipeDetail from './components/RecipeDetail';
import Favorites from './components/Favorites';
import Rating from './components/Rating';
import TrendingRecipes from './components/TrendingRecipes';
import MyRecipesSlider from './components/MyRecipesSlider';
import ProfileDropdown from './components/ProfileDropdown';


function App() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [showDietaryPopup, setShowDietaryPopup] = React.useState(true);
  const [showDietaryModal, setShowDietaryModal] = React.useState(false);
  const restrictedDietary = [
    { name: 'Gluten', color: 'from-red-400 via-pink-400 to-yellow-400', icon: '🚫' },
    { name: 'Dairy', color: 'from-blue-400 via-purple-400 to-pink-400', icon: '🥛' },
    { name: 'Eggs', color: 'from-yellow-400 via-orange-400 to-pink-400', icon: '🥚' },
    { name: 'Nuts', color: 'from-green-400 via-yellow-400 to-red-400', icon: '🥜' },
    { name: 'Soy', color: 'from-purple-400 via-pink-400 to-yellow-400', icon: '🌱' },
    { name: 'Seafood', color: 'from-blue-400 via-cyan-400 to-teal-400', icon: '🦐' },
  ];
  const [suggestionPopupLocked, setSuggestionPopupLocked] = React.useState(false);
  const [showPopup, setShowPopup] = React.useState(true);
  const [showInitial, setShowInitial] = React.useState(true);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = React.useState(false);
  const [fullscreenEnabled, setFullscreenEnabled] = React.useState(false);
  const [showFilterPopup, setShowFilterPopup] = React.useState(false);
  const filterBoxRef = React.useRef(null);
  const [showSuggestedModal, setShowSuggestedModal] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);
  const [recipesData, setRecipesData] = React.useState([]);
  const [loadingRecipes, setLoadingRecipes] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const [reviewedRecipes, setReviewedRecipes] = React.useState([]);
  const [myRecipes, setMyRecipes] = React.useState([]);
  const [favorites, setFavorites] = React.useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = React.useState([]);
  const [showFiltered, setShowFiltered] = React.useState(false);
  const [filteredRecipes, setFilteredRecipes] = React.useState([]);
  const [showAddRecipe, setShowAddRecipe] = React.useState(false);
  const [addRecipePhoto, setAddRecipePhoto] = React.useState(null);

  React.useEffect(() => {
    if (showInitial || suggestionPopupLocked) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowFilterPopup(true);
          setSuggestionPopupLocked(true);
        } else {
          setShowFilterPopup(false);
        }
      },
      { threshold: 0.1 }
    );
    if (filterBoxRef.current) {
      observer.observe(filterBoxRef.current);
    }
    return () => {
      if (filterBoxRef.current) observer.unobserve(filterBoxRef.current);
    };
  }, [showInitial, suggestionPopupLocked]);
  React.useEffect(() => {
  }, [filteredRecipes]);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAddRecipePhoto(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setAddRecipePhoto(null);
    }
  }

  async function handleAddRecipeSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const newRecipe = {
      Name: form.Name.value,
      RecipeCategory: form.RecipeCategory.value,
      Description: form.Description.value,
      Images: addRecipePhoto ? `c("${addRecipePhoto}")` : '',
      RecipeIngredientParts: `c(${form.RecipeIngredientParts.value.split(',').map(s => `"${s.trim()}"`).join(',')})`,
      RecipeIngredientQuantities: `c(${form.RecipeIngredientQuantities.value.split(',').map(s => `"${s.trim()}"`).join(',')})`,
      RecipeInstructions: `c(${form.RecipeInstructions.value.split(',').map(s => `"${s.trim()}"`).join(',')})`,
      Calories: form.Calories.value,
      ProteinContent: form.ProteinContent.value,
      CarbohydrateContent: form.CarbohydrateContent.value,
      FatContent: form.FatContent.value,
      CookTime: form.CookTime.value,
      PrepTime: form.PrepTime.value,
      RecipeServings: form.RecipeServings.value,
      CreatedBy: user ? user.uid : 'guest',
      id: `user_${Date.now()}`
    };
    setRecipesData(prev => [newRecipe, ...prev]);
    setMyRecipes(prev => [newRecipe, ...prev]);
    if (user && user.uid) {
      try {
        await saveUserRecipe(user.uid, newRecipe);
      } catch (err) {
        console.error('Failed to save recipe to Firestore:', err);
      }
    }
    setShowAddRecipe(false);
    setAddRecipePhoto(null);
    toast.success('🍽️ Recipe added successfully!', {
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
  const suggestedRecipes = React.useMemo(() => {
    const all = [...(favoriteRecipes || []), ...(reviewedRecipes || [])];
    const seen = new Set();
    return all.filter(r => {
      const id = r.RecipeId || r.id || r.Name;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [favoriteRecipes, reviewedRecipes]);

  React.useEffect(() => {
    function onReviewSubmit(e) {
      const recipe = e.detail;
      if (!reviewedRecipes.find(r => r.RecipeId === recipe.RecipeId)) {
        setReviewedRecipes(prev => [...prev, recipe]);
        if (user && user.uid) {
          saveUserReview(user.uid, recipe).catch(err => console.error('Failed to save review:', err));
        }
      }
    }
    window.addEventListener('reviewSubmit', onReviewSubmit);
    return () => window.removeEventListener('reviewSubmit', onReviewSubmit);
  }, [reviewedRecipes, user]);

  const handleAddFavorite = React.useCallback(async (recipe) => {
    if (!user || !user.uid) return;
    try {
      await addUserFavorite(user.uid, recipe);
      const favs = await fetchUserFavorites(user.uid);
      setFavorites(favs);
    } catch (err) {
      console.error('Failed to add favorite:', err);
    }
  }, [user]);

  async function handleRemoveFavoriteById(favDocId) {
    if (!user || !user.uid) return;
    try {
      await removeUserFavorite(user.uid, favDocId);
      const favs = await fetchUserFavorites(user.uid);
      setFavorites(favs);
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  }


  React.useEffect(() => {
    async function ensureUserAndFetch() {
      if (user && user.uid) {
        try {
          await setDoc(doc(db, 'users', user.uid), {}, { merge: true });
        } catch (err) {
          console.error('Failed to create user doc:', err);
        }
        try {
          const data = await fetchUserData(user.uid);
          const favs = await fetchUserFavorites(user.uid);
          if (data) {
            setFavorites(favs);
            setReviewedRecipes(data.reviewed || []);
            setMyRecipes(data.myRecipes || []);
          } else {
            setFavorites([]);
            setReviewedRecipes([]);
            setMyRecipes([]);
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          setFavorites([]);
          setReviewedRecipes([]);
          setMyRecipes([]);
        }
      } else {
        setFavorites([]);
        setReviewedRecipes([]);
        setMyRecipes([]);
      }
    }
    ensureUserAndFetch();
  }, [user]);

  React.useEffect(() => {
    if (Array.isArray(favorites) && favorites.length > 0 && recipesData.length > 0) {
      if (typeof favorites[0] === 'string' || typeof favorites[0] === 'number') {
        setFavoriteRecipes(favorites
          .map(id => recipesData.find(r => r.RecipeId === id || r.id === id))
          .filter(Boolean)
        );
      } else {
        setFavoriteRecipes(favorites);
      }
    } else {
      setFavoriteRecipes([]);
    }
  }, [favorites, recipesData]);

  React.useEffect(() => {
    fetch('/merged_recipes_reviews_small.json')
      .then(res => res.json())
      .then(data => {
        setRecipesData(data);
        setLoadingRecipes(false);
      })
      .catch(() => setLoadingRecipes(false));
  }, []);
  React.useEffect(() => {
    if (!showPopup) {
      setShowFullscreenPrompt(true);
    }
  }, [showPopup]);

  React.useEffect(() => {
    if (fullscreenEnabled) {
      document.body.classList.add('fullscreen-enabled');
    } else {
      document.body.classList.remove('fullscreen-enabled');
    }
  }, [fullscreenEnabled]);
  const [filters, setFilters] = React.useState({ difficulty: '', cookingTime: '', servingSize: '' });
  const [selectedRecipe, setSelectedRecipe] = React.useState(null);
  const [ratings, setRatings] = React.useState({});
  const [randomRecipe, setRandomRecipe] = React.useState(null);
  const [showAuth, setShowAuth] = React.useState(false);
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);
  React.useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const themes = [
    {
      name: 'Dark',
      bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700',
      accent: 'from-gray-700 to-gray-900',
      text: 'text-white',
      header: 'bg-gray-900/80',
      footer: 'from-gray-800 via-gray-900 to-gray-700',
    },
    {
      name: 'Vibrant Pink/Purple',
      bg: 'bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400',
      accent: 'from-yellow-400 to-pink-400',
      text: 'text-purple-900',
      header: 'bg-white/20',
      footer: 'from-purple-400 via-pink-400 to-yellow-400',
    },
    {
      name: 'Blue/Green',
      bg: 'bg-gradient-to-br from-blue-400 via-green-300 to-cyan-400',
      accent: 'from-green-400 to-blue-400',
      text: 'text-blue-900',
      header: 'bg-white/20',
      footer: 'from-cyan-400 via-green-400 to-blue-400',
    },
    {
      name: 'Orange/Pink',
      bg: 'bg-gradient-to-br from-orange-400 via-pink-400 to-red-400',
      accent: 'from-pink-400 to-orange-400',
      text: 'text-orange-900',
      header: 'bg-white/20',
      footer: 'from-orange-400 via-pink-400 to-red-400',
    },
    {
      name: 'Teal/Yellow',
      bg: 'bg-gradient-to-br from-teal-300 via-yellow-200 to-green-300',
      accent: 'from-yellow-300 to-teal-400',
      text: 'text-teal-900',
      header: 'bg-white/20',
      footer: 'from-teal-300 via-yellow-300 to-green-300',
    },
  ];
  const [themeIdx, setThemeIdx] = React.useState(0);
  const theme = themes[themeIdx];
  function handleThemeSwitch() {
    setThemeIdx((idx) => (idx + 1) % themes.length);
  }
  React.useEffect(() => {
    if (recipesData.length > 0) {
      setRandomRecipe(recipesData[Math.floor(Math.random() * recipesData.length)]);
    }
  }, [recipesData]);
  React.useEffect(() => {
    function onAddFavorite(e) {
      handleAddFavorite(e.detail);
    }
    window.addEventListener('addFavorite', onAddFavorite);
    return () => window.removeEventListener('addFavorite', onAddFavorite);
  }, [favorites, handleAddFavorite]);

  function handleRemoveFavorite(id) {
    setFavorites(favorites.filter((r) => r.RecipeId !== id));
  }

  function handleRateRecipe(id, value) {
    setRatings({ ...ratings, [id]: value });
  }

  async function handleIngredientSubmit(input) {
    const enteredIngredients = input.ingredients
      .split(',')
      .map((i) => i.trim().toLowerCase())
      .filter(Boolean);
    const dietary = (input.dietary || []).map(d => d.toLowerCase().replace(/-/g, ''));
    setShowFiltered(false);
    toast.info('🔎 Finding recipes for you...', {
      position: 'bottom-right',
      style: {
        background: 'linear-gradient(90deg, #a5b4fc 0%, #f472b6 50%, #facc15 100%)',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)',
        padding: '1.2rem 2rem',
        letterSpacing: '0.03em',
        border: '2px solid #fff6',
      },
      icon: '🔎',
      progressStyle: {
        background: '#fff',
        height: '6px',
        borderRadius: '3px',
      },
    });
    try {
      const apiRecipes = await fetchRecipesByIngredientsAndDiet(enteredIngredients, dietary, 16);
      const mappedRecipes = apiRecipes.map(r => ({
        ...r,
        id: r.id,
        name: r.title,
        image: r.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        servings: r.servings || 'N/A',
        cookingTime: r.readyInMinutes || 'N/A',
        difficulty: r.readyInMinutes <= 30 ? 'Easy' : r.readyInMinutes <= 60 ? 'Medium' : 'Hard',
        dietary: (r.diets || []).map(d => d.charAt(0).toUpperCase() + d.slice(1)),
      }));
      setFilteredRecipes(mappedRecipes);
      setShowFiltered(true);
      if (mappedRecipes.length === 0) {
        toast.error('🍽️ No recipes found for your ingredients!', {
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
            marginTop: '80px',
          },
          icon: '😕',
          progressStyle: {
            background: '#fff',
            height: '6px',
            borderRadius: '3px',
          },
        });
      }
    } catch (err) {
      toast.error('Failed to fetch recipes from Spoonacular API.', {
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
          marginTop: '80px',
        },
        icon: '❌',
        progressStyle: {
          background: '#fff',
          height: '6px',
          borderRadius: '3px',
        },
      });
    }
  }

  function getDifficulty(recipe) {
    let cook = recipe.CookTime || '';
    let mins = 0;
    if (typeof cook === 'string') {
      let h = 0, m = 0;
      const hourMatch = cook.match(/PT(\d+)H/);
      const minMatches = cook.match(/(\d+)M/g);
      if (hourMatch) h = parseInt(hourMatch[1]);
      if (minMatches) {
        m = parseInt(minMatches[minMatches.length - 1]);
      }
      mins = h * 60 + m;
      if (mins === 0 && !isNaN(parseInt(cook))) mins = parseInt(cook);
    } else if (typeof cook === 'number') {
      mins = cook;
    }
    if (mins > 0 && mins <= 30) return 'Easy';
    if (mins > 30 && mins <= 60) return 'Medium';
    if (mins > 60) return 'Hard';
    return 'Unknown';
  }

  function handleShowFiltered() {
    let filtered = recipesData.filter(r => {
      const diff = getDifficulty(r);
      const matchesDifficulty = !filters.difficulty || diff.toLowerCase() === filters.difficulty.toLowerCase();
      let prep = r.PrepTime;
      let mins = 0;
      if (!prep || prep === '' || prep === 'NA') {
        prep = r.CookTime || '';
      }
      if (typeof prep === 'string') {
        let h = 0, m = 0;
        const hourMatch = prep.match(/PT(\d+)H/);
        const minMatches = prep.match(/(\d+)M/g);
        if (hourMatch) h = parseInt(hourMatch[1]);
        if (minMatches) m = parseInt(minMatches[minMatches.length - 1]);
        mins = h * 60 + m;
        if (mins === 0 && !isNaN(parseInt(prep))) mins = parseInt(prep);
      } else if (typeof prep === 'number') {
        mins = prep;
      }
      const matchesCookTime = !filters.cookingTime || mins <= parseInt(filters.cookingTime);
      let servings = r.RecipeServings || '';
      let matchesServingSize = true;
      if (filters.servingSize) {
        if (typeof servings === 'string' && servings.trim() !== '') {
          const num = parseInt(servings);
          matchesServingSize = !(isNaN(num) || num !== parseInt(filters.servingSize));
        } else if (typeof servings === 'number') {
          matchesServingSize = servings === parseInt(filters.servingSize);
        }
      }
      const result = matchesDifficulty && matchesCookTime && matchesServingSize;
      return result;
    });
    setFilteredRecipes(filtered);
    setShowFiltered(true);
    if (filtered.length === 0) {
      toast.error('🍽️ No such recipe found!', {
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
          marginTop: '80px',
        },
        icon: '😕',
        progressStyle: {
          background: '#fff',
          height: '6px',
          borderRadius: '3px',
        },
      });
    }
  }

  React.useEffect(() => {
    if (!user) setSuggestionPopupLocked(false);
  }, [user]);

  return (
    <div className={`min-h-screen w-full relative font-sans ${theme.text}`}>
      {showSuggestedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadein">
          <div className="bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 rounded-3xl shadow-2xl p-8 border-4 border-pink-300 relative w-full max-w-3xl flex flex-col items-center" style={{maxHeight:'70vh', overflowY:'auto'}}>
            <button
              className="absolute top-3 right-3 text-xl font-bold text-pink-500 hover:text-pink-700 z-10"
              onClick={() => setShowSuggestedModal(false)}
            >✖</button>
            <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-600 bg-clip-text text-transparent drop-shadow animate-gradient-x">Suggested Recipes For You</h2>
            {(() => {
              const favs = favoriteRecipes || [];
              const revs = reviewedRecipes || [];
              const all = [...favs, ...revs];
              const allCats = Array.from(new Set(all.map(r => r.RecipeCategory).filter(Boolean)));
              const getIngredients = r => {
                if (!r) return [];
                let field = r.RecipeIngredientParts || r.ingredients || r.Ingredients;
                if (!field) return [];
                if (Array.isArray(field)) return field.map(i => i.toLowerCase());
                if (typeof field === 'string') {
                  let cleaned = field.trim().replace(/^c\(|\)$/g, '');
                  cleaned = cleaned.replace(/^"|"$/g, '');
                  let arr = cleaned.split(/",\s*"/).map(s => s.replace(/^"|"$/g, '').trim().toLowerCase()).filter(Boolean);
                  if (!arr.length) arr = cleaned.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                  return arr;
                }
                return [];
              };
              const allIngs = Array.from(new Set(all.flatMap(getIngredients)));
              const getNum = v => (typeof v === 'number' ? v : parseFloat((v||'').toString().replace(/[^\d.]/g, '')));
              const getTimeMins = v => {
                if (!v) return null;
                if (typeof v === 'number') return v;
                if (typeof v === 'string') {
                  let h = 0, m = 0;
                  const hourMatch = v.match(/PT(\d+)H/);
                  const minMatches = v.match(/(\d+)M/g);
                  if (hourMatch) h = parseInt(hourMatch[1]);
                  if (minMatches) m = parseInt(minMatches[minMatches.length - 1]);
                  let mins = h * 60 + m;
                  if (mins === 0 && !isNaN(parseInt(v))) mins = parseInt(v);
                  return mins || null;
                }
                return null;
              };
              const getRange = arr => {
                if (!arr.length) return [null, null];
                const min = Math.min(...arr), max = Math.max(...arr);
                return [min * 0.8, max * 1.2];
              };
              const calArr = all.map(r => getNum(r.Calories)).filter(Boolean);
              const protArr = all.map(r => getNum(r.ProteinContent)).filter(Boolean);
              const carbArr = all.map(r => getNum(r.CarbohydrateContent)).filter(Boolean);
              const fatArr = all.map(r => getNum(r.FatContent)).filter(Boolean);
              const prepArr = all.map(r => getTimeMins(r.PrepTime)).filter(Boolean);
              const cookArr = all.map(r => getTimeMins(r.CookTime)).filter(Boolean);
              const [calMin, calMax] = getRange(calArr);
              const [protMin, protMax] = getRange(protArr);
              const [carbMin, carbMax] = getRange(carbArr);
              const [fatMin, fatMax] = getRange(fatArr);
              const [prepMin, prepMax] = getRange(prepArr);
              const [cookMin, cookMax] = getRange(cookArr);
              const suggested = (recipesData || []).filter(r => {
                if (!allCats.includes(r.RecipeCategory)) return false;
                const rIngs = getIngredients(r);
                const matchCount = rIngs.filter(ing => allIngs.includes(ing)).length;
                if (matchCount < 3) return false;
                const cal = getNum(r.Calories), prot = getNum(r.ProteinContent), carb = getNum(r.CarbohydrateContent), fat = getNum(r.FatContent);
                if (calMin && calMax && (cal < calMin || cal > calMax)) return false;
                if (protMin && protMax && (prot < protMin || prot > protMax)) return false;
                if (carbMin && carbMax && (carb < carbMin || carb > carbMax)) return false;
                if (fatMin && fatMax && (fat < fatMin || fat > fatMax)) return false;
                const prep = getTimeMins(r.PrepTime);
                const cook = getTimeMins(r.CookTime);
                if (prepMin && prepMax && (prep === null || prep < prepMin || prep > prepMax)) return false;
                if (cookMin && cookMax && (cook === null || cook < cookMin || cook > cookMax)) return false;
                return true;
              });
              if (suggested.length > 0) {
                return (
                  <div className="w-full flex flex-wrap gap-6 justify-center" style={{maxHeight:'60vh', overflowY:'auto'}}>
                    {suggested.map(recipe => {
                      let fallback = {
                        Description: recipe.summary ? recipe.summary.replace(/<[^>]+>/g, '') : 'No description available.',
                        RecipeCategory: recipe.dishTypes && recipe.dishTypes.length > 0 ? recipe.dishTypes[0] : 'General',
                        PrepTime: recipe.readyInMinutes ? `PT${recipe.readyInMinutes}M` : recipe.PrepTime || recipe.CookTime || 'N/A',
                        CookTime: recipe.readyInMinutes ? `PT${recipe.readyInMinutes}M` : recipe.CookTime || recipe.PrepTime || 'N/A',
                        RecipeServings: recipe.servings || recipe.RecipeServings || 'N/A',
                        RecipeIngredientParts: recipe.extendedIngredients ? recipe.extendedIngredients.map(i => i.originalName) : recipe.RecipeIngredientParts || recipe.ingredients || recipe.Ingredients || ['Not specified'],
                        RecipeIngredientQuantities: recipe.extendedIngredients ? recipe.extendedIngredients.map(i => i.amount + ' ' + i.unit) : recipe.RecipeIngredientQuantities || ['N/A'],
                        Calories: recipe.nutrition && recipe.nutrition.nutrients ? (recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || '250') : recipe.Calories || '250',
                        ProteinContent: recipe.nutrition && recipe.nutrition.nutrients ? (recipe.nutrition.nutrients.find(n => n.name === 'Protein')?.amount || '8') : recipe.ProteinContent || '8',
                        CarbohydrateContent: recipe.nutrition && recipe.nutrition.nutrients ? (recipe.nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount || '30') : recipe.CarbohydrateContent || '30',
                        FatContent: recipe.nutrition && recipe.nutrition.nutrients ? (recipe.nutrition.nutrients.find(n => n.name === 'Fat')?.amount || '10') : recipe.FatContent || '10',
                        reviews: recipe.reviews || [],
                        Name: recipe.Name || recipe.name || recipe.title || 'Untitled Recipe',
                        Images: recipe.Images || recipe.image || '',
                      };
                      const recipeForDetail = { ...fallback, ...recipe };
                      return (
                        <div
                          key={recipe.RecipeId || recipe.id || recipe.Name}
                          className="bg-white/90 rounded-2xl shadow-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:scale-105 hover:shadow-pink-300/60 transition-all border-2 border-transparent hover:border-pink-400 relative min-w-[220px] max-w-[260px] w-[220px]"
                          onClick={() => { setSelectedRecipe(recipeForDetail); setShowSuggestedModal(false); }}
                        >
                          <img src={(() => {
                            if (typeof recipe.Images === 'string' && recipe.Images.match(/https?:\/\/[^"\s]+/g)) {
                              return recipe.Images.match(/https?:\/\/[^"\s]+/g)[0];
                            } else if (recipe.image) {
                              return recipe.image;
                            } else {
                              return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
                            }
                          })()} alt={recipe.Name || recipe.name} className="w-full h-32 object-cover rounded-xl mb-2 bg-gray-100" />
                          <div className="font-bold text-lg text-pink-700 text-center mb-1">{recipe.Name || recipe.name}</div>
                          <div className="flex gap-2 text-xs text-purple-700 mb-1">
                            <span>⏱️ {recipe.PrepTime || recipe.CookTime || '-'} min</span>
                            <span>🍽️ {recipe.RecipeServings || recipe.servings || '-'}</span>
                          </div>
                          <div className="text-xs text-gray-500 text-center">{recipe.Description ? recipe.Description.slice(0, 60) + (recipe.Description.length > 60 ? '...' : '') : ''}</div>
                          <div className="flex flex-wrap gap-1 mt-2 justify-center">
                            {getIngredients(recipe).slice(0, 5).map((ing, i) => (
                              <span key={i} className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-semibold shadow">{ing}</span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2 justify-center text-xs">
                            <span className="bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full font-semibold shadow">Cal: {recipe.Calories || '-'}</span>
                            <span className="bg-pink-50 text-pink-800 px-2 py-1 rounded-full font-semibold shadow">Prot: {recipe.ProteinContent || '-'}</span>
                            <span className="bg-purple-50 text-purple-800 px-2 py-1 rounded-full font-semibold shadow">Carb: {recipe.CarbohydrateContent || '-'}</span>
                            <span className="bg-green-50 text-green-800 px-2 py-1 rounded-full font-semibold shadow">Fat: {recipe.FatContent || '-'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                return <div className="text-center text-lg text-pink-600 font-bold mt-8">No suggestions yet! Add favorites or review recipes to get suggestions.</div>;
              }
            })()}
          </div>
        </div>
      )}
      {showPopup && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30">
            <div className="bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-1 rounded-2xl shadow-2xl animate-pop-in flex items-center justify-center" style={{ width: '420px', height: '420px' }}>
              <div className="bg-white/90 rounded-2xl w-full h-full flex flex-col items-center justify-center gap-4">
                  <img src="src\assets\Robot_Hi-removebg-preview.png" alt="3D Robot Hello" className="w-60 h-60 object-contain animate-float" style={{background: 'transparent'}} />
                <span className="text-xl md:text-2xl font-bold text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text animate-gradient-x text-center px-2">Click Get Started to use all the features</span>
              </div>
            </div>
          </div>
          <style>{`.app-content-blur { filter: blur(12px) brightness(0.7); pointer-events: none; user-select: none; }`}</style>
        </>
      )}
      {fullscreenEnabled ? (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bgImage})`,
            opacity: 0.85,
            filter: 'brightness(0.85) blur(0.5px)',
            transition: 'background-image 0.5s',
          }}
        ></div>
      ) : (
        <div className={`fixed inset-0 -z-10 animate-gradient ${theme.bg}`}></div>
      )}
  <div className={(showPopup || (!user && !showInitial)) ? 'app-content-blur' : ''}>
  <header
    className={`w-full px-4 flex items-center justify-between backdrop-blur-lg shadow-lg sticky top-0 z-20 ${fullscreenEnabled ? 'fullscreen-header' : ''}`}
    style={{
      paddingTop: fullscreenEnabled ? '3.5rem' : '1.5rem',
      paddingBottom: fullscreenEnabled ? '3.5rem' : '1.5rem',
      background: fullscreenEnabled
        ? 'rgba(255,255,255,0.28)'
        : undefined,
      boxShadow: fullscreenEnabled
        ? '0 4px 32px 0 rgba(0,0,0,0.10), 0 1.5px 0 0 rgba(255,255,255,0.10)'
        : undefined
    }}
  >
        <div className="flex items-center gap-3">
          <span className="text-4xl animate-bounce">🍳</span>
          <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg text-white bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Smart Recipe Generator</h1>
        </div>
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <ProfileDropdown
                favorites={favoriteRecipes}
                reviews={reviewedRecipes}
                myRecipes={myRecipes}
                user={user}
                onRecipeSelect={setSelectedRecipe}
                onRemoveFavorite={handleRemoveFavoriteById}
                onShowSuggested={() => setShowSuggestedModal(true)}
                onShowDietary={() => setShowDietaryModal(true)}
              />
              <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                toastStyle={{
                  background: 'linear-gradient(90deg, #f472b6 0%, #facc15 50%, #a78bfa 100%)',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)',
                  padding: '1.2rem 2rem',
                  letterSpacing: '0.03em',
                  border: '2px solid #fff6',
                }}
                progressStyle={{
                  background: '#fff',
                  height: '6px',
                  borderRadius: '3px',
                }}
              />
              <button
                className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white/30 ml-2"
                onClick={handleLogout}
                title="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="bg-gradient-to-r from-yellow-400 via-pink-400 to-fuchsia-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white/30 animate-pulse"
              onClick={() => setShowAuth(true)}
              title="Login or Sign Up"
            >
              Login / Sign Up
            </button>
          )}
          <button
            className={`bg-gradient-to-r ${theme.accent} ${theme.text} font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 transition-transform border-2 border-white/30`}
            onClick={handleThemeSwitch}
            title={`Switch theme (Current: ${theme.name})`}
          >
            Theme
          </button>
        </div>
  </header>
  <main className={`relative w-full max-w-2xl mx-auto flex flex-col gap-8 items-center px-2 animate-fadein ${fullscreenEnabled ? 'fullscreen-main' : ''}`} style={{paddingTop: fullscreenEnabled ? '2.5rem' : '2rem', paddingBottom: fullscreenEnabled ? '2.5rem' : '4rem'}}>
    <div
      className="main-blur-bg"
      style={{
        backgroundImage: `url(${bgImage})`
      }}
    ></div>
        {(!showInitial && !showAuth && !selectedRecipe && !showPopup && fullscreenEnabled) && (
          <button
            className="fixed top-56 left-6 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 text-white font-bold py-3 px-10 rounded-full shadow-lg hover:scale-105 transition-transform text-xl border-2 border-white/30 animate-pulse drop-shadow-lg z-50"
            onClick={() => setShowInitial(true)}
            style={{ minWidth: 120 }}
          >
            &#8592; Back
          </button>
        )}
        {showAll ? (
          <TrendingRecipes recipes={recipesData} onSelect={setSelectedRecipe} showAll={showAll} setShowAll={setShowAll} setShowInitial={setShowInitial} />
        ) : showInitial ? (
          <>
            <div className="w-full text-center mb-4 animate-fadein">
              <div className="relative max-w-xl mx-auto bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-3xl p-1 shadow-2xl animate-gradient-x">
                <div className="bg-white/20 rounded-3xl p-6 flex flex-col items-center gap-4">
                  <div className="flex flex-col items-center gap-2 animate-bounce-slow">
                    <span className="text-5xl">📸</span>
                    <h2 className="text-2xl font-extrabold text-white drop-shadow">Snap a Photo</h2>
                  </div>
                  <p className="text-lg text-white/90">Or select your ingredients, set your preferences, and discover vibrant, healthy recipes tailored just for you!</p>
                  <button
                    className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 via-pink-400 to-fuchsia-500 text-white font-bold shadow-lg hover:scale-105 transition-transform animate-pulse"
                    onClick={() => {
                      setShowInitial(false);
                      setShowAuth(true);
                    }}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
            {randomRecipe && (
              <div className="w-full flex justify-center animate-fadein cursor-pointer" onClick={() => setSelectedRecipe(randomRecipe)}>
                <div className="bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-200 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center mb-8 border-4 border-pink-300 max-w-2xl w-full p-8 relative overflow-hidden" style={{ minHeight: 240 }}>
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 rounded-full blur-2xl opacity-40 z-0"></div>
                  <h2 className="w-full text-2xl font-extrabold bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-600 bg-clip-text text-transparent drop-shadow mb-6 flex items-center justify-center text-center animate-gradient-x z-20" style={{position:'absolute',top:0,left:0,right:0,margin:'0 auto',paddingTop:'1.5rem'}}>
                    <span role="img" aria-label="clover" className="mr-2">🍀</span> Recipe of the Day
                  </h2>
                  <div className="flex-shrink-0 flex items-center justify-center w-52 h-40 bg-white/70 rounded-2xl overflow-hidden border-4 border-pink-200 shadow-lg mr-8 z-10 mt-12">
                    <img
                      src={(() => {
                        if (typeof randomRecipe.Images === 'string') {
                          const urls = randomRecipe.Images.replace(/^c\(|\)$/g, '')
                            .split(/",\s*"/)
                            .map(s => s.replace(/^"|"$/g, ''));
                          return urls[0] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
                        }
                        return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
                      })()}
                      alt={randomRecipe.Name}
                      className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-300"
                      onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'; }}
                    />
                  </div>
                  <div className="flex flex-col flex-1 justify-center z-10 mt-4">
                    <div className="font-extrabold text-2xl md:text-3xl text-center mb-2 bg-gradient-to-r from-pink-600 via-yellow-500 to-purple-700 bg-clip-text text-transparent drop-shadow-lg tracking-wide animate-gradient-x" style={{marginTop: '2.5rem'}}>
                      {randomRecipe.Name}
                    </div>
                    <div className="text-base text-gray-700 mb-2 text-center italic">
                      {(() => {
                        if (typeof randomRecipe.RecipeIngredientParts === 'string') {
                          return randomRecipe.RecipeIngredientParts.replace(/^c\(|\)$/g, '')
                            .split(/",\s*"/)
                            .map(s => s.replace(/^"|"$/g, ''))
                            .join(', ');
                        }
                        return '-';
                      })()}
                    </div>
                    <div className="flex flex-row gap-4 text-xs text-gray-800 mt-1 justify-center">
                      <span className="bg-yellow-100 rounded px-2 py-1 font-semibold">Calories: <span className="text-pink-700">{randomRecipe.Calories || '-'}</span></span>
                      <span className="bg-purple-100 rounded px-2 py-1 font-semibold">Protein: <span className="text-pink-700">{randomRecipe.ProteinContent || '-'}</span></span>
                      <span className="bg-pink-100 rounded px-2 py-1 font-semibold">Carbs: <span className="text-pink-700">{randomRecipe.CarbohydrateContent || '-'}</span></span>
                      <span className="bg-yellow-50 rounded px-2 py-1 font-semibold">Fat: <span className="text-pink-700">{randomRecipe.FatContent || '-'}</span></span>
                    </div>
                    {randomRecipe.reviews && randomRecipe.reviews.length > 0 && (
                      <div className="mt-3 text-xs text-purple-700 italic text-center bg-purple-100 rounded-lg px-3 py-2 shadow-inner max-w-full">
                        “{randomRecipe.reviews[0].Review || randomRecipe.reviews[0].review || ''}”
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : showAll ? (
          <TrendingRecipes recipes={recipesData} onSelect={setSelectedRecipe} showAll={showAll} setShowAll={setShowAll} />
        ) : (
          <>
            {loadingRecipes ? (
              <div className="text-center text-lg py-8">Loading recipes...</div>
            ) : (
              <TrendingRecipes recipes={recipesData} onSelect={setSelectedRecipe} showAll={showAll} setShowAll={setShowAll} setShowInitial={setShowInitial} />
            )}
            <div className="mt-8 flex flex-col items-center">
              <button
                className="bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-400 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform text-xl border-2 border-white/30 animate-pulse mb-4"
                onClick={() => setShowAddRecipe(true)}
              >
                + Add Recipe
              </button>
              <MyRecipesSlider recipes={myRecipes} onSelect={setSelectedRecipe} />
            </div>
            {showAddRecipe && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadein">
                <div className="bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-200 rounded-2xl shadow-2xl p-8 w-full max-w-2xl border-4 border-pink-300 relative">
                  <button
                    className="absolute top-3 right-3 text-xl font-bold text-pink-500 hover:text-pink-700 z-10"
                    onClick={() => setShowAddRecipe(false)}
                  >✖</button>
                  <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-600 bg-clip-text text-transparent drop-shadow animate-gradient-x">Add Your Recipe</h2>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleAddRecipeSubmit}>
                    <div className="flex flex-col gap-3">
                      <label className="font-bold text-pink-700">Recipe Name</label>
                      <input className="rounded-lg border-2 border-pink-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 text-black" name="Name" required />
                      <label className="font-bold text-yellow-700">Category</label>
                      <input className="rounded-lg border-2 border-yellow-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black" name="RecipeCategory" required />
                      <label className="font-bold text-purple-700">Description</label>
                      <textarea className="rounded-lg border-2 border-purple-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-black" name="Description" required />
                      <label className="font-bold text-pink-700">Photo</label>
                      <input type="file" accept="image/*" className="rounded-lg border-2 border-pink-300 px-3 py-2 text-black" name="Photo" onChange={handlePhotoChange} />
                      {addRecipePhoto && <img src={addRecipePhoto} alt="Preview" className="w-32 h-24 object-cover rounded-lg border-2 border-pink-200 mt-2" />}
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <div className="flex flex-col">
                          <label className="font-bold text-yellow-700">Cook Time</label>
                          <input className="rounded-lg border-2 border-yellow-300 px-3 py-2 text-black" name="CookTime" placeholder="e.g. PT30M" />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-bold text-yellow-700">Prep Time</label>
                          <input className="rounded-lg border-2 border-yellow-300 px-3 py-2 text-black" name="PrepTime" placeholder="e.g. PT15M" />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-bold text-yellow-700">Servings</label>
                          <input className="rounded-lg border-2 border-yellow-300 px-3 py-2 text-black" name="RecipeServings" type="number" min="1" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="font-bold text-pink-700">Ingredients (comma separated)</label>
                      <input className="rounded-lg border-2 border-pink-300 px-3 py-2 text-black" name="RecipeIngredientParts" required />
                      <label className="font-bold text-yellow-700">Quantities (comma separated)</label>
                      <input className="rounded-lg border-2 border-yellow-300 px-3 py-2 text-black" name="RecipeIngredientQuantities" required />
                      <label className="font-bold text-purple-700">Instructions (comma separated)</label>
                      <textarea className="rounded-lg border-2 border-purple-300 px-3 py-2 text-black" name="RecipeInstructions" required />
                      <label className="font-bold text-pink-700">Calories</label>
                      <input className="rounded-lg border-2 border-pink-300 px-3 py-2 text-black" name="Calories" type="number" step="any" />
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col">
                          <label className="font-bold text-yellow-700">Protein</label>
                          <input className="rounded-lg border-2 border-yellow-300 px-3 py-2 text-black" name="ProteinContent" type="number" step="any" />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-bold text-purple-700">Carbs</label>
                          <input className="rounded-lg border-2 border-purple-300 px-3 py-2 text-black" name="CarbohydrateContent" type="number" step="any" />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-bold text-pink-700">Fat</label>
                          <input className="rounded-lg border-2 border-pink-300 px-3 py-2 text-black" name="FatContent" type="number" step="any" />
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="col-span-2 mt-4 bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-400 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform text-xl border-2 border-white/30 animate-pulse">Submit Recipe</button>
                  </form>
                </div>
              </div>
            )}
            <div style={{marginTop:70, position: 'relative'}} ref={filterBoxRef}>
              <RecipeFilters filters={filters} setFilters={setFilters} onShow={handleShowFiltered} />
              {(showFilterPopup || suggestionPopupLocked) && !showInitial && !showSuggestedModal && !isMobile && (
                <div className="absolute z-10 animate-pop-in"
                  style={{
                    left: '-400px',
                    top: '90%',
                    maxWidth: '420px',
                    minWidth: '320px',
                    width: '90%',
                    boxSizing: 'border-box',
                  }}>
                  <div className="bg-gradient-to-br from-white via-blue-100 to-pink-100 rounded-2xl px-8 py-7 flex flex-col items-center gap-3 border-4 border-white shadow-xl" style={{boxShadow: '0 8px 32px 0 rgba(59,130,246,0.18)', border:'4px solid #fff', borderRadius:'24px'}}>
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-blue-400 to-pink-500 bg-clip-text text-transparent animate-gradient-x text-center drop-shadow" style={{WebkitTextStroke: '1px #fff'}}>✨ Suggestions</span>
                    <span className="text-lg font-bold text-blue-900 text-center drop-shadow animate-bounce">Click below to view suggested recipes</span>
                    <button
                      className="mt-4 px-8 py-2 rounded-full bg-gradient-to-r from-blue-400 via-pink-400 to-indigo-400 text-white font-bold shadow-lg hover:scale-105 transition-transform animate-pulse text-lg border-2 border-white/30"
                      onClick={() => setShowSuggestedModal(true)}
                      style={{boxShadow:'0 4px 16px 0 rgba(59,130,246,0.18)'}}
                    >
                      See
                    </button>
                  </div>
                </div>
              )}
              {showDietaryPopup && !isMobile && (
                <div
                  className={`absolute animate-pop-in ${showDietaryModal || showSuggestedModal ? 'z-20 pointer-events-none opacity-80' : 'z-10'}`}
                  style={{
                    left: '712px',
                    top: '91%',
                    maxWidth: '420px',
                    minWidth: '320px',
                    width: '90%',
                    boxSizing: 'border-box',
                    transition: 'opacity 0.3s',
                  }}
                >
                  <div className="bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-100 rounded-2xl px-8 py-7 flex flex-col items-center gap-3 border-4 border-pink-200 shadow-xl" style={{boxShadow: '0 8px 32px 0 rgba(236,72,153,0.18)', border:'4px solid #fff', borderRadius:'24px'}}>
                    <span className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x text-center drop-shadow" style={{WebkitTextStroke: '1px #fff'}}>🚫 Dietary Restrictions</span>
                    <span className="text-lg font-bold text-pink-900 text-center drop-shadow animate-bounce">Don't Consume this diet</span>
                    <button
                      className="mt-4 px-8 py-2 rounded-full bg-gradient-to-r from-pink-400 via-yellow-400 to-purple-400 text-white font-bold shadow-lg hover:scale-105 transition-transform animate-pulse text-lg border-2 border-white/30"
                      onClick={() => setShowDietaryModal(true)}
                      style={{boxShadow:'0 4px 16px 0 rgba(236,72,153,0.18)'}}
                      disabled={showDietaryModal}
                    >
                      See
                    </button>
                  </div>
                </div>
              )}
      {showDietaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadein">
          <div className="bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-200 rounded-3xl shadow-2xl p-8 border-4 border-pink-300 relative w-full max-w-2xl max-h-[70vh] overflow-y-auto flex flex-col items-center">
            <button
              className="absolute top-3 right-3 text-xl font-bold text-pink-500 hover:text-pink-700 z-10"
              onClick={() => setShowDietaryModal(false)}
            >✖</button>
            <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-600 bg-clip-text text-transparent drop-shadow animate-gradient-x">Restricted Dietary Categories</h2>
            <div className="w-full flex flex-wrap gap-6 justify-center">
              {(() => {
                const userId = user?.uid || user?.email || 'guest';
                function seededRandom(seed) {
                  let x = Math.sin(seed.length + seed.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) * 10000;
                  return x - Math.floor(x);
                }
                function shuffle(arr, seed) {
                  let a = arr.slice();
                  for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(seededRandom(seed + i) * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                  }
                  return a;
                }
                const shuffled = shuffle(restrictedDietary, userId);
                const toShow = shuffled.slice(0, 6);
                return toShow.map(cat => (
                  <div key={cat.name} className={`rounded-2xl shadow-xl p-6 flex flex-col items-center gap-2 min-w-[140px] max-w-[180px] w-[160px] bg-gradient-to-br ${cat.color} border-2 border-white/80`} style={{boxShadow:'0 4px 16px 0 rgba(236,72,153,0.18)'}}>
                    <span className="text-4xl">{cat.icon}</span>
                    <span className="text-xl font-bold text-white drop-shadow text-center" style={{WebkitTextStroke:'1px #f472b6'}}>{cat.name}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
            </div>
            <div style={{marginTop:70}}>
              <IngredientInput onSubmit={handleIngredientSubmit} />
            </div>
            {showFiltered && (
              <div style={{position:'fixed',top:0,left:0,width:'100vw',minHeight:'100vh',zIndex:2000,background:'transparent',padding:'0',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start'}}>
                <div style={{marginTop:220,marginBottom:32,width:'90%',maxWidth:1400,background:'linear-gradient(135deg,#fbbf24 0%,#f472b6 50%,#38bdf8 100%)',borderRadius:32,boxShadow:'0 6px 32px 0 rgba(0,0,0,0.10)',padding:'32px 0 24px 0',display:'flex',flexDirection:'column',alignItems:'center',animation:'fadein 1s',position:'relative',maxHeight:'60vh',overflowY:'auto'}}>
                  <button style={{position:'absolute',top:24,right:32,zIndex:2100,fontSize:32,fontWeight:'bold',color:'#7c3aed',background:'#fff',border:'2px solid #7c3aed',borderRadius:16,padding:'4px 18px',cursor:'pointer',boxShadow:'0 2px 12px 0 rgba(124,58,237,0.12)'}} onClick={()=>setShowFiltered(false)}>✖</button>
                  <style>{`@keyframes fadein { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                  <h2 style={{fontSize:36,fontWeight:'bold',margin:'0 0 32px 0',color:'#fff',letterSpacing:1,textAlign:'center',textShadow:'0 2px 12px #a78bfa'}}>
                    {filteredRecipes.length > 0 && filteredRecipes[0].id && typeof filteredRecipes[0].id === 'number' ? 'Generated Recipes' : 'Filtered Recipes'}
                  </h2>
                {filteredRecipes.length > 0 ? (
                  (() => {
                    const mappedRecipes = filteredRecipes.map(r => {
                      let name = r.Name || r.name || 'Untitled Recipe';
                      let image = '';
                      if (typeof r.Images === 'string' && r.Images.match(/https?:\/\/[^"\s]+/g)) {
                        image = r.Images.match(/https?:\/\/[^"\s]+/g)[0];
                      } else if (r.image) {
                        image = r.image;
                      } else {
                        image = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
                      }
                      let servings = r.RecipeServings || r.servings || 'N/A';
                      let cookingTime = (() => {
                        let prep = r.PrepTime;
                        if (!prep || prep === '' || prep === 'NA') prep = r.CookTime || '';
                        if (typeof prep === 'string') {
                          let h = 0, m = 0;
                          const hourMatch = prep.match(/PT(\d+)H/);
                          const minMatches = prep.match(/(\d+)M/g);
                          if (hourMatch) h = parseInt(hourMatch[1]);
                          if (minMatches) m = parseInt(minMatches[minMatches.length - 1]);
                          let mins = h * 60 + m;
                          if (mins === 0 && !isNaN(parseInt(prep))) mins = parseInt(prep);
                          return mins || 'N/A';
                        } else if (typeof prep === 'number') {
                          return prep;
                        }
                        return 'N/A';
                      })();
                      let difficulty = getDifficulty(r) || 'Unknown';
                      let dietary = Array.isArray(r.Dietary)
                        ? r.Dietary
                        : typeof r.Dietary === 'string' && r.Dietary.startsWith('c(')
                          ? r.Dietary.replace(/^c\(|\)$/g, '').split(/",\s*"/).map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean)
                          : [];
                      return {
                        ...r,
                        id: r.id || r.RecipeId || name || Math.random().toString(36).slice(2),
                        name,
                        image,
                        servings,
                        cookingTime,
                        difficulty,
                        dietary,
                      };
                    });
                    return (
                      <div style={{width:'100%',display:'flex',justifyContent:'center'}}>
                        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:32,maxWidth:1200,width:'100%',margin:'0 auto'}}>
                          {mappedRecipes.map(recipe => {
                            const isGenerated = recipe.id && typeof recipe.id === 'number';
                            let fallback = isGenerated ? {
                              Description: recipe.summary ? recipe.summary.replace(/<[^>]+>/g, '') : 'No description available.',
                              RecipeCategory: recipe.dishTypes && recipe.dishTypes.length > 0 ? recipe.dishTypes[0] : 'General',
                              PrepTime: recipe.readyInMinutes ? `PT${recipe.readyInMinutes}M` : 'N/A',
                              CookTime: recipe.readyInMinutes ? `PT${recipe.readyInMinutes}M` : 'N/A',
                              RecipeServings: recipe.servings || 'N/A',
                              RecipeIngredientParts: recipe.extendedIngredients ? recipe.extendedIngredients.map(i => i.originalName) : ['Not specified'],
                              RecipeIngredientQuantities: recipe.extendedIngredients ? recipe.extendedIngredients.map(i => i.amount + ' ' + i.unit) : ['N/A'],
                              RecipeInstructions: (() => {
                                if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && recipe.analyzedInstructions[0].steps.length > 0) {
                                  return recipe.analyzedInstructions[0].steps.map(s => s.step);
                                } else if (recipe.instructions && recipe.instructions.trim() !== '') {
                                  return [recipe.instructions];
                                } else {
                                  return ['Prepare all ingredients.', 'Follow standard cooking steps for this dish.', 'Enjoy your meal!'];
                                }
                              })(),
                              Calories: recipe.nutrition && recipe.nutrition.nutrients ? (recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || '250') : '250',
                              ProteinContent: recipe.nutrition && recipe.nutrition.nutrients ? (recipe.nutrition.nutrients.find(n => n.name === 'Protein')?.amount || '8') : '8',
                              CarbohydrateContent: recipe.nutrition && recipe.nutrition.nutrients ? (recipe.nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount || '30') : '30',
                              FatContent: recipe.nutrition && recipe.nutrition.nutrients ? (recipe.nutrition.nutrients.find(n => n.name === 'Fat')?.amount || '10') : '10',
                              reviews: [],
                              Name: recipe.name || recipe.title || 'Untitled Recipe',
                              Images: recipe.image || '',
                            } : {};
                            const recipeForDetail = { ...fallback, ...recipe };
                            return (
                              <div key={recipe.id} style={{background:'#fff',borderRadius:24,boxShadow:'0 2px 12px 0 rgba(0,0,0,0.08)',padding:24,display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer',position:'relative',minWidth:260,maxWidth:320}} onClick={()=>setSelectedRecipe(recipeForDetail)}>
                                <img src={recipe.image} alt={recipe.name} style={{width:'100%',height:140,objectFit:'cover',borderRadius:16,marginBottom:16,background:'#e5e7eb'}} />
                                <div style={{fontWeight:'bold',fontSize:22,color:'#7c3aed',marginBottom:8,textAlign:'center'}}>{recipe.name}</div>
                                <div style={{display:'flex',gap:8,marginBottom:10}}>
                                  {recipe.dietary.map((d,idx) => <span key={recipe.id+'-'+d+'-'+idx} style={{background:'#ede9fe',color:'#6d28d9',padding:'2px 10px',borderRadius:12,fontSize:12,fontWeight:600}}>{d}</span>)}
                                </div>
                                <div style={{display:'flex',justifyContent:'space-between',width:'100%',fontSize:16,color:'#6b7280',marginTop:6}}>
                                  <span>⏱️ {recipe.cookingTime} min</span>
                                  <span>⭐ {recipe.difficulty}</span>
                                  <span>🍽️ {recipe.servings} servings</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div style={{fontSize:20,fontWeight:'bold',color:'#fff',marginTop:32,textShadow:'0 2px 12px #a78bfa'}}>No recipes found for the selected filters.</div>
                )}
                {selectedRecipe && (
                  <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.45)',zIndex:2200,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <div style={{position:'relative',zIndex:2300}}>
                      <RecipeDetail
                        recipe={selectedRecipe}
                        onClose={() => setSelectedRecipe(null)}
                        handleAddFavorite={handleAddFavorite}
                        onRate={val => selectedRecipe && handleRateRecipe(selectedRecipe.RecipeId || selectedRecipe.id, val)}
                        userRating={selectedRecipe ? ratings[selectedRecipe.RecipeId || selectedRecipe.id] : 0}
                      />
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <footer className={`w-full py-6 px-6 flex flex-row items-center justify-between text-white/80 bg-gradient-to-r ${theme.footer} shadow-inner mt-8`}>
        <div className="flex flex-col items-start gap-2 min-w-[120px] ml-8">
          <span className="font-bold text-lg mb-1">Contact</span>
          <div className="flex items-center gap-4 text-2xl">
            <a href="https://github.com/MrPratsJi" target="_blank" rel="noopener noreferrer" title="GitHub" className="hover:scale-110 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#181717"/>
                <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" fill="#fff"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/pratyush-gupta24/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:scale-110 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#0A66C2"/>
                <path d="M17.5 17.5h-2.25v-3.25c0-.77-.01-1.76-1.07-1.76-1.07 0-1.23.84-1.23 1.7v3.31H10.5V10.5h2.16v.96h.03c.3-.57 1.03-1.17 2.12-1.17 2.27 0 2.69 1.5 2.69 3.44v3.77ZM8.25 9.54a1.31 1.31 0 1 1 0-2.62 1.31 1.31 0 0 1 0 2.62ZM9.38 17.5H7.12V10.5h2.26v7ZM18.5 4h-13A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20.5h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 18.5 4Z" fill="#fff"/>
              </svg>
            </a>
            <a href="tel:+917081997666" title="Phone" className="hover:scale-110 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#22c55e"/>
                <path d="M17.707 15.293l-2.414-2.414a1 1 0 0 0-1.414 0l-.793.793a8.001 8.001 0 0 1-3.293-3.293l.793-.793a1 1 0 0 0 0-1.414L8.707 6.293a1 1 0 0 0-1.414 0l-.586.586a2 2 0 0 0-.293 2.293c1.23 2.46 3.23 4.46 5.69 5.69a2 2 0 0 0 2.293-.293l.586-.586a1 1 0 0 0 0-1.414Z" fill="#fff"/>
              </svg>
            </a>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="font-semibold text-center">&copy; {new Date().getFullYear()} Smart Recipe Generator. All rights reserved.</span>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[120px] mr-8">
          <span className="font-bold text-lg mb-1">Explore More</span>
          <div className="flex flex-col items-end gap-1">
            <a href="#" className="hover:underline text-white/90">Docs</a>
            <a href="https://forms.gle/MRH6116hsytbg29P6" className="hover:underline text-white/90">FeedBack</a>
          </div>
        </div>
      </footer>
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadein">
          <RecipeDetail
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            handleAddFavorite={handleAddFavorite}
            onRate={val => selectedRecipe && handleRateRecipe(selectedRecipe.RecipeId || selectedRecipe.id, val)}
            userRating={selectedRecipe ? ratings[selectedRecipe.RecipeId || selectedRecipe.id] : 0}
          />
        </div>
      )}
  {showFullscreenPrompt && !fullscreenEnabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center border-4 border-white/60 animate-pop-in" style={{ minWidth: 340, minHeight: 220 }}>
            <span className="text-4xl mb-2 animate-bounce">🖥️</span>
            <h2 className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text mb-2 text-center">Enable Fullscreen Mode</h2>
            <p className="text-lg text-gray-800 font-semibold mb-4 text-center">For the best experience, please enable fullscreen before using the application.</p>
            <button
              className="px-8 py-2 rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transition-transform text-lg animate-pulse"
              onClick={async () => {
                if (document.documentElement.requestFullscreen) {
                  await document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                  await document.documentElement.webkitRequestFullscreen();
                }
                setFullscreenEnabled(true);
                setShowFullscreenPrompt(false);
                setShowAuth(true);
              }}
            >
              Go Fullscreen
            </button>
          </div>
        </div>
      )}
      {showAuth && !user && fullscreenEnabled && !showInitial && (
        <AuthModal
          onClose={() => {}}
          onAuthSuccess={() => {
            setShowAuth(false);
            setShowInitial(false);
          }}
        />
      )}
      </div>
  <style>{`
        @keyframes rotate {
          0% { transform: rotate(-8deg) scale(1); }
          50% { transform: rotate(8deg) scale(1.07); }
          100% { transform: rotate(-8deg) scale(1); }
        }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-18px) scale(1.06); }
          }
          .animate-float {
            animation: float 2.5s ease-in-out infinite;
          }
        @keyframes gradient {
          0%, 100% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 10s ease-in-out infinite;
        }
        @keyframes gradient-x {
          0% { background-position-x: 0%; }
          100% { background-position-x: 100%; }
        }
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 4s linear infinite alternate;
        }
        .animate-fadein {
          animation: fadein 0.7s;
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop-in {
          0% { transform: scale(0.8); opacity: 0; }
          80% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop-in {
          animation: pop-in 0.7s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 2.5s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.2s infinite;
        }
      `}</style>
    </div>
  );
}

export default App;
