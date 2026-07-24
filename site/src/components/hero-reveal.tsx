export function HeroReveal({ children }: { children: React.ReactNode }) {
  return <div className="hero-copy">{children}</div>;
}

export function HeroRevealItem({ children }: { children: React.ReactNode }) {
  return <div className="hero-reveal-item">{children}</div>;
}

export function SceneReveal({ children }: { children: React.ReactNode }) {
  return <div className="scene-reveal">{children}</div>;
}
