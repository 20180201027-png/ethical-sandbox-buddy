import { useState } from 'react';
import { ChevronDown, ChevronRight, Terminal, Shield } from 'lucide-react';
import { TOOL_CATEGORIES } from '@/lib/toolOutputs';

interface ToolsSidebarProps {
  onCommandSelect: (cmd: string) => void;
}

const colorMap: Record<string, string> = {
  cyan: 'tool-badge-cyan',
  amber: 'tool-badge-amber',
  red: 'tool-badge-red',
  purple: 'tool-badge-purple',
  green: 'tool-badge',
};

const ToolsSidebar = ({ onCommandSelect }: ToolsSidebarProps) => {
  const [expanded, setExpanded] = useState<string[]>(['Reconnaissance']);

  const toggle = (name: string) => {
    setExpanded(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border/50 flex items-center gap-2">
        <Shield size={14} className="glow-text-green" />
        <span className="text-xs font-bold glow-text-green tracking-wider uppercase">
          Tool Arsenal
        </span>
      </div>

      {/* Quick help */}
      <button
        onClick={() => onCommandSelect('help')}
        className="mx-2 mt-2 p-2 text-xs border border-border/50 rounded text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center gap-2"
      >
        <Terminal size={11} />
        help — show all commands
      </button>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {TOOL_CATEGORIES.map(cat => {
          const isOpen = expanded.includes(cat.name);
          return (
            <div key={cat.name}>
              <button
                onClick={() => toggle(cat.name)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-semibold tracking-wider uppercase text-[10px]">
                  {cat.name}
                </span>
                {isOpen
                  ? <ChevronDown size={11} />
                  : <ChevronRight size={11} />
                }
              </button>

              {isOpen && (
                <div className="pb-1">
                  {cat.tools.map(tool => (
                    <button
                      key={tool.name}
                      onClick={() => onCommandSelect(tool.example)}
                      className="sidebar-item w-full text-left"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`tool-badge ${colorMap[cat.color]}`}>
                          {tool.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {tool.desc}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50">
        <div className="text-[9px] text-muted-foreground space-y-1">
          <div className="glow-text-amber text-[9px] font-bold">⚠ EDUCATIONAL ONLY</div>
          <div>Simulated outputs only.</div>
          <div>Never test unauthorized systems.</div>
        </div>
      </div>
    </div>
  );
};

export default ToolsSidebar;
