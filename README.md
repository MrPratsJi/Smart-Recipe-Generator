# 🍳 Smart Recipe Generator

A modern, mobile-friendly web application that helps users discover personalized recipes based on the ingredients they have on hand, their dietary preferences, and nutritional needs. By leveraging AI-powered image recognition and comprehensive recipe datasets, the app allows users to input ingredients via text or photo, filter recipes by category, nutrition, and cook time, and save or review their favorites. The responsive design ensures a seamless experience on any device, with intuitive modals and sidebars for easy navigation.

## ✨ Features

- Ingredient input (text or image recognition)
- Dietary preferences & restrictions (vegetarian, vegan, gluten-free, etc.)
- Advanced recipe matching
- Trending and suggested recipes
- Add and view your own recipes
- Filter the recipes based on Difficulty, Cooking Time, Serving Size  
- Recipe details: nutrition, servings, substitutions
- Save favorites, review, and rate recipes
- Mobile-responsive sidebar and modals
- Error handling and loading states

## 🚀 Approach

The app combines user-friendly UI with robust filtering and AI-powered ingredient recognition. Users can enter ingredients or upload a photo, and the Google - Vision API extracts ingredient names. Recipes are filtered by difficulty, cooking time, and serving size. Responsive design ensures a smooth experience on all devices, with modals and sidebars adapting to screen size. The workflow emphasizes clean code, modularity, and accessibility, using Tailwind for styling and React for state management. All pop-ups and modals are context-aware, and the app is production-ready.

## 📌 Tech Stack

- React, Vite, Tailwind CSS
- Firebase Auth & Firestore
- Google - Vision API (ingredient recognition)
- Spoonacular API (recipe generation)
- Express

## 🛠️ Workflow

1. User logs in (Firebase Auth)
2. Inputs ingredients (text/image)
3. Image: Google - Vision API returns ingredient labels
4. Recipes filtered by Difficulty, Cooking Time and Serving Size
5. User can view, add, save, review, and rate recipes
6. See Trending and Suggested Recipes 
7. Dietary Restriction based on the user's data
7. All UI adapts responsively (modals, sidebar, dropdown)

## 📢 APIs & Datasets

- **Google - Vision API**: Extracts ingredients from food images (see `src/services/ingredientRecognition.js`)
- **Spoonacular API**: Provides recipe, nutrition, and ingredient data (see `src/services/spoonacular.js`)
- **Firebase**: User authentication and favorites/reviews storage
- **Public Dataset**: Dataset named **Food.com** from **Kaggle**


## 📢 Deployed Application Link

-


