"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Sparkles, BookOpen } from "lucide-react"
import { Book } from "@prisma/client"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { displayDate } from "@/lib/utils"

export default function GutenMind() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[] | null>(null);
  const [bookId, setBookId] = useState("")

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/api/books');
        setBooks(response.data);
      } catch { }
    }

    fetchBooks();
  }, []);

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
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Enter Book Id"
              className="pl-10 h-12 text-lg border-2 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              type="number"
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

        {/* Recent Interactions Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-semibold text-muted-foreground">
            <Clock className="w-6 h-6" />
            <h2>Recent Interactions</h2>
          </div>
          <div className="space-y-3">
            {!books ? [1, 2, 3, 4].map(i => (
              <Skeleton className="h-[90px] w-full" key={i} />
            )) : books.map((book: Book) => (
              <div
                key={book.gutenId}
                className="flex items-center justify-between p-4 border-2 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 hover:shadow-md cursor-pointer"
                onClick={() => router.push(`/analyze/${book.gutenId}`)}
              >
                <div className="space-y-1">
                  <Badge className="bg-purple-400 -mt-8">{book.gutenId}</Badge>
                  <h3 className="text-lg font-medium">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{displayDate(book.createdAt)}</p>
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
