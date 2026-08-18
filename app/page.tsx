"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const questions = [
  { q: "What time does Laura wake up?", options: ["At 6 a.m.", "At 7 a.m.", "At 8 a.m.", "At 9 a.m."], answer: 1 },
  { q: "What does Laura sometimes drink in the morning?", options: ["Coffee", "Soda", "Juice", "Tea"], answer: 0 },
  { q: "What does Laura do before she starts working?", options: ["She buys some food.", "She watches some videos.", "She talks to her coworkers and organizes some documents.", "She goes to the supermarket."], answer: 2 },
  { q: "What does Laura do when there is no food in her refrigerator?", options: ["She doesn’t eat lunch.", "She buys something at a restaurant.", "She asks a coworker for food.", "She goes directly home."], answer: 1 },
  { q: "Why does Laura prefer quiet time after 10 p.m.?", options: ["Because she starts working.", "Because she talks to her coworkers.", "Because she goes to the supermarket.", "Because she wants no messages, work or problems."], answer: 3 },
];

const fullText = `My name is Laura, and my routine is usually very busy. I wake up at 7 a.m. and eat some fruit for breakfast. Sometimes, I drink some coffee, but I never drink any soda in the morning.

I work in a small office. There is always someone in the kitchen when I arrive. I usually talk to my coworkers and organize some documents before I start working.

At lunchtime, I usually bring something from home. When there is no food in my refrigerator, I buy something at a restaurant near the office.

After work, I sometimes go to the supermarket. If I don’t need anything, I go directly home. At night, I have no energy for difficult activities, so I watch some videos or read a book.

I don’t usually talk to anyone after 10 p.m. That is my quiet time: no messages, no work and no problems!`;

function V({ children, pt }: { children: React.ReactNode; pt: string }) {
  return <button type="button" className="vocab" onClick={() => window.dispatchEvent(new CustomEvent("translate-word", { detail: { en: String(children), pt } }))}>{children}</button>;
}

function Confetti() {
  const colors = ["#f59d55", "#a98cff", "#ffffff", "#67d9c0", "#f5d36f"];
  return <div className="confetti" aria-hidden="true">{Array.from({ length: 70 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length], animationDelay: `${(i % 15) * .05}s`, animationDuration: `${2.2 + (i % 7) * .18}s` }} />)}</div>;
}

