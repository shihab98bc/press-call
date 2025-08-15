
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, Auth } from 'firebase/auth';

interface AuthViewProps {
    auth: Auth;
}

const AuthView: React.FC<AuthViewProps> = ({ auth }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };
    
    return (
        <div className="flex-1 flex flex-col justify-center items-center w-full h-full p-4">
            <div className="w-full max-w-sm">
                <h1 className="text-[#005c97] text-5xl mb-8 text-center font-bold">Press Call</h1>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className="p-3 bg-[#2d3748] text-white rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#34B7F1] border-transparent"
                    />
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="p-3 bg-[#2d3748] text-white rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#34B7F1] border-transparent"
                    />
                    {error && <div role="alert" className="text-[#e91e63] text-center min-h-[1em] text-sm">{error}</div>}
                    <button type="submit" className="p-3 bg-[#008069] text-white border-none rounded-md text-base font-medium cursor-pointer hover:bg-opacity-90">
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                    <p
                        role="button"
                        className="text-center text-[#00a8e8] cursor-pointer underline"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setError('');
                          setEmail('');
                          setPassword('');
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && setIsLogin(!isLogin)}
                        tabIndex={0}
                    >
                        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AuthView;
