export type ReakceTyp = 'skull' | 'fire' | 'clown' | 'chart'

export interface Post {
  id: string
  avatarId: string
  authorName: string
  seasonId: string
  content: string
  reactionScore: number
  commentCount: number
  isBoosted: boolean
  createdAt: string
  reactions?: ReakceSouhrnna[]
  moje_reakce?: ReakceTyp[]
}

export interface ReakceSouhrnna {
  type: ReakceTyp
  count: number
  weight: number
}

export interface Komentar {
  id: string
  postId: string
  parentId: string | null
  avatarId: string
  authorName: string
  depth: number
  content: string
  createdAt: string
  replies?: Komentar[]
}

export interface Reakce {
  id: string
  postId: string
  avatarId: string
  reactionType: ReakceTyp
  weight: number
  createdAt: string
}
