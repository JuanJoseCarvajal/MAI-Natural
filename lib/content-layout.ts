import blocks from './content-layout.json';
export const contentBlocks=blocks;
export const contentContinuationKeys=new Set(blocks.flatMap(block=>block.keys.slice(1)));
export function contentLocation(source:string):{title:string;url:string} {
 if(source.includes('home/')||source==='app/(public)/page.tsx')return {title:'Inicio',url:'/'};
 if(source.includes('Consultation'))return {title:'Asesoría · experiencia y preguntas',url:'/services'};
 if(source.includes('Routine'))return {title:'Rutinas',url:'/routines'};
 if(source.includes('ProductsCatalog'))return {title:'Tienda · presentación del catálogo',url:'/products'};
 if(source.includes('Footer'))return {title:'Pie de página · todo el sitio',url:'/'};
 if(/Header|Navigation|AppChrome/.test(source))return {title:'Navegación · todo el sitio',url:'/'};
 if(source.includes('WhatsApp'))return {title:'Contacto por WhatsApp',url:'/'};
 if(source.includes('Cart'))return {title:'Carrito de compras',url:'/products'};
 if(/payments|checkout/.test(source))return {title:'Compra y pago',url:'/checkout'};
 if(source.includes('subscriptions'))return {title:'Suscripciones',url:'/subscriptions'};
 if(source.includes('terms'))return {title:'Términos y condiciones',url:'/terms'};
 if(source.includes('forgot-password'))return {title:'Recuperar contraseña',url:'/forgot-password'};
 if(source.includes('reset-password'))return {title:'Nueva contraseña',url:'/reset-password'};
 if(source.includes('register'))return {title:'Registro',url:'/register'};
 if(source.includes('login'))return {title:'Inicio de sesión',url:'/login'};
 if(source.includes('appointments'))return {title:'Mi cuenta · citas',url:'/account/appointments'};
 if(source.includes('orders'))return {title:'Mi cuenta · pedidos',url:'/account/orders'};
 if(/profile|Profile/.test(source))return {title:'Mi cuenta · perfil',url:'/account/profile'};
 if(/account|dashboard/.test(source))return {title:'Mi cuenta',url:'/account'};
 if(source.includes('Calendar'))return {title:'Calendario de citas',url:'/services'};
 return {title:'Mensajes de la asesoría',url:'/services'};
}

/** Groups source fragments by the page an editor recognizes. */
export function contentPage(source:string):string {
 const location=contentLocation(source);
 if(/AppChrome|Header|Navigation|Footer|WhatsApp/.test(source))return 'Elementos compartidos';
 if(location.url==='/services'||source.includes('/services/'))return 'Asesoría';
 if(source.includes('Cart'))return 'Carrito';
 if(location.url==='/products')return 'Tienda';
 return location.title.split(' · ')[0];
}
