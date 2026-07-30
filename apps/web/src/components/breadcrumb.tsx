import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-4 text-sm text-textMuted">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {item.href ? (
            <Link to={item.href} className="transition hover:text-buyCyan">
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-textMain">{item.label}</span>
          )}
          {index < items.length - 1 ? <span className="mx-2">&gt;</span> : null}
        </span>
      ))}
    </nav>
  );
}
