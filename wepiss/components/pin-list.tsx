"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Pin } from "@/types/pin"
import { Star, Search, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

interface PinListProps {
  pins: Pin[]
  visiblePins?: Pin[] // Optional array of pins currently visible on the map
  currentUserId: string
  onSelectPin: (pin: Pin) => void
  onClose: () => void
}

export default function PinList({ pins, visiblePins = pins, currentUserId, onSelectPin, onClose }: PinListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "mine" | "public" | "visible">("all")

  const filteredPins = pins.filter((pin) => {
    // Filter by search term
    const matchesSearch =
      pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pin.description.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by ownership/visibility
    const matchesFilter =
      filter === "all" ||
      (filter === "mine" && pin.userId === currentUserId) ||
      (filter === "public" && pin.isPublic) ||
      (filter === "visible" && visiblePins.some((vp) => vp.id === pin.id))

    return matchesSearch && matchesFilter
  })

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>Locations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
            <Button variant={filter === "mine" ? "default" : "outline"} size="sm" onClick={() => setFilter("mine")}>
              My Pins
            </Button>
            <Button variant={filter === "public" ? "default" : "outline"} size="sm" onClick={() => setFilter("public")}>
              Public
            </Button>
            <Button
              variant={filter === "visible" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("visible")}
            >
              Visible on Map
            </Button>
          </div>

          <div className="space-y-2">
            {filteredPins.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">No locations found</p>
            ) : (
              filteredPins.map((pin) => {
                const isVisible = visiblePins.some((vp) => vp.id === pin.id)

                return (
                  <Button
                    key={pin.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => onSelectPin(pin)}
                  >
                    <div className="flex items-start gap-2 text-left w-full">
                      <div className="shrink-0 mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={pin.userId === currentUserId ? "#10b981" : "#3b82f6"}
                          width="20"
                          height="20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="grid gap-0.5 flex-1">
                        <div className="font-medium flex items-center justify-between">
                          <span>{pin.title}</span>
                          {isVisible ? (
                            <Eye className="h-3 w-3 text-muted-foreground ml-1" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-muted-foreground ml-1" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{pin.description}</div>
                        <div className="flex mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < pin.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Button>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

