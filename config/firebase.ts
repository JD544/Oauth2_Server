import dotenv from 'dotenv';

/**
 * Only for Firebase as a backend
 */

// Import the functions you need from the SDKs you need
import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import { authentication_backend } from '../database/actions';
import { getAuth, Auth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: dotenv.config().parsed?.FIREBASE_API_KEY,
  authDomain: dotenv.config().parsed?.FIREBASE_AUTH_DOMAIN,
  projectId: dotenv.config().parsed?.FIREBASE_PROJECT_ID,
  storageBucket: dotenv.config().parsed?.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: dotenv.config().parsed?.FIREBASE_MESSAGING_SENDER_ID,
  appId: dotenv.config().parsed?.FIREBASE_APP_ID
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

/**
 * Retrieves the Firebase app instance.
 *
 * @return {FirebaseApp} The Firebase app instance if the authentication backend is set to "firebase",
 * otherwise an error indicating that the Firebase backend is not configured.
 */
const Get_App = () => {
    if (authentication_backend !== "firebase")
        return new Error("Firebase backend not configured, please configure it in the .env file");

    if (!app)
        return new Error("You must initialize Firebase before calling this function");

    return app as FirebaseApp;
}

/**
 * Retrieves the authentication object for the Firebase app instance.
 *
 * @param {FirebaseApp} App - The Firebase app instance.
 * @return {Auth} the authentication object for the Firebase app instance.
 */
const Get_Auth = (App: FirebaseApp) => {
    if (!App)
        return new Error("You must initialize Firebase before calling this function");

    const auth = getAuth(App);

    if (!auth)
        return new Error("Firebase backend not configured, please configure it in the .env file");

    return auth as Auth;
}

export { Get_App, Get_Auth }