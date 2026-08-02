import { useEffect, useMemo, useState } from "react";
import {
  BarChart3, BookOpen, Brain, Check, ChevronRight, CircleHelp, Flame,
  Heart, Home, Lightbulb, Lock, RotateCcw, Sparkles, Star, Target, Trophy,
  X, Zap,
} from "lucide-react";

const LESSONS = [
  {
    id: "north-star",
    unit: 1,
    title: "North Star Metric",
    subtitle: "Как выбрать метрику ценности",
    icon: Star,
    xp: 20,
    questions: [
      {
        prompt: "Ты проектируешь сервис доставки еды. Какая метрика ближе всего к North Star?",
        options: ["Количество установок", "Заказы, доставленные вовремя", "CTR рекламного баннера", "Число пушей в неделю"],
        answer: 1,
        explanation: "NSM должна отражать ценность для клиента и устойчиво связываться с ростом бизнеса. Успешно доставленный заказ делает и то, и другое.",
      },
      {
        prompt: "Что обязательно должно быть у хорошей North Star Metric?",
        options: ["Она всегда равна выручке", "На неё влияет только маркетинг", "Она отражает полученную пользователем ценность", "Она меняется каждый спринт"],
        answer: 2,
        explanation: "North Star — не просто деньги или активность. Она измеряет момент, когда пользователь получает ключевую ценность продукта.",
      },
      {
        prompt: "Какую NSM логичнее выбрать для приложения изучения языков?",
        options: ["Минуты в приложении", "Завершённые полезные уроки", "Количество экранов", "Отправленные письма"],
        answer: 1,
        explanation: "Завершённые полезные уроки ближе к прогрессу пользователя. Время в продукте может расти даже из-за сложного интерфейса.",
      },
    ],
  },
  {
    id: "funnel",
    unit: 1,
    title: "Воронка AARRR",
    subtitle: "Где продукт теряет людей",
    icon: Target,
    xp: 25,
    questions: [
      {
        prompt: "Регистрация: 10 000 человек. Первый заказ сделали 2 500. Какая конверсия?",
        options: ["2,5%", "20%", "25%", "40%"],
        answer: 2,
        explanation: "Конверсия = 2 500 ÷ 10 000 × 100% = 25%.",
      },
      {
        prompt: "На каком этапе AARRR пользователь впервые получает ключевую ценность?",
        options: ["Acquisition", "Activation", "Referral", "Revenue"],
        answer: 1,
        explanation: "Activation — это aha-момент: пользователь совершил действие и впервые понял ценность продукта.",
      },
      {
        prompt: "После редизайна регистраций стало больше, но покупок столько же. Что проверить первым?",
        options: ["Цвет логотипа", "Конверсию Activation → Revenue", "Количество сотрудников", "Охваты соцсетей"],
        answer: 1,
        explanation: "Рост верхней части воронки не стал ценностью для бизнеса. Нужно найти провал между активацией и оплатой.",
      },
    ],
  },
  {
    id: "retention",
    unit: 2,
    title: "Retention",
    subtitle: "Почему пользователи возвращаются",
    icon: Flame,
    xp: 30,
    questions: [
      {
        prompt: "В когорте было 800 пользователей. На 7-й день вернулись 200. D7 Retention равен…",
        options: ["8%", "20%", "25%", "40%"],
        answer: 2,
        explanation: "D7 Retention = 200 ÷ 800 × 100% = 25%.",
      },
      {
        prompt: "Что означает выход retention-кривой на плато?",
        options: ["Продукт сломан", "Есть стабильное ядро пользователей", "Маркетинг отключён", "Выручка падает"],
        answer: 1,
        explanation: "Плато показывает долю пользователей, которые продолжают регулярно получать ценность от продукта.",
      },
      {
        prompt: "Для сервиса покупки авиабилетов низкий D7 retention — обязательно проблема?",
        options: ["Да, всегда", "Нет, важна естественная частота сценария", "Да, если MAU растёт", "Нет, retention не нужен"],
        answer: 1,
        explanation: "Метрику выбирают с учётом частоты потребности. Авиабилеты покупают редко, поэтому полезнее смотреть длинные периоды и повторные покупки.",
      },
    ],
  },
  {
    id: "unit-economics",
    unit: 3,
    title: "LTV и CAC",
    subtitle: "Сходится ли экономика",
    icon: BarChart3,
    xp: 35,
    questions: [
      {
        prompt: "CAC = 1 000 ₽, LTV = 3 500 ₽. Что можно сказать?",
        options: ["LTV:CAC = 0,3", "Экономика выглядит здоровой", "Каждый клиент убыточен", "Данных для отношения нет"],
        answer: 1,
        explanation: "LTV:CAC = 3,5. Часто ориентиром считают ≥3, но важно также проверить маржу и срок окупаемости.",
      },
      {
        prompt: "Как считается CAC?",
        options: ["Выручка ÷ MAU", "Расходы на привлечение ÷ новые клиенты", "LTV × Retention", "DAU ÷ WAU"],
        answer: 1,
        explanation: "CAC — стоимость привлечения платящего клиента: все релевантные расходы на привлечение делим на число новых клиентов.",
      },
      {
        prompt: "Как дизайнер может повлиять на LTV?",
        options: ["Только поменять логотип", "Улучшить активацию и удержание", "Увеличить рекламный бюджет", "Никак"],
        answer: 1,
        explanation: "Лучший onboarding, понятная ценность и регулярные полезные сценарии повышают retention, а вместе с ним и LTV.",
      },
    ],
  },
  {
    id: "experiments",
    unit: 4,
    title: "A/B-тесты",
    subtitle: "Доказываем эффект дизайна",
    icon: Sparkles,
    xp: 40,
    questions: [
      {
        prompt: "Конверсия выросла с 10% до 12%. Относительный uplift равен…",
        options: ["2%", "12%", "20%", "120%"],
        answer: 2,
        explanation: "Относительный uplift = (12% − 10%) ÷ 10% = 20%. В процентных пунктах рост равен 2 п.п.",
      },
      {
        prompt: "Какую guardrail-метрику взять для ускоренного checkout?",
        options: ["Цвет кнопки", "Ошибки и возвраты", "Количество дизайнеров", "Показы рекламы"],
        answer: 1,
        explanation: "Guardrail защищает от побочного вреда. Быстрый checkout не должен увеличивать ошибки, отмены и возвраты.",
      },
      {
        prompt: "p-value = 0,03 при пороге 0,05. Корректный вывод?",
        options: ["Вариант точно лучше навсегда", "Результат статистически значим при выбранном пороге", "Гипотеза доказана на 97%", "Тест надо немедленно остановить"],
        answer: 1,
        explanation: "Результат считается значимым при выбранном α, но ещё нужно проверить размер эффекта, длительность теста и качество эксперимента.",
      },
    ],
  },
];

