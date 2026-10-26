"use client";
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  Bell, CalendarDays, ChevronRight, CircleHelp, FlaskConical, Home,
  Info, ListChecks, RefreshCw, Settings, TicketCheck, WandSparkles,
  BarChart3, Calculator, Clock3, FileText, X, Layers3, Search
} from "lucide-react";
import { games, menuDestinations, prizeRows, toolShortcuts } from "./fixtures";
import type { Game, GameId } from "./fixtures";
import {
  DemoLabel, FloatingMenu, NumberBall, NumberPicker, PageTitle,
  Pill, PrizeTable, TicketCard
} from "./components";
import type { PickerResult } from "./components";

type View = "home"|"games"|"overview"|"draw"|"lab"|"gallery"|"placeholder";
type GalleryTab = "ticket"|"picker"|"prize";
const menuIcons = [Home,FlaskConical,Clock3,TicketCheck,Layers3,CalendarDays,Bell,CircleHelp,Settings,Info];
const future: Record<string,string> = {
  results:"Sprint 3 will add game, era and date filters and complete draw history.",
  check:"Sprint 5 will add number-check entry and comparison screens.",
  boards:"Sprint 4 will add saved board lists, details and editing.",
  calendar:"Sprint 10 will add the draw calendar.",
  notifications:"Sprint 10 will add notifications and preferences.",
  help:"Sprint 10 will add illustrated guides using these UI components.",
  settings:"Sprint 10 will add settings and data availability.",
  about:"Sprint 10 will add app identity, sources and help.",
};
export default function LottoLabPreview({startInGallery=false}:{startInGallery?:boolean}) {
  const [view,setView] = useState<View>(startInGallery?"gallery":"home");
  const [trail,setTrail] = useState<View[]>([]);
  const [gameId,setGameId] = useState<GameId>("lotto");
  const [menuOpen,setMenuOpen] = useState(false);
  const [pickerOpen,setPickerOpen] = useState(false);
  const [picked,setPicked] = useState<PickerResult|undefined>(undefined);
  const [galleryTab,setGalleryTab] = useState<GalleryTab>("ticket");
  const [destination,setDestination] = useState("results");
  const [notice,setNotice] = useState("");
  const game:Game = games.find(g=>g.id===gameId)||games[0];
  const navigate=(to:View)=>{setTrail(p=>[...p,view]);setView(to);setMenuOpen(false);setNotice("");window.scrollTo({top:0,behavior:"instant"})};
  const back=()=>{setTrail(p=>{const copy=[...p];const last=copy.pop();setView(last||"home");return copy});setNotice("")};
  const showGame=(g:Game)=>{setGameId(g.id);navigate("overview")};
  const showDraw=(g:Game)=>{setGameId(g.id);navigate("draw")};
  const pickerFor=(g:Game)=>{setGameId(g.id);setPicked(undefined);setPickerOpen(true);setMenuOpen(false)};
  const onPickerClose=useCallback(()=>setPickerOpen(false),[]);
  function menuSelect(id:string) {
    setMenuOpen(false);
    if(id==="home"){navigate("home");return}
    if(id==="lab"){navigate("lab");return}
    setDestination(id);navigate("placeholder");
  }
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==="Escape"&&menuOpen){setMenuOpen(false)}
    };
    window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
  },[menuOpen]);
  function home() {
    return <>
      <div className="ll-home-head"><div className="ll-brand" aria-label="LottoLab">Lotto<em>Lab</em></div>
        <div className="ll-head-actions">
          <button className="ll-icon-button" type="button" aria-label="Refresh preview" onClick={()=>setNotice("UI preview: updating results is not connected.")}><RefreshCw size={21}/></button>
          <button className="ll-icon-button" type="button" aria-label="Notifications" onClick={()=>menuSelect("notifications")}><Bell size={21}/></button>
        </div>
      </div>
      <div className="ll-meta-strip"><span>Monday, 26 October 2026</span><DemoLabel small/></div>
      {notice&&<div role="status" className="ll-muted-section" style={{marginTop:-9,padding:12}}>{notice}</div>}
      <div className="ll-home-shortcuts">
        <button type="button" className="ll-shortcut" onClick={()=>menuSelect("check")}><span className="ll-shortcut-circle"><TicketCheck size={27}/></span>Check</button>
        <button type="button" className="ll-shortcut" onClick={()=>pickerFor(games[0])}><span className="ll-shortcut-circle"><WandSparkles size={27}/></span>Generate</button>
        <button type="button" className="ll-shortcut" onClick={()=>navigate("lab")}><span className="ll-shortcut-circle"><FlaskConical size={27}/></span>LottoLab</button>
      </div>
      <h2 className="ll-section-title">Latest results <DemoLabel small/></h2>
      {games.map(g=><TicketCard key={g.id} game={g} onView={()=>showDraw(g)} onQuick={()=>pickerFor(g)} onPick={()=>pickerFor(g)}/>)}
      <button type="button" className="ll-card ll-cta-card ll-card-row" onClick={()=>menuSelect("check")}><span className="ll-cta-icon"><TicketCheck size={24}/></span><span style={{flex:1}}><h3>Check my numbers</h3><p>Compare your board with a draw</p></span><ChevronRight size={20}/></button>
      <button type="button" className="ll-card ll-cta-card ll-card-row" onClick={()=>menuSelect("boards")}><span className="ll-cta-icon"><Layers3 size={24}/></span><span style={{flex:1}}><h3>My boards</h3><p>Keep your selected numbers together</p></span><ChevronRight size={20}/></button>
      <button type="button" className="ll-card ll-cta-card ll-card-row" onClick={()=>navigate("lab")}><span className="ll-cta-icon"><FlaskConical size={24}/></span><span style={{flex:1}}><h3>LottoLab</h3><p>Research and plan your numbers</p></span><ChevronRight size={20}/></button>
      <div className="ll-footer-link"><button type="button" className="ll-text-link" onClick={()=>navigate("games")}>Browse all games <ChevronRight size={16}/></button></div>
    </>;
  }
  function prize() {
    return <>
      <div className="ll-detail-band" style={{background:game.accent} as CSSProperties}>
        <h2>{game.label}</h2><p>Example result · {game.exampleDate}</p>
      </div>
      <section className="ll-detail-white">
        <div className="ll-kicker">Winning numbers</div>
        <div className="ll-ball-row">{game.numbers.map((n,i)=><NumberBall key={i} value={n} accent={game.accent} size="small"/>)}
          {game.special!==undefined&&<NumberBall value={game.special} accent="#E7325D" size="small" label={"PowerBall "+game.special}/>}
        </div>
        {game.bonus!==undefined&&<p className="ll-bonus">Bonus ball <NumberBall value={game.bonus} accent="#9B8CAE" size="tiny"/></p>}
        <hr className="ll-divider"/>
        <div className="ll-info-row"><span>Draw date</span><strong>{game.exampleDate} (example)</strong></div>
        <div className="ll-info-row"><span>Draw reference</span><strong>DEMO-001</strong></div>
        <div className="ll-info-row"><span>Source status</span><strong>Illustrative · not verified</strong></div>
      </section>
      <div className="ll-card" style={{marginBottom:10}}><div className="ll-card-row"><strong>Prize breakdown</strong><DemoLabel small/></div><PrizeTable rows={prizeRows}/></div>
      <p className="ll-subheading">The division structure above is a layout example, not the payout rules for a selected game.</p>
      <Pill onClick={()=>menuSelect("check")}>Check my numbers</Pill>
    </>;
  }
  function lab() {
    return <>
      <PageTitle title="LottoLab" back={back} aside={<button className="ll-icon-button" type="button" aria-label="Help" onClick={()=>menuSelect("help")}><CircleHelp size={20}/></button>}/>
      <div className="ll-meta-strip"><span>Research and plan your numbers</span><DemoLabel small/></div>
      <div className="ll-card" style={{marginBottom:15}}><div className="ll-kicker">Game</div><select aria-label="Select game" value={gameId} onChange={e=>setGameId(e.target.value as GameId)} style={{width:"100%",height:48,background:"#f5f8f9",border:"1px solid #cbd9dd",borderRadius:10,marginTop:5,padding:"0 12px",color:"#2D2D38",fontSize:15}}>{games.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select><p className="ll-subheading">Current format · provisional demonstration rules</p></div>
      <h2 className="ll-section-title">Popular tools</h2>
      {toolShortcuts.map((t,i)=>{const Icon=[BarChart3,Search,WandSparkles,Calculator][i];return <div className="ll-tool-highlight" key={t.id}>
        <button type="button" onClick={()=>{setDestination(t.title);navigate("placeholder")}}>
          <span className="ll-tool-icon"><Icon size={21}/></span>
          <span style={{flex:1}}><h3>{t.title}</h3><p>{t.description}</p></span><ChevronRight size={19}/>
        </button>
      </div>})}
      <div className="ll-muted-section"><h3>Coming in UI Sprints 6–9</h3><p>All 17 research tools receive dedicated input, result, help, validation and empty-state layouts. No formulas or searches run in this preview.</p></div>
    </>;
  }
  function gallery() {
    return <>
      <PageTitle title="UI gallery" back={back}/>
      <div className="ll-meta-strip"><span>Development-only · Sprint 1 fidelity anchors</span></div>
      <div className="ll-gallery-tabs" role="tablist" aria-label="Select component anchor">
        {([["ticket","Game card"],["picker","Number picker"],["prize","Prize table"]] as const).map(([id,label])=><button type="button" role="tab" aria-selected={galleryTab===id} className={"ll-gallery-tab"+(galleryTab===id?" active":"")} key={id} onClick={()=>setGalleryTab(id)}>{label}</button>)}
      </div>
      {galleryTab==="ticket"&&<><h2 className="ll-gallery-title">Ticket-style game card</h2><p className="ll-gallery-note">Reference family 3391–3392: perforation, cutouts, latest balls, jackpot, dual pill actions.</p><TicketCard game={game} onView={()=>navigate("draw")} onQuick={()=>pickerFor(game)} onPick={()=>pickerFor(game)}/>
        <Pill variant="outline" onClick={()=>setGameId(games[(games.findIndex(g=>g.id===gameId)+1)%games.length].id)}>Preview another game</Pill></>}
      {galleryTab==="picker"&&<><h2 className="ll-gallery-title">Number-selection sheet</h2><p className="ll-gallery-note">Reference family 3397: rounded sheet, tray, six-column grid, Clear and Confirm.</p><div className="ll-muted-section"><h3>{game.label} · Board A</h3><p>View the interactive picker, including selected, clear, disabled and special-pool states.</p><div style={{marginTop:16}}><Pill onClick={()=>pickerFor(game)}>Open number picker</Pill></div></div>
        <Pill variant="outline" onClick={()=>setGameId(gameId==="powerball"?"daily":"powerball")}>Switch to {gameId==="powerball"?"Daily Lotto":"PowerBall"}</Pill></>}
      {galleryTab==="prize"&&<><h2 className="ll-gallery-title">Prize breakdown</h2><p className="ll-gallery-note">Reference family 3395–3396: coloured game band, winning balls and stacked division rows.</p>{prize()}</>}
    </>;
  }
  function placeholder() {
    const current=menuDestinations.find(x=>x.id===destination);
    const title=current?.label||destination;
    return <>
      <PageTitle title={title} back={back}/>
      <div className="ll-meta-strip"><span>Upcoming screen · navigable UI shell</span><DemoLabel small/></div>
      <div className="ll-muted-section">
        <h3>{title}</h3><p>{future[destination]||"This tool input and sample result screen will be designed during the dedicated LottoLab tool sprint."}</p>
      </div>
      {(destination==="check"||destination==="boards")&&<Pill onClick={()=>pickerFor(game)}>Preview number selection</Pill>}
      {(destination==="results"||destination==="check")&&<div style={{marginTop:12}}><Pill variant="outline" onClick={()=>navigate("games")}>Browse game cards</Pill></div>}
    </>;
  }
  return <div className="ll-preview">
    {view==="home"&&home()}
    {view==="games"&&<><PageTitle title="Games" back={back}/><p className="ll-subheading">Current games · provisional format · sample data</p>{games.map(g=><TicketCard key={g.id} game={g} onView={()=>showGame(g)} onQuick={()=>pickerFor(g)} onPick={()=>pickerFor(g)}/>)}</>}
    {view==="overview"&&<><PageTitle title={game.label} back={back}/><DemoLabel/><div style={{height:14}}/><TicketCard game={game} onView={()=>navigate("draw")} onQuick={()=>pickerFor(game)} onPick={()=>pickerFor(game)}/><div className="ll-list-group"><button className="ll-list-row" type="button" onClick={()=>navigate("draw")}><span><strong>Draw details</strong><span>Winning balls and prize example</span></span><ChevronRight size={18}/></button><button className="ll-list-row" type="button" onClick={()=>menuSelect("results")}><span><strong>Results history</strong><span>Archives and date filters · Sprint 3</span></span><ChevronRight size={18}/></button></div></>}
    {view==="draw"&&<><PageTitle title="Draw details" back={back}/><DemoLabel/><div style={{height:14}}/>{prize()}</>}
    {view==="lab"&&lab()}
    {view==="gallery"&&gallery()}
    {view==="placeholder"&&placeholder()}
    {(view==="home"||view==="games"||view==="overview"||view==="draw"||view==="lab"||view==="placeholder")&&!pickerOpen&&!menuOpen&&<FloatingMenu onClick={()=>setMenuOpen(true)}/>}
    {menuOpen&&<div className="ll-nav-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setMenuOpen(false)}}>
      <nav className="ll-menu-sheet" aria-label="LottoLab main menu">
        <div className="ll-sheet-grip"/><div className="ll-menu-hd"><h2>Menu</h2><button type="button" className="ll-icon-button" onClick={()=>setMenuOpen(false)} aria-label="Close menu"><X size={21}/></button></div>
        {menuDestinations.map((m,i)=>{const Icon=menuIcons[i];return <button type="button" key={m.id} className={"ll-menu-row"+((view===m.id)?" active":"")} onClick={()=>menuSelect(m.id)}><Icon size={20}/><span>{m.label}</span><ChevronRight size={18}/></button>})}
        
      </nav>
    </div>}
    {pickerOpen&&<NumberPicker game={game} initial={picked} onClose={onPickerClose} onConfirm={(value)=>{setPicked(value);setPickerOpen(false);setNotice("Board selected for this UI preview only: "+value.main.join(", ")+(value.special?" + "+value.special:"")+". Not saved.");}}/>}
  </div>;
}
