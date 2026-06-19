import ParticipantSidebar from "@/components/ParticipantSidebar";

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-background min-h-screen font-body-md text-body-md">
      <ParticipantSidebar />
      <div className="flex-1 flex flex-col w-full pl-64 overflow-x-hidden">
        <main className="min-h-screen w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
