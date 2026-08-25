import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUp, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { siClaude } from "simple-icons";
import { chatgptDarkIcon } from "./toolIconData";

const ReferencePage = lazy(() => import("./ReferencePage"));
const MetricsTrainer = lazy(() => import("./MetricsTrainer"));

const A = `${import.meta.env.BASE_URL}assets/`;
const V = `${import.meta.env.BASE_URL}videos/`;
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
const NAVIGATION_EVENT = "portfolio:navigate";
const withBasePath = href => href.startsWith("/") && !href.startsWith("//") ? `${BASE_PATH}${href}` || "/" : href;
const stripBasePath = pathname => {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (BASE_PATH && (normalized === BASE_PATH || normalized.startsWith(`${BASE_PATH}/`))) {
    return normalized.slice(BASE_PATH.length) || "/";
  }
  return normalized;
};
const assetUrl = name => name.startsWith("source/") ? `${A}${name.slice("source/".length)}` : `${A}${name.replace(/\.(?:png|jpe?g)$/i, ".webp")}`;

const shortRussianWords = "а|без|в|во|до|за|и|из|к|ко|на|над|не|но|о|об|обо|от|по|под|при|про|с|со|у";
const hangingWordPattern = new RegExp(`(?<![\\p{L}\\p{N}])(${shortRussianWords})[ \\t]+(?=[\\p{L}\\p{N}])`, "giu");
const typographicText = value => value
  .replace(hangingWordPattern, "$1\u00a0")
  .replace(/[ \u00a0]*—[ \u00a0]*/g, "\u00a0—\u00a0")
  .replace(/(\d)[ \u00a0](?=\d{3}(?:\D|$))/g, "$1\u00a0");

function applyTypography(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest("script, style, code, pre, .no-typography")
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });
  let node;
  while ((node = walker.nextNode())) {
    const nextValue = typographicText(node.nodeValue);
    if (nextValue !== node.nodeValue) node.nodeValue = nextValue;
  }
}

function TypographyFix() {
  useLayoutEffect(() => {
    const root = document.body;
    applyTypography(root);
    const observer = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const nextValue = typographicText(node.nodeValue);
          if (nextValue !== node.nodeValue) node.nodeValue = nextValue;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          applyTypography(node);
        }
      }));
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
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
    window.dispatchEvent(new CustomEvent(NAVIGATION_EVENT, { detail: { href: targetHref } }));
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

function LazyVimeo({ src, title }) {
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
  return <div ref={ref} className="gallery-vimeo-frame">{ready && <iframe src={src} title={title} loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/>}</div>;
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
  "/vmeste": { image: "source/vmeste-main-screen-source.png", mockupPosition: "50% 50%", mockupScale: 1 },
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
    ? { ...card, title: "Другие проекты", kind: "", href: "/other-projects" }
    : card;
};

const allWork = [...workLeft, ...workRight];
const hypothesisCard = href => asHypothesisCard(allWork.find(project => project.href === href));
const hypothesisLeft = ["/ama", "/vmeste", "/avito-fashion"].map(hypothesisCard);
const hypothesisRight = ["/ski-resort", "/investments", "/concept"].map(hypothesisCard);

const jobs = [
  ["Продуктовый дизайнер", "MateÇa", "с 2024", "Мобильные приложения, сайты и внутренние B2B-системы для сервисных, инвестиционных и корпоративных продуктов."],
  ["Продуктовый дизайнер", "Вместе.ру (Самолет)", "2023", "Редизайн ключевых сценариев приложения, новые продуктовые функции и интерфейсы внутренней B2B-платформы."],
  ["Ревьюер", "Яндекс Практикум", "2022 — 2023", "Ревью работ студентов курса «Дизайн интерфейсов» и рекомендации по улучшению продуктовых кейсов."],
  ["UI/UX дизайнер", "Trinity Monsters", "2021 — 2022", "Мобильные приложения, веб-сервисы и корпоративные системы для Web3, финтеха и крупных компаний."],
  ["UI/UX дизайнер, стажировка", "AIC", "2021", "Мобильное приложение Ашана: исследование пользовательского опыта и разработка продуктовой концепции."],
  ["Веб-дизайнер", "Схема", "2019 — 2021", "Лендинги, email-коммуникации и digital-материалы для Яндекса, X5 Retail, ВДНХ и других компаний."],
];

const companyLinks = {
  "MateÇa": "https://mateca.agency",
  "Яндекс Практикум": "https://practicum.yandex.ru/",
  "AIC": "https://www.aic.ru/",
  "Схема": "https://sxema.agency",
};

function CompanyName({ company }) {
  const href = companyLinks[company];
  return href ? <Link href={href} className="company-link">{company}</Link> : company;
}

function CompanyLogo({ company, src, className = "" }) {
  const logo = <img className={className} src={src} alt=""/>;
  const href = companyLinks[company];
  return href ? <Link href={href} className="company-logo-link" aria-label={`Сайт ${company}`}>{logo}</Link> : logo;
}

const companyLogos = [
  ["cv-e22354aee8fa7ae4.avif", "MateÇa"], ["cv-f28cd5dddae5b1c1.avif", "Вместе.ру"],
  ["cv-2d26053dd4cb03b0.avif", "Яндекс Практикум"], ["cv-cff869438157b4cc.avif", "Trinity Monsters"],
  ["cv-ca281cdb6c347f30.avif", "AIC"], ["cv-2d204b65f3c137cd.png", "Схема"],
];

