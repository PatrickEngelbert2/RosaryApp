import { PrayRosaryClient } from "@/components/rosary/PrayRosaryClient";

export default function CustomPrayPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <header className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-500">
          Pray My Rosary
        </p>
        <h1 className="mt-2 text-3xl font-bold text-blue-900">
          Follow your saved Rosary style
        </h1>
      </header>
      <PrayRosaryClient />
    </div>
  );
}
