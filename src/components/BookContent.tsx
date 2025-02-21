"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { X } from "lucide-react"
import axios from "axios"

export default function BookContent({ contentUrl }: { contentUrl: string | null; }) {
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchContent = async () => {
    if (!contentUrl) return
    setIsLoading(true)
    try {
      // Simulate a delay
      const response = await axios.get(contentUrl)
      const text = await response.data
      setContent(text)
    } catch (error) {
      console.error("Failed to fetch content:", error)
      setContent("Failed to load content. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const closeBook = () => {
    setContent(null)
  }

  if (contentUrl === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {content === null ? (
        <Button onClick={fetchContent} disabled={isLoading}>
          {isLoading ? "Loading..." : "Load Content"}
        </Button>
      ) : (
        <Button onClick={closeBook} variant="outline" className="mb-4">
          <X className="mr-2 h-4 w-4" /> Close Book
        </Button>
      )}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : content ? (
        <div className="relative bg-muted p-6 rounded-lg shadow-md">
          <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground font-serif">{content}</p>
        </div>
      ) : null}
    </div>
  )
}
