import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
}

const app = !firebase.apps.length
  ? firebase.initializeApp(config)
  : firebase.app()

export const auth = firebase.auth(app)
export const firestore = firebase.firestore(app)

const provider = new firebase.auth.GoogleAuthProvider()
provider.setCustomParameters({
  promt: 'select_account',
})

export const getSignInWithGooglePopup = () => auth.signInWithPopup(provider)
