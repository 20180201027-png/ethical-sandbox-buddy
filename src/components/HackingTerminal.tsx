import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, RotateCcw, ChevronRight, BookOpen, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import { simulateCommand, SimulationResult } from '@/lib/toolOutputs';

interface TerminalEntry {
  id: string;
  type: 'input' | 'output' | 'welcome' | 'error' | 'ai';
  content: string;
  result?: SimulationResult;
  timestamp: Date;
}

const severityColors: Record<string, string> = {
  info: 'glow-text-cyan',
  low: 'glow-text-green',
  medium: 'glow-text-amber',
  high: 'glow-text-amber',
  critical: 'text-destructive',
};

const severityLabels: Record<string, string> = {
  info: '[ INFO ]',
  low: '[ LOW RISK ]',
  medium: '[ MEDIUM RISK ]',
  high: '[ HIGH RISK ]',
  critical: '[ CRITICAL ]',
};

const WELCOME_TEXT = `╔══════════════════════════════════════════════════════════╗
║   HACKLAB TERMINAL v1.0  |  Ethical Hacking Simulator    ║
║   For educational purposes only. Safe. Simulated.        ║
╚══════════════════════════════════════════════════════════╝

[*] System initialized. AI tutor online.
[*] Type 'help' to see all available tools.
[*] Example: nmap -sV 192.168.1.1

⚠  Remember: Only test systems you have written permission to test.
   Practice on HackTheBox, TryHackMe, or your own lab environment.`;

