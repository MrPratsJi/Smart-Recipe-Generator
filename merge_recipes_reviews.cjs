const fs = require('fs');
const csv = require('csv-parser');

const recipesFile = './src/data/recipes.csv';
const reviewsFile = './src/data/reviews.csv';
const outputFile = './src/data/merged_recipes_reviews.json';

const recipeIdField = 'RecipeId';
const reviewRecipeIdField = 'RecipeId';

const reviewsMap = {};
fs.createReadStream(reviewsFile)
  .pipe(csv())
  .on('data', (row) => {
    const key = row[reviewRecipeIdField];
    if (!reviewsMap[key]) reviewsMap[key] = [];
    reviewsMap[key].push(row);
  })
  .on('end', () => {
    const merged = [];
    const readStream = fs.createReadStream(recipesFile).pipe(csv());
    const writeStream = fs.createWriteStream(outputFile);
    writeStream.write('[\n');
    let isFirst = true;
    readStream.on('data', (recipe) => {
      const key = recipe[recipeIdField];
      const mergedRecipe = {
        ...recipe,
        reviews: reviewsMap[key] || []
      };
      merged.push(mergedRecipe);
      if (!isFirst) writeStream.write(',\n');
      writeStream.write(JSON.stringify(mergedRecipe, null, 2));
      isFirst = false;
    });
    readStream.on('end', () => {
      writeStream.write('\n]\n');
      writeStream.end();
      const small = merged.slice(0, 500);
      fs.writeFileSync('./public/merged_recipes_reviews_small.json', JSON.stringify(small, null, 2));
      console.log('Merged dataset saved as src/data/merged_recipes_reviews.json');
      console.log('Small merged dataset saved as public/merged_recipes_reviews_small.json');
    });
  });