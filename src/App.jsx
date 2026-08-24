import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUp, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { siClaude } from "simple-icons";
import { chatgptDarkIcon } from "./toolIconData";

const ReferencePage = lazy(() => import("./ReferencePage"));
const MetricsTrainer = lazy(() => import("./MetricsTrainer"));

const A = `${import.meta.env.BASE_URL}assets/`;
const V = `${import.meta.env.BASE_URL}videos/`;
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
const withBasePath = href => href.startsWith("/") && !href.startsWith("//") ? `${BASE_PATH}${href}` || "/" : href;
const stripBasePath = pathname => {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (BASE_PATH && (normalized === BASE_PATH || normalized.startsWith(`${BASE_PATH}/`))) {
    return normalized.slice(BASE_PATH.length) || "/";
  }
  return normalized;
};
const assetUrl = name => `${A}${name.replace(/\.(?:png|jpe?g)$/i, ".webp")}`;

const shortRussianWords = "а|без|в|во|до|за|и|из|к|ко|на|над|не|но|о|об|обо|от|по|под|при|про|с|со|у";
const hangingWordPattern = new RegExp(`(?<![\\p{L}\\p{N}])(${shortRussianWords})[ \\t]+(?=[\\p{L}\\p{N}])`, "giu");

function TypographyFix() {
  useEffect(() => {
    const root = document.body;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest("script, style, code, pre, .no-typography")
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      node.nodeValue = node.nodeValue.replace(hangingWordPattern, "$1\u00a0");
    }
  }, []);

  return null;
}

function TypographedPage({ children }) {
  return <><TypographyFix/>{children}</>;
}

function Link({ href, children, className = "", onClick, ...props }) {
  const external = /^(https?:|mailto:)/.test(href);
  const targetHref = withBasePath(href);
  const navigate = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || external || href.startsWith("#") || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.pushState({}, "", targetHref);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, left: 0 });
  };
  return <a href={targetHref} className={className} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} onClick={navigate} {...props}>{children}</a>;
}

function LazyVideo({ src, autoPlay = true, ...props }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) { setReady(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setReady(true); observer.disconnect(); }
    }, { rootMargin: "400px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!ready || !autoPlay || !ref.current) return;
    const video = ref.current;
    const play = () => video.play().catch(() => {});
    video.muted = true;
    video.defaultMuted = true;
    video.load();
    video.addEventListener("canplay", play, { once: true });
    play();
    return () => video.removeEventListener("canplay", play);
  }, [ready, src, autoPlay]);
  return <video ref={ref} src={ready ? src : undefined} autoPlay={autoPlay} preload="none" disablePictureInPicture disableRemotePlayback {...props}/>;
}

function BrandIcon({ icon, variant }) {
  const mark = typeof icon === "string"
    ? <img src={icon} alt=""/>
    : <svg viewBox="0 0 24 24"><path d={icon.path}/></svg>;
  return <span className={`brand-icon brand-icon-${variant}`} aria-hidden="true">{mark}</span>;
}

const workLeft = [
  { title: "AMA", kind: "Мобильное приложение", appIcon: "ama-app-icon.png", image: "home-ama-desktop.png", href: "/ama", ratio: "4 / 3", fit: "contain" },
  { title: "Вместе.ру", kind: "Мобильное приложение", appIcon: "cv-f28cd5dddae5b1c1.avif", image: "home-vmeste-hq.png", href: "/vmeste", ratio: "4 / 3" },
  { title: "Trinity Monsters", kind: "Концепт раздела вакансий", image: "trinity-01-hq.png", href: "/trinity-monsters", ratio: "4 / 3" },
  { title: "Step App", kind: "Web3-приложение", image: "step-app-01-hq.png", href: "/step-app", ratio: "3 / 4", position: "top" },
  { title: "Столото", kind: "Сервис внутри приложения", image: "stoloto-hq.png", href: "/stoloto", ratio: "4 / 3" },
  { title: "Авиарейсы", kind: "Концепт приложения", image: "flight-concept-hq.png", href: "/flight-tracker", ratio: "4 / 3" },
];

const workRight = [
  { title: "Манжерок", kind: "Мобильное приложение", appIcon: "manzherok-app-icon.png", image: "home-ski-hq.png", href: "/ski-resort", ratio: "6 / 5" },
  { title: "Инвестиции", kind: "Мобильное приложение", image: "investments-poster-hq.jpg", video: "investments-hq.mp4", href: "/investments", ratio: "4 / 3" },
  { title: "Avito Fashion", kind: "Концепт", image: "avito-fashion-cover-v2.png", href: "/avito-fashion", ratio: "3 / 4", imageClass: "avito-cover" },
  { title: "Концепт", kind: "Мобильное приложение", image: "concept-poster-hq.jpg", video: "HRukF4ca0a0qfNKqktNqpjFcoL4.mp4", href: "/concept", ratio: "4 / 3" },
  { title: "Туризм", kind: "Концепт приложения", image: "travel-concept-poster.jpg", video: "TImWiJ2hRhf2RpzcqBJIbeuDxQw.mp4", href: "/travel-concept", ratio: "4 / 3" },
  { title: "Web3 Education", kind: "Образовательная платформа", image: "other-screen-hq.png", href: "/web3-education", ratio: "3 / 4", position: "top" },
];

