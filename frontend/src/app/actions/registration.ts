'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import {
  type RegistrationCase,
  computeWeightedScore,
  getDecisionForRegistration,
} from '@/components/registrations/registrationIntelligenceModel'

export type SubmitRegistrationPayload = {
  name: string
  email: string
  college: string
  github: string
  gender: string
  skills?: string[]
  hackathon_id?: string
  faceScanConsented?: boolean
  faceScanStatus?: RegistrationCase['faceScan']['status']
  faceScanScore?: number | null
  skill_vector?: Record<string, number>
  raw_text?: string
}

// Note: In a real environment, you'd perform FaceScan/RapidFuzz calls here.
// For now, we simulate the "intelligence" using the frontend model logic.
export async function submitRegistration(payload: SubmitRegistrationPayload) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 1. Generate Intelligence Decision
  // We mock exactSignals and similarity based on the PRD for this participant
  const intelligencePayload: RegistrationCase = {
    id: 'pending',
    name: payload.name,
    email: payload.email,
    college: payload.college,
    github: payload.github,
    submittedAt: new Date().toISOString(),
    decision: 'AUTO_APPROVED',
    score: 0,
    matchedProfile: 'No close match',
    matchedProfileNote: 'Pending deterministic duplicate scan.',
    initials: payload.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase(),
    skills: payload.skills || [],
    exactSignals: {
      email: false,
      phone: false,
      github: false,
    },
    similarity: {
      name: Math.random() * 0.3, // Mock low similarity
      college: Math.random() * 0.3,
    },
    deviceMatch: false,
    ipSubnetMatch: false,
    faceScan: {
      status: payload.faceScanStatus ?? 'verified',
      score: payload.faceScanScore ?? 0.95,
      consented: payload.faceScanConsented ?? true,
      dataDeletedAt: new Date().toISOString(),
    },
    recommendation: 'Pending deterministic duplicate scan.',
  }

  const decision = getDecisionForRegistration(intelligencePayload)
  const score = computeWeightedScore(intelligencePayload)

  // 2. Persist to Supabase Registrations
  let registrationId = crypto.randomUUID()
  const dbPayload = {
    id: registrationId,
    user_id: user.id,
    name: payload.name,
    email: payload.email,
    college: payload.college,
    github: payload.github,
    gender: payload.gender,
    skills: payload.skills || [],
    
    decision: decision,
    score: score,
    
    exact_email: false,
    exact_phone: false,
    exact_github: false,
    
    sim_name: intelligencePayload.similarity.name,
    sim_college: intelligencePayload.similarity.college,
    
    device_match: false,
    ip_subnet_match: false,
    
    face_scan_status: intelligencePayload.faceScan.status,
    face_scan_score: intelligencePayload.faceScan.score,
    face_scan_consented: intelligencePayload.faceScan.consented,
    
    recommendation: `Server generated decision: ${decision}`
  }

  // Check if they already have a registration
  const { data: existingReg } = await supabase.from('registrations').select('id, decision').eq('user_id', user.id).single()

  if (existingReg) {
    registrationId = existingReg.id
    // If they already have a registration, we just update the decision and score
    await supabase.from('registrations').update({
      skills: payload.skills || [],
      decision: decision,
      score: score,
    }).eq('id', registrationId)
  } else {
    console.log("Attempting to insert registration:", dbPayload);
    const { error: regError } = await supabase.from('registrations').insert(dbPayload)

    if (regError) {
      console.error('Registration insertion failed (RLS or DB Error):', regError)
      return { success: false, error: regError.message }
    }
    console.log("Registration inserted successfully.");
  }

  // 3. If AUTO_APPROVED, create Participant Record
  if (decision === 'AUTO_APPROVED') {
    const participantPayload = {
      user_id: user.id,
      registration_id: registrationId,
      name: payload.name,
      email: payload.email,
      college_name: payload.college,
      github_url: payload.github,
      gender: payload.gender,
      declared_skills: payload.skills || [],
      skill_vector: payload.raw_text ? { status: "processing" } : (payload.skill_vector || {}),
      status: 'approved'
    }

    // Check if participant exists
    const { data: existingPart } = await supabase.from('participants').select('id').eq('user_id', user.id).single()

    if (existingPart) {
      await supabase.from('participants').update({
        declared_skills: payload.skills || [],
        skill_vector: payload.raw_text ? { status: "processing" } : (payload.skill_vector || {}),
        status: 'approved'
      }).eq('user_id', user.id)
    } else {
      const { error: partError } = await supabase.from('participants').insert(participantPayload)
      if (partError) {
        console.error('Participant creation failed:', partError)
        return { success: false, error: 'Failed to create participant profile: ' + partError.message }
      }
    }
    
    if (payload.raw_text) {
      // Trigger background LLM parsing, await it to prevent Next.js from cancelling it
      try {
        const r = await fetch('http://127.0.0.1:8000/participants/process_resume_background', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, raw_text: payload.raw_text })
        });
        if (!r.ok) console.error("Background LLM trigger returned:", r.status);
      } catch (e) {
        console.error("Background LLM trigger failed:", e);
      }
    }
  }

  return { success: true, decision }
}

