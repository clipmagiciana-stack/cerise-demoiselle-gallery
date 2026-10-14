import { env } from 'cloudflare:workers';
import { adminSession, passwordMatches, hash, sessionCookie } from '../../admin-auth';
import seed from '../../seed.json';
import legacyDescriptions from '../../legacy-descriptions.json';
export const dynamic='force-dynamic';
const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function owner(request:Request){if(request.method!=='GET'&&new URL(request.url).origin!==request.headers.get('origin'))return false;return adminSession(request);}
export async function GET(request:Request){
 const path=new URL(request.url).pathname;
 if(path==='/api/admin/session')return await owner(request)?json({ok:true}):json({error:'Please sign in.'},401);
 if(path==='/api/products'){
 const rows=await env.DB.prepare('SELECT id,data,deleted FROM product_records').all();
 const data=new Map<string,any>(seed.map((p:any)=>[String(p.id),{...p,id:String(p.id),stock:null,status:'on-order'}]));
 for(const r of rows.results as any[]){if(r.deleted)data.delete(r.id);else {const record=JSON.parse(r.data);const base=seed.find(p=>String(p.id)===r.id);if(base&&record.description===(legacyDescriptions as Record<string,string>)[r.id])record.description=base.description;data.set(r.id,record);}}
 return json([...data.values()]);
 }
 if(path.startsWith('/api/images/')){
 const key=path.slice('/api/images/'.length);if(!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(key))return json({error:'Not found'},404);
 const obj=await env.BUCKET.get(key);if(!obj)return json({error:'Not found'},404);
 return new Response(obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'image/jpeg','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'}});
 }
 return json({error:'Not found'},404);
}
export async function POST(request:Request){
 const path=new URL(request.url).pathname;
 if(path==='/api/admin/login'){
 if(new URL(request.url).origin!==request.headers.get('origin'))return json({error:'Forbidden'},403);
 const ip=request.headers.get('cf-connecting-ip')||'unknown';const bucket='login:'+await hash(ip)+':'+Math.floor(Date.now()/900000);
 await env.DB.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=CAST(value AS INTEGER)+1').bind(bucket,'1').run();
 const attempts=await env.DB.prepare('SELECT value FROM settings WHERE key=?').bind(bucket).first<{value:string}>();if(Number(attempts?.value)>10)return json({error:'Too many attempts. Try again in 15 minutes.'},429);
 let credentials:any;try{credentials=await request.json()}catch{return json({error:'Invalid request'},400)}
 const config=env as unknown as Record<string,string>;
 if(!credentials||typeof credentials!=='object'||typeof credentials.password!=='string'||credentials.password.length>200||credentials.username!==config.ADMIN_USERNAME||!await passwordMatches(credentials.password))return json({error:'Incorrect username or password.'},401);
 const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');await env.DB.prepare('INSERT INTO settings (key,value) VALUES (?,?)').bind('session:'+await hash(token),String(Date.now()+28800000)).run();
 return Response.json({ok:true},{headers:{'Set-Cookie':sessionCookie(token),'Cache-Control':'no-store'}});
 }
 if(path==='/api/admin/logout'){
 if(!await owner(request))return json({error:'Please sign in.'},401);
 const token=request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-cerise-admin=([a-f0-9]{64})(?:;|$)/)?.[1];if(token)await env.DB.prepare('DELETE FROM settings WHERE key=?').bind('session:'+await hash(token)).run();
 return Response.json({ok:true},{headers:{'Set-Cookie':sessionCookie('',0),'Cache-Control':'no-store'}});
 }
 if(!await owner(request))return json({error:'Owner access required'},403);
 if(path==='/api/admin/upload'){
 const f=await request.formData(),file=f.get('image');
 if(!(file instanceof File)||file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))return json({error:'Upload JPG, PNG or WebP up to 5 MB.'},400);
 const b=new Uint8Array(await file.arrayBuffer());const jpg=b[0]===255&&b[1]===216&&b[2]===255,png=b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71,webp=new TextDecoder().decode(b.slice(0,4))==='RIFF'&&new TextDecoder().decode(b.slice(8,12))==='WEBP';
 if(!(jpg||png||webp))return json({error:'Invalid image file.'},400);
 const key=crypto.randomUUID()+'.'+(jpg?'jpg':png?'png':'webp');await env.BUCKET.put(key,b,{httpMetadata:{contentType:jpg?'image/jpeg':png?'image/png':'image/webp'}});return json({image:'/api/images/'+key});
 }
 if(path==='/api/admin/products'){
 let p:any;try{p=await request.json()}catch{return json({error:'Invalid JSON'},400)}
 if(!p||typeof p!=='object'||Array.isArray(p)||typeof p.name!=='string'||!p.name.trim()||p.name.length>200||typeof p.description!=='string'||p.description.length>4000||typeof p.price!=='number'||!Number.isFinite(p.price)||p.price<0||!Number.isSafeInteger(Math.round(p.price*100))||!['on-order','in-stock','out-of-stock'].includes(p.status)||!(p.stock===null||Number.isSafeInteger(p.stock)&&p.stock>=0)||typeof p.image!=='string'||!(/^(assets\/product-\d+\.jpg|\/api\/images\/[a-f0-9-]+\.(jpg|png|webp))$/.test(p.image)))return json({error:'Check product name, description, photo, price and stock.'},400);
 const id=typeof p.id==='string'&&/^[\w-]{1,80}$/.test(p.id)?p.id:crypto.randomUUID();
 const record={id,name:p.name.trim(),description:p.description.trim(),reference:typeof p.reference==='string'?p.reference.slice(0,1000):'',price:p.price,image:p.image,status:p.stock===0?'out-of-stock':p.status,stock:p.status==='out-of-stock'?0:p.stock};
 await env.DB.prepare('INSERT INTO product_records (id,data,deleted) VALUES (?,?,0) ON CONFLICT(id) DO UPDATE SET data=excluded.data,deleted=0').bind(id,JSON.stringify(record)).run();return json(record);
 }
 return json({error:'Not found'},404);
}
export async function DELETE(request:Request){
 if(!await owner(request))return json({error:'Owner access required'},403);
 const url=new URL(request.url),id=url.searchParams.get('id');
 if(url.pathname!=='/api/admin/products'||!id||!/^[\w-]{1,80}$/.test(id))return json({error:'Invalid product'},400);
 await env.DB.prepare('INSERT INTO product_records (id,data,deleted) VALUES (?, ?,1) ON CONFLICT(id) DO UPDATE SET deleted=1').bind(id,'{}').run();return json({ok:true});
}
