import { useEffect, useState } from "react";

const R = "/reference/";

const projects = [
  { title: "Pulse", kind: "Graphic Design", image: "project-5.jpg", ratio: "4 / 5" },
  { title: "Eclipse", kind: "Visual Identity", image: "project-8.jpg", ratio: "6 / 5" },
  { title: "Nova", kind: "Branding", image: "project-6.jpg", ratio: "4 / 5" },
  { title: "Zenith", kind: "Graphic Design", image: "project-9.jpg", ratio: "4 / 5" },
  { title: "Ember", kind: "Branding", image: "project-7.jpg", ratio: "4 / 5" },
  { title: "Scarlet", kind: "Web design", image: "project-10.jpg", ratio: "4 / 3" },
];

const services = [
  ["Web Design", ["Creative direction", "UI/UX design", "Responsive websites", "Design systems"]],
  ["Branding", ["Visual identity", "Art direction", "Brand guidelines", "Campaign design"]],
  ["Graphic Design", ["Editorial design", "Social media", "Print design", "Digital assets"]],
];

const experience = [
  ["Senior Digital Designer", "Freelance", "2019 — Present", "Partnering with global teams and founders to create distinctive digital products, visual identities, and campaign experiences."],
  ["Digital Designer", "Creative Studio", "2015 — 2019", "Led design across web, brand, and product projects from early concepts through final delivery."],
  ["Graphic Designer", "Media Agency", "2012 — 2015", "Created identities, editorial systems, and digital campaigns for culture and lifestyle clients."],
  ["Junior Web Designer", "Design Agency", "2010 — 2012", "Designed responsive websites, landing pages, and visual assets for a wide range of brands."],
];

const awards = [
  ["SOTD", "Awwwards", "2025"],
  ["SOTM", "CSS Design Awards", "2025"],
  ["Honorable Mention", "Awwwards", "2023"],
  ["Design Excellence", "Dribbble", "2022"],
  ["Featured Designer", "Behance", "2021"],
];

const testimonials = [
  ["project-1.png", "Emily T.", "Creative Director", "Kima brought a rare mix of strategic thinking and visual precision. The final work felt considered, distinctive, and completely right for our brand."],
  ["project-2.jpg", "Daniel R.", "Founder", "Working with Kima was effortless. She understood the idea immediately and turned it into a digital experience that was clearer and stronger than we imagined."],
  ["project-3.jpg", "Michael K.", "Product Lead", "Kima is thoughtful, fast, and exceptionally detail-oriented. Every decision had a reason, and the collaboration made our product better."],
  ["project-4.jpg", "Sarah M.", "Brand Manager", "From the first concept to the final files, Kima was an incredible creative partner. The new identity gave our team real confidence."],
];

