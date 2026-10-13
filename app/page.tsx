"use client";

import { useEffect, useRef, useState } from "react";
import {
  profile, about, hobbies, skills, experience, education, projects,
} from "../data/portfolio";

/* ---------- small helpers ---------- */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${shown ? "in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Pic({ src, alt, label }: { src: string; alt: string; label: string }) {
  const [missing, setMissing] = useState(false);
  if (missing || !src) return <span>{label}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setMissing(true)} />;
}

/* Card with a spotlight that follows the mouse */
function Spot({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={`spot ${className}`}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}

function useTyping(words: string[]) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[i % words.length];
    const done = !del && text === word;
    const empty = del && text === "";
    const t = setTimeout(() => {
      if (done) setDel(true);
      else if (empty) { setDel(false); setI(i + 1); }
      else setText(word.slice(0, text.length + (del ? -1 : 1)));
    }, done ? 1400 : del ? 40 : 80);
    return () => clearTimeout(t);
  }, [text, del, i, words]);
  return text;
}

/* ---------- top bar, progress bar, menu ---------- */

const links = [
  ["about", "About"], ["skills", "Skills"], ["experience", "Experience"],
  ["education", "Education"], ["projects", "Projects"], ["connect", "Contact"],
];

function Navbar() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    links.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <header className="header">
      <div className="progress" style={{ width: `${progress}%` }} />
      <nav className="wrap nav">
        <a className="logo" href="#home">AK<span>.</span></a>
        <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
        <ul className={open ? "open" : ""}>
          {links.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className={active === id ? "active" : ""} onClick={() => setOpen(false)}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

/* ---------- sections ---------- */

function Skills() {
  const [tab, setTab] = useState(0);
  const tabs = ["All", ...skills.map((s) => s.group)];
  const shown = tab === 0 ? skills.flatMap((s) => s.items.split(", ")) : skills[tab - 1].items.split(", ");
  return (
    <div>
      <div className="tabs" role="tablist">
        {tabs.map((t, i) => (
          <button key={t} role="tab" aria-selected={tab === i} className={tab === i ? "on" : ""} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>
      <div className="chips" key={tab}>
        {shown.map((s, i) => (
          <span key={s} style={{ animationDelay: `${i * 45}ms` }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

function Timeline({ items }: { items: { when: string; title: string; text: string }[] }) {
  return (
    <div className="timeline">
      {items.map((e) => (
        <Reveal key={e.title}>
          <Spot className="tl-item">
            <span className="dot" />
            <p className="when">{e.when}</p>
            <h3>{e.title}</h3>
            <p className="muted">{e.text}</p>
          </Spot>
        </Reveal>
      ))}
    </div>
  );
}

export default function Home() {
  const typed = useTyping(profile.roles);
  const [picked, setPicked] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPicked(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(profile.email); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="bg" aria-hidden="true"><i className="o1" /><i className="o2" /><i className="o3" /></div>
      <Navbar />
      <main>
        {/* Hero */}
        <section id="home" className="hero-section">
          <div className="wrap hero">
            <div>
              <p className="typed">{typed}<span className="caret" /></p>
              <h1 aria-label={profile.name}>
                {profile.name.split("").map((c, i) => (
                  <span key={i} className="ch" style={{ animationDelay: `${i * 70}ms` }} aria-hidden="true">
                    {c === " " ? "\u00A0" : c}
                  </span>
                ))}
              </h1>
              <p className="lead">{profile.intro}</p>
              <div className="cta">
                <a className="btn solid" href="#projects">See my work</a>
                <a className="btn" href="#connect">Contact</a>
              </div>
            </div>
            <div className="photo"><Pic src={profile.photo} alt={profile.name} label="Your photo" /></div>
          </div>
        </section>

     {/* About */}
        <section id="about">
          <div className="wrap about">
            <Reveal>
              <h2>About me</h2>
              {about.map((p) => <p key={p} className="para">{p}</p>)}
            </Reveal>
            <Reveal delay={150}>
              <Spot className="card">
                <h3>Outside of code</h3>
                <div className="chips static">{hobbies.map((h) => <span key={h}>{h}</span>)}</div>
              </Spot>
            </Reveal>
          </div>
        </section>

        {/* Skills */}
        <section id="skills">
          <div className="wrap">
            <Reveal><h2>Skills</h2><Skills /></Reveal>
          </div>
        </section>

        {/* Experience */}
        <section id="experience">
          <div className="wrap">
            <Reveal><h2>Experience</h2></Reveal>
            <Timeline items={experience} />
          </div>
        </section>

        {/* Education */}
        <section id="education">
          <div className="wrap">
            <Reveal><h2>Education</h2></Reveal>
            <Timeline items={education} />
          </div>
        </section>

        {/* Projects */}
        <section id="projects">
          <div className="wrap">
            <Reveal><h2>Projects</h2></Reveal>
            <div className="projects">
              {projects.map((p, i) => (
                <Reveal key={p.image} delay={i * 80}>
                  <Spot className="proj" onClick={() => setPicked(i)}>
                    <div className="img"><Pic src={p.image} alt="" label="Image" /></div>
                    <p className="txt">{p.text}</p>
                    <span className="view">View</span>
                  </Spot>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="connect" className="connect">
          <div className="wrap">
            <Reveal>
              <h2>Let&apos;s connect</h2>
              <p className="para">Have a project in mind or just want to say hi? Pick any option.</p>
              <div className="cta">
                <button className="btn solid" onClick={copyEmail}>Copy email</button>
                <a className="btn" href={`mailto:${profile.email}`}>Send email</a>
                <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a className="btn" href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                <a className="btn" href={profile.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Project popup */}
      {picked !== null && (
        <div className="modal" onClick={() => setPicked(null)} role="dialog" aria-modal="true">
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="img big"><Pic src={projects[picked].image} alt="" label="Image" /></div>
            <p className="para">{projects[picked].text}</p>
            <button className="btn" onClick={() => setPicked(null)}>Close</button>
          </div>
        </div>
      )}

      <div className={`toast ${copied ? "show" : ""}`} role="status">Email copied</div>
    </>
  );
}