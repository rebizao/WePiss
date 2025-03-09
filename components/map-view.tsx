"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { Button } from "@/components/ui/button"
import { PinDetail } from "@/components/pin-detail"
import { PinForm } from "@/components/pin-form"
import ProfileHub from "@/components/profile-hub"
import type { Pin } from "@/types/pin"
import type { User } from "@/types/user"
import { useToast } from "@/hooks/use-toast"
import { Plus, List, X, Eye, UserIcon, MessageSquare } from "lucide-react"
import PinList from "@/components/pin-list"
import L from "leaflet"
import FriendsHub from "@/components/friends-hub"
import UserProfile from "@/components/user-profile"

// Mock user data - in a real app, this would come from authentication
const currentUser: User = {
  id: "user1",
  name: "Demo User",
  description: "Map enthusiast and explorer. I love finding new places and sharing them with friends.",
  profilePicture: "/placeholder.svg?height=200&width=200",
  friends: [
    {
      id: "user2",
      name: "Jane",
      profilePicture: "/placeholder.svg?height=200&width=200",
      status: "accepted",
    },
    {
      id: "user3",
      name: "Alex",
      profilePicture: "/placeholder.svg?height=200&width=200",
      status: "pending",
    },
  ],
  createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
}

// Mock other users
const otherUsers: User[] = [
  {
    id: "user2",
    name: "Jane",
    description: "Food lover and coffee addict. Always looking for the best cafes and restaurants.",
    profilePicture: "/placeholder.svg?height=200&width=200",
    friends: [
      {
        id: "user1",
        name: "Demo User",
        profilePicture: "/placeholder.svg?height=200&width=200",
        status: "accepted",
      },
    ],
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user3",
    name: "Alex",
    description: "Outdoor enthusiast. Hiking, camping, and exploring nature.",
    profilePicture: "/placeholder.svg?height=200&width=200",
    friends: [
      {
        id: "user1",
        name: "Demo User",
        profilePicture: "/placeholder.svg?height=200&width=200",
        status: "pending",
      },
    ],
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user4",
    name: "Sam",
    description: "History buff and architecture enthusiast. I love exploring historical sites and buildings.",
    profilePicture: "/placeholder.svg?height=200&width=200",
    friends: [],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user5",
    name: "Taylor",
    description: "Art lover and museum enthusiast. Always looking for interesting exhibitions and galleries.",
    profilePicture: "/placeholder.svg?height=200&width=200",
    friends: [],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

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
    likes: [{ userId: "user3", userName: "Alex", createdAt: new Date().toISOString() }],
    media: ["/placeholder.svg?height=200&width=300"],
    userId: "user2",
    userName: "Jane",
    isPublic: true,
    visibility: "public",
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
    likes: [],
    media: ["/placeholder.svg?height=200&width=300"],
    userId: "user1",
    userName: "Demo User",
    isPublic: true,
    visibility: "public",
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
    likes: [{ userId: "user2", userName: "Jane", createdAt: new Date().toISOString() }],
    media: ["/placeholder.svg?height=200&width=300"],
    userId: "user1",
    userName: "Demo User",
    isPublic: true,
    visibility: "public",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    latitude: 53.438,
    longitude: -2.222,
    title: "Secret Study Spot",
    description: "My favorite quiet place to study",
    rating: 5,
    comments: [],
    likes: [],
    media: ["/placeholder.svg?height=200&width=300"],
    userId: "user1",
    userName: "Demo User",
    isPublic: false,
    visibility: "private",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    latitude: 53.4405,
    longitude: -2.217,
    title: "Best Coffee Shop",
    description: "Amazing coffee and pastries, good for working",
    rating: 4,
    comments: [],
    likes: [{ userId: "user1", userName: "Demo User", createdAt: new Date().toISOString() }],
    media: ["/placeholder.svg?height=200&width=300"],
    userId: "user2",
    userName: "Jane",
    isPublic: true,
    visibility: "friends",
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
        maxZoom: 15,
      })

      // Force a map invalidation to ensure proper rendering
      setTimeout(() => {
        map.invalidateSize()
      }, 100)

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
  const [showProfileHub, setShowProfileHub] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null)
  const [user, setUser] = useState<User>(currentUser)
  const { toast } = useToast()
  const mapRef = useRef<L.Map | null>(null)
  const [showFriendsHub, setShowFriendsHub] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Load Leaflet dynamically on client side
  useEffect(() => {
    // This is needed because Leaflet expects a global window object
    import("leaflet-defaulticon-compatibility")
  }, [])

  // Update visible pins when map bounds change
  useEffect(() => {
    if (mapBounds) {
      const newVisiblePins = pins.filter((pin) => {
        // Check if pin is within map bounds
        const isVisible = mapBounds.contains([pin.latitude, pin.longitude])

        // Check if pin should be visible based on visibility settings
        if (pin.userId === user.id) return isVisible // User's own pins

        if (pin.visibility === "public") return isVisible // Public pins

        if (pin.visibility === "friends") {
          // Check if the pin owner is a friend
          const isFriend = user.friends.some((friend) => friend.id === pin.userId && friend.status === "accepted")
          return isVisible && isFriend
        }

        return false // Private pins from other users
      })

      setVisiblePins(newVisiblePins)
    }
  }, [mapBounds, pins, user])

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
      userId: user.id,
      userName: user.name,
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

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser)
    // In a real app, this would update the user in the database
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
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

  // Add a function to center the map on a specific pin
  const centerMapOnPin = useCallback((pin: Pin) => {
    if (mapRef.current) {
      mapRef.current.setView([pin.latitude, pin.longitude], 16, {
        animate: true,
        duration: 1,
      })
    }
  }, [])

  // Get all users (current user + other users)
  const allUsers = [user, ...otherUsers]

  // Get user's pins
  const userPins = pins.filter((pin) => pin.userId === user.id)

  // Add this useEffect to ensure map renders properly
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize()
      }, 200)
    }
  }, [])

  // Add a function to handle opening a user profile
  const handleOpenUserProfile = (userId: string) => {
    const userToShow = userId === user.id ? user : allUsers.find((u) => u.id === userId)

    if (userToShow) {
      setSelectedUser(userToShow)
    }
  }

  // Add a function to handle sharing a pin
  const handleSharePin = (pin: Pin) => {
    setShowFriendsHub(true)
    // In a real app, we would pass the pin to the FriendsHub component
    toast({
      title: "Share Pin",
      description: `You can now share "${pin.title}" with your friends`,
    })
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
          // Add these props to ensure proper rendering
          whenCreated={(map) => {
            mapRef.current = map
            // Force a resize after the map is created
            setTimeout(() => {
              map.invalidateSize()
            }, 100)
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapEvents onMapClick={handleMapClick} isAddingPin={isAddingPin} />
          <InitialMapBoundsFitter pins={initialPins} />
          <MapViewTracker onViewportChange={handleViewportChange} />
          <UserLocationMarker onLocationFound={handleUserLocationFound} />

          {visiblePins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.latitude, pin.longitude]}
              icon={createCustomIcon(pin.userId === user.id ? "#10b981" : "#3b82f6", pin.userId === user.id)}
              eventHandlers={{
                click: () => {
                  setSelectedPin(pin)
                  centerMapOnPin(pin)
                },
              }}
            >
              <Popup>
                <div className="text-sm max-w-[200px]">
                  <h3 className="font-bold">{pin.title}</h3>
                  <p className="line-clamp-2 my-1">{pin.description}</p>
                  <div className="flex items-center mt-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-lg ${i < pin.rating ? "text-yellow-500" : "text-gray-300"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  {pin.media.length > 0 && (
                    <img
                      src={pin.media[0] || "/placeholder.svg"}
                      alt={pin.title}
                      className="w-full h-24 object-cover rounded-md my-1"
                    />
                  )}
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span>Added by</span>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenUserProfile(pin.userId)
                      }}
                    >
                      {pin.userName}
                    </Button>
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

      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        <Button onClick={() => setShowProfileHub(true)} className="flex items-center gap-2 shadow-lg">
          <UserIcon className="h-4 w-4" />
          <span>My Profile</span>
        </Button>
        <Button onClick={() => setShowFriendsHub(true)} className="flex items-center gap-2 shadow-lg">
          <MessageSquare className="h-4 w-4" />
          <span>Friends</span>
        </Button>
      </div>

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
          currentUserId={user.id}
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
          currentUserId={user.id}
          onSelectPin={(pin) => {
            setSelectedPin(pin)
            centerMapOnPin(pin)
            setShowPinList(false)
          }}
          onClose={() => setShowPinList(false)}
        />
      )}

      {showProfileHub && (
        <ProfileHub
          currentUser={user}
          userPins={userPins}
          allUsers={otherUsers}
          allPins={pins}
          onUpdateUser={handleUpdateUser}
          onSelectPin={(pin) => {
            setSelectedPin(pin)
            centerMapOnPin(pin)
            setShowProfileHub(false)
          }}
          onClose={() => setShowProfileHub(false)}
        />
      )}

      {showFriendsHub && (
        <FriendsHub
          currentUser={user}
          allUsers={otherUsers}
          allPins={pins}
          onSelectPin={(pin) => {
            setSelectedPin(pin)
            centerMapOnPin(pin)
            setShowFriendsHub(false)
          }}
          onUpdateUser={handleUpdateUser}
          onClose={() => setShowFriendsHub(false)}
        />
      )}

      {selectedUser && (
        <UserProfile
          user={selectedUser}
          currentUser={user}
          userPins={pins.filter((pin) => pin.userId === selectedUser.id)}
          onClose={() => setSelectedUser(null)}
          onSelectPin={(pin) => {
            setSelectedPin(pin)
            centerMapOnPin(pin)
            setSelectedUser(null)
          }}
          onUpdateUser={handleUpdateUser}
          onSharePin={handleSharePin}
        />
      )}
    </div>
  )
}

