const fs = require('fs');
const Papa = require('papaparse');

const recipesCsv = fs.readFileSync('./src/data/recipes.csv', 'utf8');
const recipes = Papa.parse(recipesCsv, { header: true }).data;

const reviewsCsv = fs.readFileSync('./src/data/reviews.csv', 'utf8');
const reviews = Papa.parse(reviewsCsv, { header: true }).data;

const recipeIdField = 'RecipeId'; 
const reviewRecipeIdField = 'RecipeId';

const reviewsMap = {};
reviews.forEach(r => {
  const key = r[reviewRecipeIdField];
  if (!reviewsMap[key]) reviewsMap[key] = [];
  reviewsMap[key].push(r);
});


const merged = recipes.map(recipe => {
  const key = recipe[recipeIdField];
  return {
    ...recipe,
    reviews: reviewsMap[key] || []
  };
});

fs.writeFileSync('./src/data/merged_recipes_reviews.json', JSON.stringify(merged, null, 2));
console.log('Merged dataset saved as src/data/merged_recipes_reviews.json');