import { getAccessToken, getRefreshToken, saveTokens, clearAuth } from '@/lib/auth'

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

// Auto-refresh wrapper — retries once with a new access token on 401
async function requestWithAuth<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const accessToken = getAccessToken()

  const makeRequest = (token: string | null) =>
    fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    })

  let res = await makeRequest(accessToken)

  // If 401, try to refresh the token and retry once
  if (res.status === 401) {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearAuth()
      if (typeof window !== 'undefined') window.location.href = '/login'
      throw new Error('Session expired. Please log in again.')
    }

    try {
      const refreshData = await request<{ accessToken: string; refreshToken: string }>(
        '/api/refresh-token',
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        }
      )
      saveTokens(refreshData.accessToken, refreshData.refreshToken)
      res = await makeRequest(refreshData.accessToken)
    } catch {
      clearAuth()
      if (typeof window !== 'undefined') window.location.href = '/login'
      throw new Error('Session expired. Please log in again.')
    }
  }

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

// Auth
export async function loginUser(payload: { email: string; password: string }) {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
export async function signupUser(payload: { name: string; email: string; password: string; recaptchaToken: string }) {
  return request('/api/signup', {
    method: 'POST',
    body: JSON.stringify({ ...payload, source: 'web' }),
  })
}
export async function logoutUser(refreshToken: string) {
  return request('/api/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}
export async function forgotPassword(payload: { email: string }) {
  return request('/api/password/forgot', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
export async function getUserProfile() {
  return requestWithAuth<any>('/api/profile')
}
export async function getUserDashboard() {
  return requestWithAuth<any>('/api/dashboard')
}
export async function refreshAccessToken(refreshToken: string) {
  return request('/api/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}
export async function googleLogin(idToken: string) {
  return request('/api/google-login', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })
}