const FORMULAS = [
  ["Conversion Rate", "Целевые действия ÷ посетители × 100%", "Показывает, какая доля дошла до нужного шага."],
  ["Retention N", "Вернувшиеся в период N ÷ пользователи когорты × 100%", "Всегда уточняй событие возврата и окно времени."],
  ["Churn Rate", "Ушедшие клиенты ÷ клиенты в начале периода × 100%", "Для подписки: сколько клиентов или выручки потеряли."],
  ["DAU / MAU", "Активные за день ÷ активные за месяц × 100%", "Приближённая оценка «липкости» продукта."],
  ["ARPU", "Выручка ÷ все пользователи", "Не путать с ARPPU — выручкой на платящего."],
  ["LTV", "Средний доход × маржа × время жизни", "Модель зависит от бизнеса; проговори допущения."],
  ["CAC", "Расходы на привлечение ÷ новые клиенты", "Сравнивай с LTV и учитывай payback period."],
  ["NPS", "% промоутеров − % критиков", "Отвечает про готовность рекомендовать, но не заменяет поведение."],
];

function Mascot({ mood = "happy" }) {
  return <div className={`metric-owl ${mood}`} aria-hidden="true">
    <span className="owl-ear left"/><span className="owl-ear right"/>
    <span className="owl-eye left"><i/></span><span className="owl-eye right"><i/></span>
    <span className="owl-beak"/>
  </div>;
}

function Quiz({ lesson, onExit, onComplete }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const question = lesson.questions[index];
  const isLast = index === lesson.questions.length - 1;
  const isRight = selected === question.answer;

  const next = () => {
    if (!checked) {
      setChecked(true);
      if (isRight) setCorrect(value => value + 1);
      return;
    }
    if (isLast) {
      onComplete(correct + (isRight ? 1 : 0));
      return;
    }
    setIndex(value => value + 1);
    setSelected(null);
    setChecked(false);
  };

  return <main className="metric-quiz-shell">
    <header className="quiz-topbar">
      <button type="button" onClick={onExit} aria-label="Закрыть урок"><X/></button>
      <div className="quiz-progress"><span style={{ width: `${((index + (checked ? 1 : 0)) / lesson.questions.length) * 100}%` }}/></div>
      <div className="quiz-heart"><Heart fill="currentColor"/> {3 - (index - correct)}</div>
    </header>
    <section className="quiz-card">
      <div className="quiz-title-row"><Mascot mood={checked ? (isRight ? "happy" : "thinking") : "happy"}/><div><span>Задание {index + 1} из {lesson.questions.length}</span><h1>{question.prompt}</h1></div></div>
      <div className="answer-grid">
        {question.options.map((option, optionIndex) => {
          const state = checked && optionIndex === question.answer ? " correct" : checked && optionIndex === selected ? " wrong" : selected === optionIndex ? " selected" : "";
          return <button type="button" className={`answer-option${state}`} key={option} onClick={() => !checked && setSelected(optionIndex)} disabled={checked}>
            <span>{optionIndex + 1}</span><b>{option}</b>{checked && optionIndex === question.answer && <Check/>}
          </button>;
        })}
      </div>
    </section>
    <footer className={`quiz-feedback ${checked ? (isRight ? "is-correct" : "is-wrong") : ""}`}>
      <div>{checked && <><span className="feedback-icon">{isRight ? <Check/> : <Lightbulb/>}</span><div><h2>{isRight ? "Отлично!" : "Запомни логику"}</h2><p>{question.explanation}</p></div></>}</div>
      <button type="button" onClick={next} disabled={selected === null}>{checked ? (isLast ? "Завершить" : "Дальше") : "Проверить"}</button>
    </footer>
  </main>;
}

