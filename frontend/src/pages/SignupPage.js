import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';

const SignupPage = () => {
  const { signUp } = useFirebase();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      navigate('/dives');
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h2>Sign up</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Display name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign up'}</button>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
