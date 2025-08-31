
const API_KEY = '14be5d19fed94443bce61dcba2cc35dc'; 
const BASE_URL = 'https://api.spoonacular.com/recipes/complexSearch';

/**
 * @param {string[]} ingredients 
 * @param {string[]} dietary 
 * @param {number} [number=12]
 * @returns {Promise<Array>}
 */
export async function fetchRecipesByIngredientsAndDiet(ingredients, dietary, number = 12) {
  const params = new URLSearchParams({
    apiKey: API_KEY,
    includeIngredients: ingredients.join(','),
    diet: dietary.join(','),
    number: number.toString(),
    addRecipeInformation: 'true',
    fillIngredients: 'true',
  });
  const url = `${BASE_URL}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch recipes from Spoonacular');
  const data = await response.json();
  return data.results || [];
}
