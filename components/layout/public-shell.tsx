import { BrandMark } from "@/components/layout/brand-mark";

/** Minimal unauthenticated chrome for sign-in, invitations, and factory links. */
export function PublicShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="public-shell">
      <div className="public-card">
        <div className="public-brand">
          <BrandMark />
          <div>
            <strong>Custm.ink</strong>
            <span>Studio</span>
          </div>
        </div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="public-subtitle">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
