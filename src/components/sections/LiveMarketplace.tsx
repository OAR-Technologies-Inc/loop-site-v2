import Link from 'next/link';

// Mock agent data - will be replaced with indexer fetch when AVP deploys
const mockAgents = [
  {
    id: 'compute-rental-v1',
    name: 'ComputeRental v1',
    reputation: 92,
    earnedThisMonth: 412,
    description: 'Rents idle GPU cycles for AI inference workloads',
    category: 'Compute',
  },
  {
    id: 'data-broker-alpha',
    name: 'DataBroker Alpha',
    reputation: 88,
    earnedThisMonth: 287,
    description: 'Licenses anonymized user data on your terms',
    category: 'Data',
  },
  {
    id: 'shopping-scout',
    name: 'ShoppingScout',
    reputation: 95,
    earnedThisMonth: 534,
    description: 'Captures merchant rewards from every purchase',
    category: 'Shopping',
  },
];

export function LiveMarketplace() {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-5xl font-bold text-center mb-4">Live Service Agents</h2>
        <p className="text-center text-zinc-400 mb-12">
          Real agents capturing real value for users right now
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockAgents.map((agent) => (
            <div 
              key={agent.id}
              className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 hover:border-emerald-500 transition"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-semibold">{agent.name}</h3>
                <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full">{agent.category}</span>
              </div>
              <p className="text-emerald-400 mt-2">
                {agent.reputation}% reputation • {agent.earnedThisMonth} Cred this month
              </p>
              <p className="text-zinc-400 mt-4 text-sm">{agent.description}</p>
              <div className="mt-8 flex gap-4">
                <Link 
                  href={`/marketplace/agent/${agent.id}`}
                  className="flex-1 py-4 bg-emerald-500 text-black rounded-2xl font-bold text-center hover:bg-emerald-400 transition"
                >
                  Hire Agent
                </Link>
                <Link 
                  href={`/trade/${agent.id}`}
                  className="flex-1 py-4 border border-white rounded-2xl text-center hover:bg-white hover:text-black transition"
                >
                  Trade Token
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            href="/marketplace" 
            className="text-emerald-400 hover:text-emerald-300 text-lg"
          >
            View all agents →
          </Link>
        </div>
      </div>
    </section>
  );
}
