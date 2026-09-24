import React from "react";
import { useAuth } from "../context/AuthContext";

function BackendStatusBanner() {
  const { isBackendConnected, checkBackendConnection } = useAuth();

  if (isBackendConnected) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/90 backdrop-blur-md text-slate-950 px-4 py-2 text-xs font-bold shadow-lg flex items-center justify-between gap-3 animate-fadeIn border-b border-amber-400">
      <div className="flex items-center gap-2 overflow-hidden mx-auto">
        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0"></span>
        <span className="truncate">
          ⚠️ Backend Offline — Start Node.js backend (<code className="bg-black/20 px-1 py-0.5 rounded font-mono">npm run dev</code> in <code className="bg-black/20 px-1 py-0.5 rounded font-mono">backend/</code>) to load live DB data.
        </span>
      </div>
      <button
        onClick={checkBackendConnection}
        className="bg-slate-900 hover:bg-black text-amber-300 hover:text-white px-3 py-1 rounded-md text-[.72rem] transition-colors shrink-0 font-medium border border-amber-400/40"
      >
        Retry Connection 🔄
      </button>
    </div>
  );
}

export default BackendStatusBanner;
