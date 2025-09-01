


import { GENERIC_LABELS } from './ingredientLabels';
const SPOONACULAR_API_KEY = '14be5d19fed94443bce61dcba2cc35dc';

export async function recognizeIngredientsFromImage(imageFile) {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://smart-recipe-generator-back.vercel.app";
  const response = await fetch(`${backendUrl}/api/recognize-ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64 }),
  });

  if (!response.ok) throw new Error("Ingredient recognition failed");
  const data = await response.json();
  const isRealIngredient = (name) => {
    if (!name || typeof name !== 'string') return false;
    const lower = name.trim().toLowerCase();
    return lower.length > 1 && !GENERIC_LABELS.includes(lower);
  };
  return (data.ingredients || []).filter(isRealIngredient);
}
