"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { Button } from "@/components/ui/button"
import { PinDetail } from "@/components/pin-detail"
import { PinForm } from "@/components/pin-form"
import type { Pin } from "@/types/pin"
import { useToast } from "@/hooks/use-toast"
import { Plus, List, X, Eye } from "lucide-react"
import PinList from "@/components/pin-list"
import L from "leaflet"

// Mock user data - in a real app, this would come from authentication
const currentUser = {
  id: "user1",
  name: "Demo User",
}

// Update the initial pins data to be located in Manchester Fallowfield
const initialPins: Pin[] = [
  {
    id: "1",
    latitude: 53.4394,
    longitude: -2.2188,
    title: "Fallowfield Campus",
    description: "University of Manchester student accommodation",
    rating: 4,
    comments: [
      { id: "c1", userId: "user2", userName: "Jane", text: "Great student area!", createdAt: new Date().toISOString() },
    ],
    media: ["/placeholder.svg?height=200&width=300"],
    userId: "user2",
    userName: "Jane",
    isPublic: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    latitude: 53.4412,
    longitude: -2.2149,
    title: "Platt Fields Park",
    description: "Large public park with a lake, gardens and sports facilities",
    rating: 5,
    comments: [],
    media: ["/placeholder.svg?height=200&width=300"],
    userId: "user1",
    userName: "Demo User",
    isPublic: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    latitude: 53.4367,
    longitude: -2.225,
    title: "Fallowfield Retail Park",
    description: "Shopping center with various stores and restaurants",
    rating: 3,
    comments: [],
    media: ["/placeholder.svg?height=200&width=300"],
    userId: "user1",
    userName: "Demo User",
    isPublic: true,
    createdAt: new Date().toISOString(),
  },
]

