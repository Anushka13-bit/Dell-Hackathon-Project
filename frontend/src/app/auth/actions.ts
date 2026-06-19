'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // To prevent errors when Supabase is not configured yet:
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("Supabase not configured, bypassing login for demo")
    return redirect('/participant/dashboard')
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/auth/participant?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/participant/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("Supabase not configured, bypassing signup for demo")
    return redirect('/onboarding/participant')
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data)

  if (error) {
    return redirect('/auth/participant?error=' + encodeURIComponent(error.message))
  }

  // If email confirmation is enabled in Supabase, session will be null
  if (signUpData.user && !signUpData.session) {
    return redirect('/auth/participant?error=' + encodeURIComponent("Please check your email to confirm your account before logging in. Or disable 'Confirm email' in Supabase settings."))
  }

  revalidatePath('/', 'layout')
  redirect('/onboarding/participant')
}

export async function loginOrganizer(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("Supabase not configured, bypassing login for demo")
    return redirect('/organizer/dashboard')
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/auth/organizer?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/organizer/dashboard')
}

export async function signupOrganizer(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("Supabase not configured, bypassing signup for demo")
    return redirect('/organizer/dashboard')
  }

  const { data: signUpData, error } = await supabase.auth.signUp({
    ...data,
    options: {
      data: {
        organization_name: formData.get('organization_name'),
        role: 'organizer',
      }
    }
  })

  if (error) {
    return redirect('/auth/organizer?error=' + encodeURIComponent(error.message))
  }

  if (signUpData.user && !signUpData.session) {
    return redirect('/auth/organizer?error=' + encodeURIComponent("Please check your email to confirm your account before logging in. Or disable 'Confirm email' in Supabase settings."))
  }

  revalidatePath('/', 'layout')
  redirect('/organizer/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return redirect('/')
  }
  
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