export async function fetchRegistrations() {
  const supabase = await createClient()

  // For organizers
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching registrations:', error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : 'No data')
    return []
  }

  // Map flat DB rows to nested RegistrationCase interface
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    college: row.college,
    github: row.github,
    submittedAt: new Date(row.submitted_at).toLocaleString(),
    decision: row.decision,
    score: row.score,
    matchedProfile: row.matched_profile || 'No close match',
    matchedProfileNote: row.matched_profile_note || 'No review notes.',
    initials: row.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
    skills: row.skills || [],
    exactSignals: {
      email: row.exact_email,
      phone: row.exact_phone,
      github: row.exact_github,
    },
    similarity: {
      name: row.sim_name,
      college: row.sim_college,
    },
    deviceMatch: row.device_match,
    ipSubnetMatch: row.ip_subnet_match,
    faceScan: {
      status: row.face_scan_status,
      score: row.face_scan_score,
      consented: row.face_scan_consented,
      dataDeletedAt: row.face_scan_deleted_at,
    },
    recommendation: row.recommendation,
  }))
}

import { revalidatePath } from 'next/cache'

export async function createDirectProfile(payload: SubmitRegistrationPayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  let registrationId = crypto.randomUUID()
  
  // 1. Insert Registration (Bypass intelligence for direct creation)
  const dbPayload = {
    id: registrationId,
    user_id: user.id,
    name: payload.name || user.email?.split('@')[0] || "Unknown",
    email: payload.email || user.email,
    college: payload.college || "N/A",
    github: payload.github || "N/A",
    gender: payload.gender || "Prefer not to say",
    skills: payload.skills || [],
    decision: 'AUTO_APPROVED',
    score: 0.1,
    exact_email: false, exact_phone: false, exact_github: false,
    sim_name: 0.1, sim_college: 0.1,
    device_match: false, ip_subnet_match: false,
    face_scan_status: 'verified',
    face_scan_score: 0.9,
    face_scan_consented: true,
    recommendation: 'Direct profile creation fallback'
  }

  const { error: regError } = await supabase.from('registrations').insert(dbPayload)
  if (regError) {
    // If it exists, that's fine, we will just proceed
    if (regError.code !== '23505') {
      console.error("Direct registration failed:", regError);
      return { success: false, error: regError.message }
    }
  }

  // 2. Insert Participant
  const participantPayload = {
    user_id: user.id,
    registration_id: registrationId,
    name: dbPayload.name,
    email: dbPayload.email,
    college_name: dbPayload.college,
    github_url: dbPayload.github,
    gender: dbPayload.gender,
    declared_skills: payload.skills || [],
    skill_vector: payload.raw_text ? { status: "processing" } : (payload.skill_vector || {}),
    status: 'approved'
  }

  const { error: partError } = await supabase.from('participants').insert(participantPayload)
  if (partError && partError.code !== '23505') {
    console.error("Direct participant failed:", partError);
    return { success: false, error: partError.message }
  }

  // 3. Trigger Background AI Task
  if (payload.raw_text) {
    try {
      fetch('http://127.0.0.1:8000/participants/process_resume_background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, raw_text: payload.raw_text })
      }).catch(e => console.error("Background trigger failed:", e));
    } catch (e) {}
  }

  revalidatePath('/participant/profile');
  return { success: true }
}
