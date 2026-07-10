"use client";

import { useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MuseumData } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

const chip =
  "rounded-md border border-[rgba(244,244,245,0.14)] px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted";

export default function Landing({ data }: { data: MuseumData }) {
  const { museum, categories, pieces, codeProjects } = data;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-line",
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.15 }
      );
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <main className="relative">
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
      <section id="top" className="relative overflow-hidden px-6 pb-24 pt-40 md:pt-48">
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

      {/* Coding projects */}
      <section id="projects" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="reveal flex items-end justify-between">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] text-accent">
                ENGINEERING
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
                Coding projects
              </h2>
            </div>
            <p className="hidden font-mono text-[11px] tracking-[0.18em] text-muted md:block">
              {codeProjects.length} PROJECTS
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {codeProjects.map((p) => {
              const hasLinks = p.github || p.live;
              return (
                <article
                  key={p.slug}
                  className="reveal panel group flex flex-col overflow-hidden rounded-xl transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,11,0.55)] to-transparent" />
                    {!hasLinks && (
                      <span className="absolute right-3 top-3 rounded-md bg-[rgba(10,10,11,0.8)] px-2 py-1 font-mono text-[9px] tracking-[0.18em] text-accent">
                        COMING SOON
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold text-fg">
                      {p.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted">
                      {p.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tech.map((t) => (
                        <span key={t} className={chip}>
                          {t}
                        </span>
                      ))}
                    </div>
                    {hasLinks && (
                      <div className="mt-4 flex gap-4 font-mono text-[11px] tracking-[0.16em]">
                        {p.github && (
                          <a
                            href={p.github}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted transition-colors hover:text-accent"
                          >
                            GITHUB ↗
                          </a>
                        )}
                        {p.live && (
                          <a
                            href={p.live}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent transition-colors hover:text-fg"
                          >
                            LIVE ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Museum entry */}
      <section id="museum" className="px-6 py-20">
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
              {pieces.length} graphic works hung in {categories.length} walkable
              3D wings — browse the timeline, open a record, then step inside
              the gallery in first person.
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
      <section id="about" className="px-6 pb-16 pt-10">
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