export default function HackingTerminal() {
  const [entries, setEntries] = useState<TerminalEntry[]>([
    {
      id: '0',
      type: 'welcome',
      content: WELCOME_TEXT,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'explain' | 'learn'>('output');
  const [selectedEntry, setSelectedEntry] = useState<TerminalEntry | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const handleSubmit = useCallback(async (cmd?: string) => {
    const command = (cmd ?? input).trim();
    if (!command) return;

    const inputEntry: TerminalEntry = {
      id: Date.now().toString(),
      type: 'input',
      content: command,
      timestamp: new Date(),
    };

    setEntries(prev => [...prev, inputEntry]);
    setHistory(prev => [command, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
    setInput('');
    setIsTyping(true);

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 400 + Math.random() * 600));

    const result = simulateCommand(command);

    const outputEntry: TerminalEntry = {
      id: (Date.now() + 1).toString(),
      type: result ? 'output' : 'error',
      content: result
        ? result.output
        : `bash: ${command.split(' ')[0]}: command not found\nTry 'help' to see available commands.`,
      result: result || undefined,
      timestamp: new Date(),
    };

    setEntries(prev => [...prev, outputEntry]);
    setSelectedEntry(outputEntry);
    setIsTyping(false);
    setActiveTab('output');
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIndex);
      setInput(history[newIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setInput(newIndex === -1 ? '' : history[newIndex]);
    }
  };

  const clearTerminal = () => {
    setEntries([{
      id: '0',
      type: 'welcome',
      content: WELCOME_TEXT,
      timestamp: new Date(),
    }]);
    setSelectedEntry(null);
  };

  const currentResult = selectedEntry?.result;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Terminal window */}
      <div className="terminal-window flex-1 flex flex-col min-h-0 scanline">
        {/* Terminal header bar */}
        <div className="terminal-header px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/70" />
              <div className="w-3 h-3 rounded-full bg-accent/70" />
              <div className="w-3 h-3 rounded-full bg-primary/70" />
            </div>
            <span className="text-xs text-muted-foreground ml-2 font-mono">
              root@hacklab:~#
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isTyping && (
              <span className="text-xs glow-text-cyan animate-pulse">
                ● processing...
              </span>
            )}
            <button
              onClick={clearTerminal}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Clear terminal"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Output area */}
        <div
          ref={outputRef}
          className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-mono cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {entries.map((entry) => (
            <div key={entry.id} className="fade-in-up">
              {entry.type === 'welcome' && (
                <pre className="glow-text-green text-xs whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </pre>
              )}

              {entry.type === 'input' && (
                <div className="flex items-start gap-2 mt-3">
                  <span className="glow-text-cyan shrink-0 text-xs">
                    <ChevronRight size={12} className="inline" />
                    root@hacklab:~#
                  </span>
                  <span
                    className="glow-text-green cursor-pointer hover:opacity-80 text-xs"
                    onClick={() => {
                      const related = entries.find(
                        e => e.type === 'output' && entries.indexOf(e) > entries.indexOf(entry)
                      );
                      if (related) setSelectedEntry(related);
                    }}
                  >
                    {entry.content}
                  </span>
                </div>
              )}

              {entry.type === 'output' && (
                <div
                  className={`mt-1 mb-3 cursor-pointer transition-all ${
                    selectedEntry?.id === entry.id
                      ? 'border-l-2 border-primary/50 pl-3'
                      : 'border-l-2 border-transparent pl-3 hover:border-border'
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  {entry.result?.severity && (
                    <div className={`text-[10px] mb-1 font-bold ${severityColors[entry.result.severity]}`}>
                      {severityLabels[entry.result.severity]} — {entry.result.tool.toUpperCase()}
                    </div>
                  )}
                  <pre className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {entry.content}
                  </pre>
                </div>
              )}

              {entry.type === 'error' && (
                <pre className="text-destructive text-xs mt-1 mb-2 pl-3 border-l-2 border-destructive/40 whitespace-pre-wrap">
                  {entry.content}
                </pre>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 mt-2 fade-in-up">
              <span className="text-xs text-muted-foreground">Executing</span>
              <span className="glow-text-green text-xs animate-pulse">▌</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border/50 p-3 flex items-center gap-2 shrink-0 bg-card/50">
          <span className="text-xs glow-text-cyan font-mono shrink-0">
            <ChevronRight size={12} className="inline" />
            root@hacklab:~#
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (e.g. nmap -sV 192.168.1.1)..."
            className="flex-1 bg-transparent outline-none text-xs glow-text-green font-mono placeholder:text-muted-foreground/40 caret-primary"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
          <button
            onClick={() => handleSubmit()}
            className="p-1.5 rounded border border-primary/30 hover:border-primary/70 hover:bg-primary/10 transition-all text-primary"
          >
            <Send size={11} />
          </button>
        </div>
      </div>

      {/* Info panel */}
      {currentResult && (
        <div className="terminal-window shrink-0" style={{ maxHeight: '280px' }}>
          {/* Tab bar */}
          <div className="terminal-header flex items-center gap-0 text-xs border-b border-border/50">
            {(['output', 'explain', 'learn'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 flex items-center gap-1.5 transition-colors capitalize border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'explain' && <BookOpen size={11} />}
                {tab === 'learn' && <Lightbulb size={11} />}
                {tab === 'output' && <AlertTriangle size={11} />}
                {tab}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto p-4" style={{ maxHeight: '220px' }}>
            {activeTab === 'output' && currentResult.nextSteps.length > 0 && (
              <div>
                <div className="text-xs glow-text-cyan font-bold mb-2 uppercase tracking-wider">
                  Recommended Next Steps
                </div>
                <div className="space-y-2">
                  {currentResult.nextSteps.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const cmd = step.split('  ')[0].replace(/^[^:]+:\s*/, '').trim();
                        if (!cmd.includes(' ') || cmd.startsWith('curl') || cmd.startsWith('nmap') || cmd.startsWith('sqlmap') || cmd.startsWith('john') || cmd.startsWith('hashcat')) {
                          setInput(cmd);
                          inputRef.current?.focus();
                        }
                      }}
                      className="w-full text-left text-xs text-muted-foreground hover:text-foreground flex items-start gap-2 group p-1.5 rounded hover:bg-muted/30 transition-colors"
                    >
                      <ArrowRight size={10} className="mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                      <code className="font-mono">{step}</code>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'explain' && (
              <div>
                <div className="text-xs glow-text-cyan font-bold mb-2 uppercase tracking-wider">
                  How It Works
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                  {currentResult.explanation.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('**') ? 'text-foreground font-semibold' : ''}>
                      {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'learn' && (
              <div>
                <div className="text-xs glow-text-cyan font-bold mb-2 uppercase tracking-wider">
                  Key Concepts
                </div>
                <div className="space-y-2">
                  {currentResult.keyLearnings.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="glow-text-green shrink-0 mt-0.5">▸</span>
                      <span className="text-muted-foreground leading-relaxed font-mono">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
