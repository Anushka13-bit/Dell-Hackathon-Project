import { redirect } from "next/navigation";

export default async function IndividualHackathonRedirect({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  // Redirect to the analytics page as the default overview
  redirect(`/organizer/hackathons/${resolvedParams.id}/analytics`);
}
