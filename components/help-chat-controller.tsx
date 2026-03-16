"use client"

import { usePathname } from "next/navigation"
import { HelpChat } from "./help-chat"

export function HelpChatController() {
  const pathname = usePathname()

  if (pathname === "/login" || pathname === "/signup") {
    return null
  }

  return <HelpChat pathname={pathname} />
}
