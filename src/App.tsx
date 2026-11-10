import { useEffect, useRef, useState, type CSSProperties } from "react";

const img = (name: string) => `/images/${name}.jpg`;
const d = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

/* Inhalte */

type HeroKey = "ja" | "bauch" | "nie";
const heroAnswers: { key: HeroKey; label: string; reply: string }[] = [
  { key: "ja", label: "Ja, locker", reply: "Stark. Dann geht es bei dir ums Wachsen. Schau, wo noch mehr drin ist." },
  { key: "bauch", label: "Mit Bauchweh", reply: "Kenn ich. So ging es mir auch lange. Lass uns schauen, woran es hängt." },
  { key: "nie", label: "Niemals", reply: "Dann bist du hier richtig. Das lässt sich ändern. Ich zeig dir wie." },
];

type Moment = { time: string; text: string; load: number };
const today: Moment[] = [
  { time: "7:45", text: "Du sperrst auf. Der Kaffee wird kalt.", load: 2 },
  { time: "8:10", text: "Die erste Frage aus dem Team. Wie rechne ich das ab?", load: 3 },
  { time: "10:30", text: "Zwischen zwei Kundinnen schnell WhatsApp.", load: 4 },
  { time: "12:00", text: "Mittagspause? Heute nicht.", load: 5 },
  { time: "15:00", text: "Eine Kundin fragt nach dem Preis. Du rundest ab. Wieder.", load: 6 },
  { time: "18:30", text: "Kassa. Der Tag war voll. Die Zahl ist es nicht.", load: 7 },
  { time: "21:00", text: "Auf der Couch. Social Media. Dienstplan im Kopf.", load: 8 },
  { time: "So", text: "Sonntag. Ablage.", load: 8 },
];
const withSystem: Moment[] = [
  { time: "7:45", text: "Dein Team sperrt auf. Die Checkliste liegt bereit.", load: 1 },
  { time: "8:10", text: "Abrechnen? Steht im Ablauf. Niemand fragt dich.", load: 1 },
  { time: "10:30", text: "Du arbeitest an deinem Salon. Nicht nur darin.", load: 2 },
  { time: "12:00", text: "Mittagspause. Wirklich.", load: 1 },
  { time: "15:00", text: "Eine Kundin fragt nach dem Preis. Deine Kollegin sagt ihn sicher.", load: 2 },
  { time: "18:30", text: "Kassa. Der Tag war voll. Die Zahl auch.", load: 2 },
  { time: "21:00", text: "Auf der Couch. Einfach nur Couch.", load: 1 },
  { time: "So", text: "Sonntag. Frei.", load: 0 },
];
const loadLabels = ["frei", "ruhig", "okay", "okay", "voll", "voll", "zu voll", "zu voll", "am Limit"];

// Themen aus Elisabeths Moodboard. Bitte mit Elisabeth bestätigen.
const workbooks = [
  { no: "01", title: "Positionierung", text: "Deine Marke. Deine Expertise. Deine Werte. Dein Salon.", img: "m1" },
  { no: "02", title: "Wunschkundin", text: "Für wen du da bist. Und für wen nicht.", img: "m2" },
  { no: "03", title: "Angebot", text: "Leistungen, Pakete und deine Signature Services.", img: "m3" },
  { no: "04", title: "Preise", text: "Eine Methode für Preise, hinter denen du stehst.", img: "m4" },
  { no: "05", title: "Beratung", text: "Ein Gespräch, das führt. Sicher bis zum Abschluss.", img: "m5" },
  { no: "06", title: "Buchung", text: "Onlinebuchung und Kundenbindung, die von selbst läuft.", img: "m6" },
  { no: "07", title: "Digitale Präsenz", text: "Instagram, Content und Website mit Plan.", img: "m7" },
  { no: "08", title: "Salonsteuerung", text: "Kennzahlen, Team und Abläufe. Damit es ohne dich läuft.", img: "m8" },
];

const checkAnswers = [
  { key: "a", label: "Auf den Cent", reply: "Sehr gut. Dann kannst du deine Preise auch sicher erhöhen." },
  { key: "b", label: "Grob", reply: "Grob reicht oft nicht. Mit einer klaren Methode weißt du es genau." },
  { key: "c", label: "Keine Ahnung", reply: "Damit bist du nicht allein. Genau hier fangen viele an." },
];

