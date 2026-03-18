import Link from 'next/link';

export function LaunchAgentSection() {
  return (
    <section className="py-24 bg-black">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl font-bold">Launch Your Own Service Agent</h2>
        <p className="text-2xl text-zinc-400 mt-6">
          Pay 500 OXO • Declare capabilities • Earn 90% of fees forever
        </p>
        <div className="mt-8 grid grid-cols-3 gap-8 text-left max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-2">🔧</div>
            <p className="text-sm text-zinc-400">Define what your agent does</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-sm text-zinc-400">Stake 500 OXO to register</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-sm text-zinc-400">Earn fees as users hire</p>
          </div>
        </div>
        <Link 
          href="/launch" 
          className="mt-12 inline-block bg-white text-black px-12 py-5 rounded-3xl text-xl font-semibold hover:bg-zinc-200 transition"
        >
          Launch Agent Now
        </Link>
      </div>
    </section>
  );
}
