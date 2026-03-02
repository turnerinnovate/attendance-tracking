'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
export default function LoginPage() {
  const [email, setEmail] = useState('admin@camptrack.local');
  const [password, setPassword] = useState('Password123!');
  return <div className="max-w-md mx-auto bg-white p-6 rounded border space-y-3"><h1 className="text-xl font-bold">CampTrack Login</h1>
    <input className="w-full border p-2" value={email} onChange={(e)=>setEmail(e.target.value)} />
    <input className="w-full border p-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
    <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={()=>signIn('credentials',{email,password,callbackUrl:'/staff/dashboard'})}>Sign In</button>
  </div>;
}
