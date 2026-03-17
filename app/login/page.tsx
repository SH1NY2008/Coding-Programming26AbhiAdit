
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { GalleryVerticalEnd } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import ReCAPTCHA from "react-google-recaptcha";
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="grid h-screen w-full lg:grid-cols-2 overflow-hidden">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Business Boost
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs text-center">
            <h1 className="text-2xl font-bold">Login</h1>
            <p className="text-balance text-sm text-muted-foreground mt-2">
              Enter your email below to login to your account
            </p>
            <form onSubmit={handleLogin} className="mt-4 text-left">
              <div className="grid gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY!}
                  onChange={setRecaptchaToken}
                />
                <Button type="submit" className="w-full mt-2">
                  Login
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleGoogleSignIn}
                >
                  <FcGoogle className="mr-2 h-4 w-4" />
                  Sign in with Google
                </Button>
              </div>
            </form>
            <p className="text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="flex h-full w-full items-center justify-center bg-zinc-900">
          <div className="rounded-full border border-white/10 p-12">
            <GalleryVerticalEnd className="size-24 text-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
