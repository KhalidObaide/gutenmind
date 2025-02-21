"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AiSummary from "@/components/AiSummary"
import { ArrowLeft, BrainCircuit, BookIcon, ArrowUp } from "lucide-react"
import type { Book } from "@prisma/client"
import axios from "axios"
import { Skeleton } from "@/components/ui/skeleton"
import { BookAttributes } from "@/components/BookAttributes"
import BookContent from "@/components/BookContent"

export default function AnalyzePage() {
  const router = useRouter()
  const { id } = useParams()
  const [book, setBook] = useState<Book | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchBook = async () => {
      try {
        const response = await axios.get(`/api/analyze/${id}`)
        setBook(response.data)
      } catch (error) {
        const defaultErrorMessage = "An unexpected error occurred. Please try again later"
        if (axios.isAxiosError(error)) {
          setError(error.response?.data.message || defaultErrorMessage)
        } else {
          setError(defaultErrorMessage)
        }
      }
    }

    fetchBook()
  }, [id])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="hover:bg-purple-100" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>

        {!book ? (
          <Skeleton className="h-16 w-[500px]" />
        ) : (
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            {book?.title}
          </h1>
        )}
        {!book ? (
          <Skeleton className="h-8 w-[250px]" />
        ) : (
          <p className="text-xl text-muted-foreground">by {book.author}</p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <BookAttributes book={book} />

          {/* Analysis Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-500" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">{book && <AiSummary gutenId={Number(id)} />}</CardContent>
          </Card>
        </div>

        {/* Book Text Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookIcon className="h-5 w-5 text-purple-500" />
              Book Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-purple max-w-none">
              <BookContent contentUrl={book?.textUrl || null} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-8 right-8 rounded-full shadow-md hover:shadow-lg transition-all duration-300 bg-purple-500 hover:bg-purple-600 text-white"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
