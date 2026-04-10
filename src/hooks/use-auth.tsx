import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useCallback,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  role: 'ADMIN' | 'MANAGER'
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleActivity = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (session) {
      timeoutRef.current = setTimeout(
        async () => {
          console.log('Inactivity timeout reached (30 min). Logging out...')
          await supabase.auth.signOut()
        },
        30 * 60 * 1000,
      ) // 30 minutes
    }
  }, [session])

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (data) {
        setProfile(data as UserProfile)
      } else {
        // Fallback: Create profile proactively if it's missing
        const newRole = currentUser.email === 'thiagomnaves@yahoo.com.br' ? 'ADMIN' : 'MANAGER'
        const { data: newData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            email: currentUser.email!,
            role: newRole,
          })
          .select()
          .maybeSingle()

        if (newData) {
          setProfile(newData as UserProfile)
        } else {
          console.warn('Could not auto-create profile in DB, using fallback.', insertError)
          // Robust fallback so the UI never locks up on RoleGuard
          setProfile({ id: currentUser.id, email: currentUser.email!, role: newRole })
        }
      }
    } catch (err) {
      console.error('Exception fetching profile:', err)
      // Final failsafe
      setProfile({
        id: currentUser.id,
        email: currentUser.email || '',
        role: 'MANAGER',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Sync update only inside this callback block
      setSession(session)
      setUser(session?.user ?? null)

      if (!session) {
        setProfile(null)
        setLoading(false)
      } else {
        setLoading(true)
        fetchProfile(session.user)
      }
    })

    const initSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error('Session error:', error)
          if (error.message?.includes('Failed to fetch')) {
            console.warn('Network error fetching session, preserving state temporarily')
          } else {
            setSession(null)
            setUser(null)
            setProfile(null)
          }
          setLoading(false)
          return
        }
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user)
        } else {
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Exception getting session:', err)
        const msg = err?.message || ''
        if (!msg.includes('Failed to fetch')) {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    }

    initSession()

    return () => subscription.unsubscribe()
  }, [])

  // Auto-logout effect on inactivity
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll']

    if (session) {
      events.forEach((evt) => document.addEventListener(evt, handleActivity))
      handleActivity() // Start the timer immediately upon session
    }

    return () => {
      events.forEach((evt) => document.removeEventListener(evt, handleActivity))
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [session, handleActivity])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
