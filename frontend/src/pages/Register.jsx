import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/index.js';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--navy)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: 380, background: 'var(--navy-2)',
        border: '1px solid var(--border)', borderRadius: 16, padding: 36
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, background: 'var(--gold-dim)',
            border: '1px solid rgba(201,168,76,0.3)', borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: 24
          }}>🎓</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--cream)', marginBottom: 4 }}>Create Account</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Join Campus Services today</div>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'FULL NAME', key: 'name', type: 'text', placeholder: 'John Doe' },
            { label: 'EMAIL ADDRESS', key: 'email', type: 'email', placeholder: 'you@campus.com' },
            { label: 'PASSWORD', key: 'password', type: 'password', placeholder: '••••••••' },
            { label: 'PHONE NUMBER', key: 'phone', type: 'tel', placeholder: '+237 6XX XXX XXX' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{label}</label>
              <input
                type={type}
                required
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                style={{
                  width: '100%', background: 'var(--navy-3)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff',
                  fontFamily: 'var(--font-body)', outline: 'none'
                }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: '100%', background: 'var(--gold)', color: 'var(--navy)',
            border: 'none', padding: 11, borderRadius: 8, fontSize: 13,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: 6
          }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--gold-light)', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}