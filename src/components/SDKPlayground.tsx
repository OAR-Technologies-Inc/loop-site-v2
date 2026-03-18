'use client';

import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';

// SDK Examples that developers can run
const SDK_EXAMPLES = {
  createVault: {
    name: 'Create Vault',
    description: 'Initialize a new user vault for stacking rewards',
    code: `// Create a new Loop Vault
import { LoopSDK } from '@loop-protocol/sdk';

const sdk = new LoopSDK({ 
  network: 'devnet',
  wallet: connectedWallet 
});

// Create vault with inheritance settings
const vault = await sdk.createVault({
  owner: wallet.publicKey,
  inheritanceDelay: 365 * 24 * 60 * 60, // 1 year
  beneficiary: beneficiaryPublicKey
});

console.log('Vault created:', vault.address);
console.log('Transaction:', vault.signature);`
  },
  
  stackRewards: {
    name: 'Stack Rewards',
    description: 'Lock CRED tokens to earn yield',
    code: `// Stack rewards in your vault
import { LoopSDK } from '@loop-protocol/sdk';

const sdk = new LoopSDK({ network: 'devnet' });

// Stack 100 CRED at 15% APY
const result = await sdk.stackRewards({
  vault: vaultAddress,
  amount: 100_000_000, // 100 CRED (6 decimals)
  lockDuration: 30 * 24 * 60 * 60 // 30 days
});

console.log('Stacked:', result.amount / 1e6, 'CRED');
console.log('APY:', result.apy + '%');
console.log('Unlock date:', new Date(result.unlockTime * 1000));`
  },

  captureTransaction: {
    name: 'Capture Shopping',
    description: 'Record a POS transaction and earn rewards',
    code: `// Capture a shopping transaction
import { LoopSDK } from '@loop-protocol/sdk';

const sdk = new LoopSDK({ network: 'devnet' });

// Merchant captures a sale
const capture = await sdk.captureTransaction({
  merchant: merchantPubkey,
  customer: customerVault,
  amount: 25_500_000, // $25.50 purchase
  pool: merchantPoolAddress,
  rewardRate: 0.03 // 3% cashback
});

console.log('Transaction captured:', capture.txId);
console.log('Reward earned:', capture.reward / 1e6, 'CRED');
console.log('Auto-stacked:', capture.autoStacked ? 'Yes' : 'No');`
  },

  getVaultBalance: {
    name: 'Get Vault Balance',
    description: 'Query vault balances and stacking positions',
    code: `// Get vault balance and positions
import { LoopSDK } from '@loop-protocol/sdk';

const sdk = new LoopSDK({ network: 'devnet' });

const vault = await sdk.getVault(vaultAddress);

console.log('=== Vault Status ===');
console.log('Liquid CRED:', vault.liquidBalance / 1e6);
console.log('Stacked CRED:', vault.stackedBalance / 1e6);
console.log('Total value:', vault.totalValue / 1e6);
console.log('');
console.log('=== Stacking Positions ===');
vault.positions.forEach((pos, i) => {
  console.log(\`Position \${i + 1}:\`);
  console.log('  Amount:', pos.amount / 1e6, 'CRED');
  console.log('  APY:', pos.apy + '%');
  console.log('  Unlocks:', new Date(pos.unlockTime * 1000));
});`
  },

  createMerchantPool: {
    name: 'Create Merchant Pool',
    description: 'Set up a reward pool for your business',
    code: `// Create a merchant reward pool
import { LoopSDK } from '@loop-protocol/sdk';

const sdk = new LoopSDK({ network: 'devnet' });

const pool = await sdk.createMerchantPool({
  merchant: merchantWallet.publicKey,
  name: 'Coffee District Rewards',
  rewardRate: 0.05, // 5% base reward
  bonusMultiplier: 1.5, // 1.5x for stacked users
  initialFunding: 10000_000_000 // 10,000 CRED
});

console.log('Pool created:', pool.address);
console.log('Pool ID:', pool.poolId);
console.log('Reward rate:', pool.rewardRate * 100 + '%');`
  },

  claimYield: {
    name: 'Claim Yield',
    description: 'Harvest accumulated stacking rewards',
    code: `// Claim accumulated yield
import { LoopSDK } from '@loop-protocol/sdk';

const sdk = new LoopSDK({ network: 'devnet' });

// Check pending yield first
const pending = await sdk.getPendingYield(vaultAddress);
console.log('Pending yield:', pending.amount / 1e6, 'CRED');

// Claim it
const claim = await sdk.claimYield({
  vault: vaultAddress,
  autoRestack: true // Compound the yield
});

console.log('Claimed:', claim.amount / 1e6, 'CRED');
console.log('New stacked balance:', claim.newStackedBalance / 1e6);
console.log('Effective APY:', claim.effectiveApy + '%');`
  }
};