const hypothesisMockups = {
  "/ama": { image: "ama-widgets-screen.png", mockupPosition: "50% 50%", mockupScale: 1 },
  "/vmeste": { image: "vmeste-main-screen.png", mockupPosition: "50% 50%", mockupScale: 1 },
  "/step-app": { image: "step-app-01-hq.png", mockupPosition: "12% 12%" },
  "/ski-resort": { image: "ski-booking-screen.png", mockupPosition: "50% 50%", mockupScale: 1 },
  "/investments": { image: "investments-main-screen.png", mockupPosition: "50% 50%", mockupScale: 1 },
  "/avito-fashion": { image: "avito-fashion-main-screen.png", mockupPosition: "50% 50%", mockupScale: 1 },
  "/concept": { image: "other-concepts-shop-screen.png", mockupPosition: "50% 50%", mockupScale: 1 },
  "/travel-concept": { image: "travel-concept-poster.jpg", mockupPosition: "50% 50%" },
};

const asHypothesisCard = project => {
  if (!hypothesisMockups[project.href]) return project;
  const card = { ...project, ...hypothesisMockups[project.href], video: undefined, ratio: "1 / 1", mockup: true, fit: undefined, imageClass: undefined };
  return project.href === "/concept"
    ? { ...card, title: "Другие работы и концепты", kind: "Разные концепты для мобилки и веба", href: "/other-projects" }
    : card;
};

const allWork = [...workLeft, ...workRight];
const hypothesisCard = href => asHypothesisCard(allWork.find(project => project.href === href));
const hypothesisLeft = ["/ama", "/vmeste", "/avito-fashion"].map(hypothesisCard);
const hypothesisRight = ["/ski-resort", "/investments", "/concept"].map(hypothesisCard);

const jobs = [
  ["Продуктовый дизайнер", "MateÇa", "с 2024", "Мобильные приложения, сайты и внутренние B2B-системы — от идеи и исследований до передачи в разработку."],
  ["Продуктовый дизайнер", "Вместе.ру (Самолет)", "2023", "Редизайн навигатора, продуктовые функции, сторис и материалы для магазинов приложений."],
  ["Ревьюер", "Яндекс Практикум", "2022 — 2023", "Ревью работ студентов и рекомендации по улучшению интерфейсов и дизайнерских кейсов."],
  ["UI/UX дизайнер", "Trinity Monsters", "2021 — 2022", "Web3-продукты, банковские интерфейсы, сервисы для Столото и корпоративные порталы."],
  ["UI/UX дизайнер, стажировка", "AIC", "2021", "Исследование и концепция мобильного приложения для Ашана."],
  ["Веб-дизайнер", "Схема", "2019 — 2021", "Лендинги, письма и коммуникационный дизайн для Яндекса, X5 Retail, ВДНХ и других компаний."],
];

const companyLogos = [
  ["cv-e22354aee8fa7ae4.avif", "MateÇa"], ["cv-f28cd5dddae5b1c1.avif", "Вместе.ру"],
  ["cv-2d26053dd4cb03b0.avif", "Яндекс Практикум"], ["cv-cff869438157b4cc.avif", "Trinity Monsters"],
  ["cv-ca281cdb6c347f30.avif", "AIC"], ["cv-2d204b65f3c137cd.png", "Схема"],
];

const tools = [
  [`${A}figma-logo.svg`, "Figma", "Проектирование интерфейсов", "figma"],
  [chatgptDarkIcon, "ChatGPT", "Исследования и тексты", "chatgpt"],
  [`${A}codex-logo-transparent.webp`, "Codex", "Прототипирование в коде", "codex"],
  [siClaude, "Claude", "Аналитика и идеи", "claude"],
];

const galleryCaptions = {
  "ama/ama-01.jpg": "Обложка кейса и концепция AMA",
  "ama/ama-03.jpg": "Запросы превращаются в понятные артефакты",
  "ama/ama-04.jpg": "Планы, предложения и персональная лента",
  "ama/ama-05.jpg": "Умный поиск предложений по локации",
  "ama/ama-06.jpg": "Персональные рекомендации в разных городах",
  "ama/ama-07.jpg": "Коллекции мест, идей и товаров",
  "ama/ama-08.jpg": "CRM для менеджеров и партнёров",
  "ama/ama-10.jpg": "Результаты сотрудничества с AMA",
  "ama/ama-11.jpg": "Задача и контекст продукта",
  "ama/ama-12.jpg": "Целевые аудитории сервиса",
  "ama/ama-14.jpg": "Визуальная концепция интерфейса",
  "ama/ama-15.jpg": "AMA как дверь в закрытый мир",
  "ama/ama-17.jpg": "Чат с консьержем и сценарии запросов",
  "ama/ama-18.jpg": "Профиль, поиск и умная лента",
  "ski-f0077e8e46537e02.avif": "Основные экраны приложения курорта",
  "ski-hand-interface-new.png": "Главный экран приложения",
  "ski-a6951fee0dc0d8da.avif": "Главная, услуги и персональные предложения",
  "ski-4e5ac801adcc97b3.avif": "Экран информации об отеле",
  "ski-ebd18ef95ae2da98.avif": "Выбор отеля, номера и тарифа",
  "ski-eb839b4dfdf80618.avif": "Оформление бронирования и QR-билет",
  "ski-06-hq.png": "Поиск объектов и построение маршрута",
  "ski-07-hq.png": "Настройки карты и маршрут по курорту",
  "ski-151861387452668e.avif": "Онлайн-камеры на склонах",
  "ski-stores.png": "Промоматериалы для магазинов приложений",
  "vmeste-01-hq.png": "Навигатор приложения до редизайна",
  "vmeste-7d7d2baa6f042ebf.avif": "Карта разделов и функций Навигатора",
  "vmeste-03-hq.png": "Переключение профилей жителя и бизнеса",
  "vmeste-04-hq.png": "Приоритет быстрых действий",
  "vmeste-final-1.png": "Навигатор, сервисы и сообщества рядом",
  "vmeste-c2e5b4da20d62cee.avif": "Варианты Навигатора для разных пользователей",
  "vmeste-65f1e8d4f0648310.avif": "Навигатор и центр уведомлений",
  "other-portrait-02-hq.png": "Объявления и соседские сценарии Вместе.ру",
  "other-ba1a805d27423031.webp": "Сторис о новых функциях приложения",
  "trinity-01-hq.png": "Описание вакансии в формате диалога",
  "trinity-02-hq.png": "Форма отклика на вакансию",
  "trinity-03-hq.png": "Знакомство с командой и условиями работы",
  "trinity-04-hq.png": "Выбор вакансии и начало сценария",
  "step-app-01-hq.png": "Главная, инвентарь, тренировка и результаты",
  "step-app-02-hq.png": "Маркетплейс, кошелёк и профиль",
  "stoloto-hq.png": "Сканирование и массовая проверка билетов",
  "avito-fashion-hq.png": "Каталог, карточка товара и оформление покупки",
  "avito-fashion-block-01.png": "Каталог, подборки и рекомендации Avito Fashion",
  "avito-fashion-block-02.png": "Карточка товара, подбор образа и поиск",
  "avito-fashion-block-01-dark.png": "Каталог, подборки и рекомендации Avito Fashion",
  "avito-fashion-block-02-dark.png": "Карточка товара, подбор образа и поиск",
  "flight-concept-hq.png": "Маршрут рейса в светлой, синей и тёмной темах",
  "other-screen-hq.png": "Главная и каталог образовательной Web3-платформы",
  "other-portrait-01-hq.png": "Дашборд показателей и сценариев продукта",
};

