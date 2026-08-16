import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <div className="bg-black py-3.5 text-[13px] tracking-[0.05em]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2.5 px-6">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2.5">
            {i > 0 && <span className="text-white/30">/</span>}
            {item.href ? (
              <Link href={item.href} className="font-semibold text-[#F5C518] hover:opacity-80">
                {item.label}
              </Link>
            ) : (
              <span className="font-bold text-white">{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