function Result({ lesson, score, onClose, onRetry }) {
  const perfect = score === lesson.questions.length;
  return <main className="metric-result">
    <div className="result-burst"><Trophy/><i/><i/><i/></div>
    <p className="eyebrow">Урок завершён</p>
    <h1>{perfect ? "Без ошибок — мощно!" : "Отличная тренировка!"}</h1>
    <p>Теперь ты сможешь объяснить тему «{lesson.title}» на собеседовании, а не просто назвать формулу.</p>
    <div className="result-stats"><div><Zap/><b>+{lesson.xp} XP</b><span>опыт</span></div><div><Target/><b>{score}/{lesson.questions.length}</b><span>верно</span></div></div>
    <div className="result-actions"><button type="button" className="secondary" onClick={onRetry}><RotateCcw/> Ещё раз</button><button type="button" onClick={onClose}>На карту <ChevronRight/></button></div>
  </main>;
}

function LessonMap({ completed, onStart }) {
  return <div className="lesson-map">
    {[1,2,3,4].map(unit => {
      const unitLessons = LESSONS.filter(lesson => lesson.unit === unit);
      const titles = {
        1: ["База продуктового мышления", "Научись связывать дизайн с ценностью и ростом"],
        2: ["Удержание", "Разберись, почему люди возвращаются"],
        3: ["Деньги продукта", "Говори с бизнесом на одном языке"],
        4: ["Эксперименты", "Доказывай эффект решений данными"],
      };
      return <section className={`metric-unit unit-${unit}`} key={unit}>
        <header><div><span>Раздел {unit}</span><h2>{titles[unit][0]}</h2><p>{titles[unit][1]}</p></div><Trophy/></header>
        <div className="lesson-nodes">
          {unitLessons.map((lesson, lessonIndex) => {
            const globalIndex = LESSONS.findIndex(item => item.id === lesson.id);
            const unlocked = globalIndex === 0 || completed.includes(LESSONS[globalIndex - 1].id);
            const done = completed.includes(lesson.id);
            const Icon = lesson.icon;
            return <article className={`lesson-row ${lessonIndex % 2 ? "offset" : ""}`} key={lesson.id}>
              <button type="button" className={`lesson-node ${done ? "done" : ""}`} onClick={() => unlocked && onStart(lesson)} disabled={!unlocked} aria-label={`${lesson.title}${unlocked ? "" : ", закрыто"}`}>
                {unlocked ? <Icon/> : <Lock/>}
              </button>
              <div className="lesson-label"><span>{done ? "Пройдено" : unlocked ? `+${lesson.xp} XP` : "Сначала предыдущий урок"}</span><h3>{lesson.title}</h3><p>{lesson.subtitle}</p></div>
            </article>;
          })}
        </div>
      </section>;
    })}
  </div>;
}

