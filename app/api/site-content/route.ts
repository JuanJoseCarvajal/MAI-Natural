import {NextResponse} from 'next/server';
import {publicSiteContent} from '@/lib/site-content';
export const dynamic='force-dynamic';
export async function GET(){
 const headers={'Cache-Control':'no-store, max-age=0'};
 try{return NextResponse.json({values:await publicSiteContent()},{headers});}
 catch{return NextResponse.json({error:'No se pudo consultar la publicación.'},{status:503,headers});}
}
