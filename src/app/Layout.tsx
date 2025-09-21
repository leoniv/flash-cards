import React from "react";
import "./styles/nav.css";

type LayoutProps = {
  onNext?: () => void;
  Controls?: React.ReactNode;  // put any future controls here
  children: React.ReactNode;   // markdown/content
};

export function Layout({ onNext, Controls, children }: LayoutProps) {
  const [open, setOpen] = React.useState(false);

  // Close the mobile drawer if viewport becomes desktop
  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 900px)");
    const onChange = () => setOpen(false);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="app-shell">
      {/* NAV container: becomes a left rail on desktop, top bar on mobile */}
      <aside className="nav" data-open={open ? "true" : "false"}>
        {/* Mobile top bar row */}
        <div className="nav__bar">
          <button
            className="nav__menu"
            aria-label="Open controls"
            onClick={() => setOpen((v) => !v)}
          >
            {/* simple hamburger */}
            <span className="nav__menu-line" />
            <span className="nav__menu-line" />
            <span className="nav__menu-line" />
          </button>

          <div className="nav__brand">Flashcards</div>

          <button className="nav__next" onClick={onNext}>
            Next →
          </button>
        </div>

        {/* Controls area:
            - mobile: collapses under the bar
            - desktop: always visible in the left rail
        */}
        <div className="nav__controls">
          {Controls ?? <div className="nav__controls-empty">No controls yet</div>}
        </div>
      </aside>

      {/* Main content (markdown) */}
      <main className="content">{children}</main>
    </div>
  );
}
