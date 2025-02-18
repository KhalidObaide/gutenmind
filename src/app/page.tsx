"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Play, Clock, Sparkles, BookOpen } from "lucide-react"

export default function GutenMind() {
  const router = useRouter()
  const [bookId, setBookId] = useState("")

  const handleAnalyze = () => {
    if (bookId) {
      router.push(`/analyze/${bookId}`)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            GutenMind
          </h1>
          <p className="text-lg text-muted-foreground italic">Unlock the wisdom of classics, one page at a time</p>
        </div>

        {/* Search Section */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Enter Book Id"
              className="pl-10 h-12 text-lg border-2 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
            />
          </div>
          <Button
            className="h-12 px-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
            onClick={handleAnalyze}
          >
            <Sparkles className="w-5 h-5" />
            Analyze Now
          </Button>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Previous Interactions Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-semibold text-muted-foreground">
            <Clock className="w-6 h-6" />
            <h2>Previous Interactions</h2>
          </div>
          <div className="space-y-3">
            {[
              { id: "1", title: "Art of War - Sun Tzu", date: "19 Feb 2025" },
              { id: "2", title: "Pride and Prejudice - Jane Austen", date: "15 Jan 2025" },
              { id: "3", title: "The Republic - Plato", date: "10 Dec 2024" },
              { id: "4", title: "To Kill a Mockingbird - Harper Lee", date: "5 Nov 2024" },
              { id: "5", title: "1984 - George Orwell", date: "22 Oct 2024" },
              { id: "6", title: "The Great Gatsby - F. Scott Fitzgerald", date: "17 Sep 2024" },
              { id: "7", title: "Moby-Dick - Herman Melville", date: "3 Aug 2024" },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border-2 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 hover:shadow-md cursor-pointer"
                onClick={() => router.push(`/analyze/${item.id}`)}
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 rounded-full hover:bg-purple-100 hover:text-purple-600 transition-colors duration-300"
                >
                  <Play className="h-5 w-5" />
                  <span className="sr-only">Play analysis</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
