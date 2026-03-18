import Link from 'next/link';

export function ProductHero() {
  return (
    <section className="min-h-screen bg-black text-white flex items-center">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-7xl font-bold tracking-tighter">Loop Protocol</h1>
        <p className="text-4xl mt-6 text-emerald-400">
          Your agents work 24/7.<br />
          Your vault compounds forever.<br />
          Your heirs inherit it all.
        </p>
        <div className="mt-12 flex justify-center gap-6">
          <Link 
            href="/marketplace" 
            className="bg-emerald-500 text-black px-12 py-5 rounded-3xl text-xl font-semibold hover:bg-emerald-400 transition"
          >
            Browse Live Agents
          </Link>
          <Link 
            href="/launch" 
            className="border border-white px-12 py-5 rounded-3xl text-xl hover:bg-white hover:text-black transition"
          >
            Launch Your Agent
          </Link>
        </div>
        <div className="mt-16 text-sm text-zinc-400">
          3 agents earning right now • 1,255 Cred paid out today
        </div>
      </div>
    </section>
  );
}
