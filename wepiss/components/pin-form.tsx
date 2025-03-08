"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Pin } from "@/types/pin"
import { Star } from "lucide-react"

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
          <div className="flex items-center gap-2">
            <Label htmlFor="isPublic">Public</Label>
            <Switch
              id="isPublic"
              checked={pin.isPublic}
              onCheckedChange={(checked) => setPin({ ...pin, isPublic: checked })}
            />
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

