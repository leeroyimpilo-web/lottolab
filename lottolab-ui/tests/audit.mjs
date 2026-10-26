import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const base = process.env.AUDIT_URL || "http://127.0.0.1:4173";
const target = resolve("lottolab-ui/artifacts/atlas");
await mkdir(target,{recursive:true});
const browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
const errors = [];
const summary = [];
const screenIds = Array.from({length:27},(_,i)=>"C"+String(i+1).padStart(2,"0"));
const toolIds = Array.from({length:17},(_,i)=>"T"+String(i+1).padStart(2,"0"));
const overlays = new Set(["C02","C12","C23","C24","C25","C26"]);
const assert = (condition,message)=>{if(!condition)throw new Error(message)};
try {
 const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 page.on("pageerror",e=>errors.push(String(e)));
 const galleryURL=base+"/ui-preview/gallery.html";
 const homeURL=base+"/ui-preview.html";
 // Verify all listed routes are actually clickable, not static text.
 await page.goto(galleryURL,{waitUntil:"networkidle"});
 assert(await page.getByRole("heading",{name:"UI screen gallery"}).isVisible(),"Missing UI gallery");
 for(const id of [...screenIds,...toolIds]){
   await page.goto(galleryURL,{waitUntil:"domcontentloaded"});
   const link=page.getByRole("button",{name:new RegExp("^"+id+" ·")});
   assert(await link.count()===1,"Missing route "+id);
   await link.click();
   const screen=await page.locator(".ll-preview").count();
   assert(screen===1,"Missing page shell for "+id);
   if(overlays.has(id))assert(await page.locator(".ll-full-scrim").isVisible(),"Overlay did not open: "+id);
   else if(id!=="C01")assert(await page.locator("h1").count()>0,"No title for route "+id);
   summary.push(id);
 }
 await page.goto(homeURL,{waitUntil:"networkidle"});
 assert(await page.getByText("Latest results",{exact:true}).isVisible(),"Home has no results");
 await page.getByRole("button",{name:"Open app menu"}).click();
 assert(await page.getByRole("navigation",{name:"Global menu"}).isVisible(),"Global menu not reachable");
 await page.getByRole("navigation",{name:"Global menu"}).getByRole("button",{name:/LottoLab Research and plan/}).click();
 assert(await page.getByRole("heading",{name:"LottoLab"}).count()>0,"LottoLab hub not reachable");
 await page.getByRole("button",{name:/Number frequencies How often/}).first().click();
 await page.getByRole("button",{name:/View sample result/}).click();
 assert(await page.getByText("Example result",{exact:true}).isVisible(),"Frequency result missing");
 await page.screenshot({path:target+"/tool-frequencies-390.png",fullPage:true});
 for(const width of [360,390,412]){
   await page.setViewportSize({width,height:844});
   await page.goto(homeURL,{waitUntil:"networkidle"});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   assert(overflow<=3,"Horizontal overflow at "+width+": "+overflow);
   await page.screenshot({path:target+"/home-"+width+".png",fullPage:true});
 }
 await page.setViewportSize({width:360,height:700});
 await page.goto(galleryURL,{waitUntil:"networkidle"});
 await page.getByRole("button",{name:/C12 · Select numbers/}).click();
 assert(await page.locator(".ll-number-grid").isVisible(),"Picker grid not visible");
 const dimensions=await page.locator(".ll-number-grid").evaluate(el=>({columns:getComputedStyle(el).gridTemplateColumns.split(" ").length,scroll:el.scrollWidth,client:el.clientWidth}));
 assert(dimensions.columns===6,"Picker must have six columns");
 assert(dimensions.scroll<=dimensions.client+3,"Picker horizontally clips");
 await page.screenshot({path:target+"/picker-360-short.png"});
 const confirm=page.getByRole("button",{name:"Confirm",exact:true});
 assert(!(await confirm.isEnabled()),"Incomplete board must not be confirmable");
 for(const n of [1,2,3,4,5,6])await page.getByRole("button",{name:"Number "+n,exact:true}).click();
 assert(await confirm.isEnabled(),"Complete Lotto board must be confirmable");
 await confirm.click();
 assert((await page.locator(".ll-full-scrim").count())===0,"Confirm must close the picker sheet");
 await page.goto(galleryURL,{waitUntil:"networkidle"});
 await page.getByRole("button",{name:/C15 · Draw calendar/}).click();
 await page.getByRole("button",{name:"Next month"}).click();
 assert(await page.getByText("November 2026",{exact:true}).isVisible(),"Calendar must show the next month");
 assert(await page.getByText("No sample events this month",{exact:true}).isVisible(),"October-only sample events must not persist in other months");
 await page.goto(galleryURL,{waitUntil:"networkidle"});
 await page.getByRole("button",{name:/C06 · Draw details/}).click();
 assert((await page.getByRole("button",{name:"Open app menu"}).count())===0,"Floating menu must not obstruct prize table");
 assert(await page.locator(".ll-prize-unknown").getByText("N/A",{exact:true}).isVisible(),"Unknown payout winner count should use compact N/A state");
 await page.screenshot({path:target+"/prize-390.png",fullPage:true});
 await page.goto(galleryURL,{waitUntil:"networkidle"});
 await page.getByRole("button",{name:/C20 · Settings/}).click();
 await page.getByLabel("Large text preview").check();
 await page.screenshot({path:target+"/settings-large-text.png",fullPage:true});
 assert(errors.length===0,"Browser errors: "+errors.join(" | "));
 console.log("PASS: "+summary.length+" selectable routes, mobile widths 360/390/412, six-column picker, navigation, sample tool, large-text preview.");
} finally { await browser.close(); }
