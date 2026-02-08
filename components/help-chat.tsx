"use client"

import React from "react"

/**
 * Help Chat Component
 * 
 * Floating help button with FAQ chatbot providing contextual
 * assistance based on user questions.
 * 
 * @module HelpChat
 */

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  MessageCircleQuestion,
  X,
  Send,
  Bot,
  User,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

/**
 * FAQ database with questions and answers
 */
const faqDatabase = [
  {
    keywords: ["search", "find", "look", "browse", "discover"],
    question: "How do I search for businesses?",
    answer:
      "Use the search bar on the Browse Businesses page. You can search by business name, category, or keywords. Use the filters on the left to narrow down by category, price level, rating, and more.",
  },
  {
    keywords: ["review", "rate", "rating", "star", "feedback"],
    question: "How do I leave a review?",
    answer:
      "Visit any business page and scroll down to the reviews section. Click 'Write a Review', select your star rating (1-5 stars with half-star precision), write your feedback (up to 500 characters), and submit. Note: You can leave up to 5 reviews per hour.",
  },
  {
    keywords: ["bookmark", "save", "favorite", "folder"],
    question: "How do I bookmark a business?",
    answer:
      "Click the bookmark icon on any business card or business detail page. You can organize bookmarks into custom folders and add personal notes from the 'My Favorites' page.",
  },
  {
    keywords: ["deal", "discount", "coupon", "promo", "code", "offer"],
    question: "How do I find and redeem deals?",
    answer:
      "Visit the Deals page to see all active promotions. Each deal shows the discount amount, expiration countdown, and terms. Click 'Get Code' to reveal the promo code, then use it at the business.",
  },
  {
    keywords: ["report", "export", "data", "csv", "json", "analytics"],
    question: "How do I generate reports?",
    answer:
      "Go to the Reports page to view analytics and generate custom reports. You can filter by date range, category, and rating. Export reports in CSV or JSON format using the export buttons.",
  },
  {
    keywords: ["account", "login", "sign", "register"],
    question: "Do I need an account?",
    answer:
      "No account is required! Your bookmarks, settings, and preferences are saved locally on your device. This keeps things simple and protects your privacy.",
  },
  {
    keywords: ["contrast", "accessibility", "dark", "mode", "vision"],
    question: "How do I enable high contrast mode?",
    answer:
      "Click the contrast icon in the top navigation bar. High contrast mode increases visual contrast for better accessibility. Your preference is saved automatically.",
  },
  {
    keywords: ["category", "filter", "type", "sort"],
    question: "What categories are available?",
    answer:
      "We have 5 main categories: Food & Dining (restaurants, cafes, bakeries), Retail (clothing, electronics, books), Services (healthcare, automotive, spa), Entertainment (fitness, music, recreation), and Education (tutoring, lessons).",
  },
]

/**
 * Suggested questions for quick access
 */
const suggestedQuestions = [
  "How do I search for businesses?",
  "How do I leave a review?",
  "How do I bookmark a business?",
  "How do I find deals?",
]

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

/**
 * Help Chat Floating Component
 * Provides FAQ-based assistance with contextual help
 */
export function HelpChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  if (pathname === "/login" || pathname === "/signup") {
    return null
  }

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        text: `Hi! I'm here to help you navigate Byte-Sized Business Boost. Ask me anything about searching businesses, leaving reviews, bookmarking favorites, finding deals, or generating reports.`,
        isBot: true,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  /**
   * Finds the best matching FAQ answer for a query
   */
  const findAnswer = (query: string): string => {
    const queryLower = query.toLowerCase()

    // Check each FAQ for keyword matches
    let bestMatch = null
    let maxMatches = 0

    for (const faq of faqDatabase) {
      const matches = faq.keywords.filter((keyword) =>
        queryLower.includes(keyword)
      ).length

      if (matches > maxMatches) {
        maxMatches = matches
        bestMatch = faq
      }
    }

    if (bestMatch && maxMatches > 0) {
      return bestMatch.answer
    }

    // Contextual fallback based on current page
    if (pathname.includes("browse")) {
      return "I see you're on the Browse page. You can search for businesses using the search bar, or use the filters on the left to narrow your results by category, rating, or price level. Is there something specific you're looking for?"
    } else if (pathname.includes("bookmarks")) {
      return "You're viewing your saved favorites. From here you can organize businesses into folders, add notes, or remove bookmarks. Click on any business to view its details."
    } else if (pathname.includes("deals")) {
      return "Welcome to the Deals page! Here you can find all active promotions from local businesses. Each deal shows the discount, expiration time, and terms. Click 'Get Code' to reveal the promo code."
    } else if (pathname.includes("reports")) {
      return "The Reports page shows analytics and lets you generate custom reports. Use the filters to customize your view and the export buttons to download data in CSV or JSON format."
    }

    return "I'm not sure I understand that question. Try asking about: searching businesses, leaving reviews, bookmarking favorites, finding deals, or generating reports. You can also click on one of the suggested questions below."
  }

  /**
   * Handles sending a message
   */
  const handleSend = (text: string = input.trim()) => {
    if (!text) return

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate typing delay then respond
    setTimeout(() => {
      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: findAnswer(text),
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "hover:scale-105 transition-transform",
          isOpen && "bg-muted text-muted-foreground hover:bg-muted"
        )}
        size="icon"
        aria-label={isOpen ? "Close help chat" : "Open help chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircleQuestion className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-80 sm:w-96 bg-background border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{ maxHeight: "min(500px, calc(100vh - 150px))" }}
          role="dialog"
          aria-label="Help chat"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b bg-muted/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Help Assistant</h2>
              <p className="text-xs text-muted-foreground">
                Ask me anything about BSBB
              </p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.isBot ? "justify-start" : "justify-end"
                  )}
                >
                  {message.isBot && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.isBot
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.text}
                  </div>
                  {!message.isBot && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Quick questions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t bg-background">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="flex-1"
                aria-label="Type your question"
              />
              <Button
                onClick={() => handleSend()}
                size="icon"
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
