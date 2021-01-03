import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

const config = {
  apiKey: 'AIzaSyBb4FG2ieLWK_tAnOrYggqHFuyloqPumq0',
  authDomain: 'project-grookey.firebaseapp.com',
  projectId: 'project-grookey',
  storageBucket: 'project-grookey.appspot.com',
  messagingSenderId: '1019022204293',
  appId: '1:1019022204293:web:e5640211111de2314478ec',
  measurementId: 'G-TTL51XSGQT',
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

// Check if user exists if not create a user
export const createUserProfileDocument = async (
  userAuth: any,
  additionalData?: any
) => {
  if (!userAuth) return
  await firestore
    .collection('users')
    .doc(userAuth.uid)
    .set({
      googleId: userAuth.uid,
      displayName: userAuth.displayName,
      email: userAuth.email,
      teams: [],
      createdAt: Date.now(),
      ...additionalData,
    })
  const userDoc = await firestore.collection('users').doc(userAuth.uid).get()
  return userDoc.data()
}

export const signInWithGoogle = () => auth.signInWithPopup(provider)
