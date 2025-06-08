import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "Valorant Missions - Gamified Player Challenges",
  description: "Complete missions and challenges based on your Valorant gameplay statistics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
