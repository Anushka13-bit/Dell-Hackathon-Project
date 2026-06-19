import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HackOS Organizer Portal",
  description: "Modern hackathon management suite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body-md text-on-surface bg-background min-h-screen">
        {children}
      </body>
    </html>
  );
}
