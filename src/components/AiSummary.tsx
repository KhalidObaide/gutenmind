"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, Sparkles } from "lucide-react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import axios from "axios"
import { Skeleton } from "./ui/skeleton"

interface SummarizeButtonProps {
  gutenId: number;
}

export default function SummarizeButton({ gutenId }: SummarizeButtonProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReceiving, setIsReceiving] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [summary, setSummary] = useState<string[]>([])
  const progressAnimation = useAnimation()

  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/ai/${gutenId}`);
        if (response.status !== 200) return;

        if (response.data.status === "record_found") {
          setSummary(response.data.bulletpoints)
        }
      } catch (e) {
        console.log(e)
      }
      finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [gutenId])

  useEffect(() => {
    if (!isReceiving) return;
    ws.current = new WebSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}/gutenId=${gutenId}`)

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setProgress(data.progress);
      if (data.progress >= 100) {
        setSummary(data.bulletpoints);
        setIsReceiving(false)
        if (ws.current) ws.current.close()
      }
    }

    ws.current.onclose = () => {
      console.log("WebSocket connection closed")
      setIsReceiving(false);
    }

  }, [isReceiving, gutenId]);

  useEffect(() => {
    progressAnimation.start({
      strokeDashoffset: 364 - (progress / 100) * 364,
      transition: { duration: 0.5, ease: "easeInOut" },
    })
  }, [progress, progressAnimation])

  const handleClick = () => {
    setIsReceiving(true)
    setProgress(0)
    setSummary([])
  }

  if (isLoading || isNaN(gutenId)) return (
    <Skeleton className="h-full w-full" />
  )

  return (
    <div className="flex flex-col items-center justify-center">
      {!isReceiving && summary.length === 0 && (
        <Button
          onClick={handleClick}
          className="relative overflow-hidden bg-purple-600 text-white font-bold py-3 px-6 rounded-md shadow-lg transform transition-all duration-500 ease-in-out hover:bg-purple-700 active:scale-95 flex items-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>Summarize Now</span>
        </Button>
      )}

      <AnimatePresence>
        {isReceiving && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-8 relative w-32 h-32"
          >
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-gray-300"
                strokeWidth="5"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="64"
                cy="64"
              />
              <motion.circle
                className="text-purple-600"
                strokeWidth="5"
                strokeDasharray={364}
                strokeDashoffset={364}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="58"
                cx="64"
                cy="64"
                animate={progressAnimation}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-purple-600 font-bold text-xl">
              {progress}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {summary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.5 }}
            className="bg-white w-full"
          >
            <ul className="space-y-3">
              {summary.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start"
                >
                  <Bookmark className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{point}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
