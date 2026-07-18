import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4" dir="rtl">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
        
        <div className="text-center z-10 flex flex-col items-center">
          <motion.div 
            animate={{ 
              scale: [0.9, 1.1, 0.9],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          >
            <ShieldCheck size={48} />
          </motion.div>
          
          <h2 className="text-lg font-bold text-white mb-2 font-sans">
            مخزن الرموز الآمنة
          </h2>
          <p className="text-slate-400 text-xs mb-4">
            جاري تهيئة قناة الاتصال المشفرة...
          </p>

          {/* Loading bar */}
          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="relative h-full bg-gradient-to-r from-emerald-500 to-teal-500 w-1/2 rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard />
      ) : (
        <Login onLoginSuccess={() => {}} />
      )}
    </>
  );
}
