import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import GuinevereChatBox from "@/components/GuinevereChatBox";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="text-5xl mb-4">🦋</div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🦋</div>
          <h1 className="text-3xl font-light text-slate-900 dark:text-slate-50 mb-2">Guinevere</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6 font-light">Elegant Conversational AI</p>
          <p className="text-slate-500 dark:text-slate-500 mb-8 text-sm">Percakapan yang tenang, elegan, dan bermakna</p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white px-8 py-2 rounded-lg font-light"
          >
            Mulai Percakapan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Top Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-light text-slate-900 dark:text-slate-50">Guinevere AI</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Welcome, {user?.name || "Guest"}</p>
        </div>
        <Button
          onClick={() => logout()}
          variant="outline"
          className="text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-light"
        >
          Logout
        </Button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden">
        <GuinevereChatBox />
      </div>
    </div>
  );
}
