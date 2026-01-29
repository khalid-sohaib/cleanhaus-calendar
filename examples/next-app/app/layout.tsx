import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar Example",
  description: "Next.js example using @khalid-sohaib/calendar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
