// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Key, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [youtubeKey, setYoutubeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showYT, setShowYT] = useState(false);
  const [showGM, setShowGM] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setYoutubeKey(localStorage.getItem('engage_ai_youtube_api_key') ?? '');
    setGeminiKey(localStorage.getItem('engage_ai_gemini_api_key') ?? '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('engage_ai_youtube_api_key', youtubeKey.trim());
    localStorage.setItem('engage_ai_gemini_api_key', geminiKey.trim());
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/'); }, 1500);
  };

  return (
    <div className="min-h-full p-6 md:p-8">
      <div className="max-w-xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-slate-600 to-slate-800 text-white shadow-lg">
              <Key className="w-5 h-5" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">API Settings</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Store your API keys securely in your browser. Keys never leave your device.
          </p>
        </div>

        {/* API Keys Card */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">

          {/* YouTube API Key */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="youtube-key">
              YouTube Data API Key
            </label>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Required to fetch video metadata and comments from YouTube.
            </p>
            <div className="relative">
              <input
                id="youtube-key"
                type={showYT ? 'text' : 'password'}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition"
                placeholder="AIza…"
                value={youtubeKey}
                onChange={e => setYoutubeKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowYT(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                {showYT ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="gemini-key">
              Gemini API Key
            </label>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Required to generate AI replies using Google Gemini.
            </p>
            <div className="relative">
              <input
                id="gemini-key"
                type={showGM ? 'text' : 'password'}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition"
                placeholder="AIza…"
                value={geminiKey}
                onChange={e => setGeminiKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowGM(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                {showGM ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${
              saved
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:opacity-90 shadow-primary-500/25'
            }`}
            id="save-settings-btn"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Key className="w-4 h-4" />}
            {saved ? 'Saved! Redirecting…' : 'Save API Keys'}
          </button>
        </div>

        {/* Personality Prompt */}
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30 border border-violet-200 dark:border-violet-800/40">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-500 to-pink-500 text-white shadow-md shadow-violet-500/25 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">AI Personality Studio</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Teach the AI to sound like you — casual, professional, funny, and more.</p>
          </div>
          <Link
            to="/personality"
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-xs font-semibold transition shadow-sm shadow-violet-500/20"
          >
            Configure
          </Link>
        </div>

      </div>
    </div>
  );
};
