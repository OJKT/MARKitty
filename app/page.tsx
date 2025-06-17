'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to BriefGEN</h1>
      <p className="text-lg text-gray-600 mb-8">Document Generation System</p>
      <button
        onClick={() => router.push('/briefgen')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Go to BriefGEN
      </button>
    </main>
  );
} 