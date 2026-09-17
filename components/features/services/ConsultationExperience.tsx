"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getDayAvailability, requestConsultation } from "@/app/(public)/services/actions";
import { colombiaDate, consultationIntentions, consultationTopics, initialConsultation } from "@/lib/consultation";
import { consultationContactSchema } from "@/lib/validators/consultation";
import { trackEvent } from "@/lib/analytics";
import styles from "./consultation.module.css";

type Bank = { bankName: string; accountType: string; accountNumber: string; accountHolder: string };
type FormValues = { topic: string; intention: string; notes: string; date: string; time: string; name: string; email: string; phone: string; continuityInterest: boolean; consent: boolean };
const stepNames = ["Tu motivo", "Tu intención", "Tu momento", "Tu contacto", "Tu encuentro"];
const titles = ["¿Qué te trae hasta aquí?", "¿Qué te gustaría llevarte?", "Hagamos espacio para conversar.", "¿Cómo podemos encontrarte?", "Este es tu punto de partida."];
const descriptions = ["No necesitas tenerlo todo claro. Elige lo que más se acerque a tu momento.", "No tienes que resolverlo ahora. Solo darle una dirección a nuestra conversación.", "Elige una fecha y un horario para solicitar tu encuentro. Hora de Colombia (UTC−5).", "Solo lo necesario para coordinar tu encuentro con Nadia.", "Revisa tus respuestas. Puedes cambiarlas antes de enviar tu solicitud."];

function dateLabel(date: string) {
  return date ? new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "America/Bogota" }).format(new Date(`${date}T12:00:00-05:00`)) : "Por elegir";
}

