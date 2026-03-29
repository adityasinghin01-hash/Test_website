const BASE_URL = 'https://backend-z6cy.onrender.com'

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong.')
  }

  return data as T
}

// Contact
export async function submitContact(payload: {
  name: string
  email: string
  subject: string
  message: string
}) {
  return request('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Newsletter
export async function subscribeNewsletter(payload: { email: string }) {
  return request('/api/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Waitlist
export async function joinWaitlist(payload: { name: string; email: string }) {
  return request('/api/waitlist/join', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Blog
export interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt?: string
  author: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
  content?: string
}

export interface BlogListResponse {
  total: number
  page: number
  totalPages: number
  posts: BlogPost[]
}

export async function getBlogPosts(page = 1, limit = 10): Promise<BlogListResponse> {
  return request(`/api/blog?page=${page}&limit=${limit}`)
}

export async function getBlogPostBySlug(slug: string): Promise<{ post: BlogPost }> {
  return request(`/api/blog/${slug}`)
}