const heroCols = [
  ["hero", "wbcover", "p2"],
  ["present", "p3", "stack"],
  ["walk", "jacket", "m1"],
  ["p4", "coach", "notebook"],
  ["window", "p1", "knowledge"],
];

/* Motion: Reveals, Parallax und die Workbook Schiene */

function useMotion(pinRef: React.RefObject<HTMLElement>, railRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.18 }
    );
    document.querySelectorAll(".rv, .sig, .words, .finale").forEach((el) => io.observe(el));
    if (reduced) return () => io.disconnect();

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-para]").forEach((el) => {
        const box = el.parentElement!.getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) return;
        const p = (box.top + box.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(-p * 8 - 7).toFixed(2)}%, 0)`;
      });
      const pin = pinRef.current;
      const rail = railRef.current;
      if (pin && rail) {
        const r = pin.getBoundingClientRect();
        const total = r.height - vh;
        const prog = Math.min(1, Math.max(0, -r.top / total));
        const dist = Math.max(0, rail.scrollWidth - window.innerWidth);
        rail.style.transform = `translate3d(${(-prog * dist).toFixed(1)}px, 0, 0)`;
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pinRef, railRef]);
}

/* Seite */

export default function App() {
  const [hero, setHero] = useState<HeroKey | null>(null);
  const [mode, setMode] = useState<"today" | "system">("today");
  const [day, setDay] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const pinRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  useMotion(pinRef, railRef);

  const m = (mode === "today" ? today : withSystem)[day];
  const heroReply = heroAnswers.find((a) => a.key === hero)?.reply;
  const checkReply = checkAnswers.find((a) => a.key === answer)?.reply;

  return (
    <>
      <header className="header">
        <div className="wrap">
          <a href="#start" className="logo" aria-label="Salon Success Academy by Elisabeth Prutti">
            <span className="serif">Salon Success Academy</span>
            <span className="script">by Elisabeth Prutti</span>
          </a>
          <nav className="nav eyebrow" aria-label="Hauptmenü">
            <a className="link" href="#workbooks">Workbooks</a>
            <a className="link" href="#elisabeth">Elisabeth</a>
            <a className="link" href="#check">Saloncheck</a>
            <a href="#finale" className="btn ghost small"><span>Gespräch</span></a>
          </nav>
        </div>
      </header>

      <main>
        {/* 1 Hero */}
        <section className="hero" id="start">
          <div className="cols" aria-hidden="true">
            {heroCols.map((col, i) => (
              <div key={i} className={i % 2 ? "col down" : "col"}>
                {[...col, ...col].map((name, j) => <img key={j} src={img(name)} alt="" />)}
              </div>
            ))}
          </div>
          <div className="hero-veil" aria-hidden="true" />
          <div className="wrap hero-box">
            <p className="eyebrow muted fade" style={{ ...d(0.2), marginBottom: 40 }}>Salon Success Academy &nbsp;/&nbsp; für Inhaberinnen</p>
            <h1>
              <span className="mask"><span style={d(0.3)}>Könntest du</span></span>
              <span className="mask"><span style={d(0.45)}>morgen zwei</span></span>
              <span className="mask"><span style={d(0.6)}>Wochen weg?</span></span>
            </h1>
            <p className="script hero-script draw" style={d(1.2)}>Ohne Handy.</p>

            {!hero ? (
              <div className="answers fade" style={d(1.6)}>
                {heroAnswers.map((a) => (
                  <button key={a.key} type="button" className="btn" onClick={() => setHero(a.key)}><span>{a.label}</span></button>
                ))}
              </div>
            ) : (
              <div className="reply swap">
                <img src={img("p1")} alt="Elisabeth Prutti" />
                <div>
                  <p className="serif">{heroReply}</p>
                  <p className="row eyebrow">
                    <a href="#check">Weiter zum Check</a>
                    <button type="button" className="textbtn" onClick={() => setHero(null)}>Andere Antwort</button>
                  </p>
                </div>
              </div>
            )}

            <div className="cue-box fade" style={d(2)}>
              <span className="eyebrow muted">Scroll</span>
              <div className="cue" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* 2 Laufband */}
        <section className="band" aria-label="Mehr Klarheit. Mehr Freiheit. Mehr Salon.">
          <div className="mq big" aria-hidden="true">
            {[0, 1].map((k) => (
              <span key={k}>Mehr Klarheit <span className="outline">Mehr Freiheit</span> Mehr Salon <span className="outline">Mehr Klarheit</span> Mehr Freiheit <span className="outline">Mehr Salon</span></span>
            ))}
          </div>
          <div className="mq rev small" aria-hidden="true">
            {[0, 1].map((k) => (
              <span key={k}>Wissen &nbsp;&nbsp; Strategie &nbsp;&nbsp; Salons &nbsp;&nbsp; Zukunft &nbsp;&nbsp; People &nbsp;&nbsp; Style &nbsp;&nbsp; Expertise &nbsp;&nbsp; Confidence &nbsp;&nbsp; Wissen &nbsp;&nbsp; Strategie &nbsp;&nbsp; Salons &nbsp;&nbsp; Zukunft</span>
            ))}
          </div>
        </section>

        {/* 3 Dein Tag */}
        <section className="wrap sec day">
          <div className="tile day-pic rv">
            <img data-para src={img("mug")} alt="Elisabeth mit Kaffeetasse in einer ruhigen Minute" />
          </div>
          <div className="day-text">
            <p className="eyebrow muted rv" style={{ marginBottom: 20 }}>Dein Alltag</p>
            <h2 className="h2 rv">Zieh durch deinen Tag.</h2>
            <div className="day-ui rv">
              <div className="day-top">
                <div className="toggle" role="group" aria-label="Ansicht wählen">
                  <button type="button" aria-pressed={mode === "today"} className={mode === "today" ? "btn small" : "btn ghost small"} onClick={() => setMode("today")}><span>Heute</span></button>
                  <button type="button" aria-pressed={mode === "system"} className={mode === "system" ? "btn small" : "btn ghost small"} onClick={() => setMode("system")}><span>Mit System</span></button>
                </div>
                <span className="eyebrow muted">Kopf &nbsp; {loadLabels[m.load]}</span>
              </div>
              <div className="meter" aria-hidden="true">
                {Array.from({ length: 8 }, (_, i) => <div key={i} className={i < m.load ? "seg on" : "seg"} />)}
              </div>
              <div className="moment swap" key={mode + day} aria-live="polite">
                <div className="time">{m.time}</div>
                <p>{m.text}</p>
              </div>
              <label className="range-label eyebrow muted">
                Uhrzeit ziehen
                <input className="range" type="range" min={0} max={7} step={1} value={day} onChange={(e) => setDay(Number(e.target.value))} />
              </label>
            </div>
          </div>
        </section>

        {/* 4 Statement */}
        <section className="statement">
          <div className="wrap sec" style={{ maxWidth: 1200 }}>
            <p className="big words">
              {["Das", "liegt", "nicht", "an", "dir."].map((w, i) => (
                <span key={w}><span className="word" style={{ transitionDelay: `${i * 0.18}s` }}>{w}</span>{" "}</span>
              ))}
            </p>
            <p className="script sig">Es fehlt ein System.</p>
            <p className="eyebrow rv" style={{ marginTop: 48 }}>Klar &nbsp;/&nbsp; Strukturiert &nbsp;/&nbsp; Praxisnah &nbsp;/&nbsp; Umsetzbar</p>
          </div>
        </section>

        {/* 5 Workbooks Schiene */}
        <section id="workbooks" className="pin" ref={pinRef}>
          <div className="pin-sticky">
            <div className="wrap pin-head">
              <div>
                <p className="eyebrow muted" style={{ marginBottom: 16 }}>Dein Weg in Workbooks</p>
                <h2 className="h2">Ein Thema nach dem anderen.</h2>
              </div>
              <p className="script">Workbooks that create Results.</p>
            </div>
            <div className="rail-scroll">
              <div className="rail" ref={railRef}>
                {workbooks.map((w) => (
                  <article key={w.no} className="card">
                    <img src={img(w.img)} alt={`Workbook ${w.no} ${w.title}`} loading="lazy" />
                    <div className="body">
                      <p className="eyebrow" style={{ color: "var(--muted-dark)" }}>Workbook {w.no}</p>
                      <h3>{w.title}</h3>
                      <p>{w.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6 Elisabeth */}
        <section id="elisabeth" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="wrap sec lisa">
            <div className="tile lisa-pic rv">
              <img data-para src={img("walk")} alt="Elisabeth Prutti geht im Business Outfit durch einen hellen Gang" />
            </div>
            <div className="lisa-text">
              <p className="eyebrow muted rv" style={{ marginBottom: 20 }}>Im Gespräch mit Elisabeth</p>
              <h2 className="rv">Ich war genau da, wo du jetzt bist.</h2>
              <div className="story">
                <div className="rv"><p className="eyebrow">Früher</p><p>Ich stand fast jede Stunde am Stuhl. Alles lief über mich. Jede Frage. Jede Entscheidung.</p></div>
                <div className="rv"><p className="eyebrow">Heute</p><p>Ich habe meinen Salon neu gebaut. Schritt für Schritt. Mein Team entscheidet selbst.</p></div>
                <div className="rv"><p className="eyebrow">Für dich</p><p>Du musst nicht alles allein tragen. Du brauchst ein System. Das zeige ich dir.</p></div>
              </div>
              <p className="script sig lisa-sig">Elisabeth</p>
              <div className="trio">
                <div className="tile rv"><img src={img("p2")} alt="Elisabeth lacht" loading="lazy" /></div>
                <div className="tile rv"><img src={img("window")} alt="Elisabeth blickt aus dem Fenster" loading="lazy" /></div>
                <div className="tile rv"><img src={img("write")} alt="Elisabeth schreibt Notizen" loading="lazy" /></div>
              </div>
              {/* Platzhalter: Zahlen mit Elisabeth bestätigen */}
              <div className="facts">
                <div><div className="serif">2005</div><div className="eyebrow">eigener Salon</div></div>
                <div><div className="serif">2025</div><div className="eyebrow">Beliebtester Salon Steiermark</div></div>
                <div><div className="serif">[x]</div><div className="eyebrow">Salons begleitet</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* 7 Bento */}
        <section className="light">
          <div className="wrap sec">
            <div className="bento-head">
              <h2 className="h2 rv" style={{ maxWidth: 760 }}>Du gehst den Weg nicht allein.</h2>
              <p className="eyebrow rv" style={{ color: "var(--muted-dark)" }}>Fahr über die Bilder</p>
            </div>
            <div className="bento">
              <div className="tile rv w2 h2r" tabIndex={0}>
                <img src={img("coach")} alt="Elisabeth im persönlichen Gespräch" loading="lazy" />
                <div className="cap"><p className="eyebrow muted">01</p><h3 style={{ fontSize: 34 }}>Persönlich 1:1</h3><p className="more">In regelmäßigen Terminen arbeiten wir an deinem Salon. Mit deinen Zahlen. Mit deinen Fragen.</p></div>
              </div>
              <div className="tile rv w2" tabIndex={0}>
                <img src={img("present")} alt="Elisabeth präsentiert vor einer Gruppe" loading="lazy" />
                <div className="cap"><p className="eyebrow muted">02</p><h3>Lernen, wann es passt</h3><p className="more">Kurze Videos zu jedem Schritt. Am Abend. In der Pause. Am Wochenende.</p></div>
              </div>
              <div className="tile rv" tabIndex={0}>
                <img src={img("notebook")} alt="Notizbuch mit den Worten Ideas, Strategy, Salons, People" loading="lazy" />
                <div className="cap"><p className="eyebrow muted">03</p><h3>Workbooks</h3><p className="more">Frage für Frage zum fertigen Ergebnis.</p></div>
              </div>
              <div className="tile rv" tabIndex={0}>
                <img src={img("binders")} alt="Ordner zu Positionierung, Angebot, Preise und mehr" loading="lazy" />
                <div className="cap"><p className="eyebrow muted">04</p><h3>Werkzeuge</h3><p className="more">Vorlagen, Checklisten, Rechner. Am nächsten Tag im Einsatz.</p></div>
              </div>
              <div className="tile rv w2" tabIndex={0}>
                <img src={img("jacket")} alt="Jacke mit Aufschrift Stronger Salons, Brighter Futures" loading="lazy" />
                <div className="cap"><p className="eyebrow muted">05</p><h3>Und zwischendurch</h3><p className="more">Schreib mir einfach auf WhatsApp.</p></div>
              </div>
              <div className="rv w2 dark">
                <p className="script">Begleitung</p>
                <p>Probier ein Werkzeug aus der Academy.</p>
                <a href="https://preiserhoehung.salon" className="btn"><span>Preiserhöhung planen</span></a>
              </div>
            </div>
          </div>
        </section>

        {/* 8 Saloncheck */}
        <section id="check" className="check">
          <img data-para className="check-bg" src={img("hero")} alt="" aria-hidden="true" />
          <div className="check-veil" aria-hidden="true" />
          <div className="wrap check-inner">
            <div>
              <p className="eyebrow muted rv" style={{ marginBottom: 20 }}>Saloncheck &nbsp;/&nbsp; 3 Minuten</p>
              <h2 className="h2 rv">Wie sehr hängt dein Salon an dir?</h2>
              <p className="rv" style={{ marginTop: 28, fontSize: 19, lineHeight: 1.7, maxWidth: 460 }}>15 ehrliche Fragen. Du siehst sofort, wo du stehst. Ohne E-Mail.</p>
            </div>
            <div className="check-card rv">
              <p className="eyebrow muted">Frage 2 von 15</p>
              <p className="q">Weißt du, was dich eine Minute im Salon kostet?</p>
              {!answer ? (
                <div className="stack">
                  {checkAnswers.map((a) => (
                    <button key={a.key} type="button" className="btn left" onClick={() => setAnswer(a.key)}><span>{a.label}</span></button>
                  ))}
                </div>
              ) : (
                <div className="swap">
                  <p className="serif" style={{ fontSize: 24, lineHeight: 1.4 }}>{checkReply}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
                    <a href="#check" className="btn"><span>Weiter</span></a>
                    <button type="button" className="btn ghost" onClick={() => setAnswer(null)}><span>Zurück</span></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 9 Stimmen */}
        <section className="voice">
          <div className="wrap sec">
            <p className="quote rv">Qualität ist kein Zufall. Qualität ist ein System.</p>
            <div className="who rv">
              <p className="eyebrow">Selma</p>
              <p style={{ marginTop: 10 }}>Intercoiffure Unistyle, Klagenfurt. Früher 40 bis 50 Stunden die Woche am Stuhl.</p>
              <p className="sep">„Endlich ist alles klar und strukturiert.“<br /><span className="eyebrow" style={{ fontSize: 11 }}>Gudrun, Neuenstein</span></p>
            </div>
          </div>
        </section>

        {/* 10 Finale */}
        <section id="finale" className="finale">
          <div className="finale-grid" aria-hidden="true">
            <img src={img("window")} alt="" loading="lazy" />
            <img src={img("wbcover")} alt="" loading="lazy" />
            <img src={img("knowledge")} alt="" loading="lazy" />
          </div>
          <div className="finale-veil" aria-hidden="true" />
          <div className="finale-box">
            <p className="big rv">Stell dir vor, du bist zwei Wochen weg.</p>
            <p className="script sig">Und alles läuft.</p>
            <div className="ctas rv">
              <a href="#check" className="btn"><span>Saloncheck starten</span></a>
              <a href="#finale" className="btn ghost"><span>Gespräch mit Elisabeth</span></a>
              <a href="#finale" className="btn ghost"><span>Platz in der Academy</span></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <a href="#start" className="logo" aria-label="Salon Success Academy by Elisabeth Prutti">
            <span className="serif">Salon Success Academy</span>
            <span className="script">by Elisabeth Prutti</span>
          </a>
          <p className="eyebrow muted">Judenburg</p>
          <nav className="eyebrow" aria-label="Rechtliches">
            <a href="#impressum">Impressum</a>
            <a href="#datenschutz">Datenschutz</a>
            <a href="#agb">AGB</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
