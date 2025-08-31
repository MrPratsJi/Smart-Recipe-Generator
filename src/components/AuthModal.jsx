import React from 'react';
import { auth, provider } from '../services/firebase';
import { signInWithRedirect, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import './AuthModal.css';


const AuthModal = ({ onClose }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLogin, setIsLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
  await signInWithRedirect(auth, provider);
      onClose();
    } catch (error) {
      alert('Google login failed!');
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Welcome!</h2>
        <p>Sign up or log in to save your favorite recipes and more.</p>
        <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" />
          Continue with Google
        </button>
        <div className="divider">or</div>
        <form className="auth-form" onSubmit={handleEmailAuth}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ color: 'black' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ color: 'black' }} />
          <button type="submit" className="signup-btn" disabled={loading}>{isLogin ? 'Log In' : 'Sign Up'}</button>
        </form>
        <div style={{marginTop: '1rem'}}>
          <button style={{background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer'}} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
