export interface Comment {
  id: string
  userId: string
  userName: string
  text: string
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
  media: string[]
  userId: string
  userName: string
  isPublic: boolean
  createdAt: string
}