const galleryDimensions = {
  "vmeste-c2e5b4da20d62cee.avif": [3200, 2200],
  "vmeste-65f1e8d4f0648310.avif": [3200, 2200],
};

function ProjectCard({ project, priority = false }) {
  return <Link href={project.href} className={`work-card${project.fit === "contain" ? " contain-media" : ""}${project.mockup ? " mockup-card" : ""}`} style={{ aspectRatio: project.ratio }}>
    {project.mockup
      ? <span className="mockup-cover"><span className="mockup-device"><img src={assetUrl(project.image)} alt="" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" style={{ objectPosition: project.mockupPosition || "center", "--mockup-scale": project.mockupScale || 1 }}/></span></span>
      : project.video
      ? <LazyVideo src={`${V}${project.video}`} poster={assetUrl(project.image)} autoPlay muted loop playsInline style={{ objectPosition: project.position || "center" }} aria-label={`${project.title} — видео-превью`}/>
      : <img className={project.imageClass || ""} src={assetUrl(project.image)} alt="" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" style={{ objectPosition: project.position || "center", objectFit: project.fit || "cover" }}/>
    }
    <span className="work-gradient"/>
    <span className="work-meta">
      <b className={project.appIcon ? "work-title-with-icon" : ""}>
        {project.appIcon && <img className="work-app-icon" src={assetUrl(project.appIcon)} alt="" loading="lazy" decoding="async" aria-hidden="true"/>}
        <span>{project.title}</span>
      </b>
      <small>{project.kind}</small>
    </span>
  </Link>;
}

