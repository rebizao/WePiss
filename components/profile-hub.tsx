"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User, Friend } from "@/types/user"
import type { Pin } from "@/types/pin"
import { Search, MapPin, Users, UserIcon, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProfileHubProps {
  currentUser: User
  userPins: Pin[]
  allUsers: User[]
  allPins: Pin[]
  onUpdateUser: (user: User) => void
  onSelectPin: (pin: Pin) => void
  onClose: () => void
}

export default function ProfileHub({
  currentUser,
  userPins,
  allUsers,
  allPins,
  onUpdateUser,
  onSelectPin,
  onClose,
}: ProfileHubProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const [editMode, setEditMode] = useState(false)
  const [editedUser, setEditedUser] = useState<User>(currentUser)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const handleSaveProfile = () => {
    onUpdateUser(editedUser)
    setEditMode(false)
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    })
  }

  const handleAddFriend = (userId: string) => {
    const friendToAdd = allUsers.find((user) => user.id === userId)
    if (!friendToAdd) return

    const newFriend: Friend = {
      id: friendToAdd.id,
      name: friendToAdd.name,
      profilePicture: friendToAdd.profilePicture,
      status: "pending",
    }

    const updatedUser = {
      ...currentUser,
      friends: [...currentUser.friends, newFriend],
    }

    onUpdateUser(updatedUser)
    toast({
      title: "Friend Request Sent",
      description: `Friend request sent to ${friendToAdd.name}.`,
    })
  }

  const handleAcceptFriend = (friendId: string) => {
    const updatedFriends = currentUser.friends.map((friend) =>
      friend.id === friendId ? { ...friend, status: "accepted" as const } : friend,
    )

    const updatedUser = {
      ...currentUser,
      friends: updatedFriends,
    }

    onUpdateUser(updatedUser)
    toast({
      title: "Friend Request Accepted",
      description: `You are now friends with ${currentUser.friends.find((f) => f.id === friendId)?.name}.`,
    })
  }

  const handleRemoveFriend = (friendId: string) => {
    const updatedFriends = currentUser.friends.filter((friend) => friend.id !== friendId)

    const updatedUser = {
      ...currentUser,
      friends: updatedFriends,
    }

    onUpdateUser(updatedUser)
    toast({
      title: "Friend Removed",
      description: "Friend has been removed from your list.",
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

  // Filter users based on search term
  const filteredUsers = allUsers.filter(
    (user) =>
      user.id !== currentUser.id &&
      !currentUser.friends.some((friend) => friend.id === user.id) &&
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filter pins based on search term and visibility
  const filteredPins = allPins
    .filter((pin) => {
      // Show all user's pins
      if (pin.userId === currentUser.id) return true

      // Show public pins from other users
      if (pin.visibility === "public") return true

      // Show friends-only pins if the user is a friend
      if (
        pin.visibility === "friends" &&
        currentUser.friends.some((friend) => friend.id === pin.userId && friend.status === "accepted")
      ) {
        return true
      }

      return false
    })
    .filter(
      (pin) =>
        pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pin.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>User Profile</CardTitle>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
          <CardDescription>Manage your profile, friends, and pins</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="pins" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>My Pins</span>
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Friends</span>
              </TabsTrigger>
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Discover</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="profile" className="h-full">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={currentUser.profilePicture || "/placeholder.svg?height=96&width=96"} />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{currentUser.name}</h3>
                      <p className="text-muted-foreground">
                        Member since {new Date(currentUser.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground">
                        {userPins.length} pins · {currentUser.friends.filter((f) => f.status === "accepted").length}{" "}
                        friends
                      </p>
                    </div>
                  </div>

                  {!editMode ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">About</h4>
                        <p className="text-sm">{currentUser.description || "No description provided."}</p>
                      </div>
                      <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
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
                            setEditedUser(currentUser)
                            setEditMode(false)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pins" className="h-full">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search your pins..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {userPins
                      .filter(
                        (pin) =>
                          pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pin.description.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((pin) => (
                        <Card key={pin.id} className="overflow-hidden">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="shrink-0 mt-1">
                                <MapPin className="h-5 w-5 text-primary" />
                              </div>
                              <div className="grid gap-1 flex-1">
                                <div className="font-medium flex items-center justify-between">
                                  <span>{pin.title}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                    {pin.visibility === "private"
                                      ? "Private"
                                      : pin.visibility === "friends"
                                        ? "Friends"
                                        : "Public"}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-2">{pin.description}</div>
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-sm justify-start"
                                  onClick={() => {
                                    onSelectPin(pin)
                                    onClose()
                                  }}
                                >
                                  View on Map
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {userPins.length === 0 && (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <h3 className="text-lg font-medium">No pins yet</h3>
                      <p className="text-muted-foreground">Start adding pins to the map to see them here.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="friends" className="h-full">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search friends..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    {currentUser.friends.length > 0 && (
                      <>
                        <h3 className="font-medium">Friend Requests</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentUser.friends
                            .filter((friend) => friend.status === "pending")
                            .filter((friend) => friend.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((friend) => (
                              <Card key={friend.id}>
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage
                                        src={friend.profilePicture || "/placeholder.svg?height=40&width=40"}
                                      />
                                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="font-medium">{friend.name}</div>
                                      <div className="flex gap-2 mt-2">
                                        <Button size="sm" onClick={() => handleAcceptFriend(friend.id)}>
                                          Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleRemoveFriend(friend.id)}
                                        >
                                          Decline
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>

                        <h3 className="font-medium">Friends</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentUser.friends
                            .filter((friend) => friend.status === "accepted")
                            .filter((friend) => friend.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((friend) => (
                              <Card key={friend.id}>
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage
                                        src={friend.profilePicture || "/placeholder.svg?height=40&width=40"}
                                      />
                                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="font-medium">{friend.name}</div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-2"
                                        onClick={() => handleRemoveFriend(friend.id)}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </>
                    )}

                    {currentUser.friends.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <h3 className="text-lg font-medium">No friends yet</h3>
                        <p className="text-muted-foreground">Add friends to share your pins with them.</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="discover" className="h-full">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users and pins..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Tabs defaultValue="users">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="users">Users</TabsTrigger>
                      <TabsTrigger value="pins">Pins</TabsTrigger>
                    </TabsList>
                    <TabsContent value="users" className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredUsers.map((user) => (
                          <Card key={user.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.profilePicture || "/placeholder.svg?height=40&width=40"} />
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {
                                      allPins.filter((pin) => pin.userId === user.id && pin.visibility === "public")
                                        .length
                                    }{" "}
                                    public pins
                                  </div>
                                  <Button size="sm" className="mt-2" onClick={() => handleAddFriend(user.id)}>
                                    Add Friend
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {filteredUsers.length === 0 && (
                        <div className="text-center py-8">
                          <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <h3 className="text-lg font-medium">No users found</h3>
                          <p className="text-muted-foreground">Try a different search term.</p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="pins" className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredPins.map((pin) => (
                          <Card key={pin.id} className="overflow-hidden">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <div className="shrink-0 mt-1">
                                  <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div className="grid gap-1 flex-1">
                                  <div className="font-medium flex items-center justify-between">
                                    <span>{pin.title}</span>
                                    <span className="text-xs text-muted-foreground">by {pin.userName}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground line-clamp-2">{pin.description}</div>
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-sm justify-start"
                                    onClick={() => {
                                      onSelectPin(pin)
                                      onClose()
                                    }}
                                  >
                                    View on Map
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {filteredPins.length === 0 && (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <h3 className="text-lg font-medium">No pins found</h3>
                          <p className="text-muted-foreground">Try a different search term.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

