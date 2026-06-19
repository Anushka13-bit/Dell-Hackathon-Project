import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-surface p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-6 text-on-surface">Documentation</h1>
        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <p className="text-on-surface-variant leading-relaxed mb-6">
            Welcome to the HackOS Documentation. We're currently building out our comprehensive guide on how to integrate and deploy hackathons using our AI-driven OS.
          </p>
          <div className="p-4 bg-primary/10 rounded-xl text-primary font-medium">
            Full documentation is coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}
