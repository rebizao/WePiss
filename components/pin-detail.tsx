"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Pin, Comment } from "@/types/pin"
import { Star, Trash, Edit, Image, Send, Lock, Users, Globe } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface PinDetailProps {
  pin: Pin
  currentUserId: string
  onClose: () => void
  onUpdate: (pin: Pin) => void
  onDelete: (pinId: string) => void
}

export function PinDetail({ pin, currentUserId, onClose, onUpdate, onDelete }: PinDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedPin, setEditedPin] = useState<Pin>(pin)
  const [newComment, setNewComment] = useState("")
  const [newMedia, setNewMedia] = useState("")
  const isOwner = pin.userId === currentUserId

  const handleUpdatePin = () => {
    onUpdate(editedPin)
    setIsEditing(false)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: "Demo User", // In a real app, get from auth
      text: newComment,
      createdAt: new Date().toISOString(),
    }

    const updatedPin = {
      ...pin,
      comments: [...pin.comments, comment],
    }

    onUpdate(updatedPin)
    setNewComment("")
  }

  const handleAddMedia = () => {
    if (!newMedia.trim()) return

    // In a real app, this would be a file upload
    // For demo purposes, we're just adding the URL
    const updatedPin = {
      ...pin,
      media: [...pin.media, newMedia],
    }

    onUpdate(updatedPin)
    setNewMedia("")
  }

  const handleRatingChange = (rating: number) => {
    setEditedPin({
      ...editedPin,
      rating,
    })
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Location" : pin.title}
            {isOwner && !isEditing && (
              <div className="float-right flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(pin.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedPin.title}
                onChange={(e) => setEditedPin({ ...editedPin, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedPin.description}
                onChange={(e) => setEditedPin({ ...editedPin, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Rating</Label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button key={rating} variant="ghost" size="icon" onClick={() => handleRatingChange(rating)}>
                    <Star
                      className={`h-5 w-5 ${
                        rating <= editedPin.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Visibility</Label>
              <RadioGroup
                value={editedPin.visibility}
                onValueChange={(value) =>
                  setEditedPin({
                    ...editedPin,
                    visibility: value as "private" | "friends" | "public",
                    isPublic: value === "public",
                  })
                }
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="edit-private" />
                  <Label htmlFor="edit-private" className="flex items-center cursor-pointer">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Private (only you)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="friends" id="edit-friends" />
                  <Label htmlFor="edit-friends" className="flex items-center cursor-pointer">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Friends only</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="edit-public" />
                  <Label htmlFor="edit-public" className="flex items-center cursor-pointer">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>Public (everyone)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePin}>Save Changes</Button>
            </DialogFooter>
          </div>
        ) : (
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 pt-4">
              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">{pin.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Location</h4>
                <p className="text-sm text-muted-foreground">
                  {pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Rating</h4>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`h-5 w-5 ${
                        rating <= pin.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium">Added by</h4>
                <p className="text-sm text-muted-foreground">{pin.userName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Date added</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(pin.createdAt), { addSuffix: true })} (
                  {format(new Date(pin.createdAt), "PPP")})
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Visibility</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {pin.visibility === "private" ? (
                    <>
                      <Lock className="h-3 w-3" /> Private (only you)
                    </>
                  ) : pin.visibility === "friends" ? (
                    <>
                      <Users className="h-3 w-3" /> Friends only
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3" /> Public (everyone)
                    </>
                  )}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Likes</h4>
                <p className="text-sm text-muted-foreground">{pin.likes?.length || 0} people liked this post</p>
              </div>
            </TabsContent>
            <TabsContent value="comments" className="space-y-4 pt-4">
              <div className="space-y-4">
                {pin.comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                  pin.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={comment.userProfilePicture || "/placeholder.svg?height=24&width=24"} />
                          <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">{comment.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-sm mt-1">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleAddComment}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="media" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-2">
                {pin.media.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-2">No media yet.</p>
                ) : (
                  pin.media.map((mediaUrl, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={mediaUrl || "/placeholder.svg?height=200&width=200"}
                        alt={`Media for ${pin.title}`}
                        className="object-cover w-full h-full rounded-md"
                        onError={(e) => {
                          // Fallback if image fails to load
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=200"
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Image URL (in a real app, this would be a file upload)"
                    value={newMedia}
                    onChange={(e) => setNewMedia(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleAddMedia}>
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

