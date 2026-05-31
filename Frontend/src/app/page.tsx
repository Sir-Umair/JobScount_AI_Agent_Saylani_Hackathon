'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  BrainCircuit, 
  Rocket, 
  ChevronRight, 
  Terminal, 
  Sparkles, 
  Search, 
  BarChart3, 
  Globe, 
  Star, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Briefcase,
  Layers,
  Zap,
  CheckCircle2,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import FileUpload from '@/components/FileUpload';
import ProfileCard from '@/components/ProfileCard';
import JobCard from '@/components/JobCard';
import { uploadCV, runAgent } from '@/services/api';
import { CandidateProfile, JobRecommendation } from '@/types';

export default function LandingPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [cvText, setCvText] = useState('');
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const router = useRouter();

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const data = await uploadCV(file);
      setCvText(data.cv_text);
      setProfile(data.candidate_profile);
      localStorage.setItem('jobscout_profile', JSON.stringify(data.candidate_profile));
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('CV uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmProfile = async (filter: string, updatedProfile?: CandidateProfile) => {
    const activeProfile = updatedProfile || profile;
    if (!activeProfile) return;
    setIsLoading(true);
    try {
      const data = await runAgent(cvText, activeProfile, filter);
      setJobs(data.results);
      setProfile(activeProfile);
      localStorage.setItem('jobscout_profile', JSON.stringify(activeProfile));
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Agent initialization complete!');
    } catch (error) {
      console.error('Agent run failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const hasCV = localStorage.getItem('jobscout_profile');
    if (hasCV) {
      router.push('/dashboard');
    } else {
      toast.error('Please upload your CV first to access the dashboard.');
      router.push('/dashboard/jobs');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white selection:bg-blue-500/30 selection:text-blue-200">
      {/* Grid Background */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40 L40 40 L40 0' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")` }} />
      
      {/* Mesh Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[160px] animate-mesh" />
        <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[160px] animate-mesh" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <BrainCircuit className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg tracking-tighter">JobScout</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-neutral-400">
            <button onClick={() => setIsFeaturesModalOpen(true)} className="hover:text-white transition-colors">Features</button>
            <div className="h-4 w-px bg-neutral-800" />
            <button onClick={handleDashboardClick} className="px-4 py-1.5 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-all">
              Enter Dashboard
            </button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Hero Section */}
                <section className="pt-24 pb-32 text-center">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8"
                  >
                    <Sparkles size={14} className="text-blue-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">SMIT Agentic AI Hackathon</span>
                  </motion.div>

                  <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8 text-gradient">
                    Find Your Dream Job <br /> Faster With AI
                  </h1>
                  
                  <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
                    Experience the future of job hunting. Our autonomous AI agent scouts the web, analyzes your resume, and guides you to the perfect match.
                  </p>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-32">
                    <button 
                      onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-lg hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center gap-3 group"
                    >
                      Initialize Agent <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </button>
                    <button 
                      onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-10 py-5 rounded-2xl bg-white/[0.03] border border-white/10 text-neutral-300 font-bold text-lg hover:bg-white/[0.08] hover:text-white transition-all backdrop-blur-xl"
                    >
                      How it Works
                    </button>
                  </div>

                  {/* Dashboard Preview */}
                  <div className="relative max-w-5xl mx-auto">
                    <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full z-0 opacity-20" />
                    <div className="relative z-10 glass rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border-white/5">
                      <div className="bg-neutral-900/50 border-b border-white/5 px-6 py-4 flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                        </div>
                        <div className="mx-auto text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em]">JobScout Dashboard Preview</div>
                      </div>
                      <div className="p-8 aspect-[16/9] bg-[#0A0A0A] relative overflow-hidden group/preview">
                        {/* Interactive UI Overlay */}
                        <div className="grid grid-cols-12 gap-6 h-full relative z-10">
                          {/* Sidebar Mockup */}
                          <div className="col-span-3 space-y-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Agent_Ready</span>
                              </div>
                              <div className="space-y-2">
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full w-1/3 bg-blue-500/50 rounded-full" />
                                </div>
                                <div className="text-[9px] text-neutral-600 font-bold uppercase">Initialization: 32%</div>
                              </div>
                            </div>
                            
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                              <div className="text-[9px] text-neutral-500 font-bold uppercase mb-3 tracking-widest">Neural Stats</div>
                              <div className="space-y-3">
                                {[
                                  { label: 'Latency', val: '12ms' },
                                  { label: 'Cognition', val: '98.2%' },
                                  { label: 'Uptime', val: '99.9%' }
                                ].map((s, i) => (
                                  <div key={i} className="flex justify-between items-center">
                                    <span className="text-[8px] text-neutral-600 font-medium">{s.label}</span>
                                    <span className="text-[8px] text-neutral-400 font-mono">{s.val}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Main Onboarding Guide */}
                          <div className="col-span-6 flex flex-col items-center justify-center text-center px-8 border-x border-white/5">
                            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/10">
                              <BrainCircuit size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Activate Your Scout</h3>
                            <p className="text-neutral-500 text-xs leading-relaxed mb-8 max-w-xs font-medium">
                              Your autonomous career agent is waiting for instructions. Feed it your CV to begin the global scouting mission.
                            </p>
                            <div className="flex flex-col gap-3 w-full max-w-[180px]">
                              <button 
                                onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full py-4 rounded-xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-white/5"
                              >
                                Begin Scouting <ArrowRight size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Live Feed / Activity */}
                          <div className="col-span-3 space-y-4">
                            <div className="h-full p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-[9px] text-neutral-600 leading-relaxed overflow-hidden relative">
                              <div className="text-blue-500 mb-2 font-bold uppercase tracking-widest text-[8px]">$ system_logs</div>
                              <div className="space-y-1">
                                <div>[0.00] initializing_core...</div>
                                <div>[0.42] connect_mongodb_cluster_0...</div>
                                <div>[0.89] link_anthropic_sonnet_3.5...</div>
                                <div>[1.24] link_tavily_job_engine...</div>
                                <div className="text-neutral-500 animate-pulse">_ awaiting_cv_stream...</div>
                              </div>
                              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-blue-600/5 border border-blue-500/10 text-blue-400 font-sans">
                                <div className="font-black text-[7px] uppercase mb-1">Quick Tip</div>
                                <div className="text-[8px] font-medium leading-snug">The agent scans 20+ sources per second once profile is mapped.</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)] pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-32 relative">
                  <div className="max-w-3xl mx-auto text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase mb-6">
                      <Sparkles size={12} /> The Intelligence Workflow
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight italic">How Your Scout Operates</h2>
                    <p className="text-neutral-500 font-medium text-lg leading-relaxed">
                      A multi-agent system designed to handle the complexity of the modern job market, providing you with a significant competitive advantage.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 h-auto md:h-[650px]">
                    {/* Step 1: Upload & Map */}
                    <div className="md:col-span-4 md:row-span-1 glass p-10 flex flex-col justify-between relative overflow-hidden group/card border-blue-500/20 bg-blue-500/[0.02]">
                      <div className="flex justify-between items-start relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover/card:scale-110 transition-transform duration-500">
                          <Layers size={28} />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 tracking-widest uppercase">Step 01</div>
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-4 text-white tracking-tight">Neural Mapping</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed max-w-lg font-medium">
                          The agent performs a deep semantic scan of your CV, extracting skill clusters, experience weights, and career vectors using Anthropic Sonnet 3.5. This creates your unique "Professional Identity" in our neural database.
                        </p>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32" />
                    </div>

                    {/* Step 2: Scout */}
                    <div className="md:col-span-2 md:row-span-1 glass p-10 flex flex-col justify-between border-purple-500/20 bg-purple-500/[0.02] group/card">
                      <div className="flex justify-between items-start">
                        <div className="w-14 h-14 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover/card:rotate-12 transition-transform duration-500">
                          <Search size={28} />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 tracking-widest uppercase">Step 02</div>
                      </div>
                      <div>
                        <h3 className="text-xl font-black mb-2 text-white">Live Scouting</h3>
                        <p className="text-neutral-500 text-xs leading-relaxed font-medium">
                          Using Tavily AI, the agent scans live global and local job boards (Pakistan-first) to find matches that 99% of searches miss.
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Align */}
                    <div className="md:col-span-2 md:row-span-1 glass p-10 flex flex-col justify-between border-emerald-500/20 bg-emerald-500/[0.02] group/card">
                      <div className="flex justify-between items-start">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover/card:scale-110 transition-transform duration-500">
                          <Target size={28} />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 tracking-widest uppercase">Step 03</div>
                      </div>
                      <div>
                        <h3 className="text-xl font-black mb-2 text-white">Smart Alignment</h3>
                        <p className="text-neutral-500 text-xs leading-relaxed font-medium">
                          Each role is scored from 0-100 based on your neural profile. We prioritize "The Perfect 5" matches for your path.
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Prepare */}
                    <div className="md:col-span-4 md:row-span-1 glass p-10 flex flex-col justify-between relative overflow-hidden group/card border-amber-500/20 bg-amber-500/[0.02]">
                      <div className="flex justify-between items-start relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover/card:-translate-y-1 transition-transform duration-500">
                          <MessageSquare size={28} />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-400 tracking-widest uppercase">Step 04</div>
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-4 text-white tracking-tight">Interview Prep</h3>
                        <p className="text-neutral-400 text-sm leading-relaxed max-w-lg font-medium">
                          The agent doesn't just find the job; it helps you land it. Generate custom interview questions based on your specific profile and the company's tech stack to ensure you're always ready.
                        </p>
                      </div>
                      <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -mr-32 -mb-32" />
                    </div>
                  </div>
                </section>

                {/* Upload Section */}
                <section id="search" className="py-32 scroll-mt-24">
                  <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold mb-4">Ready to start?</h2>
                      <p className="text-neutral-500 font-medium">Upload your CV to see your AI matching engine in action.</p>
                    </div>
                    <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
                  </div>
                </section>

              </motion.div>
            )}

            {step === 2 && profile && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto py-24"
              >
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-bold tracking-tight">Profile Intelligence</h2>
                  </div>
                  <button onClick={() => setStep(1)} className="text-neutral-500 text-sm hover:text-white transition-colors">Change CV</button>
                </div>
                <ProfileCard 
                  profile={profile} 
                  onConfirm={handleConfirmProfile} 
                  isLoading={isLoading} 
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24"
              >
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-16">
                  <div>
                    <h2 className="text-4xl font-black mb-2 text-gradient">The Perfect 5</h2>
                    <p className="text-neutral-500 font-medium">Top-tier job opportunities precisely matched to your expertise.</p>
                  </div>
                  <button 
                    onClick={() => setStep(1)} 
                    className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest"
                  >
                    Reset Search
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {jobs.map((job, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <JobCard job={job} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="py-24 border-t border-white/5 mt-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                <BrainCircuit className="text-white" size={12} />
              </div>
              <span className="font-bold text-sm tracking-tighter">JobScout</span>
            </div>
            <p className="text-neutral-600 text-xs">© 2026 JobScout AI. Engineered for the SMIT Agentic AI Hackathon.</p>
            <div className="flex gap-6 text-neutral-500 text-xs font-medium">
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">GitHub</a>
              <a href="#" className="hover:text-white">Discord</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Features Modal */}
      <AnimatePresence>
        {isFeaturesModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsFeaturesModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-4xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white">JobScout Features</h2>
                <button onClick={() => setIsFeaturesModalOpen(false)} className="text-neutral-400 hover:text-white p-2">✕</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: BrainCircuit, title: "Neural Profile Mapping", desc: "Extracts deep semantic vectors from your CV to build a comprehensive professional identity." },
                  { icon: Search, title: "Autonomous Scouting", desc: "Our agent tirelessly scans global and local job boards 24/7 to find hidden opportunities." },
                  { icon: Target, title: "Precision Matching", desc: "Algorithms match your skills against job requirements to ensure a high-probability fit." },
                  { icon: MessageSquare, title: "Interview Simulation", desc: "Generates custom interview questions based on your profile and the target company's stack." },
                  { icon: BarChart3, title: "Market Parity Analysis", desc: "Real-time analysis of salary trends and skill demand to help you negotiate better." },
                  { icon: ShieldCheck, title: "ATS Optimization", desc: "Analyzes and suggests improvements to your resume to bypass automated screening systems." }
                ].map((feature, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <feature.icon className="text-blue-500 mb-4" size={32} />
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-neutral-400 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
