'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [address, setAddress] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      router.push(`/address/${address.trim()}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">Attestation Explorer</h1>
      <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter a Stellar address"
          className="flex-1 border border-gray-300 rounded px-4 py-2"
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>
    </main>
  );
}