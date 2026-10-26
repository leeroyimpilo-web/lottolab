"use client";
import {useState} from "react";
import {ChevronRight,HelpCircle,Settings2,Search,Table2,BarChart3,SlidersHorizontal} from "lucide-react";
import {Game, games} from "./fixtures";
import {DemoLabel,NumberBall,Pill} from "./components";
import {ToolId,toolById,sampleNumberFrequency,exampleDraws,sampleGenerated} from "./design-data";

export interface ToolScreenProps {
  id:ToolId; game:Game; setGame:(id:Game["id"])=>void; era:string;
  onBack:()=>void; onHelp:()=>void; onOpenPicker:(mode:"subset"|"wheel"|"board")=>void;
  selectedNumbers:number[]; onNavigate:(id:ToolId|"C05"|"C06"|"C25"|"C27")=>void;
  stateOverride:string; onSelectEra:()=>void;
}
function Figure({label,value,sub}:{label:string;value:string;sub?:string}) {
  return <div className="ll-stat"><span>{label}</span><strong>{value}</strong>{sub&&<small>{sub}</small>}</div>;
}
function BallStrip({list,game,special}:{list:number[];game:Game;special?:number}) {
  return <div className="ll-ball-row ll-demo-balls">{list.map((n,i)=><NumberBall key={i} value={n} size="small" accent={game.accent}/>)}
  {special!==undefined&&<NumberBall value={special} size="small" accent="#E7325D" label={"Special ball "+special}/>}</div>;
}
function ExampleRow({title,detail,right,onClick}:{title:string;detail?:string;right?:string;onClick?:()=>void}) {
  return <button type="button" className="ll-entry" onClick={onClick} disabled={!onClick}><span><strong>{title}</strong>{detail&&<small>{detail}</small>}</span><span className="ll-entry-side">{right}{onClick&&<ChevronRight size={16}/>}</span></button>;
}
function ToolBody({id,game,onNavigate,selectedNumbers,view}:{id:ToolId;game:Game;onNavigate:ToolScreenProps["onNavigate"];selectedNumbers:number[];view:"bars"|"table"}) {
  const ball=(n:number)=><NumberBall value={n} size="tiny" accent={game.accent}/>;
  const bar=(label:string,val:number,secondary:string)=><div className="ll-mini-bar" key={label}><div className="ll-mini-bar-head"><strong>{label}</strong><span>{secondary}</span></div><div className="ll-mini-bar-track"><div style={{width:Math.min(100,val)+"%"}}/></div></div>;
  switch(id) {
    case "T01":return <><div className="ll-stats-grid"><Figure label="Example draws" value={String(exampleDraws)}/><Figure label="Highest example count" value="18" sub="18 of 100 draws"/></div>
      {view==="bars"?sampleNumberFrequency.filter(x=>x.number<=game.pool).map(x=>bar(String(x.number),100*x.count/exampleDraws,x.count+" / "+exampleDraws+" · "+x.count+"%")):
      <div className="ll-list-group">{sampleNumberFrequency.filter(x=>x.number<=game.pool).map(x=><ExampleRow key={x.number} title={"Number "+x.number} detail={x.count+" / 100 eligible example draws"} right={x.count+"%"} onClick={()=>onNavigate("T03")}/>)}</div>}
      <p className="ll-footnote">Percent = sample draws containing the number ÷ eligible sample draws. A frequency describes history, not a future advantage.</p></>;
    case "T02":return <><Figure label="Example search" value="2 matching draws" sub="100 invented eligible draws examined"/>
      <p className="ll-footnote">Example query: main numbers {game.numbers.slice(0,3).join(", ")} (fixed fixture, not linked to the inputs). Contains all means each number appears within the same draw, not necessarily an exact complete line.</p>
      {["24 Oct 2026","10 Oct 2026"].map((date,i)=><div className="ll-match-row" key={date}><div className="ll-card-row"><strong>{date} · DEMO</strong><button className="ll-text-link" onClick={()=>onNavigate("C06")}>Draw details <ChevronRight size={15}/></button></div><BallStrip list={i===0?game.numbers:[...game.numbers.slice(0,3),...Array.from({length:game.pool},(_,j)=>j+1).filter(n=>!game.numbers.includes(n)).slice(0,game.pick-3)].sort((a,b)=>a-b)} game={game}/><small>{i===0?"All selected example numbers highlighted in reference view":"All three example query numbers also appear; the other main balls differ"}</small></div>)}
      <p className="ll-footnote">Separate search modes: exact full line, contains-all subset and match count. Bonus/special balls are always a distinct pool.</p></>;
    case "T03":return <><div className="ll-profile-ball"><NumberBall value={selectedNumbers[0]||12} size="large" accent={game.accent}/><strong>Number profile</strong></div>
      <div className="ll-stats-grid"><Figure label="Appearances" value="16 / 100" sub="16% of eligible example draws"/><Figure label="Last seen" value="3 draws ago"/></div>
      <div className="ll-stats-grid"><Figure label="Average gap" value="6 draws"/><Figure label="Longest gap" value="14 draws"/></div>
      <ExampleRow title="Example recent appearances" detail="DEMO-001, DEMO-003, DEMO-007" onClick={()=>onNavigate("C05")}/>
      <ExampleRow title="Companion numbers" detail="See which numbers occurred alongside it" onClick={()=>onNavigate("T06")}/></>;
    case "T04":return <><div className="ll-card-row"><strong>Draws since last seen</strong><span className="ll-muted">Example 100 draws</span></div>
      {game.numbers.slice(0,5).map((n,i)=>({n,g:[16,12,10,3,0][i]})).map(x=><div className="ll-gap-row" key={x.n}>{ball(x.n)}<span className="ll-flex1">Last seen: {x.g===0?"latest example draw":x.g+" draws earlier"}</span><strong>{x.g} draws</strong></div>)}
      <p className="ll-footnote">A number never seen in the sample is different from one with zero draws since its latest appearance. Neither is "due".</p></>;
    case "T05":return <><div className="ll-list-group">{[[game.numbers[0],game.numbers[1]],[game.numbers[2],game.numbers[3]],[game.numbers[1],game.numbers[game.numbers.length-1]],[game.numbers[0],game.numbers[game.numbers.length-1]]].map((pair,i)=><div className="ll-group-result" key={i}><BallStrip list={pair} game={game}/><div><strong>{8-i*2} co-occurrences</strong><small>in 100 example draws</small></div><button className="ll-text-link" onClick={()=>onNavigate("C05")}>View <ChevronRight size={14}/></button></div>)}</div>
      <p className="ll-footnote">Pair/triplet results are counts within the same draw; the denominator is 100 invented eligible draws.</p></>;
    case "T06":return <><div className="ll-card-row"><strong>Anchor number {selectedNumbers[0]||12}</strong>{ball(selectedNumbers[0]||12)}</div>
      {[[4,10],[19,8],[26,7],[34,6]].map(([n,count])=><div className="ll-gap-row" key={n}>{ball(n)}<span className="ll-flex1">Appeared alongside anchor</span><strong>{count} / 100</strong></div>)}
      <p className="ll-footnote">A companion count uses the entire eligible example sample as its denominator; it does not mean a number is more likely next time.</p></>;
    case "T07":return <>{bar("Three odd / three even",34,"Example 34 of 100")}{bar("Sum 100–180",26,"Example 26 of 100")}{bar("At least one consecutive pair",18,"Example 18 of 100")}
      <p className="ll-footnote">These are invented descriptive distributions. Neither "balanced" nor "unbalanced" lines have a predictive edge.</p></>;
    case "T08":return <><div className="ll-stats-grid"><Figure label="Example repeated numbers" value="2"/><Figure label="Compared draws" value="2"/></div><div className="ll-card-row"><span>Repeated main numbers</span><BallStrip list={[12,26]} game={game}/></div>
      <div className="ll-example-box">Compared DEMO-001 with DEMO-002. This is a visual example, not an analysis of real results.</div></>;
    case "T09":return <><p className="ll-footnote">Illustrative, fixed boards only. These are NOT newly or randomly generated lines.</p>
      {sampleGenerated.slice(0,3).map((n,i)=><div className="ll-match-row" key={i}><strong>Example board {String.fromCharCode(65+i)}</strong><BallStrip list={n.filter(x=>x<=game.pool).slice(0,game.pick)} game={game} special={game.specialPool?i+2:undefined}/></div>)}</>;
    case "T10":return <><Figure label="Illustration: 6 from 52" value="20,358,520" sub="Example of a combination-count result view"/><details className="ll-details"><summary>How the formula will be explained</summary><p>n choose k counts unique, unordered groups of k numbers from n. Actual calculations are deferred until functionality is approved.</p></details><p className="ll-footnote">This example is fixed and does not respond to the inputs above.</p></>;
    case "T11":return <><Figure label="Sample jackpot odds display" value="1 in 20,358,520" sub="Illustrative 6-from-52 main-number calculation only"/><p className="ll-footnote">Not a verified payout-tier probability for {game.label}. Additional special-ball rules and lower-tier overlap require separately verified formulas.</p><ExampleRow title="Assumptions" detail="Fair independent draw; unordered unique main-number combinations"/></>;
    case "T12":return <><div className="ll-stats-grid"><Figure label="Illustrative line total" value="6 boards"/><Figure label="Example total" value="R 120.00" sub="Not an operator price"/></div>
      <div className="ll-gap-row"><span className="ll-flex1">Sample board quantity × example price</span><strong>R 120.00</strong></div>
      <div className="ll-gap-row"><span className="ll-flex1">Verified price unavailable</span><strong>Pending</strong></div><p className="ll-footnote">Actual entry prices, add-ons and sales conditions are not available in the UI prototype.</p></>;
    case "T13":return <><BallStrip list={selectedNumbers.length>=game.pick?selectedNumbers.slice(0,game.pick):game.numbers} game={game}/>
      <div className="ll-stats-grid"><Figure label="Example sum" value="142"/><Figure label="Odd / even" value="2 / 4"/></div><div className="ll-stats-grid"><Figure label="Example spread" value="43"/><Figure label="Consecutive pairs" value="0"/></div>
      <p className="ll-footnote">Layout illustration only. No quality score or claim of increased odds is provided.</p></>;
    case "T14":return <><div className="ll-warning-inline"><strong>Coverage not verified</strong><p>A reduced wheel has no guarantee until its specific construction and chosen pool are independently validated.</p></div>
      <Figure label="Example line count" value="28" sub="Not computed for the selected pool"/>
      <p className="ll-footnote">A full wheel covers all lines from its chosen pool at a proportional cost; reduced/fixed examples must state exact conditional guarantees.</p></>;
    case "T15":return <><div className="ll-stats-grid"><Figure label="Sample distinct lines" value="3"/><Figure label="Repeated sample lines" value="1"/></div>
      <ExampleRow title="Board A = Board D" detail="Exact duplicate in this made-up collection"/>
      <ExampleRow title="Boards A and B" detail="2 shared main numbers"/>
      <p className="ll-footnote">Overlap between multiple purchased lines does not increase the chance of an individual combination.</p></>;
    case "T16":return <><div className="ll-stats-grid"><Figure label="Training period" value="Example 60"/><Figure label="Later evaluation" value="Example 40"/></div>
      <div className="ll-warning-inline"><strong>No predictive conclusion</strong><p>This mock screen separates training from later testing. No strategy was executed, and no returns or winning claims are calculated.</p></div>
      <ExampleRow title="Baseline comparison" detail="Placeholder · independent baseline required"/><ExampleRow title="Prize source status" detail="Unavailable in prototype"/></>;
    case "T17":return <><div className="ll-stats-grid"><Figure label="Manual example spending" value="R 200"/><Figure label="Manual example returns" value="R 0"/></div><Figure label="Example net" value="-R 200"/><ExampleRow title="October 2026" detail="Illustrative personal record · no connected accounts" right="-R 200"/>
      <p className="ll-footnote">A future budget log will keep manually entered values offline. This prototype does not save financial information.</p></>;
    default:return null;
  }
}
export function ToolScreen(props:ToolScreenProps){
  const {id,game,setGame,era,onBack,onHelp,onOpenPicker,selectedNumbers,onNavigate,stateOverride,onSelectEra}=props;
  const t=toolById[id];const [showResult,setShowResult]=useState(false);
  const [view,setView]=useState<"bars"|"table">("bars");
  const [range,setRange]=useState("Last 100 eligible draws");
  const pool="Main balls";
  const [advanced,setAdvanced]=useState(false);
  const [fieldChoices,setFieldChoices]=useState<Record<string,string>>({});
  const [counts,setCounts]=useState<Record<string,number>>({});
  const [money,setMoney]=useState<Record<string,string>>({});
  const [exampleEmpty,setExampleEmpty]=useState(false);
  const pickerMode=(id==="T02"||id==="T03"||id==="T05"||id==="T06"||id==="T09")?"subset":id==="T14"?"wheel":"board";
  // Input choices are strictly UI previews. Each field has its own independent value.
  function fieldOptions(field:string):string[]|null {
    const poolChoices=game.specialPool?["Main balls",game.specialLabel||"Special ball"]:
      game.bonus!==undefined?["Main balls","Bonus ball"]:["Main balls"];
    switch(field){
      case "Main / bonus / special pool": case "Number pool":return poolChoices;
      case "Sort by":return ["Most frequent","Least frequent","Number ascending","Number descending","Last seen"];
      case "Sort by gap":return ["Longest gap first","Shortest gap first","Number ascending"];
      case "Contains all / match count":return ["Contains all chosen numbers","At least N numbers match","Exact full line"];
      case "Pairs / triplets":return ["Pairs","Triplets"];
      case "Pattern":return ["Odd / even balance","High / low numbers","Line total (sum)","Number spread","Consecutive numbers","Last digit"];
      case "Consecutive / selected draws":return ["Compare consecutive draws","Choose two example draws"];
      case "Include / exclude / lock":return ["No restrictions","Include selected numbers","Exclude selected numbers","Lock selected numbers"];
      case "Optional structure filters":return ["No pattern filters","Odd / even example","Range example","Sum range example"];
      case "Prize tier":return game.specialPool?["All main + special ball","All main numbers","Lower-tier example"]:
        ["All main numbers","Main plus bonus example","Lower-tier example"];
      case "Draw type":return ["Single eligible draw","Multiple independent draws"];
      case "Eligible add-ons":return ["No add-on","Eligible add-on (unverified)"];
      case "Structure measures":return ["All summary measures","Odd / even","Sum and spread","Consecutive runs","Last digits"];
      case "Full / fixed / reduced":return ["Full coverage","Fixed-number wheel","Reduced wheel (coverage unverified)"];
      case "Select collection":return ["Example boards A–D","Example boards A–C","Create collection (future)"];
      case "Comparison view":return ["Duplicate summary","Shared-number matrix","Number-pool distribution"];
      case "Method":return ["Unweighted random baseline","Frequency-based historical method","Rule-based selection example"];
      case "Training period":return ["First 60 eligible example draws","First 40 eligible example draws","Custom training dates"];
      case "Later evaluation period":return ["Later 40 eligible example draws","Later 20 eligible example draws","Custom evaluation dates"];
      case "Month":return ["October 2026","September 2026","August 2026","Choose month (future)"];
      default:return null;
    }
  }
  const dateRanges=["Last 20 eligible draws","Last 50 eligible draws","Last 100 eligible draws","All eligible draws","Custom dates (UI example)"];
  const neutralSelect=(name:string,options:string[],value:string,change:(value:string)=>void)=>
    <label className="ll-field"><span>{name}</span><select value={value} onChange={e=>change(e.target.value)}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select></label>;
  function choiceField(field:string,opts:string[],defaultValue=opts[0]){
    const value=fieldChoices[field]||defaultValue;
    return <label className="ll-field"><span>{field}</span>
      <select value={value} onChange={e=>setFieldChoices(p=>({...p,[field]:e.target.value}))}>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </label>;
  }
  function numberField(field:string){
    const defaultCount=field==="Pool size"?game.pool:field==="Numbers per line"?game.pick:
      field==="Fixed numbers"?0:field==="Budget"?200:field==="Line or budget limit"?10:field==="Draws"?2:3;
    const min=field==="Fixed numbers"||field==="Budget"?0:1;
    const max=field==="Pool size"?99:field==="Numbers per line"?game.pool:
      field==="Fixed numbers"?game.pick:field==="Budget"?10000:field==="Line or budget limit"?500:50;
    const step=field==="Budget"?50:1;
    const current=Math.min(max,Math.max(min,counts[field]??defaultCount));
    return <label className="ll-field"><span>{field}</span>
      <div className="ll-stepper">
        <button type="button" aria-label={"Decrease "+field} disabled={current<=min} onClick={()=>setCounts(p=>({...p,[field]:Math.max(min,current-step)}))}>−</button>
        <strong aria-live="polite">{current}</strong>
        <button type="button" aria-label={"Increase "+field} disabled={current>=max} onClick={()=>setCounts(p=>({...p,[field]:Math.min(max,current+step)}))}>+</button>
      </div>
    </label>;
  }
  function customField(field:string){
    if(field==="Date range")return <label className="ll-field"><span>{field}</span>
      <select value={range} onChange={e=>setRange(e.target.value)}>
        {dateRanges.map(o=><option key={o} value={o}>{o}</option>)}
      </select></label>;
    const choices=fieldOptions(field);
    if(choices)return choiceField(field,choices);
    if(["Number of boards","Pool size","Numbers per line","Fixed numbers","Distinct boards","Boards","Draws","Line or budget limit","Budget"].includes(field))return numberField(field);
    if(["Amount spent","Winnings entered manually"].includes(field)){
      return <label className="ll-field"><span>{field} (R)</span><input type="number" inputMode="decimal" min="0" step="1"
        value={money[field]??"0"} onChange={e=>setMoney(p=>({...p,[field]:e.target.value}))}/></label>;
    }
    if(["Number","Anchor number","Include number (optional)","Choose board","Chosen line","Wheel pool"].includes(field)){
      return <div className="ll-field"><span>{field}</span>
        <button type="button" className="ll-select-numbers" onClick={()=>onOpenPicker(field==="Wheel pool"?"wheel":field==="Number"||field==="Anchor number"||field==="Include number (optional)"?"subset":"board")}>
          {selectedNumbers.length?selectedNumbers.join(", "):"Choose sample numbers"} <ChevronRight size={18}/>
        </button>
      </div>;
    }
    return <div className="ll-field"><span>{field}</span><small>Optional selection to be specified after visual approval</small></div>;
  }
  const empty=stateOverride==="empty"||stateOverride==="offline-empty"||exampleEmpty;
  return <div className="ll-tool-screen">
    <header className="ll-tool-header"><button type="button" className="ll-icon-button" onClick={onBack} aria-label="Go back">‹</button><h1>{t.title}</h1><button type="button" className="ll-icon-button" onClick={onHelp} aria-label="Tool help"><HelpCircle size={22}/></button></header>
    <p className="ll-tool-purpose">{t.purpose}</p><DemoLabel small/>
    <div className="ll-card ll-tool-form">
      <div className="ll-section-head"><h2>Set up your search</h2><Settings2 size={19}/></div>
      {neutralSelect("Lottery game",games.map(g=>g.label),game.label,name=>setGame(games.find(g=>g.label===name)?.id||"lotto"))}
      <div className="ll-field"><span>Rule version</span><button type="button" className="ll-select-numbers" onClick={onSelectEra}>{era}<ChevronRight size={16}/></button></div>
      {(id==="T02"||id==="T09")&&
      <div className="ll-field"><span>{id==="T02"?"Search numbers":"Include, exclude or lock numbers"}</span><button type="button" className="ll-select-numbers" onClick={()=>onOpenPicker(pickerMode)}>{selectedNumbers.length?selectedNumbers.join(", "):"Select number balls"}<ChevronRight size={18}/></button></div>}
      {t.fields.map(field=><div key={field}>{customField(field)}</div>)}
      <button type="button" className="ll-collapse" onClick={()=>setAdvanced(x=>!x)} aria-expanded={advanced}><SlidersHorizontal size={16}/> {advanced?"Hide":"Show"} additional options <ChevronRight size={16}/></button>
      {advanced&&<div className="ll-extra-options">
        <label><input type="checkbox" defaultChecked/> Include eligible examples only</label>
        <label><input type="checkbox"/> Show technical explanation</label>
        <p>Optional filters are visual controls in this phase.</p>
      </div>}
      <Pill onClick={()=>{setShowResult(true);setExampleEmpty(false)}}>View sample result <ChevronRight size={17}/></Pill>
    </div>
    {showResult&&<section className="ll-card ll-result-card" aria-label="Illustrative result">
      <div className="ll-section-head"><h2>Example result</h2><DemoLabel small/></div>
      <div className="ll-result-context">{game.label} · {era} · {range} · {fieldChoices["Main / bonus / special pool"]||fieldChoices["Number pool"]||pool}</div>
      {empty?<div className="ll-empty-state"><Search size={29}/><h3>No example results</h3><p>This is a first-use / no-data demonstration. No live history was searched.</p><Pill variant="outline" onClick={()=>setExampleEmpty(false)}>Show example data</Pill></div>:
        stateOverride==="loading"?<div className="ll-empty-state"><h3>Loading preview</h3><p>No background activity is being performed.</p></div>:
        <ToolBody id={id} game={game} onNavigate={onNavigate} selectedNumbers={selectedNumbers} view={view}/>}
      {id==="T01"&&<div className="ll-view-switch"><button className={view==="bars"?"active":""} type="button" onClick={()=>setView("bars")}><BarChart3 size={16}/> Bars</button><button className={view==="table"?"active":""} type="button" onClick={()=>setView("table")}><Table2 size={16}/> Table</button></div>}
      {id==="T02"&&<button className="ll-text-link" type="button" onClick={()=>setExampleEmpty(v=>!v)}>Toggle no matching draw example</button>}
      <div className="ll-result-actions"><Pill variant="outline" onClick={()=>onNavigate("C27")}>Export preview</Pill><Pill onClick={()=>onNavigate("C25")}>Save preview</Pill></div>
      <div className="ll-privacy-note">Fixed offline illustration only. Changing a control does not recalculate this sample; game, era and filters are presentation choices until functionality is approved.</div>
    </section>}
    {!showResult&&<div className="ll-help-card"><HelpCircle size={20}/><p>Choose options above and tap View sample result. No real calculations or historical searches occur yet.</p></div>}
    <div className="ll-privacy-note">Every valid combination has the same jackpot probability in a fair draw. Past statistics do not predict the next result.</div>
  </div>;
}
