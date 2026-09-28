'use client';
export default function GlobalError({reset}:{reset:()=>void}) {
 return <html lang="es"><body style={{fontFamily:'system-ui',padding:'2rem',maxWidth:640,margin:'auto'}}><main role="alert"><h1>No pudimos cargar el contenido actualizado</h1><p>Estamos teniendo problemas para consultar la información. Vuelve a intentarlo en un momento.</p><button onClick={reset} style={{padding:'12px 24px',cursor:'pointer'}}>Volver a intentar</button></main></body></html>;
}
