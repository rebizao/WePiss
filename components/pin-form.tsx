"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Pin } from "@/types/pin"
import { Star, Lock, Users, Globe } from "lucide-react"

interface PinFormProps {
  onSubmit: (pin: Omit<Pin, "id" | "userId" | "userName" | "createdAt">) => void
  onCancel: () => void
}

export function PinForm({ onSubmit, onCancel }: PinFormProps) {
  const [pin, setPin] = useState<Omit<Pin, "id" | "userId" | "userName" | "createdAt">>({
    latitude: 0,
    longitude: 0,
    title: "",
    description: "",
    rating: 0,
    comments: [],
    media: [],
    isPublic: true,
    visibility: "public",
  })

  const handleSubmit = () => {
    if (!pin.title) return
    onSubmit(pin)
  }

  const handleRatingChange = (rating: number) => {
    setPin({
      ...pin,
      rating,
    })
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[425px] z-[9999]">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Location name"
              value={pin.title}
              onChange={(e) => setPin({ ...pin, title: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this location"
              value={pin.description}
              onChange={(e) => setPin({ ...pin, description: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Rating</Label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button key={rating} variant="ghost" size="icon" onClick={() => handleRatingChange(rating)}>
                  <Star
                    className={`h-5 w-5 ${rating <= pin.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                  />
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Visibility</Label>
            <RadioGroup
              value={pin.visibility}
              onValueChange={(value) =>
                setPin({ ...pin, visibility: value as "private" | "friends" | "public", isPublic: value === "public" })
              }
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center cursor-pointer">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>Private (only you)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="friends" id="friends" />
                <Label htmlFor="friends" className="flex items-center cursor-pointer">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Friends only</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex items-center cursor-pointer">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>Public (everyone)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

