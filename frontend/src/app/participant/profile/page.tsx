export const dynamic = "force-dynamic";
export const revalidate = 0;

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Globe, Briefcase, Mail, Phone, GraduationCap, MapPin, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { QuickProfileCreator } from "@/components/profile/QuickProfileCreator";
import { SkillExtractionStatus } from "@/components/profile/SkillExtractionStatus";

export default async function ParticipantProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/participant?mode=signin");
  }

  // Fetch participant data
  const { data: profile } = await supabase
    .from("participants")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[40px]">person_off</span>
        </div>
        <h1 className="text-[24px] font-bold text-on-surface mb-2">Profile Not Found</h1>
        <p className="text-on-surface-variant mb-6 text-center max-w-md">
          You haven't completed the onboarding process yet. You can complete the full onboarding, or instantly generate a profile from your resume below.
        </p>
        
        <Link href="/onboarding/participant">
          <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors w-full max-w-md">
            Complete Full Onboarding
          </button>
        </Link>

        <div className="flex items-center gap-4 w-full max-w-md my-6">
            <div className="h-px bg-outline-variant/30 flex-1"></div>
            <span className="text-on-surface-variant text-[13px] font-bold uppercase tracking-widest">OR</span>
            <div className="h-px bg-outline-variant/30 flex-1"></div>
        </div>

        <QuickProfileCreator />
      </div>
    );
  }

  // Parse skill vector for display
  let topSkills: [string, number][] = [];
  try {
    // Supabase pgvector JSONB fields often come back as parsed arrays
    if (profile.skill_vector && typeof profile.skill_vector === 'object') {
      if (Array.isArray(profile.skill_vector)) {
        // If it's a vector array [0.1, 0.2] it doesn't have labels. 
        // We'll just show declared_skills instead if skill_vector is an array.
      } else {
        // If it's a map {"React": 0.9}
        topSkills = Object.entries(profile.skill_vector)
          .filter((a: any) => a[1] > 0)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 10) as [string, number][];
      }
    }
  } catch (e) {
    console.error("Error parsing skills", e);
  }

  const getInitials = (name: string) => name ? name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-primary tracking-tight">Your Profile</h1>
        <p className="text-on-surface-variant text-[16px] mt-1">Manage your professional identity and skills.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[36px] font-bold shadow-inner mb-4">
              {getInitials(profile.name)}
            </div>
            <h2 className="text-[24px] font-bold text-on-surface">{profile.name}</h2>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-[12px] font-bold rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
              {profile.status}
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30">
            <h3 className="font-bold text-[16px] mb-4 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">contact_mail</span>
              Contact Info
            </h3>
            <div className="space-y-4">
              {profile.email && (
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Mail className="w-5 h-5 text-primary/60" />
                  <span className="text-[14px] font-medium">{profile.email}</span>
                </div>
              )}
              {profile.gender && (
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <User className="w-5 h-5 text-primary/60" />
                  <span className="text-[14px] font-medium">{profile.gender}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Phone className="w-5 h-5 text-primary/60" />
                  <span className="text-[14px] font-medium">{profile.phone}</span>
                </div>
              )}
              {profile.github_url && (
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Globe className="w-5 h-5 text-primary/60" />
                  <Link href={profile.github_url} target="_blank" className="text-[14px] font-medium hover:text-primary transition-colors underline-offset-4 hover:underline">
                    {profile.github_url.replace("https://github.com/", "")}
                  </Link>
                </div>
              )}
              {profile.linkedin_url && (
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Briefcase className="w-5 h-5 text-primary/60" />
                  <Link href={profile.linkedin_url} target="_blank" className="text-[14px] font-medium hover:text-primary transition-colors underline-offset-4 hover:underline">
                    LinkedIn Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Education & Skills */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm">
            <h3 className="font-bold text-[20px] mb-6 text-on-surface flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              Education
            </h3>
            
            <div className="flex items-start gap-4 p-4 bg-surface-container-low rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div>
                <h4 className="font-bold text-[18px] text-on-surface">{profile.college_name || "Not Specified"}</h4>
                <p className="text-on-surface-variant text-[14px] font-medium mt-1">
                  Participant • Current Student
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0" />
            
            <h3 className="font-bold text-[20px] mb-6 text-on-surface flex items-center gap-2 relative z-10">
              <Sparkles className="w-6 h-6 text-primary" />
              AI Verified Skills
            </h3>
            
            <p className="text-[14px] text-on-surface-variant mb-6 relative z-10">
              These skills were automatically extracted and mapped from your provided resume. They are used to match you with hackathons and teammates.
            </p>

            <div className="space-y-6 relative z-10">
              {/* Show extracted parsed skills first */}
              {profile.declared_skills && profile.declared_skills.length > 0 ? (
                <div>
                  <h4 className="text-[12px] uppercase tracking-widest font-bold text-on-surface-variant mb-3">Extracted Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.declared_skills.map((skill: string, index: number) => (
                      <span key={index} className="px-3 py-1.5 bg-primary/10 text-primary text-[13px] font-bold rounded-lg border border-primary/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Show AI categorization below */}
              {topSkills.length > 0 ? (
                <div className="pt-4 border-t border-outline-variant/20">
                  <h4 className="text-[12px] uppercase tracking-widest font-bold text-on-surface-variant mb-4">AI Category Matching</h4>
                  <div className="space-y-4">
                    {topSkills.map(([skill, weight]) => (
                      <div key={skill} className="flex items-center gap-4">
                        <div className="w-32 shrink-0 font-bold text-[13px] uppercase tracking-wider text-on-surface-variant">
                          {skill.replace('_', ' ')}
                        </div>
                        <div className="flex-1 h-3 bg-surface-container-high rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000"
                            style={{ width: `${weight * 100}%` }}
                          />
                        </div>
                        <div className="w-10 text-right font-bold text-[13px] text-primary">
                          {Math.round(weight * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : profile.skill_vector?.status === 'processing' ? (
                <SkillExtractionStatus userId={profile.user_id} />
              ) : (
                !profile.declared_skills?.length && (
                  <div className="text-on-surface-variant text-[14px] italic">No skills listed or extracted.</div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
