export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="grid size-8 place-items-center rounded-xl bg-teal">
        <svg viewBox="0 0 24 24" className="size-[18px] fill-lime" aria-hidden="true">
          <path d="M13.2 2 4.5 13.4c-.4.5 0 1.2.6 1.2H10l-1 7.1c-.1.7.8 1 1.2.4L19 10.6c.4-.5 0-1.2-.6-1.2H14l.9-6.4c.1-.8-.9-1.2-1.7-1Z" />
        </svg>
      </span>
      <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">
        Prowatt<span className="hidden font-normal text-muted sm:inline"> Madagascar</span>
      </span>
    </span>
  );
}