// Custom marker icons
const createCustomIcon = (color = "#3b82f6", isUserOwned = false) => {
  return L.divIcon({
    className: "custom-pin-icon",
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="36" height="36" style="${isUserOwned ? "filter: drop-shadow(0 0 3px rgba(0,0,0,0.5));" : ""}">
      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

// Create a user location marker icon
const userLocationIcon = L.divIcon({
  className: "user-location-icon",
  html: `<div class="relative">
    <div class="absolute inset-0 bg-blue-500 rounded-full opacity-25 animate-ping"></div>
    <div class="relative bg-blue-500 rounded-full h-6 w-6 border-2 border-white"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

// Component to fit map bounds to all pins ONLY on initial load
function InitialMapBoundsFitter({ pins }: { pins: Pin[] }) {
  const map = useMap()
  const hasInitiallyFitted = useRef(false)

  useEffect(() => {
    // Only fit bounds on initial load, not when pins change
    if (!hasInitiallyFitted.current && pins.length > 0) {
      // Create a bounds object
      const bounds = L.latLngBounds(pins.map((pin) => [pin.latitude, pin.longitude]))

      // Add padding to the bounds
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
      })

      hasInitiallyFitted.current = true
    }
  }, [map, pins])

  return null
}

// Replace the MapViewTracker component with this fixed version
function MapViewTracker({ onViewportChange }: { onViewportChange: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onViewportChange(map.getBounds())
    },
    zoomend: () => {
      onViewportChange(map.getBounds())
    },
  })

  // Use a ref to track if this is the first render
  const initializedRef = useRef(false)

  // Only update viewport on initial load, not on every render
  useEffect(() => {
    if (!initializedRef.current) {
      onViewportChange(map.getBounds())
      initializedRef.current = true
    }
  }, [map, onViewportChange])

  return null
}

// Component to handle user location
function UserLocationMarker({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const map = useMap()

  const locateUser = () => {
    map.locate({ setView: true, maxZoom: 16 })
  }

  useMapEvents({
    locationfound: (e) => {
      setPosition([e.latlng.lat, e.latlng.lng])
      onLocationFound(e.latlng.lat, e.latlng.lng)
    },
  })

  useEffect(() => {
    // Add locate control to the map
    const locateControl = L.control({ position: "bottomleft" })

    locateControl.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-bar leaflet-control")
      div.innerHTML = `<button class="bg-white p-2 rounded-md shadow-md hover:bg-gray-100" title="Locate me">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="text-blue-500">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>`

      div.onclick = (e) => {
        e.stopPropagation()
        locateUser()
      }

      return div
    }

    locateControl.addTo(map)

    return () => {
      map.removeControl(locateControl)
    }
  }, [map])

  return position === null ? null : (
    <Marker position={position} icon={userLocationIcon}>
      <Popup>
        <div className="text-sm">
          <p>You are here</p>
        </div>
      </Popup>
    </Marker>
  )
}

function MapEvents({
  onMapClick,
  isAddingPin,
}: { onMapClick: (lat: number, lng: number) => void; isAddingPin: boolean }) {
  const map = useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })

  // Add a tooltip to the map when in adding mode
  useEffect(() => {
    if (isAddingPin) {
      const container = document.createElement("div")
      container.className = "leaflet-tooltip-adding-pin"
      container.innerHTML =
        '<div class="bg-primary text-primary-foreground px-3 py-1 rounded-md shadow-lg">Click on the map to place your pin</div>'

      document.querySelector(".leaflet-container")?.appendChild(container)

      return () => {
        document.querySelector(".leaflet-tooltip-adding-pin")?.remove()
      }
    }
  }, [isAddingPin, map])

  return null
}

export default function MapView() {
  const [pins, setPins] = useState<Pin[]>(initialPins)
  const [visiblePins, setVisiblePins] = useState<Pin[]>(initialPins)
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)
  const [newPinLocation, setNewPinLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isAddingPin, setIsAddingPin] = useState(false)
  const [showPinList, setShowPinList] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null)
  const { toast } = useToast()
  const mapRef = useRef<L.Map | null>(null)

  // Load Leaflet dynamically on client side
  useEffect(() => {
    // This is needed because Leaflet expects a global window object
    import("leaflet-defaulticon-compatibility")
  }, [])

  // Update visible pins when map bounds change
  useEffect(() => {
    if (mapBounds) {
      const newVisiblePins = pins.filter((pin) => mapBounds.contains([pin.latitude, pin.longitude]))
      setVisiblePins(newVisiblePins)
    }
  }, [mapBounds, pins])

  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingPin) {
      setNewPinLocation({ lat, lng })
    }
  }

  const handleAddPin = (pin: Omit<Pin, "id" | "userId" | "userName" | "createdAt">) => {
    if (!newPinLocation) return

    const newPin: Pin = {
      id: Date.now().toString(),
      latitude: newPinLocation.lat,
      longitude: newPinLocation.lng,
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: new Date().toISOString(),
      ...pin,
    }

    setPins((prevPins) => [...prevPins, newPin])
    setNewPinLocation(null)
    setIsAddingPin(false)
    toast({
      title: "Pin Added",
      description: "Your location pin has been added to the map.",
    })
  }

  const handleUpdatePin = (updatedPin: Pin) => {
    setPins(pins.map((pin) => (pin.id === updatedPin.id ? updatedPin : pin)))
    setSelectedPin(null)
    toast({
      title: "Pin Updated",
      description: "Your location pin has been updated.",
    })
  }

  const handleDeletePin = (pinId: string) => {
    setPins(pins.filter((pin) => pin.id !== pinId))
    setSelectedPin(null)
    toast({
      title: "Pin Deleted",
      description: "Your location pin has been removed from the map.",
    })
  }

  const toggleAddingPin = () => {
    setIsAddingPin(!isAddingPin)
    if (isAddingPin) {
      setNewPinLocation(null)
    }
  }

  // Also update the handleViewportChange function to prevent unnecessary updates
  const handleViewportChange = useCallback((bounds: L.LatLngBounds) => {
    setMapBounds((prevBounds) => {
      // Only update if bounds have actually changed
      if (
        !prevBounds ||
        prevBounds.getNorth() !== bounds.getNorth() ||
        prevBounds.getSouth() !== bounds.getSouth() ||
        prevBounds.getEast() !== bounds.getEast() ||
        prevBounds.getWest() !== bounds.getWest()
      ) {
        return bounds
      }
      return prevBounds
    })
  }, [])

  const handleUserLocationFound = (lat: number, lng: number) => {
    setUserLocation({ lat, lng })
    toast({
      title: "Location Found",
      description: "Your current location has been found.",
    })
  }

  // Calculate the center of all pins
  const getMapCenter = () => {
    if (pins.length === 0) return [53.4394, -2.2188]

    const sumLat = pins.reduce((sum, pin) => sum + pin.latitude, 0)
    const sumLng = pins.reduce((sum, pin) => sum + pin.longitude, 0)

    return [sumLat / pins.length, sumLng / pins.length]
  }

  return (
    <div className="relative h-screen w-full">
      {typeof window !== "undefined" && (
        <MapContainer
          center={getMapCenter() as [number, number]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          // Disable automatic zooming when adding markers
          doubleClickZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEvents onMapClick={handleMapClick} isAddingPin={isAddingPin} />
          <InitialMapBoundsFitter pins={initialPins} />
          <MapViewTracker onViewportChange={handleViewportChange} />
          <UserLocationMarker onLocationFound={handleUserLocationFound} />

          {pins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.latitude, pin.longitude]}
              icon={createCustomIcon(
                pin.userId === currentUser.id ? "#10b981" : "#3b82f6",
                pin.userId === currentUser.id,
              )}
              eventHandlers={{
                click: () => {
                  setSelectedPin(pin)
                },
              }}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-bold">{pin.title}</h3>
                  <p>{pin.description}</p>
                  <div className="flex items-center mt-1">
                    <span className="mr-1">Rating:</span>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-lg ${i < pin.rating ? "text-yellow-500" : "text-gray-300"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPin(pin)
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}

          {newPinLocation && (
            <Marker position={[newPinLocation.lat, newPinLocation.lng]} icon={createCustomIcon("#ef4444", true)}>
              <Popup>
                <div className="text-sm">
                  <p>Add a new pin here?</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      )}

      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
        <Button
          size="icon"
          onClick={() => setShowPinList(!showPinList)}
          className="rounded-full shadow-lg"
          aria-label="Show pin list"
        >
          <List className="h-5 w-5" />
        </Button>
        <Button
          onClick={toggleAddingPin}
          className={`shadow-lg ${isAddingPin ? "bg-red-500 hover:bg-red-600" : ""}`}
          aria-label={isAddingPin ? "Cancel adding pin" : "Add new pin"}
        >
          {isAddingPin ? (
            <span className="flex items-center gap-1">
              <X className="h-4 w-4" /> Cancel
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Pin
            </span>
          )}
        </Button>
        {isAddingPin && (
          <div className="absolute bottom-16 right-0 bg-background p-3 rounded-lg shadow-lg border w-48">
            <p className="text-sm font-medium">Adding Pin Mode</p>
            <p className="text-xs text-muted-foreground">Click anywhere on the map to place your pin</p>
          </div>
        )}
      </div>

      {/* Visible pins counter */}
      <div className="absolute top-4 right-4 bg-background p-2 rounded-md shadow-md z-[1000] flex items-center gap-2">
        <Eye className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {visiblePins.length} of {pins.length} pins visible
        </span>
      </div>

      {selectedPin && (
        <PinDetail
          pin={selectedPin}
          currentUserId={currentUser.id}
          onClose={() => setSelectedPin(null)}
          onUpdate={handleUpdatePin}
          onDelete={handleDeletePin}
        />
      )}

      {newPinLocation && (
        <PinForm
          onSubmit={handleAddPin}
          onCancel={() => {
            setNewPinLocation(null)
            setIsAddingPin(false)
          }}
        />
      )}

      {showPinList && (
        <PinList
          pins={pins}
          visiblePins={visiblePins}
          currentUserId={currentUser.id}
          onSelectPin={(pin) => {
            setSelectedPin(pin)
            setShowPinList(false)
          }}
          onClose={() => setShowPinList(false)}
        />
      )}
    </div>
  )
}

