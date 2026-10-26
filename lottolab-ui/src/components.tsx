"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, Check, ChevronRight, Menu, Shuffle, X } from "lucide-react";
import { Game, PrizeRow } from "./fixtures";

export function DemoLabel({small=false}:{small?:boolean}) {
  return <span className={small?"ll-demo ll-demo-small":"ll-demo"}>Sample data — UI preview</span>;
}
export function NumberBall({value,accent="#F9C818",size="medium",selected=false,muted=false,onClick,label}:{
  value:number|string; accent?:string; size?:"tiny"|"small"|"medium"|"large";
  selected?:boolean; muted?:boolean; onClick?:()=>void; label?:string;
}) {
  const css={"--ball-color":accent} as CSSProperties;
  const inner=<><span className="ll-ball-core"/><strong>{value}</strong>{selected&&<span className="ll-ball-mark"><Check size={9}/></span>}</>;
  const cn="ll-ball ll-ball-"+size+(selected?" is-selected":"")+(muted?" is-muted":"");
  if(onClick) return <button type="button" aria-pressed={selected} aria-label={label||"Number "+value} className={cn+" ll-ball-button"} style={css} onClick={onClick}>{inner}</button>;
  return <span role="img" aria-label={label||"Number "+value} className={cn} style={css}>{inner}</span>;
}
export function PageTitle({title,back,aside}:{title:string;back?:()=>void;aside?:React.ReactNode}) {
  return <header className="ll-titlebar">
    <div className="ll-title-side">{back&&<button type="button" className="ll-icon-button" onClick={back} aria-label="Go back"><ArrowLeft size={21}/></button>}</div>
    <h1>{title}</h1><div className="ll-title-side ll-title-right">{aside}</div>
  </header>;
}
export function Pill({children,onClick,variant="primary",disabled=false}:{
  children:React.ReactNode;onClick:()=>void;variant?:"primary"|"secondary"|"outline";disabled?:boolean;
}) {
  return <button type="button" className={"ll-pill ll-pill-"+variant} onClick={onClick} disabled={disabled}>{children}</button>;
}
export function TicketCard({game,onView,onQuick,onPick,compact=false}:{game:Game;onView:()=>void;onQuick:()=>void;onPick:()=>void;compact?:boolean}) {
  return <article className={"ll-ticket"+(compact?" ll-ticket-compact":"")} style={{"--game-color":game.accent} as CSSProperties}>
    <div className="ll-ticket-header"><div className="ll-game-logo"><span className="ll-game-logo-dot"/> {game.shortName}</div><span className="ll-ticket-tag">Example draw</span></div>
    <div className="ll-ticket-main">
      <div className="ll-kicker">Winning numbers · {game.exampleDate}</div>
      <div className="ll-ball-row ll-winning-row">{game.numbers.map((num,i)=><NumberBall key={i} value={num} accent={game.accent} size="small"/>)}
        {game.special!==undefined&&<div className="ll-special-column"><NumberBall value={game.special} accent="#E7325D" size="small" label={game.specialLabel+" "+game.special}/><span>{game.specialLabel}</span></div>}
      </div>
      {game.bonus!==undefined&&<p className="ll-bonus">Bonus ball <NumberBall value={game.bonus} accent="#9B8CAE" size="tiny" label={"Bonus "+game.bonus}/></p>}
      <button type="button" className="ll-text-link" onClick={onView}>View draw details <ChevronRight size={16}/></button>
    </div>
    <div className="ll-ticket-bottom">
      <div><span className="ll-kicker">Upcoming jackpot · illustration</span><div className="ll-jackpot">{game.jackpot}</div><span className="ll-small-muted">{game.exampleNext}</span></div>
      <div className="ll-ticket-actions">
        <Pill variant="outline" onClick={onQuick}>Quick pick</Pill>
        <Pill onClick={onPick}>Select numbers</Pill>
      </div>
    </div>
  </article>;
}
export function PrizeTable({rows}:{rows:PrizeRow[]}) {
  return <section className="ll-prize">
    <div className="ll-prize-head"><span>Division</span><span>Winners</span><span>Prize each</span></div>
    {rows.map((r,i)=><div className={"ll-prize-row"+(r.state?" ll-prize-"+r.state:"")} key={i}>
      <div className="ll-division-cell"><strong>{r.division}</strong><span>{r.match}</span></div>
      <div className="ll-prize-value" aria-label={"Winners "+r.winners}>{r.winners}</div>
      <div className="ll-prize-value">{r.payout}</div>
    </div>)}
    <p className="ll-table-note">Illustrative divisions and payouts only. A zero count is not missing data.</p>
  </section>;
}
export function FloatingMenu({onClick}:{onClick:()=>void}) {
  return <div className="ll-floating-wrap"><button type="button" className="ll-floating-menu" onClick={onClick} aria-label="Open app menu"><Menu size={23}/><span>Menu</span></button></div>;
}

