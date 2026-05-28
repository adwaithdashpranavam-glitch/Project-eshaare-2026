export default function PackagesLoading() {
  return (
    <main className="min-h-screen bg-[#071120] text-white">
      {/* HERO SKELETON */}
      <section className="relative overflow-hidden border-b border-white/10 bg-black/40">
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 animate-pulse">
          <div className="h-4 w-40 bg-white/10 rounded-full mb-6"></div>
          <div className="h-14 w-96 bg-white/10 rounded-3xl mb-6"></div>
          <div className="h-20 w-[550px] bg-white/10 rounded-3xl mb-8"></div>
          <div className="h-14 w-full max-w-2xl bg-white/10 rounded-2xl mb-8"></div>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-32 bg-white/10 rounded-full"></div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES SKELETON */}
      <section className="max-w-7xl mx-auto px-6 py-20 animate-pulse">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-white/10 rounded-2xl mb-3"></div>
            <div className="h-4 w-36 bg-white/10 rounded-full"></div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="relative h-[340px] w-full bg-white/5 border border-white/10 rounded-[30px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
              </div>
              <div className="h-6 w-3/4 bg-white/10 rounded-xl px-2"></div>
              <div className="h-4 w-1/2 bg-white/5 rounded-lg px-2"></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