export default function ConsultationExperience({ bank }: { bank: Bank }) {
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
  const [transferReference, setTransferReference] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [started, setStarted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const wizard = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const topic = consultationTopics.find(option => option.id === form.topic);
  const intention = consultationIntentions.find(option => option.id === form.intention);
  const hasBank = Boolean(bank.accountNumber && bank.accountHolder);

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
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const result = await requestConsultation(form);
      if ("success" in result && result.success && result.appointment) {
        setIsOpen(false);
        setReservation({ id: result.appointment.id });
        setShowToast(true);
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
    finally { submittingRef.current = false; setSubmitting(false); }
  }

  async function reportTransfer() {
    if (!reservation || reporting || reported) return;
    if (transferReference.trim().length < 4) { setPaymentMessage("Escribe la referencia que aparece en tu comprobante."); return; }
    setReporting(true);
    try {
      const response = await fetch("/api/appointments/confirm-transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appointmentId: reservation.id, transferReference: transferReference.trim() }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "No pudimos recibir la referencia.");
      setReported(true);
      setPaymentMessage("Referencia recibida. El equipo debe verificar el pago antes de confirmar tu encuentro.");
    } catch (cause) { setPaymentMessage(cause instanceof Error ? cause.message : "Revisa tu conexión e intenta de nuevo."); }
    finally { setReporting(false); }
  }

  return <div className={styles.page}>
    <div className={styles.breadcrumb}><Link href="/">MAI Natural</Link><span aria-hidden="true">/</span><span>Encuentros con Nadia</span></div>
    <section className={styles.experience}>
      <div className={styles.invitation}>
        <p className="eyebrow">ASESORÍAS · UN ESPACIO PARA TI</p>
        <h1>Tu cuidado empieza<br />por <em>escucharte.</em></h1>
        <p className={styles.lead}>A veces, lo que buscas va más allá de una rutina. Un encuentro con Nadia para mirar tu caso con atención, hacer nuevas preguntas y encontrar por dónde empezar.</p>
        <div className={styles.host}><span className={styles.monogram} aria-hidden="true">nm.</span><div><strong>Nadia Melina Jimenez Isaza</strong><span>Creadora de MAI · Más de 11 años de trayectoria</span></div></div>
        <div className={styles.sessionFacts}><span>Un encuentro personal</span><span>{initialConsultation.durationMinutes} minutos</span><span>{initialConsultation.priceLabel}</span></div>
        <div className={styles.invitationFooter}><span aria-hidden="true">✳</span><p>No hace falta saber exactamente qué decir.<br /><strong>Podemos empezar por una pregunta.</strong></p></div>
        <a href="#mirada-nadia" className={styles.quietLink}>Conoce la mirada de Nadia <span aria-hidden="true">↓</span></a>
      </div>

      <div id="tu-encuentro" ref={wizard} className={styles.wizard}>
        {reservation ? <div className={styles.step}>
          <span className={styles.receivedMark} aria-hidden="true">✓</span>
          <h2 ref={successHeading} tabIndex={-1}>El primer paso<br /><em>ya está dado.</em></h2>
          <p>Gracias, {form.name.split(" ")[0]}. Recibimos tu solicitud para el {dateLabel(form.date)} a las {form.time}, hora de Colombia.</p>
          <div className={styles.note}><strong>Pendiente de confirmación y pago</strong><p>El equipo revisará tu solicitud y coordinará contigo los detalles del encuentro. Aún no es una cita confirmada.</p></div>
          <p className={styles.reference}>Tu referencia: <code>{reservation.id}</code></p>
          {hasBank ? <details className={styles.payment}><summary>Ver instrucciones de pago · {initialConsultation.priceLabel}</summary><p>Transferencia a {bank.bankName}. Conserva tu comprobante; reportar una referencia no confirma el pago.</p><dl><dt>Tipo de cuenta</dt><dd>{bank.accountType}</dd><dt>Cuenta</dt><dd>{bank.accountNumber}</dd><dt>Titular</dt><dd>{bank.accountHolder}</dd></dl><p>La referencia se puede reportar durante las 24 horas posteriores a la solicitud.</p><label htmlFor="transfer-reference">Referencia del comprobante</label><input id="transfer-reference" value={transferReference} onChange={event => setTransferReference(event.target.value)} maxLength={100} disabled={reported} /><button type="button" className={styles.primary} disabled={reporting || reported} onClick={reportTransfer}>{reported ? "Referencia recibida" : reporting ? "Enviando…" : "Reportar transferencia"}</button><p role="status">{paymentMessage}</p></details> : <p className={styles.helper}>Consulta con el equipo las instrucciones de pago y la modalidad antes de transferir.</p>}
          <a className={styles.primary} href={`mailto:info@mainatural.com?subject=${encodeURIComponent(`Mi encuentro MAI · ${reservation.id}`)}`}>Consultar mi solicitud <span aria-hidden="true">↗</span></a>
          <p className={styles.helper}>Conserva tu referencia. Puedes escribir a info@mainatural.com para resolver dudas o solicitar un cambio.</p>
        </div> : <div className={styles.launch}>
          <span className={styles.launchSymbol} aria-hidden="true">✳</span>
          <p className="eyebrow">UNA PREGUNTA PUEDE ABRIR OTRO CAMINO</p>
          <h2>¿Y si esta vez<br />empiezas por<br /><em>escucharte a ti?</em></h2>
          <p>Hay algo que quieres cuidar. Quizás también algo que quieres comprender. Démosle un espacio.</p>
          <button ref={launchButton} type="button" className={styles.primary} onClick={() => setIsOpen(true)} aria-haspopup="dialog">{started ? "Retomar mi encuentro" : "Continuar"}<span aria-hidden="true">↗</span></button>
          <small>{started ? "Tus respuestas siguen aquí mientras permaneces en esta página." : "Cinco pasos breves. Una conversación que empieza contigo."}</small>
        </div>}
      </div>
    </section>


    <dialog ref={dialog} className={styles.fullscreen} aria-labelledby="consultation-dialog-title" onCancel={event => { event.preventDefault(); closeWizard(); }}>
      <div className={styles.modalHeader}><span className={styles.modalBrand}>Mai <small>UN ESPACIO PARA TI</small></span><button type="button" onClick={closeWizard} disabled={submitting} aria-label="Cerrar formulario">Pausar y salir <span aria-hidden="true">×</span></button></div>
      <div className={styles.modalLayout}>
        <aside className={styles.modalAside}><p className="eyebrow">ENCUENTROS CON NADIA</p><p>Por un momento,<br /><em>el centro eres tú.</em></p><span>No hay respuestas perfectas.<br />Solo un lugar para empezar.</span><div aria-hidden="true">✳</div></aside>
        <div className={styles.modalContent}>
          <div className={styles.wizardTop}><span className="eyebrow">{stepNames[step]}</span><span>0{step + 1} / 05</span></div>
          <div className={styles.progress} role="progressbar" aria-label="Avance de tu solicitud" aria-valuemin={0} aria-valuemax={5} aria-valuenow={step + 1} aria-valuetext={`Paso ${step + 1} de 5: ${stepNames[step]}`}><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
          <form noValidate onSubmit={advance}>
          <div className={styles.step} key={step}>
            <p className={styles.stepLabel}>{stepNames[step]}</p>
            <h2 id="consultation-dialog-title" ref={heading} tabIndex={-1}>{titles[step]}</h2>
            <p className={styles.description}>{descriptions[step]}</p>
            {step === 0 && <fieldset className={styles.choices}><legend className="sr-only">¿Qué te trae hasta aquí?</legend>{consultationTopics.map((option, index) => <label key={option.id} className={`${styles.choice} ${form.topic === option.id ? styles.selected : ""}`}><input type="radio" name="topic" value={option.id} checked={form.topic === option.id} onChange={() => update("topic", option.id)} /><span className={styles.choiceNumber}>0{index + 1}</span><span><strong>{option.title}</strong><small>{option.description}</small></span><span className={styles.radioMark} aria-hidden="true" /></label>)}</fieldset>}
            {step === 1 && <><div className={styles.echo}><span aria-hidden="true">✳</span><p>{topic?.response}</p></div><fieldset className={styles.choices}><legend className="sr-only">Lo que buscas en el encuentro</legend>{consultationIntentions.map(option => <label key={option.id} className={`${styles.choice} ${form.intention === option.id ? styles.selected : ""}`}><input type="radio" name="intention" value={option.id} checked={form.intention === option.id} onChange={() => update("intention", option.id)} /><span><strong>{option.title}</strong><small>{option.description}</small></span><span className={styles.radioMark} aria-hidden="true" /></label>)}</fieldset><details className={styles.optional}><summary>¿Quieres dejar una pregunta? <span>Opcional</span></summary><label htmlFor="consultation-notes">Una idea que te gustaría conversar</label><textarea id="consultation-notes" rows={3} maxLength={600} value={form.notes} onChange={event => update("notes", event.target.value)} placeholder="Me gustaría conversar sobre…" /><p className={styles.helper}>Puedes dejarlo en blanco y hablarlo con Nadia. No hace falta compartir información íntima ni datos de salud aquí.</p></details></>}
            {step === 2 && <><div className={styles.offer}><div><span>ENCUENTRO INICIAL</span><strong>Escucha + orientación de cuidado</strong></div><p>{initialConsultation.priceLabel}<small>{initialConsultation.durationMinutes} minutos · pago único</small></p></div><label className={styles.fieldLabel} htmlFor="consultation-date">¿Qué día te gustaría?</label><input id="consultation-date" name="date" type="date" value={form.date} min={colombiaDate()} onChange={event => { update("date", event.target.value); update("time", ""); }} /><div className={styles.schedule} aria-busy={checking}>{!form.date ? <p className={styles.helper}>Al elegir el día te mostraremos los horarios que puedes solicitar.</p> : checking ? <p role="status">Consultando horarios…</p> : availability.error ? <div role="alert"><p>{availability.error}</p><button className={styles.quietLink} type="button" onClick={() => setAvailabilityAttempt(value => value + 1)}>Volver a consultar</button></div> : availability.date === form.date && availability.slots.length === 0 ? <p role="status">No hay horarios para ese día. Probemos con otra fecha.</p> : <fieldset><legend className={styles.fieldLabel}>Elige tu hora · Colombia</legend><div className={styles.slots}>{availability.slots.map(time => <label key={time} className={form.time === time ? styles.slotSelected : ""}><input type="radio" name="time" value={time} checked={form.time === time} onChange={() => update("time", time)} /><span>{time}</span></label>)}</div></fieldset>}</div><p className={styles.helper}>El equipo confirmará contigo el horario y la modalidad. Los productos y el acompañamiento posterior no están incluidos en este valor.</p></>}
            {step === 3 && <div className={styles.contactFields}>{[{key:"name", label:"¿Cómo te llamas?",type:"text",complete:"name",placeholder:"Tu nombre"},{key:"email",label:"Tu correo electrónico",type:"email",complete:"email",placeholder:"nombre@correo.com"},{key:"phone",label:"Tu teléfono de contacto",type:"tel",complete:"tel",placeholder:"+57 300 123 4567"}].map(field => <div key={field.key}><label htmlFor={`consultation-${field.key}`}>{field.label}</label><input id={`consultation-${field.key}`} name={field.key} type={field.type} autoComplete={field.complete} value={form[field.key as "name" | "email" | "phone"]} onChange={event => update(field.key as "name" | "email" | "phone",event.target.value)} placeholder={field.placeholder} aria-invalid={Boolean(fieldErrors[field.key])} aria-describedby={fieldErrors[field.key] ? `${field.key}-error` : field.key === "phone" ? "phone-help" : undefined} maxLength={field.key === "email" ? 254 : field.key === "phone" ? 25 : 100} />{fieldErrors[field.key] && <p id={`${field.key}-error`} className={styles.fieldError}>{fieldErrors[field.key]?.[0]}</p>}{field.key === "phone" && <p id="phone-help" className={styles.helper}>Para coordinar este encuentro contigo. No necesitas crear una cuenta.</p>}</div>)}</div>}
            {step === 4 && <><div className={styles.review}>{[{label:"Quiero conversar sobre",value:topic?.title,to:0},{label:"Me gustaría",value:intention?.title,to:1},{label:"Mi momento",value:`${dateLabel(form.date)} · ${form.time} (Colombia)`,to:2},{label:"Mis datos",value:`${form.name} · ${form.email} · ${form.phone}`,to:3}].map(row => <div key={row.label}><div><span>{row.label}</span><p>{row.value}</p></div><button type="button" onClick={() => changeStep(row.to)} aria-label={`Cambiar ${row.label.toLowerCase()}`}>Cambiar</button></div>)}{form.notes && <div><div><span>Mi pregunta</span><p>{form.notes}</p></div><button type="button" onClick={() => changeStep(1)}>Cambiar</button></div>}</div><div className={styles.total}><div>Encuentro inicial con Nadia<small>{initialConsultation.durationMinutes} minutos · sin suscripción</small></div><strong>{initialConsultation.priceLabel}</strong></div><label className={styles.checkbox}><input type="checkbox" checked={form.continuityInterest} onChange={event => update("continuityInterest",event.target.checked)} /><span>Me gustaría conocer el Círculo MAI cuando esté disponible.<small>Opcional. No activa una membresía ni genera cobros.</small></span></label><label className={styles.checkbox}><input type="checkbox" checked={form.consent} onChange={event => update("consent",event.target.checked)} /><span>Autorizo a MAI a usar mis respuestas y datos de contacto para gestionar este encuentro. <Link href="/terms#asesorias" target="_blank" rel="noopener noreferrer">Ver información de atención</Link>.</span></label></>}
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <div className={styles.wizardBottom}>{step > 0 ? <button type="button" className={styles.back} disabled={submitting} onClick={() => changeStep(step - 1)}>← Volver</button> : <span className={styles.startNote}>A tu ritmo. Paso a paso.</span>}<button type="submit" className={styles.primary} disabled={submitting || (step === 2 && checking)}>{submitting ? "Enviando tu solicitud…" : step === 4 ? "Solicitar mi encuentro" : step === 3 ? "Revisar mi encuentro" : "Continuar"}<span aria-hidden="true">→</span></button></div>
          <p className={styles.footerNote}>{step === 4 ? "Enviar la solicitud no realiza ningún cobro. La confirmación es personal." : "Puedes volver y cambiar tus respuestas antes de enviar."}</p>
        </form>
        </div>
      </div>
    </dialog>
    <div className={styles.toastRegion} role="status" aria-live="polite" aria-atomic="true">{showToast && <div className={styles.toast}><span aria-hidden="true">✓</span><div><strong>Tu solicitud fue recibida</strong><p>El primer paso está dado. Tu encuentro queda pendiente de confirmación y pago.</p></div><button type="button" onClick={() => setShowToast(false)} aria-label="Cerrar notificación">×</button></div>}</div>

    <section id="mirada-nadia" className={styles.about}><div><p className="eyebrow">LA PERSONA DETRÁS DE MAI</p><h2>Una mirada que<br /><em>se detiene en ti.</em></h2><p>Nadia Melina Jimenez Isaza, creadora de MAI, dedica este espacio a escuchar cada caso desde más de 11 años de trayectoria en el universo del cuidado.</p><p>Su experiencia cosmética dialoga con el estudio de la iniciación, el esoterismo, el hermetismo, el psicoanálisis y la enseñanza de José Luis Parise. Son referencias para explorar lo que a veces queda fuera de la rutina: las palabras, los hábitos y las preguntas que aún no has formulado.</p><p className={styles.aboutClosing}>Lo que ves. Lo que sientes.<br /><strong>Lo que todavía no has nombrado.</strong></p></div><div className={styles.aboutImage}><Image src="/products/Facial/agua-de-rosas-mai-natural.png" alt="Agua de Rosas MAI entre pétalos y elementos botánicos" fill sizes="(max-width:760px) 100vw, 40vw" className="object-cover" /><div><span>LA BELLEZA DE HABITARSE</span><p>El producto es una parte.<br /><em>Tu historia también importa.</em></p></div></div></section>

    <section className={styles.journey}><div className={styles.sectionHeading}><p className="eyebrow">UN CAMINO QUE SE CONSTRUYE CONTIGO</p><h2>Primero, encontrarnos.<br /><em>Después, tú decides.</em></h2></div><div className={styles.journeyGrid}><article><span>01 / ESCUCHAR</span><h3>Tu encuentro inicial</h3><p>Un espacio personal para compartir tu situación, revisar tu cuidado y abrir preguntas junto a Nadia.</p></article><article><span>02 / DAR FORMA</span><h3>Una primera orientación</h3><p>A partir de la conversación, una propuesta inicial de cuidado cosmético y próximos pasos acordes con lo conversado.</p></article><article><span>03 / PROFUNDIZAR</span><h3>Un proceso, si lo deseas</h3><p>La posibilidad de continuar el estudio y la exploración personal. El primer encuentro no te compromete a una suscripción.</p></article></div></section>

    <section className={styles.circle}><div><p className="eyebrow">CÍRCULO MAI · PRÓXIMAMENTE</p><h2>Hay preguntas que<br /><em>merecen continuidad.</em></h2><p>Un espacio de análisis y estudio en grupo, con encuentros quincenales sobre belleza, cosmética y autoformulación: preguntarte cómo te nombras, qué eliges y cómo participas en la construcción de tu propia realidad.</p><a href="#tu-encuentro" className={styles.lightButton}>Empezar por mi encuentro <span aria-hidden="true">↗</span></a></div><div className={styles.circleDetails}><div><span>EL RITMO</span><p>Grupos de estudio quincenales</p></div><div><span>LA EXPLORACIÓN</span><p>Belleza, cuidado y realidad propia</p></div><div><span>TU DECISIÓN</span><p>Continuidad opcional después del encuentro</p></div><small>Las inscripciones aún no están abiertas. Precio y condiciones se comunicarán antes de que decidas suscribirte.</small></div></section>

    <section className={styles.faq}><div><p className="eyebrow">ANTES DE CONVERSAR</p><h2>Un poco de claridad<br /><em>para empezar.</em></h2></div><div>{[
      ["¿Tengo que saber qué me pasa?", "No. Puedes venir con una pregunta, una inquietud sobre tu cuidado o con el deseo de conversar. El formulario solo prepara el encuentro; no interpreta tus respuestas ni realiza un diagnóstico."],
      ["¿Qué incluye el encuentro inicial?", `Una conversación personal de ${initialConsultation.durationMinutes} minutos con Nadia y una orientación inicial de cuidado a partir de lo conversado. El valor es ${initialConsultation.priceLabel}. Productos, preparaciones cosméticas y suscripción posterior se cotizan aparte cuando correspondan.`],
      ["¿Necesito conocer estas enseñanzas?", "No necesitas conocimientos previos ni compartir una creencia específica. Las referencias simbólicas forman parte de la mirada de Nadia; puedes preguntar por el enfoque y decidir qué quieres explorar."],
      ["¿Es una consulta médica o psicológica?", "Es un espacio de orientación cosmética y exploración personal. Las referencias al psicoanálisis y a tradiciones simbólicas no lo convierten en psicoterapia ni en atención médica. No se ofrecen diagnósticos clínicos ni se sustituyen tratamientos profesionales."],
      ["¿Me suscribo al reservar?", "No. El encuentro inicial es independiente. Si más adelante quieres profundizar, podrás conocer las condiciones del Círculo MAI y decidir. En este momento las suscripciones aún no están abiertas."],
      ["¿Cómo se confirma la cita?", "Envía tu solicitud con el horario que prefieres. El equipo revisará disponibilidad, modalidad y pago contigo. Una solicitud o una referencia de transferencia por sí solas no confirman la cita. Para consultar o cambiar tu solicitud, escribe a info@mainatural.com."],
    ].map(([question,answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
  </div>;
}