export type PickerResult={main:number[];special?:number};
export function NumberPicker({game,initial,onClose,onConfirm}:{game:Game;initial?:PickerResult;onClose:()=>void;onConfirm:(r:PickerResult)=>void}) {
  const [main,setMain]=useState<number[]>(initial?.main||[]);
  const [special,setSpecial]=useState<number|undefined>(initial?.special);
  const [pool,setPool]=useState<"main"|"special">("main");
  const [example,setExample]=useState(0);
  const total=game.pick+(game.specialPool?1:0);
  const chosen=main.length+(special===undefined?0:1);
  const valid=main.length===game.pick&&(!game.specialPool||special!==undefined);
  useEffect(()=>{
    const escape=(e:KeyboardEvent)=>{if(e.key==="Escape") onClose()};
    window.addEventListener("keydown",escape);
    return()=>window.removeEventListener("keydown",escape);
  },[onClose]);
  function toggle(n:number) {
    if(pool==="special") {setSpecial(prev=>prev===n?undefined:n);return}
    setMain(prev=>prev.includes(n)?prev.filter(v=>v!==n):prev.length<game.pick?[...prev,n].sort((a,b)=>a-b):prev);
  }
  function useExample() {
    const examples=[[4,12,19,26,34,47],[2,8,15,24,31,42],[1,9,17,28,39,50]];
    const vals=examples[example%examples.length].filter(n=>n<=game.pool).slice(0,game.pick);
    setMain(vals);if(game.specialPool)setSpecial(example%game.specialPool+1);
    setExample(example+1);
  }
  return <div className="ll-modal-scrim" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="ll-picker" role="dialog" aria-modal="true" aria-label={"Choose numbers for "+game.label}>
      <div className="ll-sheet-grip"/><div className="ll-picker-title"><h2>Board A</h2><button type="button" onClick={()=>{setMain([]);setSpecial(undefined)}} className="ll-text-link">Clear</button><button type="button" className="ll-icon-button" aria-label="Close picker" onClick={onClose}><X size={21}/></button></div>
      <div className="ll-picker-info"><strong>{game.label}</strong><span>{chosen} / {total} selected</span></div>
      <div className="ll-pick-tray">
        {Array.from({length:game.pick},(_,i)=>main[i]!==undefined?<NumberBall key={i} value={main[i]} size="small" accent={game.accent} onClick={()=>{setPool("main");setMain(prev=>prev.filter(x=>x!==main[i]))}} label={"Remove selected number "+main[i]}/>:<span className="ll-empty-ball" key={i} aria-label={"Empty slot "+(i+1)}>{i+1}</span>)}
        {game.specialPool&&<div className="ll-tray-special">{special!==undefined?<NumberBall value={special} size="small" accent="#E7325D" onClick={()=>setSpecial(undefined)} label={"Remove special number "+special}/>:<span className="ll-empty-ball ll-empty-special">PB</span>}</div>}
      </div>
      {game.specialPool&&<div className="ll-picker-tabs" role="tablist" aria-label="Number pool">
        <button type="button" role="tab" aria-selected={pool==="main"} className={pool==="main"?"active":""} onClick={()=>setPool("main")}>Main numbers</button>
        <button type="button" role="tab" aria-selected={pool==="special"} className={pool==="special"?"active":""} onClick={()=>setPool("special")}>{game.specialLabel||"Special ball"}</button>
      </div>}
      <p className="ll-picker-hint">{pool==="main"?"Select "+game.pick+" numbers from 1–"+game.pool:"Choose 1 "+(game.specialLabel||"special ball")+" from 1–"+game.specialPool}</p>
      <div className="ll-number-grid">
        {Array.from({length:pool==="special"?(game.specialPool||0):game.pool},(_,i)=>i+1).map(n=>
          <NumberBall key={n} value={n} accent={pool==="special"?"#E7325D":game.accent} size="large" selected={pool==="main"?main.includes(n):special===n} onClick={()=>toggle(n)} muted={pool==="main"&&!main.includes(n)&&main.length===game.pick} />
        )}
      </div>
      <div className="ll-picker-footer"><p>Visual demonstration only. No numbers are saved or submitted.</p>
        <div className="ll-picker-actions"><Pill variant="outline" onClick={useExample}><Shuffle size={16}/> Randomize · sample</Pill><Pill disabled={!valid} onClick={()=>onConfirm({main,special})}>Confirm</Pill></div>
      </div>
    </section>
  </div>;
}
