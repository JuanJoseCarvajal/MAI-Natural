"use client";
import { SiteText, useEditorialData } from "@/components/common/SiteText";


import { openWompiCheckout } from "@/lib/wompi-client";
import WompiPaymentButton from "@/components/features/payments/WompiPaymentButton";
import PaymentRedirectOverlay from "@/components/features/payments/PaymentRedirectOverlay";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getDayAvailability, requestConsultation } from "@/app/(public)/services/actions";
import { colombiaDate, consultationIntentions as originalIntentions, consultationTopics as originalTopics, initialConsultation } from "@/lib/consultation";
import { consultationContactSchema } from "@/lib/validators/consultation";
import { trackEvent } from "@/lib/analytics";
import styles from "./consultation.module.css";

type FormValues = { topic: string; intention: string; notes: string; date: string; time: string; name: string; email: string; phone: string; continuityInterest: boolean; consent: boolean };
const original_stepNames = ["Tu motivo", "Tu intención", "Tu momento", "Tu contacto", "Tu encuentro"];
const original_titles = ["¿Qué te trae hasta aquí?", "¿Qué te gustaría llevarte?", "Hagamos espacio para conversar.", "¿Cómo podemos encontrarte?", "Este es tu punto de partida."];
const original_descriptions = ["No necesitas tenerlo todo claro. Elige lo que más se acerque a tu momento.", "No tienes que resolverlo ahora. Solo darle una dirección a nuestra conversación.", "Elige una fecha y un horario para solicitar tu encuentro. Hora de Colombia (UTC−5).", "Solo lo necesario para coordinar tu encuentro con Melina.", "Revisa tus respuestas. Puedes cambiarlas antes de enviar tu solicitud."];

function dateLabel(date: string) {
  return date ? new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "America/Bogota" }).format(new Date(`${date}T12:00:00-05:00`)) : "Por elegir";
}

