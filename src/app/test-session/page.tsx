'use client';

import { useState, useEffect } from 'react';

export default function TestSessionPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        console.log('Full response:', response);
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
        setSessionData(data);
      } catch (err) {
        console.error('Error checking session:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <div>Loading session data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Session Data:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>

        {sessionData?.success && (
          <div>
            <h2 className="text-lg font-semibold">User Permissions:</h2>
            <ul className="list-disc pl-5">
              {sessionData.data.user.permissions.map((permission: string) => (
                <li key={permission}>{permission}</li>
              ))}
            </ul>
          </div>
        )}

        {!sessionData?.success && (
          <div className="text-red-600">
            <p>Session check failed: {sessionData?.error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 