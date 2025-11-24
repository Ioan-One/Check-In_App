import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center text-gray-900">Check-in Hermes</h1>
        <p className="text-xl text-center text-gray-600">
          QR Check-in app for events
        </p>

        <div className="flex gap-4">
          <Link
            href="/organizer"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Organizer Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