const tools = [
  [`${A}figma-logo.svg`, "Figma", "Проектирование интерфейсов", "figma"],
  [chatgptDarkIcon, "ChatGPT", "Исследования и тексты", "chatgpt"],
  [`${A}codex-logo-transparent.webp`, "Codex", "Прототипирование в коде", "codex"],
  [siClaude, "Claude", "Прототипирование в коде", "claude"],
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
  "ski-a6951fee0dc0d8da-clean.avif": "Главная, услуги и персональные предложения",
  "source/ski-a695-dark.png": "Главная, услуги и персональные предложения",
  "ski-4e5ac801adcc97b3.avif": "Экран информации об отеле",
  "source/manzherok-hotel-detail.png": "Экран информации об отеле",
  "ski-ebd18ef95ae2da98.avif": "Выбор отеля, номера и тарифа",
  "ski-ebd18ef95ae2da98-clean.avif": "Выбор отеля, номера и тарифа",
  "source/ski-ebd-dark.png": "Выбор отеля, номера и тарифа",
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
  "other-portrait-02-hq.png": "Промоскриншоты для App Store и Google Play",
  "other-ba1a805d27423031.webp": "Сторис о новых функциях приложения",
  "source/vmeste-old-nav.png": "Навигатор приложения до редизайна",
  "source/vmeste-layouts.png": "Навигатор и основные сервисы",
  "source/vmeste-stories-collage.png": "Сторис о новых функциях приложения",
  "source/vmeste-profile-layout.png": "Переключение профилей жителя и бизнеса",
  "source/vmeste-notifications.png": "Навигатор и центр уведомлений",
  "trinity-01-hq.png": "Сайт Trinity Monsters — описание вакансии в формате диалога",
  "trinity-02-hq.png": "Сайт Trinity Monsters — форма отклика на вакансию",
  "trinity-03-hq.png": "Сайт Trinity Monsters — знакомство с командой и условиями работы",
  "trinity-04-hq.png": "Сайт Trinity Monsters — выбор вакансии и начало сценария",
  "step-app-01-hq.png": "Step App — главная, инвентарь, тренировка и результаты",
  "step-app-02-hq.png": "Step App — Десктоп — Маркетплейс, кошелёк и профиль",
  "stoloto-hq.png": "Столото — сканирование и массовая проверка билетов",
  "source/investments-sail.png": "Инвестиции — экраны",
  "avito-fashion-hq.png": "Каталог, карточка товара и оформление покупки",
  "avito-fashion-block-01.png": "Каталог, подборки и рекомендации Avito Fashion",
  "avito-fashion-block-02.png": "Карточка товара, подбор образа и поиск",
  "avito-fashion-block-01-dark.png": "Каталог, подборки и рекомендации Avito Fashion",
  "avito-fashion-block-02-dark.png": "Карточка товара, подбор образа и поиск",
  "source/avito-fashion-frame-4.png": "Главная Avito Fashion: категории, AI-подбор образа и выбор инфлюенсеров",
  "source/avito-fashion-frame-6.png": "Избранные бренды и сезонные рекомендации",
  "source/avito-fashion-frame-detail.png": "Карточка товара, подбор образа и поиск по разделам",
  "flight-concept-hq.png": "Маршрут рейса в светлой, синей и тёмной темах",
  "other-screen-hq.png": "Главная и каталог образовательной Web3-платформы",
  "other-portrait-01-hq.png": "Дашборд показателей и сценариев продукта",
  "mentory-main.avif": "Mentory — главная, каталог курсов и образовательные партнёры",
  "mentory-progress.avif": "Mentory — прогресс обучения и результаты курса",
};

const galleryDimensions = {
  "vmeste-c2e5b4da20d62cee.avif": [3200, 2200],
  "vmeste-65f1e8d4f0648310.avif": [3200, 2200],
};

const galleryBackgrounds = {
  "ski-a6951fee0dc0d8da.avif": "#1b1b1b",
  "ski-a6951fee0dc0d8da-clean.avif": "#1b1b1b",
  "ski-4e5ac801adcc97b3.avif": "#1b1b1b",
  "ski-ebd18ef95ae2da98.avif": "#1b1b1b",
  "ski-ebd18ef95ae2da98-clean.avif": "#1b1b1b",
  "ski-eb839b4dfdf80618.avif": "#1b1b1b",
  "ski-06-hq.png": "#1b1b1b",
  "ski-07-hq.png": "#1b1b1b",
  "ski-151861387452668e.avif": "#1b1b1b",
  "ski-stores.png": "#1b1b1b",
  "step-app-01-hq.png": "#fad649",
  "step-app-02-hq.png": "#fad649",
  "stoloto-hq.png": "#1b1b1b",
  "trinity-01-hq.png": "#c8ff00",
  "trinity-02-hq.png": "#c8ff00",
  "trinity-03-hq.png": "#c8ff00",
  "trinity-04-hq.png": "#c8ff00",
  "flight-concept-hq.png": "#1b1b1b",
  "other-screen-hq.png": "#000",
  "other-portrait-01-hq.png": "#000",
  "mentory-main.avif": "#000",
  "mentory-progress.avif": "#000",
  "other-portrait-02-hq.png": "#fef6f2",
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
        {project.appIcon && <img className={`work-app-icon${project.appIcon === "ama-app-icon.png" ? " work-app-icon-ama" : ""}`} src={assetUrl(project.appIcon)} alt="" loading="lazy" decoding="async" aria-hidden="true"/>}
        <span>{project.title}</span>
      </b>
      <small>{project.kind}</small>
    </span>
  </Link>;
}

