/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

// This is a stub implementation to allow the app to load without Firebase
// It prevents the "Component auth has not been registered yet" error

// Create empty objects with no-op methods that won't crash
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback) => {
    console.log('Stub Firebase: onAuthStateChanged called');
    // Return a no-op unsubscribe function
    return () => {};
  },
  signOut: async () => {
    console.log('Stub Firebase: signOut called');
    return Promise.resolve();
  }
};

const db = {
  collection: () => ({
    doc: () => ({
      get: async () => Promise.resolve({ exists: false, data: () => null }),
      set: async () => Promise.resolve()
    }),
    where: () => ({
      get: async () => Promise.resolve({ empty: true, docs: [] })
    })
  })
};

const app = {};
const functions = {};
const storage = {};

// No-op getter functions
const getAuth = () => auth;
const getFirestore = () => db;
const getFunctions = () => functions;
const getStorage = () => storage;

// Export stubs for use throughout the app
export { app, auth, db, functions, storage };

// Also export the getters
export {
  getAuth,
  getFirestore,
  getFunctions,
  getStorage
}; 