import { useState } from 'react';
import { PartyPopper, ArrowRight, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://idena-raffle-draw.onrender.com/api';

export default function Landing() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [raffleNumber, setRaffleNumber] = useState('');
  const [isExisting, setIsExisting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/raffle/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setRaffleNumber(data.number);
      setIsExisting(data.isExisting);
      setMessage(data.message);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
        
        {/* Success State */}
        {status === 'success' ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="mx-auto w-20 h-20 bg-magenta/10 rounded-full flex items-center justify-center">
              <PartyPopper className="w-10 h-10 text-magenta" />
            </div>
            
            <div>
              <h2 className="text-3xl font-serif text-magenta mb-2">
                {isExisting ? "Welcome Back!" : "You're In!"}
              </h2>
              <p className="text-ink/70">
                {isExisting 
                  ? "You already have a raffle number. Here it is:"
                  : "We've generated your official raffle number:"}
              </p>
            </div>

            <div className="text-5xl font-bold font-serif text-magenta bg-white/50 py-4 px-6 rounded-xl border border-magenta/20 shadow-inner">
              {raffleNumber}
            </div>
            
            {!isExisting && (
              <p className="text-ink/80 text-sm mt-4">
                You will only see this number again if you use the same email address. Please keep it safe!
              </p>
            )}

            <button 
              onClick={() => {
                setStatus('idle');
                setName('');
                setEmail('');
              }}
              className="w-full mt-4 py-3 bg-white hover:bg-pink-50 text-magenta border-2 border-magenta rounded-xl font-medium transition-colors"
            >
              Register Another Person
            </button>
          </div>
        ) : (
          /* Form State */
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-serif text-magenta mb-2 tracking-tight flex items-center justify-center gap-2">
                <img src="/celebration.png" alt="Celebration" className="w-10 h-10 inline-block -mt-1 mix-blend-multiply" />
                Welcome to the IDENA Giveaway
              </h1>
              <p className="text-ink/70">
                Enter your details to generate your unique raffle number and join the giveaway.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Full Name</label>
                <input 
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta/50 transition-all placeholder:text-ink/30"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1">Email Address</label>
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta/50 transition-all placeholder:text-ink/30"
                  placeholder="jane@example.com"
                />
              </div>

              {status === 'error' && (
                <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-xl border border-red-100">
                  {message}
                </div>
              )}

              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 bg-magenta hover:bg-[#c92572] text-white rounded-xl font-medium shadow-lg shadow-magenta/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2 group"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Generate My Raffle Number
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="mt-8 text-center bg-white/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/50 shadow-sm">
        <p className="text-sm font-medium">
          Haven't registered for the webinar yet?{' '}
          <a href="https://idena.vercel.app" target="_blank" rel="noreferrer" className="text-magenta hover:underline inline-flex items-center gap-1">
            Register here <ArrowRight className="w-3 h-3" />
          </a>
        </p>
      </div>
    </div>
  );
}
