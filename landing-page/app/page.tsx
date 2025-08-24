"use client";

import { useState } from 'react';
import { ChevronRight, Terminal, Sparkles, Copy, Check, X, CheckCircle } from 'lucide-react';

export default function Home() {
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">SnapCommit</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#install" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                Install
              </a>
              <a href="#install" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Stop Writing
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Bad Commit Messages
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              AI generates perfect commit messages for you
            </p>
          </div>

          {/* Before vs After Comparison */}
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {/* Before - Problem */}
              <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 flex items-center">
                  <X className="w-6 h-6 mr-3" />
                  <h3 className="text-xl font-semibold">Before (The Problem)</h3>
                </div>
                <div className="p-6">
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm space-y-2">
                    <div className="text-green-400">$ git add src/auth.js</div>
                    <div className="text-blue-400">$ git commit -m "fix"</div>
                    <div className="text-yellow-400">$ git push</div>
                  </div>
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">
                      😞 Vague commit messages make it impossible to understand what changed
                    </p>
                  </div>
                </div>
              </div>

              {/* After - Solution */}
              <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3" />
                  <h3 className="text-xl font-semibold">After (With SnapCommit)</h3>
                </div>
                <div className="p-6">
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm space-y-2">
                    <div className="text-green-400">$ git add src/auth.js</div>
                    <div className="text-purple-400">$ cg</div>
                    <div className="text-slate-400 text-xs">✨ AI suggests: "fix: resolve JWT token validation error in auth middleware"</div>
                    <div className="text-slate-400 text-xs">✅ Selected and committed!</div>
                    <div className="text-yellow-400">$ git push</div>
                  </div>
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">
                      🎉 Clear, descriptive commit messages generated instantly by AI
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Install Section */}
      <section id="install" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-8">
            Get Started in 30 Seconds
          </h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="flex items-center justify-center mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-4">1</span>
                <h3 className="text-xl font-semibold text-slate-800">Install Globally (requires Node.js)</h3>
              </div>
              <div className="relative bg-slate-900 rounded-lg p-4 font-mono text-sm max-w-md mx-auto">
                <code className="text-green-400">npm install -g snap-commit</code>
                <button
                  onClick={() => copyToClipboard('npm install -g snap-commit', 'install')}
                  className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedStates['install'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="flex items-center justify-center mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-4">2</span>
                <h3 className="text-xl font-semibold text-slate-800">Use it from any repo</h3>
              </div>
              <div className="space-y-3 max-w-md mx-auto">
                <div className="relative bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <code className="text-blue-400">git add .</code>
                  <button
                    onClick={() => copyToClipboard('git add .', 'add')}
                    className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedStates['add'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative bg-slate-900 rounded-lg p-4 font-mono text-sm">
                  <code className="text-purple-400">cg -3</code>
                  <button
                    onClick={() => copyToClipboard('cg -3', 'commit')}
                    className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedStates['commit'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-center text-slate-500 text-sm">
                  Pick from 3 AI-generated commit messages
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-semibold text-slate-800">That's it!</h3>
              </div>
              <p className="text-lg text-slate-700">
                AI analyzes your changes and generates perfect commit messages. 
                <br />
                Use <code className="bg-white px-2 py-1 rounded font-mono text-sm">cg</code> (short) or <code className="bg-white px-2 py-1 rounded font-mono text-sm">commit-gen</code> (full command).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">SnapCommit</span>
            </div>
            
            <div className="flex items-center space-x-6 text-slate-400">
              <p>&copy; 2025 SnapCommit. All rights reserved.</p>
              <a 
                href="https://github.com/tshepo89823ds/commit-gen" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}