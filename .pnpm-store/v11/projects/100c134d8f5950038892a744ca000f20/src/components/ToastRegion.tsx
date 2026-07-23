'use client';
export type ToastMessage = { id: number; tone?: 'success'|'error'|'info'; text: string };
export function ToastRegion({ messages, onDismiss }: { messages: ToastMessage[]; onDismiss: (id:number)=>void }) { return <div className="toast-region" role="region" aria-label="Notifications" aria-live="polite">{messages.map(message=><div className={`toast-message ${message.tone||'info'}`} role="status" key={message.id}><span>{message.text}</span><button type="button" aria-label="Dismiss notification" onClick={()=>onDismiss(message.id)}>×</button></div>)}</div>; }
