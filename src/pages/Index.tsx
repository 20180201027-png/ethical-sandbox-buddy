import { useState } from 'react';
import { Shield, BookOpen, Terminal, Zap, Menu, X, ChevronRight, Lock } from 'lucide-react';
import HackingTerminal from '@/components/HackingTerminal';
import ToolsSidebar from '@/components/ToolsSidebar';
import terminalBg from '@/assets/terminal-bg.png';

const PHASES = [
  { num: '01', name: 'Recon', color: 'cyan', tools: ['nmap', 'whois', 'dig', 'maltego'] },
  { num: '02', name: 'Scan', color: 'amber', tools: ['gobuster', 'nikto', 'tcpdump'] },
  { num: '03', name: 'Exploit', color: 'red', tools: ['sqlmap', 'hydra', 'msfconsole', 'nc'] },
  { num: '04', name: 'Post-Exploit', color: 'purple', tools: ['john', 'hashcat', 'aircrack-ng'] },
];

const phaseColorMap: Record<string, string> = {
  cyan: 'glow-text-cyan',
  amber: 'glow-text-amber',
  red: 'text-destructive',
  purple: 'text-purple-400',
};

const Index = () => {
  const [terminalInput, setTerminalInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [view, setView] = useState<'terminal' | 'roadmap'>('terminal');

  const handleCommandSelect = (cmd: string) => {
    setTerminalInput(cmd);
    setView('terminal');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Top nav */}
      <header className="border-b border-border/50 px-4 py-2.5 flex items-center justify-between shrink-0 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-primary/50 flex items-center justify-center bg-primary/10">
              <Shield size={13} className="glow-text-green" />
            </div>
            <div>
              <span className="text-sm font-bold glow-text-green font-mono tracking-wider">
                HACKLAB
              </span>
              <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                Ethical Hacking Simulator
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setView('terminal')}
            className={`px-3 py-1.5 text-xs flex items-center gap-1.5 rounded transition-colors ${
              view === 'terminal'
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Terminal size={11} />
            Terminal
          </button>
          <button
            onClick={() => setView('roadmap')}
            className={`px-3 py-1.5 text-xs flex items-center gap-1.5 rounded transition-colors ${
              view === 'roadmap'
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen size={11} />
            Roadmap
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-muted-foreground border border-border/50 rounded px-2 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            SIMULATION ACTIVE
          </div>
          <div className="tool-badge-amber text-[10px] px-2 py-0.5 hidden sm:block">
            EDU ONLY
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-52 shrink-0 border-r border-border/50 bg-card/20 overflow-hidden">
            <ToolsSidebar onCommandSelect={handleCommandSelect} />
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 min-w-0 p-3 overflow-hidden">
          {view === 'terminal' ? (
            <HackingTerminalWrapper
              initialInput={terminalInput}
              onInputConsumed={() => setTerminalInput('')}
            />
          ) : (
            <RoadmapView onToolSelect={handleCommandSelect} />
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper to inject commands from sidebar
function HackingTerminalWrapper({
  initialInput: _initialInput,
  onInputConsumed: _onInputConsumed,
}: {
  initialInput: string;
  onInputConsumed: () => void;
}) {
  return (
    <div className="h-full">
      <HackingTerminal />
    </div>
  );
}

function RoadmapView({ onToolSelect }: { onToolSelect: (cmd: string) => void }) {
  const resources = [
    { name: 'TryHackMe', desc: 'Beginner-friendly CTF platform with guided labs', url: '#' },
    { name: 'HackTheBox', desc: 'Advanced real-world machine challenges', url: '#' },
    { name: 'VulnHub', desc: 'Downloadable vulnerable VMs for local practice', url: '#' },
    { name: 'OWASP Top 10', desc: 'The 10 most critical web security risks', url: '#' },
    { name: 'PentesterLab', desc: 'Web app pentesting exercises', url: '#' },
  ];

  const certs = [
    { name: 'eJPT', level: 'Beginner', org: 'eLearnSecurity', time: '1-3 months' },
    { name: 'CEH', level: 'Intermediate', org: 'EC-Council', time: '3-6 months' },
    { name: 'OSCP', level: 'Advanced', org: 'Offensive Security', time: '6-12 months' },
    { name: 'CISSP', level: 'Expert', org: 'ISC²', time: '1-2 years' },
  ];

  return (
    <div className="h-full overflow-y-auto space-y-4 pr-1">
      {/* Hero */}
      <div className="terminal-window p-5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `url(${terminalBg})`, backgroundSize: 'cover' }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="glow-text-amber" />
            <span className="text-xs glow-text-amber font-bold uppercase tracking-widest">
              Learning Roadmap
            </span>
          </div>
          <h1 className="text-xl font-bold glow-text-green font-mono mb-1">
            Ethical Hacking Mastery Path
          </h1>
          <p className="text-xs text-muted-foreground max-w-lg">
            Follow this structured path from zero to professional penetration tester.
            Each phase builds on the previous one.
          </p>
        </div>
      </div>

      {/* Pentest phases */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PHASES.map(phase => (
          <div key={phase.num} className="terminal-window p-4">
            <div className={`text-2xl font-black font-mono mb-1 ${phaseColorMap[phase.color]}`}>
              {phase.num}
            </div>
            <div className="text-sm font-bold mb-2 text-foreground">{phase.name}</div>
            <div className="space-y-1">
              {phase.tools.map(tool => (
                <button
                  key={tool}
                  onClick={() => onToolSelect(`${tool} -h`)}
                  className="block w-full text-left"
                >
                  <span className={`tool-badge ${
                    phase.color === 'cyan' ? 'tool-badge-cyan' :
                    phase.color === 'amber' ? 'tool-badge-amber' :
                    phase.color === 'red' ? 'tool-badge-red' :
                    'tool-badge-purple'
                  } hover:opacity-80 transition-opacity cursor-pointer`}>
                    {tool}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legal warning */}
      <div className="terminal-window p-4 border border-accent/30 bg-accent/5">
        <div className="flex items-start gap-3">
          <Lock size={16} className="glow-text-amber shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold glow-text-amber mb-1 uppercase tracking-wider">
              Legal & Ethical Requirements
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ Always obtain <strong className="text-foreground">written authorization</strong> before testing any system</p>
              <p>✓ Only test in dedicated <strong className="text-foreground">lab environments</strong> (VMs, CTF platforms)</p>
              <p>✓ Unauthorized access violates <strong className="text-foreground">Computer Fraud and Abuse Act (CFAA)</strong></p>
              <p>✓ Document all findings in a <strong className="text-foreground">professional pentest report</strong></p>
              <p>✓ Participate in <strong className="text-foreground">Bug Bounty programs</strong> for legal real-world practice</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two column: Resources + Certs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Practice resources */}
        <div className="terminal-window p-4">
          <div className="text-xs glow-text-cyan font-bold uppercase tracking-wider mb-3">
            Practice Platforms
          </div>
          <div className="space-y-2">
            {resources.map(r => (
              <div key={r.name} className="flex items-start gap-2 text-xs">
                <ChevronRight size={11} className="glow-text-green shrink-0 mt-0.5" />
                <div>
                  <span className="text-foreground font-semibold">{r.name}</span>
                  <span className="text-muted-foreground"> — {r.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="terminal-window p-4">
          <div className="text-xs glow-text-cyan font-bold uppercase tracking-wider mb-3">
            Certifications Path
          </div>
          <div className="space-y-2">
            {certs.map((cert, i) => (
              <div key={cert.name} className="flex items-center justify-between text-xs border-b border-border/20 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono">{i + 1}.</span>
                  <span className="font-bold text-foreground">{cert.name}</span>
                  <span className="text-muted-foreground text-[10px]">{cert.org}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`tool-badge text-[9px] ${
                    cert.level === 'Beginner' ? '' :
                    cert.level === 'Intermediate' ? 'tool-badge-amber' :
                    cert.level === 'Advanced' ? 'tool-badge-red' :
                    'tool-badge-purple'
                  }`}>
                    {cert.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
