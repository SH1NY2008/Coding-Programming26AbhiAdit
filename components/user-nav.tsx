'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'


import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useApp } from '@/lib/context'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'

export function UserNav() {
  const { user } = useApp()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSignOut = async () => {
    await signOut(auth)
  }

  if (!isClient) {
    return null
  }

  return user ? (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.photoURL || undefined} />
        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <Button onClick={handleSignOut} variant="outline">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log Out</span>
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild variant="default" size="sm">
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  )
}