// Simulated SDK responses (realistic data structures)
function simulateSDKCall(code: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = Date.now();
      const randomAddr = () => 
        Array.from({ length: 44 }, () => 
          'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
            Math.floor(Math.random() * 58)
          ]
        ).join('');
      
      const randomSig = () =>
        Array.from({ length: 88 }, () =>
          'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
            Math.floor(Math.random() * 58)
          ]
        ).join('');

      let output = '';

      if (code.includes('createVault')) {
        output = `Vault created: ${randomAddr()}
Transaction: ${randomSig()}`;
      } else if (code.includes('stackRewards')) {
        output = `Stacked: 100 CRED
APY: 15%
Unlock date: ${new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString()}`;
      } else if (code.includes('captureTransaction')) {
        output = `Transaction captured: ${randomSig().slice(0, 20)}...
Reward earned: 0.765 CRED
Auto-stacked: Yes`;
      } else if (code.includes('getVault')) {
        output = `=== Vault Status ===
Liquid CRED: 45.50
Stacked CRED: 1,234.00
Total value: 1,279.50

=== Stacking Positions ===
Position 1:
  Amount: 500 CRED
  APY: 12%
  Unlocks: ${new Date(now + 15 * 24 * 60 * 60 * 1000).toISOString()}
Position 2:
  Amount: 734 CRED
  APY: 18%
  Unlocks: ${new Date(now + 45 * 24 * 60 * 60 * 1000).toISOString()}`;
      } else if (code.includes('createMerchantPool')) {
        output = `Pool created: ${randomAddr()}
Pool ID: pool_coffee_district_${Math.floor(Math.random() * 1000)}
Reward rate: 5%`;
      } else if (code.includes('claimYield')) {
        output = `Pending yield: 23.45 CRED
Claimed: 23.45 CRED
New stacked balance: 1,257.45
Effective APY: 14.2%`;
      } else {
        output = `// Executed successfully
// SDK simulation mode - deploy to devnet for real transactions`;
      }

      resolve(output);
    }, 800 + Math.random() * 400);
  });
}

export default function SDKPlayground() {
  const [selectedExample, setSelectedExample] = useState<keyof typeof SDK_EXAMPLES>('createVault');
  const [code, setCode] = useState(SDK_EXAMPLES.createVault.code);
  const [output, setOutput] = useState('// Output will appear here after running');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExampleChange = useCallback((key: keyof typeof SDK_EXAMPLES) => {
    setSelectedExample(key);
    setCode(SDK_EXAMPLES[key].code);
    setOutput('// Output will appear here after running');
  }, []);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput('// Executing...');
    
    try {
      const result = await simulateSDKCall(code);
      setOutput(result);
    } catch (err) {
      setOutput(`Error: ${err}`);
    } finally {
      setIsRunning(false);
    }
  }, [code]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <section id="playground" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            SDK Playground
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Try the Loop Protocol SDK. Real code, real types, simulated responses.
            <br />
            <span className="text-[#D4AF37]">Deploy to devnet for live transactions.</span>
          </p>
        </div>

        {/* Example Selector */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {Object.entries(SDK_EXAMPLES).map(([key, example]) => (
            <button
              key={key}
              onClick={() => handleExampleChange(key as keyof typeof SDK_EXAMPLES)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedExample === key
                  ? 'bg-[#1B4D3E] text-white'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] hover:text-white'
              }`}
            >
              {example.name}
            </button>
          ))}
        </div>

        {/* Description */}
        <p className="text-center text-gray-500 mb-6">
          {SDK_EXAMPLES[selectedExample].description}
        </p>

        {/* Editor + Output */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Code Editor */}
          <div className="rounded-xl overflow-hidden border border-[#2a2a2a]">
            <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-gray-400 text-sm font-mono">example.ts</span>
              </div>
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <Editor
              height="400px"
              defaultLanguage="typescript"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="rounded-xl overflow-hidden border border-[#2a2a2a]">
            <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between border-b border-[#2a2a2a]">
              <span className="text-gray-400 text-sm font-mono">Output</span>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isRunning
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-[#1B4D3E] text-white hover:bg-[#2a6b54]'
                }`}
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Running...
                  </span>
                ) : (
                  '▶ Run'
                )}
              </button>
            </div>
            <div className="bg-[#0d0d0d] h-[400px] p-4 overflow-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                <code className={output.startsWith('Error') ? 'text-red-400' : 'text-green-400'}>
                  {output}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* SDK Info */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-[#111] rounded-xl p-6 border border-[#222]">
            <div className="text-2xl mb-2">📦</div>
            <h3 className="text-white font-semibold mb-1">Install SDK</h3>
            <code className="text-sm text-[#D4AF37] font-mono">
              npm i @loop-protocol/sdk
            </code>
          </div>
          <div className="bg-[#111] rounded-xl p-6 border border-[#222]">
            <div className="text-2xl mb-2">🔧</div>
            <h3 className="text-white font-semibold mb-1">48 Methods</h3>
            <p className="text-sm text-gray-400">
              Vaults, stacking, transfers, pools, agents
            </p>
          </div>
          <div className="bg-[#111] rounded-xl p-6 border border-[#222]">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="text-white font-semibold mb-1">Full TypeScript</h3>
            <p className="text-sm text-gray-400">
              Complete types, autocomplete, docs
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://github.com/OAR-Technologies-Inc/loop-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4D3E] text-white rounded-xl font-medium hover:bg-[#2a6b54] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
          <p className="text-gray-500 text-sm mt-3">
            Star the repo • Read the docs • Build something
          </p>
        </div>
      </div>
    </section>
  );
}
