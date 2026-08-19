import {NextResponse} from "next/server";
const API=process.env.CRICAI_API_URL||"https://vacmthkdjgcabxujykvs.supabase.co/functions/v1/cricai-app-api";
export async function GET(req:Request,{params}:{params:{id:string}}){const r=await fetch(`${API}/match/${encodeURIComponent(params.id)}`,{cache:"no-store"});const text=await r.text();return new NextResponse(text,{status:r.status,headers:{"content-type":"application/json","cache-control":"no-store"}})}
