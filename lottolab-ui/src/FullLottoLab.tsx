"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {
  ArrowLeft,BarChart3,Bell,BookOpen,CalendarDays,Check,ChevronDown,ChevronRight,
  Clock3,Download,FlaskConical,HelpCircle,Home,Info,Layers3,Menu,
  Plus,RefreshCw,Search,Settings,ShieldCheck,SlidersHorizontal,
  Sparkles,TicketCheck,Trash2,TriangleAlert,WandSparkles,X
} from "lucide-react";
import {DemoLabel,FloatingMenu,NumberBall,PageTitle,Pill,PrizeTable,TicketCard} from "./components";
import {Game,GameId,games,prizeRows} from "./fixtures";
import {
  coreRouteInventory,coreStates,exampleHistory,globalMenu,initialBoards,
  MockBoard,retiredRuleLabel,ruleLabel,sampleCalendar,sampleGenerated,
  ScreenId,screenTitles,StateExample,ToolId,tools,whyDemo
} from "./design-data";
import {ToolScreen} from "./ToolScreen";
import "./full.css";

type Route=ScreenId|"LAB"|"GALLERY";
type Sheet="C02"|"C12"|"C23"|"C24"|"C25"|"C26"|null;
type PickerMode="board"|"subset"|"wheel";
type PickerTarget="board"|"check"|"tool";
const isTool=(s:Route):s is ToolId=>/^T\d\d$/.test(s);
const gameName=(id:GameId)=>games.find(g=>g.id===id)?.label||"Lotto";
const shortText=(text:string,max=35)=>text.length>max?text.slice(0,max)+"…":text;
const days=["S","M","T","W","T","F","S"];
const menuIcons=[Home,FlaskConical,Clock3,TicketCheck,Layers3,CalendarDays,Bell,BookOpen,Settings,Info];
function RowLink({title,sub,right,onClick,icon}:{title:string;sub?:string;right?:string;onClick:()=>void;icon?:React.ReactNode}){
  return <button type="button" className="ll-entry" onClick={onClick}><span className="ll-entry-leading">{icon}</span><span className="ll-flex1"><strong>{title}</strong>{sub&&<small>{sub}</small>}</span><span className="ll-entry-side">{right}<ChevronRight size={17}/></span></button>;
}
function InfoPair({label,value}:{label:string;value:string}){return <div className="ll-info-row"><span>{label}</span><strong>{value}</strong></div>;}
function BoardBalls({numbers,game,special,size="small"}:{numbers:number[];game:Game;special?:number;size?:"small"|"tiny"|"medium"}){
  return <div className="ll-ball-row ll-board-strip">{numbers.map((n,i)=><NumberBall key={i} value={n} accent={game.accent} size={size}/>)}
    {special!==undefined&&<NumberBall value={special} accent="#E7325D" size={size} label={"Special ball "+special}/>}</div>;
}
function StatusCard({kind}:{kind:StateExample}){
  const details:Record<StateExample,{heading:string;message:string}> ={
  populated:{heading:"Example data displayed",message:"Everything below is invented for the design."},
  empty:{heading:"No saved information",message:"Add your first board or clear the demonstration filter."},
  loading:{heading:"Loading appearance",message:"A loading state design; no network request is running."},
  "offline-cached":{heading:"Offline · saved sample visible",message:"Cached UI example; last retrieved source unknown."},
  "offline-empty":{heading:"Offline · nothing stored",message:"No draw information is available without a verified source."},
  stale:{heading:"Previously loaded result",message:"Illustrative stale-data warning. Never show this as a current result."},
  missing:{heading:"Information unavailable",message:"Missing data is not equivalent to a zero result."},
  invalid:{heading:"Review your selection",message:"Some example input is invalid for the chosen game or rule version."},
  pending:{heading:"Payouts pending",message:"Prize amounts may be published after draw numbers."},
  "no-match":{heading:"No matching draw in example",message:"Zero matching results in this illustrative filter; no real search was performed."},
  };
  const d=details[kind];
  return <div className={"ll-status-card ll-state-"+kind} role="status"><Info size={18}/><span><strong>{d.heading}</strong><small>{d.message}</small></span></div>;
}
export default function FullLottoLab({startInGallery=false}:{startInGallery?:boolean}) {
  const [view,setView]=useState<Route>(startInGallery?"GALLERY":"C01");
  const [stack,setStack]=useState<{screen:Route;offset:number}[]>([]);
  const [sheet,setSheet]=useState<Sheet>(null);
  const [gameId,setGameId]=useState<GameId>("lotto");
  const [era,setEra]=useState(ruleLabel);
  const [range,setRange]=useState("Last 100 eligible draws");
  const [boards,setBoards]=useState<MockBoard[]>(initialBoards);
  const [boardId,setBoardId]=useState("A");
  const [name,setName]=useState("My selected numbers");
  const [notes,setNotes]=useState("");
  const [pickerMode,setPickerMode]=useState<PickerMode>("board");
  const [pickerTarget,setPickerTarget]=useState<PickerTarget>("board");
  const [selected,setSelected]=useState<number[]>([]);
  const [special,setSpecial]=useState<number|undefined>();
  const [pool,setPool]=useState<"main"|"special">("main");
  const [toolNumbers,setToolNumbers]=useState<number[]>([]);
  const [drawFilter,setDrawFilter]=useState("All games");
  const [search,setSearch]=useState("");
  const [monthOffset,setMonthOffset]=useState(0);
  const [quickCount,setQuickCount]=useState(3);
  const [selectedTab,setSelectedTab]=useState("Popular");
  const [stateOverride,setStateOverride]=useState<StateExample>("populated");
  const [savedPreview,setSavedPreview]=useState(false);
  const [pref,setPref]=useState({results:true,reminders:false,wifiOnly:true,largeText:false});
  const [confirmAction,setConfirmAction]=useState<"discard"|"delete">("discard");
  const [returnRoute,setReturnRoute]=useState<Route>("C09");
  const [menuScroll,setMenuScroll]=useState(0);
  const scrollRef=useRef<{screen:Route;offset:number}[]>([]);
  const game=games.find(g=>g.id===gameId)||games[0];
  const activeBoard=boards.find(b=>b.id===boardId)||boards[0];
  const activeGame=games.find(g=>g.id===activeBoard?.gameId)||game;
  const next=useCallback((s:Route)=>{
    if(s==="C02"||s==="C12"||s==="C23"||s==="C24"||s==="C25"||s==="C26"){setSheet(s);return;}
    setStack(h=>[...h,{screen:view,offset:window.scrollY}]);
    setView(s);setSheet(null);setSavedPreview(false);
    window.scrollTo({top:0,behavior:"instant"});
  },[view]);
  const back=useCallback(()=>{
    if(sheet){setSheet(null);return;}
    if(stack.length){const item=stack[stack.length-1];setStack(h=>h.slice(0,-1));setView(item.screen);
      requestAnimationFrame(()=>window.scrollTo({top:item.offset,behavior:"instant"}));
    }else if(view!=="C01"){setView("C01");window.scrollTo(0,0);}
  },[sheet,stack,view]);
  useEffect(()=>{
    function onKey(e:KeyboardEvent){if(e.key==="Escape")back();}
    function onNativeBack(){back();}
    window.addEventListener("keydown",onKey);window.addEventListener("lottolab-back",onNativeBack);
    return()=>{window.removeEventListener("keydown",onKey);window.removeEventListener("lottolab-back",onNativeBack);};
  },[back]);
  function selectGame(id:GameId){setGameId(id);setSelected([]);setSpecial(undefined);setPool("main");}
  function openPicker(mode:PickerMode="board",target:PickerTarget="board",start?:number[],specialStart?:number){
    setPickerMode(mode);setPickerTarget(target);setSelected(start||[]);setSpecial(specialStart);
    setPool("main");setSheet("C12");
  }
  function useExamplePicker(){
    let list=game.numbers.slice(0,game.pick);
    if(pickerMode==="subset")list=[game.numbers[0],game.numbers[1]];
    if(pickerMode==="wheel")list=Array.from({length:Math.min(game.pick+2,game.pool)},(_,i)=>i+1);
    setSelected(list);setSpecial(game.specialPool?game.special:undefined);
  }
  function confirmPicker(){
    if(pickerTarget==="tool")setToolNumbers([...selected]);
    if(pickerTarget==="board"||pickerTarget==="check"){setSelected([...selected]);}
    setSheet(null);
  }
  function selectBoard(b:MockBoard){setBoardId(b.id);setGameId(b.gameId);next("C10");}
  function navMenu(s:ScreenId){setSheet(null);if(s==="T01"){next("LAB");return;}next(s);}
  function openSave(returnTo:Route=view){setReturnRoute(returnTo);setName("My selected numbers");setSavedPreview(false);setSheet("C25");}
  function saveSession(){
    const item:MockBoard={id:"D"+String(boards.length+1),name:name.trim()||"Untitled board",gameId,main:selected.length===game.pick?selected:game.numbers,special:game.specialPool?(special||game.special):undefined,note:notes||"UI preview only — resets when reopened.",label:"Example board"};
    setBoards(b=>[...b,item]);setBoardId(item.id);setSavedPreview(true);
  }
  const demoFallback=stateOverride==="empty"||stateOverride==="offline-empty"||stateOverride==="missing"||stateOverride==="no-match";
  const section=(heading:string,caption?:string)=><div className="ll-section-head"><h2>{heading}</h2>{caption&&<small>{caption}</small>}</div>;
  function home(){
    return <>
      <div className="ll-home-head"><div className="ll-brand">Lotto<em>Lab</em></div><div className="ll-head-actions">
        <button type="button" className="ll-icon-button" onClick={()=>next("C21")} aria-label="Data status and update"><RefreshCw size={21}/></button>
        <button type="button" className="ll-icon-button" onClick={()=>next("C16")} aria-label="Notifications"><Bell size={21}/></button>
      </div></div>
      <div className="ll-meta-strip"><span>Monday, 26 October 2026 · no live sync</span><DemoLabel small/></div>
      <div className="ll-home-shortcuts">
        <button type="button" className="ll-shortcut" onClick={()=>next("C07")}><span className="ll-shortcut-circle"><TicketCheck size={27}/></span>Check</button>
        <button type="button" className="ll-shortcut" onClick={()=>next("C13")}><span className="ll-shortcut-circle"><WandSparkles size={27}/></span>Generate</button>
        <button type="button" className="ll-shortcut" onClick={()=>next("LAB")}><span className="ll-shortcut-circle"><FlaskConical size={27}/></span>LottoLab</button>
      </div>
      {stateOverride!=="populated"&&<StatusCard kind={stateOverride}/>}
      {section("Latest results","Examples only")}
      {!demoFallback&&games.map(g=><TicketCard key={g.id} game={g} onView={()=>{selectGame(g.id);next("C06")}} onQuick={()=>{selectGame(g.id);next("C13")}} onPick={()=>{selectGame(g.id);next("C11")}}/>)}
      {demoFallback&&<div className="ll-empty-state"><Search size={28}/><h3>Draw results unavailable</h3><p>The app needs verified draw data in its later functionality phase.</p><Pill variant="outline" onClick={()=>setStateOverride("populated")}>Preview example results</Pill></div>}
      <button type="button" className="ll-card ll-cta-card ll-card-row" onClick={()=>next("C07")}><span className="ll-cta-icon"><TicketCheck size={23}/></span><span className="ll-flex1"><h3>Check my numbers</h3><p>Compare a board with a draw</p></span><ChevronRight size={19}/></button>
      <button type="button" className="ll-card ll-cta-card ll-card-row" onClick={()=>next("C09")}><span className="ll-cta-icon"><Layers3 size={23}/></span><span className="ll-flex1"><h3>My boards</h3><p>Keep your example number lines together</p></span><ChevronRight size={19}/></button>
      <button type="button" className="ll-card ll-cta-card ll-card-row" onClick={()=>next("LAB")}><span className="ll-cta-icon"><FlaskConical size={23}/></span><span className="ll-flex1"><h3>LottoLab</h3><p>Research and plan numbers</p></span><ChevronRight size={19}/></button>
      <button type="button" className="ll-text-link ll-bottom-link" onClick={()=>next("C03")}>Browse all games <ChevronRight size={16}/></button>
    </>;
  }
  function catalogue(){
    return <>{section("Choose a game","Provisional rules")}
      <p className="ll-subheading">All information here is sample data. Select a game to open its overview.</p>
      {games.map(g=><TicketCard key={g.id} game={g} compact onView={()=>{selectGame(g.id);next("C04")}} onQuick={()=>{selectGame(g.id);next("C13")}} onPick={()=>{selectGame(g.id);next("C11")}}/>)}
      <RowLink title="Retired game formats" sub="Separate historical rules and archive entries" onClick={()=>{setEra(retiredRuleLabel);setSheet("C23")}} icon={<Clock3 size={20}/>}/></>;
  }
  function gameOverview(){
    return <><DemoLabel/><div className="ll-vspace"/><TicketCard game={game} onView={()=>next("C06")} onQuick={()=>next("C13")} onPick={()=>next("C11")}/>
      <div className="ll-list-group"><RowLink title="Latest sample draw" sub="Winning balls and prize breakdown" onClick={()=>next("C06")}/>
      <RowLink title="Results history" sub="Browse older example draw dates" onClick={()=>next("C05")}/>
      <RowLink title="Game rules & archive" sub={era} onClick={()=>setSheet("C23")}/></div>
      <div className="ll-card ll-block-gap">{section("Game details")}<InfoPair label="Selection" value={game.pick+" from "+game.pool+(game.specialPool?" + 1 from "+game.specialPool:"")}/><InfoPair label="Version" value="Unverified prototype defaults"/><InfoPair label="Draw schedule" value="Not verified"/></div></>;
  }
  function resultArchive(){
    return <><div className="ll-card ll-filter-card">
      <label className="ll-field"><span>Lottery game</span><select value={gameId} onChange={e=>selectGame(e.target.value as GameId)}>{games.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label>
      <div className="ll-two-controls"><button type="button" onClick={()=>setSheet("C23")}>{shortText(era,24)} <ChevronDown size={16}/></button><button type="button" onClick={()=>setSheet("C24")}>{range} <ChevronDown size={16}/></button></div>
    </div>
    {stateOverride!=="populated"&&<StatusCard kind={stateOverride}/>}
    {!demoFallback?<div className="ll-list-group">{exampleHistory.map((r,i)=><RowLink key={i} title={r.date+" · "+game.label} sub={r.code+" · "+era} right={r.status} onClick={()=>next("C06")}/>)}</div>:<div className="ll-empty-state"><Search size={28}/><h3>No eligible history</h3><p>No verified results are connected to this prototype.</p><Pill variant="outline" onClick={()=>setStateOverride("populated")}>View fixture rows</Pill></div>}
    <p className="ll-footnote">Past and current rule matrices must be queried separately. Archive-only formats never mix silently with current draws.</p></>;
  }
  function drawDetail(){
    return <><div className="ll-detail-band" style={{background:game.accent}}><h2>{game.label}</h2><p>Example draw · {game.exampleDate}</p></div>
    <div className="ll-detail-white"><div className="ll-kicker">Winning numbers</div>
      <BoardBalls numbers={game.numbers} game={game} special={game.special}/>
      {game.bonus!==undefined&&<div className="ll-bonus">Bonus <NumberBall value={game.bonus} size="tiny" accent="#9B8CAE" label={"Bonus ball "+game.bonus}/></div>}
      <InfoPair label="Draw ID" value="DEMO-001"/><InfoPair label="Date" value={game.exampleDate+" (sample)"}/><InfoPair label="Data status" value="Not verified · fixture"/></div>
      {stateOverride!=="populated"&&<StatusCard kind={stateOverride}/>}
      <div className="ll-card ll-block-gap">{section("Prize breakdown","Illustration")}
        <PrizeTable rows={stateOverride==="pending"?prizeRows.map(r=>({...r,payout:"Pending",state:"pending" as const})):prizeRows}/>
      </div>
      <div className="ll-warning-inline"><strong>Example divisions</strong><p>These demonstration payouts and division names are not verified for {game.label}. Unknown and zero are different states.</p></div>
      <Pill onClick={()=>next("C07")}>Check my numbers</Pill><div className="ll-vspace"/><Pill variant="outline" onClick={()=>next("C05")}>Browse history</Pill></>;
  }
  function checkInput(){
    const validBoard=selected.length===game.pick&&(!game.specialPool||special!==undefined);
    return <><p className="ll-subheading">Choose the game, draw and a board you want to compare. Result checking is UI-only.</p>
      <div className="ll-card">{section("Your selection")}
        <label className="ll-field"><span>Game</span><select value={gameId} onChange={e=>selectGame(e.target.value as GameId)}>{games.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label>
        <label className="ll-field"><span>Example draw</span><select><option>DEMO-001 · {game.exampleDate}</option><option>DEMO-002 · previous sample</option></select></label>
        <div className="ll-field"><span>Board A · {selected.length}/{game.pick} selected</span><button type="button" className="ll-select-numbers" onClick={()=>openPicker("board","check",selected,special)}>Choose your numbers <ChevronRight size={18}/></button></div>
        {selected.length>0&&<BoardBalls numbers={selected} game={game} special={special}/>}
        {!validBoard&&<p className="ll-footnote">Choose a complete main-number board{game.specialPool?" and one separate PowerBall":""} to preview comparison.</p>}<Pill disabled={!validBoard} onClick={()=>next("C08")}>Preview comparison</Pill></div>
      <div className="ll-help-card"><Info size={20}/><p>A saved board or personal number selection is not proof of a ticket purchase or winnings.</p></div>
      <RowLink title="Use an example saved board" sub={activeBoard.name} onClick={()=>{setGameId(activeBoard.gameId);setSelected(activeBoard.main);setSpecial(activeBoard.special)}} icon={<Layers3 size={19}/>}/></>;
  }
  function comparison(){
    const exampleOtherNumbers=Array.from({length:game.pool},(_,i)=>i+1).filter(n=>!game.numbers.includes(n));
    const sampleMain=[...game.numbers.slice(0,3),...exampleOtherNumbers.slice(0,game.pick-3)].sort((a,b)=>a-b);
    const sampleSpecial=game.specialPool?(game.special===1?2:1):undefined;
    return <><div className="ll-card">{section("Example comparison")}<InfoPair label="Game" value={game.label}/><InfoPair label="Draw" value="DEMO-001 · not official"/><p className="ll-kicker ll-top-gap">Winning example</p><BoardBalls numbers={game.numbers} game={game} special={game.special}/><p className="ll-kicker ll-top-gap">Example board · not your input</p><BoardBalls numbers={sampleMain} game={game} special={sampleSpecial}/>
      <div className="ll-stats-grid ll-top-gap"><div className="ll-stat"><span>Match illustration</span><strong>3 main balls</strong><small>Fixture example only</small></div><div className="ll-stat"><span>Winnings</span><strong>Unavailable</strong><small>No prize checking connected</small></div></div></div>
      <div className="ll-warning-inline"><strong>Not a genuine ticket check</strong><p>This is a fixed illustration showing three matching main balls. Your selected numbers are not checked, and no prize is determined. Do not use this preview to claim a win.</p></div>
      <Pill onClick={()=>next("C07")}>Change my board</Pill><div className="ll-vspace"/><Pill variant="outline" onClick={()=>openSave("C08")}>Save board preview</Pill></>;
  }
  function boardList(){
    return <><div className="ll-card-row ll-top-gap">{section("Example boards")}<button type="button" className="ll-text-link" onClick={()=>next("C11")}><Plus size={18}/> Add board</button></div>
      <p className="ll-subheading">Boards are held in this preview session only and reset when you restart the application.</p>
      {(demoFallback||boards.length===0)?<div className="ll-empty-state"><Layers3 size={29}/><h3>No example boards</h3><p>Create a board to preview editing and naming.</p><Pill onClick={()=>next("C11")}>Add board</Pill></div>:
      <div className="ll-list-group">{boards.map(b=><RowLink key={b.id} title={b.name} sub={gameName(b.gameId)+" · "+b.main.join(" · ")} right="UI sample" onClick={()=>selectBoard(b)}/>)}</div>}
      <Pill onClick={()=>next("C11")}>Create new board</Pill></>;
  }
  function boardDetail(){
    return <><div className="ll-card">{section(activeBoard?.name||"Board A","Sample only")}
      <InfoPair label="Game" value={activeGame.label}/><InfoPair label="Associated draw" value="None · personal board"/><InfoPair label="Created" value="This preview session"/><InfoPair label="Purchase status" value="Not a ticket"/>
      <p className="ll-kicker ll-top-gap">Selected numbers</p><BoardBalls numbers={activeBoard?.main||game.numbers} game={activeGame} special={activeBoard?.special}/>
      <p className="ll-footnote">{activeBoard?.note}</p></div>
      <div className="ll-list-group ll-block-gap"><RowLink title="Edit this board" sub="Update the visual number selection" onClick={()=>{setGameId(activeBoard.gameId);setSelected(activeBoard.main);setSpecial(activeBoard.special);next("C11")}}/>
      <RowLink title="Check sample draw" sub="Preview comparison, not a verified check" onClick={()=>{setGameId(activeBoard.gameId);setSelected(activeBoard.main);setSpecial(activeBoard.special);next("C07")}}/>
      <RowLink title="Export layout preview" sub="No PDF is actually generated" onClick={()=>next("C27")}/></div>
      <Pill onClick={()=>{setGameId(activeBoard.gameId);setSelected(activeBoard.main);setSpecial(activeBoard.special);next("C11")}}>Use these numbers</Pill>
      <button type="button" className="ll-danger-link" onClick={()=>{setConfirmAction("delete");setSheet("C26")}}><Trash2 size={17}/> Remove example board</button></>;
  }
  function boardEditor(){
    return <><div className="ll-card">{section("Board editor")}<label className="ll-field"><span>Game</span><select value={gameId} onChange={e=>selectGame(e.target.value as GameId)}>{games.map(g=><option value={g.id} key={g.id}>{g.label}</option>)}</select></label>
      <div className="ll-field"><span>Board A</span><button type="button" className="ll-select-numbers" onClick={()=>openPicker("board","board",selected,special)}>{selected.length?selected.join(", "):"Select your numbers"}<ChevronRight size={18}/></button></div>
      {selected.length>0&&<BoardBalls numbers={selected} game={game} special={special}/>}
      <div className="ll-two-controls ll-top-gap"><button type="button" onClick={()=>openPicker("board","board")}>Add / edit</button><button type="button" onClick={()=>{setSelected([]);setSpecial(undefined)}}>Clear board</button></div>
      <p className="ll-footnote">Newly created lines are demonstrations and are not submitted to a lottery operator.</p>
      <Pill disabled={selected.length!==game.pick||(!!game.specialPool&&special===undefined)} onClick={()=>openSave("C11")}>Save preview</Pill></div>
      <button type="button" className="ll-danger-link" onClick={()=>{setConfirmAction("discard");setSheet("C26")}}>Discard changes</button></>;
  }
  function quickSetup(){
    return <><div className="ll-card">{section("Quick pick setup")}
      <label className="ll-field"><span>Game</span><select value={gameId} onChange={e=>selectGame(e.target.value as GameId)}>{games.map(g=><option value={g.id} key={g.id}>{g.label}</option>)}</select></label>
      <label className="ll-field"><span>How many boards?</span><div className="ll-stepper"><button type="button" onClick={()=>setQuickCount(n=>Math.max(1,n-1))} aria-label="Fewer boards">−</button><strong>{quickCount}</strong><button type="button" onClick={()=>setQuickCount(n=>Math.min(10,n+1))} aria-label="More boards">+</button></div></label>
      <InfoPair label="Main numbers" value={game.pick+" from "+game.pool}/><InfoPair label="Separate ball" value={game.specialPool?"1 from "+game.specialPool:"None"}/><Pill onClick={()=>next("C14")}>Show sample boards</Pill></div>
      <div className="ll-help-card"><Sparkles size={20}/><p>Sample boards are fixed examples rather than random combinations. Real generation follows UI approval.</p></div></>;
  }
  function generated(){
    return <><DemoLabel/><p className="ll-subheading ll-top-gap">Illustrative layouts. No mathematical generation or uniqueness validation has been run.</p>
      {Array.from({length:quickCount},(_,i)=>{
        const nums=sampleGenerated[i%sampleGenerated.length].filter(n=>n<=game.pool).slice(0,game.pick);
        const displayed=nums.length===game.pick?nums:game.numbers;
        return <div className="ll-card ll-block-gap" key={i}><div className="ll-card-row"><strong>Board {String.fromCharCode(65+i)}</strong><span className="ll-muted">Sample</span></div><BoardBalls numbers={displayed} game={game} special={game.specialPool?(i%game.specialPool)+1:undefined}/></div>;
      })}
      <Pill onClick={()=>openSave("C14")}>Save preview</Pill><div className="ll-vspace"/><Pill variant="outline" onClick={()=>next("C27")}>Export layout preview</Pill></>;
  }
  function calendar(){
    const monthDate=new Date(2026,9+monthOffset,1);
    const firstDay=monthDate.getDay();
    const daysInMonth=new Date(2026,10+monthOffset,0).getDate();
    const slotCount=Math.ceil((firstDay+daysInMonth)/7)*7;
    const monthLabel=new Intl.DateTimeFormat("en-ZA",{month:"long",year:"numeric"}).format(monthDate);
    return <><div className="ll-card">{section("Draw calendar","Examples")}
      <div className="ll-card-row ll-calendar-head"><button type="button" onClick={()=>{setMonthOffset(x=>x-1);setSelectedTab("Day 1")}} aria-label="Previous month">‹</button><strong>{monthLabel}</strong><button type="button" onClick={()=>{setMonthOffset(x=>x+1);setSelectedTab("Day 1")}} aria-label="Next month">›</button></div>
      <div className="ll-calendar-grid">{days.map((n,i)=><strong key={i}>{n}</strong>)}{Array.from({length:slotCount},(_,i)=>{const day=i-firstDay+1;return <button type="button" key={i} disabled={day<1||day>daysInMonth} className={day===26&&monthOffset===0?"selected":""} onClick={()=>setSelectedTab("Day "+day)}>{day>=1&&day<=daysInMonth?day:""}</button>})}</div>
      <p className="ll-subheading">Selected: {selectedTab.startsWith("Day")?selectedTab:"Day 26"} · Event examples only</p></div>
      {monthOffset===0?<div className="ll-list-group ll-block-gap">{sampleCalendar.map((x,i)=><RowLink key={i} title={x.name} sub={"Example event · "+x.day+" October (not a verified schedule)"} onClick={()=>next("C04")}/>)}</div>:<div className="ll-empty-state"><CalendarDays size={27}/><h3>No sample events this month</h3><p>Only October 2026 has invented calendar events in this design prototype.</p></div>}
      <p className="ll-footnote">Real draw dates and provider cutoffs must be verified separately and cannot be inferred from this example calendar.</p></>;
  }
  function notifications(){
    return <><div className="ll-card-row">{section("Notifications")}<button type="button" className="ll-text-link" onClick={()=>next("C17")}>Preferences</button></div>
      {demoFallback?<div className="ll-empty-state"><Bell size={29}/><h3>You're all caught up</h3><p>There are no sample notices in this state.</p></div>:
      <div className="ll-list-group"><RowLink title="Illustrative draw published" sub="Lotto · sample notice, not sent or delivered" onClick={()=>next("C06")}/><RowLink title="Sample draw reminder" sub="PowerBall · hypothetical reminder" onClick={()=>next("C15")}/></div>}
      <p className="ll-footnote">Actual push alerts, permissions, schedules and background tasks are deferred.</p></>;
  }
  function preferences(){
    return <><div className="ll-card">{section("Notification preferences")}
      {([["results","Result announcements"],["reminders","Draw reminders"]] as const).map(([key,label])=><label className="ll-switch-row" key={key}><span><strong>{label}</strong><small>Visual preference only</small></span><input type="checkbox" checked={pref[key]} onChange={e=>setPref(p=>({...p,[key]:e.target.checked}))}/></label>)}
      <p className="ll-footnote">Notifications are not requested from the device and no alerts are scheduled.</p></div><RowLink title="Data status" sub="Understand offline and stale states" onClick={()=>next("C21")}/></>;
  }
  function helpIndex(){
    return <><div className="ll-list-group"><RowLink title="Getting started" sub="Home, sample results and global menu" onClick={()=>next("C19")} icon={<BookOpen size={20}/>}/>
      <RowLink title="How to check numbers" sub="Choose a board and compare an example draw" onClick={()=>next("C07")} icon={<TicketCheck size={20}/>}/>
      <RowLink title="Create and save boards" sub="Using the six-column number picker" onClick={()=>next("C11")} icon={<Layers3 size={20}/>}/>
      <RowLink title="Number research" sub="Frequencies, combinations and gaps" onClick={()=>next("LAB")} icon={<BarChart3 size={20}/>}/>
      <RowLink title="Source and coverage" sub="How to interpret missing or stale data" onClick={()=>next("C21")} icon={<Info size={20}/>}/></div></>;
  }
  function guide(){
    return <><div className="ll-card">{section("Using LottoLab")}
      {[["1","Choose a game","Every game and rule era has its own number pool."],["2","Select a board","Tap number balls; PowerBall has a separate special ball."],["3","Explore sample results","Each example result is clearly identified as a mockup."],["4","Learn from history","Past draws can be studied but cannot predict independent draws."]].map(([n,t,d])=><div className="ll-guide-step" key={n}><span>{n}</span><div><strong>{t}</strong><p>{d}</p></div></div>)}
      <div className="ll-example-box"><strong>Example board</strong><BoardBalls numbers={game.numbers} game={game} special={game.special}/></div>
      <Pill onClick={()=>next("C07")}>Try the number checker</Pill></div></>;
  }
  function settings(){
    return <><div className="ll-card">{section("Display preferences")}
      <label className="ll-switch-row"><span><strong>Large text preview</strong><small>Improves readability in demonstration</small></span><input type="checkbox" checked={pref.largeText} onChange={e=>setPref(p=>({...p,largeText:e.target.checked}))}/></label>
      <label className="ll-switch-row"><span><strong>Wi-Fi only update</strong><small>No updater is connected</small></span><input type="checkbox" checked={pref.wifiOnly} onChange={e=>setPref(p=>({...p,wifiOnly:e.target.checked}))}/></label></div>
      <div className="ll-list-group ll-block-gap"><RowLink title="Data status" sub="Coverage, offline and source examples" onClick={()=>next("C21")}/><RowLink title="Notification preferences" sub="Visual-only toggles" onClick={()=>next("C17")}/><RowLink title="About LottoLab" sub="Independent application" onClick={()=>next("C22")}/></div></>;
  }
  function dataStatus(){
    return <><div className="ll-card">{section("Data status")}<InfoPair label="Results source" value="Not connected"/><InfoPair label="Last verified update" value="Never"/><InfoPair label="Local example fixtures" value="Available offline"/><InfoPair label="Rule version" value="Provisional"/><InfoPair label="Draw coverage" value="Unknown"/>
      <div className="ll-warning-inline"><strong>No real update available</strong><p>Automatic and manual updates are planned for functionality, after API access and official rule checks.</p></div></div>
      <div className="ll-card ll-block-gap">{section("Example availability states")}<p className="ll-subheading">These are design previews, not actual connectivity reports.</p>
        {(["offline-cached","offline-empty","stale","missing","pending"] as StateExample[]).map(s=><StatusCard kind={s} key={s}/>)}
      </div></>;
  }
  function about(){
    return <><div className="ll-card ll-about-card"><div className="ll-brand">Lotto<em>Lab</em></div><DemoLabel/>
      <p>Independent South African lottery research and number-planning interface.</p>
      <InfoPair label="Edition" value="UI prototype"/><InfoPair label="Operator relationship" value="Independent"/><InfoPair label="Data connection" value="None"/><InfoPair label="Saved data" value="Session-only examples"/></div>
      <div className="ll-warning-inline"><strong>Fair-draw reminder</strong><p>Every valid line has an equal jackpot chance under the same fair independent draw rules. LottoLab cannot predict winning numbers.</p></div>
      <button type="button" className="ll-text-link" onClick={()=>next("C18")}>Open the help library <ChevronRight size={17}/></button></>;
  }
  function exportPreview(){
    return <><div className="ll-print-preview"><div className="ll-print-heading"><div className="ll-brand">Lotto<em>Lab</em></div><small>UI SAMPLE — NOT AN OFFICIAL TICKET</small></div>
      <h2>Example board summary</h2><InfoPair label="Game" value={game.label}/><InfoPair label="Format" value={era}/>
      <BoardBalls numbers={selected.length===game.pick?selected:game.numbers} game={game} special={special}/>
      <div className="ll-print-fine">No purchase, payment, draw comparison or real export has been performed. This illustration is not valid proof of entry.</div></div>
      <button type="button" className="ll-disabled-action" disabled><Download size={17}/> PDF export available after UI approval</button>
      <Pill variant="outline" onClick={back}>Return to preview</Pill></>;
  }
  function lab(){
    const filtered=tools.filter(t=>(t.title+" "+t.description).toLowerCase().includes(search.toLowerCase()));
    const core=["T01","T02","T09","T10"];
    return <><div className="ll-card ll-lab-head">
      <div className="ll-card-row"><div><h2>LottoLab</h2><p>Research and plan your numbers</p></div><span className="ll-cta-icon"><FlaskConical size={27}/></span></div>
      <label className="ll-field"><span>Game</span><select value={gameId} onChange={e=>selectGame(e.target.value as GameId)}>{games.map(g=><option value={g.id} key={g.id}>{g.label}</option>)}</select></label>
      <button type="button" className="ll-select-numbers" onClick={()=>setSheet("C23")}>{shortText(era,32)} <ChevronRight size={17}/></button>
      <label className="ll-searchbox"><Search size={18}/><input value={search} placeholder="Search all 17 tools" aria-label="Find a LottoLab tool" onChange={e=>setSearch(e.target.value)}/>{search&&<button type="button" aria-label="Clear search" onClick={()=>setSearch("")}><X size={17}/></button>}</label>
    </div>
      {!search&&<>{section("Popular tools","Start here")}{tools.filter(t=>core.includes(t.id)).map(t=><RowLink key={t.id} title={t.title} sub={t.description} onClick={()=>next(t.id)} icon={<FlaskConical size={20}/>}/>)}</>}
      {(["Explore history","Build numbers","Calculators","Advanced"] as const).map(group=><div key={group} className="ll-tool-group">{section(group)}
        {filtered.filter(t=>t.group===group).map(t=><RowLink key={t.id} title={t.title} sub={t.description} onClick={()=>next(t.id)} icon={t.priority==="Advanced"?<SlidersHorizontal size={19}/>:<BarChart3 size={19}/>}/>)}
      </div>)}
      {!filtered.length&&<div className="ll-empty-state"><Search size={28}/><h3>No matching tools</h3><p>Try another search term.</p><Pill variant="outline" onClick={()=>setSearch("")}>Clear search</Pill></div>}
      <div className="ll-privacy-note">Analysis screens are visual demonstrations. No statistical advantage is claimed, and no actual lottery computation is performed.</div>
    </>;
  }
  function gallery(){
    return <><div className="ll-card">{section("UI acceptance gallery","Development only")}
      <p className="ll-subheading">Every route below opens its actual design. State variants illustrate empty, invalid, missing and loading conditions.</p>
      <label className="ll-field"><span>Choose display state for previews</span><select value={stateOverride} onChange={e=>setStateOverride(e.target.value as StateExample)}>
        {coreStates.map(s=><option value={s} key={s}>{s}</option>)}</select></label>
      <StatusCard kind={stateOverride}/>
      <Pill onClick={()=>{setStateOverride("populated");next("C01")}}>Start Home walkthrough</Pill></div>
      {section("27 core routes") }
      <div className="ll-list-group">{coreRouteInventory.map(id=><RowLink key={id} title={id+" · "+screenTitles[id]} sub={["C02","C12","C23","C24","C25","C26"].includes(id)?"Opens an overlay":"Navigate to this screen"} onClick={()=>id==="C02"||id==="C12"||id==="C23"||id==="C24"||id==="C25"||id==="C26"?setSheet(id as Sheet):next(id)}/>)}</div>
      {section("17 LottoLab tool screens")}
      <div className="ll-list-group">{tools.map(t=><RowLink key={t.id} title={t.id+" · "+t.title} sub={t.description} onClick={()=>next(t.id)}/>)}</div>
      <div className="ll-card ll-block-gap">{section("Accessibility checklist")}<ul className="ll-checklist"><li>48dp interactive number balls and buttons</li><li>Separate PowerBall special-number selection</li><li>Focus rings and labels</li><li>Scrollable cards above navigation</li><li>200% font and device verification still required</li></ul></div></>;
  }
  function renderCore(){
    switch(view){
      case "C01":return home();case "C03":return catalogue();case "C04":return gameOverview();
      case "C05":return resultArchive();case "C06":return drawDetail();case "C07":return checkInput();
      case "C08":return comparison();case "C09":return boardList();case "C10":return boardDetail();
      case "C11":return boardEditor();case "C13":return quickSetup();case "C14":return generated();
      case "C15":return calendar();case "C16":return notifications();case "C17":return preferences();
      case "C18":return helpIndex();case "C19":return guide();case "C20":return settings();
      case "C21":return dataStatus();case "C22":return about();case "C27":return exportPreview();
      case "LAB":return lab();case "GALLERY":return gallery();
      default:return <div className="ll-card"><h2>{screenTitles[view]}</h2><p>Open this component from its associated sheet or tool.</p></div>;
    }
  }
  const minSelected=pickerMode==="board"?game.pick:pickerMode==="wheel"?game.pick:1;
  const maxSelected=pickerMode==="board"?game.pick:pickerMode==="wheel"?Math.min(12,game.pool):game.pick;
  const validSelected=selected.length>=minSelected&&selected.length<=maxSelected&&(pickerMode!=="board"||!game.specialPool||special!==undefined);
  function pickerSheet(){
    const specialPool=game.specialPool||0;
    const list=pool==="main"?game.pool:specialPool;
    return <div className="ll-number-sheet" role="dialog" aria-modal="true" aria-label="Select lotto numbers">
      <div className="ll-sheet-grip"/><div className="ll-picker-title"><h2>{pickerMode==="subset"?"Search numbers":pickerMode==="wheel"?"Wheel pool":"Board A"}</h2>
      <button type="button" className="ll-text-link" onClick={()=>{setSelected([]);setSpecial(undefined)}}>Clear</button>
      <button type="button" className="ll-icon-button" onClick={()=>setSheet(null)} aria-label="Close"><X size={21}/></button></div>
      <div className="ll-picker-info"><strong>{game.label}</strong><span>{selected.length} / {maxSelected} selected</span></div>
      <div className="ll-pick-tray">{Array.from({length:Math.min(maxSelected,12)},(_,i)=>selected[i]!==undefined?
        <NumberBall key={i} value={selected[i]} size="small" accent={game.accent} selected onClick={()=>setSelected(p=>p.filter(x=>x!==selected[i]))} label={"Remove "+selected[i]}/>:
        <span key={i} className="ll-empty-ball" aria-label={"Empty "+(i+1)}>{i+1}</span>)}
        {pickerMode==="board"&&specialPool>0&&<div className="ll-tray-special">{special!==undefined?
        <NumberBall value={special} accent="#E7325D" size="small" selected onClick={()=>setSpecial(undefined)} label={"Remove PowerBall "+special}/>:
        <span className="ll-empty-ball ll-empty-special">PB</span>}</div>}
      </div>
      {specialPool>0&&pickerMode==="board"&&<div className="ll-picker-tabs" role="tablist" aria-label="Number pool">
        <button type="button" role="tab" aria-selected={pool==="main"} className={pool==="main"?"active":""} onClick={()=>setPool("main")}>Main numbers</button>
        <button type="button" role="tab" aria-selected={pool==="special"} className={pool==="special"?"active":""} onClick={()=>setPool("special")}>PowerBall</button>
      </div>}
      <p className="ll-picker-hint">{pool==="special"?"Choose 1 from 1–"+specialPool:"Choose "+(pickerMode==="subset"?"1 to "+maxSelected:pickerMode==="wheel"?minSelected+" to "+maxSelected:game.pick)+" from 1–"+game.pool}</p>
      <div className="ll-number-grid">{Array.from({length:list},(_,i)=>i+1).map(n=><NumberBall key={n} value={n} size="large" accent={pool==="special"?"#E7325D":game.accent}
        selected={pool==="special"?special===n:selected.includes(n)}
        muted={pool==="main"&&!selected.includes(n)&&selected.length>=maxSelected}
        onClick={()=>pool==="special"?setSpecial(s=>s===n?undefined:n):
          setSelected(p=>p.includes(n)?p.filter(x=>x!==n):p.length>=maxSelected?p:[...p,n].sort((a,b)=>a-b))}/>)}</div>
      <div className="ll-picker-footer"><p>{pickerMode==="subset"?"Subset search has a different selection requirement from a full board.":"Number selection is visual only, with no real checking or generation."}</p>
        <div className="ll-picker-actions"><Pill variant="outline" onClick={useExamplePicker}><WandSparkles size={16}/> Sample fill</Pill><Pill disabled={!validSelected} onClick={confirmPicker}>Confirm</Pill></div>
      </div>
    </div>;
  }
  function modalContent(){
    if(sheet==="C12")return pickerSheet();
    if(sheet==="C02")return <nav className="ll-menu-sheet" aria-label="Global menu"><div className="ll-sheet-grip"/><div className="ll-menu-hd"><h2>Menu</h2><button className="ll-icon-button" type="button" aria-label="Close" onClick={()=>setSheet(null)}><X size={21}/></button></div>
      {globalMenu.map((m,i)=>{const I=menuIcons[i];return <button type="button" className={"ll-menu-row"+(view===m.id||(m.id==="T01"&&view==="LAB")?" active":"")} aria-current={view===m.id||(m.id==="T01"&&view==="LAB")?"page":undefined} key={i} onClick={()=>navMenu(m.id)}><I size={20}/><span className="ll-flex1"><strong>{m.title}</strong><small>{m.detail}</small></span><ChevronRight size={18}/></button>})}
    </nav>;
    if(sheet==="C23")return <div className="ll-small-sheet"><h2>Choose game & format</h2><p className="ll-subheading">Do not mix historic and current rules in a default statistic.</p>
      <label className="ll-field"><span>Game</span><select value={gameId} onChange={e=>selectGame(e.target.value as GameId)}>{games.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label>
      {[ruleLabel,retiredRuleLabel].map(x=><button key={x} type="button" className={"ll-choice-row"+(era===x?" selected":"")} onClick={()=>{setEra(x);setSheet(null)}}><span>{x}</span>{era===x&&<Check size={18}/>}</button>)}
      <Pill variant="outline" onClick={()=>setSheet(null)}>Done</Pill></div>;
    if(sheet==="C24")return <div className="ll-small-sheet"><h2>Select date range</h2>
      {["Last 20 eligible draws","Last 50 eligible draws","Last 100 eligible draws","All eligible draws","Custom dates (example)"].map(s=><button type="button" className={"ll-choice-row"+(range===s?" selected":"")} onClick={()=>setRange(s)} key={s}><span>{s}</span>{range===s&&<Check size={17}/>}</button>)}
      {range.includes("Custom")&&<div className="ll-two-controls"><label>From<input type="date" defaultValue="2026-10-01"/></label><label>To<input type="date" defaultValue="2026-10-26"/></label></div>}
      <Pill onClick={()=>setSheet(null)}>Apply sample filter</Pill></div>;
    if(sheet==="C25")return <div className="ll-small-sheet"><h2>Save board preview</h2><p className="ll-subheading">Session-only examples. No database or account is connected.</p>
      {!savedPreview?<><label className="ll-field"><span>Board name</span><input value={name} onChange={e=>setName(e.target.value)} maxLength={60} placeholder="My numbers"/></label>
      <label className="ll-field"><span>Notes (optional)</span><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Private note for this example"/></label>
      {boards.some(b=>b.name.toLowerCase()===name.trim().toLowerCase())&&<StatusCard kind="invalid"/>}
      <Pill disabled={!name.trim()||boards.some(b=>b.name.toLowerCase()===name.trim().toLowerCase())} onClick={saveSession}>Save sample board</Pill></>:
      <div className="ll-empty-state"><Check size={28}/><h3>Saved in this preview session</h3><p>The example will reset on app restart.</p><Pill onClick={()=>{setSheet(null);next("C09")}}>View my boards</Pill></div>}
      <Pill variant="outline" onClick={()=>setSheet(null)}>Close</Pill></div>;
    if(sheet==="C26")return <div className="ll-small-sheet"><TriangleAlert size={28}/><h2>{confirmAction==="delete"?"Remove example board?":"Discard your changes?"}</h2>
      <p className="ll-subheading">This affects only the temporary prototype session.</p>
      <div className="ll-two-actions"><Pill variant="outline" onClick={()=>setSheet(null)}>Cancel</Pill><Pill onClick={()=>{if(confirmAction==="delete")setBoards(p=>p.filter(b=>b.id!==boardId));else{setSelected([]);setSpecial(undefined);}setSheet(null);next("C09")}}>Confirm</Pill></div></div>;
    return null;
  }
  const showNav=(["C01","C03","C05","C07","C09","C15","C16","C18","C20","C22","LAB"] as Route[]).includes(view)&&!sheet;
  const screenTitle=view==="LAB"?"LottoLab":view==="GALLERY"?"UI screen gallery":isTool(view)?screenTitles[view]:screenTitles[view]||"LottoLab";
  return <div className={"ll-preview ll-full"+(pref.largeText?" ll-text-large":"")}>
    {view!=="C01"&&!isTool(view)&&<PageTitle title={screenTitle} back={back} aside={view==="LAB"?<button type="button" className="ll-icon-button" onClick={()=>next("C18")} aria-label="Help"><HelpCircle size={21}/></button>:undefined}/>}
    {isTool(view)?<ToolScreen key={view} id={view} game={game} setGame={selectGame} era={era} onBack={back}
      onHelp={()=>next("C19")} onOpenPicker={m=>openPicker(m,"tool",toolNumbers)}
      selectedNumbers={toolNumbers} onNavigate={s=>s==="C25"?openSave():next(s)}
      stateOverride={stateOverride} onSelectEra={()=>setSheet("C23")}/>:renderCore()}
    {view!=="GALLERY"&&<div className="ll-app-legal">{whyDemo}</div>}
    {showNav&&<FloatingMenu onClick={()=>setSheet("C02")}/>}
    {sheet&&<div className="ll-modal-scrim ll-full-scrim" onMouseDown={e=>{if(e.target===e.currentTarget)setSheet(null)}}>{modalContent()}</div>}
  </div>;
}
