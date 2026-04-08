import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../auth';
import { TrendingUp } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/');
    } else {
      setError('Invalid credentials. Try admin@tradeflow.demo / demo1234');
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <TrendingUp className="w-10 h-10 text-green-brand" />
            <h1 className="text-3xl font-bold text-white tracking-tight">TradeFlow</h1>
          </div>
          <p className="text-gray-400 text-sm">Automated Trading-as-a-Service</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-navy-800 border border-navy-600 rounded-xl p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tradeflow.demo"
              className="w-full px-3 py-2.5 bg-navy-700 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-brand text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="demo1234"
              className="w-full px-3 py-2.5 bg-navy-700 border border-navy-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-brand text-sm"
            />
          </div>
          {error && <p className="text-red-brand text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2.5 bg-green-brand text-navy-900 font-semibold rounded-lg hover:bg-green-brand/90 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <p className="text-center text-xs text-gray-500">
            Demo credentials: admin@tradeflow.demo / demo1234
          </p>
        </form>
      </div>
    </div>
  );
}
