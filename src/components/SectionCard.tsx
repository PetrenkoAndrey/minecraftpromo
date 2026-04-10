import type { ReactNode } from 'react'

type Props = {
  id?: string
  title: string
  titleAccent?: string
  children: ReactNode
  icon?: ReactNode
}

export function SectionCard({
  id,
  title,
  titleAccent,
  children,
  icon,
}: Props) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="rounded-2xl border border-white/[0.06] bg-[#121212] px-5 py-7 sm:px-8 sm:py-9">
        <h2 className="mb-5 flex flex-wrap items-center gap-3 text-lg font-black uppercase leading-tight tracking-wide text-white sm:text-xl">
          {icon}
          <span>{title}</span>
          {titleAccent ? (
            <span className="bg-gradient-to-r from-[#3b82f6] to-[#a855f7] bg-clip-text text-transparent">
              {titleAccent}
            </span>
          ) : null}
        </h2>
        <div className="text-sm leading-relaxed text-white/60">{children}</div>
      </div>
    </section>
  )
}
