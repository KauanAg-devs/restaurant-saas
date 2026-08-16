export function clientIp(req:any){
  const vercel=String(req.headers?.['x-vercel-forwarded-for']||'').trim();
  if(vercel)return vercel.split(',')[0].trim();
  const forwarded=String(req.headers?.['x-forwarded-for']||'').split(',')[0].trim();
  return forwarded||String(req.headers?.['x-real-ip']||'').trim()||req.ip||req.socket?.remoteAddress||'unknown';
}
