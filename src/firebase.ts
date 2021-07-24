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

export const getSignInWithGooglePopup = () => auth.signInWithPopup(provider) // pop ups can be blocked, better to use redirect

export const googleSignInWithRedirect = () => auth.signInWithRedirect(provider)

export const getGoogleSignInRedirectResult = () => auth.getRedirectResult()