function RefMobileSwitch() {
  const [active, setActive] = useState("about");
  useEffect(() => {
    const work = document.querySelector("#reference-work");
    const update = () => work && setActive(window.scrollY >= work.offsetTop - 120 ? "work" : "about");
    update();
    const quickCheck = window.setTimeout(update, 120);
    const settledCheck = window.setTimeout(update, 600);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.clearTimeout(quickCheck); window.clearTimeout(settledCheck); resizeObserver.disconnect(); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <nav className="ref-switch" aria-label="Page sections">
    <a className={active === "about" ? "active" : ""} href="#reference-about">About</a>
    <a className={active === "work" ? "active" : ""} href="#reference-work">Work</a>
  </nav>;
}

function RefSection({ title, children, className = "" }) {
  return <section className={`ref-section ${className}`}><h2>{title}</h2>{children}</section>;
}

function ReferenceAbout() {
  return <section className="ref-about" id="reference-about">
    <header className="ref-profile">
      <img src={`${R}avatar.png`} alt="Kima Davidson" />
      <div><h1>Kima Davidson</h1><p>Digital Designer</p></div>
    </header>

    <p className="ref-lead">I design digital experiences — from modern websites and visual identities and graphic design — focused on clarity, usability, and strong visual storytelling.</p>
    <p className="ref-available"><i />Available for work.</p>
    <a className="ref-button" href="#reference-contact">Get in touch</a>

    <div className="ref-logo-row" aria-label="Selected clients">
      {[4,5,6,1,2,3].map(n => <img key={n} src={`${R}asset-${n}.svg`} alt="" />)}
    </div>

    <RefSection title="About me.">
      <p className="ref-muted">I’m Kima Davidson, a digital designer based in New York with over 11 years of experience crafting thoughtful, visually driven digital experiences.</p>
      <div className="ref-stats">
        <p><b>11+</b><span>Years of experience</span></p>
        <p><b>60+</b><span>Clients worldwide</span></p>
        <p><b>100+</b><span>Projects delivered</span></p>
        <p><b>97%</b><span>Client satisfaction rate</span></p>
      </div>
    </RefSection>

    <RefSection title="Services.">
      <div className="ref-service-list">{services.map(([title, items], index) => <article key={title}>
        <span>{index + 1}.</span><div><h3>{title}</h3><ul>{items.map(item => <li key={item}>{item}</li>)}</ul></div>
      </article>)}</div>
    </RefSection>

    <RefSection title="Stack.">
      <div className="ref-stack">{["Framer", "Figma", "Photoshop", "Illustrator", "Midjourney", "Spline"].map((name, i) => <article key={name}>
        <img src={`${R}asset-${i + 7}.svg`} alt="" /><div><h3>{name}</h3><p>{i < 2 ? "Design & prototyping" : i < 4 ? "Visual design" : "Creative exploration"}</p></div>
      </article>)}</div>
    </RefSection>

    <RefSection title="Experience.">
      <div className="ref-experience">{experience.map(([role, company, date, text]) => <article key={role}>
        <h3>{role}</h3><p className="ref-job-meta">{company} · {date}</p><p>{text}</p>
      </article>)}</div>
    </RefSection>

    <RefSection title="Awards.">
      <div className="ref-awards">{awards.map(([award, platform, year]) => <p key={`${award}-${year}`}><b>{award}</b><span>{platform}</span><time>{year}</time></p>)}</div>
    </RefSection>

    <RefSection title="Testimonials.">
      <div className="ref-testimonials">{testimonials.map(([photo, name, role, quote]) => <article key={name}>
        <p>“{quote}”</p><div><img src={`${R}${photo}`} alt="" /><span><b>{name}</b><small>{role}</small></span></div>
      </article>)}</div>
    </RefSection>

    <footer className="ref-contact" id="reference-contact">
      <h2>Reach out.</h2>
      <p>I’m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.</p>
      <a href="mailto:hello@kimadavidson.com">hello@kimadavidson.com</a>
      <a href="tel:+11234567890">(123) 456 7890</a>
      <nav><a href="https://x.com" target="_blank" rel="noreferrer">Twitter/X</a><a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></nav>
      <small>Designed in Framer by Thaer · © 2025</small>
    </footer>
  </section>;
}

function RefCard({ item }) {
  return <a className="ref-card" style={{ aspectRatio: item.ratio }} href="https://drab-guides-391061.framer.app" target="_blank" rel="noreferrer">
    <img src={`${R}${item.image}`} alt={`${item.title} — ${item.kind}`} />
    <span className="ref-card-shade" />
    <span className="ref-card-meta"><b>{item.title}</b><small>{item.kind}</small></span>
  </a>;
}

function ReferenceWork() {
  const left = projects.filter((_, i) => i % 2 === 0);
  const right = projects.filter((_, i) => i % 2 === 1);
  return <section className="ref-work" id="reference-work">
    <div className="ref-work-desktop"><div>{left.map(item => <RefCard key={item.title} item={item} />)}</div><div>{right.map(item => <RefCard key={item.title} item={item} />)}</div></div>
    <div className="ref-work-mobile">{projects.map(item => <RefCard key={item.title} item={item} />)}</div>
  </section>;
}

export default function ReferencePage() {
  const mobileQa = new URLSearchParams(window.location.search).has("mobile-qa");
  useEffect(() => {
    document.title = "Kima - Minimal Portfolio Framer Template";
    document.documentElement.classList.toggle("reference-mobile-qa", mobileQa);
    return () => { document.title = "Вика Матвеева — Product Designer"; document.documentElement.classList.remove("reference-mobile-qa"); };
  }, [mobileQa]);
  return <><RefMobileSwitch /><main className="ref-shell"><ReferenceAbout /><ReferenceWork /></main></>;
}
