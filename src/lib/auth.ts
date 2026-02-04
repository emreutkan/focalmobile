import { supabase } from './supabase'


//sign up
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

//sign in
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

//sign out
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

//delete account
//TODO
