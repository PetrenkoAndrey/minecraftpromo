export function accentClasses(accent: string): { dot: string; price: string } {
  const map: Record<string, { dot: string; price: string }> = {
    emerald: { dot: 'bg-emerald-400', price: 'text-emerald-400' },
    amber: { dot: 'bg-amber-400', price: 'text-amber-400' },
    cyan: { dot: 'bg-cyan-400', price: 'text-cyan-400' },
    red: { dot: 'bg-red-400', price: 'text-red-400' },
    violet: { dot: 'bg-violet-500', price: 'text-violet-400' },
  }
  return map[accent] ?? map.emerald
}
