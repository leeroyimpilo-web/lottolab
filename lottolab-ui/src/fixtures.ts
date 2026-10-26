/* Deterministic, invented UI fixtures. Never connect these to real winnings. */
export type GameId = "lotto" | "plus1" | "max5" | "powerball" | "xtra" | "daily";
export type Game = {
  id: GameId; label: string; shortName: string; accent: string; pool: number;
  pick: number; specialPool?: number; specialLabel?: string;
  numbers: number[]; special?: number; bonus?: number;
  exampleDate: string; exampleNext: string; jackpot: string;
};
export type PrizeRow = { division: string; match: string; winners: string; payout: string; state?: "unknown" | "pending" };
export const games: Game[] = [
  {id:"lotto",label:"Lotto",shortName:"LOTTO",accent:"#F9C818",pool:52,pick:6,numbers:[4,12,19,26,34,47],bonus:8,exampleDate:"24 Oct 2026",exampleNext:"Example next draw",jackpot:"R 42 000 000"},
  {id:"plus1",label:"Lotto Plus 1",shortName:"LOTTO PLUS 1",accent:"#E99B20",pool:52,pick:6,numbers:[3,15,22,30,41,50],bonus:12,exampleDate:"24 Oct 2026",exampleNext:"Example next draw",jackpot:"R 7 500 000"},
  {id:"max5",label:"Lotto 5 Max",shortName:"LOTTO 5 MAX",accent:"#AE54C8",pool:52,pick:6,numbers:[6,13,18,29,37,44],bonus:21,exampleDate:"24 Oct 2026",exampleNext:"Example next draw",jackpot:"R 3 200 000"},
  {id:"powerball",label:"PowerBall",shortName:"POWERBALL",accent:"#12B8D6",pool:50,pick:5,specialPool:16,specialLabel:"PowerBall",numbers:[8,14,23,35,49],special:9,exampleDate:"23 Oct 2026",exampleNext:"Example next draw",jackpot:"R 65 000 000"},
  {id:"xtra",label:"PowerBall Xtra",shortName:"POWERBALL XTRA",accent:"#4066C9",pool:50,pick:5,specialPool:16,specialLabel:"PowerBall",numbers:[1,11,22,28,39],special:13,exampleDate:"23 Oct 2026",exampleNext:"Example next draw",jackpot:"R 6 000 000"},
  {id:"daily",label:"Daily Lotto",shortName:"DAILY LOTTO",accent:"#E93A55",pool:36,pick:5,numbers:[2,7,17,25,33],exampleDate:"25 Oct 2026",exampleNext:"Example next draw",jackpot:"Estimated prize pool unavailable"},
];
export const prizeRows: PrizeRow[] = [
  {division:"1",match:"6 numbers",winners:"0",payout:"R 0.00"},
  {division:"2",match:"5 + bonus",winners:"2",payout:"R 83 500.00"},
  {division:"3",match:"5 numbers",winners:"38",payout:"R 4 250.00"},
  {division:"4",match:"4 + bonus",winners:"110",payout:"R 1 150.00"},
  {division:"5",match:"4 numbers",winners:"2 480",payout:"R 220.00"},
  {division:"6",match:"3 + bonus",winners:"4 010",payout:"R 115.00"},
  {division:"7",match:"3 numbers",winners:"18 200",payout:"R 50.00"},
  {division:"8",match:"2 + bonus",winners:"—",payout:"Pending",state:"pending"},
  {division:"9",match:"2 numbers",winners:"Unknown",payout:"Unavailable",state:"unknown"},
];
export const toolShortcuts = [
  {id:"T01",title:"Number frequencies",description:"See how often each number appeared"},
  {id:"T02",title:"Check past combinations",description:"Search previous draws for your numbers"},
  {id:"T09",title:"Number generator",description:"Prepare sample number boards"},
  {id:"T10",title:"Number calculators",description:"Explore combinations, odds and costs"},
];
export const menuDestinations = [
  {id:"home",label:"Home"},
  {id:"lab",label:"LottoLab"},
  {id:"results",label:"Results & history"},
  {id:"check",label:"Check my numbers"},
  {id:"boards",label:"My boards"},
  {id:"calendar",label:"Draw calendar"},
  {id:"notifications",label:"Notifications"},
  {id:"help",label:"How to use LottoLab"},
  {id:"settings",label:"Settings & data status"},
  {id:"about",label:"About LottoLab"},
] as const;
