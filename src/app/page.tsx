"use client";

import { useState, useRef, useEffect } from "react";
import { SearchBar } from "@/components/ui/SearchBar";
import { RexDLogo } from "@/components/ui/Logo";
import ReactMarkdown from "react-markdown";
import { 
  Sparkles, 
  BrainCircuit, 
  Zap, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  ChevronRight,
  Monitor,
  Cpu,
  Globe,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIColumn {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  icon: React.ReactNode;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const INITIAL_MODELS: Omit<AIColumn, "messages" | "isLoading" | "error">[] = [
  { id: "groq-llama", name: "Llama 3.3 70B", provider: "Groq", endpoint: "/api/ai/groq", icon: <Monitor className="w-4 h-4" /> },
  { id: "groq-mixtral", name: "Llama 3.1 8B", provider: "Groq", endpoint: "/api/ai/mixtral", icon: <Cpu className="w-4 h-4" /> },
  { id: "groq-gemma", name: "Qwen 3 32B", provider: "Groq", endpoint: "/api/ai/gemma", icon: <Globe className="w-4 h-4" /> },
];

export default function Home() {
  const [columns, setColumns] = useState<AIColumn[]>(
    INITIAL_MODELS.map(m => ({ ...m, messages: [], isLoading: false, error: null }))
  );
  const [globalHistory, setGlobalHistory] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeModelIdx, setActiveModelIdx] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const gridRef = useRef<HTMLDivElement>(null);

  const handleGridScroll = () => {
    if (!gridRef.current) return;
    const scrollLeft = gridRef.current.scrollLeft;
    const width = gridRef.current.clientWidth;
    const newIdx = Math.round(scrollLeft / width);
    if (newIdx !== activeModelIdx) setActiveModelIdx(newIdx);
  };

  const scrollToBottom = (id: string) => {
    const el = scrollRefs.current[id];
    if (el) el.scrollTop = el.scrollHeight;
  };

  const scrollToModel = (idx: number) => {
    if (!gridRef.current) return;
    const width = gridRef.current.clientWidth;
    gridRef.current.scrollTo({ left: width * idx, behavior: "smooth" });
  };

  useEffect(() => {
    columns.forEach(col => scrollToBottom(col.id));
  }, [columns]);

  const handleSearch = async (prompt: string) => {
    setIsSearching(true);
    const userMessage: Message = { role: "user", content: prompt };
    
    setColumns(prev => prev.map(col => ({
      ...col,
      messages: [...col.messages, userMessage],
      isLoading: true,
      error: null
    })));
    
    const currentContext = [...globalHistory];
    setGlobalHistory(prev => [...prev, userMessage]);

    await Promise.all(columns.map(async (col) => {
      try {
        const res = await fetch(col.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, history: currentContext }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");

        const assistantMessage: Message = { role: "assistant", content: data.content };

        setColumns(prev => prev.map(c => 
          c.id === col.id ? { 
            ...c, 
            messages: [...c.messages, assistantMessage],
            isLoading: false 
          } : c
        ));
      } catch (err: any) {
        setColumns(prev => prev.map(c => 
          c.id === col.id ? { 
            ...c, 
            error: err.message || "Connection failed",
            isLoading: false 
          } : c
        ));
      }
    }));

    setIsSearching(false);
  };

  const clearChat = () => {
    setColumns(prev => prev.map(col => ({ ...col, messages: [], error: null, isLoading: false })));
    setGlobalHistory([]);
  };

  const hasMessages = columns[0].messages.length > 0;

  return (
    <main className="h-screen bg-zinc-50 dark:bg-black flex flex-col overflow-hidden font-sans">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-black p-6 flex flex-col lg:hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <RexDLogo className="w-8 h-8" />
                <span className="font-black text-xl tracking-tighter dark:text-white">RexD <span className="text-blue-600">Ai</span></span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                <X className="w-6 h-6 text-zinc-500" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6">
              {[
                { href: "https://dub.sh/rexd.space/", label: "RexD" },
                { href: "https://dub.sh/StreamXOne", label: "StreamX" },
                { href: "https://dub.sh/AuroraWeb/", label: "Aurora" },
                { href: "https://dub.sh/HeartWeb/", label: "Heart" }
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-black text-zinc-900 dark:text-white hover:text-blue-600 transition-colors uppercase tracking-widest"
                >
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4" />
              <a
                href="https://rexd.space/#contact"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-black text-blue-600 uppercase tracking-widest"
              >
                Contact Us
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Dynamic Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-none bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 z-50"
      >
        <div className="max-w-full mx-auto flex justify-between items-center gap-4">
          {/* Brand */}
          <div className="flex-1 flex items-center">
            <div className="flex items-center gap-3 group cursor-default">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="cursor-pointer"
              >
                <RexDLogo className="w-8 h-8" />
              </motion.div>
              <h1 className="text-xl font-black tracking-tighter flex items-center">
                <span className="text-zinc-900 dark:text-white font-black">RexD</span>
                <span className="text-blue-600 font-black">Ai</span>
                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] rounded-md font-bold tracking-widest uppercase">Beta</span>
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8 bg-zinc-100/50 dark:bg-zinc-900/50 px-6 py-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/50">
            <HeaderLink href="https://dub.sh/rexd.space/" label="RexD" />
            <HeaderLink href="https://dub.sh/StreamXOne" label="StreamX" />
            <HeaderLink href="https://dub.sh/AuroraWeb/" label="Aurora" />
            <HeaderLink href="https://dub.sh/HeartWeb/" label="Heart" />
          </nav>
          
          {/* Actions */}
          <div className="flex-1 flex items-center justify-end gap-3">
            {hasMessages && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearChat} 
                className="hidden md:flex text-[10px] font-bold text-zinc-500 hover:text-red-500 transition-colors items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 uppercase tracking-widest shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </motion.button>
            )}
            
            <motion.a
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              href="https://rexd.space/#contact"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all uppercase tracking-[0.2em] shadow-lg shadow-blue-500/25 items-center gap-2"
            >
              Contact
            </motion.a>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <Menu className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence>
          {!hasMessages && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-10 flex flex-col items-center bg-white dark:bg-black px-4 md:px-6 overflow-hidden"
            >
              {/* Background Decor */}
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-500/10 blur-[120px] rounded-full" />
              
              <div className="flex-1 flex flex-col items-center justify-center w-full relative z-20 pt-10">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8 flex flex-col items-center w-full"
                >
                  <div className="mb-4 md:mb-6 relative">
                    <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full" />
                    <RexDLogo className="w-12 h-12 md:w-16 md:h-16 relative" />
                  </div>
                  <h2 className="text-3xl md:text-6xl font-black mb-4 text-zinc-900 dark:text-white tracking-tight text-center leading-[1.1]">
                    The Next Era of <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-[length:200%_auto] animate-gradient">Intelligence.</span>
                  </h2>
                  <p className="text-zinc-500 text-sm md:text-lg text-center max-w-xl font-medium leading-relaxed px-4 opacity-80">
                    Compare Llama 3.3, Qwen 3, and Llama 3.1 side-by-side with unified memory.
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-full max-w-2xl"
                >
                    <SearchBar onSearch={handleSearch} isLoading={isSearching} />
                </motion.div>

                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-8 md:mt-12 max-w-4xl w-full"
                >
                    <AnimatedFeatureCard icon={<Sparkles className="text-blue-500 w-4 h-4"/>} title="Neural Sync" desc="Unified history across models." />
                    <AnimatedFeatureCard icon={<BrainCircuit className="text-blue-500 w-4 h-4"/>} title="Tri-Pillar View" desc="Real-time side-by-side compare." />
                    <AnimatedFeatureCard icon={<Zap className="text-blue-500 w-4 h-4"/>} title="Quantum Speed" desc="Instant Groq-driven replies." />
                </motion.div>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="relative z-20 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] py-6"
              >
                Made with love by <a href="https://dub.sh/moment" target="_blank" rel="noopener noreferrer" className="text-zinc-900 dark:text-zinc-100 hover:text-blue-600 transition-colors">Sagar</a> — Powered by <a href="https://dub.sh/rexd.space" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">RexD</a>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Triple Intelligence Grid */}
        <div 
          ref={gridRef}
          onScroll={handleGridScroll}
          className="flex-1 flex w-full divide-x-0 md:divide-x divide-zinc-200 dark:divide-zinc-800 h-full overflow-x-auto md:overflow-hidden snap-x snap-mandatory scrollbar-hide scroll-smooth"
        >
          {columns.map((col, colIdx) => (
            <motion.div 
              key={col.id} 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: colIdx * 0.1 }}
              className="w-full md:w-auto md:flex-1 flex-none flex flex-col snap-center bg-white dark:bg-[#050505] border-r-0 md:border-r border-zinc-100 dark:border-zinc-900/30 md:border-r-0 last:border-r-0"
            >
              {/* Pillar Header */}
              <div className="flex-none p-4 border-b border-zinc-100 dark:border-zinc-900/50 bg-white/50 dark:bg-black/50 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-500">
                    {col.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">{col.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">{col.provider}</span>
                      {col.isLoading && (
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-1 h-1 bg-blue-500 rounded-full" 
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Neural Feed */}
              <div 
                ref={(el) => { scrollRefs.current[col.id] = el; }}
                className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 md:space-y-8 scroll-smooth scrollbar-hide"
              >
                <AnimatePresence mode="popLayout">
                  {col.messages.map((msg, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "flex flex-col gap-2",
                        msg.role === "user" ? "items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                          "max-w-[98%] md:max-w-[95%] p-3 md:p-4 rounded-2xl text-sm md:text-[15px] leading-relaxed shadow-sm",
                          msg.role === "user" 
                              ? "bg-blue-600 text-white rounded-tr-none font-medium" 
                              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200/50 dark:border-zinc-800/50"
                      )}>
                          {msg.role === "assistant" ? (
                               <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black prose-pre:border prose-pre:border-zinc-800 overflow-x-auto">
                                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                               </div>
                          ) : (
                              msg.content
                          )}
                      </div>
                      <span className="text-[9px] md:text-[10px] text-zinc-400 font-bold px-1 uppercase tracking-tighter">
                        {msg.role === "user" ? "You" : col.name}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {col.isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-xs text-zinc-500 font-medium animate-pulse">Neural synthesis...</span>
                  </motion.div>
                )}

                {col.error && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl text-xs text-red-500 flex gap-3 shadow-sm"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <div className="flex flex-col gap-1">
                          <span className="font-bold uppercase tracking-wider">Sync Error</span>
                          <p className="font-medium opacity-80">{col.error}</p>
                        </div>
                    </motion.div>
                )}
                <div className="h-32" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Pagination Dots */}
        {hasMessages && (
          <div className="md:hidden absolute bottom-32 left-0 right-0 flex justify-center gap-2 z-40 pointer-events-none">
            {columns.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  activeModelIdx === idx ? "bg-blue-600 w-4" : "bg-zinc-300 dark:bg-zinc-700"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Interactive Input */}
      <AnimatePresence>
        {hasMessages && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="flex-none p-4 md:p-5 bg-gradient-to-t from-zinc-50 via-zinc-50/95 to-transparent dark:from-black dark:via-black/95 border-t border-zinc-200 dark:border-zinc-800 z-50"
          >
            <div className="max-w-4xl mx-auto flex flex-col gap-3">
              {/* Mobile AI Switcher Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToModel((activeModelIdx + 1) % columns.length)}
                className="md:hidden w-full py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 flex items-center justify-center gap-2 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
                View {columns[(activeModelIdx + 1) % columns.length].name}
              </motion.button>

              <SearchBar onSearch={handleSearch} isLoading={isSearching} />
              <div className="flex justify-center items-center gap-6">
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                   Made with love by <a href="https://dub.sh/moment" target="_blank" rel="noopener noreferrer" className="text-zinc-900 dark:text-zinc-100 hover:text-blue-600 transition-colors">Sagar</a>
                 </p>
                 <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-800 rounded-full" />
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                   Powered by <a href="https://dub.sh/rexd.space" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline transition-all">RexD</a>
                 </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function AnimatedFeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -2, backgroundColor: "rgba(59, 130, 246, 0.03)" }}
      className="flex flex-col gap-3 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm group transition-all"
    >
      <div className="p-2 bg-zinc-50 dark:bg-zinc-950 rounded-xl w-fit group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors duration-300">
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-0.5">{title}</h4>
        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function HeaderLink({ href, label }: { href: string, label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-[10px] font-bold text-zinc-500 hover:text-blue-600 transition-colors uppercase tracking-[0.2em]"
    >
      {label}
    </a>
  );
}
