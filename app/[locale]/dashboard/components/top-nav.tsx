import { Sparkles } from "lucide-react"

export function TopNav({ title }: { title: string }) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">{title}</h2>
      <span className="inline-flex items-center gap-1 rounded-full border border-semantic-info-border/30 bg-semantic-info-bg/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-semantic-info">
        <Sparkles className="size-3" /> AI
      </span>
    </div>
  )
}
