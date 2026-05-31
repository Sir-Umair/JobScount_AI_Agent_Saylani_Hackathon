import React from 'react';
import { ExternalLink, CheckCircle2, MapPin, Building2, MessageSquare, Info, Star, AlertCircle, Lightbulb, Search } from 'lucide-react';
import { JobRecommendation } from '../types';
import { cn, formatApplyUrl, getWebSearchUrl } from '@/lib/utils';
import { toast } from 'sonner';

import { saveJob } from '@/services/api';

interface JobCardProps {
  job: JobRecommendation;
  cvId?: string | null;
}

export default function JobCard({ job, cvId }: JobCardProps) {
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const [isSaved, setIsSaved] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDismissed, setIsDismissed] = React.useState(false);



  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!cvId) {
      toast.error('Please upload a CV to save jobs.');
      return;
    }
    if (isSaved) {
      toast.info('Job is already saved');
      return;
    }
    setIsSaving(true);
    try {
      await saveJob(cvId, job);
      setIsSaved(true);
      toast.success('Job saved successfully');
    } catch (err) {
      toast.error('Failed to save job');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDismissed(true);
    toast.info('Job dismissed from recommendations');
  };

  if (isDismissed) return null;

  const formattedUrl = formatApplyUrl(job.job_url);
  const searchUrl = getWebSearchUrl(job.title, job.company, job.location);
  const applyUrl = formattedUrl || searchUrl;

  return (
    <div className="glass group h-full flex flex-col rounded-3xl border-white/5 bg-neutral-900/30 hover:bg-neutral-900/50 transition-all duration-500">
      <div className="p-5 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
          <div className="space-y-1">
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
              {job.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-neutral-500 text-xs md:text-sm font-medium">
              <span className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors cursor-default">
                <Building2 size={12} className="md:w-3.5 md:h-3.5" /> {job.company}
              </span>
              <div className="w-1 h-1 rounded-full bg-neutral-800" />
              <span className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors cursor-default">
                <MapPin size={12} className="md:w-3.5 md:h-3.5" /> {job.location}
              </span>
            </div>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full border text-xs md:text-sm font-black tracking-tighter flex items-center gap-1 self-start sm:self-auto",
            getMatchScoreColor(job.match_percentage)
          )}>
            {job.match_percentage}% <Star size={12} fill="currentColor" />
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h4 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" /> Key Skills Match
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.matching_skills.slice(0, 5).map((skill, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 text-neutral-400 text-[10px] font-bold border border-white/5 hover:bg-white/10 transition-colors">
                  {skill}
                </span>
              ))}
              {job.matching_skills.length > 5 && (
                <span className="px-2.5 py-1 text-neutral-600 text-[10px] font-bold">+{job.matching_skills.length - 5} more</span>
              )}
            </div>
          </section>

          <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <h4 className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              <Info size={14} /> Agent Intelligence
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
              {job.reasoning}
            </p>
          </section>

          {job.weaknesses && job.weaknesses.length > 0 && (
            <section className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
              <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <AlertCircle size={14} /> Profile Weaknesses
              </h4>
              <div className="space-y-3">
                {job.weaknesses.map((w, i) => (
                  <div key={i} className="flex gap-3 items-start group/w">
                    <span className="text-[10px] font-black text-red-500/50 mt-0.5">{i+1}</span>
                    <p className="text-[11px] text-neutral-400 leading-snug group-hover/w:text-neutral-200 transition-colors">
                      {w}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {job.improvement_suggestions && job.improvement_suggestions.length > 0 && (
            <section className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
              <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <Lightbulb size={14} /> Improvement Guide
              </h4>
              <div className="space-y-3">
                {job.improvement_suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3 items-start group/s">
                    <span className="text-[10px] font-black text-amber-500/50 mt-0.5">{i+1}</span>
                    <p className="text-[11px] text-neutral-400 leading-snug group-hover/s:text-neutral-200 transition-colors">
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {job.interview_questions && job.interview_questions.length > 0 && (
            <section className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4">
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <MessageSquare size={14} /> Interview Prep
              </h4>
              <div className="space-y-3">
                {job.interview_questions.map((q, i) => (
                  <div key={i} className="flex gap-3 items-start group/q">
                    <span className="text-[10px] font-black text-purple-500/50 mt-0.5">{i+1}</span>
                    <p className="text-[11px] text-neutral-400 leading-snug group-hover/q:text-neutral-200 transition-colors">
                      {q}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="mt-auto p-5 pt-0 flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <a 
            href={applyUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-[2] h-12 rounded-2xl bg-neutral-100 text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-white transition-all active:scale-95 shadow-lg shadow-black/50 cursor-pointer"
          >
            Apply Now <ExternalLink size={16} />
          </a>
          <a 
            href={searchUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            title="Search on Google"
            className="flex-1 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Search size={14} /> Search Web
          </a>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            className={cn(
              "flex-1 h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95",
              isSaved ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" : "bg-white/5 text-neutral-400 border border-white/5 hover:bg-white/10 hover:text-white"
            )}
          >
            <Star size={14} fill={isSaved ? "currentColor" : "none"} /> {isSaved ? 'Saved' : 'Save Job'}
          </button>
          <button 
            onClick={handleDismiss}
            className="flex-1 h-10 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400/80 font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-95"
          >
            Not Interested
          </button>
        </div>
      </div>
    </div>
  );
}
