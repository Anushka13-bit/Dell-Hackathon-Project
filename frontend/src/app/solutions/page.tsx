import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-surface p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-6 text-on-surface">Solutions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-primary-container p-8 rounded-3xl border border-outline-variant/30">
            <h2 className="text-2xl font-bold mb-4 text-on-primary-container">For Universities</h2>
            <p className="text-on-primary-container/80 leading-relaxed">
              Run campus-wide hackathons effortlessly with integrated student verification and automated judging.
            </p>
          </div>
          <div className="bg-secondary-container p-8 rounded-3xl border border-outline-variant/30">
            <h2 className="text-2xl font-bold mb-4 text-on-secondary-container">For Enterprises</h2>
            <p className="text-on-secondary-container/80 leading-relaxed">
              Source top talent through competitive coding challenges with our enterprise-grade AI matchmaking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
