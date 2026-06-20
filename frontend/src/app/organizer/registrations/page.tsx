import RegistrationIntelligenceModule from "@/components/registrations/RegistrationIntelligenceModule";
import { fetchRegistrations } from "@/app/actions/registration";

export default async function GlobalRegistrationsPage() {
  const registrations = await fetchRegistrations();

  return (
    <RegistrationIntelligenceModule
      title="Global Registration Queue"
      subtitle="Review intelligence decisions across all your hackathons."
      initialRegistrations={registrations}
    />
  );
}
