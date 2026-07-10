"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CodeProject, MuseumData } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

const chip =
  "rounded-md border border-[rgba(244,244,245,0.14)] px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted";

function ProjectLinks({ p, big }: { p: CodeProject; big?: boolean }) {
  const cls = `font-mono ${big ? "text-[12px]" : "text-[11px]"} tracking-[0.16em]`;
  if (!p.github && !p.live && !p.appstore)
    return (
      <span className={`${cls} text-accent`}>COMING SOON</span>
    );
  return (
    <div className={`flex gap-5 ${cls}`}>
      {p.live && (
        <a href={p.live} target="_blank" rel="noreferrer" className="text-accent transition-colors hover:text-fg">
          LIVE ↗
        </a>
      )}
      {p.appstore && (
        <a href={p.appstore} target="_blank" rel="noreferrer" className="text-accent transition-colors hover:text-fg">
          APP STORE ↗
        </a>
      )}
      {p.github && (
        <a href={p.github} target="_blank" rel="noreferrer" className="text-muted transition-colors hover:text-accent">
          GITHUB ↗
        </a>
      )}
    </div>
  );
}

export default function Landing({ data }: { data: MuseumData }) {
  const { museum, categories, pieces, codeProjects } = data;
  const featured = codeProjects.filter((p) => p.featured);
  const others = codeProjects.filter((p) => !p.featured);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-line",
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.15 }
      );
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });

      // Feature images drift slower than the page (parallax)
      gsap.utils.toArray<HTMLElement>(".parallax-img").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: { trigger: el, scrub: 0.6 },
          }
        );
      });

      // Mouse tilt on feature cards
      gsap.utils.toArray<HTMLElement>(".tilt-card").forEach((card) => {
        gsap.set(card, { transformPerspective: 900 });
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });
        const move = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          ry(px * 10);
          rx(-py * 8);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        card.addEventListener("mousemove", move);
        card.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          card.removeEventListener("mousemove", move);
          card.removeEventListener("mouseleave", leave);
        });
      });

      // Cursor-following preview for the list rows
      const preview = previewRef.current;
      if (preview) {
        const xTo = gsap.quickTo(preview, "x", { duration: 0.4, ease: "power3" });
        const yTo = gsap.quickTo(preview, "y", { duration: 0.4, ease: "power3" });
        const move = (e: MouseEvent) => {
          xTo(e.clientX + 28);
          yTo(e.clientY - 100);
        };
        window.addEventListener("mousemove", move);
        cleanups.push(() => window.removeEventListener("mousemove", move));
      }
    });
    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  const showPreview = (src: string) => {
    setPreviewSrc(src);
    gsap.to(previewRef.current, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out" });
  };
  const hidePreview = () => {
    gsap.to(previewRef.current, { autoAlpha: 0, scale: 0.92, duration: 0.3, ease: "power3.in" });
  };

  return (
    <main className="relative">
      {/* Cursor-following project preview */}
      <div
        ref={previewRef}
        className="pointer-events-none fixed left-0 top-0 z-30 hidden w-80 overflow-hidden rounded-xl border border-[rgba(244,244,245,0.18)] opacity-0 shadow-[0_30px_80px_rgba(0,0,0,0.7)] md:block"
        style={{ transform: "scale(0.92)" }}
      >
        {previewSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt="" className="h-48 w-full object-cover" />
        )}
      </div>

      {/* Nav */}
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-[rgba(244,244,245,0.08)] bg-[rgba(10,10,11,0.75)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="font-display text-lg font-semibold tracking-tight text-fg">
            AK<span className="text-accent">.</span>
          </a>
          <div className="flex items-center gap-6 font-mono text-[11px] tracking-[0.18em]">
            <a href="#projects" className="text-muted transition-colors hover:text-fg">
              PROJECTS
            </a>
            <Link href="/museum" className="text-muted transition-colors hover:text-fg">
              MUSEUM
            </Link>
            <a href="#about" className="hidden text-muted transition-colors hover:text-fg sm:block">
              ABOUT
            </a>
            <a
              href="https://github.com/amink21"
              target="_blank"
              rel="noreferrer"
              className="text-muted transition-colors hover:text-fg"
            >
              GITHUB
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden px-6 pb-20 pt-40 md:pt-48">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(56% 44% at 68% 8%, rgba(79,127,255,0.14), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(244,244,245,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(244,244,245,0.5) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <p className="hero-line font-mono text-[11px] tracking-[0.3em] text-accent">
            MONTREAL · SOFTWARE DEVELOPER & DESIGNER
          </p>
          <h1 className="hero-line mt-5 max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-fg md:text-7xl">
            Amin Kadawala builds software — and hangs his design work in a
            walkable museum.
          </h1>
          <p className="hero-line mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
            {museum.about}
          </p>
          <div className="hero-line mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="rounded-lg bg-accent px-5 py-3 font-mono text-[11px] tracking-[0.2em] text-base transition-opacity hover:opacity-85"
            >
              VIEW PROJECTS ↓
            </a>
            <Link
              href="/museum"
              className="group rounded-lg border border-[rgba(79,127,255,0.5)] px-5 py-3 font-mono text-[11px] tracking-[0.2em] text-accent transition-colors hover:bg-accent hover:text-base"
            >
              ENTER THE DESIGN MUSEUM{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Engineering marquee */}
      <div id="projects" className="marquee reveal border-y border-[rgba(244,244,245,0.08)] py-5">
        <div className="marquee-track font-display text-5xl font-semibold tracking-tight md:text-6xl">
          {[0, 1].map((i) => (
            <span key={i} className="inline-flex items-baseline gap-14">
              <span className="text-fg">ENGINEERING</span>
              <span className="stroke-text">SELECTED WORK</span>
              <span className="text-accent">✦</span>
              <span className="stroke-text">ENGINEERING</span>
              <span className="text-fg">SELECTED WORK</span>
              <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Featured projects */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl space-y-28">
          {featured.map((p, i) => (
            <article
              key={p.slug}
              data-project
              className={`reveal grid grid-cols-1 items-center gap-10 md:grid-cols-2 ${
                i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Image */}
              <a
                href={p.live || p.appstore || p.github || "#"}
                target="_blank"
                rel="noreferrer"
                className="tilt-card group relative block overflow-hidden rounded-2xl border border-[rgba(244,244,245,0.12)] shadow-[0_40px_100px_rgba(0,0,0,0.55)]"
              >
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="parallax-img h-72 w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.05] md:h-96"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,11,0.5)] via-transparent to-transparent" />
                <span className="absolute bottom-4 right-4 rounded-md bg-[rgba(10,10,11,0.8)] px-2.5 py-1.5 font-mono text-[10px] tracking-[0.18em] text-fg opacity-0 transition-opacity group-hover:opacity-100">
                  OPEN ↗
                </span>
              </a>

              {/* Copy */}
              <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-16 left-0 select-none font-display text-[9rem] font-semibold leading-none text-[rgba(244,244,245,0.045)]"
                >
                  0{i + 1}
                </span>
                <p className="relative font-mono text-[11px] tracking-[0.3em] text-accent">
                  FEATURED · 0{i + 1}
                </p>
                <h3 className="relative mt-3 font-display text-4xl font-semibold tracking-tight text-fg md:text-5xl">
                  {p.title}
                </h3>
                <p className="relative mt-5 max-w-md text-[14.5px] leading-relaxed text-muted">
                  {p.description}
                </p>
                <div className="relative mt-6 flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span key={t} className={chip}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="relative mt-7">
                  <ProjectLinks p={p} big />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Archive list with cursor preview */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <p className="reveal font-mono text-[11px] tracking-[0.3em] text-accent">
            MORE BUILDS
          </p>
          <div className="reveal mt-6" onMouseLeave={hidePreview}>
            {others.map((p, i) => (
              <div
                key={p.slug}
                data-project
                onMouseEnter={() => showPreview(p.image)}
                className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-t border-[rgba(244,244,245,0.1)] py-6 transition-colors last:border-b hover:bg-[rgba(244,244,245,0.02)] md:grid-cols-[4rem_1fr_1fr_auto]"
              >
                <span className="font-mono text-[11px] tracking-[0.14em] text-muted">
                  {String(i + featured.length + 1).padStart(2, "0")}
                </span>
                <h4 className="font-display text-xl font-semibold text-fg transition-transform duration-300 group-hover:translate-x-2 md:text-2xl">
                  {p.title}
                </h4>
                <span className="hidden font-mono text-[11px] tracking-[0.1em] text-muted md:block">
                  {p.tech.slice(0, 3).join(" · ")}
                </span>
                <ProjectLinks p={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Museum entry */}
      <section id="museum" className="px-6 pb-20">
        <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[rgba(244,244,245,0.12)]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/museum-teaser.jpg)" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(10,10,11,0.92)_25%,rgba(10,10,11,0.45)_70%,rgba(10,10,11,0.2))]" />
          <div className="relative px-8 py-16 md:px-14 md:py-24">
            <p className="font-mono text-[11px] tracking-[0.3em] text-accent">
              DESIGN
            </p>
            <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold tracking-tight text-fg md:text-5xl">
              {museum.name}
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">
              {pieces.length} graphic works in one continuous wing — walk it in
              first person, glide between {categories.length} sections, click
              any piece to inspect it up close.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {categories.map((c) => (
                <span
                  key={c.slug}
                  title={c.name}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: c.color }}
                />
              ))}
              <span className="ml-2 font-mono text-[10px] tracking-[0.18em] text-muted">
                {categories.map((c) => c.name).join(" · ")}
              </span>
            </div>
            <Link
              href="/museum"
              className="group mt-9 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-mono text-[11px] tracking-[0.2em] text-base transition-opacity hover:opacity-85"
            >
              ENTER THE MUSEUM
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* About / contact */}
      <section id="about" className="px-6 pb-16 pt-6">
        <div className="mx-auto max-w-6xl">
          <div className="reveal grid grid-cols-1 gap-10 border-t border-[rgba(244,244,245,0.08)] pt-14 md:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] text-accent">
                ABOUT
              </p>
              <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-muted">
                {museum.about}
              </p>
            </div>
            <div className="md:justify-self-end">
              <p className="font-mono text-[11px] tracking-[0.3em] text-accent">
                CONTACT
              </p>
              <ul className="mt-4 space-y-3 font-mono text-[13px] tracking-[0.08em]">
                <li>
                  <a
                    href={`mailto:${museum.contact}`}
                    className="text-fg transition-colors hover:text-accent"
                  >
                    {museum.contact}
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/amink21"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted transition-colors hover:text-accent"
                  >
                    github.com/amink21
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/amin-kadawala/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted transition-colors hover:text-accent"
                  >
                    linkedin.com/in/amin-kadawala
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-16 font-mono text-[10px] tracking-[0.2em] text-muted">
            © {new Date().getFullYear()} AMIN KADAWALA
          </p>
        </div>
      </section>
    </main>
  );
}
