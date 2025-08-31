import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function fetchUserData(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  let data = userDoc.exists() ? userDoc.data() : {};
  const recipesSnap = await getDocs(collection(db, 'users', uid, 'myRecipes'));
  data.myRecipes = recipesSnap.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
  const reviewsSnap = await getDocs(collection(db, 'users', uid, 'reviews'));
  data.reviewed = reviewsSnap.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
  return data;
}


export async function saveUserRecipe(uid, recipe) {
  const recipesCol = collection(db, 'users', uid, 'myRecipes');
  await addDoc(recipesCol, recipe);
}


export async function addUserFavorite(uid, favorite) {
  const favCol = collection(db, 'users', uid, 'favorites');
  await addDoc(favCol, favorite);
}


export async function removeUserFavorite(uid, favDocId) {
  const favDoc = doc(db, 'users', uid, 'favorites', favDocId);
  await deleteDoc(favDoc);
}


export async function fetchUserFavorites(uid) {
  const favSnap = await getDocs(collection(db, 'users', uid, 'favorites'));
  return favSnap.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
}


export async function saveUserReview(uid, review) {
  const reviewsCol = collection(db, 'users', uid, 'reviews');
  await addDoc(reviewsCol, review);
}
