import RegistrationIntelligenceModule from "@/components/registrations/RegistrationIntelligenceModule";
import { fetchRegistrations } from "@/app/actions/registration";

export default async function HackathonRegistrationsPage() {
  const registrations = await fetchRegistrations();

  return (
    <RegistrationIntelligenceModule
      title="Winter 2024 Registrations"
      subtitle="Review duplicate-risk decisions, FaceScan status, and explainable registration pipeline signals."
      initialRegistrations={registrations}
    />
  );
}
