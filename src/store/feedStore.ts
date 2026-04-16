import { create } from 'zustand'
import { Post } from '@/types/feed'

interface FeedStore {
  posts: Post[]
  isLoading: boolean
  hasMore: boolean
  cursor: string | null

  setPosts: (p: Post[]) => void
  prependPost: (p: Post) => void
  appendPosts: (p: Post[], newCursor: string | null) => void
  updatePost: (id: string, changes: Partial<Post>) => void
  setLoading: (v: boolean) => void
  setHasMore: (v: boolean) => void
}

export const useFeedStore = create<FeedStore>((set) => ({
  posts: [],
  isLoading: false,
  hasMore: true,
  cursor: null,

  setPosts: (p) => set({ posts: p }),
  prependPost: (p) => set((state) => ({ posts: [p, ...state.posts] })),
  appendPosts: (p, newCursor) => set((state) => ({
    posts: [...state.posts, ...p],
    cursor: newCursor,
    hasMore: p.length === 20,
  })),
  updatePost: (id, changes) => set((state) => ({
    posts: state.posts.map(p => p.id === id ? { ...p, ...changes } : p),
  })),
  setLoading: (v) => set({ isLoading: v }),
  setHasMore: (v) => set({ hasMore: v }),
}))
