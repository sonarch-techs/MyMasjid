export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-clay-bg flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-900/20 border-t-emerald-800 animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-emerald-800/10 animate-pulse" />
      </div>
      <p className="mt-4 text-xs font-semibold tracking-wide text-emerald-950 uppercase">
        Loading...
      </p>
    </div>
  );
}