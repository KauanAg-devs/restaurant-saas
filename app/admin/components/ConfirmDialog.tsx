"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ConfirmDialog({open,title,description,confirmLabel="Confirmar",cancelLabel="Cancelar",danger=false,busy=false,onConfirm,onCancel}:{open:boolean;title:string;description?:string;confirmLabel?:string;cancelLabel?:string;danger?:boolean;busy?:boolean;onConfirm:()=>void|Promise<void>;onCancel:()=>void}){
 useEffect(()=>{if(!open)return;const key=(e:KeyboardEvent)=>{if(e.key==="Escape"&&!busy)onCancel()};document.addEventListener("keydown",key);return()=>document.removeEventListener("keydown",key)},[open,busy,onCancel]);
 if(!open||typeof document==="undefined")return null;
 return createPortal(<div className="confirm-dialog-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)onCancel()}}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title"><div className={`confirm-dialog-icon ${danger?"danger":""}`} aria-hidden="true">{danger?"!":"?"}</div><div className="confirm-dialog-copy"><h2 id="confirm-dialog-title">{title}</h2>{description?<p>{description}</p>:null}</div><div className="confirm-dialog-actions"><button type="button" className="confirm-dialog-cancel" disabled={busy} onClick={onCancel}>{cancelLabel}</button><button type="button" className={danger?"confirm-dialog-danger":"confirm-dialog-primary"} disabled={busy} onClick={onConfirm}>{busy?"Aguarde…":confirmLabel}</button></div></section></div>,document.body);
}
