import RegistrationIntelligenceModule from "@/components/registrations/RegistrationIntelligenceModule";
import { fetchRegistrations } from "@/app/actions/registration";

export default async function HackathonRegistrationsPage() {
  const registrations = await fetchRegistrations();

  return (
    <RegistrationIntelligenceModule
      title="JUNE 2026 registrations"
      subtitle="Review duplicate-risk decisions, FaceScan status, and explainable registration pipeline signals."
      initialRegistrations={registrations}
    />
  );
}
