import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCkfDJIrkAj88Mv6_wyRk1cHrUFLxmxEsw",
  authDomain: "math-ai-5aa1d.firebaseapp.com",
  projectId: "math-ai-5aa1d",
  storageBucket: "math-ai-5aa1d.firebasestorage.app",
  messagingSenderId: "248458684782",
  appId: "1:248458684782:web:f94c8104490a8e7291f97f",
  measurementId: "G-H6Q2DT410Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Googleログイン処理
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // 初回ログイン時にユーザー情報をFirestoreに作成し、無料チケット(3枚)を付与する
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        tickets: 3, // 初回無料チケット
        createdAt: new Date()
      });
    }
    return user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

// ログアウト処理
export const logOut = async () => {
  await signOut(auth);
};
