import { useState } from 'react';
import { Button } from '../ui/Button/Button';
import { Modal } from '../ui/Modal/Modal';
import { Input } from '../ui/Input/Input';
import { authService } from '../services/authService';

export const UserAuth: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignup) {
        await authService.signUp(formData.email, formData.password, formData.displayName);
      } else {
        await authService.signIn(formData.email, formData.password);
      }
      setIsLoginModalOpen(false);
      setFormData({ email: '', password: '', displayName: '' });
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authService.signInWithGoogle();
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsLoginModalOpen(true)}
        icon="sign-in-alt"
      >
        Login
      </Button>

      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title={isSignup ? 'Create Account' : 'Welcome Back'}
      >
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignup && (
            <Input
              label="Full Name"
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              required
            />
          )}
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
          
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required
          />
          
          <Button 
            type="submit" 
            loading={loading}
            className="w-full"
          >
            {isSignup ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            icon="google"
            className="w-full"
          >
            Continue with Google
          </Button>
        </div>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-indigo-600 hover:text-indigo-700 text-sm"
          >
            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </Modal>
    </>
  );
};
