"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Pin } from "@/types/pin"
import { Search, MapPin, Lock, Users, Globe } from "lucide-react"
import PinCard from "@/components/pin-card"

// Get visibility icon
const getVisibilityIcon = (visibility: string) => {
  switch (visibility) {
    case "private":
      return <Lock className="h-3 w-3" />
    case "friends":
      return <Users className="h-3 w-3" />
    case "public":
      return <Globe className="h-3 w-3" />
    default:
      return null
  }
}

interface PinListProps {
  pins: Pin[]
  visiblePins: Pin[]
  currentUserId: string
  onSelectPin: (pin: Pin) => void
  onClose: () => void
}

export default function PinList({ pins, visiblePins, currentUserId, onSelectPin, onClose }: PinListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "visible" | "my">("visible")

  // Filter pins based on search term
  const filteredPins = pins.filter(
    (pin) =>
      pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pin.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get user's pins
  const userPins = pins.filter((pin) => pin.userId === currentUserId)

  // Filter visible pins based on search term
  const filteredVisiblePins = visiblePins.filter(
    (pin) =>
      pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pin.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter user pins based on search term
  const filteredUserPins = userPins.filter(
    (pin) =>
      pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pin.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get the pins to display based on active tab
  const pinsToDisplay =
    activeTab === "all" ? filteredPins : activeTab === "visible" ? filteredVisiblePins : filteredUserPins

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col z-[9999]">
        <DialogHeader>
          <DialogTitle>Locations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visible">Visible ({filteredVisiblePins.length})</TabsTrigger>
              <TabsTrigger value="my">My Pins ({filteredUserPins.length})</TabsTrigger>
              <TabsTrigger value="all">All ({filteredPins.length})</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto pt-4">
              <TabsContent value="visible" className="h-full">
                <PinGrid pins={filteredVisiblePins} onSelectPin={onSelectPin} currentUserId={currentUserId} />
              </TabsContent>
              <TabsContent value="my" className="h-full">
                <PinGrid pins={filteredUserPins} onSelectPin={onSelectPin} currentUserId={currentUserId} />
              </TabsContent>
              <TabsContent value="all" className="h-full">
                <PinGrid pins={filteredPins} onSelectPin={onSelectPin} currentUserId={currentUserId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface PinGridProps {
  pins: Pin[]
  onSelectPin: (pin: Pin) => void
  currentUserId: string
}

function PinGrid({ pins, onSelectPin, currentUserId }: PinGridProps) {
  if (pins.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <h3 className="text-lg font-medium">No pins found</h3>
        <p className="text-muted-foreground">Try a different search term or add new pins to the map.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {pins.map((pin) => (
        <PinCard key={pin.id} pin={pin} currentUser={currentUserId} onSelectPin={onSelectPin} showActions={false} />
      ))}
    </div>
  )
}

