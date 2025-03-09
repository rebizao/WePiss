"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Pin } from "@/types/pin"
import type { User } from "@/types/user"
import { formatDistanceToNow } from "date-fns"
import { MapPin, Heart, MessageSquare, Share2, Lock, Users, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PinCardProps {
  pin: Pin
  currentUser: User
  onSelectPin: (pin: Pin) => void
  onShare?: (pin: Pin) => void
  onLike?: (pin: Pin) => void
  onComment?: (pin: Pin) => void
  showActions?: boolean
}

export default function PinCard({
  pin,
  currentUser,
  onSelectPin,
  onShare,
  onLike,
  onComment,
  showActions = true,
}: PinCardProps) {
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(pin.likes?.some((like) => like.userId === currentUser.id) || false)
  const [likeCount, setLikeCount] = useState(pin.likes?.length || 0)

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

  const handleLike = () => {
    if (!onLike) {
      // If no onLike handler is provided, just toggle the like state locally
      setIsLiked(!isLiked)
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)

      // Add or remove the like from the pin
      if (!isLiked) {
        pin.likes = [
          ...(pin.likes || []),
          {
            userId: currentUser.id,
            userName: currentUser.name,
            createdAt: new Date().toISOString(),
          },
        ]
      } else {
        pin.likes = (pin.likes || []).filter((like) => like.userId !== currentUser.id)
      }

      toast({
        title: isLiked ? "Removed Like" : "Liked",
        description: isLiked ? "You've removed your like from this location" : "You've liked this location",
      })
    } else {
      onLike(pin)
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare(pin)
    } else {
      toast({
        title: "Share",
        description: "Sharing functionality is not available in this view",
      })
    }
  }

  const handleComment = () => {
    if (onComment) {
      onComment(pin)
    } else {
      onSelectPin(pin)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header with user info and timestamp */}
        <div className="p-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={pin.userProfilePicture || "/placeholder.svg?height=32&width=32"} />
              <AvatarFallback>{pin.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{pin.userName}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(pin.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            {getVisibilityIcon(pin.visibility)}
            <span className="text-xs">
              {pin.visibility === "private" ? "Private" : pin.visibility === "friends" ? "Friends" : "Public"}
            </span>
          </Badge>
        </div>

        {/* Media */}
        {pin.media.length > 0 ? (
          <div className="aspect-square relative">
            <img
              src={pin.media[0] || "/placeholder.svg?height=400&width=400"}
              alt={pin.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=400&width=400"
              }}
            />
            <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-md flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">{pin.title}</span>
            </div>
          </div>
        ) : (
          <div className="aspect-square bg-muted flex items-center justify-center">
            <div className="text-center p-4">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium">{pin.title}</h3>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-3">
          <h3 className="font-medium">{pin.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{pin.description}</p>

          <div className="flex items-center mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-sm ${i < pin.rating ? "text-yellow-500" : "text-gray-300"}`}>
                ★
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              <span>{likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{pin.comments.length}</span>
            </div>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-0 border-t">
          <div className="grid grid-cols-3 w-full">
            <Button variant="ghost" className="rounded-none h-12" onClick={handleLike}>
              <Heart className={`h-5 w-5 mr-2 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              Like
            </Button>
            <Button variant="ghost" className="rounded-none h-12 border-x" onClick={handleComment}>
              <MessageSquare className="h-5 w-5 mr-2" />
              Comment
            </Button>
            <Button variant="ghost" className="rounded-none h-12" onClick={handleShare}>
              <Share2 className="h-5 w-5 mr-2" />
              Share
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

