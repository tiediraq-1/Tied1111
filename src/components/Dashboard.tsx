import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { SavedToken, GeneratorConfig } from '../types';
import { generateToken, evaluatePasswordStrength } from '../utils/generator';
import { motion, AnimatePresence } from 'motion/react';
import { 
  KeyRound, 
  Copy, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  LogOut, 
  ShieldCheck, 
  User, 
  FolderPlus, 
  FileText, 
  Sparkles,
  Info,
  Sliders,
  Database,
  Lock
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', labelAr: 'الكل', color: 'bg-slate-800 text-slate-300' },
  { id: 'social', labelAr: 'حسابات شخصية', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  { id: 'work', labelAr: 'العمل والمهام', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
  { id: 'games', labelAr: 'الألعاب والترفيه', color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' },
  { id: 'finance', labelAr: 'الخدمات المالية', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  { id: 'servers', labelAr: 'مواقع وخوادم', color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
  { id: 'other', labelAr: 'تصنيفات أخرى', color: 'bg-pink-500/10 text-pink-400 border border-pink-500/20' }
];

export default function Dashboard() {
  const [user, setUser] = useState(auth.currentUser);
  
  // Generator state
  const [config, setConfig] = useState<GeneratorConfig>({
    length: 24, // Matches 24 characters as requested by the user
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
  });
  const [currentToken, setCurrentToken] = useState('');
  const [copiedCurrent, setCopiedCurrent] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Vault saving state
  const [saveTitle, setSaveTitle] = useState('');
  const [saveCategory, setSaveCategory] = useState('social');
  const [saveNotes, setSaveNotes] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Saved tokens list state
  const [savedTokens, setSavedTokens] = useState<SavedToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [revealedTokens, setRevealedTokens] = useState<Record<string, boolean>>({});
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  
  // Modal / Confirm Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Toast Notification state
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');

  // Trigger token generation on mount or config change
  useEffect(() => {
    handleGenerate();
  }, [config]);

  // Read saved tokens from Firebase in real-time
  useEffect(() => {
    if (!user) return;

    setLoadingTokens(true);
    const q = query(
      collection(db, 'saved_tokens'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tokens: SavedToken[] = [];
      snapshot.forEach((doc) => {
        tokens.push({ id: doc.id, ...doc.data() } as SavedToken);
      });
      setSavedTokens(tokens);
      setLoadingTokens(false);
    }, (error) => {
      console.error("Error loading tokens from Firestore: ", error);
      setLoadingTokens(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleGenerate = () => {
    setRegenerating(true);
    const newToken = generateToken(config);
    setCurrentToken(newToken);
    setCopiedCurrent(false);
    setTimeout(() => setRegenerating(false), 300);
  };

  const copyToClipboard = (text: string, isCurrent: boolean, tokenId: string | null = null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isCurrent) {
      setCopiedCurrent(true);
      setToastText('تم نسخ الرمز المولد إلى الحافظة بنجاح! 📋');
      setShowToast(true);
      setTimeout(() => setCopiedCurrent(false), 2000);
    } else if (tokenId) {
      setCopiedTokenId(tokenId);
      setToastText('تم نسخ الرمز المخزن إلى الحافظة بنجاح! 📋');
      setShowToast(true);
      setTimeout(() => setCopiedTokenId(null), 2000);
    }

    // Auto-hide toast after 2.5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!saveTitle.trim()) return;

    setSaveLoading(true);
    try {
      await addDoc(collection(db, 'saved_tokens'), {
        userId: user.uid,
        title: saveTitle.trim(),
        token: currentToken,
        category: saveCategory,
        notes: saveNotes.trim(),
        createdAt: new Date().toISOString()
      });

      setSaveSuccess(true);
      setSaveTitle('');
      setSaveNotes('');
      
      // Auto regenerate after save to avoid duplicate saving by accident
      setTimeout(() => {
        handleGenerate();
        setSaveSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Error saving token:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteToken = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'saved_tokens', id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Error deleting token:", err);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedTokens(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Filter saved tokens
  const filteredTokens = savedTokens.filter(token => {
    const matchesSearch = 
      token.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (token.notes && token.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      token.token.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || token.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const strength = evaluatePasswordStrength(currentToken);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-white" dir="rtl">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />

      {/* Elegant Dark Navbar */}
      <header className="h-20 border-b border-white/10 flex items-center bg-[#0f0f0f] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] text-black">
              <ShieldCheck size={24} className="animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white">أمان-كود</span>
              <span className="hidden sm:inline-block mr-3 text-[10px] text-amber-500 tracking-widest font-mono uppercase bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                قاعدة بيانات سحابية نشطة 🔒
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="hidden sm:flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono max-w-[150px] truncate text-xs">{user?.email}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-lg px-4 py-2.5 transition-all duration-300"
              title="تسجيل الخروج"
            >
              <LogOut size={15} />
              <span className="hidden md:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column A: Generator & Saver (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* The Generator Card */}
            <section id="generator-section" className="bg-[#161616] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  توليد رمز جديد فائق الأمان
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Info size={13} className="text-amber-500" />
                  <span>مُستهدَف: 24 خانة</span>
                </div>
              </div>

              {/* Main Token Display Box */}
              <div 
                onClick={() => copyToClipboard(currentToken, true)}
                className="bg-black/40 hover:bg-black/60 border border-white/10 hover:border-amber-500/40 rounded-xl p-5 mb-5 flex flex-col md:flex-row items-center gap-4 relative justify-between group cursor-pointer transition-all duration-300"
                title="اضغط لنسخ الرمز المولد"
              >
                <div className="w-full text-center md:text-right overflow-x-auto scrollbar-none py-1">
                  <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-amber-400 whitespace-nowrap break-all">
                    {currentToken || 'جاري التوليد...'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(currentToken, true);
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 hover:text-white transition duration-200 flex items-center justify-center gap-1.5 active:scale-95 flex-1 md:flex-initial text-sm font-medium"
                    title="نسخ للذاكرة"
                  >
                    {copiedCurrent ? (
                      <>
                        <Check size={16} className="text-amber-400" />
                        <span className="text-xs text-amber-400">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span className="text-xs">نسخ</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerate();
                    }}
                    disabled={regenerating}
                    className="p-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg shadow-lg shadow-amber-500/20 transition duration-200 flex items-center justify-center active:scale-95 disabled:opacity-50"
                    title="توليد جديد"
                  >
                    <RefreshCw size={16} className={`${regenerating ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Strength Meter */}
              <div className="mb-6 bg-black/20 border border-white/5 rounded-lg p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">قوة الرمز الحالي:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${strength.color} text-slate-950`}>
                    {strength.feedbackAr}
                  </span>
                </div>
                
                <div className="flex gap-1 w-24 sm:w-32 h-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-colors duration-300 ${
                        i < strength.score ? strength.color : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Configurations List */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
                  <Sliders size={14} className="text-amber-500" />
                  <span>تعديل خيارات التوليد الخاصة</span>
                </div>

                {/* Length Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">طول الرمز:</span>
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      {config.length} حرفاً
                    </span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={config.length}
                    onChange={(e) => setConfig({ ...config, length: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Checklist options */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-white/10 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeUppercase}
                      onChange={(e) => setConfig({ ...config, includeUppercase: e.checked })}
                      className="rounded border-white/10 text-amber-500 focus:ring-amber-500/30 bg-black w-4 h-4"
                    />
                    <span className="text-xs text-slate-300">أحرف كبيرة (A-Z)</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-white/10 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeLowercase}
                      onChange={(e) => setConfig({ ...config, includeLowercase: e.target.checked })}
                      className="rounded border-white/10 text-amber-500 focus:ring-amber-500/30 bg-black w-4 h-4"
                    />
                    <span className="text-xs text-slate-300">أحرف صغيرة (a-z)</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-white/10 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeNumbers}
                      onChange={(e) => setConfig({ ...config, includeNumbers: e.target.checked })}
                      className="rounded border-white/10 text-amber-500 focus:ring-amber-500/30 bg-black w-4 h-4"
                    />
                    <span className="text-xs text-slate-300">أرقام (0-9)</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-white/10 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeSymbols}
                      onChange={(e) => setConfig({ ...config, includeSymbols: e.target.checked })}
                      className="rounded border-white/10 text-amber-500 focus:ring-amber-500/30 bg-black w-4 h-4"
                    />
                    <span className="text-xs text-slate-300">رموز خاصّة (!@#$)</span>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-white/10 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.excludeSimilar}
                      onChange={(e) => setConfig({ ...config, excludeSimilar: e.target.checked })}
                      className="rounded border-white/10 text-amber-500 focus:ring-amber-500/30 bg-black w-4 h-4"
                    />
                    <span className="text-xs text-slate-300">تجنب الأحرف المتشابهة (مثل l, 1, I, o, 0)</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Save to Vault Form Card */}
            <section className="bg-[#161616] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                <FolderPlus size={18} className="text-amber-500" />
                تخزين هذا الرمز في الخزنة السحابية
              </h2>

              <form onSubmit={handleSaveToken} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold block">
                      عنوان الرمز / اسم الخدمة
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                        <FileText size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                        placeholder="مثل: بريد جيميل، فيسبوك"
                        className="w-full pr-10 pl-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-bold block">
                      تصنيف الخدمة
                    </label>
                    <select
                      value={saveCategory}
                      onChange={(e) => setSaveCategory(e.target.value)}
                      className="w-full px-3 py-3 bg-black/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-amber-500 text-sm transition-colors"
                    >
                      {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-[#161616]">
                          {cat.labelAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-bold block">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={saveNotes}
                    onChange={(e) => setSaveNotes(e.target.value)}
                    placeholder="مثل اسم المستخدم أو تفاصيل الحساب..."
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saveLoading || !saveTitle.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3.5 rounded-lg shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saveLoading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : saveSuccess ? (
                    <>
                      <Check size={18} className="text-black" />
                      <span>تم الحفظ بنجاح في خزنتك السحابية!</span>
                    </>
                  ) : (
                    <>
                      <Database size={18} />
                      <span>حفظ آمن في قاعدة البيانات</span>
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>

          {/* Column B: Saved Vault / Search (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Vault Container Card */}
            <section className="bg-[#161616] border border-white/10 rounded-2xl p-8 shadow-2xl min-h-[500px] flex flex-col relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock size={18} className="text-amber-500 animate-pulse" />
                  خزنتي الآمنة
                </h2>
                <span className="text-xs bg-black/40 text-amber-400 font-mono px-2.5 py-0.5 rounded border border-white/5">
                  {savedTokens.length} محفوظ
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن رمز محفوظ..."
                  className="w-full pr-9 pl-4 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm transition-colors"
                />
              </div>

              {/* Horizontal Category Tags filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-bold transition duration-200 border ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-black/50 text-slate-400 hover:text-slate-200 border-white/5 hover:border-white/10'
                    }`}
                  >
                    {cat.labelAr}
                  </button>
                ))}
              </div>

              {/* Saved Token list block */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {loadingTokens ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-3" />
                    <span className="text-xs">جاري جلب بيانات الخزنة المشفرة...</span>
                  </div>
                ) : filteredTokens.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 border border-dashed border-white/10 rounded-xl bg-black/10">
                    <Lock size={32} className="text-slate-700 mb-2" />
                    <p className="text-xs font-semibold">لا يوجد رموز مطابقة لبحثك</p>
                    <p className="text-[10px] text-slate-600 mt-1">قم بتوليد وحفظ رمز جديد ليظهر هنا</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredTokens.map((item) => {
                      const isRevealed = revealedTokens[item.id] || false;
                      const categoryObj = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];
                      const formattedDate = new Date(item.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-black/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition duration-300 relative group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-sm font-bold text-white">{item.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300`}>
                                  {categoryObj.labelAr}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">
                                  {formattedDate}
                                </span>
                              </div>
                            </div>

                            {/* Delete Confirmation Button Trigger */}
                            {deleteConfirmId === item.id ? (
                              <div className="flex items-center gap-1.5 z-10">
                                <button
                                  onClick={() => handleDeleteToken(item.id)}
                                  className="text-[9px] bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-bold transition duration-150"
                                >
                                  تأكيد الحذف
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="text-[9px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded transition duration-150"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition duration-200"
                                title="حذف الرمز"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          {item.notes && (
                            <p className="text-xs text-slate-400 bg-black/30 p-2.5 rounded-lg border border-white/5 mb-3 font-sans leading-relaxed">
                              {item.notes}
                            </p>
                          )}

                          {/* Vault password reveal/copy block */}
                          <div className="flex items-center justify-between gap-2 bg-black/60 p-2 rounded-lg border border-white/5">
                            <span className="font-mono text-sm tracking-wider text-amber-400/90 overflow-x-auto overflow-y-hidden max-w-[200px] whitespace-nowrap scrollbar-none">
                              {isRevealed ? item.token : '••••••••••••••••••••••••'}
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => toggleReveal(item.id)}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded-lg border border-white/5 transition"
                                title={isRevealed ? "إخفاء الرمز" : "إظهار الرمز"}
                              >
                                {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>

                              <button
                                onClick={() => copyToClipboard(item.token, false, item.id)}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded-lg border border-white/5 transition"
                                title="نسخ الرمز"
                              >
                                {copiedTokenId === item.id ? (
                                  <Check size={13} className="text-amber-400" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </section>
          </div>

        </div>
      </main>

      <footer className="h-16 border-t border-white/5 flex items-center justify-between px-6 sm:px-12 text-[10px] text-slate-600 uppercase tracking-widest mt-12 bg-black/20">
        <div>&copy; {new Date().getFullYear()} نظام حماية الرموز المتكامل (أمان-كود)</div>
        <div className="flex gap-6">
          <span>شروط الحماية الفائقة</span>
          <span>تشفير Firebase</span>
        </div>
      </footer>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-amber-500 text-black font-bold px-6 py-3 rounded-xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] border border-amber-400"
          >
            <Check size={18} className="shrink-0" />
            <span className="text-sm font-sans tracking-wide leading-none">{toastText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
