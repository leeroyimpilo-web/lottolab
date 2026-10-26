import type { GameId } from "./fixtures";
export type ScreenId = "C01"|"C02"|"C03"|"C04"|"C05"|"C06"|"C07"|"C08"|"C09"|"C10"|"C11"|"C12"|"C13"|"C14"|"C15"|"C16"|"C17"|"C18"|"C19"|"C20"|"C21"|"C22"|"C23"|"C24"|"C25"|"C26"|"C27"|"T01"|"T02"|"T03"|"T04"|"T05"|"T06"|"T07"|"T08"|"T09"|"T10"|"T11"|"T12"|"T13"|"T14"|"T15"|"T16"|"T17";
export type ToolId= "T01"|"T02"|"T03"|"T04"|"T05"|"T06"|"T07"|"T08"|"T09"|"T10"|"T11"|"T12"|"T13"|"T14"|"T15"|"T16"|"T17";
export type StateExample="populated"|"empty"|"loading"|"offline-cached"|"offline-empty"|"stale"|"missing"|"invalid"|"pending"|"no-match";
export type ToolInfo={id:ToolId;title:string;description:string;group:"Explore history"|"Build numbers"|"Calculators"|"Advanced";purpose:string;priority:"Core"|"Secondary"|"Advanced";fields:string[]};
export const tools:ToolInfo[]=[
{id:"T01",title:"Number frequencies",description:"How often has each number appeared?",group:"Explore history",purpose:"Count appearances in the eligible sample. Past frequency does not predict future draws.",priority:"Core",fields:["Date range","Main / bonus / special pool","Sort by"]},
{id:"T02",title:"Check past combinations",description:"Look up numbers in earlier draws",group:"Explore history",purpose:"Choose one to six numbers and see where all of them occurred within an example draw.",priority:"Core",fields:["Contains all / match count","Date range","Main numbers only"]},
{id:"T03",title:"Number detail",description:"A closer look at one number",group:"Explore history",purpose:"See a number's sample frequency, last appearance and co-occurrences.",priority:"Core",fields:["Number","Date range"]},
{id:"T04",title:"Last seen & gaps",description:"How many draws since each number appeared?",group:"Explore history",purpose:"Inspect gaps in the sample, without assuming a number is due.",priority:"Core",fields:["Number pool","Sort by gap","Date range"]},
{id:"T05",title:"Pairs & triplets",description:"Which groups appeared together?",group:"Explore history",purpose:"Explore co-occurring groups in the same eligible sample.",priority:"Core",fields:["Pairs / triplets","Include number (optional)","Date range"]},
{id:"T06",title:"Number companions",description:"Numbers drawn alongside your chosen number",group:"Explore history",purpose:"Find numbers that co-occurred with the anchor number.",priority:"Core",fields:["Anchor number","Date range"]},
{id:"T07",title:"Pattern explorer",description:"Review past draw patterns",group:"Explore history",purpose:"Look at odd/even balance, sum, spread and other descriptive patterns.",priority:"Secondary",fields:["Pattern","Date range"]},
{id:"T08",title:"Draw repeats",description:"Numbers repeated between draws",group:"Explore history",purpose:"Compare two consecutive or selected sample draws.",priority:"Secondary",fields:["Consecutive / selected draws","Date range"]},
{id:"T09",title:"Number generator",description:"Prepare sample number boards",group:"Build numbers",purpose:"Preview combinations and organise filters. Real generation is deferred.",priority:"Core",fields:["Number of boards","Include / exclude / lock","Optional structure filters"]},
{id:"T10",title:"Combination count",description:"How many different lines are possible?",group:"Calculators",purpose:"Illustrate combination counts. Formula calculation is not enabled in this UI prototype.",priority:"Core",fields:["Pool size","Numbers per line","Fixed numbers"]},
{id:"T11",title:"Odds calculator",description:"Understand different prize odds",group:"Calculators",purpose:"Read an illustrative odds layout and the assumptions behind it.",priority:"Core",fields:["Prize tier","Distinct boards","Draw type"]},
{id:"T12",title:"Cost planner",description:"Estimate a planned ticket budget",group:"Calculators",purpose:"Plan board and draw quantities. Prices must be verified before functionality.",priority:"Core",fields:["Boards","Draws","Eligible add-ons"]},
{id:"T13",title:"Board analyser",description:"Describe your number line",group:"Calculators",purpose:"Inspect structure without an invented quality or prediction score.",priority:"Secondary",fields:["Choose board","Structure measures"]},
{id:"T14",title:"Wheel builder",description:"Explore multi-line coverage",group:"Advanced",purpose:"Preview wheel types and conditional coverage. This is not a verified wheel.",priority:"Advanced",fields:["Wheel pool","Full / fixed / reduced","Line or budget limit"]},
{id:"T15",title:"Coverage & duplicates",description:"See how your boards overlap",group:"Advanced",purpose:"Show repeated lines and shared numbers in a sample collection.",priority:"Advanced",fields:["Select collection","Comparison view"]},
{id:"T16",title:"Historical replay",description:"Review a method against later draws",group:"Advanced",purpose:"Keep training and later evaluation periods separate.",priority:"Advanced",fields:["Method","Training period","Later evaluation period","Budget"]},
{id:"T17",title:"Budget log",description:"Track amounts you enter yourself",group:"Advanced",purpose:"Keep a manual spending record. No bank connection or transactions.",priority:"Secondary",fields:["Month","Amount spent","Winnings entered manually"]},
];
export const toolById=Object.fromEntries(tools.map(x=>[x.id,x])) as Record<ToolId,ToolInfo>;
export const screenTitles:Record<string,string>={
C01:"Home",C02:"Menu",C03:"Games",C04:"Game overview",C05:"Results & history",
C06:"Draw details",C07:"Check my numbers",C08:"Number comparison",C09:"My boards",
C10:"Board details",C11:"Edit boards",C12:"Select numbers",C13:"Quick pick",C14:"Generated boards",
C15:"Draw calendar",C16:"Notifications",C17:"Notification preferences",
C18:"How to use LottoLab",C19:"Game guide",C20:"Settings",C21:"Data status",
C22:"About LottoLab",C23:"Choose game & format",C24:"Date range",C25:"Name this board",
C26:"Discard changes?",C27:"Export preview",...Object.fromEntries(tools.map(x=>[x.id,x.title]))
};
export const globalMenu:{id:ScreenId;title:string;detail:string}[]=[
{id:"C01",title:"Home",detail:"Latest results"},
{id:"T01",title:"LottoLab",detail:"Research and plan your numbers"},
{id:"C05",title:"Results & history",detail:"Explore previous draws"},
{id:"C07",title:"Check my numbers",detail:"Compare a personal board"},
{id:"C09",title:"My boards",detail:"Your example lines"},
{id:"C15",title:"Draw calendar",detail:"Dates and games"},
{id:"C16",title:"Notifications",detail:"Examples and preferences"},
{id:"C18",title:"How to use LottoLab",detail:"Help and instructions"},
{id:"C20",title:"Settings & data status",detail:"Display and coverage"},
{id:"C22",title:"About LottoLab",detail:"App information"},
];
export type MockBoard={id:string;name:string;gameId:GameId;main:number[];special?:number;note:string;label:string};
export const initialBoards:MockBoard[]=[
{id:"A",name:"My weekend numbers",gameId:"lotto",main:[4,12,19,26,34,47],note:"Example board only — not a purchased ticket.",label:"Board A · Lotto"},
{id:"B",name:"Tuesday selection",gameId:"powerball",main:[8,14,23,35,49],special:9,note:"Special pool is separate from the main five.",label:"Board B · PowerBall"},
{id:"C",name:"Daily favourites",gameId:"daily",main:[2,7,17,25,33],note:"Personal selection; not proof of a wager.",label:"Board C · Daily Lotto"},
];
export const exampleHistory=[
{date:"24 Oct 2026",code:"DEMO-001",subtitle:"Lotto · illustrative draw",status:"Example"},
{date:"21 Oct 2026",code:"DEMO-002",subtitle:"Lotto · illustrative draw",status:"Example"},
{date:"17 Oct 2026",code:"DEMO-003",subtitle:"Lotto · illustrative draw",status:"Example"},
{date:"14 Oct 2026",code:"DEMO-004",subtitle:"Lotto · illustrative draw",status:"Example"},
{date:"10 Oct 2026",code:"DEMO-005",subtitle:"Lotto · illustrative draw",status:"Example"},
{date:"07 Oct 2026",code:"DEMO-006",subtitle:"Lotto · illustrative draw",status:"Example"},
];
export const sampleNumberFrequency=[
{number:4,count:18},{number:12,count:16},{number:19,count:15},
{number:26,count:14},{number:34,count:13},{number:47,count:12},
{number:8,count:11},{number:22,count:10},{number:31,count:9},
{number:39,count:8},{number:41,count:7},{number:50,count:6},
];
export const exampleDraws=100; // INVENTED demonstration denominator
export const sampleGenerated=[
[3,12,19,25,37,48],[1,9,17,24,36,44],[5,11,20,29,41,50],
[7,15,26,33,38,52],[6,13,21,30,39,47],[2,10,23,31,42,49],
];
export const sampleCalendar=[
{day:2,name:"Daily Lotto"},{day:3,name:"PowerBall"},
{day:4,name:"Lotto"},{day:5,name:"Daily Lotto"},
{day:6,name:"PowerBall"},{day:7,name:"Lotto"},
];
export const coreStates:StateExample[]=["populated","empty","loading","offline-cached","offline-empty","stale","missing","invalid","pending","no-match"];
export const whyDemo="All dates, draw numbers, prize amounts, records and statistics on this page are invented presentation samples. LottoLab is independent and does not sell tickets.";
export const ruleLabel="Current format (prototype defaults — verification pending)";
export const retiredRuleLabel="Retired format (archive example)";
export const coreRouteInventory:ScreenId[]=Array.from({length:27},(_,i)=>("C"+String(i+1).padStart(2,"0")) as ScreenId);
