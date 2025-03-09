export interface Comment {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: string
  userProfilePicture?: string
}

export interface Like {
  userId: string
  userName: string
  createdAt: string
}

export interface Pin {
  id: string
  latitude: number
  longitude: number
  title: string
  description: string
  rating: number
  comments: Comment[]
  likes: Like[]
  media: string[]
  userId: string
  userName: string
  userProfilePicture?: string
  isPublic: boolean
  visibility: "private" | "friends" | "public"
  createdAt: string
}

