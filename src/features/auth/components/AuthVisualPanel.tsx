import { ShieldCheck } from "lucide-react";

type AuthVisualPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function AuthVisualPanel({ eyebrow, title, description }: AuthVisualPanelProps) {
  return (
    <aside className="auth-visual" aria-label="MIZAN.AZ hesab üstünlükləri">
      <img className="auth-visual__image" src="/assets/mizan-auth-atmosphere.png" alt="" />
      <div className="auth-visual__top">
        <span className="auth-visual__logo">
          <img src="/assets/mizan-logo.png" alt="" />
        </span>
        <strong>MIZAN.AZ</strong>
      </div>
      <div className="auth-visual__content">
        <span className="auth-visual__eyebrow">
          <ShieldCheck size={17} aria-hidden="true" />
          {eyebrow}
        </span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </aside>
  );
}
