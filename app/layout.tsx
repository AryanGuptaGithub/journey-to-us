import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Journey To Us ❤️",
  description: "A playable love letter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#1a0a2e", overflow: "hidden", width: "100vw", height: "100vh" }}>
        {children}
      </body>
    </html>
  );
}