function MobileSwitch({ mode = "home" }) {
  const [active, setActive] = useState("first");
  const first = mode === "home" ? ["Обо мне", "#intro"] : ["О проекте", "#project-info"];
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
      <div className="principles"><p>Начинаю с задач пользователя и бизнеса, а не с готового визуального решения.</p><p>Проверяю гипотезы исследованиями и прототипами до передачи в разработку.</p><p>Думаю о передаче в разработку и поддерживаю решения понятной документацией.</p><p>Люблю нестандартные идеи, нишевые приложения и эксперименты с нейросетями.</p></div>
    </InfoSection>

    <InfoSection title="Опыт работы">
      <div className="experience-list">{jobs.map(([role, company, date, text], index)=><article key={company}><CompanyLogo company={company} src={assetUrl(companyLogos[index][0])} className="experience-logo"/><div><h3>{role}</h3><p className="job-meta"><CompanyName company={company}/> · {date}</p><p>{text}</p></div></article>)}</div>
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
  useLayoutEffect(() => {
    const cards = [...document.querySelectorAll(".work-pane .work-card")];
    cards.forEach(card => card.classList.add("home-card-reveal-ready"));
    const frame = window.requestAnimationFrame(() => {
      cards.forEach(card => card.classList.add("home-card-reveal-visible"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hypothesis]);
  return <section className={`work-pane${hypothesis ? " hypothesis-work" : ""}`} id="work"><div className="work-desktop"><div className="work-column">{left.map((p, index)=><ProjectCard key={p.title} project={p} priority={index === 0}/>)}</div><div className="work-column">{right.map((p, index)=><ProjectCard key={p.title} project={p} priority={index === 0}/>)}</div></div><div className="work-mobile-list">{mobileOrder.map((p, index)=><ProjectCard key={p.title} project={p} priority={index === 0}/>)}</div></section>;
}

function Home({ hypothesis = false }) {
  useEffect(() => {
    if (!hypothesis) return;
    const previousTitle = document.title;
    document.title = "Viktoria Matveeva — Product Designer";
    return () => { document.title = previousTitle; };
  }, [hypothesis]);
  return <main className={`portfolio-shell${hypothesis ? " hypothesis-page" : ""}`}><div className="about-wrap"><AboutPane/></div><WorkPane hypothesis={hypothesis}/></main>;
}

const cases = {
  "/ama": {
    title: "AMA", subtitle: "Переосмысление консьерж-сервиса для клиентов private banking", meta: [["Продукт","Мобильное приложение"],["Направление","Консьерж-сервис"],["Платформа","iOS, Android"]],
    intro: "Премиальный консьерж-сервис ВТБ для путешествий, ресторанов, привилегий и персональных запросов.",
    hideSections: ["О задаче", "Аудитория", "Стратегия", "Результат"],
    sections: [["О задаче","Дать клиенту выбор: решить вопрос самостоятельно, обратиться к менеджеру или получить готовое предложение."],["Аудитория","Учесть скорость для new money, деликатный сервис для old money и самостоятельность для self-made."],["Стратегия","Объединила чат, закрытые предложения, календарь, уведомления и семейные профили."],["Визуальная концепция","Синие градиенты, металл и мягкое свечение создают технологичный премиальный образ."],["Чат","Запросы превращаются в понятные виджеты прямо внутри чата: авиабилеты, билеты на концерты, бронирования ресторанов и отелей."],["Умная лента","Лента автоматически подстраивается под поездки и события пользователя: перед концертом предлагает рестораны в нужном городе, а в путешествии — отели, курорты и спа."],["Коллекции","Места и идеи можно сохранить в подборку и отправить консьержу."],["CRM","В CRM собраны задачи, статусы, предложения, контекст клиента и SLA."],["Результат","Концепция получила инвестиции и перешла к реализации."]],
    gallery: ["ama/ama-11.jpg","ama/ama-12.jpg","ama/ama-14.jpg","ama/ama-15.jpg","ama/ama-17.jpg","ama/ama-18.jpg","ama/ama-04.jpg","ama/ama-05.jpg","ama/ama-06.jpg","ama/ama-07.jpg","ama/ama-08.jpg","ama/ama-03.jpg"]
  },
  "/ski-resort": {
    title: "Манжерок", subtitle: "Приложение для горнолыжного курорта", meta: [["Продукт","Мобильное приложение"],["Направление","Туризм"],["Платформа","iOS, Android"]],
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
      { type: "video", src: `${V}ls1FrvqnYmzT7Z7QrqCSwI1WANY.mp4`, caption: "Все разделы главной страницы" },
      "source/ski-a695-dark.png",
      "source/manzherok-hotel-detail.png",
      "source/ski-ebd-dark.png",
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
      ["Ресерч и дискавери","На основе общения с пользователями составили JTBD и сформулировали гипотезы. Результат редизайна решили оценивать по посещаемости Навигатора, переходам в другие разделы, количеству переходов к полезным сценариям и переходам из сторис."],
      ["Проработка структуры","Разделила контент на разделы, виджеты, данные, действия и ссылки."],
      ["Валидация прототипов","Протестировали прототипы на 13 пользователях и уточнили названия, порядок и доступность функций."],
      ["Инсайты","По результатам тестирования Навигатор жителя стал основным, бизнес — второй вкладкой, а создание объявления — первым быстрым действием."],
      ["Финальный дизайн","Собрала три состояния Навигатора, центр уведомлений и четыре информационных сторис."],
      ["Результаты","Посещаемость раздела выросла с 17% до 25%, а количество объявлений, созданных из Навигатора, достигло 41% всех точек создания."],
    ],
    gallery: ["source/vmeste-old-nav.png","vmeste-7d7d2baa6f042ebf.avif","source/vmeste-layouts.png","source/vmeste-profile-layout.png","source/vmeste-notifications.png",{ type: "video", src: `${V}vmeste-navigation-clean.mp4?v=2`, caption: "Навигатор Вместе.ру — видео проекта" },"source/vmeste-stories-collage.png","other-portrait-02-hq.png"]
  },
  "/investments": {
    title: "Инвестиции", subtitle: "Концепт мобильного приложения для управления инвестициями", meta: [["Продукт","Мобильное приложение"],["Направление","Финтех"]],
    intro: "Концепт мобильного приложения для управления портфелем: динамика активов, структура вложений и ключевые показатели в одном сценарии.",
    sections: [],
    galleryLayout: "stack",
    gallery: [{ type: "video", src: `${V}investments-hq.mp4` },"source/investments-sail.png"]
  },
  "/trinity-monsters": {
    title: "Trinity Monsters", subtitle: "Концепт раздела вакансий в эстетике Windows 98", meta: [["Продукт","Раздел вакансий"],["Направление","Подбор персонала"],["Платформа","Web"]],
    intro: "Раздел вакансий в формате диалога и эстетике Windows 98.",
    sections: [["Идея","Превратить обычный список вакансий в интерактивный сценарий знакомства с командой."],["Механика","Пользователь выбирает направление, читает описание и оставляет отклик внутри последовательного диалога."],["Визуальный язык","Интерфейс отсылает к Windows 98 и сочетает чёрный фон с ярким зелёным акцентом."]],
    gallery: ["trinity-01-hq.png","trinity-02-hq.png","trinity-03-hq.png","trinity-04-hq.png"]
  },
  "/avito-fashion": {
    title: "Avito Fashion", subtitle: "Концепция fashion-вертикали внутри Avito", meta: [["Продукт","Раздел маркетплейса"],["Направление","Маркетплейс"]],
    intro: "Концепция раздела для выгодных покупок одежды, обуви, аксессуаров и винтажа.",
    sections: [],
    galleryLayout: "stack",
    gallery: ["source/avito-fashion-frame-4.png","source/avito-fashion-frame-detail.png","source/avito-fashion-frame-6.png"]
  },
  "/concept": {
    title: "Концепт", subtitle: "Концепция мобильного приложения", meta: [["Продукт","Мобильное приложение"],["Направление","Электронная коммерция"],["Платформа","iOS, Android"]],
    intro: "Мобильный e-commerce-концепт с каталогом, подборками и быстрыми сценариями.",
    sections: [["О задаче","Собрать насыщенный контент в понятную структуру и сохранить выразительную визуальную подачу."],["Интерфейс","Карточки, подборки и навигация объединены в компактную мобильную систему."],["Визуальная система","Тёмная основа и цветовые акценты помогают разделять контент и выделять ключевые действия."]],
    gallery: [
      { type: "video", src: `${V}HRukF4ca0a0qfNKqktNqpjFcoL4.mp4`, caption: "Концепт мобильного приложения" },
      { type: "video", src: `${V}TImWiJ2hRhf2RpzcqBJIbeuDxQw.mp4`, caption: "Концепт мобильного приложения" }
    ]
  },
  "/other-projects": {
    title: "Другие проекты", subtitle: "", meta: [["Платформа","iOS, Android, Web"]],
    intro: "Реализованные проекты и концепты — мобильные приложения и сайты.",
    sections: [],
    gallery: [
      { type: "video", src: `${V}HRukF4ca0a0qfNKqktNqpjFcoL4.mp4`, caption: "Концепт мобильного приложения" },
      "step-app-01-hq.png",
      "step-app-02-hq.png",
      "stoloto-hq.png",
      "trinity-01-hq.png",
      "trinity-02-hq.png",
      "trinity-03-hq.png",
      "trinity-04-hq.png",
      "mentory-main.avif",
      "mentory-progress.avif",
      { type: "video", src: `${V}TImWiJ2hRhf2RpzcqBJIbeuDxQw.mp4`, caption: "Концепт мобильного приложения" },
      "flight-concept-hq.png"
    ]
  },
  "/step-app": {
    title: "Step App", subtitle: "Ключевые сценарии Web3-приложения", meta: [["Продукт","Мобильное приложение"],["Направление","Web3 и фитнес"],["Платформа","iOS, Android, Web"]],
    intro: "Web3-приложение с бегом, кошельком и виртуальными кроссовками.",
    sections: [["Основные сценарии","Регистрация, кошелёк, маркетплейс, инвентарь и запуск тренировки собраны в единой системе."],["Инвентарь","Пользователь управляет кроссовками и их характеристиками, отслеживает ресурсы и прогресс."],["Тренировка","Во время пробежки интерфейс показывает темп, дистанцию, маршрут и игровые показатели."]],
    gallery: ["step-app-01-hq.png","step-app-02-hq.png"]
  },
  "/stoloto": {
    title: "Столото", subtitle: "Сервис массовой проверки лотерейных билетов", meta: [["Продукт","Сервис внутри приложения"],["Направление","Лотереи"],["Платформа","iOS, Android"]],
    intro: "Сервис помогает проверить несколько билетов разных лотерей через QR-сканирование или ручной ввод.",
    sections: [["О задаче","Сократить путь от набора билетов до понятного результата проверки."],["Сканирование","Пользователь добавляет билеты по QR-коду и видит их в общей подборке."],["Результат","Статусы и сумма выигрыша представлены так, чтобы быстро оценить итог по всем билетам."]],
    gallery: ["stoloto-hq.png"]
  },
  "/travel-concept": {
    title: "Туризм", subtitle: "Концепт мобильного приложения для планирования путешествий", meta: [["Продукт","Мобильное приложение"],["Направление","Туризм"],["Платформа","iOS"]],
    intro: "Концепт выбора направлений и активностей по интересам.",
    sections: [["Идея","Сделать планирование путешествия лёгким выбором впечатлений."],["Механика","Карточки мест можно пропускать или добавлять в маршрут."],["Визуальная система","Крупные фотографии, мягкие градиенты и плавная анимация."]],
    gallery: [{ type: "video", src: `${V}TImWiJ2hRhf2RpzcqBJIbeuDxQw.mp4` }]
  },
  "/flight-tracker": {
    title: "Авиарейсы", subtitle: "Концепт приложения для отслеживания перелётов", meta: [["Продукт","Мобильное приложение"],["Направление","Туризм"],["Платформа","iOS"]],
    intro: "Концепт для отслеживания рейсов на карте.",
    sections: [["О задаче","Объединить карту, маршрут и список рейсов."],["Интерфейс","Статус, время и детали рейса доступны на одном экране."],["Темы","Проверить читаемость в светлой, синей и тёмной темах."]],
    gallery: ["flight-concept-hq.png"]
  },
  "/web3-education": {
    title: "Web3 Education", subtitle: "Концепция образовательной платформы про NFT и Web3", meta: [["Продукт","Образовательная платформа"],["Направление","Web3 и образование"],["Платформа","Web"]],
    intro: "Образовательная платформа о NFT и Web3.",
    sections: [["О задаче","Сделать Web3 понятнее и объединить обучение, навигацию и прогресс."],["Структура","Выстроить материалы от базовых тем к сложным."],["Визуальный язык","Тёмная основа и зелёные акценты поддерживают технологичный характер."]],
    gallery: ["other-screen-hq.png","other-portrait-01-hq.png"]
  },
  "/other": {
    title: "Другие проекты", subtitle: "Мобильные приложения, сервисы, сайты и визуальные концепции", meta: [["Продукт","Подборка проектов"],["Направление","Цифровые продукты"],["Платформа","Mobile, Web"]],
    intro: "Подборка работ для Web3, e-commerce, fintech, travel, HR и социальных продуктов.",
    sections: [["Step App","Ключевые сценарии Web3-приложения: регистрация, кошелёк, маркетплейс, инвентарь и бег."],["Avito Fashion","Концепция вертикали для выгодных покупок одежды, обуви, аксессуаров и винтажа."],["Столото","Массовая проверка билетов разных лотерей через QR-сканирование и ручной ввод."],["Trinity Monsters","Раздел вакансий в эстетике Windows 98, построенный как диалог в мессенджере."],["Другие концепты","Туризм, отслеживание рейсов, инвестиции в недвижимость и образовательная Web3-платформа."]],
    gallery: ["step-app-01-hq.png","step-app-02-hq.png","avito-fashion-hq.png","stoloto-hq.png","trinity-04-hq.png","trinity-02-hq.png","trinity-03-hq.png","trinity-01-hq.png","flight-concept-hq.png","other-screen-hq.png","other-portrait-01-hq.png","other-portrait-02-hq.png","other-ba1a805d27423031.webp"]
  }
};

function CasePage({ data }) {
  const mediaEntries = data.gallery;
  const mediaItems = mediaEntries.map(item => typeof item === "object" && (item.type === "video" || item.type === "vimeo") ? item.src : assetUrl(item));
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxTransform, setLightboxTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDesktopZoomed, setIsDesktopZoomed] = useState(false);
  const [desktopZoomPoint, setDesktopZoomPoint] = useState({ x: 0.5, y: 0.5 });
  const swipeStartRef = useRef(null);
  const pinchGestureRef = useRef(null);
  const lightboxTransformRef = useRef(lightboxTransform);
  const lightboxMediaRef = useRef(null);
  const lightboxBaseSizeRef = useRef(null);
  const lightboxScrollRef = useRef(null);
  const lightboxOriginRef = useRef(null);
  const updateLightboxTransform = (nextTransform) => {
    if (nextTransform.scale <= 1) lightboxBaseSizeRef.current = null;
    lightboxTransformRef.current = nextTransform;
    setLightboxTransform(nextTransform);
  };
  const resetLightboxPosition = () => {
    updateLightboxTransform({ scale: 1, x: 0, y: 0 });
    setIsDesktopZoomed(false);
    pinchGestureRef.current = null;
    swipeStartRef.current = null;
    lightboxScrollRef.current?.scrollTo(0, 0);
  };
  const changeLightboxIndex = (nextIndex) => {
    resetLightboxPosition();
    setLightboxIndex(nextIndex);
  };
  useLayoutEffect(() => {
    const gallery = document.querySelector(".case-gallery");
    if (!gallery) return undefined;
    const isMobile = window.matchMedia("(max-width: 809px)").matches;
    const visibleGallery = gallery.querySelector(isMobile ? ".gallery-mobile" : ".gallery-desktop") || gallery;
    const figures = [...visibleGallery.querySelectorAll("figure")];
    figures.forEach((figure) => {
      figure.classList.add("gallery-reveal-ready");
    });
    if (!("IntersectionObserver" in window)) {
      figures.forEach(figure => figure.classList.add("gallery-reveal-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("gallery-reveal-visible");
        observer.unobserve(entry.target);
      });
    }, {
      root: isMobile ? null : gallery,
      threshold: 0.12,
      rootMargin: isMobile ? "0px 0px -8% 0px" : "0px 0px -6% 0px",
    });
    figures.forEach(figure => observer.observe(figure));
    return () => observer.disconnect();
  }, [data.title]);
  useEffect(() => {
    if (lightboxIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    const navigateLightbox = (event) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft" && mediaItems.length > 1) changeLightboxIndex(index => (index - 1 + mediaItems.length) % mediaItems.length);
      if (event.key === "ArrowRight" && mediaItems.length > 1) changeLightboxIndex(index => (index + 1) % mediaItems.length);
    };
    document.body.style.overflow = "hidden";
    document.body.classList.add("lightbox-open");
    window.addEventListener("keydown", navigateLightbox);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("lightbox-open");
      window.removeEventListener("keydown", navigateLightbox);
    };
  }, [lightboxIndex, mediaItems.length]);
  useLayoutEffect(() => {
    if (lightboxIndex === null) return;
    lightboxScrollRef.current?.scrollTo(0, 0);
  }, [lightboxIndex]);
  useEffect(() => {
    if (!isDesktopZoomed || lightboxIndex === null) return;
    const frame = window.requestAnimationFrame(() => {
      const scroller = document.querySelector(".lightbox-scroll");
      if (!scroller) return;
      scroller.scrollTo({
        left: desktopZoomPoint.x * scroller.scrollWidth - scroller.clientWidth / 2,
        top: desktopZoomPoint.y * scroller.scrollHeight - scroller.clientHeight / 2,
        behavior: "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isDesktopZoomed, desktopZoomPoint, lightboxIndex]);
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
  useLayoutEffect(() => {
    if (lightboxIndex === null || !lightboxMediaRef.current) {
      lightboxOriginRef.current = null;
      return;
    }
    const media = lightboxMediaRef.current;
    media.getAnimations().forEach(animation => animation.cancel());
    const target = media.getBoundingClientRect();
    const origin = lightboxOriginRef.current;
    lightboxOriginRef.current = null;
    if (origin && target.width > 0 && target.height > 0) {
      const deltaX = origin.left + origin.width / 2 - (target.left + target.width / 2);
      const deltaY = origin.top + origin.height / 2 - (target.top + target.height / 2);
      const isMotionMedia = media instanceof HTMLVideoElement || media.classList.contains("lightbox-vimeo-frame");
      const sharedScale = isMotionMedia
        ? Math.min(origin.width / target.width, origin.height / target.height)
        : null;
      media.animate([
        { opacity: 0.5, filter: "blur(3px)", transform: `translate(${deltaX}px, ${deltaY}px) scale(${sharedScale ?? `${origin.width / target.width}, ${origin.height / target.height}`})` },
        { opacity: 1, filter: "blur(0)", offset: 0.72 },
        { opacity: 1, transform: "none" },
      ], { duration: 620, easing: "cubic-bezier(.16,1,.3,1)" });
      return;
    }
  }, [lightboxIndex]);

  const touchDistance = (touches) => Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY,
  );

  const touchMidpoint = (touches) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });

  const clampLightboxPan = (scale, x, y) => {
    const media = lightboxMediaRef.current;
    if (!media || scale <= 1) return { scale: 1, x: 0, y: 0 };
    const rect = media.getBoundingClientRect();
    if (media instanceof HTMLImageElement && !lightboxBaseSizeRef.current) {
      lightboxBaseSizeRef.current = { width: rect.width, height: rect.height };
    }
    const isRenderedAtZoomedSize = media instanceof HTMLImageElement && lightboxBaseSizeRef.current;
    const baseWidth = isRenderedAtZoomedSize
      ? lightboxBaseSizeRef.current.width
      : rect.width / Math.max(lightboxTransformRef.current.scale, 1);
    const baseHeight = isRenderedAtZoomedSize
      ? lightboxBaseSizeRef.current.height
      : rect.height / Math.max(lightboxTransformRef.current.scale, 1);
    const intrinsicMaxScale = media instanceof HTMLImageElement && media.naturalWidth > 0
      ? Math.max(1, Math.min(4, media.naturalWidth / baseWidth, media.naturalHeight / baseHeight))
      : 2.5;
    const constrainedScale = Math.min(scale, intrinsicMaxScale);
    const maxX = Math.max(0, (baseWidth * constrainedScale - window.innerWidth) / 2 + 24);
    const maxY = Math.max(0, (baseHeight * constrainedScale - window.innerHeight) / 2 + 56);
    return {
      scale: constrainedScale,
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const toggleDesktopImageZoom = (event) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (!isDesktopZoomed) {
      const rect = event.currentTarget.getBoundingClientRect();
      setDesktopZoomPoint({
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      });
    }
    setIsDesktopZoomed(value => !value);
  };

  const handleLightboxTouchStart = (event) => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    if (event.touches.length === 2) {
      const transform = lightboxTransformRef.current;
      pinchGestureRef.current = {
        type: "pinch",
        distance: touchDistance(event.touches),
        midpoint: touchMidpoint(event.touches),
        transform,
      };
      swipeStartRef.current = null;
      return;
    }
    if (event.touches.length === 1 && lightboxTransformRef.current.scale > 1) {
      const touch = event.touches[0];
      pinchGestureRef.current = {
        type: "pan",
        point: { x: touch.clientX, y: touch.clientY },
        transform: lightboxTransformRef.current,
      };
      swipeStartRef.current = null;
      return;
    }
    if (mediaItems.length < 2 || event.touches.length !== 1) {
      swipeStartRef.current = null;
      return;
    }
    const touch = event.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLightboxTouchMove = (event) => {
    const gesture = pinchGestureRef.current;
    if (!gesture) return;
    if (gesture.type === "pinch" && event.touches.length === 2) {
      event.preventDefault();
      const midpoint = touchMidpoint(event.touches);
      const scale = Math.max(1, Math.min(4, gesture.transform.scale * touchDistance(event.touches) / gesture.distance));
      const scaleRatio = scale / gesture.transform.scale;
      const viewportCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const x = midpoint.x - viewportCenter.x - scaleRatio * (gesture.midpoint.x - viewportCenter.x - gesture.transform.x);
      const y = midpoint.y - viewportCenter.y - scaleRatio * (gesture.midpoint.y - viewportCenter.y - gesture.transform.y);
      updateLightboxTransform(clampLightboxPan(scale, x, y));
      return;
    }
    if (gesture.type === "pan" && event.touches.length === 1) {
      event.preventDefault();
      const touch = event.touches[0];
      updateLightboxTransform(clampLightboxPan(
        gesture.transform.scale,
        gesture.transform.x + touch.clientX - gesture.point.x,
        gesture.transform.y + touch.clientY - gesture.point.y,
      ));
    }
  };

  const handleLightboxTouchEnd = (event) => {
    if (pinchGestureRef.current) {
      if (event.touches.length === 1 && lightboxTransformRef.current.scale > 1) {
        const touch = event.touches[0];
        pinchGestureRef.current = {
          type: "pan",
          point: { x: touch.clientX, y: touch.clientY },
          transform: lightboxTransformRef.current,
        };
      } else if (event.touches.length === 0) {
        pinchGestureRef.current = null;
        if (lightboxTransformRef.current.scale < 1.03) updateLightboxTransform({ scale: 1, x: 0, y: 0 });
      }
      swipeStartRef.current = null;
      return;
    }
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || mediaItems.length < 2 || event.changedTouches.length !== 1) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) return;
    event.preventDefault();
    changeLightboxIndex(index => deltaX < 0
      ? (index + 1) % mediaItems.length
      : (index - 1 + mediaItems.length) % mediaItems.length);
  };

  const openLightbox = (index, event) => {
    const source = event.currentTarget.closest("figure") || event.currentTarget;
    const rect = source.getBoundingClientRect();
    lightboxOriginRef.current = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    changeLightboxIndex(index);
  };

  const renderImage = (item, i) => {
    const isVideo = typeof item === "object" && item.type === "video";
    const isVimeo = typeof item === "object" && item.type === "vimeo";
    const isMotion = isVideo || isVimeo;
    const src = isMotion ? item.src : assetUrl(item);
    const isVmesteStories = !isMotion && item === "other-ba1a805d27423031.webp";
    const isPaddedConcept = !isMotion && data.title === "Другие проекты" && (item === "stoloto-hq.png" || item === "flight-concept-hq.png");
    const backgroundColor = !isMotion ? (data.title === "Манжерок" ? "#1b1b1b" : galleryBackgrounds[item]) : undefined;
    const caption = isMotion ? item.caption || `${data.title} — видео проекта` : galleryCaptions[item] || `${data.title} — экран проекта`;
    return <figure className={`${isVimeo ? "gallery-vimeo-card " : ""}${isVmesteStories ? "vmeste-stories-card " : ""}${isPaddedConcept ? "padded-concept-card" : ""}`.trim() || undefined} key={src} style={backgroundColor ? { backgroundColor } : undefined}>{isVimeo
      ? <><LazyVimeo src={src} title={caption}/><button className="gallery-vimeo-open" type="button" onClick={(event) => openLightbox(mediaItems.indexOf(src), event)} aria-label={`${caption}. Открыть на весь экран`}><span>{caption}</span></button></>
      : <button className={`gallery-image-button${isVideo ? " is-video" : ""}`} type="button" onClick={(event) => openLightbox(mediaItems.indexOf(src), event)} aria-label={`${caption}. Открыть на весь экран`}>{isVideo
        ? <LazyVideo src={src} autoPlay muted loop playsInline/>
        : <img src={src} alt="" loading={mediaEntries.indexOf(item) > 1 ? "lazy" : "eager"} fetchPriority={mediaEntries.indexOf(item) === 0 ? "high" : "auto"} decoding="async"/>
      }<span>{caption}</span></button>}</figure>;
  };
  const leftGallery = data.gallery.filter((_, i) => i % 2 === 0);
  const rightGallery = data.gallery.filter((_, i) => i % 2 === 1);
  const hasProjectCta = false;
  const lightboxEntry = lightboxIndex === null ? null : mediaEntries[lightboxIndex];
  const lightboxIsVideo = Boolean(lightboxEntry && typeof lightboxEntry === "object" && lightboxEntry.type === "video");
  const lightboxIsVimeo = Boolean(lightboxEntry && typeof lightboxEntry === "object" && lightboxEntry.type === "vimeo");
  const lightboxIsMotion = lightboxIsVideo || lightboxIsVimeo;
  const lightboxIsVmeste = data.title === "Вместе.ру";
  const lightboxIsVmesteStories = lightboxEntry === "other-ba1a805d27423031.webp";
  const lightboxIsPaddedConcept = data.title === "Другие проекты" && (lightboxEntry === "stoloto-hq.png" || lightboxEntry === "flight-concept-hq.png");
  const lightboxCaption = lightboxIsMotion ? lightboxEntry.caption || `${data.title} — видео проекта` : galleryCaptions[lightboxEntry] || `${data.title} — экран проекта`;
  const lightboxDimensions = galleryDimensions[lightboxEntry];
  const usesUnifiedCorners = ["Вместе.ру", "Манжерок", "Другие проекты"].includes(data.title);
  const lightboxBackground = !lightboxIsMotion ? (data.title === "Манжерок" ? "#1b1b1b" : galleryBackgrounds[lightboxEntry]) : undefined;
  const lightboxIsSkiOnDarkBackground = data.title === "Манжерок" && !lightboxIsMotion;
  const imageZoomSize = lightboxTransform.scale > 1 && lightboxBaseSizeRef.current
    ? {
      width: `${lightboxBaseSizeRef.current.width * lightboxTransform.scale}px`,
      height: `${lightboxBaseSizeRef.current.height * lightboxTransform.scale}px`,
      maxWidth: "none",
      maxHeight: "none",
      transform: `translate3d(${lightboxTransform.x}px, ${lightboxTransform.y}px, 0)`,
    }
    : { transform: `translate3d(${lightboxTransform.x}px, ${lightboxTransform.y}px, 0) scale(${lightboxTransform.scale})` };
  const lightboxMedia = lightboxIsVimeo
    ? <div key={mediaItems[lightboxIndex]} ref={lightboxMediaRef} className={`lightbox-vimeo-frame${lightboxIsVmeste ? " lightbox-vmeste-video" : ""}${lightboxTransform.scale > 1 ? " lightbox-pinched" : ""}`} style={{ transform: `translate3d(${lightboxTransform.x}px, ${lightboxTransform.y}px, 0) scale(${lightboxTransform.scale})` }}><iframe src={mediaItems[lightboxIndex]} title={lightboxCaption} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/></div>
    : lightboxIsVideo
      ? <video key={mediaItems[lightboxIndex]} ref={lightboxMediaRef} className={`${lightboxIsVmeste ? "lightbox-vmeste-video " : ""}${lightboxTransform.scale > 1 ? "lightbox-pinched" : ""}`.trim() || undefined} style={{ transform: `translate3d(${lightboxTransform.x}px, ${lightboxTransform.y}px, 0) scale(${lightboxTransform.scale})` }} src={mediaItems[lightboxIndex]} autoPlay muted loop playsInline disablePictureInPicture disableRemotePlayback/>
      : <img key={mediaItems[lightboxIndex]} ref={lightboxMediaRef} className={`${isDesktopZoomed ? "lightbox-desktop-zoomed " : ""}${usesUnifiedCorners ? "lightbox-uniform " : ""}${lightboxIsVmeste ? "lightbox-vmeste " : ""}${lightboxIsVmesteStories ? "lightbox-stories " : ""}${lightboxIsPaddedConcept ? "lightbox-padded-concept " : ""}${lightboxIsSkiOnDarkBackground ? "lightbox-ski-dark" : ""}${lightboxTransform.scale > 1 ? " lightbox-pinched lightbox-high-res-zoom" : ""}`.trim()} style={{ ...(lightboxBackground ? { backgroundColor: lightboxBackground, "--media-background": lightboxBackground } : {}), ...imageZoomSize }} src={mediaItems[lightboxIndex]} width={lightboxDimensions?.[0]} height={lightboxDimensions?.[1]} alt="" onClick={toggleDesktopImageZoom} onLoad={(event) => event.currentTarget.classList.toggle("lightbox-tall", event.currentTarget.naturalHeight > event.currentTarget.naturalWidth)}/>;
  const visibleSections = data.sections.filter(([title]) => !(data.hideSections || []).includes(title));
  return <><main className="case-shell"><section className="case-info" id="project-info"><Link href="/" className="back-button"><ArrowLeft aria-hidden="true"/>Назад</Link><header className={hasProjectCta ? "has-cta" : "no-cta"}><h1>{data.title}</h1><p>{data.subtitle}</p>{hasProjectCta && <Link href="https://t.me/myautau" className="light-button case-cta">Обсудить проект</Link>}</header><div className="case-meta">{data.meta.filter(([k]) => k !== "Продукт").map(([k,v])=><p key={k}><span>{k}</span><b>{v}</b></p>)}</div><p className={`case-intro${visibleSections.length === 0 ? " case-intro-last" : ""}`}>{data.intro}</p>{visibleSections.map(([title,text])=><article className={`case-text${title === "О задаче" ? " case-task" : ""}`} key={title} id={title.toLowerCase().replaceAll(" ","-")}><h2>{title}</h2><p>{text}</p></article>)}<Link href="/" className="text-link">Все проекты <ArrowUpRight size={16}/></Link></section><section className={`case-gallery${usesUnifiedCorners ? " uniform-media-gallery" : ""}${data.title === "Вместе.ру" ? " vmeste-gallery" : ""}${data.title === "Манжерок" ? " ski-gallery" : ""}${data.gallery.length === 1 ? " single-media" : ""}${data.galleryLayout === "stack" ? " stack-media" : ""}`} id="gallery"><div className="gallery-desktop"><div>{leftGallery.map(renderImage)}</div><div>{rightGallery.map(renderImage)}</div></div><div className="gallery-mobile">{data.gallery.map(renderImage)}</div></section></main>{lightboxIndex !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Просмотр материалов проекта"><div ref={lightboxScrollRef} className={`lightbox-scroll${lightboxTransform.scale > 1 || isDesktopZoomed ? " zoomed" : ""}`} onClick={(event) => event.target === event.currentTarget && setLightboxIndex(null)} onTouchStart={handleLightboxTouchStart} onTouchMove={handleLightboxTouchMove} onTouchEnd={handleLightboxTouchEnd} onTouchCancel={() => { swipeStartRef.current = null; pinchGestureRef.current = null; }}>{lightboxMedia}</div><div className="lightbox-controls"><span className="lightbox-caption">{lightboxCaption}</span><button className="lightbox-close" type="button" onClick={() => setLightboxIndex(null)}>Закрыть</button>{mediaItems.length > 1 && <><button className="lightbox-arrow lightbox-prev" type="button" onClick={() => changeLightboxIndex(index => (index - 1 + mediaItems.length) % mediaItems.length)} aria-label="Предыдущий материал"><ChevronLeft aria-hidden="true"/></button><button className="lightbox-arrow lightbox-next" type="button" onClick={() => changeLightboxIndex(index => (index + 1) % mediaItems.length)} aria-label="Следующий материал"><ChevronRight aria-hidden="true"/></button><span className="lightbox-count">{lightboxIndex + 1} / {mediaItems.length}</span></>}</div></div>}</>;
}

function ResumePage() {
  return <main className="resume-shell"><aside className="resume-summary"><Link href="/" className="back-button"><ArrowLeft aria-hidden="true"/>Назад</Link><img className="resume-photo" src={`${A}cv-portrait.avif`} alt="Вика Матвеева"/><h1>Вика Матвеева</h1><p className="muted">Продуктовый дизайнер из Санкт-Петербурга с опытом более пяти лет.</p><Link href="mailto:myautau13@gmail.com" className="light-button">Связаться</Link></aside><section className="resume-content"><h2>Опыт работы.</h2>{jobs.map(([role,company,date,text],i)=><article className="resume-job" key={company}><CompanyLogo company={company} src={assetUrl(companyLogos[i][0])}/><div><h3><CompanyName company={company}/></h3><p>{role} · {date}</p><span>{text}</span></div></article>)}<h2>Инструменты.</h2><div className="resume-tools">Figma · ChatGPT · Codex · Claude · Framer</div></section></main>;
}

function ContactPage() { return <main className="contact-shell"><Link href="/" className="back-button"><ArrowLeft aria-hidden="true"/>Назад</Link><div><h1>Связаться.</h1><p>Предлагаю написать и назначить созвон для знакомства.</p><Link href="mailto:myautau13@gmail.com">myautau13@gmail.com</Link><Link href="https://t.me/myautau">Telegram: @myautau</Link></div></main>; }

export function App() {
  const [route, setRoute] = useState(() => stripBasePath(window.location.pathname));
  const [isLeaving, setIsLeaving] = useState(false);
  const routeRef = useRef(route);
  const navigationTimerRef = useRef(null);
  const resetDocumentScroll = () => {
    window.scrollTo(0, 0);
    document.scrollingElement && (document.scrollingElement.scrollTop = 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };
  useEffect(() => {
    const transitionTo = (nextRoute, href) => {
      if (nextRoute === routeRef.current) return;
      window.clearTimeout(navigationTimerRef.current);
      document.body.classList.add("route-transitioning");
      setIsLeaving(true);
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180;
      navigationTimerRef.current = window.setTimeout(() => {
        if (href) window.history.pushState({}, "", href);
        routeRef.current = nextRoute;
        setRoute(nextRoute);
        setIsLeaving(false);
        document.body.classList.remove("route-transitioning");
      }, duration);
    };
    const navigate = event => {
      const href = event.detail?.href;
      if (!href) return;
      transitionTo(stripBasePath(new URL(href, window.location.href).pathname), href);
    };
    const syncRoute = () => transitionTo(stripBasePath(window.location.pathname));
    window.addEventListener(NAVIGATION_EVENT, navigate);
    window.addEventListener("popstate", syncRoute);
    return () => {
      window.clearTimeout(navigationTimerRef.current);
      document.body.classList.remove("route-transitioning");
      window.removeEventListener(NAVIGATION_EVENT, navigate);
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);
  useLayoutEffect(() => {
    resetDocumentScroll();
  }, [route]);
  let page;
  if (route === "/metrics") page = <Suspense fallback={null}><MetricsTrainer/></Suspense>;
  else if (route === "/") page = <TypographedPage><Home hypothesis/></TypographedPage>;
  else if (route === "/reference") page = <Suspense fallback={null}><ReferencePage/></Suspense>;
  else if (route === "/hypothesis-test") page = <TypographedPage><Home hypothesis/></TypographedPage>;
  else if (route === "/hypothesis-concepts") page = <TypographedPage><CasePage data={cases["/other-projects"]}/></TypographedPage>;
  else if (cases[route]) page = <TypographedPage><CasePage data={cases[route]}/></TypographedPage>;
  else if (route === "/cv") page = <TypographedPage><ResumePage/></TypographedPage>;
  else if (route === "/contact") page = <TypographedPage><ContactPage/></TypographedPage>;
  else page = <TypographedPage><Home hypothesis/></TypographedPage>;
  const mobileSwitchMode = route === "/" || route === "/hypothesis-test"
    ? "home"
    : (cases[route] || route === "/hypothesis-concepts" ? "project" : null);
  return <>{mobileSwitchMode && <MobileSwitch mode={mobileSwitchMode}/>}<div key={route} className={`route-view${isLeaving ? " route-view-leaving" : ""}`}>{page}</div></>;
}
