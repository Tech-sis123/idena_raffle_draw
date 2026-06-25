import { useState, useEffect } from 'react';
import { Download, Users, Trophy, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function Admin() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [participants, setParticipants] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);
  const [error, setError] = useState('');

  const fetchParticipants = async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/participants`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (!res.ok) throw new Error('Invalid Admin Key');
      const data = await res.json();
      setParticipants(data.participants);
      setCount(data.count);
      setIsAuthenticated(true);
      setError('');
    } catch (err: any) {
      setError(err.message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParticipants(adminKey);
  };

  const handleDraw = async (drawCount: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/draw`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}` 
        },
        body: JSON.stringify({ count: drawCount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setWinners(data.winners);
      // Refresh list to show updated isWinner statuses
      fetchParticipants(adminKey);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/export`, {
        headers: { Authorization: `Bearer ${adminKey}` }
      });
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'participants.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
          <h2 className="text-2xl font-serif text-magenta mb-4 text-center">Admin Access</h2>
          <input 
            type="password"
            placeholder="Enter Admin Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-magenta text-white py-2 rounded-lg font-medium">
            {loading ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto space-y-8 relative z-10">
      
      <div className="flex justify-between items-center bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
        <div>
          <h1 className="text-3xl font-serif text-magenta flex items-center gap-2">
            Admin Dashboard
          </h1>
          <p className="text-ink/60 mt-1 flex items-center gap-2">
            <Users className="w-4 h-4" /> Total Participants: <strong>{count}</strong>
          </p>
        </div>
        
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white text-ink border border-line rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Draw Controls */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white">
            <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Pick Winners
            </h2>
            <div className="space-y-3">
              <button onClick={() => handleDraw(1)} disabled={loading} className="w-full py-2 bg-magenta text-white rounded-lg hover:bg-[#c92572]">
                Draw 1 Winner
              </button>
              <button onClick={() => handleDraw(5)} disabled={loading} className="w-full py-2 bg-magenta/10 text-magenta rounded-lg hover:bg-magenta/20 border border-magenta/20">
                Draw Top 5
              </button>
              <button onClick={() => handleDraw(10)} disabled={loading} className="w-full py-2 bg-magenta/10 text-magenta rounded-lg hover:bg-magenta/20 border border-magenta/20">
                Draw Top 10
              </button>
            </div>
          </div>

          {/* Winner Display */}
          {winners.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-md border border-yellow-200 animate-in slide-in-from-left">
              <h3 className="text-lg font-serif text-yellow-800 mb-3 flex items-center gap-2">
                🏆 Latest Winners
              </h3>
              <ul className="space-y-2">
                {winners.map((w, i) => (
                  <li key={w.id} className="bg-white px-3 py-2 rounded border border-yellow-100 flex justify-between items-center shadow-sm">
                    <span className="font-medium text-ink">{w.name}</span>
                    <span className="font-serif text-magenta">{w.number}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Participants Table */}
        <div className="md:col-span-2 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white overflow-hidden">
          <div className="p-6 border-b border-line flex justify-between items-center">
            <h2 className="text-xl font-serif">All Participants</h2>
            <button onClick={() => fetchParticipants(adminKey)} className="text-sm text-magenta hover:underline">
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/5 text-sm">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Number</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {participants.map(p => (
                  <tr key={p.id} className="hover:bg-white/50">
                    <td className="p-4">{p.name}</td>
                    <td className="p-4">{p.email}</td>
                    <td className="p-4 font-serif text-magenta">{p.number}</td>
                    <td className="p-4 text-ink/60">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {p.isWinner ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Winner</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Eligible</span>
                      )}
                    </td>
                  </tr>
                ))}
                {participants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-ink/50">
                      No participants yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
