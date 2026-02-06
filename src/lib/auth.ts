import { supabase } from './supabase'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'

// Create redirect URL using expo-linking
const redirectUrl = Linking.createURL('auth/callback')

// Sign up with email
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) {
    throw error
  }
  return data
}

// Sign in with email
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    throw error
  }
  return data
}

// Sign in with Google
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  })

  if (error) {
    throw error
  }

  if (!data?.url) {
    throw new Error('No OAuth URL received')
  }

  // Open the OAuth URL in the browser
  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    redirectUrl,
    {
      showInRecents: true,
    }
  )

  if (result.type === 'success' && result.url) {
    // Extract the tokens from the URL
    const url = new URL(result.url)

    // Tokens can be in hash (fragment) or search params
    let accessToken: string | null = null
    let refreshToken: string | null = null

    // Try hash first (fragment-based redirect)
    if (url.hash) {
      const hashParams = new URLSearchParams(url.hash.slice(1))
      accessToken = hashParams.get('access_token')
      refreshToken = hashParams.get('refresh_token')
    }

    // Try search params if not in hash
    if (!accessToken) {
      accessToken = url.searchParams.get('access_token')
      refreshToken = url.searchParams.get('refresh_token')
    }

    if (accessToken && refreshToken) {
      // Set the session with the tokens
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) {
        throw sessionError
      }

      return sessionData
    } else {
      throw new Error('No tokens found in redirect URL')
    }
  } else if (result.type === 'cancel') {
    throw new Error('Google sign in was cancelled')
  } else {
    throw new Error('Google sign in failed')
  }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

// Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Listen to auth changes
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}

// Delete account
// TODO: Implement account deletion
