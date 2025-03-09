"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { User, Friend } from "@/types/user"
import type { Pin } from "@/types/pin"
import { MessageSquare, Users, Clock, MapPin, Send, Share2 } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import PinCard from "@/components/pin-card"

// Types for messages and activities
interface Message {
  id: string
  senderId: string
  senderName: string
  receiverId: string
  text: string
  timestamp: string
  sharedPin?: Pin
}

interface Activity {
  id: string
  userId: string
  userName: string
  type: "added_pin" | "updated_pin" | "commented" | "rated" | "shared_pin" | "became_friends"
  timestamp: string
  pin?: Pin
  targetUserId?: string
  targetUserName?: string
  comment?: string
  rating?: number
}

interface FriendsHubProps {
  currentUser: User
  allUsers: User[]
  allPins: Pin[]
  onClose: () => void
  onSelectPin: (pin: Pin) => void
  onUpdateUser: (user: User) => void
}

export default function FriendsHub({
  currentUser,
  allUsers,
  allPins,
  onClose,
  onSelectPin,
  onUpdateUser,
}: FriendsHubProps) {
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>(generateMockMessages(currentUser, allUsers))
  const [activities, setActivities] = useState<Activity[]>(generateMockActivities(currentUser, allUsers, allPins))
  const [sharedPin, setSharedPin] = useState<Pin | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Filter friends based on search term
  const filteredFriends = currentUser.friends.filter(
    (friend) => friend.status === "accepted" && friend.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get messages for selected friend
  const friendMessages = selectedFriend
    ? messages.filter(
        (msg) =>
          (msg.senderId === currentUser.id && msg.receiverId === selectedFriend.id) ||
          (msg.senderId === selectedFriend.id && msg.receiverId === currentUser.id),
      )
    : []

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [friendMessages])

  // Filter activities based on friends
  const friendActivities = activities.filter((activity) =>
    currentUser.friends.some((friend) => friend.id === activity.userId && friend.status === "accepted"),
  )

  const handleSendMessage = () => {
    if (!selectedFriend || (!newMessage.trim() && !sharedPin)) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: selectedFriend.id,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      sharedPin: sharedPin || undefined,
    }

    setMessages([...messages, message])
    setNewMessage("")
    setSharedPin(null)

    // If sharing a pin, create an activity
    if (sharedPin) {
      const activity: Activity = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        type: "shared_pin",
        timestamp: new Date().toISOString(),
        pin: sharedPin,
        targetUserId: selectedFriend.id,
        targetUserName: selectedFriend.name,
      }

      setActivities([activity, ...activities])
    }

    toast({
      title: "Message Sent",
      description: `Your message was sent to ${selectedFriend.name}`,
    })
  }

  const handleSharePin = (pin: Pin) => {
    setSharedPin(pin)
    toast({
      title: "Pin Selected",
      description: "Now send your message to share this pin",
    })
  }

  const handleViewSharedPin = (pin: Pin) => {
    onSelectPin(pin)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col z-[9999]">
        <DialogHeader>
          <DialogTitle>Friends Hub</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Friends</span>
              </TabsTrigger>
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Activity Feed</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden mt-4">
              <TabsContent value="chat" className="h-full flex flex-col">
                <div className="grid grid-cols-3 gap-4 h-full">
                  <Card className="col-span-1 overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Friends</CardTitle>
                      <div className="relative mt-2">
                        <Input
                          placeholder="Search friends..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-2">
                      {filteredFriends.length > 0 ? (
                        <div className="space-y-2">
                          {filteredFriends.map((friend) => (
                            <div
                              key={friend.id}
                              className={`p-2 rounded-md cursor-pointer flex items-center gap-2 ${
                                selectedFriend?.id === friend.id ? "bg-primary/10" : "hover:bg-muted"
                              }`}
                              onClick={() => setSelectedFriend(friend)}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={friend.profilePicture || "/placeholder.svg?height=40&width=40"} />
                                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{friend.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {getLastMessage(messages, currentUser.id, friend.id)}
                                </div>
                              </div>
                              {hasUnreadMessages(messages, currentUser.id, friend.id) && (
                                <Badge className="ml-auto">New</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <h3 className="text-lg font-medium">No friends found</h3>
                          <p className="text-muted-foreground">Try a different search term.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="col-span-2 overflow-hidden flex flex-col">
                    {selectedFriend ? (
                      <>
                        <CardHeader className="pb-2 border-b">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={selectedFriend.profilePicture || "/placeholder.svg?height=40&width=40"}
                              />
                              <AvatarFallback>{selectedFriend.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-lg">{selectedFriend.name}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4">
                          <div className="space-y-4">
                            {friendMessages.length > 0 ? (
                              friendMessages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${
                                    message.senderId === currentUser.id ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-[70%] ${
                                      message.senderId === currentUser.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    } rounded-lg p-3`}
                                  >
                                    {message.text && <p className="text-sm">{message.text}</p>}

                                    {message.sharedPin && (
                                      <div className="mt-2 bg-background/10 p-2 rounded-md">
                                        <div className="flex items-start gap-2">
                                          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                          <div className="min-w-0">
                                            <p className="font-medium text-sm">{message.sharedPin.title}</p>
                                            <p className="text-xs truncate">{message.sharedPin.description}</p>
                                            <Button
                                              variant="link"
                                              className="p-0 h-auto text-xs"
                                              onClick={() => handleViewSharedPin(message.sharedPin!)}
                                            >
                                              View on map
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    <div className="text-xs mt-1 opacity-70">
                                      {format(new Date(message.timestamp), "p")}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                <h3 className="text-lg font-medium">No messages yet</h3>
                                <p className="text-muted-foreground">
                                  Start a conversation with {selectedFriend.name}.
                                </p>
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                        </CardContent>
                        <div className="p-4 border-t">
                          {sharedPin && (
                            <div className="mb-2 bg-muted p-2 rounded-md flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm font-medium">{sharedPin.title}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => setSharedPin(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Textarea
                              placeholder={`Message ${selectedFriend.name}...`}
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              className="flex-1 min-h-[60px] max-h-[120px]"
                            />
                            <div className="flex flex-col gap-2">
                              <Button
                                className="flex-1"
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() && !sharedPin}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setActiveTab("share")}
                                title="Share a location"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center p-8">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <h3 className="text-lg font-medium">Select a friend to start chatting</h3>
                          <p className="text-muted-foreground">Choose a friend from the list on the left.</p>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="friends" className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentUser.friends
                    .filter((friend) => friend.status === "accepted")
                    .map((friend) => {
                      const friendUser = allUsers.find((user) => user.id === friend.id)
                      const friendPins = allPins.filter(
                        (pin) =>
                          pin.userId === friend.id && (pin.visibility === "public" || pin.visibility === "friends"),
                      )

                      return (
                        <Card key={friend.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={friend.profilePicture || "/placeholder.svg?height=48&width=48"} />
                                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{friend.name}</h3>
                                <p className="text-xs text-muted-foreground">{friendPins.length} shared locations</p>
                              </div>
                            </div>

                            {friendUser && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {friendUser.description || "No description available."}
                              </p>
                            )}

                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedFriend(friend)
                                  setActiveTab("chat")
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  // In a real app, this would navigate to a friend's profile
                                  toast({
                                    title: "View Profile",
                                    description: `Viewing ${friend.name}'s profile`,
                                  })
                                }}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Profile
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>

                {currentUser.friends.filter((friend) => friend.status === "accepted").length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No friends yet</h3>
                    <p className="text-muted-foreground">Add friends to see them here.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="feed" className="h-full">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="space-y-6 p-1">
                    {friendActivities.length > 0 ? (
                      friendActivities.map((activity) => (
                        <div key={activity.id}>
                          {activity.pin ? (
                            <div className="mb-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={
                                      allUsers.find((u) => u.id === activity.userId)?.profilePicture ||
                                      "/placeholder.svg?height=24&width=24"
                                    }
                                  />
                                  <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="text-sm text-muted-foreground">
                                  {activity.userName} {getActivityText(activity)}
                                </p>
                              </div>
                              <PinCard
                                pin={{
                                  ...activity.pin,
                                  userProfilePicture: allUsers.find((u) => u.id === activity.pin?.userId)
                                    ?.profilePicture,
                                }}
                                currentUser={currentUser}
                                onSelectPin={onSelectPin}
                                onShare={(pin) => {
                                  setSharedPin(pin)
                                  if (selectedFriend) {
                                    setActiveTab("chat")
                                  } else {
                                    toast({
                                      title: "Select a Friend",
                                      description: "Please select a friend to share with first",
                                    })
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <Card key={activity.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={
                                        allUsers.find((u) => u.id === activity.userId)?.profilePicture ||
                                        "/placeholder.svg?height=40&width=40"
                                      }
                                    />
                                    <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium">{activity.userName}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                      </p>
                                    </div>

                                    <p className="text-sm mt-1">{getActivityText(activity)}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <h3 className="text-lg font-medium">No activity yet</h3>
                        <p className="text-muted-foreground">Your friends' activities will appear here.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="share" className="h-full">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Share a Location</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("chat")}>
                    Back to Chat
                  </Button>
                </div>

                <div className="relative mb-4">
                  <Input
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allPins
                      .filter(
                        (pin) =>
                          (pin.userId === currentUser.id || pin.visibility === "public") &&
                          (pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            pin.description.toLowerCase().includes(searchTerm.toLowerCase())),
                      )
                      .map((pin) => (
                        <PinCard
                          key={pin.id}
                          pin={{
                            ...pin,
                            userProfilePicture: allUsers.find((u) => u.id === pin.userId)?.profilePicture,
                          }}
                          currentUser={currentUser}
                          onSelectPin={onSelectPin}
                          onShare={() => {
                            handleSharePin(pin)
                            setActiveTab("chat")
                          }}
                        />
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper functions
function getLastMessage(messages: Message[], userId: string, friendId: string): string {
  const conversation = messages.filter(
    (msg) =>
      (msg.senderId === userId && msg.receiverId === friendId) ||
      (msg.senderId === friendId && msg.receiverId === userId),
  )

  if (conversation.length === 0) return "No messages yet"

  const lastMessage = conversation[conversation.length - 1]

  if (lastMessage.sharedPin) {
    return `Shared: ${lastMessage.sharedPin.title}`
  }

  return lastMessage.text || "Shared a location"
}

function hasUnreadMessages(messages: Message[], userId: string, friendId: string): boolean {
  // In a real app, this would check for unread messages
  // For demo purposes, we'll just return false
  return false
}

function getActivityText(activity: Activity): string {
  switch (activity.type) {
    case "added_pin":
      return `added a new location: ${activity.pin?.title}`
    case "updated_pin":
      return `updated the location: ${activity.pin?.title}`
    case "commented":
      return `commented on ${activity.pin?.title}: "${activity.comment}"`
    case "rated":
      return `rated ${activity.pin?.title} ${activity.rating} stars`
    case "shared_pin":
      return `shared ${activity.pin?.title} with ${activity.targetUserName}`
    case "became_friends":
      return `became friends with ${activity.targetUserName}`
    default:
      return ""
  }
}

// Mock data generators
function generateMockMessages(currentUser: User, allUsers: User[]): Message[] {
  const messages: Message[] = []

  // Generate some mock messages for each friend
  currentUser.friends
    .filter((friend) => friend.status === "accepted")
    .forEach((friend) => {
      // Find friend in allUsers
      const friendUser = allUsers.find((user) => user.id === friend.id)
      if (!friendUser) return

      // Generate 1-5 messages
      const messageCount = Math.floor(Math.random() * 5) + 1

      for (let i = 0; i < messageCount; i++) {
        const isFromFriend = Math.random() > 0.5
        const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in the last week

        messages.push({
          id: `msg-${friend.id}-${i}`,
          senderId: isFromFriend ? friend.id : currentUser.id,
          senderName: isFromFriend ? friend.name : currentUser.name,
          receiverId: isFromFriend ? currentUser.id : friend.id,
          text: getRandomMessage(isFromFriend ? friend.name : currentUser.name),
          timestamp: timestamp.toISOString(),
        })
      }
    })

  // Sort messages by timestamp
  return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

function getRandomMessage(name: string): string {
  const messages = [
    `Hey, how's it going?`,
    `Have you checked out that new place downtown?`,
    `I found an amazing spot yesterday!`,
    `Do you want to meet up later?`,
    `What do you think about this location?`,
    `I'm planning to visit this place next weekend.`,
    `Have you been here before?`,
    `This place has the best coffee!`,
    `I think you'd like this spot.`,
    `Let me know if you want to check this out together.`,
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}

function generateMockActivities(currentUser: User, allUsers: User[], allPins: Pin[]): Activity[] {
  const activities: Activity[] = []

  // Generate activities for friends
  currentUser.friends
    .filter((friend) => friend.status === "accepted")
    .forEach((friend) => {
      // Find friend in allUsers
      const friendUser = allUsers.find((user) => user.id === friend.id)
      if (!friendUser) return

      // Get friend's pins
      const friendPins = allPins.filter((pin) => pin.userId === friend.id)

      // Generate 1-3 activities per friend
      const activityCount = Math.floor(Math.random() * 3) + 1

      for (let i = 0; i < activityCount; i++) {
        const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in the last week
        const activityType = getRandomActivityType()
        const randomPin = friendPins.length > 0 ? friendPins[Math.floor(Math.random() * friendPins.length)] : null

        if (randomPin || activityType === "became_friends") {
          activities.push({
            id: `activity-${friend.id}-${i}`,
            userId: friend.id,
            userName: friend.name,
            type: activityType,
            timestamp: timestamp.toISOString(),
            pin: randomPin || undefined,
            targetUserId:
              activityType === "shared_pin" || activityType === "became_friends"
                ? getRandomFriendId(friendUser, currentUser.id)
                : undefined,
            targetUserName:
              activityType === "shared_pin" || activityType === "became_friends"
                ? getRandomFriendName(friendUser, currentUser.name)
                : undefined,
            comment: activityType === "commented" ? getRandomComment() : undefined,
            rating: activityType === "rated" ? Math.floor(Math.random() * 5) + 1 : undefined,
          })
        }
      }
    })

  // Sort activities by timestamp (newest first)
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function getRandomActivityType(): Activity["type"] {
  const types: Activity["type"][] = ["added_pin", "updated_pin", "commented", "rated", "shared_pin", "became_friends"]

  return types[Math.floor(Math.random() * types.length)]
}

function getRandomFriendId(user: User, excludeId: string): string {
  const friends = user.friends.filter((friend) => friend.id !== excludeId)
  if (friends.length === 0) return "user4" // Fallback

  return friends[Math.floor(Math.random() * friends.length)].id
}

function getRandomFriendName(user: User, excludeName: string): string {
  const friends = user.friends.filter((friend) => friend.name !== excludeName)
  if (friends.length === 0) return "Sam" // Fallback

  return friends[Math.floor(Math.random() * friends.length)].name
}

function getRandomComment(): string {
  const comments = [
    "Great place!",
    "I love this spot.",
    "Definitely worth checking out.",
    "The atmosphere is amazing.",
    "Highly recommended!",
    "Not as good as I expected.",
    "Perfect for a weekend visit.",
    "I go here all the time.",
    "Hidden gem!",
    "Can't wait to visit again.",
  ]

  return comments[Math.floor(Math.random() * comments.length)]
}

