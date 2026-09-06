import { BrandMark } from "@/components/layout/brand-mark";
import { Wordmark } from "@/components/layout/wordmark";

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
            <Wordmark />
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
