'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  FileText, 
  Target,
  Search,
  ArrowRight,
  AlertCircle,
  Activity,
  BrainCircuit,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { cn, formatApplyUrl, getWebSearchUrl } from '@/lib/utils';
import { getDashboardStats } from '@/services/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [insightText, setInsightText] = useState("");
  const [isScouting, setIsScouting] = useState(false);
  const [scoutProgress, setScoutProgress] = useState(0);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);

  useEffect(() => {
    // 1. Try to load from Cache (LocalStorage) for instant UI
    const cachedStats = localStorage.getItem('jobscout_dashboard_stats');
    if (cachedStats) {
      try {
        setStats(JSON.parse(cachedStats));
        setIsFirstLoad(false);
      } catch (e) {
        console.error("Cache parse error", e);
      }
    }

    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
        if (data?.profile) {
          setInsightText(`"Based on the **${data.metrics.skill_count} skill clusters** identified in your CV (including **${data.profile.skills?.slice(0, 3).join(', ')}**), you are optimally positioned for **${data.profile.preferred_role || 'professional'}** roles in **${data.profile.preferred_location || 'remote'}**. I recommend initializing a deep scout for roles matching your dynamic filter."`);
        }
        // Fetch saved jobs if cv_id is present
        if (data?.cv_id) {
            import('@/services/api').then(api => {
                api.getSavedJobs(data.cv_id).then(res => {
                    if (res && res.saved_jobs) {
                        setSavedJobs(res.saved_jobs);
                    }
                }).catch(err => console.error(err));
            });
        }
        // 2. Update Cache
        localStorage.setItem('jobscout_dashboard_stats', JSON.stringify(data));
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
        setIsFirstLoad(false);
      }
    };
    
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setIsFirstLoad(false);
      }
    }, 10000); // 10s timeout

    fetchStats();
    return () => clearTimeout(timer);
  }, []);

  const handleViewSample = () => {
    const sampleStats = {
      has_data: true,
      profile: {
        full_name: "Rana Umair",
        preferred_role: "Senior Full Stack Engineer",
        skills: ["React", "Node.js", "Python", "MongoDB", "FastAPI", "Next.js", "Docker", "TailwindCSS"],
        experience: "5+ years of software engineering experience leading product development.",
        education: "BS in Computer Science",
        certifications: ["AWS Certified Developer"],
        preferred_location: "Remote",
        professional_summary: "Experienced Full Stack Software Engineer specializing in React, Next.js, FastAPI, and Node.js with a passion for building robust agentic AI systems.",
        projects: "Led development of autonomous career agents."
      },
      cv_id: "sample-cv-id",
      metrics: {
        skill_count: 8,
        top_match: 95,
        avg_match: 88.5,
        job_count: 3
      },
      results: [
        {
          title: "Senior Full Stack Engineer",
          company: "TechGlobal Solutions",
          location: "Remote",
          job_url: "https://careers.techglobal.com/job/senior-react",
          match_percentage: 95,
          matching_skills: ["React", "Node.js", "Python", "MongoDB", "FastAPI"],
          missing_skills: ["GraphQL"],
          experience_match: "Perfect Alignment",
          education_match: "Matching",
          reasoning: "Excellent matching score. You have active experience in all their core technical stack.",
          interview_questions: ["How do you optimize React render performance?", "What is your approach to FastAPI route structure?", "Describe your experience scaling Node.js endpoints."],
          weaknesses: ["Familiarity with GraphQL is requested but not present in CV."],
          improvement_suggestions: ["Highlight Docker deployment experience in cover letter.", "Read up on GraphQL core syntax."]
        },
        {
          title: "Senior Backend Developer (Python)",
          company: "AiLabs",
          location: "Pakistan (Hybrid)",
          job_url: "https://ailabs.pk/careers/python-dev",
          match_percentage: 92,
          matching_skills: ["Python", "FastAPI", "MongoDB", "Docker"],
          missing_skills: ["Kubernetes"],
          experience_match: "Highly Aligned",
          education_match: "Matching",
          reasoning: "Very strong Python capability matches their ML pipeline and core backend requirements.",
          interview_questions: ["Explain Python asyncio and FastAPI performance benefits.", "How do you manage database connections in Motor?"],
          weaknesses: ["No direct Kubernetes cluster orchestration mentioned."],
          improvement_suggestions: ["Add a section in your resume for orchestrating cloud workloads."]
        },
        {
          title: "Lead Frontend Engineer",
          company: "FastScale Studio",
          location: "Remote",
          job_url: "https://fastscale.io/careers/lead-frontend",
          match_percentage: 88,
          matching_skills: ["React", "Next.js", "TailwindCSS"],
          missing_skills: ["TypeScript"],
          experience_match: "Highly Aligned",
          education_match: "Matching",
          reasoning: "Next.js proficiency aligns with their modern web platforms.",
          interview_questions: ["How do you structure Server Components in Next.js?"],
          weaknesses: ["TypeScript experience is not explicitly highlighted in resume details."],
          improvement_suggestions: ["Mention TypeScript typing in previous project descriptions."]
        }
      ]
    };
    
    localStorage.setItem('jobscout_dashboard_stats', JSON.stringify(sampleStats));
    localStorage.setItem('jobscout_profile', JSON.stringify(sampleStats.profile));
    localStorage.setItem('jobscout_cvId', 'sample-cv-id');
    localStorage.setItem('jobscout_cvText', 'Experienced Full Stack Software Engineer specializing in React, Next.js, FastAPI, and Node.js.');
    localStorage.setItem('jobscout_step', '3');
    setStats(sampleStats);
    setInsightText(`"Based on the **${sampleStats.metrics.skill_count} skill clusters** identified in your CV (including **${sampleStats.profile.skills.slice(0, 3).join(', ')}**), you are optimally positioned for **${sampleStats.profile.preferred_role || 'professional'}** roles in **${sampleStats.profile.preferred_location || 'remote'}**. I recommend initializing a deep scout for roles matching your dynamic filter."`);
    toast.success("Premium sample dashboard loaded successfully!");
  };

  // Only show loader if we have NO cached data and it's the very first load
  if (loading && isFirstLoad && !stats) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-neutral-500 font-bold text-[10px] uppercase tracking-[0.2em]">Restoring Neural State...</span>
      </div>
    </div>
  );

  // If no data exists in DB or Cache
  if (!stats?.has_data) return (
    <div className="h-full flex items-center justify-center py-12">
      <div className="text-center max-w-xl glass p-12 rounded-[40px] border-white/5 bg-neutral-900/20">
        <div className="w-24 h-24 bg-blue-600/10 rounded-[32px] flex items-center justify-center text-blue-500 mx-auto mb-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
          <Activity size={48} />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Activate Your Agent</h2>
        <p className="text-neutral-500 mb-10 leading-relaxed font-medium">
          Welcome to JobScout. To begin generating real-time analytics and autonomous job matches, please upload your professional CV.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/dashboard/jobs" className="px-10 py-4 rounded-2xl bg-white text-black font-black text-sm hover:bg-neutral-200 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2">
            Upload CV <ArrowRight size={18} />
          </a>
          <button 
            onClick={handleViewSample}
            className="px-10 py-4 rounded-2xl bg-neutral-900 text-neutral-400 font-bold text-sm border border-white/5 hover:text-white transition-all"
          >
            View Sample Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const { profile, metrics } = stats;

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setInsightText(`"I have re-evaluated your neural profile. Your expertise in **${profile.skills?.slice(-2).join(' and ')}** gives you a distinct edge in the current market for **${profile.preferred_role}** positions. Let's initiate a targeted scout to capitalize on this."`);
      setIsRegenerating(false);
    }, 1500);
  };

  const handleScout = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsScouting(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 15;
      if (prog > 100) {
        clearInterval(interval);
        router.push('/dashboard/jobs');
      } else {
        setScoutProgress(prog);
      }
    }, 300);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-white/10 p-3 rounded-2xl shadow-xl">
          <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-bold text-blue-400">{payload[0].value.toFixed(1)}% Alignment</p>
          <p className="text-[9px] text-neutral-400 mt-1 max-w-[150px]">Measures how well your {label.toLowerCase()} matches current market demand.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start md:items-end gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-1">Intelligence Overview</h2>
          <p className="text-neutral-500 text-xs md:text-sm font-medium">Welcome back, {profile.full_name}. Here is your current market standing.</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest animate-pulse mt-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Live...
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: 'Top Match', value: `${metrics.top_match}%`, icon: Target, color: 'text-blue-500' },
          { label: 'Profile Accuracy', value: '100%', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Skills Found', value: metrics.skill_count, icon: Briefcase, color: 'text-purple-500' },
          { label: 'Jobs Matched', value: metrics.job_count, icon: Search, color: 'text-amber-500' }
        ].map((stat, i) => (
          <div key={i} className="glass p-3 md:p-6 rounded-2xl md:rounded-3xl border-white/5 bg-neutral-900/40 hover:bg-neutral-900/60 transition-all hover:scale-[1.02] cursor-pointer group">
            <div className="flex justify-between items-start mb-3 md:mb-6">
              <div className={cn("p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors", stat.color)}>
                <stat.icon size={16} className="md:w-6 md:h-6" />
              </div>
              <TrendingUp size={12} className="text-emerald-500 opacity-50" />
            </div>
            <div className="text-lg md:text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
            <div className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-[0.15em] md:tracking-[0.2em]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
        {/* Market Standing & Analytics Merge */}
        <div className="lg:col-span-7 glass p-5 md:p-10 rounded-[24px] md:rounded-[40px] bg-neutral-900/30">
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <div>
              <h3 className="text-base md:text-xl font-black text-white mb-1 italic tracking-tight">Market Parity</h3>
              <p className="text-neutral-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Global skill-market alignment</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <div className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Live</div>
            </div>
          </div>
          <div className="h-[180px] md:h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={[
                { name: 'Core Skills', value: Math.min(100, (metrics.skill_count / 15) * 100) },
                { name: 'Specialty', value: metrics.top_match * 0.8 },
                { name: 'Experience', value: 75 },
                { name: 'Network', value: 45 },
                { name: 'Scout Index', value: metrics.top_match }
              ]}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#171717" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#404040', fontSize: 10, fontWeight: 'black'}} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 md:mt-8 p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 flex-shrink-0">
                <TrendingUp size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-0.5">Growth Forecast</div>
                <div className="text-xs md:text-sm font-bold text-white tracking-tight truncate">Demand for {profile.preferred_role} up 12.4%</div>
              </div>
            </div>
            <button onClick={() => setIsDetailsModalOpen(true)} className="text-[10px] font-black text-blue-500 uppercase tracking-[0.1em] md:tracking-[0.2em] hover:text-blue-400 transition-colors flex-shrink-0">Details</button>
          </div>
        </div>

        {/* Agent Neural Hub */}
        <div className="lg:col-span-5 glass p-5 md:p-10 rounded-[24px] md:rounded-[40px] bg-neutral-900/30 border-white/5">
          <div className="flex items-center gap-3 mb-6 md:mb-10">
             <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
               <BrainCircuit size={18} />
             </div>
             <h3 className="text-lg md:text-xl font-black text-white italic tracking-tight">Agent Intelligence</h3>
          </div>
          
          <div className="space-y-4 md:space-y-8">
            <div className="p-4 md:p-8 rounded-2xl md:rounded-3xl bg-blue-600/5 border border-blue-500/10 relative group hover:bg-blue-600/10 transition-all">
              <div className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-3">Neural Consensus</div>
              <p className={cn("text-xs md:text-sm text-white font-medium leading-relaxed italic transition-opacity duration-300", isRegenerating ? "opacity-30" : "opacity-100")}>
                {insightText || `"Based on the **${metrics.skill_count} skill clusters** identified in your CV (including **${profile.skills?.slice(0, 3).join(', ')}**), you are optimally positioned for **${profile.preferred_role || 'professional'}** roles in **${profile.preferred_location || 'remote'}**. I recommend initializing a deep scout for roles matching your dynamic filter."`}
              </p>
              <button 
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="mt-3 md:mt-4 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all flex items-center gap-2"
              >
                <Activity size={13} className={cn(isRegenerating && "animate-spin")} /> {isRegenerating ? "Re-evaluating..." : "Regenerate Insights"}
              </button>
            </div>

            <div className="space-y-3 md:space-y-6">
               <div className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10">
                     <Target size={14} />
                   </div>
                   <span className="text-[10px] md:text-xs font-black text-neutral-400 uppercase tracking-widest">Scout Index</span>
                 </div>
                 <span className="text-xs md:text-sm font-black text-white">{metrics.top_match}% Parity</span>
               </div>
               
               <div className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10">
                     <Briefcase size={14} />
                   </div>
                   <span className="text-[10px] md:text-xs font-black text-neutral-400 uppercase tracking-widest">Jobs Matched</span>
                 </div>
                 <span className="text-xs md:text-sm font-black text-white">{metrics.job_count} Results</span>
               </div>
            </div>

            <button onClick={handleScout} disabled={isScouting} className="relative overflow-hidden flex items-center justify-center gap-3 w-full py-4 md:py-5 rounded-[18px] md:rounded-[24px] bg-white text-black font-black text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] shadow-2xl shadow-white/5 hover:scale-[1.02] transition-all disabled:opacity-80 disabled:hover:scale-100">
              <div className="absolute inset-0 bg-blue-500/20" style={{ width: `${scoutProgress}%`, transition: 'width 0.3s ease' }} />
              <span className="relative z-10 flex items-center gap-2">
                {isScouting ? `Scouting... ${Math.min(100, scoutProgress)}%` : <>Initiate Neural Scout <ArrowRight size={15} /></>}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Saved Jobs Section */}
      {savedJobs.length > 0 && (
        <div className="glass p-5 md:p-10 rounded-[24px] md:rounded-[40px] bg-neutral-900/30 border-white/5 mt-4 md:mt-8">
           <h3 className="text-lg md:text-xl font-black text-white italic tracking-tight mb-4 md:mb-6">Saved Jobs</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
             {savedJobs.map((job, idx) => {
               const formattedUrl = formatApplyUrl(job.job_url);
               const searchUrl = getWebSearchUrl(job.title, job.company, job.location);
               const applyUrl = formattedUrl || searchUrl;

               return (
                 <div key={idx} className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex flex-col justify-between h-full">
                   <div>
                     <h4 className="text-base md:text-lg font-bold text-white mb-2">{job.title}</h4>
                     <div className="text-sm text-neutral-400 mb-3 flex items-center gap-2">
                       <Briefcase size={13} /> {job.company}
                     </div>
                     <div className="text-sm text-neutral-400 mb-3 flex items-center gap-2">
                       <MapPin size={13} /> {job.location}
                     </div>
                   </div>
                   <div className="flex gap-4 mt-4 pt-4 border-t border-white/5 items-center">
                     <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-1">
                       Apply Now <ExternalLink size={13} />
                     </a>
                     <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-300 text-xs font-bold flex items-center gap-1 ml-auto">
                       Search Web <Search size={11} />
                     </a>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsDetailsModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-xl md:text-2xl font-black text-white">Market Growth Forecast</h3>
                <button onClick={() => setIsDetailsModalOpen(false)} className="text-neutral-400 hover:text-white p-1.5 md:p-2">✕</button>
              </div>
              <div className="space-y-6 text-neutral-400 text-sm leading-relaxed">
                <p>
                  Based on recent aggregated data from global job boards, demand for <strong className="text-white">{profile.preferred_role}</strong> professionals is experiencing a significant upward trend.
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="text-white font-bold mb-2">Key Drivers:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Increased adoption of AI and automation tools requiring specialized skills.</li>
                    <li>Remote work enabling companies to source global talent, increasing competition but also opportunity.</li>
                    <li>Specific surge in demand for your highlighted skills: <span className="text-blue-400 font-medium">{profile.skills?.slice(0,3).join(', ')}</span>.</li>
                  </ul>
                </div>
                <p className="text-xs text-neutral-500 italic mt-4">
                  Sources: Simulated aggregation from LinkedIn, Glassdoor, and Tavily AI Market Analysis.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
