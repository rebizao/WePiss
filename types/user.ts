export interface Friend {
  id: string
  name: string
  profilePicture: string
  status: "pending" | "accepted"
}

export interface User {
  id: string
  name: string
  description: string
  profilePicture: string
  friends: Friend[]
  createdAt: string
}

