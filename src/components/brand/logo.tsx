import { cn } from "cn"

export function LogoMark({ className, light = false }: { className?: string; light?: boolean }) {
  const cover = light ? "#F4EFE4" : "#1F6B4A"
  const page = light ? "#1F6B4A" : "#F7F3EA"
  const pageAlt = light ? "#245C40" : "#E7F0E8"
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill={cover} />
      <path d="M7.5 9.2h7.4c1.5 0 2.6.9 2.6 2.3V23H9.6c-1.3 0-2.1-.8-2.1-1.9V9.2Z" fill={page} />
      <path d="M24.5 9.2h-7.4c-1.5 0-2.6.9-2.6 2.3V23h8.1c1.3 0 2.1-.8 2.1-1.9V9.2Z" fill={pageAlt} />
      <path d="M16 11.2v11.2" stroke="#C4622D" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark light={inverted} />
      <span className={cn("font-heading text-[1.35rem] leading-none tracking-tight", inverted ? "text-sidebar-foreground" : "text-foreground")}>
        Handbookly
      </span>
    </span>
  )
}
