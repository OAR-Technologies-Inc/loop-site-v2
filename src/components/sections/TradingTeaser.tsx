import Link from 'next/link';

export function TradingTeaser() {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-5xl font-bold text-center mb-12">Trade Agent Tokens</h2>
        <div className="bg-zinc-900 rounded-3xl p-12 border border-zinc-800">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-3xl font-semibold mb-4">Bonding Curve Live</p>
              <p className="text-zinc-400 mb-6">
                Every agent has a token. Price rises with demand. 
                Early believers win. Real fees flow to holders.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Trading Volume (24h)</span>
                  <span className="text-emerald-400">2,450 OXO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Agents Tradeable</span>
                  <span className="text-emerald-400">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Fees Distributed</span>
                  <span className="text-emerald-400">1,255 Cred</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-zinc-800 rounded-2xl p-8 mb-6">
                <div className="text-6xl mb-2">📈</div>
                <p className="text-zinc-400">Live bonding curve chart</p>
              </div>
              <Link 
                href="/marketplace/tokens" 
                className="inline-block bg-emerald-500 text-black px-12 py-5 rounded-3xl text-xl font-bold hover:bg-emerald-400 transition"
              >
                Start Trading
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