export default function MetricsTrainer() {
  const [tab, setTab] = useState("learn");
  const [lesson, setLesson] = useState(null);
  const [result, setResult] = useState(null);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem("metriclingo-completed")) || []; } catch { return []; }
  });
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { localStorage.setItem("metriclingo-completed", JSON.stringify(completed)); }, [completed]);
  useEffect(() => { document.body.classList.add("metric-body"); return () => document.body.classList.remove("metric-body"); }, []);

  const xp = completed.reduce((sum, id) => sum + (LESSONS.find(item => item.id === id)?.xp || 0), 0);
  const progress = Math.round((completed.length / LESSONS.length) * 100);
  const nav = [["learn", Home, "Учиться"], ["formulas", BookOpen, "Формулы"], ["cards", Brain, "Карточки"]];
  const currentFormula = FORMULAS[cardIndex % FORMULAS.length];
  const completeLesson = score => {
    setResult({ lesson, score });
    if (!completed.includes(lesson.id)) setCompleted(items => [...items, lesson.id]);
    setLesson(null);
  };

  if (lesson) return <Quiz lesson={lesson} onExit={() => setLesson(null)} onComplete={completeLesson}/>;
  if (result) return <Result {...result} onClose={() => setResult(null)} onRetry={() => { setLesson(result.lesson); setResult(null); }}/>;

  return <div className="metrics-app">
    <aside className="metric-sidebar">
      <a className="metric-brand" href="/metrics" aria-label="Metriclingo, главная"><Mascot/><span>metriclingo</span></a>
      <nav>{nav.map(([id, Icon, label]) => <button type="button" className={tab === id ? "active" : ""} key={id} onClick={() => setTab(id)}><Icon/><span>{label}</span></button>)}</nav>
      <div className="sidebar-card"><Mascot mood="thinking"/><div><b>Совет для собеса</b><p>Всегда связывай метрику с поведением пользователя и целью бизнеса.</p></div></div>
      <a className="portfolio-back" href="/portfolio">Портфолио Вики <ChevronRight/></a>
    </aside>

    <div className="metric-main">
      <header className="metric-topbar">
        <div className="mobile-logo"><Mascot/><b>metriclingo</b></div>
        <div className="top-stats"><span><Flame/> 7</span><span><Zap/> {xp}</span><span><Heart fill="currentColor"/> 5</span></div>
      </header>

      <div className="metric-content">
        {tab === "learn" && <>
          <div className="learning-header"><div><p className="eyebrow">Твой курс</p><h1>Метрики для продуктового собеса</h1><p>Пройди короткие уроки и научись объяснять решения через данные.</p></div><div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` }}><span><b>{progress}%</b><small>курса</small></span></div></div>
          <LessonMap completed={completed} onStart={setLesson}/>
        </>}
        {tab === "formulas" && <section className="formula-page"><p className="eyebrow">Шпаргалка</p><h1>8 формул, которые стоит знать</h1><p className="page-lead">На собеседовании важнее логика, чем заученная запись. Проговаривай знаменатель, период и ограничения.</p><div className="formula-grid">{FORMULAS.map(([name, formula, note], index) => <article key={name}><span>0{index + 1}</span><h2>{name}</h2><code>{formula}</code><p>{note}</p></article>)}</div></section>}
        {tab === "cards" && <section className="cards-page"><p className="eyebrow">Быстрое повторение</p><h1>Карточки метрик</h1><p className="page-lead">Попробуй ответить вслух, затем переверни карточку.</p><button className={`flashcard ${flipped ? "flipped" : ""}`} type="button" onClick={() => setFlipped(value => !value)}>
          <span className="flashcard-front"><CircleHelp/><small>Что означает</small><strong>{currentFormula[0]}?</strong><em>Нажми, чтобы проверить себя</em></span>
          <span className="flashcard-back"><Check/><small>Ответ</small><strong>{currentFormula[1]}</strong><em>{currentFormula[2]}</em></span>
        </button><div className="card-controls"><button type="button" onClick={() => { setCardIndex((cardIndex - 1 + FORMULAS.length) % FORMULAS.length); setFlipped(false); }}>Назад</button><span>{cardIndex + 1} / {FORMULAS.length}</span><button type="button" onClick={() => { setCardIndex((cardIndex + 1) % FORMULAS.length); setFlipped(false); }}>Дальше</button></div></section>}
      </div>
    </div>

    <aside className="metric-rightbar">
      <section className="streak-card"><div><span>Текущая серия</span><b>7 дней</b></div><Flame fill="currentColor"/><div className="week-row">{["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((day, i) => <span className={i < 5 ? "done" : i === 5 ? "today" : ""} key={day}><i>{i < 5 ? <Check/> : day.slice(0,1)}</i><small>{day}</small></span>)}</div></section>
      <section className="daily-card"><header><span>Цель на сегодня</span><b>{Math.min(xp % 50, 50)} / 50 XP</b></header><div><i style={{ width: `${Math.min((xp % 50) * 2, 100)}%` }}/></div><p><Zap/> Ещё один урок — и ты ближе к офферу.</p></section>
      <section className="interview-card"><span><Brain/></span><div><b>Фраза, которая спасёт</b><p>«Сначала уточню цель продукта и сегмент, затем выберу метрику успеха и guardrails».</p></div></section>
    </aside>

    <nav className="metric-mobile-nav">{nav.map(([id, Icon, label]) => <button type="button" className={tab === id ? "active" : ""} key={id} onClick={() => setTab(id)}><Icon/><span>{label}</span></button>)}</nav>
  </div>;
}
