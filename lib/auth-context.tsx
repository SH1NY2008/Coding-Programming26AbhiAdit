"use client";

import React, { createContext, useContext, useState } from "react";
import { 
  User, 
} from "firebase/auth";
// import { 
//   onAuthStateChanged, 
//   GoogleAuthProvider, 
//   signInWithPopup, 
//   signOut as firebaseSignOut 
// } from "firebase/auth";
// import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>({
    uid: "mock-user-id",
    email: "pardhu418@gmail.com",
    displayName: "Pardhu",
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: "",
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => "",
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    providerId: "firebase",
  } as unknown as User);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     setUser(user);
  //     setLoading(false);
  //   });

  //   return () => unsubscribe();
  // }, []);

  const signInWithGoogle = async () => {
    // const provider = new GoogleAuthProvider();
    // try {
    //   await signInWithPopup(auth, provider);
    // } catch (error) {
    //   console.error("Error signing in with Google", error);
    // }
    console.log("Mock sign in - already logged in as pardhu418@gmail.com");
  };

  const logout = async () => {
    // try {
    //   await firebaseSignOut(auth);
    // } catch (error) {
    //   console.error("Error signing out", error);
    // }
    console.log("Mock logout - staying logged in as pardhu418@gmail.com");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
