"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AiSummary from "@/components/AiSummary"
import {
  ArrowLeft,
  Calendar,
  Globe,
  Languages,
  Timer,
  BrainCircuit,
  Book as BookIcon
} from "lucide-react"
import { Book } from "@prisma/client";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyzePage() {
  const router = useRouter()
  const { id } = useParams()
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchBook = async () => {
      try {
        const response = await axios.get(`/api/analyze/${id}`);
        setBook(response.data);
      } catch (error) {
        const defaultErrorMessage = "An unexpected error occurred. Please try again later";
        if (axios.isAxiosError(error)) {
          setError(error.response?.data.message || defaultErrorMessage);
        } else {
          setError(defaultErrorMessage);
        }
      }
    }

    fetchBook();
  }, [id]);


  // This would come from your API/database
  const bookData = {
    title: "The Art of War",
    author: "Sun Tzu",
    year: "5th century BCE",
    language: "Chinese (Original)",
    translations: 103,
    readingTime: "4 hours",
    rating: 4.8,
    themes: ["Strategy", "Leadership", "Warfare", "Philosophy", "Politics"],
    analysis: {
      summary:
        "A fundamental treatise on military strategy and leadership that transcends its original context to offer insights applicable to modern business, politics, and personal development.",
      keyInsights: [
        "Supreme excellence consists of breaking the enemy's resistance without fighting",
        "All warfare is based on deception",
        "The supreme art of war is to subdue the enemy without fighting",
        "Know yourself and know your enemy, and you will not be imperiled in a hundred battles",
      ],
      writingStyle: "Concise, aphoristic prose with clear, practical examples and metaphorical language.",
      impact:
        "Profound influence on military strategy, business management, and leadership philosophy across cultures and centuries.",
    },
    excerpt: `The art of war is of vital importance to the State. It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected.

The art of war, then, is governed by five constant factors, to be taken into account in one's deliberations, when seeking to determine the conditions obtaining in the field. These are:
(1) The Moral Law
(2) Heaven
(3) Earth
(4) The Commander
(5) Method and discipline`,
  }

  if (error) {
    return (
      <div>{error}</div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="hover:bg-purple-100" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>

        {!book ? <Skeleton className="h-16 w-[500px]" /> :
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            {book?.title}
          </h1>
        }
        {!book ? <Skeleton className="h-8 w-[250px]" /> :
          <p className="text-xl text-muted-foreground">by {book.author}</p>
        }

        <div className="grid md:grid-cols-2 gap-6">
          {/* Attributes Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookIcon className="h-5 w-5 text-purple-500" />
                Attributes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Published</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    {bookData.year}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Reading Time</div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-purple-500" />
                    {bookData.readingTime}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Language</div>
                  {!book ? <Skeleton className="w-16 h-8" /> : (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-purple-500" />
                      {book.language}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Translations</div>
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-purple-500" />
                    {bookData.translations}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Themes</div>
                <div className="flex flex-wrap gap-2">
                  {bookData.themes.map((theme) => (
                    <Badge
                      key={theme}
                      variant="secondary"
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700"
                    >
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-500" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {book && <AiSummary gutenId={Number(id)} />}
            </CardContent>
          </Card>
        </div>

        {/* Book Text Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookIcon className="h-5 w-5 text-purple-500" />
              Book Excerpt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-purple max-w-none">
              <p className="whitespace-pre-line text-lg leading-relaxed">{bookData.excerpt}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