function MobileSwitch({ mode = "home" }) {
  const [active, setActive] = useState("first");
  const first = mode === "home" ? ["Обо мне", "#intro"] : ["Инфо", "#project-info"];
  const second = mode === "home" ? ["Работы", "#work"] : ["Галерея", "#gallery"];
  useEffect(() => {
    const target = document.querySelector(second[1]);
    const update = () => target && setActive(window.scrollY > target.offsetTop - 160 ? "second" : "first");
    update();
    const quickCheck = window.setTimeout(update, 120);
    const settledCheck = window.setTimeout(update, 700);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.clearTimeout(quickCheck); window.clearTimeout(settledCheck); resizeObserver.disconnect(); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [second[1]]);
  return <nav className="mobile-switch" aria-label="Навигация по странице">
    <a className={active === "first" ? "active" : ""} href={first[1]}>{first[0]}</a>
    <a className={active === "second" ? "active" : ""} href={second[1]}>{second[0]}</a>
  </nav>;
}

const showAboutDetails = false;

function AboutPane() {
  return <section className="about-pane" id="intro">
    <div className="profile-row"><img src={`${A}cv-portrait.avif`} alt="Вика Матвеева"/><div><h1>Вика Матвеева</h1><p>Продуктовый дизайнер</p></div></div>
    <p className="lead">Создаю мобильные приложения, сайты и B2B-системы — от идеи и исследований до запуска. Соединяю эстетику, функциональность и задачи бизнеса.</p>
    <p className="availability"><i/>Открыта к предложениям</p>
    <Link href="https://t.me/myautau" className="light-button">Написать мне</Link>

    {showAboutDetails && <InfoSection title="Обо мне">
      <p className="muted">Я продуктовый дизайнер из Санкт-Петербурга с опытом более пяти лет. Проектирую понятные, визуально точные продукты и умею доводить решения от исследования до запуска.</p>
      <div className="stats"><p><b>5+</b><span>лет опыта</span></p><p><b>6</b><span>команд и компаний</span></p><p><b>3</b><span>направления: mobile, web, B2B</span></p><p><b>2019</b><span>начала работать в дизайне</span></p></div>
    </InfoSection>}

    <InfoSection title="Инструменты">
      <div className="tool-list">{tools.map(([icon, name, desc, variant])=><div className="tool-row" key={name}><BrandIcon icon={icon} variant={variant}/><div><h3>{name}</h3><p>{desc}</p></div></div>)}</div>
    </InfoSection>

    <InfoSection title="Подход">
      <div className="principles"><p>Начинаю с задач пользователя и бизнеса, а не с готового визуального решения.</p><p>Проверяю гипотезы исследованиями и прототипами до дорогой реализации.</p><p>Думаю о передаче в разработку и поддерживаю решения понятной документацией.</p><p>Люблю нестандартные идеи, нишевые приложения и эксперименты с нейросетями.</p></div>
    </InfoSection>

    <InfoSection title="Опыт работы">
      <div className="experience-list">{jobs.map(([role, company, date, text], index)=><article key={company}><img className="experience-logo" src={assetUrl(companyLogos[index][0])} alt=""/><div><h3>{role}</h3><p className="job-meta">{company} · {date}</p><p>{text}</p></div></article>)}</div>
    </InfoSection>

    <InfoSection title="Образование">
      <div className="education-list"><p><b>Графический дизайн, магистратура</b><span>СПГХПА им. Штиглица</span></p><p><b>Графический дизайн, бакалавриат</b><span>УГАХУ</span></p></div>
    </InfoSection>

    <footer className="reach" id="contact"><h2>Контакты</h2><p className="muted">Предлагаю написать и назначить созвон для знакомства.</p><div className="contact-bottom-row"><nav className="contact-fields" aria-label="Контакты"><Link href="https://t.me/myautau">Telegram</Link><Link href="mailto:myautau13@gmail.com">Email</Link><Link href="https://www.linkedin.com/in/viktoriamatveeva">LinkedIn</Link></nav><a className="back-to-top" href="#intro" aria-label="Вернуться наверх" onClick={(event) => { event.preventDefault(); if (window.innerWidth <= 809) window.scrollTo({ top: 0, behavior: "smooth" }); else event.currentTarget.closest(".about-pane")?.scrollTo({ top: 0, behavior: "smooth" }); }}><ArrowUp aria-hidden="true"/></a></div></footer>
  </section>;
}

function InfoSection({ title, children }) { return <section className="info-section"><h2>{title}</h2>{children}</section>; }
function Numbered({ title, items }) { return <article className="numbered"><h3>{title}</h3><ul>{items.map(x=><li key={x}>{x}</li>)}</ul></article>; }

function WorkPane({ hypothesis = false }) {
  const left = hypothesis ? hypothesisLeft : workLeft;
  const right = hypothesis ? hypothesisRight : workRight;
  const mobileOrder = Array.from({ length: Math.max(left.length, right.length) }, (_, index) => [left[index], right[index]]).flat().filter(Boolean);
  return <section className={`work-pane${hypothesis ? " hypothesis-work" : ""}`} id="work"><div className="work-desktop"><div className="work-column">{left.map((p, index)=><ProjectCard key={p.title} project={p} priority={index === 0}/>)}</div><div className="work-column">{right.map((p, index)=><ProjectCard key={p.title} project={p} priority={index === 0}/>)}</div></div><div className="work-mobile-list">{mobileOrder.map((p, index)=><ProjectCard key={p.title} project={p} priority={index === 0}/>)}</div></section>;
}

function Home({ hypothesis = false }) {
  useEffect(() => {
    if (!hypothesis) return;
    const previousTitle = document.title;
    document.title = "Viktoria Matveeva — Product Designer";
    return () => { document.title = previousTitle; };
  }, [hypothesis]);
  return <><MobileSwitch/><main className={`portfolio-shell${hypothesis ? " hypothesis-page" : ""}`}><div className="about-wrap"><AboutPane/></div><WorkPane hypothesis={hypothesis}/></main></>;
}

const cases = {
  "/ama": {
    title: "AMA", subtitle: "Переосмысление консьерж-сервиса для клиентов private banking", meta: [["Продукт","Мобильное приложение"],["Направление","Консьерж-сервис"],["Платформа","iOS, Android"]],
    intro: "Премиальный консьерж-сервис ВТБ для путешествий, ресторанов, привилегий и персональных запросов.",
    sections: [["Задача","Дать клиенту выбор: решить вопрос самостоятельно, обратиться к менеджеру или получить готовое предложение."],["Аудитория","Учесть скорость для new money, деликатный сервис для old money и самостоятельность для self-made."],["Стратегия","Объединила чат, закрытые предложения, календарь, уведомления и семейные профили."],["Визуальная концепция","Синие градиенты, металл и мягкое свечение создают технологичный премиальный образ."],["Чат и артефакты","Запросы превращаются в понятные карточки, билеты и виджеты со статусами."],["Умная лента","Лента учитывает геолокацию и события, а бронирования попадают в планы."],["Коллекции","Места и идеи можно сохранить в подборку и отправить консьержу."],["CRM","В CRM собраны задачи, статусы, предложения, контекст клиента и SLA."],["Результат","Концепция получила инвестиции и перешла к реализации."]],
    gallery: ["ama/ama-11.jpg","ama/ama-12.jpg","ama/ama-14.jpg","ama/ama-15.jpg","ama/ama-17.jpg","ama/ama-18.jpg","ama/ama-04.jpg","ama/ama-05.jpg","ama/ama-06.jpg","ama/ama-07.jpg","ama/ama-08.jpg","ama/ama-03.jpg"]
  },
  "/ski-resort": {
    title: "Манжерок", subtitle: "Приложение для горнолыжного курорта", meta: [["Продукт","Мобильное приложение"],["Направление","Travel"],["Платформа","iOS, Android"]],
    intro: "Приложение курорта на Алтае для бронирования жилья, покупки билетов, навигации и просмотра камер.",
    sections: [
      ["О задаче","Собрать в одном приложении основные сценарии гостя: выбор жилья, покупку ски-пассов и билетов, карту курорта и статус канатных дорог."],
      ["Главная страница","На главной — всё необходимое для поездки: билеты, проживание, события, рестораны, камеры и маршруты."],
      ["Отели и шале","Спроектировала путь от каталога и карточки объекта до выбора тарифа, дополнительных услуг и оформления бронирования."],
      ["Билеты","Спроектировала выбор и оплату билетов, получение QR-кода, возврат и добавление в Wallet на iOS и Android."],
      ["Карта и маршруты","Проработала поиск и карточки объектов, слои, маршруты, трассы и канатные дороги, сезонные режимы и офлайн-карту."],
      ["Камеры","Создала раздел камер для оценки погоды и загруженности склонов с переходом к локации на карте."],
      ["Скриншоты для сторов","Подготовила промо-скриншоты для магазинов приложений: структуру, тексты, изображения ландшафта и мокап руки в горнолыжной перчатке."],
    ],
    gallery: [
      "ski-hand-interface-new.png",
      "ski-f0077e8e46537e02.avif",
      { type: "video", src: `${V}ls1FrvqnYmzT7Z7QrqCSwI1WANY.mp4`, caption: "Все разделы главной страницы: бронирование, меню, отели и шале, афиша, развлечения, рестораны и бары" },
      "ski-a6951fee0dc0d8da.avif",
      "ski-4e5ac801adcc97b3.avif",
      "ski-ebd18ef95ae2da98.avif",
      "ski-eb839b4dfdf80618.avif",
      { type: "video", src: `${V}9zLzrZKGw9fUPqGKrnHkPG2Mny4.mp4`, caption: "Выбор канатной дороги на карте и переход к её карточке" },
      "ski-06-hq.png",
      "ski-07-hq.png",
      "ski-151861387452668e.avif",
      "ski-stores.png"
    ]
  },
  "/vmeste": {
    title: "Вместе.ру", subtitle: "Редизайн раздела Навигатор", meta: [["Продукт","Мобильное приложение"],["Направление","Социальная сеть"],["Платформа","iOS, Android"]],
    intro: "Социальная сеть для соседей от «Самолета»: чаты, объявления, услуги, домофон и сервисы управляющей компании.",
    sections: [
      ["О задаче","В приложении появился раздел частных объявлений. Нужно было встроить его в перегруженный Навигатор и сделать основные функции заметнее."],
      ["Проблемы","Функции было трудно находить, а разделы, действия и виджеты почти не отличались."],
      ["Ресерч и дискавери","На основе общения с пользователями составили JTBD и сформулировали гипотезы. Результат решили оценивать по MAU, посещаемости Навигатора, переходам из него и конверсии сторис."],
      ["Проработка структуры","Разделила контент на разделы, виджеты, данные, действия и ссылки."],
      ["Валидация прототипов","Протестировали прототипы на 13 пользователях и уточнили названия, порядок и доступность функций."],
      ["Инсайты","По результатам тестирования Навигатор жителя стал основным, бизнес — второй вкладкой, а создание объявления — первым быстрым действием."],
      ["Финальный дизайн","Собрала три состояния Навигатора, центр уведомлений и четыре сторис."],
      ["Результаты","Посещаемость раздела выросла с 17% до 25%, а количество объявлений, созданных из Навигатора, достигло 41% всех точек создания."],
    ],
    gallery: ["vmeste-01-hq.png","vmeste-7d7d2baa6f042ebf.avif","vmeste-final-1.png","vmeste-c2e5b4da20d62cee.avif","vmeste-65f1e8d4f0648310.avif",{ type: "video", src: `${V}vmeste-navigation.mp4` },"other-ba1a805d27423031.webp","other-portrait-02-hq.png"]
  },
  "/investments": {
    title: "Инвестиции", subtitle: "Концепт мобильного приложения для управления инвестициями", meta: [["Продукт","Мобильное приложение"],["Направление","Fintech"],["Платформа","iOS"]],
    intro: "Концепт для контроля портфеля, динамики и инвестиционных продуктов.",
    sections: [["Задача","Сделать сложные финансовые данные понятными и доступными."],["Структура","Объединить портфель, динамику и операции в одном сценарии."],["Визуальная система","Тёмная тема фокусирует внимание на данных и изменениях."]],
    gallery: [{ type: "video", src: `${V}investments-hq.mp4` }]
  },
  "/trinity-monsters": {
    title: "Trinity Monsters", subtitle: "Концепт раздела вакансий в эстетике Windows 98", meta: [["Продукт","Раздел вакансий"],["Направление","HR"],["Платформа","Web"]],
    intro: "Раздел вакансий в формате диалога и эстетике Windows 98.",
    sections: [["Идея","Превратить обычный список вакансий в интерактивный сценарий знакомства с командой."],["Механика","Пользователь выбирает направление, читает описание и оставляет отклик внутри последовательного диалога."],["Визуальный язык","Интерфейс отсылает к Windows 98 и сочетает чёрный фон с ярким зелёным акцентом."]],
    gallery: ["trinity-01-hq.png","trinity-02-hq.png","trinity-03-hq.png","trinity-04-hq.png"]
  },
  "/avito-fashion": {
    title: "Avito Fashion", subtitle: "Концепция fashion-вертикали внутри Avito", meta: [["Продукт","Раздел маркетплейса"],["Направление","Fashion, e-commerce"],["Платформа","iOS, Android"]],
    intro: "Концепция раздела для выгодных покупок одежды, обуви, аксессуаров и винтажа.",
    sections: [["Задача","Сделать поиск модных товаров более вдохновляющим и сохранить привычную логику маркетплейса."],["Каталог","Категории, подборки и фильтры помогают быстрее перейти от просмотра образов к конкретному товару."],["Карточка товара","Информация о вещи, продавце и вариантах покупки собрана в одном последовательном сценарии."]],
    galleryLayout: "stack",
    gallery: ["avito-fashion-block-01-dark.png","avito-fashion-block-02-dark.png"]
  },
  "/concept": {
    title: "Концепт", subtitle: "Концепция мобильного приложения", meta: [["Продукт","Мобильное приложение"],["Направление","E-commerce"],["Платформа","iOS, Android"]],
    intro: "Мобильный e-commerce-концепт с каталогом, подборками и быстрыми сценариями.",
    sections: [["Задача","Собрать насыщенный контент в понятную структуру и сохранить выразительную визуальную подачу."],["Интерфейс","Карточки, подборки и навигация объединены в компактную мобильную систему."],["Визуальная система","Тёмная основа и цветовые акценты помогают разделять контент и выделять ключевые действия."]],
    gallery: [
      { type: "video", src: `${V}HRukF4ca0a0qfNKqktNqpjFcoL4.mp4` },
      { type: "video", src: `${V}TImWiJ2hRhf2RpzcqBJIbeuDxQw.mp4` }
    ]
  },
  "/other-projects": {
    title: "Другие работы и концепты", subtitle: "Разные концепты для мобилки и веба", meta: [["Направление","Digital concepts"],["Платформа","iOS, Android, Web"]],
    intro: "Подборка мобильных и веб-концептов.",
    sections: [],
    gallery: [
      { type: "video", src: `${V}HRukF4ca0a0qfNKqktNqpjFcoL4.mp4` },
      "step-app-01-hq.png",
      "step-app-02-hq.png",
      "stoloto-hq.png",
      "trinity-01-hq.png",
      "trinity-02-hq.png",
      "trinity-03-hq.png",
      "trinity-04-hq.png",
      "flight-concept-hq.png",
      "other-screen-hq.png",
      { type: "video", src: `${V}TImWiJ2hRhf2RpzcqBJIbeuDxQw.mp4` },
      "other-portrait-01-hq.png"
    ]
  },
  "/step-app": {
    title: "Step App", subtitle: "Ключевые сценарии Web3-приложения", meta: [["Продукт","Мобильное приложение"],["Направление","Web3, fitness"],["Платформа","iOS, Android, Web"]],
    intro: "Web3-приложение с бегом, кошельком и виртуальными кроссовками.",
    sections: [["Основные сценарии","Регистрация, кошелёк, маркетплейс, инвентарь и запуск тренировки собраны в единой системе."],["Инвентарь","Пользователь управляет кроссовками и их характеристиками, отслеживает ресурсы и прогресс."],["Тренировка","Во время пробежки интерфейс показывает темп, дистанцию, маршрут и игровые показатели."]],
    gallery: ["step-app-01-hq.png","step-app-02-hq.png"]
  },
  "/stoloto": {
    title: "Столото", subtitle: "Сервис массовой проверки лотерейных билетов", meta: [["Продукт","Сервис внутри приложения"],["Направление","Лотереи"],["Платформа","iOS, Android"]],
    intro: "Сервис помогает проверить несколько билетов разных лотерей через QR-сканирование или ручной ввод.",
    sections: [["Задача","Сократить путь от набора билетов до понятного результата проверки."],["Сканирование","Пользователь добавляет билеты по QR-коду и видит их в общей подборке."],["Результат","Статусы и сумма выигрыша представлены так, чтобы быстро оценить итог по всем билетам."]],
    gallery: ["stoloto-hq.png"]
  },
  "/travel-concept": {
    title: "Туризм", subtitle: "Концепт мобильного приложения для планирования путешествий", meta: [["Продукт","Мобильное приложение"],["Направление","Travel"],["Платформа","iOS"]],
    intro: "Концепт выбора направлений и активностей по интересам.",
    sections: [["Идея","Сделать планирование путешествия лёгким выбором впечатлений."],["Механика","Карточки мест можно пропускать или добавлять в маршрут."],["Визуальная система","Крупные фотографии, мягкие градиенты и плавная анимация."]],
    gallery: [{ type: "video", src: `${V}TImWiJ2hRhf2RpzcqBJIbeuDxQw.mp4` }]
  },
  "/flight-tracker": {
    title: "Авиарейсы", subtitle: "Концепт приложения для отслеживания перелётов", meta: [["Продукт","Мобильное приложение"],["Направление","Travel"],["Платформа","iOS"]],
    intro: "Концепт для отслеживания рейсов на карте.",
    sections: [["Задача","Объединить карту, маршрут и список рейсов."],["Интерфейс","Статус, время и детали рейса доступны на одном экране."],["Темы","Проверить читаемость в светлой, синей и тёмной темах."]],
    gallery: ["flight-concept-hq.png"]
  },
  "/web3-education": {
    title: "Web3 Education", subtitle: "Концепция образовательной платформы про NFT и Web3", meta: [["Продукт","Образовательная платформа"],["Направление","Web3, education"],["Платформа","Web"]],
    intro: "Образовательная платформа о NFT и Web3.",
    sections: [["Задача","Сделать Web3 понятнее и объединить обучение, навигацию и прогресс."],["Структура","Выстроить материалы от базовых тем к сложным."],["Визуальный язык","Тёмная основа и зелёные акценты поддерживают технологичный характер."]],
    gallery: ["other-screen-hq.png","other-portrait-01-hq.png"]
  },
  "/other": {
    title: "Другие проекты", subtitle: "Мобильные приложения, сервисы, сайты и визуальные концепции", meta: [["Продукт","Подборка проектов"],["Направление","Digital products"],["Платформа","Mobile, Web"]],
    intro: "Подборка работ для Web3, e-commerce, fintech, travel, HR и социальных продуктов.",
    sections: [["Step App","Ключевые сценарии Web3-приложения: регистрация, кошелёк, маркетплейс, инвентарь и бег."],["Avito Fashion","Концепция вертикали для выгодных покупок одежды, обуви, аксессуаров и винтажа."],["Столото","Массовая проверка билетов разных лотерей через QR-сканирование и ручной ввод."],["Trinity Monsters","Раздел вакансий в эстетике Windows 98, построенный как диалог в мессенджере."],["Другие концепты","Туризм, отслеживание рейсов, инвестиции в недвижимость и образовательная Web3-платформа."]],
    gallery: ["step-app-01-hq.png","step-app-02-hq.png","avito-fashion-hq.png","stoloto-hq.png","trinity-04-hq.png","trinity-02-hq.png","trinity-03-hq.png","trinity-01-hq.png","flight-concept-hq.png","other-screen-hq.png","other-portrait-01-hq.png","other-portrait-02-hq.png","other-ba1a805d27423031.webp"]
  }
};

function CasePage({ data }) {
  const mediaEntries = data.gallery;
  const mediaItems = mediaEntries.map(item => typeof item === "object" && item.type === "video" ? item.src : assetUrl(item));
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPoint, setZoomPoint] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    if (lightboxIndex === null) return;
    setIsZoomed(false);
    document.querySelector(".lightbox-scroll")?.scrollTo({ top: 0, left: 0 });
    const previousOverflow = document.body.style.overflow;
    const navigateLightbox = (event) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft" && mediaItems.length > 1) setLightboxIndex(index => (index - 1 + mediaItems.length) % mediaItems.length);
      if (event.key === "ArrowRight" && mediaItems.length > 1) setLightboxIndex(index => (index + 1) % mediaItems.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", navigateLightbox);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", navigateLightbox);
    };
  }, [lightboxIndex, mediaItems.length]);
  useEffect(() => {
    if (lightboxIndex === null || mediaEntries.length < 2) return;
    const adjacent = [
      mediaEntries[(lightboxIndex - 1 + mediaEntries.length) % mediaEntries.length],
      mediaEntries[(lightboxIndex + 1) % mediaEntries.length],
    ];
    adjacent.forEach(item => {
      if (typeof item === "object") return;
      const image = new Image();
      image.src = assetUrl(item);
      image.decode?.().catch(() => {});
    });
  }, [lightboxIndex, mediaEntries]);
  useEffect(() => {
    if (lightboxIndex === null) return;
    const frame = window.requestAnimationFrame(() => {
      const scroller = document.querySelector(".lightbox-scroll");
      if (!scroller) return;
      scroller.scrollTo({
        left: isZoomed ? zoomPoint.x * scroller.scrollWidth - scroller.clientWidth / 2 : 0,
        top: isZoomed ? zoomPoint.y * scroller.scrollHeight - scroller.clientHeight / 2 : 0,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isZoomed, zoomPoint, lightboxIndex]);

  const toggleImageZoom = (event) => {
    if (!isZoomed) {
      const rect = event.currentTarget.getBoundingClientRect();
      setZoomPoint({
        x: event.clientX ? (event.clientX - rect.left) / rect.width : 0.5,
        y: event.clientY ? (event.clientY - rect.top) / rect.height : 0.5,
      });
    }
    setIsZoomed(value => !value);
  };

  const renderImage = (item, i) => {
    const isVideo = typeof item === "object" && item.type === "video";
    const src = isVideo ? item.src : assetUrl(item);
    const caption = isVideo ? item.caption || `${data.title} — видео проекта` : galleryCaptions[item] || `${data.title} — экран проекта`;
    const isVmesteStories = item === "other-ba1a805d27423031.webp";
    return <figure key={src} className={isVmesteStories ? "vmeste-stories-card" : undefined}><button className={`gallery-image-button${isVideo ? " is-video" : ""}`} type="button" onClick={() => setLightboxIndex(mediaItems.indexOf(src))} aria-label={`${caption}. Открыть на весь экран`}>{isVideo
      ? <LazyVideo src={src} autoPlay muted loop playsInline/>
      : <img src={src} alt="" loading={mediaEntries.indexOf(item) > 1 ? "lazy" : "eager"} fetchPriority={mediaEntries.indexOf(item) === 0 ? "high" : "auto"} decoding="async"/>
    }<span>{caption}</span></button></figure>;
  };
  const leftGallery = data.gallery.filter((_, i) => i % 2 === 0);
  const rightGallery = data.gallery.filter((_, i) => i % 2 === 1);
  const hasProjectCta = false;
  const lightboxEntry = lightboxIndex === null ? null : mediaEntries[lightboxIndex];
  const lightboxIsVideo = Boolean(lightboxEntry && typeof lightboxEntry === "object" && lightboxEntry.type === "video");
  const lightboxCaption = lightboxIsVideo ? lightboxEntry.caption || `${data.title} — видео проекта` : galleryCaptions[lightboxEntry] || `${data.title} — экран проекта`;
  const lightboxDimensions = galleryDimensions[lightboxEntry];
  return <><MobileSwitch mode="project"/><main className="case-shell"><section className="case-info" id="project-info"><Link href="/" className="back-button"><ArrowLeft aria-hidden="true"/>Назад</Link><header className={hasProjectCta ? "has-cta" : "no-cta"}><h1>{data.title}</h1><p>{data.subtitle}</p>{hasProjectCta && <Link href="https://t.me/myautau" className="light-button case-cta">Обсудить проект</Link>}</header><div className="case-meta">{data.meta.filter(([k]) => k !== "Продукт").map(([k,v])=><p key={k}><span>{k}</span><b>{v}</b></p>)}</div><p className="case-intro">{data.intro}</p>{data.sections.map(([title,text])=><article className="case-text" key={title} id={title.toLowerCase().replaceAll(" ","-")}><h2>{title}</h2><p>{text}</p></article>)}<Link href="/" className="text-link">Все проекты <ArrowUpRight size={16}/></Link></section><section className={`case-gallery${data.gallery.length === 1 ? " single-media" : ""}${data.galleryLayout === "stack" ? " stack-media" : ""}`} id="gallery"><div className="gallery-desktop"><div>{leftGallery.map(renderImage)}</div><div>{rightGallery.map(renderImage)}</div></div><div className="gallery-mobile">{data.gallery.map(renderImage)}</div></section></main>{lightboxIndex !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Просмотр материалов проекта"><div className={`lightbox-scroll${isZoomed ? " zoomed" : ""}`} onClick={(event) => event.target === event.currentTarget && setLightboxIndex(null)}>{lightboxIsVideo ? <video key={mediaItems[lightboxIndex]} src={mediaItems[lightboxIndex]} autoPlay muted loop playsInline disablePictureInPicture disableRemotePlayback/> : <img className={`${lightboxEntry === "other-ba1a805d27423031.webp" ? "lightbox-stories " : ""}${isZoomed ? "lightbox-zoomed" : ""}`} src={mediaItems[lightboxIndex]} width={lightboxDimensions?.[0]} height={lightboxDimensions?.[1]} alt="" role="button" tabIndex={0} aria-label={isZoomed ? "Уменьшить изображение" : "Увеличить изображение"} onClick={toggleImageZoom} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleImageZoom(event); } }} onLoad={(event) => event.currentTarget.classList.toggle("lightbox-tall", event.currentTarget.naturalHeight > event.currentTarget.naturalWidth)}/>}</div><span className="lightbox-caption">{lightboxCaption}</span><button className="lightbox-close" type="button" onClick={() => setLightboxIndex(null)}>Закрыть</button>{mediaItems.length > 1 && <><button className="lightbox-arrow lightbox-prev" type="button" onClick={() => setLightboxIndex(index => (index - 1 + mediaItems.length) % mediaItems.length)} aria-label="Предыдущий материал"><ChevronLeft aria-hidden="true"/></button><button className="lightbox-arrow lightbox-next" type="button" onClick={() => setLightboxIndex(index => (index + 1) % mediaItems.length)} aria-label="Следующий материал"><ChevronRight aria-hidden="true"/></button><span className="lightbox-count">{lightboxIndex + 1} / {mediaItems.length}</span></>}</div>}</>;
}

function ResumePage() {
  return <main className="resume-shell"><aside className="resume-summary"><Link href="/" className="back-button"><ArrowLeft aria-hidden="true"/>Назад</Link><img className="resume-photo" src={`${A}cv-portrait.avif`} alt="Вика Матвеева"/><h1>Вика Матвеева</h1><p className="muted">Продуктовый дизайнер из Санкт-Петербурга с опытом более пяти лет.</p><Link href="mailto:myautau13@gmail.com" className="light-button">Связаться</Link></aside><section className="resume-content"><h2>Опыт работы.</h2>{jobs.map(([role,company,date,text],i)=><article className="resume-job" key={company}><img src={assetUrl(companyLogos[i][0])} alt=""/><div><h3>{company}</h3><p>{role} · {date}</p><span>{text}</span></div></article>)}<h2>Инструменты.</h2><div className="resume-tools">Figma · ChatGPT · Codex · Claude · Framer</div><h2>Образование.</h2><p className="resume-education">Магистратура — СПГХПА им. Штиглица<br/>Бакалавриат — Уральская государственная архитектурно-художественная академия</p></section></main>;
}

function ContactPage() { return <main className="contact-shell"><Link href="/" className="back-button"><ArrowLeft aria-hidden="true"/>Назад</Link><div><h1>Связаться.</h1><p>Предлагаю написать и назначить созвон для знакомства.</p><Link href="mailto:myautau13@gmail.com">myautau13@gmail.com</Link><Link href="https://t.me/myautau">Telegram: @myautau</Link></div></main>; }

export function App() {
  const [route, setRoute] = useState(() => stripBasePath(window.location.pathname));
  useEffect(() => {
    const syncRoute = () => setRoute(stripBasePath(window.location.pathname));
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);
  if (route === "/metrics") return <Suspense fallback={null}><MetricsTrainer/></Suspense>;
  if (route === "/") return <TypographedPage key={route}><Home hypothesis/></TypographedPage>;
  if (route === "/reference") return <Suspense fallback={null}><ReferencePage/></Suspense>;
  if (route === "/hypothesis-test") return <TypographedPage key={route}><Home hypothesis/></TypographedPage>;
  if (route === "/hypothesis-concepts") return <TypographedPage key={route}><CasePage data={cases["/other-projects"]}/></TypographedPage>;
  if (cases[route]) return <TypographedPage key={route}><CasePage data={cases[route]}/></TypographedPage>;
  if (route === "/cv") return <TypographedPage key={route}><ResumePage/></TypographedPage>;
  if (route === "/contact") return <TypographedPage key={route}><ContactPage/></TypographedPage>;
  if (route === "/copy" || route === "/portfolio") return <TypographedPage key={route}><Home hypothesis/></TypographedPage>;
  return <TypographedPage key={route}><Home hypothesis/></TypographedPage>;
}
