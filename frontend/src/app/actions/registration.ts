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
  degree: string
  github: string
  gender: string
  phone: string
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

  // Call the new FastAPI endpoint for duplicate detection and registration persistence
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let decision = 'MANUAL_REVIEW';
  let registrationId = null;

  try {
    const res = await fetch(`${apiUrl}/organizer/registrations/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id,
        name: payload.name,
        email: payload.email,
        college: payload.college,
        degree: payload.degree,
        github: payload.github,
        gender: payload.gender,
        phone: payload.phone,
        skills: payload.skills || []
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('FastAPI registration submit failed:', errorText);
      return { success: false, error: 'Backend validation failed' };
    }

    const data = await res.json();
    decision = data.decision;
    registrationId = data.registration_id;
  } catch (error) {
    console.error('Failed to reach FastAPI backend:', error);
    return { success: false, error: 'Backend unreachable' };
  }

  // 2. If AUTO_APPROVED, trigger Background AI Task
  if (decision === 'AUTO_APPROVED' && payload.raw_text) {
    try {
      const r = await fetch(`${apiUrl}/participants/process_resume_background`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, raw_text: payload.raw_text })
      });
      if (!r.ok) console.error("Background LLM trigger returned:", r.status);
    } catch (e) {
      console.error("Background LLM trigger failed:", e);
    }
  }

  return { success: true, decision }
}

export async function fetchRegistrations() {
  const supabase = await createAdminClient()

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
    degree: payload.degree || "N/A",
    github: payload.github || "N/A",
    gender: payload.gender || "Prefer not to say",
    phone: payload.phone || "N/A",
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

  const { data: existingReg } = await supabase.from('registrations').select('id').eq('user_id', user.id).single()

  if (existingReg) {
    registrationId = existingReg.id
    const { id, ...updatePayload } = dbPayload
    const { error: updateRegError } = await supabase.from('registrations').update(updatePayload).eq('id', registrationId)
    if (updateRegError) {
      console.error("Direct registration update failed:", updateRegError);
      return { success: false, error: updateRegError.message }
    }
  } else {
    const { error: regError } = await supabase.from('registrations').insert(dbPayload)
    if (regError) {
      if (regError.code !== '23505') {
        console.error("Direct registration failed:", regError);
        return { success: false, error: regError.message }
      } else {
        // 23505: Unique constraint violation (either user_id or email)
        const adminSupabase = await createAdminClient()
        const { data: dupReg } = await adminSupabase.from('registrations')
            .select('id')
            .or(`user_id.eq.${user.id},email.eq.${dbPayload.email}`)
            .limit(1)
            .single()
            
        if (dupReg) {
            registrationId = dupReg.id
            const { id, ...updatePayload } = dbPayload
            await adminSupabase.from('registrations').update(updatePayload).eq('id', registrationId)
        } else {
            console.error("Direct registration unique constraint violation but no existing record found.");
            return { success: false, error: "Unique constraint violation" }
        }
      }
    }
  }

  // 2. Insert Participant
  const participantPayload = {
    id: user.id,
    user_id: user.id,
    registration_id: registrationId,
    name: dbPayload.name,
    email: dbPayload.email,
    college_name: dbPayload.college,
    degree: dbPayload.degree,
    github_url: dbPayload.github,
    gender: dbPayload.gender,
    phone: dbPayload.phone,
    declared_skills: payload.skills || [],
    skill_vector: payload.raw_text ? { status: "processing" } : (payload.skill_vector || {}),
    status: 'approved'
  }

  const { data: existingPart } = await supabase.from('participants').select('id').eq('user_id', user.id).single()

  if (existingPart) {
    const { error: partUpdateError } = await supabase.from('participants').update({
      name: participantPayload.name,
      email: participantPayload.email,
      college_name: participantPayload.college_name,
      degree: participantPayload.degree,
      github_url: participantPayload.github_url,
      gender: participantPayload.gender,
      phone: participantPayload.phone,
      declared_skills: participantPayload.declared_skills,
      skill_vector: participantPayload.skill_vector,
      status: participantPayload.status
    }).eq('user_id', user.id)
    if (partUpdateError) {
      console.error("Direct participant update failed:", partUpdateError);
      return { success: false, error: partUpdateError.message }
    }
  } else {
    const { error: partError } = await supabase.from('participants').insert(participantPayload)
    if (partError && partError.code !== '23505') {
      console.error("Direct participant failed:", partError);
      return { success: false, error: partError.message }
    }
  }

  // 3. Trigger Background AI Task
  if (payload.raw_text) {
    try {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/participants/process_resume_background`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, raw_text: payload.raw_text })
      }).catch(e => console.error("Background trigger failed:", e));
    } catch (e) {}
  }

  revalidatePath('/participant/profile');
  return { success: true }
}
