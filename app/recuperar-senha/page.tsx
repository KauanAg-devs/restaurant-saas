'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function PasswordRecoveryPage(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [token,setToken]=useState('');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    const hash=new URLSearchParams(location.hash.replace(/^#/,''));
    const access=hash.get('access_token')||'';
    if(access)setToken(access);
  },[]);

  async function requestReset(e:React.FormEvent){
    e.preventDefault();setBusy(true);setError('');setMessage('');
    try{
      const redirectTo=`${location.origin}/recuperar-senha`;
      const r:any=await api('password-reset',{method:'POST',body:JSON.stringify({email,redirect_to:redirectTo})});
      setMessage(r.message||'Confira seu e-mail para continuar.');
    }catch(e:any){setError(e.message)}finally{setBusy(false)}
  }

  async function updatePassword(e:React.FormEvent){
    e.preventDefault();setError('');setMessage('');
    if(password.length<6)return setError('A senha deve ter pelo menos 6 caracteres.');
    if(password!==confirm)return setError('As senhas não coincidem.');
    try{
      setBusy(true);
      await api('password-update',{method:'POST',headers:{authorization:`Bearer ${token}`},body:JSON.stringify({password})});
      setMessage('Senha atualizada. Você já pode entrar no painel.');
      history.replaceState(null,'',location.pathname);
      setToken('');setPassword('');setConfirm('');
    }catch(e:any){setError(e.message)}finally{setBusy(false)}
  }

  return <main className="admin-login"><section><span className="eyebrow">MESAFLOW · CONTA</span><h1>Recupere seu acesso.</h1><p>Use o e-mail da sua conta para receber um link seguro de redefinição.</p></section>{token?<form onSubmit={updatePassword}><div className="admin-mark">M</div><span className="muted-caps">NOVA SENHA</span><h2>Defina uma nova senha</h2><label>Nova senha<input type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required/></label><label>Confirmar senha<input type="password" minLength={6} value={confirm} onChange={e=>setConfirm(e.target.value)} required/></label><button className="button button-dark" disabled={busy}>{busy?'Salvando…':'Salvar nova senha'}</button>{message?<small>{message}</small>:null}{error?<small className="form-error">{error}</small>:null}<a href="/admin">Voltar ao login</a></form>:<form onSubmit={requestReset}><div className="admin-mark">M</div><span className="muted-caps">RECUPERAÇÃO</span><h2>Esqueceu a senha?</h2><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><button className="button button-dark" disabled={busy}>{busy?'Enviando…':'Enviar link de recuperação'}</button>{message?<small>{message}</small>:null}{error?<small className="form-error">{error}</small>:null}<a href="/admin">Voltar ao login</a></form>}</main>;
}
