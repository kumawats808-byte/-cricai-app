import {NextResponse} from "next/server";
const API=process.env.CRICAI_API_URL||"https://vacmthkdjgcabxujykvs.supabase.co/functions/v1/cricai-app-api";
export async function POST(req:Request){const body=await req.text();const r=await fetch(`${API}/chat`,{method:"POST",headers:{"content-type":"application/json"},body});const text=await r.text();return new NextResponse(text,{status:r.status,headers:{"content-type":"application/json"}})}