export default function ConsultationExperience() {
  const consultationTopics = useEditorialData("consultation:topics", originalTopics);
  const consultationIntentions = useEditorialData("consultation:intentions", originalIntentions);
  const stepNames = useEditorialData("consultation:stepNames", original_stepNames);
  const titles = useEditorialData("consultation:titles", original_titles);
  const descriptions = useEditorialData("consultation:descriptions", original_descriptions);
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const launchButton = useRef<HTMLButtonElement>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormValues>({ topic: "", intention: "", notes: "", date: "", time: "", name: "", email: "", phone: "", continuityInterest: false, consent: false });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [availability, setAvailability] = useState<{ date: string; slots: string[]; error?: string }>({ date: "", slots: [] });
  const [checking, setChecking] = useState(false);
  const [availabilityAttempt, setAvailabilityAttempt] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reservation, setReservation] = useState<{ id: string } | null>(null);
  const [started, setStarted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const wizard = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const topic = consultationTopics.find(option => option.id === form.topic);
  const intention = consultationIntentions.find(option => option.id === form.intention);
  const [wompiMode, setWompiMode] = useState("sandbox");
  const [wompiAvailable, setWompiAvailable] = useState(false);
  useEffect(() => { let active = true; fetch("/api/payments/wompi/status").then(r => r.json()).then(data => { if (active) { setWompiAvailable(data.available === true); setWompiMode(data.mode === "production" ? "production" : "sandbox"); } }).catch(() => {}); return () => { active = false; }; }, []);

  useEffect(() => {
    const modal = dialog.current;
    if (!isOpen || !modal) return;
    modal.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    heading.current?.focus();
    return () => {
      modal.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    heading.current?.focus({ preventScroll: true });
    dialog.current?.scrollTo({ top: 0 });
    trackEvent("consultation_step_view", { step: step + 1 });
  }, [step, isOpen]);

  useEffect(() => {
    if (!reservation) return;
    successHeading.current?.focus({ preventScroll: true });
    wizard.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [reservation]);

  useEffect(() => {
    if (!showToast) return;
    const timeout = setTimeout(() => setShowToast(false), 9000);
    return () => clearTimeout(timeout);
  }, [showToast]);

  function closeWizard() {
    if (submittingRef.current) return;
    setIsOpen(false);
    requestAnimationFrame(() => launchButton.current?.focus({ preventScroll: true }));
  }

  useEffect(() => {
    if (!form.date) return;
    let cancelled = false;
    setChecking(true);
    getDayAvailability(form.date).then(result => {
      if (!cancelled) setAvailability({ date: form.date, slots: result.slots, error: result.error });
    }).catch(() => {
      if (!cancelled) setAvailability({ date: form.date, slots: [], error: "No pudimos consultar los horarios. Intenta otra vez." });
    }).finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [form.date, availabilityAttempt]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setForm(previous => ({ ...previous, [key]: value }));
    setError("");
    setFieldErrors(previous => ({ ...previous, [key]: undefined }));
    if (!started) { setStarted(true); trackEvent("consultation_start", { flow: "nadia_initial" }); }
  }

  function changeStep(next: number) { setError(""); setStep(next); }

  async function advance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    setError("");
    if (step === 0 && !form.topic) { setError("Elige una opción para empezar. También puedes elegir «Todavía no sé cómo nombrarlo»."); return; }
    if (step === 1 && !form.intention) { setError("Elige lo que te gustaría encontrar en este primer encuentro."); return; }
    if (step === 2 && (checking || availability.date !== form.date || !availability.slots.includes(form.time))) { setError("Elige una fecha y uno de los horarios que aparecen disponibles."); return; }
    if (step === 3) {
      const result = consultationContactSchema.safeParse(form);
      if (!result.success) {
        setFieldErrors(result.error.flatten().fieldErrors);
        setError("Revisemos tus datos para poder contactarte.");
        const field = result.error.issues[0]?.path[0];
        requestAnimationFrame(() => document.getElementById(`consultation-${field}`)?.focus());
        return;
      }
    }
    if (step < 4) { setStep(value => value + 1); return; }
    if (!form.consent) { setError("Autoriza el uso de tus datos para gestionar el encuentro."); return; }
    if (!wompiAvailable) { setError("Wompi no está disponible temporalmente. Tus respuestas se conservan."); return; }
    submittingRef.current = true;
    setSubmitting(true);
    let redirecting = false;
    try {
      const result = await requestConsultation(form);
      if ("success" in result && result.success && result.appointment) {
        setIsOpen(false);
        setReservation({ id: result.appointment.id });
        setShowToast(true);
        try { await openWompiCheckout({ appointmentId: result.appointment.id }); redirecting = true; }
        catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos abrir Wompi. Retoma el pago desde tu solicitud."); }
        trackEvent("consultation_request_submitted", { service: "initial", currency: "COP", value: initialConsultation.amountInCents / 100 });
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          if (result.fieldErrors.name || result.fieldErrors.email || result.fieldErrors.phone) setStep(3);
        }
        if (result.error?.match(/horario|fecha|máximo/)) { setStep(2); update("time", ""); setAvailabilityAttempt(value => value + 1); }
        setError(result.error ?? "No pudimos enviar tu solicitud. Tus respuestas siguen aquí.");
      }
    } catch { setError("No pudimos conectar. Tus respuestas siguen aquí; inténtalo nuevamente."); }
    finally { if (!redirecting) { submittingRef.current = false; setSubmitting(false); } }
  }

  return <div className={styles.page}>{submitting && <PaymentRedirectOverlay mode={wompiMode} />}
    <section className={styles.experience}>
      <div className={styles.invitation}>
        <p className="eyebrow"><SiteText id="c3c9187086f118a7e529">{"ASESORÍAS · UN ESPACIO PARA TI"}</SiteText></p>
        <h1><SiteText id="f8ef36c24155e04c8512">{"Tu cuidado empieza"}</SiteText><br /><SiteText id="ca63943a244583b30b57">{"por "}</SiteText><em><SiteText id="f5e75dd9fd10742a1146">{"escucharte."}</SiteText></em></h1>
        <p className={styles.lead}><SiteText id="571281845845a79732ce">{"A veces, lo que buscas va más allá de una rutina. Un encuentro con Melina para mirar tu caso con atención, hacer nuevas preguntas y encontrar por dónde empezar."}</SiteText></p>
        <div className={styles.host}><span className={styles.monogram} aria-hidden="true"><SiteText id="4f056b69ef609bf6fda4">{"m."}</SiteText></span><div><strong><SiteText id="a099b6d0666384fae314">{"Melina Jimenez Isaza"}</SiteText></strong><span><SiteText id="a9dbc6ef592b720b5c1b">{"Creadora de MAI · Más de 11 años de trayectoria"}</SiteText></span></div></div>
        <div className={styles.sessionFacts}><span><SiteText id="0869321a454f18abf624">{"Un encuentro personal"}</SiteText></span><span>{initialConsultation.durationMinutes}<SiteText id="7d303b5406af6f0ff717">{" minutos"}</SiteText></span><span>{initialConsultation.priceLabel}</span></div>
        <div className={styles.invitationFooter}><span aria-hidden="true">✳</span><p><SiteText id="76437381f394dff7ba80">{"No hace falta saber exactamente qué decir."}</SiteText><br /><strong><SiteText id="827f63e2d38910eb9f1f">{"Podemos empezar por una pregunta."}</SiteText></strong></p></div>
        <a href="#mirada-nadia" className={styles.quietLink}><SiteText id="82e811e38de5337e275d">{"Conoce la mirada de Melina "}</SiteText><span aria-hidden="true">↓</span></a>
      </div>

      <div id="tu-encuentro" ref={wizard} className={styles.wizard}>
        {reservation ? <div className={styles.step}>
          <span className={styles.receivedMark} aria-hidden="true">✓</span>
          <h2 ref={successHeading} tabIndex={-1}><SiteText id="638efc51caf5ebfa397e">{"El primer paso"}</SiteText><br /><em><SiteText id="478683edfd514d6788bf">{"ya está dado."}</SiteText></em></h2>
          <p><SiteText id="5f3c585d5af2ade6d17d">{"Gracias, "}</SiteText>{form.name.split(" ")[0]}<SiteText id="e0cecff9a0285bfdb21b">{". Recibimos tu solicitud para el "}</SiteText>{dateLabel(form.date)}<SiteText id="390d965ec6cc633bb5ef">{" a las "}</SiteText>{form.time}<SiteText id="60473bccfea5e2b6297d">{", hora de Colombia."}</SiteText></p>
          <div className={styles.note}><strong><SiteText id="266931d55f08864cb8a4">{"Pendiente de confirmación y pago"}</SiteText></strong><p><SiteText id="934c7d29bd1d35c1c957">{"El equipo revisará tu solicitud y coordinará contigo los detalles del encuentro. Aún no es una cita confirmada."}</SiteText></p></div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <p className={styles.reference}><SiteText id="bac6886eccda6f4ba0f2">{"Tu referencia: "}</SiteText><code>{reservation.id}</code></p>
          <p className={styles.helper}>{wompiMode === "production" ? "Paga de forma segura con Wompi. El equipo confirma contigo el horario después de verificar el pago." : "Wompi: simulación de pruebas, sin cobros reales ni confirmación de cita."}</p>
          {wompiAvailable ? <WompiPaymentButton mode={wompiMode} appointmentId={reservation.id} /> : <p className={styles.helper}><SiteText id="1c74cb758e5af78a3153">{"Wompi no está habilitado en este momento. Tu solicitud se conserva; vuelve a intentarlo más tarde."}</SiteText></p>}
          <a className={styles.primary} href={`mailto:info@mainatural.com?subject=${encodeURIComponent(`Mi encuentro MAI · ${reservation.id}`)}`}><SiteText id="e117125bf49618688bca">{"Consultar mi solicitud "}</SiteText><span aria-hidden="true">↗</span></a>
          <p className={styles.helper}><SiteText id="ddbc11d0792cf491c446">{"Conserva tu referencia. Puedes escribir a info@mainatural.com para resolver dudas o solicitar un cambio."}</SiteText></p>
        </div> : <div className={styles.launch}>
          <span className={styles.launchSymbol} aria-hidden="true">✳</span>
          <p className="eyebrow"><SiteText id="888287a89eada0fe6ba6">{"UNA PREGUNTA PUEDE ABRIR OTRO CAMINO"}</SiteText></p>
          <h2><SiteText id="01597aee56c795617aab">{"¿Y si esta vez"}</SiteText><br /><SiteText id="00a9168e710447e54c00">{"empiezas por"}</SiteText><br /><em><SiteText id="3fab4effa62d66c1f44e">{"escucharte a ti?"}</SiteText></em></h2>
          <p><SiteText id="0dc3805f387a4840cb17">{"Hay algo que quieres cuidar. Quizás también algo que quieres comprender. Démosle un espacio."}</SiteText></p>
          <button ref={launchButton} type="button" className={styles.primary} onClick={() => setIsOpen(true)} aria-haspopup="dialog">{started ? "Retomar mi encuentro" : "Continuar"}<span aria-hidden="true">↗</span></button>
          <small>{started ? "Tus respuestas siguen aquí mientras permaneces en esta página." : "Cinco pasos breves. Una conversación que empieza contigo."}</small>
        </div>}
      </div>
    </section>


    <dialog ref={dialog} className={styles.fullscreen} aria-labelledby="consultation-dialog-title" onCancel={event => { event.preventDefault(); closeWizard(); }}>
      <div className={styles.modalHeader}><span className={styles.modalBrand}><SiteText id="954bafb4056cd4ef2f81">{"Mai "}</SiteText><small><SiteText id="357628f6547e84b04164">{"UN ESPACIO PARA TI"}</SiteText></small></span><button type="button" onClick={closeWizard} disabled={submitting} aria-label="Cerrar formulario"><SiteText id="c8a68048995dedcbe255">{"Pausar y salir "}</SiteText><span aria-hidden="true"><SiteText id="4597634543a4c7fc131f">{"×"}</SiteText></span></button></div>
      <div className={styles.modalLayout}>
        <aside className={styles.modalAside}><p className="eyebrow"><SiteText id="4a1c245474854834455c">{"ENCUENTROS CON MELINA"}</SiteText></p><p><SiteText id="02b168875486efff80ec">{"Por un momento,"}</SiteText><br /><em><SiteText id="36e203e490e28e5bc362">{"el centro eres tú."}</SiteText></em></p><span><SiteText id="0ccb362bdf362c08b640">{"No hay respuestas perfectas."}</SiteText><br /><SiteText id="028b92402ba921f747a3">{"Solo un lugar para empezar."}</SiteText></span><div aria-hidden="true">✳</div></aside>
        <div className={styles.modalContent}>
          <div className={styles.wizardTop}><span className="eyebrow">{stepNames[step]}</span><span>0{step + 1} / 05</span></div>
          <div className={styles.progress} role="progressbar" aria-label="Avance de tu solicitud" aria-valuemin={0} aria-valuemax={5} aria-valuenow={step + 1} aria-valuetext={`Paso ${step + 1} de 5: ${stepNames[step]}`}><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
          <form noValidate onSubmit={advance}>
          <div className={styles.step} key={step}>
            <p className={styles.stepLabel}>{stepNames[step]}</p>
            <h2 id="consultation-dialog-title" ref={heading} tabIndex={-1}>{titles[step]}</h2>
            <p className={styles.description}>{descriptions[step]}</p>
            {step === 0 && <fieldset className={styles.choices}><legend className="sr-only"><SiteText id="54ff3e75a416e3c5ed0b">{"¿Qué te trae hasta aquí?"}</SiteText></legend>{consultationTopics.map((option, index) => <label key={option.id} className={`${styles.choice} ${form.topic === option.id ? styles.selected : ""}`}><input type="radio" name="topic" value={option.id} checked={form.topic === option.id} onChange={() => update("topic", option.id)} /><span className={styles.choiceNumber}>0{index + 1}</span><span><strong>{option.title}</strong><small>{option.description}</small></span><span className={styles.radioMark} aria-hidden="true" /></label>)}</fieldset>}
            {step === 1 && <><div className={styles.echo}><span aria-hidden="true">✳</span><p>{topic?.response}</p></div><fieldset className={styles.choices}><legend className="sr-only"><SiteText id="3a0e644cb7fffa11b605">{"Lo que buscas en el encuentro"}</SiteText></legend>{consultationIntentions.map(option => <label key={option.id} className={`${styles.choice} ${form.intention === option.id ? styles.selected : ""}`}><input type="radio" name="intention" value={option.id} checked={form.intention === option.id} onChange={() => update("intention", option.id)} /><span><strong>{option.title}</strong><small>{option.description}</small></span><span className={styles.radioMark} aria-hidden="true" /></label>)}</fieldset><details className={styles.optional}><summary><SiteText id="fbdaaec13629b9dedc77">{"¿Quieres dejar una pregunta? "}</SiteText><span><SiteText id="45011998ff909aee2e1c">{"Opcional"}</SiteText></span></summary><label htmlFor="consultation-notes"><SiteText id="1414f8e1862454db4bd6">{"Una idea que te gustaría conversar"}</SiteText></label><textarea id="consultation-notes" rows={3} maxLength={600} value={form.notes} onChange={event => update("notes", event.target.value)} placeholder="Me gustaría conversar sobre…" /><p className={styles.helper}><SiteText id="122bd4a906acbacbf9f3">{"Puedes dejarlo en blanco y hablarlo con Melina. No hace falta compartir información íntima ni datos de salud aquí."}</SiteText></p></details></>}
            {step === 2 && <><div className={styles.offer}><div><span><SiteText id="39f160444b9b2a9d9fa7">{"ENCUENTRO INICIAL"}</SiteText></span><strong><SiteText id="4cb89dd70da553d6d21e">{"Escucha + orientación de cuidado"}</SiteText></strong></div><p>{initialConsultation.priceLabel}<small>{initialConsultation.durationMinutes}<SiteText id="5d1a4e6b165f56993693">{" minutos · pago único"}</SiteText></small></p></div><label className={styles.fieldLabel} htmlFor="consultation-date"><SiteText id="008ade0f27bc622396ce">{"¿Qué día te gustaría?"}</SiteText></label><input id="consultation-date" name="date" type="date" value={form.date} min={colombiaDate()} onChange={event => { update("date", event.target.value); update("time", ""); }} /><div className={styles.schedule} aria-busy={checking}>{!form.date ? <p className={styles.helper}><SiteText id="294fa1e05a1ef8457bdd">{"Al elegir el día te mostraremos los horarios que puedes solicitar."}</SiteText></p> : checking ? <p role="status"><SiteText id="21ca7e1dca9a10c15ba2">{"Consultando horarios…"}</SiteText></p> : availability.error ? <div role="alert"><p>{availability.error}</p><button className={styles.quietLink} type="button" onClick={() => setAvailabilityAttempt(value => value + 1)}><SiteText id="6b6d9a2bea188ef24209">{"Volver a consultar"}</SiteText></button></div> : availability.date === form.date && availability.slots.length === 0 ? <p role="status"><SiteText id="1186215aadaa8ed00f3c">{"No hay horarios para ese día. Probemos con otra fecha."}</SiteText></p> : <fieldset><legend className={styles.fieldLabel}><SiteText id="fd90b11f77204ca8f4f0">{"Elige tu hora · Colombia"}</SiteText></legend><div className={styles.slots}>{availability.slots.map(time => <label key={time} className={form.time === time ? styles.slotSelected : ""}><input type="radio" name="time" value={time} checked={form.time === time} onChange={() => update("time", time)} /><span>{time}</span></label>)}</div></fieldset>}</div><p className={styles.helper}><SiteText id="49837fdcccbdcee706bd">{"El equipo confirmará contigo el horario y la modalidad. Los productos y el acompañamiento posterior no están incluidos en este valor."}</SiteText></p></>}
            {step === 3 && <div className={styles.contactFields}>{[{key:"name", label:"¿Cómo te llamas?",type:"text",complete:"name",placeholder:"Tu nombre"},{key:"email",label:"Tu correo electrónico",type:"email",complete:"email",placeholder:"nombre@correo.com"},{key:"phone",label:"Tu teléfono de contacto",type:"tel",complete:"tel",placeholder:"+57 300 123 4567"}].map(field => <div key={field.key}><label htmlFor={`consultation-${field.key}`}>{field.label}</label><input id={`consultation-${field.key}`} name={field.key} type={field.type} autoComplete={field.complete} value={form[field.key as "name" | "email" | "phone"]} onChange={event => update(field.key as "name" | "email" | "phone",event.target.value)} placeholder={field.placeholder} aria-invalid={Boolean(fieldErrors[field.key])} aria-describedby={fieldErrors[field.key] ? `${field.key}-error` : field.key === "phone" ? "phone-help" : undefined} maxLength={field.key === "email" ? 254 : field.key === "phone" ? 25 : 100} />{fieldErrors[field.key] && <p id={`${field.key}-error`} className={styles.fieldError}>{fieldErrors[field.key]?.[0]}</p>}{field.key === "phone" && <p id="phone-help" className={styles.helper}><SiteText id="a76993e9588d9612ac77">{"Para coordinar este encuentro contigo. No necesitas crear una cuenta."}</SiteText></p>}</div>)}</div>}
            {step === 4 && <><div className={styles.review}>{[{label:"Quiero conversar sobre",value:topic?.title,to:0},{label:"Me gustaría",value:intention?.title,to:1},{label:"Mi momento",value:`${dateLabel(form.date)} · ${form.time} (Colombia)`,to:2},{label:"Mis datos",value:`${form.name} · ${form.email} · ${form.phone}`,to:3}].map(row => <div key={row.label}><div><span>{row.label}</span><p>{row.value}</p></div><button type="button" onClick={() => changeStep(row.to)} aria-label={`Cambiar ${row.label.toLowerCase()}`}><SiteText id="7ba54b7473b0b617b383">{"Cambiar"}</SiteText></button></div>)}{form.notes && <div><div><span><SiteText id="346452b660c2864f9b8e">{"Mi pregunta"}</SiteText></span><p>{form.notes}</p></div><button type="button" onClick={() => changeStep(1)}><SiteText id="7ba54b7473b0b617b383">{"Cambiar"}</SiteText></button></div>}</div><div className={styles.total}><div><SiteText id="6fb216a9e639b5730a9f">{"Encuentro inicial con Melina"}</SiteText><small>{initialConsultation.durationMinutes}<SiteText id="d174d037bd2a58742c63">{" minutos · sin suscripción"}</SiteText></small></div><strong>{initialConsultation.priceLabel}</strong></div><label className={styles.checkbox}><input type="checkbox" checked={form.continuityInterest} onChange={event => update("continuityInterest",event.target.checked)} /><span><SiteText id="c635e18f18046556ff21">{"Me gustaría conocer el Círculo MAI cuando esté disponible."}</SiteText><small><SiteText id="af2a7ce3997a2eed3aa8">{"Opcional. No activa una membresía ni genera cobros."}</SiteText></small></span></label><label className={styles.checkbox}><input type="checkbox" checked={form.consent} onChange={event => update("consent",event.target.checked)} /><span><SiteText id="4fbc92db363ccf1e2082">{"Autorizo a MAI a usar mis respuestas y datos de contacto para gestionar este encuentro. "}</SiteText><Link href="/terms#asesorias" target="_blank" rel="noopener noreferrer"><SiteText id="9c9d6896b06bfffdde9d">{"Ver información de atención"}</SiteText></Link>.</span></label></>}
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.wizardBottom}>{step > 0 ? <button type="button" className={styles.back} disabled={submitting} onClick={() => changeStep(step - 1)}><SiteText id="46bc98dc9f89a8ab7e86">{"← Volver"}</SiteText></button> : <span className={styles.startNote}><SiteText id="c4bed34e8b777df0c79b">{"A tu ritmo. Paso a paso."}</SiteText></span>}<button type="submit" className={styles.primary} disabled={submitting || (step === 2 && checking) || (step === 4 && !wompiAvailable)}>{submitting ? "Abriendo Wompi…" : step === 4 ? (wompiMode === "sandbox" ? "Continuar a Wompi · prueba" : "Pagar mi encuentro con Wompi") : step === 3 ? "Revisar mi encuentro" : "Continuar"}<span aria-hidden="true">→</span></button></div>
          <p className={styles.footerNote}>{step === 4 ? (wompiAvailable ? wompiMode === "sandbox" ? "Abriremos Wompi en modo de prueba. No se realizará un cobro real." : "Pagarás el valor mostrado en Wompi. El equipo confirmará contigo el horario del encuentro." : "Wompi no está disponible temporalmente. Tus respuestas se conservan.") : "Puedes volver y cambiar tus respuestas antes de enviar."}</p>
        </form>
        </div>
      </div>
    </dialog>
    <div className={styles.toastRegion} role="status" aria-live="polite" aria-atomic="true">{showToast && <div className={styles.toast}><span aria-hidden="true">✓</span><div><strong><SiteText id="7de0810dfa05c1758013">{"Tu solicitud fue recibida"}</SiteText></strong><p><SiteText id="fab729ed77f35136c45a">{"El primer paso está dado. Tu encuentro queda pendiente de confirmación y pago."}</SiteText></p></div><button type="button" onClick={() => setShowToast(false)} aria-label="Cerrar notificación"><SiteText id="4597634543a4c7fc131f">{"×"}</SiteText></button></div>}</div>

    <section id="mirada-nadia" className={styles.about}><div><p className="eyebrow"><SiteText id="4fe2e7df6287389bd573">{"LA PERSONA DETRÁS DE MAI"}</SiteText></p><h2><SiteText id="7eec858d274c9bdd6b75">{"Una mirada que"}</SiteText><br /><em><SiteText id="a6224d0fecd9a1b6a695">{"se detiene en ti."}</SiteText></em></h2><p><SiteText id="69ca47a894f8663f9eb4">{"Melina Jimenez Isaza, creadora de MAI, dedica este espacio a escuchar cada caso desde más de 11 años de trayectoria en el universo del cuidado."}</SiteText></p><p><SiteText id="27b71f881e2e66abe18f">{"Su experiencia cosmética dialoga con el estudio de la iniciación, el esoterismo, el hermetismo, el psicoanálisis y la enseñanza de José Luis Parise. Son referencias para explorar lo que a veces queda fuera de la rutina: las palabras, los hábitos y las preguntas que aún no has formulado."}</SiteText></p><p className={styles.aboutClosing}><SiteText id="b3234837fe67d2402d5b">{"Lo que ves. Lo que sientes."}</SiteText><br /><strong><SiteText id="2effbbace25397c6221c">{"Lo que todavía no has nombrado."}</SiteText></strong></p></div><div className={styles.aboutImage}><Image src="/products/autor/fa-lnd-70-1.png" alt="Leche Nutritiva Día MAI" fill sizes="(max-width:760px) 100vw, 40vw" className="object-cover" /><div><span><SiteText id="2a3b59a039993d7bdb30">{"LA BELLEZA DE HABITARSE"}</SiteText></span><p><SiteText id="d6378c6e08806bca12fe">{"El producto es una parte."}</SiteText><br /><em><SiteText id="93c071b06b0a975551a4">{"Tu historia también importa."}</SiteText></em></p></div></div></section>

    <section className={styles.journey}><div className={styles.sectionHeading}><p className="eyebrow"><SiteText id="b55d3ce603d9f1162c3f">{"UN CAMINO QUE SE CONSTRUYE CONTIGO"}</SiteText></p><h2><SiteText id="1254fe51801139878d53">{"Primero, encontrarnos."}</SiteText><br /><em><SiteText id="0a590ea5f8f7643cccc0">{"Después, tú decides."}</SiteText></em></h2></div><div className={styles.journeyGrid}><article><span><SiteText id="851a0d15afe78f50b120">{"01 / ESCUCHAR"}</SiteText></span><h3><SiteText id="1b6f75d17a9d174066e4">{"Tu encuentro inicial"}</SiteText></h3><p><SiteText id="5de137227afb3ae187b1">{"Un espacio personal para compartir tu situación, revisar tu cuidado y abrir preguntas junto a Melina."}</SiteText></p></article><article><span><SiteText id="0caf9fa31a3cfa5a4e54">{"02 / DAR FORMA"}</SiteText></span><h3><SiteText id="7547cb662cd48c794863">{"Una primera orientación"}</SiteText></h3><p><SiteText id="f176bc4d08846fcb7506">{"A partir de la conversación, una propuesta inicial de cuidado cosmético y próximos pasos acordes con lo conversado."}</SiteText></p></article><article><span><SiteText id="e8e3a37da6c9eb785d20">{"03 / PROFUNDIZAR"}</SiteText></span><h3><SiteText id="b86d29ea5c80a185332f">{"Un proceso, si lo deseas"}</SiteText></h3><p><SiteText id="be74893b72e31c665bc6">{"La posibilidad de continuar el estudio y la exploración personal. El primer encuentro no te compromete a una suscripción."}</SiteText></p></article></div></section>

    <section className={styles.circle}><div><p className="eyebrow"><SiteText id="2d90cb9fa09176c73b2e">{"CÍRCULO MAI · PRÓXIMAMENTE"}</SiteText></p><h2><SiteText id="53595cfffc476a26de76">{"Hay preguntas que"}</SiteText><br /><em><SiteText id="e423d791b82198885d16">{"merecen continuidad."}</SiteText></em></h2><p><SiteText id="187c33011d97e256c2d6">{"Un espacio de análisis y estudio en grupo, con encuentros quincenales sobre belleza, cosmética y autoformulación: preguntarte cómo te nombras, qué eliges y cómo participas en la construcción de tu propia realidad."}</SiteText></p><a href="#tu-encuentro" className={styles.lightButton}><SiteText id="453605ba7d015580296f">{"Empezar por mi encuentro "}</SiteText><span aria-hidden="true">↗</span></a></div><div className={styles.circleDetails}><div><span><SiteText id="5e1b667a26ce70c9dfa6">{"EL RITMO"}</SiteText></span><p><SiteText id="23183e083cfa5f4281b0">{"Grupos de estudio quincenales"}</SiteText></p></div><div><span><SiteText id="5edcafbcf390711d586a">{"LA EXPLORACIÓN"}</SiteText></span><p><SiteText id="73701985e1bd7ed70cca">{"Belleza, cuidado y realidad propia"}</SiteText></p></div><div><span><SiteText id="3fe6a1a19c1024302487">{"TU DECISIÓN"}</SiteText></span><p><SiteText id="49b3abae90e3398fff15">{"Continuidad opcional después del encuentro"}</SiteText></p></div><small><SiteText id="a4e6347d72a46eb6f44d">{"Las inscripciones aún no están abiertas. Precio y condiciones se comunicarán antes de que decidas suscribirte."}</SiteText></small></div></section>

    <section className={styles.faq}><div><p className="eyebrow"><SiteText id="c80ee9277d9a7504eccc">{"ANTES DE CONVERSAR"}</SiteText></p><h2><SiteText id="8968d2d75753371054e3">{"Un poco de claridad"}</SiteText><br /><em><SiteText id="4e37613ec330a51e61a1">{"para empezar."}</SiteText></em></h2></div><div>{[
      ["¿Tengo que saber qué me pasa?", "No. Puedes venir con una pregunta, una inquietud sobre tu cuidado o con el deseo de conversar. El formulario solo prepara el encuentro; no interpreta tus respuestas ni realiza un diagnóstico."],
      ["¿Qué incluye el encuentro inicial?", `Una conversación personal de ${initialConsultation.durationMinutes} minutos con Melina y una orientación inicial de cuidado a partir de lo conversado. El valor es ${initialConsultation.priceLabel}. Productos, preparaciones cosméticas y suscripción posterior se cotizan aparte cuando correspondan.`],
      ["¿Necesito conocer estas enseñanzas?", "No necesitas conocimientos previos ni compartir una creencia específica. Las referencias simbólicas forman parte de la mirada de Melina; puedes preguntar por el enfoque y decidir qué quieres explorar."],
      ["¿Es una consulta médica o psicológica?", "Es un espacio de orientación cosmética y exploración personal. Las referencias al psicoanálisis y a tradiciones simbólicas no lo convierten en psicoterapia ni en atención médica. No se ofrecen diagnósticos clínicos ni se sustituyen tratamientos profesionales."],
      ["¿Me suscribo al reservar?", "No. El encuentro inicial es independiente. Si más adelante quieres profundizar, podrás conocer las condiciones del Círculo MAI y decidir. En este momento las suscripciones aún no están abiertas."],
      ["¿Cómo se confirma la cita?", "Elige tu horario, revisa el valor y continúa directamente a Wompi para pagar. Verificamos el resultado con Wompi y el equipo confirma contigo el horario y la modalidad. Para consultar o cambiar tu solicitud, escribe a info@mainatural.com."],
    ].map(([question,answer], faqIndex) => <details key={question}><summary><SiteText id={`services:faq:${faqIndex}:question`}>{question}</SiteText><span aria-hidden="true">+</span></summary><p><SiteText id={`services:faq:${faqIndex}:answer`}>{answer}</SiteText></p></details>)}</div></section>
  </div>;
}
