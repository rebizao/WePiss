"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { User, Friend } from "@/types/user"
import type { Pin } from "@/types/pin"
import { UserIcon, MapPin, Upload, UserPlus, UserMinus, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PinCard from "@/components/pin-card"

interface UserProfileProps {
  user: User
  currentUser: User
  userPins: Pin[]
  onClose: () => void
  onSelectPin: (pin: Pin) => void
  onUpdateUser: (user: User) => void
  onSharePin?: (pin: Pin) => void
}

export default function UserProfile({
  user,
  currentUser,
  userPins,
  onClose,
  onSelectPin,
  onUpdateUser,
  onSharePin,
}: UserProfileProps) {
  const [editMode, setEditMode] = useState(false)
  const [editedUser, setEditedUser] = useState<User>(user)
  const { toast } = useToast()
  const isCurrentUser = user.id === currentUser.id

  // Check if the user is a friend
  const friendStatus = isCurrentUser ? null : currentUser.friends.find((f) => f.id === user.id)?.status || null

  const handleSaveProfile = () => {
    onUpdateUser(editedUser)
    setEditMode(false)
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    })
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would upload the file to a server
    // For demo purposes, we'll just use a placeholder
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditedUser({
            ...editedUser,
            profilePicture: event.target.result as string,
          })
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleAddFriend = () => {
    // Add this user as a friend
    const newFriend: Friend = {
      id: user.id,
      name: user.name,
      profilePicture: user.profilePicture,
      status: "pending",
    }

    const updatedUser = {
      ...currentUser,
      friends: [...currentUser.friends, newFriend],
    }

    onUpdateUser(updatedUser)
    toast({
      title: "Friend Request Sent",
      description: `Friend request sent to ${user.name}.`,
    })
  }

  const handleAcceptFriend = () => {
    // Accept friend request
    const updatedFriends = currentUser.friends.map((friend) =>
      friend.id === user.id ? { ...friend, status: "accepted" as const } : friend,
    )

    const updatedUser = {
      ...currentUser,
      friends: updatedFriends,
    }

    onUpdateUser(updatedUser)
    toast({
      title: "Friend Request Accepted",
      description: `You are now friends with ${user.name}.`,
    })
  }

  const handleRemoveFriend = () => {
    // Remove this user from friends
    const updatedFriends = currentUser.friends.filter((friend) => friend.id !== user.id)

    const updatedUser = {
      ...currentUser,
      friends: updatedFriends,
    }

    onUpdateUser(updatedUser)
    toast({
      title: "Friend Removed",
      description: `${user.name} has been removed from your friends.`,
    })
  }

  // Filter pins based on visibility
  const visiblePins = userPins.filter((pin) => {
    if (isCurrentUser) return true // Show all pins if viewing own profile
    if (pin.visibility === "public") return true // Show public pins
    if (pin.visibility === "friends" && friendStatus === "accepted") return true // Show friends-only pins if friends
    return false // Don't show private pins
  })

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col z-[9999]">
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-start gap-6 p-4 border-b">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profilePicture || "/placeholder.svg?height=96&width=96"} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                {!isCurrentUser && (
                  <div>
                    {!friendStatus && (
                      <Button onClick={handleAddFriend} className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        <span>Add Friend</span>
                      </Button>
                    )}
                    {friendStatus === "pending" && (
                      <div className="flex gap-2">
                        <Button onClick={handleAcceptFriend} className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <span>Accept</span>
                        </Button>
                        <Button variant="outline" onClick={handleRemoveFriend} className="flex items-center gap-2">
                          <UserMinus className="h-4 w-4" />
                          <span>Decline</span>
                        </Button>
                      </div>
                    )}
                    {friendStatus === "accepted" && (
                      <Button variant="outline" onClick={handleRemoveFriend} className="flex items-center gap-2">
                        <UserMinus className="h-4 w-4" />
                        <span>Remove Friend</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <p className="text-muted-foreground mt-1">Member since {new Date(user.createdAt).toLocaleDateString()}</p>

              <p className="mt-3">{user.description || "No description provided."}</p>

              <div className="flex items-center gap-4 mt-4">
                <div className="text-sm">
                  <span className="font-bold">{visiblePins.length}</span> posts
                </div>
                <div className="text-sm">
                  <span className="font-bold">{user.friends.filter((f) => f.status === "accepted").length}</span>{" "}
                  friends
                </div>
              </div>

              {isCurrentUser && !editMode && (
                <Button onClick={() => setEditMode(true)} className="mt-4">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {isCurrentUser && editMode ? (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-medium">Edit Profile</h3>

              <div>
                <label className="block text-sm font-medium mb-1">Profile Picture</label>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={editedUser.profilePicture || "/placeholder.svg?height=40&width=40"} />
                    <AvatarFallback>{editedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="relative">
                    <Upload className="h-4 w-4 mr-2" />
                    <span>Upload</span>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                    />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={editedUser.name}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">About</label>
                <Textarea
                  value={editedUser.description}
                  onChange={(e) => setEditedUser({ ...editedUser, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveProfile}>Save Changes</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditedUser(user)
                    setEditMode(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="posts" className="flex-1 flex flex-col">
              <TabsList className="px-4 pt-2">
                <TabsTrigger value="posts" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Posts</span>
                </TabsTrigger>
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>About</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {visiblePins.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      {visiblePins.map((pin) => (
                        <PinCard
                          key={pin.id}
                          pin={pin}
                          currentUser={currentUser}
                          onSelectPin={onSelectPin}
                          onShare={onSharePin}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <h3 className="text-lg font-medium">No posts yet</h3>
                      <p className="text-muted-foreground">
                        {isCurrentUser
                          ? "Start adding pins to the map to see them here."
                          : "This user hasn't shared any posts yet."}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="about" className="p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {isCurrentUser ? "Me" : user.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">Bio</h4>
                      <p className="text-muted-foreground mt-1">{user.description || "No description provided."}</p>
                    </div>

                    <div>
                      <h4 className="font-medium">Member Since</h4>
                      <p className="text-muted-foreground mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div>
                      <h4 className="font-medium">Friends</h4>
                      <p className="text-muted-foreground mt-1">
                        {user.friends.filter((f) => f.status === "accepted").length} friends
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium">Posts</h4>
                      <p className="text-muted-foreground mt-1">{visiblePins.length} posts</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

