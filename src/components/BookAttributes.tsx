"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookIcon, Globe, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Book } from "@prisma/client"
import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface BookAttributesProps {
  book: Book | null
}

export function BookAttributes({ book }: BookAttributesProps) {
  const [formattedAttributes, setFormattedAttributes] = useState<{ key: string; value: string }[]>([])

  useEffect(() => {
    if (book && book.attributes && Array.isArray(book.attributes)) {
      const validatedAttributes = book.attributes.filter(
        (attr) =>
          typeof attr === "object" &&
          attr !== null &&
          "key" in attr &&
          "value" in attr &&
          typeof attr.key === "string" &&
          typeof attr.value === "string",
      ) as { key: string; value: string }[]
      setFormattedAttributes(validatedAttributes)
    } else if (book && book.attributes && Object.keys(book.attributes).length > 0) {
      const validatedAttributes = Object.entries(book.attributes).map(([key, value]) => ({ key, value })) as {
        key: string
        value: string
      }[]
      setFormattedAttributes(validatedAttributes)
    } else {
      setFormattedAttributes([])
    }
  }, [book])

  return (
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
            <div className="text-sm text-muted-foreground">Author</div>
            {!book ? (
              <Skeleton className="w-24 h-6" />
            ) : (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-500" />
                {book.author}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Language</div>
            {!book ? (
              <Skeleton className="w-24 h-6" />
            ) : (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                {book.language}
              </div>
            )}
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="extra-attributes">
            <AccordionTrigger>Extra Attributes</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4">
                {formattedAttributes.map((attribute) => (
                  <div className="space-y-1" key={attribute.key}>
                    <div className="text-sm text-muted-foreground">{attribute.key}</div>
                    {!book
                      ? <Skeleton className="w-24 h-6" />
                      : attribute.value}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
