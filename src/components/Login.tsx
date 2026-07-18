import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Mail, Lock, UserPlus, LogIn, Eye, EyeOff, ShieldAlert, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetMode, setResetMode] = useState(false);

  const getErrorMessageAr = (errCode: string) => {
    switch (errCode) {
      case 'auth/invalid-email':
        return 'البريد الإلكتروني غير صالح.';
      case 'auth/user-disabled':
        return 'تم إيقاف هذا الحساب.';
      case 'auth/user-not-found':
        return 'لا يوجد حساب بهذا البريد الإلكتروني.';
      case 'auth/wrong-password':
        return 'كلمة المرور غير صحيحة.';
      case 'auth/email-already-in-use':
        return 'البريد الإلكتروني مستخدم بالفعل.';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل).';
      case 'auth/missing-password':
        return 'الرجاء إدخال كلمة المرور.';
      case 'auth/invalid-credential':
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      default:
        return 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (resetMode) {
      if (!email) {
        setError('الرجاء إدخال البريد الإلكتروني أولاً.');
        setLoading(false);
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
        setResetMode(false);
      } catch (err: any) {
        setError(getErrorMessageAr(err.code));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('كلمات المرور غير متطابقة.');
        setLoading(false);
        return;
      }
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...');
        setTimeout(() => {
          onLoginSuccess();
        }, 1500);
      } catch (err: any) {
        setError(getErrorMessageAr(err.code));
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess();
      } catch (err: any) {
        setError(getErrorMessageAr(err.code));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('فشل تسجيل الدخول باستخدام Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col items-center justify-center p-4 selection:bg-amber-500/30 relative overflow-hidden" dir="rtl">
      {/* Elegant Dark Background Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 pointer-events-none" />
      
      {/* Elegant Amber Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        {/* App Branding */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex p-3 rounded-lg bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-black mb-4"
          >
            <ShieldCheck size={36} className="animate-pulse" />
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-2 leading-none tracking-tight">
            أمان-كود
          </h1>
          <p className="text-slate-400 text-sm">
            بوابة التشفير وتوليد الرموز الحصينة بدعم Firebase
          </p>
        </div>

        {/* Auth Card with #161616 Background */}
        <div className="bg-[#161616] border border-white/10 rounded-2xl p-8 shadow-2xl relative">
          <div className="flex mb-6 border-b border-white/5 pb-2">
            {!resetMode ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 pb-4 text-center font-bold text-sm transition-all duration-300 ${
                    !isSignUp 
                      ? 'text-white border-b-2 border-amber-500' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className={`flex-1 pb-4 text-center font-bold text-sm transition-all duration-300 ${
                    isSignUp 
                      ? 'text-white border-b-2 border-amber-500' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  إنشاء حساب
                </button>
              </>
            ) : (
              <div className="w-full flex justify-between items-center pb-2">
                <span className="text-white font-bold text-sm">إعادة تعيين كلمة المرور</span>
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-amber-500 hover:text-amber-400 transition"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-950/40 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-200 text-sm"
              >
                <ShieldAlert size={18} className="text-red-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-3 text-amber-200 text-sm"
              >
                <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-bold block">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pr-10 pl-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left transition-colors text-sm"
                />
              </div>
            </div>

            {!resetMode && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                      كلمة المرور
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setResetMode(true);
                          setError('');
                        }}
                        className="text-xs text-slate-500 hover:text-slate-400 transition"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pr-10 pl-11 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold block">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-10 pl-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-left transition-colors text-sm"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3.5 rounded-lg shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : resetMode ? (
                'إرسال رابط إعادة التعيين'
              ) : isSignUp ? (
                <>
                  <UserPlus size={18} />
                  <span>إنشاء حساب تشفير جديد</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>دخول إلى النظام</span>
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#161616] px-3 text-slate-500 tracking-wider">أو عن طريق</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-black/50 hover:bg-black border border-white/10 hover:border-white/20 text-white rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2.5 active:scale-95 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>تسجيل الدخول عبر Google</span>
          </button>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-600 mt-6 tracking-wide">
          جميع البيانات مشفرة محلياً وقبل إرسالها إلى قاعدة البيانات الآمنة.
        </p>
      </motion.div>
    </div>
  );
}
