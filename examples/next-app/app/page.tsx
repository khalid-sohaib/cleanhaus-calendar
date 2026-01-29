import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Calendar Example</h1>
      <p>
        <Link href="/calendar">Open Calendar</Link>
      </p>
    </main>
  );
}
