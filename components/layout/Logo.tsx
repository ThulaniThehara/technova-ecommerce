import Link from "next/link";

/** The TechNova wordmark: a blue rounded tile with "T", then the name. */
export default function Logo({
  href = "/",
  onDark = false,
  className = "",
}: {
  href?: string | null;
  onDark?: boolean;
  className?: string;
}) {
  const content = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        T
      </span>
      <span className={`text-lg font-bold tracking-tight ${onDark ? "text-white" : "text-ink-900"}`}>TechNova</span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="shrink-0">
      {content}
    </Link>
  );
}
