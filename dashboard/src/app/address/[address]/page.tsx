'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Attestation {
  id: number;
  issuer: string;
  subject: string;
  schema_id: string;
  data: string;
  tx_hash: string;
  block_time: string;
}

export default function AddressDetail() {
  const params = useParams();
  const address = params.address as string;

  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAttestations() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/attestations/${address}`
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setAttestations(data);
      } catch (err) {
        setError('Could not load attestations for this address.');
      } finally {
        setLoading(false);
      }
    }

    if (address) fetchAttestations();
  }, [address]);

  return (
    <main className="min-h-screen p-12 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Attestations for</h1>
      <p className="text-sm text-gray-500 mb-8 break-all">{address}</p>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && attestations.length === 0 && (
        <p className="text-gray-500">No attestations found for this address.</p>
      )}

      <ul className="space-y-4">
        {attestations.map((a) => (
          <li key={a.id} className="border rounded p-4">
            <p className="font-semibold">{a.schema_id}</p>
            <p className="text-sm text-gray-500">Issuer: {a.issuer}</p>
            <p className="text-sm text-gray-500">
              {new Date(a.block_time).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}