export default function Home() {
  const [word, setWord] = useState({ en: "Click a highlighted word", pt: "A tradução aparecerá aqui." });
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<number[]>(Array(5).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [paused, setPaused] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: Event) => setWord((e as CustomEvent).detail);
    window.addEventListener("translate-word", handler);
    return () => { window.removeEventListener("translate-word", handler); window.speechSynthesis?.cancel(); };
  }, []);

  const startFresh = () => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = "en-US"; utterance.rate = .9; utterance.onend = () => setPaused(false);
    window.speechSynthesis.speak(utterance);
  };
  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    if (paused) { window.speechSynthesis.resume(); setPaused(false); return; }
    if (!window.speechSynthesis.speaking) startFresh();
  };
  const pause = () => { window.speechSynthesis?.pause(); setPaused(true); };
  const restart = () => { window.speechSynthesis?.cancel(); setPaused(false); setTimeout(startFresh, 80); };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = nameRef.current?.value.trim() || "";
    if (!name) { setError("Please enter the student’s name."); nameRef.current?.focus(); return; }
    if (answers.some(a => a < 0)) { setError("Please answer all five questions before submitting."); return; }
    setError("");
    const total = answers.reduce((n, a, i) => n + (a === questions[i].answer ? 1 : 0), 0);
    setScore(total); setSubmitted(true); setSending(true);
    const data = new FormData();
    data.append("access_key", "1027624e-f586-43ab-bb7e-22c0f93222a0");
    data.append("subject", `My Daily Routine — ${name} — ${total}/5`);
    data.append("from_name", "YV English Reading Practice");
    data.append("student_name", name); data.append("score", `${total}/5`);
    questions.forEach((q, i) => data.append(`question_${i + 1}`, `${q.options[answers[i]]} — ${answers[i] === q.answer ? "CORRECT" : "INCORRECT"}`));
    try { await fetch("https://api.web3forms.com/submit", { method: "POST", body: data }); } catch { /* local result still works */ }
    setSending(false);
    setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  return <main className="page">
    <header className="hero glass"><img className="logo" src="/yv-logo.png" alt="YV English — From understanding to speaking" /><div><p className="eyebrow">YV English · Reading Practice</p><h1>My Daily <em>Routine</em></h1><p className="intro">Read, listen and discover. Click the highlighted words to see their meaning in Portuguese.</p></div></header>
    <section className="glass reading-card">
      <div className="translation-display" aria-live="polite"><span>{word.en}</span><strong>{word.pt}</strong></div>
      <div className="section-head"><div><p className="eyebrow">Read & listen</p><h2>The text</h2></div><div className="audio-controls"><button type="button" onClick={speak}>▶ <span>Start</span></button><button type="button" onClick={pause}>Ⅱ <span>Pause</span></button><button type="button" onClick={restart}>↻ <span>Restart</span></button></div></div>
      <article className="reading">
        <p>My name is Laura, and my routine is <V pt="geralmente / usualmente">usually</V> very busy. I <V pt="acordo">wake up</V> at 7 a.m. and <V pt="como / comer">eat</V> <V pt="algumas">some</V> fruit for breakfast. <V pt="de vez em quando / às vezes">Sometimes</V>, I drink <V pt="um pouco de">some</V> coffee, but I <V pt="nunca">never</V> drink <V pt="nenhum / nenhuma">any</V> soda in the morning.</p>
        <p>I work in a <V pt="pequeno">small</V> <V pt="escritório">office</V>. <V pt="há / existe">There is</V> <V pt="sempre">always</V> <V pt="alguém">someone</V> in the <V pt="cozinha">kitchen</V> <V pt="quando">when</V> I <V pt="chego">arrive</V>. I usually <V pt="converso / conversar">talk</V> to my <V pt="colegas de trabalho">coworkers</V> and organize <V pt="alguns">some</V> documents <V pt="antes">before</V> I start working.</p>
        <p>At <V pt="hora do almoço">lunchtime</V>, I usually <V pt="trago / trazer">bring</V> <V pt="alguma coisa">something</V> from home. When there is <V pt="nenhuma comida">no food</V> in my <V pt="geladeira">refrigerator</V>, I <V pt="compro / comprar">buy</V> something at a restaurant <V pt="perto">near</V> the office.</p>
        <p><V pt="depois do trabalho">After work</V>, I sometimes <V pt="vou / ir">go</V> to the supermarket. If I don’t <V pt="preciso / precisar">need</V> <V pt="nada / qualquer coisa">anything</V>, I go <V pt="diretamente">directly</V> home. At night, I <V pt="tenho / ter">have</V> <V pt="nenhuma energia">no energy</V> for difficult activities, <V pt="então">so</V> I <V pt="assisto / assistir">watch</V> <V pt="alguns vídeos">some videos</V> <V pt="ou">or</V> <V pt="leio / ler">read</V> a book.</p>
        <p>I don’t usually talk to <V pt="ninguém / alguém">anyone</V> after 10 p.m. That is my <V pt="tranquilo / de tranquilidade">quiet</V> time: <V pt="nenhuma mensagem">no messages</V>, <V pt="nenhum trabalho">no work</V> and <V pt="nenhum problema">no problems</V>!</p>
      </article>
      <button type="button" className="translate-btn" onClick={() => setShowTranslation(v => !v)}>{showTranslation ? "Hide translation" : "Translate text"}</button>
      {showTranslation && <article className="full-translation"><p>Meu nome é Laura, e minha rotina geralmente é muito agitada. Eu acordo às 7h e como algumas frutas no café da manhã. Às vezes, bebo um pouco de café, mas nunca bebo refrigerante de manhã.</p><p>Eu trabalho em um escritório pequeno. Sempre há alguém na cozinha quando chego. Geralmente converso com meus colegas de trabalho e organizo alguns documentos antes de começar a trabalhar.</p><p>Na hora do almoço, geralmente levo alguma coisa de casa. Quando não há comida na minha geladeira, compro alguma coisa em um restaurante perto do escritório.</p><p>Depois do trabalho, às vezes vou ao supermercado. Se não preciso de nada, vou direto para casa. À noite, não tenho energia para atividades difíceis, então assisto a alguns vídeos ou leio um livro.</p><p>Geralmente não converso com ninguém depois das 22h. Esse é o meu momento de tranquilidade: sem mensagens, sem trabalho e sem problemas!</p></article>}
    </section>
    <form className="glass quiz" onSubmit={submit}>
      <div className="section-head"><div><p className="eyebrow">Comprehension</p><h2>Check your reading</h2></div><span className="count">05 questions</span></div>
      <label className="name-label" htmlFor="studentName">Student’s name</label><input ref={nameRef} id="studentName" name="student_name" placeholder="Type your full name" autoComplete="name" required />
      <div className="questions">{questions.map((q, i) => <fieldset key={q.q} className={`question ${submitted ? answers[i] === q.answer ? "correct" : "wrong" : ""}`}><legend><span>{String(i + 1).padStart(2, "0")}</span>{q.q}<b className="mark" aria-label={submitted ? answers[i] === q.answer ? "Correct" : "Incorrect" : undefined}>{submitted ? answers[i] === q.answer ? "✓" : "✕" : ""}</b></legend>{q.options.map((option, j) => <label key={option} className={`${submitted && j === q.answer ? "right-answer" : ""}`}><input type="radio" name={`q${i}`} checked={answers[i] === j} onChange={() => { if (!submitted) setAnswers(a => a.map((v, x) => x === i ? j : v)); }} /><span>{String.fromCharCode(65 + j)}</span>{option}</label>)}</fieldset>)}</div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="submit-btn" type="submit">Submit answers <span>→</span></button>
      {submitted && <section id="result" className="result" aria-live="polite"><Confetti /><p className="eyebrow">Your result · {score}/5</p><h2>Congratulations!</h2><p>{score === 5 ? "Perfect score — you understood every detail!" : `You got ${score} out of 5. Review the marked answers and keep going!`}</p><small>{sending ? "Sending your result…" : "Your result has been submitted."}</small></section>}
    </form>
    <footer><img src="/yv-logo.png" alt="YV English" /><p>From understanding to speaking.</p></footer>
  </main>;
}
