'use client';
import { useState, useEffect, useRef, useCallback } from "react";

/* ─── VIEWS ─────────────────────────────────────── */
const VIEWS = { HOME:"home", RECIPES:"recipes", BAKE:"bake", LOG:"log", INGREDIENTS:"ingredients" };

/* ─── AUSTRALIAN FLOUR DATABASE ─────────────────── */
const FLOUR_DB = [
  {
    id:"f1", name:"Wallaby Baker's Flour", brand:"Laucke",
    type:"White Bread", sizes:["5kg"],
    where:"Woolworths, IGA, independents",
    protein:11.5, energy:1420, fat:1.2, carbs:72, fibre:2.8, sodium:2,
    sourdoughRating:3, colour:"#F5E6C8",
    description:"Australia's most widely available home baker's flour. A reliable everyday performer for sourdough and yeasted breads. Solid choice if specialty flour is out of reach.",
    tips:"Works well at 75–78% hydration. Add 7g vital wheat gluten per kg to improve crumb structure.",
  },
  {
    id:"f2", name:"White Baker's Flour", brand:"Defiance",
    type:"White Bread", sizes:["5kg"],
    where:"Woolworths, some Coles, IGA",
    protein:11.7, energy:1430, fat:1.1, carbs:73, fibre:2.5, sodium:2,
    sourdoughRating:3, colour:"#F0DDB5",
    description:"Long-time Aussie home baker favourite. As of 2024 protein dropped to 11.7% (was 12.5%). Still produces a decent loaf but crumb is tighter than before.",
    tips:"Add 9g vital wheat gluten per kg or substitute 50g water with an egg to compensate for lower protein.",
  },
  {
    id:"f3", name:"Euro T55 (LCSPA)", brand:"Laucke",
    type:"White Bread (T55)", sizes:["5kg"],
    where:"Specialty stores, Hindu­stan Imports (Melbourne), online",
    protein:12.0, energy:1440, fat:1.0, carbs:74, fibre:2.2, sodium:2,
    sourdoughRating:5, colour:"#EDD9A3",
    description:"A French-style T55 flour prized by Australian sourdough bakers. Excellent for open crumb structure and long fermentation. Consistent quality batch to batch.",
    tips:"Start at 75% hydration. Handles high-hydration doughs well. Great for overnight retard.",
  },
  {
    id:"f4", name:"Organic Premium Baker's White Flour", brand:"Demeter Farm Mill / Wholegrain Milling Co.",
    type:"Organic White Bread", sizes:["5kg","12.5kg"],
    where:"Online (home delivery), health food stores, Harris Farm",
    protein:12.0, energy:1410, fat:1.1, carbs:72, fibre:2.8, sodium:1,
    sourdoughRating:5, colour:"#F2E2B0",
    description:"Previously the #1 go-to for serious Aussie sourdough bakers. As of 2024 protein is around 12% (was ~12.5%). Certified organic, Australian grown, stone milled in Gunnedah NSW. Rich flavour.",
    tips:"Add 7g vital wheat gluten per kg if you notice loaves are flatter than expected. Excellent for long cold fermentation.",
  },
  {
    id:"f5", name:"Organic Stoneground White Baker's Flour", brand:"Wholegrain Milling Co.",
    type:"Organic Stoneground White", sizes:["5kg"],
    where:"Harris Farm, organic stores, online",
    protein:12.0, energy:1400, fat:1.3, carbs:71, fibre:3.2, sodium:1,
    sourdoughRating:5, colour:"#E8D49A",
    description:"Same flour as Demeter Farm Mill, rebranded. Stone-milled in Gunnedah NSW. Retains germ and fine bran for extra flavour and nutrition. 100% Australian grown, certified organic.",
    tips:"Slightly more complex flavour than roller-milled flour. Works beautifully for rustic country loaves at 72–76% hydration.",
  },
  {
    id:"f6", name:"Stoneground White Heritage Flour", brand:"Wholegrain Milling Co.",
    type:"Stoneground Heritage White", sizes:["5kg"],
    where:"Specialty stores, online",
    protein:13.2, energy:1405, fat:1.2, carbs:70, fibre:3.5, sodium:1,
    sourdoughRating:5, colour:"#DFD09A",
    description:"Pre-1960 wheat variety, unmodified genetics. 13.2% protein — one of the highest available to Aussie home bakers. Exceptional dough strength and flavour.",
    tips:"High protein means it can handle 80%+ hydration. A premium option for ambitious open-crumb bakes.",
  },
  {
    id:"f7", name:"White Bread Flour", brand:"Brero (Basic Ingredients)",
    type:"High-Protein White Bread", sizes:["1kg","5kg"],
    where:"basicingredients.com.au, selected specialty stores",
    protein:13.5, energy:1445, fat:1.0, carbs:74, fibre:2.3, sodium:2,
    sourdoughRating:5, colour:"#EDD9A3",
    description:"Specifically formulated for sourdough baking. Protein ranges 13.3–13.7% with absorption up to 70%. Designed for long fermentation, not commercial fast-dough process.",
    tips:"Purpose-built for sourdough. Excellent extensibility. Start at 75%, work up to 82% once comfortable.",
  },
  {
    id:"f8", name:"High Protein White Bread Flour", brand:"Flinders Ranges Premium Grain",
    type:"High-Protein White Bread", sizes:["2kg","20kg"],
    where:"youkneadsourdough.com.au, bakerstreat.com.au",
    protein:12.5, energy:1440, fat:1.1, carbs:73, fibre:2.4, sodium:2,
    sourdoughRating:5, colour:"#EEDDA5",
    description:"Single-origin flour from the Flinders Ranges, SA. Traceable paddock-to-baker. Bred for high protein and dough strength. Great tolerance for long mixing and fermentation.",
    tips:"Shorter best-before (6 months from milling) than other brands. Buy fresh. Excellent water absorption.",
  },
  {
    id:"f9", name:"Victory Premium Baker's Flour", brand:"MAURI",
    type:"Professional White Bread", sizes:["5kg","12.5kg","25kg"],
    where:"Foodservice suppliers, some specialty stores",
    protein:12.2, energy:1445, fat:1.0, carbs:74, fibre:2.3, sodium:2,
    sourdoughRating:5, colour:"#F0E0B0",
    description:"Used by professional artisan bakeries across Australia. Protein 11.5–12.8% (consistently high). Exceptional dough strength and extensibility. 100% Australian grown wheat.",
    tips:"The professional's choice. If you can source it, it produces reliably excellent loaves every bake.",
  },
  {
    id:"f10", name:"Organic Wholemeal Baker's Flour", brand:"Laucke",
    type:"Wholemeal Bread", sizes:["5kg"],
    where:"Health food stores, online",
    protein:13.0, energy:1380, fat:2.0, carbs:65, fibre:9.5, sodium:2,
    sourdoughRating:4, colour:"#C8A96E",
    description:"High-protein wholemeal for nutritious, flavourful loaves. Dense texture if used alone — best blended with white flour (up to 30%) for lighter results.",
    tips:"Substitute up to 30% of white flour for complex flavour and nutrition. Increase hydration by 3–5% when adding wholemeal.",
  },
  {
    id:"f11", name:"Organic Whole Rye Flour", brand:"Laucke",
    type:"Whole Rye", sizes:["5kg"],
    where:"Health food stores, online",
    protein:9.5, energy:1340, fat:1.7, carbs:66, fibre:13.0, sodium:2,
    sourdoughRating:4, colour:"#A08060",
    description:"Whole rye flour for dense, deeply flavoured loaves. Very high fibre — pentosans absorb water aggressively. Blend with wheat flour for accessible rye character.",
    tips:"Use 10–20% rye in your white sourdough for flavour complexity. Increase hydration by 5–8% when adding rye.",
  },
  {
    id:"f12", name:"Barossa Light Rye Flour", brand:"Laucke",
    type:"Light Rye", sizes:["4 × 600g"],
    where:"Woolworths, IGA",
    protein:8.8, energy:1330, fat:1.5, carbs:68, fibre:8.5, sodium:2,
    sourdoughRating:3, colour:"#B09070",
    description:"Light rye available at major supermarkets. Great for adding flavour and complexity without the density of whole rye. The most accessible rye flour in Australia.",
    tips:"Easy gateway into rye sourdough. Add 10–15% to a white loaf for noticeable depth without compromising structure.",
  },
  {
    id:"f13", name:"Organic Unbleached White Spelt Flour", brand:"Laucke",
    type:"Spelt", sizes:["5kg"],
    where:"Health food stores, online",
    protein:11.0, energy:1390, fat:1.8, carbs:68, fibre:4.5, sodium:2,
    sourdoughRating:3, colour:"#D4B896",
    description:"Ancient grain with nutty, slightly sweet flavour. Gluten is more fragile than wheat — handle gently. Naturally produces a flatter loaf. Excellent unique flavour profile.",
    tips:"Do not over-ferment spelt dough — gluten breaks down faster. Keep bulk at cooler temperatures.",
  },
  {
    id:"f14", name:"Bread & Pizza Plain Flour", brand:"Lighthouse",
    type:"Supermarket Bread Flour", sizes:["1kg"],
    where:"Woolworths, Coles, IGA — nationwide",
    protein:11.5, energy:1415, fat:1.0, carbs:73, fibre:2.5, sodium:2,
    sourdoughRating:2, colour:"#F5ECD8",
    description:"Most accessible bread flour in Australia — found everywhere. Protein at 11–12% is adequate for sourdough. Mix 50/50 with the Lighthouse Wholemeal version for better results.",
    tips:"For best sourdough results, blend 50% white + 50% wholemeal versions. Adds nutrients and helps rise with lower protein.",
  },
  /* ── WHOLEMEAL ── */
  {
    id:"f15", name:"Organic Wholemeal Flour", brand:"Demeter Farm Mill / Wholegrain Milling Co.",
    type:"Wholemeal", sizes:["5kg","12.5kg"],
    where:"Online, Harris Farm, health food stores",
    protein:13.5, energy:1370, fat:2.2, carbs:63, fibre:10.2, sodium:1,
    sourdoughRating:4, colour:"#BFA070",
    description:"Stone-milled organic wholemeal from Gunnedah NSW. High protein and full of natural flavour. Retains bran, germ, and endosperm for maximum nutrition.",
    tips:"Blend 20–30% with white flour for a flavourful open crumb. Increase hydration by 4–5% when using wholemeal.",
  },
  {
    id:"f16", name:"Wholemeal Plain Flour", brand:"Lighthouse",
    type:"Wholemeal", sizes:["1kg"],
    where:"Woolworths, Coles, IGA — nationwide",
    protein:12.5, energy:1360, fat:2.0, carbs:64, fibre:9.8, sodium:2,
    sourdoughRating:3, colour:"#C4A06A",
    description:"Most available wholemeal flour in Australia. Decent protein for supermarket flour. Works well blended 50/50 with the Lighthouse Bread flour for a nutritious everyday loaf.",
    tips:"Great entry point into wholemeal sourdough. Mix half-and-half with white bread flour for balanced results.",
  },
  {
    id:"f17", name:"Stoneground Wholemeal Baker's Flour", brand:"Wholegrain Milling Co.",
    type:"Wholemeal", sizes:["5kg"],
    where:"Specialty stores, online",
    protein:13.0, energy:1375, fat:2.1, carbs:64, fibre:9.5, sodium:1,
    sourdoughRating:5, colour:"#B89060",
    description:"Premium stoneground wholemeal milled in Gunnedah NSW. Excellent bran particle size for sourdough — not too coarse, retains gas well. Full-flavoured, nutty loaves.",
    tips:"Can be used up to 50% of total flour for a beautiful wholemeal sourdough. Autolyse 30–45 min to fully hydrate the bran.",
  },
  /* ── SPELT ── */
  {
    id:"f18", name:"Organic Wholemeal Spelt Flour", brand:"Laucke",
    type:"Spelt", sizes:["5kg"],
    where:"Health food stores, online",
    protein:12.5, energy:1380, fat:2.2, carbs:65, fibre:7.5, sodium:2,
    sourdoughRating:3, colour:"#C8A87A",
    description:"Wholemeal spelt with even more nutty depth than white spelt. Higher fibre, rich earthy flavour. Fragile gluten network — treat gently and keep fermentation shorter.",
    tips:"Blend max 30% with strong white flour. Avoid over-proofing. Cold retard (4°C) works well to control fermentation speed.",
  },
  {
    id:"f19", name:"White Spelt Flour", brand:"The Source Bulk Foods",
    type:"Spelt", sizes:["per kg bulk"],
    where:"The Source Bulk Foods (50+ stores nationally)",
    protein:11.2, energy:1385, fat:1.9, carbs:67, fibre:4.8, sodium:2,
    sourdoughRating:3, colour:"#D4B896",
    description:"Organic white spelt available in bulk — buy exactly what you need. Same ancient grain characteristics: nutty, sweet, fragile gluten. Often more digestible than modern wheat for sensitive individuals.",
    tips:"Short autolyse (15 min) helps hydration without overdeveloping fragile spelt gluten. Use a gentler shaping technique.",
  },
  /* ── RYE ── */
  {
    id:"f20", name:"Dark Rye Flour", brand:"Wholegrain Milling Co.",
    type:"Rye", sizes:["5kg"],
    where:"Specialty stores, online",
    protein:10.0, energy:1345, fat:1.8, carbs:65, fibre:14.5, sodium:1,
    sourdoughRating:4, colour:"#8A6848",
    description:"Dark rye with intense flavour and very high fibre. Milled in Gunnedah NSW. Stickier dough due to high pentosan content — more water absorption than standard rye flour.",
    tips:"Start with 10–20% rye in a white base dough. At higher percentages, use a tin for structure. Rye starters fed on this flour are very active.",
  },
  {
    id:"f21", name:"Organic Rye Flour", brand:"The Source Bulk Foods",
    type:"Rye", sizes:["per kg bulk"],
    where:"The Source Bulk Foods (50+ stores nationally)",
    protein:9.8, energy:1340, fat:1.7, carbs:66, fibre:13.2, sodium:2,
    sourdoughRating:3, colour:"#9A7858",
    description:"Organic rye available in bulk quantities. Good everyday rye flour for adding character to sourdough without committing to a large bag. Slightly lighter than dark rye.",
    tips:"Great for a 10% rye addition to white sourdough for extra flavour. Also excellent for feeding rye-based starters.",
  },
];

/* ─── STEP SETUP ─────────────────────────────────── */
const STEP_COLORS = ["#3A7A58","#5E9E6A","#5C5C5C","#606c38","#8A8A8A","#283618","#787878","#4A6628","#A0A0A0","#7A8A48"];
const DEFAULT_STEPS = [
  { id:"starter_peak", name:"Starter Peak",  duration:480 },
  { id:"make_levain",  name:"Make Levain",   duration:20  },
  { id:"autolyse",     name:"Autolyse",      duration:30  },
  { id:"levain_mix",   name:"Levain + Mix",  duration:20  },
  { id:"bulk",       name:"Bulk Ferment",  duration:240, sfCount:5 },
  { id:"divide",     name:"Divide & Pre-shape", duration:30  },
  { id:"shape",      name:"Pre-shape",     duration:15  },
  { id:"proof",      name:"Shape",         duration:60  },
  { id:"retard",     name:"Retard",        duration:720 },
  { id:"bake",       name:"Bake",          duration:45  },
];

/* ─── HELPERS ────────────────────────────────────── */
const fmt2    = n => String(n).padStart(2,"0");
const fmtTime = s => { if(s<=0)return"0:00"; const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; return h>0?`${h}:${fmt2(m)}:${fmt2(sec)}`:`${m}:${fmt2(sec)}`; };
const fmtDur  = min => { if(min<60)return`${min}m`; const h=Math.floor(min/60),m=min%60; return m?`${h}h ${m}m`:`${h}h`; };
const bkPct   = (g,base) => base?((g/base)*100).toFixed(1):"—";
const timeStr = ts => new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const uid     = () => Math.random().toString(36).slice(2,9);

/* ─── PRIMITIVES ─────────────────────────────────── */
const Card = ({children,style={}}) => <div style={{background:"#FFFFFF",borderRadius:20,border:"1px solid #E0DED8",padding:20,marginBottom:12,boxShadow:"0 1px 8px rgba(0,0,0,0.06)",...style}}>{children}</div>;
const Lbl  = ({children,style={}}) => <div style={{fontSize:11,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,...style}}>{children}</div>;
const SecH = ({children}) => <div style={{fontSize:13,fontWeight:600,color:"#606c38",margin:"20px 0 8px",paddingLeft:4}}>{children}</div>;
const Inp  = ({value,onChange,type="text",placeholder="",style={}}) => <input value={value} onChange={onChange} type={type} placeholder={placeholder} style={{background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",borderRadius:0,padding:"6px 2px",fontSize:15,color:"#283618",fontFamily:"inherit",outline:"none",width:"100%",...style}}/>;
const Stat = ({label,value,highlight,color}) => <div><div style={{fontSize:11,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{label}</div><div style={{fontSize:20,fontWeight:700,letterSpacing:"-0.02em",color:highlight?"#9E3A3A":color||"#FFFFFF"}}>{value}</div></div>;
const Badge = ({children,color="#5C5C5C"}) => <span style={{background:color+"18",color,fontSize:11,fontWeight:600,borderRadius:8,padding:"3px 9px",display:"inline-block"}}>{children}</span>;

function Stars({count,max=5,color="#5C5C5C",size=14}) {
  return <span>{[...Array(max)].map((_,i)=><span key={i} style={{fontSize:size,color:i<count?color:"#E0DED8"}}> ★</span>)}</span>;
}

function Ring({progress,size=130,stroke=11,color="#5C5C5C",children}){
  const r=(size-stroke)/2,circ=2*Math.PI*r,offset=circ*(1-Math.max(0,Math.min(1,progress)));
  return <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",position:"absolute",inset:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E0DED8" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{transition:"stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)"}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>{children}</div>
  </div>;
}

/* ─── DEFAULT RECIPE FACTORY ─────────────────────── */
const makeRecipe = () => ({
  id: uid(),
  name: "New Recipe",
  loaves: "2", loafG: "900", ddt: "78",
  ingredients: [
    { id:uid(), type:"flour", flourId:"f2", label:"White Baker's Flour", grams:"1000" },
    { id:uid(), type:"other", flourId:null,  label:"Water",              grams:"750"  },
    { id:uid(), type:"other", flourId:null,  label:"Salt",               grams:"20"   },
    { id:uid(), type:"other", flourId:null,  label:"Levain",             grams:"200"  },
  ],
  levain: { flour:"100", water:"100", starter:"20", duration:"12" },
  levainRating: 0, levainNotes: "",
  steps: DEFAULT_STEPS.map((s,i)=>({sfCount:0,...s,durationMin:s.duration,color:STEP_COLORS[i]})),
  autolyseEnabled: true,
  stepUnit: Object.fromEntries(DEFAULT_STEPS.map(s=>[s.id,"min"])),
  notes: "",
  tempUnit: "F",
});

/* ════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════ */
export default function App() {
  const [view,setView]             = useState(()=>{
    try {
      const saved = localStorage.getItem('bakeIt_view');
      return (saved && Object.values(VIEWS).includes(saved)) ? saved : VIEWS.RECIPES;
    } catch { return VIEWS.RECIPES; }
  });
  const [recipes,setRecipes] = useState([]);
  const [editId,setEditId]         = useState(null);
  const [selectedId,setSelectedId] = useState(null);

  // bake state
  const [activeStep,setActiveStep]   = useState(null);
  const [stepStartTimes,setSST]      = useState({});
  const [sfDone,setSfDone]           = useState({});
  const [bakeStarted,setBakeStarted] = useState(false);
  const [bakeStartTime,setBST]       = useState(null);
  const [tick,setTick]               = useState(0);
  const [stepNotes,setStepNotes]     = useState({});
  const [stepPhotos,setStepPhotos]   = useState({});
  const [sessionNotes,setSessionNotes] = useState("");
  const [editingStep,setEditingStep] = useState(null);
  const [savedLogs,setSavedLogs]       = useState([]);
  const [viewingLog,setViewingLog]     = useState(null);
  const [swipedLogId,setSwipedLogId]   = useState(null); // id of log currently swiped open
  const [steamDone,setSteamDone]       = useState(false);
  const [foldNotes,setFoldNotes]       = useState({});  // {foldN: {note, photo}}
  const [foldPhotos,setFoldPhotos]     = useState({});  // {foldN: src}
  const [foldPhotoTarget,setFoldPhotoTarget] = useState(null); // foldN being targeted
  const [expandedFold,setExpandedFold] = useState(null);
  const [reviewPhotoTarget,setReviewPhotoTarget] = useState(null); // "key" for review photo
  const [reviewPhotoHandler,setReviewPhotoHandler] = useState(null); // callback fn
  const [photoTarget,setPhotoTarget] = useState(null);
  const fileRef = useRef(null);

  // ── DB: loading state ────────────────────────────────
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError,   setDbError]   = useState(null);

  // ── DB: load recipes + logs on mount ─────────────────

  // ── DB: save recipe ───────────────────────────────────
  const saveRecipe = useCallback(async (recipe) => {
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      });
      const json = await res.json();
      console.log('[BakeIt] saveRecipe', recipe.name, '→', json);
    } catch (e) { console.warn('[BakeIt] saveRecipe failed:', e); }
  }, []);

  // ── DB: delete recipe ─────────────────────────────────
  const deleteRecipeDB = useCallback(async (id) => {
    try { await fetch(`/api/recipes/${id}`, { method: 'DELETE' }); }
    catch (e) { console.warn('Delete recipe failed:', e); }
  }, []);

  // ── DB: save bake log ─────────────────────────────────
  const saveBakeLog = useCallback(async (log) => {
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
      const json = await res.json();
      console.log('[BakeIt] saveBakeLog', log.recipeName||log.id, '→', json);
    } catch (e) { console.warn('[BakeIt] saveBakeLog failed:', e); }
  }, []);

  // ── DB: delete log ────────────────────────────────────
  const deleteLogDB = useCallback(async (id) => {
    try { await fetch(`/api/logs/${id}`, { method: 'DELETE' }); }
    catch (e) { console.warn('Delete log failed:', e); }
  }, []);

  // ── DB: auto-save recipes on change (debounced) ───────
  const recipeSaveTimer = useRef({});
  const scheduleRecipeSave = useCallback((recipe) => {
    clearTimeout(recipeSaveTimer.current[recipe.id]);
    recipeSaveTimer.current[recipe.id] = setTimeout(() => saveRecipe(recipe), 1200);
  }, [saveRecipe]);

  // ── DB: auto-save logs on change (debounced) ──────────
  const logSaveTimer = useRef({});
  const scheduleLogSave = useCallback((log) => {
    clearTimeout(logSaveTimer.current[log.id]);
    logSaveTimer.current[log.id] = setTimeout(() => saveBakeLog(log), 1200);
  }, [saveBakeLog]);

  useEffect(() => {
    // Ensure tables exist (idempotent), then load data
    // Stable IDs so defaults can be detected in DB without duplication
    const mkSteps = () => DEFAULT_STEPS.map((st,i)=>({sfCount:0,...st,durationMin:st.duration,color:STEP_COLORS[i]}));
    const STARTER_RECIPES = [
      {...makeRecipe(),id:"starter-1",name:"Classic Country Loaf",loaves:"2",loafG:"900",ddt:"78",steps:mkSteps(),ingredients:[{id:"s1-f1",type:"flour",flourId:"f2",label:"White Baker's Flour",grams:"900"},{id:"s1-f2",type:"flour",flourId:"f11",label:"Wholemeal Flour",grams:"100"},{id:"s1-w",type:"other",flourId:null,label:"Water",grams:"750"},{id:"s1-s",type:"other",flourId:null,label:"Salt",grams:"20"},{id:"s1-l",type:"other",flourId:null,label:"Levain",grams:"200"}],notes:"A reliable everyday loaf. 75% hydration, 10% wholemeal for flavour and crust colour. Retard overnight in the fridge for deeper sour notes."},
      {...makeRecipe(),id:"starter-2",name:"Tartine-Style 78%",loaves:"1",loafG:"950",ddt:"80",steps:mkSteps(),ingredients:[{id:"s2-f1",type:"flour",flourId:"f2",label:"White Baker's Flour",grams:"900"},{id:"s2-f2",type:"flour",flourId:"f11",label:"Wholemeal Flour",grams:"100"},{id:"s2-w",type:"other",flourId:null,label:"Water",grams:"780"},{id:"s2-s",type:"other",flourId:null,label:"Salt",grams:"20"},{id:"s2-l",type:"other",flourId:null,label:"Levain",grams:"200"}],notes:"Based on the Tartine country bread. High hydration produces an open, irregular crumb with a glossy crust. Requires confident shaping."},
      {...makeRecipe(),id:"starter-3",name:"Light Rye Sourdough",loaves:"2",loafG:"800",ddt:"76",steps:mkSteps(),ingredients:[{id:"s3-f1",type:"flour",flourId:"f2",label:"White Baker's Flour",grams:"800"},{id:"s3-f2",type:"flour",flourId:"f15",label:"Light Rye Flour",grams:"200"},{id:"s3-w",type:"other",flourId:null,label:"Water",grams:"720"},{id:"s3-s",type:"other",flourId:null,label:"Salt",grams:"20"},{id:"s3-l",type:"other",flourId:null,label:"Levain",grams:"220"}],notes:"20% rye adds complexity and speeds fermentation. Slightly stickier dough — wet hands for folding. Excellent with aged cheddar."},
      {...makeRecipe(),id:"starter-4",name:"Whole Wheat 50%",loaves:"2",loafG:"850",ddt:"77",steps:mkSteps(),ingredients:[{id:"s4-f1",type:"flour",flourId:"f2",label:"White Baker's Flour",grams:"500"},{id:"s4-f2",type:"flour",flourId:"f11",label:"Wholemeal Flour",grams:"500"},{id:"s4-w",type:"other",flourId:null,label:"Water",grams:"750"},{id:"s4-s",type:"other",flourId:null,label:"Salt",grams:"20"},{id:"s4-l",type:"other",flourId:null,label:"Levain",grams:"200"}],notes:"Equal parts wholemeal and white. Nutty, wheaty flavour with a tight, even crumb. Autolyse is important — wholemeal absorbs slowly."},
      {...makeRecipe(),id:"starter-5",name:"Spelt & Honey",loaves:"1",loafG:"900",ddt:"76",steps:mkSteps(),ingredients:[{id:"s5-f1",type:"flour",flourId:"f2",label:"White Baker's Flour",grams:"700"},{id:"s5-f2",type:"flour",flourId:"f18",label:"Spelt Flour",grams:"300"},{id:"s5-w",type:"other",flourId:null,label:"Water",grams:"720"},{id:"s5-s",type:"other",flourId:null,label:"Salt",grams:"18"},{id:"s5-l",type:"other",flourId:null,label:"Levain",grams:"180"},{id:"s5-h",type:"other",flourId:null,label:"Honey",grams:"20"}],notes:"30% spelt gives a slightly sweet, nutty loaf with a soft crumb. Spelt ferments fast — watch your dough carefully in warm weather."},
    ];

    fetch('/api/db-init')
      .then(() => Promise.all([
        fetch('/api/recipes').then(r => r.json()),
        fetch('/api/logs').then(r => r.json()),
      ]))
      .then(([recipeData, logData]) => {
        // Merge DB recipes with any missing starters
        const dbRecipes = Array.isArray(recipeData) ? recipeData : [];
        const dbIds = new Set(dbRecipes.map(r => r.id));
        const missingStarters = STARTER_RECIPES.filter(r => !dbIds.has(r.id));
        missingStarters.forEach(r => saveRecipe(r));

        // Migrate existing starter recipes that are missing starter_peak / make_levain steps
        const PREPEND_STEPS = [
          { id:"starter_peak", name:"Starter Peak", duration:480, durationMin:480, sfCount:0, color:STEP_COLORS[0] },
          { id:"make_levain",  name:"Make Levain",  duration:20,  durationMin:20,  sfCount:0, color:STEP_COLORS[1] },
        ];
        const patchedDbRecipes = dbRecipes.map(r => {
          const starterIds = new Set(STARTER_RECIPES.map(s => s.id));
          if (!starterIds.has(r.id)) return r; // user recipe — don't touch
          const stepIds = new Set((r.steps||[]).map(s => s.id));
          const missing = PREPEND_STEPS.filter(s => !stepIds.has(s.id));
          if (missing.length === 0) return r;
          const patched = { ...r, steps: [...missing, ...(r.steps||[])] };
          saveRecipe(patched);
          return patched;
        });

        const allRecipesLoaded = dbRecipes.length > 0
          ? [...patchedDbRecipes, ...missingStarters]
          : STARTER_RECIPES;
        setRecipes(allRecipesLoaded);
        if (Array.isArray(logData) && logData.length > 0) setSavedLogs(logData);
        // Restore active bake AFTER recipes are loaded so bakeRecipe resolves
        try {
          const saved = localStorage.getItem('bakeIt_activeBake');
          if (saved) {
            const b = JSON.parse(saved);
            const recipeExists = allRecipesLoaded.find(r => r.id === b.selectedId);
            if (b.bakeStarted && b.selectedId && recipeExists) {
              setSelectedId(b.selectedId);
              setBakeStarted(true);
              setBST(b.bakeStartTime);
              setActiveStep(b.activeStep);
              setSST(b.stepStartTimes||{});
              setStepNotes(b.stepNotes||{});
              setSessionNotes(b.sessionNotes||'');
              setFoldNotes(b.foldNotes||{});
              setSteamDone(b.steamDone||false);
              setView(VIEWS.BAKE);
            }
          }
        } catch(e) {}
        setDbLoading(false);
      })
      .catch(err => {
        setDbError(err.message);
        setDbLoading(false);
      });
  }, []);


  // ingredients page state
  const [flourSearch,setFlourSearch]   = useState("");
  const [flourFilter,setFlourFilter]   = useState("All");
  const [expandedFlour,setExpandedFlour] = useState(null);
  const [userFlours,setUserFlours]       = useState([]);
  const [showAddFlour,setShowAddFlour]   = useState(false);
  const [newFlour,setNewFlour]           = useState({name:"",brand:"",type:"Custom",protein:"",where:"",description:"",tips:""});


  // ── Persist bake state across refresh ───────────────
  // (Restore happens inside DB load effect, after recipes are available)
  // Save on every change
  useEffect(() => {
    if (!bakeStarted) {
      localStorage.removeItem('bakeIt_activeBake');
      return;
    }
    try {
      localStorage.setItem('bakeIt_activeBake', JSON.stringify({
        bakeStarted, selectedId,
        bakeStartTime, activeStep,
        stepStartTimes, stepNotes,
        sessionNotes, foldNotes, steamDone,
      }));
    } catch(e) {}
  }, [bakeStarted, selectedId, bakeStartTime, activeStep, stepStartTimes, stepNotes, sessionNotes, foldNotes, steamDone]);

  useEffect(()=>{ if(!bakeStarted)return; const id=setInterval(()=>setTick(t=>t+1),1000); return()=>clearInterval(id); },[bakeStarted]);

  const bakeRecipe = selectedId ? recipes.find(r=>r.id===selectedId) : null;
  const editRecipe = editId     ? recipes.find(r=>r.id===editId)     : null;

  // timer helpers
  const elapsed   = useCallback((idx)=>{ const st=stepStartTimes[idx]; if(st==null)return 0; return Math.floor((Date.now()-st)/1000); },[stepStartTimes,tick]);
  const totalSec  = idx => (bakeRecipe?.steps[idx]?.durationMin||1)*60;
  const prog      = idx => Math.min(1,elapsed(idx)/totalSec(idx));
  const remaining = idx => Math.max(0,totalSec(idx)-elapsed(idx));
  const sfIv      = idx => { const s=bakeRecipe?.steps[idx]; if(!s?.sfCount)return null; return Math.floor((s.durationMin*60)/(s.sfCount+1)); };
  const nextSfIn  = idx => { const iv=sfIv(idx); if(!iv)return null; const done=sfDone[idx]?.size||0; return Math.max(0,(done+1)*iv-elapsed(idx)); };

  const startBake = recipe => {
    const now=Date.now();
    setSelectedId(recipe.id); setBakeStarted(true); setBST(now);
    setActiveStep(0); setSST({0:now}); setStepNotes({}); setStepPhotos({}); setSfDone({});
    setView(VIEWS.BAKE);
  };
  const completeStep = idx => {
    const steps=bakeRecipe?.steps||[]; const next=idx+1,now=Date.now();
    setActiveStep(next<steps.length?next:null);
    if(next<steps.length) setSST(p=>({...p,[next]:now}));
  };
  const toggleSF = (si,n) => setSfDone(prev=>{ const s=new Set(prev[si]||[]); s.has(n)?s.delete(n):s.add(n); return{...prev,[si]:s}; });
  const handlePhoto = e => {
    const file=e.target.files[0]; if(!file) return;
    e.target.value="";
    // Compress before storing — resize to max 1200px, JPEG 0.75
    const compressImage = (f) => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1200;
          let w = img.width, h = img.height;
          if(w > MAX || h > MAX) {
            if(w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else       { w = Math.round(w * MAX / h); h = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(f);
    });
    compressImage(file).then(src => {
      if(reviewPhotoHandler){
        reviewPhotoHandler(src);
        setReviewPhotoHandler(null);
      } else if(foldPhotoTarget!=null){
        setFoldPhotos(p=>({...p,[foldPhotoTarget]:src}));
        setFoldPhotoTarget(null);
      } else if(photoTarget!=null){
        setStepPhotos(p=>({...p,[photoTarget]:[...(p[photoTarget]||[]),{src,ts:Date.now()}]}));
      }
    });
  };


  const finishBake = () => {
    if(!bakeRecipe) return;
    const log = {
      id: uid(),
      recipeName: bakeRecipe.name,
      recipeId: bakeRecipe.id,
      startTime: bakeStartTime,
      endTime: Date.now(),
      stepNotes: {...stepNotes},
      stepPhotos: {...stepPhotos},
      sessionNotes,
      foldNotes: {...foldNotes},
      foldPhotos: {...foldPhotos},
      autolyseEnabled: bakeRecipe.autolyseEnabled,
      ingredients: bakeRecipe.ingredients,
      steps: bakeRecipe.steps,
      loaves: bakeRecipe.loaves,
      loafG: bakeRecipe.loafG,
      rating: 0,
    };
    setSavedLogs(prev => [log, ...prev]);
    saveBakeLog(log);
    // reset bake state
    setSelectedId(null);
    setBakeStarted(false);
    setBST(null);
    setActiveStep(null);
    setSST({});
    setSfDone({});
    setStepNotes({});
    setStepPhotos({});
    setSessionNotes("");
    setFoldNotes({});
    setFoldPhotos({});
    setExpandedFold(null);
    setSteamDone(false);
    setView(VIEWS.LOG);
  };

  // recipe helpers
  // Persist last view
  useEffect(()=>{ try { localStorage.setItem('bakeIt_view', view); } catch {} }, [view]);

  const upd  = (id,fn) => setRecipes(rs=>{ const next=rs.map(r=>r.id===id?fn(r):r); const changed=next.find(r=>r.id===id); if(changed) scheduleRecipeSave(changed); return next; });
  const updE = fn => editId && upd(editId,fn);
  const addRecipe = () => { const r=makeRecipe(); setRecipes(rs=>[...rs,r]); saveRecipe(r); setEditId(r.id); setView(VIEWS.RECIPES); };

  // flour filter
  const allFlours = [...FLOUR_DB, ...userFlours];
  const flourTypes = ["All",...new Set(allFlours.map(f=>f.type))];
  const filtered = allFlours.filter(f=>{
    const t=flourFilter==="All"||f.type===flourFilter;
    const q=!flourSearch||[f.name,f.brand,f.type].some(x=>x.toLowerCase().includes(flourSearch.toLowerCase()));
    return t&&q;
  });

  const TABS = [
    {v:VIEWS.RECIPES,    l:"Recipes", icon:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="15" y1="13" x2="9" y2="13"/><line x1="15" y1="17" x2="9" y2="17"/><line x1="10" y1="9" x2="9" y2="9"/></svg>},
    {v:VIEWS.BAKE,       l:"Bake",    icon:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-2 2.5-3 5-2 7.5 0 0-1.5-.5-1-2.5C7 9 5 11.5 5 14a7 7 0 0 0 14 0c0-4-4-8-7-12z"/><path d="M12 22c0 0-2-2-2-4s2-3 2-3 2 1 2 3-2 4-2 4z" strokeWidth="1.5" strokeOpacity="0.6"/></svg>},
    {v:VIEWS.LOG,        l:"Log",     icon:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>},
    {v:VIEWS.INGREDIENTS,l:"Flours",  icon:<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="7" width="12" height="14" rx="2"/><rect x="5" y="4" width="14" height="4" rx="1.5"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15" x2="12" y2="15"/></svg>},
  ];

  return (
    <>
    {dbLoading && (
      <div style={{position:"fixed",inset:0,background:"#283618",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,flexDirection:"column",gap:12}}>
        <div style={{width:56,height:56,borderRadius:14,border:"2px solid rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:28,fontWeight:700,color:"#FFFFFF",fontFamily:"'Open Sans',sans-serif",letterSpacing:"-0.03em",lineHeight:1}}>B</span>
        </div>
        <p style={{color:"rgba(255,255,255,0.6)",fontSize:14,fontFamily:"'Open Sans',sans-serif"}}>Loading your recipes…</p>
      </div>
    )}
    <div style={{minHeight:"100vh",background:"#F8F8F6",fontFamily:"'Open Sans', sans-serif",color:"#283618"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}
        input,textarea,button,select{font-family:inherit}
        input,textarea,select{transition:border-color 0.2s}
        input:focus,textarea:focus,select:focus{outline:none;border-bottom-color:#606c38!important;background:transparent!important}
        input::placeholder,textarea::placeholder{color:#ACACAC}
        input[type=number]::-webkit-inner-spin-button{opacity:0.4}
        select:focus{outline:none}
        button{border:none;cursor:pointer}
        button:active{opacity:0.75;transform:scale(0.97)}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#D8D8D4;border-radius:2px}
        select option{background:#FFFFFF;color:#283618}
        @keyframes su{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .su{animation:su 0.3s cubic-bezier(0.2,0,0,1) forwards}
        .pulse{animation:pulse 1.8s ease-in-out infinite}

      `}</style>

      {/* TOP NAV — logo + safe area top */}
      <nav style={{background:"#283618",position:"sticky",top:0,zIndex:100,paddingTop:"env(safe-area-inset-top)",borderBottom:"0.5px solid rgba(255,255,255,0.1)"}}>
        <div style={{height:36}}></div>
      </nav>

      {/* BOTTOM TAB BAR */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"#283618",borderTop:"0.5px solid rgba(255,255,255,0.1)"}}>
        <div style={{display:"flex",alignItems:"stretch",height:61,padding:"5px 8px 0"}}>
          {TABS.map(({v,l,icon})=>{
            const active=view===v&&!editId;
            return <button key={v} onClick={()=>{setEditId(null);setView(v);}}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,background:"none",border:"none",padding:"6px 4px 8px",minWidth:0,cursor:"pointer"}}>
              <div style={{width:23,height:23,display:"flex",alignItems:"center",justifyContent:"center",color:active?"#FFFFFF":"rgba(255,255,255,0.5)",flexShrink:0}}>
                {icon}
              </div>
              <span style={{fontSize:11,fontWeight:active?700:500,color:active?"#FFFFFF":"rgba(255,255,255,0.5)",letterSpacing:"0.02em",whiteSpace:"nowrap",lineHeight:1}}>{l}</span>
            </button>;
          })}
        </div>
        {/* Safe area spacer — sits below the tab row, fills home indicator zone */}
        <div style={{height:"env(safe-area-inset-bottom,20px)",minHeight:20,background:"#283618"}}/>
      </div>

      <div style={{maxWidth:580,margin:"0 auto",padding:"20px 16px calc(60px + max(env(safe-area-inset-bottom,0px),16px) + 16px)"}}>

        {/* ══════════════════════════════
            HOME / DASHBOARD
        ══════════════════════════════ */}
        {view===VIEWS.HOME && <div className="su">

          {/* Active Bake Banner — full bleed, most prominent */}
          {bakeStarted&&bakeRecipe&&(()=>{
            const activeSteps=bakeRecipe.autolyseEnabled?bakeRecipe.steps:bakeRecipe.steps.filter(s=>s.id!=="autolyse");
            const totalStepMin=activeSteps.reduce((a,s)=>a+s.durationMin,0);
            const estFinish=bakeStartTime?new Date(bakeStartTime+totalStepMin*60000):null;
            const estNow=new Date();
            const isTomorrow=estFinish&&(estFinish.getDate()!==estNow.getDate());
            const estStr=estFinish?(isTomorrow?"Tomorrow ":"")+estFinish.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):null;
            const curStep=activeStep!=null&&activeStep<activeSteps.length?activeSteps[activeStep]:null;
            return <div onClick={()=>setView(VIEWS.BAKE)}
              style={{background:"#283618",borderRadius:20,padding:"20px",marginBottom:20,cursor:"pointer",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,right:0,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.04)",transform:"translate(30px,-30px)"}}/>
              <div style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Bake in progress</div>
              <div style={{fontSize:22,fontWeight:700,color:"#FFFFFF",letterSpacing:"-0.02em",marginBottom:4}}>{bakeRecipe.name}</div>
              {curStep&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:curStep.color,flexShrink:0}}/>
                <span style={{fontSize:14,color:"rgba(255,255,255,0.7)",fontWeight:500}}>{curStep.name}</span>
              </div>}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                {estStr&&<div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:1}}>Est. finish</div>
                  <div style={{fontSize:16,fontWeight:600,color:"#8BC44A"}}>{estStr}</div>
                </div>}
                <div style={{background:"rgba(255,255,255,0.12)",borderRadius:10,padding:"8px 16px",fontSize:13,fontWeight:600,color:"#FFFFFF"}}>Continue →</div>
              </div>
            </div>;
          })()}

          {/* Section: Your Recipes */}
          <div style={{marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:13,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em"}}>Recipes</div>
            <button onClick={()=>setView(VIEWS.RECIPES)} style={{fontSize:12,fontWeight:600,color:"#606c38",background:"none",border:"none",padding:"4px 0"}}>See all →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {recipes.slice(0,3).map(r=>{
              const totalMin=(r.autolyseEnabled?r.steps:r.steps.filter(s=>s.id!=="autolyse")).reduce((a,s)=>a+s.durationMin,0);
              return <div key={r.id} style={{background:"#FFFFFF",borderRadius:16,padding:"14px 16px",border:"1px solid #E0DED8",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:"#283618",marginBottom:3}}>{r.name}</div>
                  <div style={{fontSize:12,color:"#6E6E6E"}}>{r.loaves}×{r.loafG}g · {fmtDur(totalMin)}</div>
                </div>
                <button onClick={()=>startBake(r)} style={{background:"#283618",color:"#FFFFFF",border:"none",borderRadius:12,padding:"9px 16px",fontSize:13,fontWeight:600,flexShrink:0}}>Bake</button>
              </div>;
            })}
            {recipes.length===0&&<Card><p style={{fontSize:14,color:"#6E6E6E",textAlign:"center",padding:"8px 0"}}>No recipes yet.</p></Card>}
          </div>

          {/* Section: Recent Bakes */}
          {savedLogs.length>0&&<>
            <div style={{marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:13,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em"}}>Recent Bakes</div>
              <button onClick={()=>setView(VIEWS.LOG)} style={{fontSize:12,fontWeight:600,color:"#606c38",background:"none",border:"none",padding:"4px 0"}}>See all →</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
              {savedLogs.slice(0,3).map(log=>(
                <button key={log.id} onClick={()=>{setViewingLog(log.id);setView(VIEWS.LOG);}}
                  style={{background:"#FFFFFF",borderRadius:16,padding:"14px 16px",border:"1px solid #E0DED8",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:600,color:"#283618",marginBottom:3}}>{log.recipeName||"Untitled"}</div>
                    <div style={{fontSize:12,color:"#6E6E6E"}}>{new Date(log.startTime).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}{log.review?.rating?` · ${"★".repeat(log.review.rating)}`:""}</div>
                  </div>
                  <span style={{color:"#C8C8C0",fontSize:16}}>›</span>
                </button>
              ))}
            </div>
          </>}

        </div>}

        {view===VIEWS.RECIPES && !editId && <div className="su">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
            <div>
              <div style={{fontSize:26,fontWeight:700,letterSpacing:"-0.03em",marginBottom:2}}>Recipes</div>
              <div style={{fontSize:14,color:"#606c38"}}>{recipes.length} saved</div>
            </div>
            <button onClick={addRecipe} style={{padding:"10px 18px",borderRadius:14,background:"#283618",color:"#F8F8F6",fontSize:14,fontWeight:600}}>+ New</button>
          </div>

          {recipes.map(r=>{
            const primaryFlourIng = r.ingredients.find(i=>i.type==="flour");
            const primaryFlour    = primaryFlourIng?.flourId ? FLOUR_DB.find(f=>f.id===primaryFlourIng.flourId) : null;
            const flourG          = r.ingredients.filter(i=>i.type==="flour").reduce((a,i)=>a+(parseFloat(i.grams)||0),0);
            const totalMin        = (r.autolyseEnabled?r.steps:r.steps.filter(s=>s.id!=="autolyse")).reduce((a,s)=>a+s.durationMin,0);
            return <Card key={r.id} style={{padding:0,overflow:"hidden"}}>

              <div style={{padding:"16px 18px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
                  <div style={{fontSize:18,fontWeight:700,letterSpacing:"-0.02em"}}>{r.name}</div>
                  <div style={{display:"flex",gap:8,flexShrink:0}}>
                    <button onClick={()=>setEditId(r.id)} style={{padding:"6px 13px",borderRadius:10,background:"#EFEFED",color:"#283618",fontSize:13,fontWeight:600}}>Edit</button>
                    <button onClick={()=>startBake(r)} style={{padding:"6px 14px",borderRadius:10,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:600}}>Bake →</button>
                  </div>
                </div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:12}}>
                  <Badge color="#606c38">{r.loaves} × {r.loafG}g</Badge>
                  {r.ddt && <Badge color="#606c38">DDT {r.tempUnit==="C"?Math.round((parseInt(r.ddt)-32)*5/9):parseInt(r.ddt)}°{r.tempUnit||"F"}</Badge>}
                  <Badge color="#5C5C5C">{fmtDur(totalMin)}</Badge>
                  {primaryFlour && <Badge color="#5C5C5C">{primaryFlour.brand} · {primaryFlour.protein}g protein</Badge>}
                </div>
                {/* ingredient summary */}
                <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                  {r.ingredients.filter(i=>parseFloat(i.grams)).map(i=>{
                    const f=i.flourId?FLOUR_DB.find(fl=>fl.id===i.flourId):null;
                    return <div key={i.id}>
                      <div style={{fontSize:10,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{f?f.name:i.label}</div>
                      <div style={{fontSize:15,fontWeight:700}}>{i.grams}g</div>
                      {i.type!=="flour"&&flourG>0&&<div style={{fontSize:11,color:"#5C5C5C",fontWeight:600}}>{bkPct(parseFloat(i.grams),flourG)}%</div>}
                    </div>;
                  })}
                </div>
              </div>
              <div style={{padding:"10px 18px",background:"#FFFFFF",borderTop:"0.5px solid #E0DED8",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#606c38",flex:1,marginRight:12}}>{r.notes||"No notes"}</span>
                <button onClick={()=>{setRecipes(rs=>rs.filter(x=>x.id!==r.id));deleteRecipeDB(r.id);}} style={{fontSize:12,color:"#9E3A3A",background:"none",fontWeight:600,flexShrink:0}}>Delete</button>
              </div>
            </Card>;
          })}
          {recipes.length===0 && <Card><p style={{textAlign:"center",color:"#606c38",padding:"20px 0"}}>No recipes yet — tap + New to start.</p></Card>}
        </div>}

        {/* ══════════════════════════════
            RECIPE EDITOR
        ══════════════════════════════ */}
        {view===VIEWS.RECIPES && editId && editRecipe && <div className="su">
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button onClick={()=>setEditId(null)} style={{width:34,height:34,borderRadius:10,background:"#283618",color:"#F8F8F6",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600}}>←</button>
            <div style={{flex:1,fontSize:22,fontWeight:700,letterSpacing:"-0.02em"}}>Edit Recipe</div>
            <button onClick={()=>{startBake(editRecipe);setEditId(null);}} style={{padding:"8px 16px",borderRadius:12,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:600}}>Bake →</button>
          </div>

          {/* Name */}
          <Card>
            <input value={editRecipe.name} onChange={e=>updE(r=>({...r,name:e.target.value}))} placeholder="Recipe name"
              style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",borderRadius:0,padding:"6px 2px",fontSize:20,fontWeight:700,color:"#283618",outline:"none",letterSpacing:"-0.02em"}}/>
          </Card>

          {/* Session setup */}
          <SecH>Session Setup</SecH>
          <Card>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              {[{l:"Loaves",k:"loaves"},{l:"Loaf (g)",k:"loafG"}].map(f=>(
                <div key={f.k}><Lbl>{f.l}</Lbl><Inp value={editRecipe[f.k]} onChange={e=>updE(r=>({...r,[f.k]:e.target.value}))} type="number"/></div>
              ))}
              <div>
                <Lbl>DDT</Lbl>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Inp type="number" value={editRecipe.ddt} style={{flex:1}}
                    onChange={e=>updE(r=>({...r,ddt:e.target.value}))}/>
                  <div style={{display:"flex",gap:2,flexShrink:0}}>
                    {["F","C"].map(u=><button key={u}
                      onClick={()=>{
                        const cur=editRecipe.tempUnit||"F";
                        if(u===cur)return;
                        const curVal=parseInt(editRecipe.ddt)||78;
                        const converted=u==="C"?Math.round((curVal-32)*5/9):Math.round(curVal*9/5+32);
                        updE(r=>({...r,tempUnit:u,ddt:String(converted)}));
                      }}
                      style={{fontSize:11,fontWeight:600,padding:"3px 7px",borderRadius:6,background:(editRecipe.tempUnit||"F")===u?"#283618":"transparent",color:(editRecipe.tempUnit||"F")===u?"#F8F8F6":"#ACACAC",border:"none",transition:"all 0.15s",cursor:"pointer"}}>°{u}</button>)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Dough formula */}
          <SecH>Dough Formula</SecH>
          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 72px 64px 30px",padding:"9px 16px",background:"#E0DED8",borderBottom:"0.5px solid #E0DED8",gap:8,alignItems:"center"}}>
              {["Ingredient","Grams","Baker's %",""].map((h,i)=><div key={i} style={{fontSize:10,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",textAlign:i===1||i===2?"center":"left"}}>{h}</div>)}
            </div>

            {editRecipe.ingredients.map((ing,idx)=>{
              const totalFlourG=editRecipe.ingredients.filter(i=>i.type==="flour").reduce((a,i)=>a+(parseFloat(i.grams)||0),0);
              const grams =parseFloat(ing.grams)||0;
              const pct   =totalFlourG?bkPct(grams,totalFlourG):"—";
              const flour =ing.flourId?FLOUR_DB.find(f=>f.id===ing.flourId):null;

              return <div key={ing.id} style={{borderBottom:idx<editRecipe.ingredients.length-1?"0.5px solid #1E2C30":"none"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 72px 64px 30px",padding:"10px 16px",alignItems:"center",gap:8}}>
                  <div>
                    {ing.type==="flour" ? (
                      <div>
                        {ing.manual ? (
                          /* Manual free-text entry */
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <input
                              autoFocus
                              value={ing.label}
                              onChange={e=>updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,label:e.target.value}:i)}))}
                              placeholder="Enter flour name…"
                              style={{background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"5px 2px",fontSize:14,fontWeight:600,color:"#283618",outline:"none",flex:1}}/>
                            <button
                              onClick={()=>updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,manual:false,label:"",flourId:""}:i)}))}
                              style={{fontSize:10,fontWeight:600,color:"#606c38",background:"#EFEFED",border:"none",borderRadius:8,padding:"3px 7px",whiteSpace:"nowrap",flexShrink:0}}>
                              Use list
                            </button>
                          </div>
                        ) : (
                          /* Dropdown from DB */
                          <div>
                            <select value={ing.flourId||""}
                              onChange={e=>{
                                const v=e.target.value;
                                if(v==="__manual__"){
                                  updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,manual:true,flourId:"",label:""}:i)}));
                                } else if(v.startsWith("__gen_")){
                                  const genNames={"__gen_hipro__":"High Protein White Flour","__gen_white__":"White Flour","__gen_wholemeal__":"Wholemeal Flour","__gen_spelt__":"Spelt Flour","__gen_rye__":"Rye Flour","__gen_einkorn__":"Einkorn Flour","__gen_emmer__":"Emmer Flour","__gen_khorasan__":"Khorasan (Kamut) Flour"};
                                  updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,flourId:v,label:genNames[v]||"Flour",protein:i.protein||""}:i)}));
                                } else {
                                  const f=FLOUR_DB.find(fl=>fl.id===v);
                                  updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,flourId:v,label:f?f.name:i.label,protein:""}:i)}));
                                }
                              }}
                              style={{background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"5px 2px",fontSize:14,fontWeight:600,color:flour?"#283618":"#606c38",outline:"none",width:"100%",cursor:"pointer",appearance:"auto"}}>
                              <option value="">Select flour…</option>
                              <optgroup label="─── General">
                                <option value="__gen_hipro__">High Protein White Flour</option>
                                <option value="__gen_white__">White Flour</option>
                                <option value="__gen_wholemeal__">Wholemeal Flour</option>
                                <option value="__gen_spelt__">Spelt Flour</option>
                                <option value="__gen_rye__">Rye Flour</option>
                                <option value="__gen_einkorn__">Einkorn Flour</option>
                                <option value="__gen_emmer__">Emmer Flour</option>
                                <option value="__gen_khorasan__">Khorasan (Kamut) Flour</option>
                              </optgroup>
                              <optgroup label="─── Specific Brand">
                                {FLOUR_DB.filter(f=>f.type==="White Bread"||f.type==="White Bread (T55)"||f.type==="Organic White Bread"||f.type==="Organic Stoneground White"||f.type==="Stoneground Heritage White"||f.type==="High-Protein White Bread"||f.type==="Professional White Bread"||f.type==="Supermarket Bread Flour").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g)</option>)}
                                {FLOUR_DB.filter(f=>f.type==="Wholemeal Bread"||f.type==="Wholemeal").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g)</option>)}
                                {FLOUR_DB.filter(f=>f.type==="Rye"||f.type==="Whole Rye"||f.type==="Light Rye").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g)</option>)}
                                {FLOUR_DB.filter(f=>f.type==="Spelt").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g)</option>)}
                              </optgroup>
                              <optgroup label="───">
                                <option value="__manual__">Not in list — enter manually…</option>
                              </optgroup>
                            </select>
                            {flour && <div style={{fontSize:11,color:"#606c38",marginTop:2,fontWeight:600}}>{flour.type} · {flour.protein}g protein/100g</div>}
                            {ing.flourId&&ing.flourId.startsWith("__gen_")&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}><span style={{fontSize:11,color:"#606c38",fontWeight:600}}>Protein (g/100g):</span><input type="number" inputMode="decimal" value={ing.protein||""} onChange={e=>updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,protein:e.target.value}:i)}))} placeholder="e.g. 13" style={{width:60,background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"2px 4px",fontSize:13,fontWeight:600,color:"#283618",outline:"none",textAlign:"center"}}/></div>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <input value={ing.label} onChange={e=>updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,label:e.target.value}:i)}))}
                        style={{background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"5px 2px",fontSize:14,color:"#283618",outline:"none",width:"100%"}}/>
                    )}
                  </div>
                  <input type="number" value={ing.grams} onChange={e=>updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,grams:e.target.value}:i)}))} placeholder="0"
                    style={{background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"5px 4px",fontSize:15,fontWeight:600,color:"#283618",outline:"none",textAlign:"center",width:"100%"}}/>
                  <div style={{fontSize:13,fontWeight:600,color:"#5C5C5C",textAlign:"center"}}>{pct!=="—"?pct+"%":"—"}</div>
                  <button onClick={()=>updE(r=>({...r,ingredients:r.ingredients.filter(i=>i.id!==ing.id)}))}
                    style={{width:24,height:24,borderRadius:"50%",background:"#E8E8E8",color:"#5C5C5C",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                </div>
              </div>;
            })}

            <div style={{padding:"10px 16px",borderTop:"0.5px solid #E0DED8",display:"flex",gap:8}}>
              <button onClick={()=>updE(r=>({...r,ingredients:[...r.ingredients,{id:uid(),type:"flour",flourId:null,label:"",grams:""}]}))}
                style={{flex:1,padding:"9px",borderRadius:10,background:"#E8E8E8",color:"#5C5C5C",fontSize:13,fontWeight:600,border:"1.5px dashed #A0A0A0"}}>+ Flour</button>
              <button onClick={()=>updE(r=>({...r,ingredients:[...r.ingredients,{id:uid(),type:"other",flourId:null,label:"",grams:""}]}))}
                style={{flex:1,padding:"9px",borderRadius:10,background:"#F2F2F0",color:"#606c38",fontSize:13,fontWeight:600,border:"1.5px dashed #606c38"}}>+ Ingredient</button>
            </div>
          </Card>

          {/* Levain */}
          <SecH>Levain Build</SecH>
          <Card>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[["Flour (g)","flour"],["Water (g)","water"],["Starter (g)","starter"],["Duration (hr)","duration"]].map(([lbl,k])=>(
                <div key={k}><Lbl>{lbl}</Lbl><Inp type="number" value={editRecipe.levain[k]} onChange={e=>updE(r=>({...r,levain:{...r.levain,[k]:e.target.value}}))}/></div>
              ))}
            </div>
          </Card>

          {/* Steps */}
          <SecH>Step Durations · <span style={{color:"#E0DED8",fontWeight:400}}>{fmtDur((editRecipe.autolyseEnabled?editRecipe.steps:editRecipe.steps.filter(s=>s.id!=="autolyse")).reduce((a,s)=>a+s.durationMin,0))} total</span></SecH>
          <Card style={{padding:0,overflow:"hidden"}}>
            {editRecipe.steps.map((s,i)=>{
              const isBulk=s.id==="bulk",isAuto=s.id==="autolyse";
              const unit=editRecipe.stepUnit[s.id]||"min";
              const displayVal=unit==="hr"?+(s.durationMin/60).toFixed(2):s.durationMin;
              const disabled=isAuto&&!editRecipe.autolyseEnabled;
              return <div key={s.id} style={{borderBottom:i<editRecipe.steps.length-1?"0.5px solid #1E2C30":"none",opacity:disabled?0.4:1}}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 16px"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:disabled?"#E0DED8":s.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:14,fontWeight:500}}>{s.name}</span>
                  {isAuto && <button onClick={()=>updE(r=>({...r,autolyseEnabled:!r.autolyseEnabled}))}
                    style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,border:"1px solid #E0DED8",background:editRecipe.autolyseEnabled?"#283618":"#E0DED8",color:editRecipe.autolyseEnabled?"#F8F8F6":"#606c38"}}>{editRecipe.autolyseEnabled?"On":"Off"}</button>}
                  {isBulk && <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:11,color:"#606c38",fontWeight:600}}>S&F</span>
                    <input type="number" value={s.sfCount} min={0} max={10}
                      onChange={e=>updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,sfCount:parseInt(e.target.value)||0}:st)}))}
                      style={{width:36,background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"3px 0",fontSize:13,fontWeight:600,color:s.sfCount>0?s.color:"#606c38",textAlign:"center"}}/>
                  </div>}
                  {!disabled && (s.id==="retard" ? (
                    /* Retard: overnight on/off + hr input when off */
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      {unit!=="overnight" && <>
                        <input type="text" inputMode="numeric" value={displayVal}
                          onFocus={e=>e.target.select()}
                          onChange={e=>{const raw=e.target.value.replace(/[^0-9.]/g,"");updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,durationMin:raw===""?0:unit==="hr"?Math.round(parseFloat(raw||0)*60):Math.round(parseFloat(raw||0))}:st)}));}}
                          onBlur={e=>{const v=parseFloat(e.target.value)||1;const m=unit==="hr"?Math.round(v*60):Math.round(v);updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,durationMin:Math.max(1,m)}:st)}));}}
                          style={{width:44,background:"#FFFFFF",border:"1px solid #E0DED8",borderRadius:8,padding:"5px 4px",fontSize:13,fontWeight:600,textAlign:"center",color:"#283618"}}/>
                        <div style={{display:"flex",background:"#F2F2F0",borderRadius:8,border:"1px solid #E0DED8",overflow:"hidden"}}>
                          {["min","hr"].map(u=><button key={u} onClick={()=>updE(r=>({...r,stepUnit:{...r.stepUnit,[s.id]:u}}))}
                            style={{padding:"4px 6px",fontSize:11,fontWeight:600,background:unit===u?"#606c38":"transparent",color:unit===u?"#FFFFFF":"#6E6E6E",transition:"all 0.15s"}}>{u}</button>)}
                        </div>
                      </>}
                      <button onClick={()=>{
                        const next=unit==="overnight"?"hr":"overnight";
                        updE(r=>({...r,stepUnit:{...r.stepUnit,[s.id]:next},steps:r.steps.map((st,j)=>j===i?{...st,durationMin:next==="overnight"?600:st.durationMin}:st)}));
                      }} style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,border:"1px solid #E0DED8",background:unit==="overnight"?"#283618":"transparent",color:unit==="overnight"?"#F8F8F6":"#6E6E6E",transition:"all 0.2s"}}>
                        {unit==="overnight"?"Overnight: On":"Overnight"}
                      </button>
                    </div>
                  ) : (
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <input type="text" inputMode="numeric" value={displayVal}
                        onFocus={e=>e.target.select()}
                        onChange={e=>{const raw=e.target.value.replace(/[^0-9.]/g,"");updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,durationMin:raw===""?0:unit==="hr"?Math.round(parseFloat(raw||0)*60):Math.round(parseFloat(raw||0))}:st)}));}}
                        onBlur={e=>{const v=parseFloat(e.target.value)||1;const m=unit==="hr"?Math.round(v*60):Math.round(v);updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,durationMin:Math.max(1,m)}:st)}));}}
                        style={{width:48,background:"#FFFFFF",border:"1px solid #E0DED8",borderRadius:8,padding:"5px 4px",fontSize:13,fontWeight:600,textAlign:"center",color:"#283618"}}/>
                      <div style={{display:"flex",background:"#F2F2F0",borderRadius:8,border:"1px solid #E0DED8",overflow:"hidden"}}>
                        {["min","hr"].map(u=><button key={u} onClick={()=>updE(r=>({...r,stepUnit:{...r.stepUnit,[s.id]:u}}))}
                          style={{padding:"4px 6px",fontSize:11,fontWeight:600,background:unit===u?"#283618":"transparent",color:unit===u?"#FFFFFF":"#6E6E6E",transition:"all 0.15s"}}>{u}</button>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>;
            })}
          </Card>

          <SecH>Recipe Notes</SecH>
          <Card>
            <textarea value={editRecipe.notes} onChange={e=>updE(r=>({...r,notes:e.target.value}))} placeholder="Notes, tips, observations…" rows={4}
              style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",borderRadius:0,padding:"6px 2px",fontSize:15,color:"#283618",resize:"vertical",lineHeight:1.7,outline:"none",fontFamily:"inherit"}}/>
          </Card>
        </div>}

        {/* ══════════════════════════════
            BAKE
        ══════════════════════════════ */}
        {view===VIEWS.BAKE && <div className="su">
          {!bakeStarted||!bakeRecipe ? (
            <div style={{textAlign:"center",paddingTop:60}}>
              <div style={{width:64,height:64,borderRadius:20,border:"1.5px solid #2C2C2E",margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:28,fontWeight:700,color:"#E0DED8"}}>B</span>
              </div>
              <div style={{fontSize:22,fontWeight:700,marginBottom:8}}>No active bake</div>
              <p style={{color:"#606c38",fontSize:15,marginBottom:28,lineHeight:1.5}}>Choose a recipe and tap Bake to start.</p>
              {recipes.length>0 && <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{fontSize:12,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4,textAlign:"left"}}>Quick Start</div>
                {recipes.map(r=><button key={r.id} onClick={()=>startBake(r)}
                  style={{padding:"14px 18px",borderRadius:14,background:"#FFFFFF",border:"1px solid #E0DED8",color:"#283618",fontSize:15,fontWeight:600,textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 6px rgba(0,0,0,0.08)"}}>
                  {r.name}<span style={{color:"#5C5C5C",fontSize:13,fontWeight:600}}>Bake →</span>
                </button>)}
              </div>}
            </div>
          ) : <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.03em"}}>{bakeRecipe.name}</div>
                {(()=>{
                const totalStepMin=(bakeRecipe.autolyseEnabled?bakeRecipe.steps:bakeRecipe.steps.filter(s=>s.id!=="autolyse")).reduce((a,s)=>a+s.durationMin,0);
                const estFinish=bakeStartTime?new Date(bakeStartTime+totalStepMin*60000):null;
                const estNow=new Date();
                const isTomorrow=estFinish&&(estFinish.getDate()!==estNow.getDate()||estFinish.getMonth()!==estNow.getMonth());
                const estStr=estFinish?(isTomorrow?"tomorrow ":"")+estFinish.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):null;
                return <div style={{fontSize:13,color:"#606c38",marginTop:3}}>
                  Started {timeStr(bakeStartTime)} · {bakeRecipe.loaves} × {bakeRecipe.loafG}g · DDT {bakeRecipe.ddt}°{bakeRecipe.tempUnit||"F"}
                  {estStr&&<span> · Est. finish <strong style={{color:"#283618"}}>{estStr}</strong></span>}
                </div>;
              })()}
                <button onClick={finishBake} style={{marginTop:10,padding:"7px 14px",borderRadius:10,background:"#EFEFED",color:"#283618",fontSize:12,fontWeight:600}}>Finish & Save →</button>
              </div>
              {activeStep!=null&&activeStep<bakeRecipe.steps.length&&
                <div style={{background:bakeRecipe.steps[activeStep].color+"22",color:bakeRecipe.steps[activeStep].color,borderRadius:20,padding:"6px 13px",fontSize:13,fontWeight:600}}>
                  {activeStep+1}/{bakeRecipe.autolyseEnabled?bakeRecipe.steps.length:bakeRecipe.steps.filter(s=>s.id!=="autolyse").length}
                </div>}
            </div>

            {activeStep!=null&&activeStep<bakeRecipe.steps.length&&(()=>{
              const s=bakeRecipe.steps[activeStep],sfNext=nextSfIn(activeStep);
              return <Card style={{padding:24}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:s.color,flexShrink:0}}/><div style={{fontSize:11,fontWeight:700,color:"#283618",textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.name}</div></div>
                  <div style={{fontSize:13,fontWeight:600,color:"#606c38"}}>{fmtDur(s.durationMin)}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:24,marginBottom:22}}>
                  <Ring progress={prog(activeStep)} color={s.color}>
                    <div style={{fontSize:26,fontWeight:700,letterSpacing:"-0.04em",lineHeight:1,color:"#283618"}}>{fmtTime(remaining(activeStep))}</div>
                    <div style={{fontSize:10,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>left</div>
                  </Ring>
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:16}}>
                    <Stat label="Elapsed" value={fmtTime(elapsed(activeStep))}/>
                    {s.sfCount>0&&sfNext!=null&&<Stat label="Next S&F" value={fmtTime(sfNext)} highlight={sfNext<60}/>}
                    <Stat label="Done" value={`${Math.round(prog(activeStep)*100)}%`} color={s.color}/>
                  </div>
                </div>
                <div style={{height:4,background:"#283618",borderRadius:4,marginBottom:20,overflow:"hidden"}}>
                  <div style={{height:"100%",background:s.color,borderRadius:4,width:`${prog(activeStep)*100}%`,transition:"width 1s linear"}}/>
                </div>
                {s.id==="bulk"&&<div style={{marginBottom:18}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <Lbl style={{marginBottom:0}}>Stretch &amp; Folds</Lbl>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      {s.sfCount>0&&<button onClick={()=>{
                        const bulkIdx=bakeRecipe.steps.findIndex(st=>st.id==="bulk");
                        upd(selectedId, r=>({...r,steps:r.steps.map((st,j)=>j===bulkIdx?{...st,sfCount:Math.max(0,st.sfCount-1)}:st)}));
                      }} style={{width:28,height:28,borderRadius:8,background:"#EFEFED",color:"#606c38",fontSize:16,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>}
                      <span style={{fontSize:13,fontWeight:600,color:"#606c38",minWidth:16,textAlign:"center"}}>{s.sfCount}</span>
                      <button onClick={()=>{
                        const bulkIdx=bakeRecipe.steps.findIndex(st=>st.id==="bulk");
                        upd(selectedId, r=>({...r,steps:r.steps.map((st,j)=>j===bulkIdx?{...st,sfCount:Math.min(20,st.sfCount+1)}:st)}));
                      }} style={{width:28,height:28,borderRadius:8,background:"#283618",color:"#F8F8F6",fontSize:16,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {Array.from({length:s.sfCount},(_,fi)=>fi+1).map(n=>{
                      const done=sfDone[activeStep]?.has(n);
                      const isExpanded=expandedFold===n;
                      const note=foldNotes[n]||"";
                      const photo=foldPhotos[n];
                      return <div key={n} style={{borderRadius:12,border:`1px solid ${done?"#283618":"#E0DED8"}`,overflow:"hidden",background:done?"#283618":"#FAFAFA"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",cursor:"pointer"}}
                          onClick={()=>setExpandedFold(isExpanded?null:n)}>
                          <button onClick={e=>{e.stopPropagation();toggleSF(activeStep,n);}}
                            style={{width:36,height:36,borderRadius:10,background:done?"#FFFFFF22":"#EFEFED",color:done?"#FFFFFF":"#606c38",fontSize:13,fontWeight:700,flexShrink:0,border:done?`2px solid ${s.color}`:"2px solid transparent"}}>
                            {done?"✓":n}
                          </button>
                          <span style={{flex:1,fontSize:14,fontWeight:600,color:done?"#FFFFFF":"#283618"}}>Fold {n}</span>
                          {note&&<span style={{fontSize:11,color:done?"rgba(255,255,255,0.5)":"#606c38",fontWeight:600}}>note</span>}
                          {photo&&<span style={{fontSize:11,color:done?"rgba(255,255,255,0.5)":"#606c38",fontWeight:600}}>photo</span>}
                          <span style={{fontSize:11,color:done?"rgba(255,255,255,0.4)":"#6E6E6E"}}>{isExpanded?"▲":"▼"}</span>
                        </div>
                        {isExpanded&&<div style={{padding:"0 12px 12px",borderTop:`1px solid ${done?"rgba(255,255,255,0.1)":"#E0DED8"}`,background:done?"rgba(255,255,255,0.06)":"#F8F8F6"}}>
                          <textarea placeholder={`Notes for fold ${n}…`} value={note}
                            onChange={e=>setFoldNotes(p=>({...p,[n]:e.target.value}))} rows={2}
                            style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",padding:"8px 2px",fontSize:13,color:done?"#FFFFFF":"#283618",resize:"vertical",lineHeight:1.6,outline:"none",fontFamily:"inherit",marginTop:10,marginBottom:10}}/>
                          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                            {photo&&<div style={{position:"relative"}}>
                              <img src={photo} alt="" style={{width:56,height:56,objectFit:"cover",borderRadius:10,border:"1px solid #E0DED8"}}/>
                              <button onClick={()=>setFoldPhotos(p=>{const n2={...p};delete n2[n];return n2;})}
                                style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",background:"#9E3A3A",color:"#FFF",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                            </div>}
                            {!photo&&<button onClick={()=>{setFoldPhotoTarget(n);fileRef.current?.click();}}
                              style={{width:56,height:56,borderRadius:10,border:"2px dashed #E0DED8",background:"transparent",color:"#6E6E6E",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>}
                          </div>
                        </div>}
                      </div>;
                    })}
                  </div>
                </div>}
                {s.id==="bake"&&<div style={{marginBottom:18}}>
                  <Lbl>Oven Steps</Lbl>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {[
                      {key:"steam_in",  label:"Add steam",    desc:"Place tray of boiling water or lids on"},
                      {key:"steam_out", label:"Remove steam", desc:"Remove steam source, vent oven"},
                    ].map(sub=>{
                      const done=steamDone[sub.key];
                      return <div key={sub.key} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,background:done?"#283618":"#F2F2F0",border:`1px solid ${done?"#283618":"#E0DED8"}`,transition:"all 0.2s"}}>
                        <button onClick={()=>setSteamDone(p=>({...p,[sub.key]:!p[sub.key]}))}
                          style={{width:32,height:32,borderRadius:9,background:done?"#FFFFFF22":"#FFFFFF",border:done?"2px solid rgba(255,255,255,0.3)":"2px solid #E0DED8",color:done?"#FFFFFF":"#606c38",fontSize:14,fontWeight:700,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {done?"✓":""}
                        </button>
                        <div>
                          <div style={{fontSize:14,fontWeight:600,color:done?"#FFFFFF":"#283618"}}>{sub.label}</div>
                          <div style={{fontSize:11,color:done?"rgba(255,255,255,0.6)":"#6E6E6E",marginTop:1}}>{sub.desc}</div>
                        </div>
                      </div>;
                    })}
                  </div>
                </div>}
                <textarea placeholder={`Notes for ${s.name}…`} value={stepNotes[activeStep]||""} onChange={e=>setStepNotes(p=>({...p,[activeStep]:e.target.value}))} rows={2}
                  style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",borderRadius:0,padding:"6px 2px",fontSize:14,color:"#283618",resize:"vertical",lineHeight:1.65,marginBottom:14,outline:"none",fontFamily:"inherit"}}/>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
                  {(stepPhotos[activeStep]||[]).map((ph,pi)=><div key={pi} style={{position:"relative"}}>
                    <img src={ph.src} alt="" style={{width:64,height:64,objectFit:"cover",borderRadius:14,border:"1px solid #E0DED8"}}/>
                    <button onClick={()=>setStepPhotos(p=>({...p,[activeStep]:p[activeStep].filter((_,i)=>i!==pi)}))}
                      style={{position:"absolute",top:-7,right:-7,width:22,height:22,borderRadius:"50%",background:"#9E3A3A",color:"#F8F8F6",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                  </div>)}
                  <button onClick={()=>{setPhotoTarget(activeStep);fileRef.current?.click();}}
                    style={{width:64,height:64,borderRadius:14,border:"2px dashed #E0DED8",background:"transparent",color:"#E0DED8",fontSize:26,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                </div>

                <button onClick={()=>completeStep(activeStep)}
                  style={{width:"100%",padding:"16px",borderRadius:14,background:"#283618",color:"#F8F8F6",fontSize:16,fontWeight:700,letterSpacing:"-0.01em"}}>
                  Complete → {activeStep+1<bakeRecipe.steps.length?bakeRecipe.steps[activeStep+1].name:"Finish"}
                </button>
              </Card>;
            })()}

            {activeStep===null&&<Card><div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{width:56,height:56,borderRadius:18,background:"#283618",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:24,fontWeight:700,color:"#5C5C5C"}}>✓</span>
              </div>
              <div style={{fontSize:22,fontWeight:700,marginBottom:6}}>Bake complete!</div>
              <p style={{color:"#606c38",fontSize:14}}>Check your log for the session summary.</p>
            </div></Card>}

            <SecH>Timeline — tap to edit notes</SecH>
            <Card style={{padding:0,overflow:"hidden"}}>
              {(bakeRecipe.autolyseEnabled?bakeRecipe.steps:bakeRecipe.steps.filter(s=>s.id!=="autolyse")).map((s,i)=>{
                const isPast=activeStep!=null&&i<activeStep,isCurr=i===activeStep,isFuture=activeStep!=null&&i>activeStep;
                const canEdit=isPast||isCurr,isOpen=editingStep===i;
                return <div key={s.id} style={{borderBottom:i<bakeRecipe.steps.length-1?"0.5px solid #1E2C30":"none"}}>
                  <div onClick={()=>canEdit&&setEditingStep(isOpen?null:i)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px",opacity:isFuture?0.35:1,cursor:canEdit?"pointer":"default",userSelect:"none"}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:isPast?"#5C5C5C":isCurr?s.color:"#E0DED8",flexShrink:0,transition:"background 0.4s"}}/>
                    <span style={{flex:1,fontSize:15,fontWeight:isCurr?700:400}}>{s.name}</span>
                    {stepNotes[i]&&<span style={{fontSize:11,color:"#606c38",fontWeight:600}}>note</span>}
                    {(stepPhotos[i]?.length||0)>0&&<span style={{fontSize:11,color:"#606c38",fontWeight:600}}>{stepPhotos[i].length} photo{stepPhotos[i].length>1?"s":""}</span>}
                    {isPast&&!isOpen&&<span style={{color:"#5C5C5C",fontSize:11,fontWeight:600}}>done</span>}
                    {isCurr&&<span className="pulse" style={{fontSize:11,fontWeight:700,color:"#283618",background:s.color+"33",borderRadius:6,padding:"2px 7px"}}>ACTIVE</span>}
                    <span style={{fontSize:13,color:"#606c38"}}>{fmtDur(s.durationMin)}</span>
                    {s.sfCount>0&&<span style={{fontSize:11,fontWeight:600,color:s.color,background:s.color+"20",borderRadius:7,padding:"2px 7px"}}>×{s.sfCount}</span>}
                    {canEdit&&<span style={{fontSize:11,color:"#E0DED8",flexShrink:0}}>{isOpen?"▲":"▼"}</span>}
                  </div>
                  {isOpen&&<div style={{padding:"0 18px 18px",background:"#E0DED8",borderTop:"0.5px solid #E0DED8"}}>
                    <Lbl style={{marginTop:14}}>Notes</Lbl>
                    <textarea placeholder={`Notes for ${s.name}…`} value={stepNotes[i]||""} onChange={e=>setStepNotes(p=>({...p,[i]:e.target.value}))} rows={3}
                      style={{width:"100%",background:"#FFFFFF",border:`1.5px solid ${s.color}`,borderRadius:12,padding:"11px 14px",fontSize:14,color:"#283618",resize:"vertical",lineHeight:1.65,marginBottom:14,outline:"none"}}/>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      {(stepPhotos[i]||[]).map((ph,pi)=><div key={pi} style={{position:"relative"}}>
                        <img src={ph.src} alt="" style={{width:60,height:60,objectFit:"cover",borderRadius:12,border:"1px solid #E0DED8"}}/>
                        <button onClick={()=>setStepPhotos(p=>({...p,[i]:p[i].filter((_,x)=>x!==pi)}))}
                          style={{position:"absolute",top:-7,right:-7,width:20,height:20,borderRadius:"50%",background:"#9E3A3A",color:"#F8F8F6",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                      </div>)}
                      <button onClick={()=>{setPhotoTarget(i);fileRef.current?.click();}}
                        style={{width:60,height:60,borderRadius:12,border:"2px dashed #E0DED8",background:"transparent",color:"#E0DED8",fontSize:24,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                    </div>
                    <button onClick={()=>setEditingStep(null)} style={{marginTop:14,padding:"9px 20px",borderRadius:10,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:600}}>Done</button>
                  </div>}
                </div>;
              })}
            </Card>
          </>}
        </div>}

        {/* ══════════════════════════════
            LOG
        ══════════════════════════════ */}
        {view===VIEWS.LOG && <div className="su">

          {/* ── Viewing a saved log ─────────────────── */}
          {viewingLog ? (()=>{
            const log = savedLogs.find(l=>l.id===viewingLog);
            if(!log) return null;
            const durationMin = log.endTime&&log.startTime ? Math.round((log.endTime-log.startTime)/60000) : null;
            const updateLog = patch => setSavedLogs(prev=>{
              const next=prev.map(l=>l.id===viewingLog?{...l,...patch}:l);
              const changed=next.find(l=>l.id===viewingLog);
              if(changed) scheduleLogSave(changed);
              return next;
            });
            const updateStepNote = (i,val) => setSavedLogs(prev=>{
              const next=prev.map(l=>l.id===viewingLog?{...l,stepNotes:{...l.stepNotes,[i]:val}}:l);
              const changed=next.find(l=>l.id===viewingLog);
              if(changed) scheduleLogSave(changed);
              return next;
            });
            return <>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <button onClick={()=>setViewingLog(null)} style={{width:34,height:34,borderRadius:10,background:"#EFEFED",color:"#283618",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600}}>←</button>
                <div style={{flex:1}}>
                  <input value={log.recipeName||""} onChange={e=>updateLog({recipeName:e.target.value})}
                    style={{fontSize:20,fontWeight:700,letterSpacing:"-0.02em",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",color:"#283618",width:"100%",padding:"2px 0",outline:"none",fontFamily:"inherit"}}/>
                  {log.isManual ? (
                    <div style={{display:"flex",gap:8,alignItems:"center",marginTop:4}}>
                      <input type="date" value={new Date(log.startTime).toISOString().slice(0,10)}
                        onChange={e=>updateLog({startTime:new Date(e.target.value).getTime()})}
                        style={{background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",fontSize:13,color:"#606c38",outline:"none",fontFamily:"inherit",padding:"2px 0"}}/>
                    </div>
                  ) : (
                    <div style={{fontSize:13,color:"#606c38",marginTop:2}}>{new Date(log.startTime).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}{durationMin?` · ${Math.floor(durationMin/60)}h ${durationMin%60}m`:""}</div>
                  )}
                </div>
              </div>

              {log.isManual && (
                <Card style={{marginBottom:4}}>
                  <Lbl>Link to recipe (optional)</Lbl>
                  <select value={log.recipeId||""} onChange={e=>{
                    const r=recipes.find(x=>x.id===e.target.value);
                    updateLog({recipeId:e.target.value,recipeName:r?r.name:log.recipeName,ingredients:r?r.ingredients:[],steps:r?r.steps:log.steps,autolyseEnabled:r?r.autolyseEnabled:true});
                  }} style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",padding:"6px 2px",fontSize:14,color:"#283618",outline:"none",fontFamily:"inherit",marginTop:4}}>
                    <option value="">— none —</option>
                    {recipes.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </Card>
              )}
              {(log.ingredients||[]).filter(i=>parseFloat(i.grams)).length>0&&<>
              <SecH>Ingredients</SecH>
              <Card>
                <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                  {(log.ingredients||[]).filter(i=>parseFloat(i.grams)).map(i=>{
                    const fl=i.flourId?FLOUR_DB.find(f=>f.id===i.flourId):null;
                    const flourG=(log.ingredients||[]).filter(x=>x.type==="flour").reduce((a,i)=>a+(parseFloat(i.grams)||0),0);
                    return <div key={i.id}>
                      <Lbl>{fl?fl.name:i.label}</Lbl>
                      <div style={{fontSize:18,fontWeight:700}}>{i.grams}g</div>
                      {i.type!=="flour"&&flourG>0&&<div style={{fontSize:12,fontWeight:600,color:"#5C5C5C"}}>{bkPct(parseFloat(i.grams),flourG)}%</div>}
                    </div>;
                  })}
                </div>
              </Card>
              </>}

              <SecH>Step Notes</SecH>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {(log.steps||[]).filter(s=>log.autolyseEnabled!==false||s.id!=="autolyse").map((s,i)=>(
                  <Card key={s.id}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:9,height:9,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                      <span style={{fontSize:14,fontWeight:600,color:"#283618"}}>{s.name}</span>
                    </div>
                    <textarea
                      placeholder={`Notes for ${s.name}…`}
                      value={log.stepNotes?.[i]||""}
                      onChange={e=>updateStepNote(i,e.target.value)}
                      rows={2}
                      style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",padding:"4px 2px",fontSize:14,color:"#283618",resize:"vertical",lineHeight:1.65,outline:"none",fontFamily:"inherit"}}/>
                    {log.stepPhotos?.[i]?.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
                      {log.stepPhotos[i].map((ph,pi)=><img key={pi} src={ph.src} alt="" style={{height:72,width:72,objectFit:"cover",borderRadius:12,border:"1px solid #E0DED8"}}/>)}
                    </div>}
                  </Card>
                ))}
              </div>

              <SecH>Session Notes</SecH>
              <Card>
                <textarea
                  placeholder="Crumb, environment, what to tweak…"
                  value={log.sessionNotes||""}
                  onChange={e=>updateLog({sessionNotes:e.target.value})}
                  rows={5}
                  style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",padding:"4px 2px",fontSize:15,color:"#283618",resize:"vertical",lineHeight:1.7,outline:"none",fontFamily:"inherit"}}/>
              </Card>


              <SecH>Bake Review</SecH>
              <Card>
                {[
                  {key:"crumb",    label:"Crumb",       placeholder:"Open, even, dense, gummy…"},
                  {key:"crust",    label:"Crust",        placeholder:"Thick, thin, crackly, soft…"},
                  {key:"colour",   label:"Colour",       placeholder:"Golden, pale, deep brown…"},
                  {key:"ear",      label:"Ear & Bloom",  placeholder:"Good spring, minimal bloom…"},
                  {key:"flavour",  label:"Flavour",      placeholder:"Sour, mild, nutty, complex…"},
                  {key:"texture",  label:"Texture",      placeholder:"Chewy, soft, moist, dry…"},
                  {key:"overall",  label:"Overall",      placeholder:"What worked, what to change…"},
                ].map(({key,label,placeholder})=>(
                  <div key={key} style={{marginBottom:14}}>
                    <Lbl>{label}</Lbl>
                    <textarea placeholder={placeholder} rows={1}
                      value={log.review?.[key]||""}
                      onChange={e=>updateLog({review:{...(log.review||{}),[key]:e.target.value}})}
                      style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",padding:"4px 2px",fontSize:14,color:"#283618",resize:"vertical",lineHeight:1.65,outline:"none",fontFamily:"inherit"}}/>
                  </div>
                ))}
                {/* Photos */}
                <div style={{marginBottom:14}}>
                  <Lbl>Photos</Lbl>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                    {(log.review?.photos||[]).map((src,pi)=>(
                      <div key={pi} style={{position:"relative"}}>
                        <img src={src} alt="" style={{width:72,height:72,objectFit:"cover",borderRadius:12,border:"1px solid #E0DED8"}}/>
                        <button onClick={()=>updateLog({review:{...(log.review||{}),photos:(log.review?.photos||[]).filter((_,i)=>i!==pi)}})}
                          style={{position:"absolute",top:-7,right:-7,width:20,height:20,borderRadius:"50%",background:"#9E3A3A",color:"#FFF",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                      </div>
                    ))}
                    <button onClick={()=>{
                      setReviewPhotoHandler(()=>src=>updateLog({review:{...(log.review||{}),photos:[...(log.review?.photos||[]),src]}}));
                      fileRef.current?.click();
                    }} style={{width:72,height:72,borderRadius:12,border:"2px dashed #E0DED8",background:"transparent",color:"#6E6E6E",fontSize:26,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                  </div>
                </div>
                {/* Rating */}
                <div style={{marginTop:4}}>
                  <Lbl>Rating</Lbl>
                  <div style={{display:"flex",gap:8,marginTop:6}}>
                    {[1,2,3,4,5].map(n=>(
                      <button key={n} onClick={()=>updateLog({review:{...(log.review||{}),rating:n}})}
                        style={{width:40,height:40,borderRadius:10,background:(log.review?.rating||0)>=n?"#283618":"#EFEFED",color:(log.review?.rating||0)>=n?"#FFFFFF":"#6E6E6E",fontSize:14,fontWeight:700,border:"none"}}>
                        {n}
                      </button>
                    ))}
                    {log.review?.rating&&<span style={{fontSize:13,color:"#606c38",alignSelf:"center",marginLeft:4}}>{["","Poor","Fair","Good","Great","Perfect!"][log.review.rating]}</span>}
                  </div>
                </div>
              </Card>

              <button onClick={()=>{deleteLogDB(viewingLog);setSavedLogs(prev=>prev.filter(l=>l.id!==viewingLog));setViewingLog(null);}}
                style={{marginTop:16,padding:"10px 16px",borderRadius:12,background:"#FFF0F0",color:"#9E3A3A",fontSize:13,fontWeight:600,width:"100%"}}>Delete this log</button>
            </>;
          })() : <>

          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:24}}>
            {[
              {label:"Recipes",value:recipes.length,action:()=>setView(VIEWS.RECIPES)},
              {label:"Bakes",value:savedLogs.length,action:null},
              {label:"Flours",value:allFlours.length,action:()=>setView(VIEWS.INGREDIENTS)},
            ].map(({label,value,action})=>(
              <button key={label} onClick={action||undefined} style={{background:"#FFFFFF",borderRadius:14,padding:"14px 10px",border:"1px solid #E0DED8",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:22,fontWeight:700,color:"#283618",letterSpacing:"-0.02em"}}>{value}</div>
                <div style={{fontSize:10,fontWeight:600,color:"#6E6E6E",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>{label}</div>
              </button>
            ))}
          </div>

          {/* ── Log list + active session ────────────── */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:4}}>
            <div style={{fontSize:26,fontWeight:700,letterSpacing:"-0.03em"}}>Bake Log</div>
            <button onClick={()=>{
              const id=uid();
              const blank={
                id, recipeName:"", startTime:Date.now(), endTime:Date.now(),
                stepNotes:{}, stepPhotos:{}, foldNotes:{}, foldPhotos:{},
                sessionNotes:"", autolyseEnabled:true,
                ingredients:[], steps:DEFAULT_STEPS.map((s,i)=>({...s,durationMin:s.duration,color:STEP_COLORS[i]})),
                review:{}, isManual:true,
              };
              setSavedLogs(prev=>[blank,...prev]);
              saveBakeLog(blank);
              setViewingLog(id);
            }} style={{padding:"9px 16px",borderRadius:12,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:600}}>+ Add past bake</button>
          </div>
          <div style={{fontSize:14,color:"#606c38",marginBottom:20}}>{savedLogs.length} session{savedLogs.length!==1?"s":""} recorded</div>

          {/* Active session */}
          {bakeStarted&&bakeRecipe&&<>
            <div style={{background:"#283618",borderRadius:16,padding:"14px 16px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Active session</div>
              <div style={{fontSize:16,fontWeight:700,color:"#FFFFFF",marginBottom:4}}>{bakeRecipe.name}</div>
              {(()=>{
                  const totalStepMin=(bakeRecipe.autolyseEnabled?bakeRecipe.steps:bakeRecipe.steps.filter(s=>s.id!=="autolyse")).reduce((a,s)=>a+s.durationMin,0);
                  const estFinish=bakeStartTime?new Date(bakeStartTime+totalStepMin*60000):null;
                  const estNow=new Date();
                  const isTomorrow=estFinish&&(estFinish.getDate()!==estNow.getDate()||estFinish.getMonth()!==estNow.getMonth());
                  const estStr=estFinish?(isTomorrow?"tomorrow ":"")+estFinish.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):null;
                  return <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:12}}>
                    Started {timeStr(bakeStartTime)}{estStr&&<> · Est. finish <strong style={{color:"#FFFFFF"}}>{estStr}</strong></>}
                  </div>;
                })()}

              <SecH style={{color:"rgba(255,255,255,0.5)"}}>Step Notes</SecH>
              {bakeRecipe.steps.some((_,i)=>stepNotes[i]||stepPhotos[i]?.length)?(
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                  {bakeRecipe.steps.map((s,i)=>{
                    if(!stepNotes[i]&&!stepPhotos[i]?.length)return null;
                    return <div key={s.id} style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:s.color}}/>
                        <span style={{fontSize:13,fontWeight:600,color:"#FFFFFF"}}>{s.name}</span>
                      </div>
                      {stepNotes[i]&&<p style={{fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.5}}>{stepNotes[i]}</p>}
                      {stepPhotos[i]?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{stepPhotos[i].map((ph,pi)=><img key={pi} src={ph.src} alt="" style={{height:60,width:60,objectFit:"cover",borderRadius:10}}/>)}</div>}
                    </div>;
                  })}
                </div>
              ):<p style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:12}}>No step notes yet.</p>}

              <textarea value={sessionNotes} onChange={e=>setSessionNotes(e.target.value)} placeholder="Session notes…" rows={3}
                style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:10,padding:"10px 12px",fontSize:14,color:"#FFFFFF",resize:"vertical",outline:"none",fontFamily:"inherit",marginBottom:12}}/>

              <button onClick={finishBake}
                style={{width:"100%",padding:"11px",borderRadius:12,background:"#FFFFFF",color:"#283618",fontSize:14,fontWeight:700}}>Finish & Save Bake</button>
            </div>
          </>}

          {/* Past logs */}
          {savedLogs.length>0 ? (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {savedLogs.map(log=>{
                const dMin = log.endTime&&log.startTime ? Math.round((log.endTime-log.startTime)/60000) : null;
                const isOpen = swipedLogId === log.id;
                const DELETE_W = 72;
                let touchStartX = 0;
                return (
                  <div key={log.id} style={{position:"relative",marginBottom:8,borderRadius:16,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
                    {/* Delete button revealed underneath */}
                    <div style={{position:"absolute",top:0,right:0,bottom:0,width:DELETE_W,background:"#E53E3E",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <button onClick={()=>{deleteLogDB(log.id);setSavedLogs(prev=>prev.filter(l=>l.id!==log.id));setSwipedLogId(null);}}
                        style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4,color:"#FFFFFF",padding:"0 12px"}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        <span style={{fontSize:10,fontWeight:600}}>Delete</span>
                      </button>
                    </div>
                    {/* Swipeable row */}
                    <div
                      onTouchStart={e=>{ touchStartX=e.touches[0].clientX; }}
                      onTouchEnd={e=>{
                        const dx = touchStartX - e.changedTouches[0].clientX;
                        if(dx > 40) setSwipedLogId(log.id);
                        else if(dx < -20) setSwipedLogId(null);
                      }}
                      onClick={()=>{ if(isOpen){setSwipedLogId(null);} else {setViewingLog(log.id);} }}
                      style={{background:"#FFFFFF",borderRadius:0,padding:"14px 16px",border:"1px solid #E0DED8",borderRadius:16,textAlign:"left",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transform:isOpen?`translateX(-${DELETE_W}px)`:"translateX(0)",transition:"transform 0.22s cubic-bezier(0.2,0,0,1)",position:"relative",zIndex:1,minWidth:"100%"}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:600,color:"#283618"}}>{log.recipeName}</div>
                        <div style={{fontSize:12,color:"#6E6E6E",marginTop:3}}>
                          {new Date(log.startTime).toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
                          {dMin?` · ${Math.floor(dMin/60)}h ${dMin%60}m`:""}
                        </div>
                        {log.sessionNotes&&<div style={{fontSize:12,color:"#606c38",marginTop:3,maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{log.sessionNotes}</div>}
                      </div>
                      <div style={{fontSize:13,color:"#6E6E6E",flexShrink:0,marginLeft:12}}>→</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ):(
            <Card><p style={{fontSize:14,color:"#6E6E6E",textAlign:"center",padding:"8px 0"}}>Finish a bake to save it here.</p></Card>
          )}
          </>}
        </div>}

        {/* ══════════════════════════════
            INGREDIENTS
        ══════════════════════════════ */}
        {view===VIEWS.INGREDIENTS && <div className="su">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:2}}>
            <div style={{fontSize:26,fontWeight:700,letterSpacing:"-0.03em"}}>Ingredients</div>
            <button onClick={()=>setShowAddFlour(v=>!v)} style={{padding:"9px 16px",borderRadius:12,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:600}}>+ Add</button>
          </div>
          <div style={{fontSize:14,color:"#606c38",marginBottom:18}}>Australian flour database · {allFlours.length} flours{userFlours.length>0?` · ${userFlours.length} custom`:""}</div>

          {/* Add flour form */}
          {showAddFlour && <Card style={{marginBottom:16}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:14}}>Add custom flour</div>
            {[
              {label:"Name",key:"name",placeholder:"e.g. Heritage White"},
              {label:"Brand",key:"brand",placeholder:"e.g. Local Mill"},
              {label:"Type",key:"type",placeholder:"e.g. White Bread, Wholemeal…"},
              {label:"Protein (g per 100g)",key:"protein",placeholder:"e.g. 12.5",type:"number"},
              {label:"Where to buy",key:"where",placeholder:"e.g. Local health food store"},
              {label:"Description",key:"description",placeholder:"Flavour, behaviour, best uses…"},
              {label:"Baking tips",key:"tips",placeholder:"Hydration, fermentation notes…"},
            ].map(f=>(
              <div key={f.key} style={{marginBottom:12}}>
                <Lbl>{f.label}</Lbl>
                <input type={f.type||"text"} value={newFlour[f.key]} placeholder={f.placeholder}
                  onChange={e=>setNewFlour(p=>({...p,[f.key]:e.target.value}))}
                  style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",padding:"5px 2px",fontSize:14,color:"#283618",outline:"none",fontFamily:"inherit"}}/>
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:6}}>
              <button onClick={()=>{
                if(!newFlour.name.trim()) return;
                const entry = {
                  id:"u"+uid(), ...newFlour,
                  protein: parseFloat(newFlour.protein)||0,
                  energy:0,fat:0,carbs:0,fibre:0,sodium:0,
                  sizes:["custom"], sourdoughRating:0, colour:"#E0DED8",
                  isCustom:true,
                };
                setUserFlours(p=>[...p,entry]);
                setNewFlour({name:"",brand:"",type:"Custom",protein:"",where:"",description:"",tips:""});
                setShowAddFlour(false);
              }} style={{flex:1,padding:"11px",borderRadius:12,background:"#283618",color:"#F8F8F6",fontSize:14,fontWeight:600}}>Save Flour</button>
              <button onClick={()=>setShowAddFlour(false)} style={{padding:"11px 16px",borderRadius:12,background:"#EFEFED",color:"#606c38",fontSize:14,fontWeight:600}}>Cancel</button>
            </div>
          </Card>}

          {/* Search */}
          <input value={flourSearch} onChange={e=>setFlourSearch(e.target.value)} placeholder="Search flour or brand…"
            style={{width:"100%",background:"#FFFFFF",border:"1px solid #E0DED8",borderRadius:14,padding:"12px 16px",fontSize:15,color:"#283618",outline:"none",boxShadow:"0 1px 4px rgba(0,0,0,0.4)",marginBottom:12}}/>

          {/* Type filters */}
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginBottom:20,scrollbarWidth:"none"}}>
            {flourTypes.map(t=>(
              <button key={t} onClick={()=>setFlourFilter(t)}
                style={{padding:"6px 13px",borderRadius:20,fontSize:12,fontWeight:600,whiteSpace:"nowrap",flexShrink:0,background:flourFilter===t?"#283618":"#FFFFFF",color:flourFilter===t?"#F8F8F6":"#606c38",border:`1px solid ${flourFilter===t?"#283618":"#E0DED8"}`,transition:"all 0.2s"}}>
                {t}
              </button>
            ))}
          </div>

          {/* Flour cards */}
          {filtered.map(f=>{
            const isOpen=expandedFlour===f.id;
            const pctOfMax=((f.protein-8)/6)*100; // 8–14g range
            return <Card key={f.id} style={{padding:0,overflow:"hidden"}}>
              {/* colour header bar */}
              

              <div onClick={()=>setExpandedFlour(isOpen?null:f.id)} style={{padding:"16px 18px",cursor:"pointer",userSelect:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{f.brand}</div>
                    <div style={{fontSize:16,fontWeight:700,letterSpacing:"-0.01em",marginBottom:8}}>{f.name}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <Badge color="#606c38">{f.type}</Badge>
                      <Badge color="#606c38">{f.sizes.join(", ")}</Badge>
                    </div>
                  </div>
                  {/* Protein callout */}
                  <div style={{textAlign:"center",flexShrink:0,minWidth:56}}>
                    <div style={{fontSize:24,fontWeight:900,color:"#283618",letterSpacing:"-0.03em",lineHeight:1}}>{f.protein}<span style={{fontSize:12,fontWeight:600,color:"#606c38"}}>g</span></div>
                    <div style={{fontSize:9,fontWeight:600,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>protein</div>
                    <div style={{width:48,height:5,background:"#E0DED8",borderRadius:4,margin:"0 auto",overflow:"hidden"}}>
                      <div style={{height:"100%",background:"#5C5C5C",borderRadius:4,width:`${pctOfMax}%`}}/>
                    </div>
                  </div>
                </div>

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,color:"#606c38",flex:1,marginRight:8}}>{f.where}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:10,color:"#606c38",fontWeight:600}}>Sourdough</span>
                    <Stars count={f.sourdoughRating} size={12}/>
                    <span style={{fontSize:11,color:"#E0DED8",marginLeft:4}}>{isOpen?"▲":"▼"}</span>
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && <div style={{borderTop:"0.5px solid #E0DED8",padding:"16px 18px 20px",background:"#E0DED8"}}>
                <p style={{fontSize:14,color:"#606c38",lineHeight:1.7,marginBottom:16}}>{f.description}</p>

                {/* Nutrition panel */}
                <Lbl>Nutrition per 100g</Lbl>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:16}}>
                  {[
                    {l:"Energy",v:`${f.energy}kJ`},
                    {l:"Protein",v:`${f.protein}g`,hi:true},
                    {l:"Fat",v:`${f.fat}g`},
                    {l:"Carbs",v:`${f.carbs}g`},
                    {l:"Fibre",v:`${f.fibre}g`},
                  ].map(n=><div key={n.l} style={{background:"#FFFFFF",borderRadius:12,padding:"10px 6px",textAlign:"center",border:`1px solid ${n.hi?"#606c3844":"#E0DED8"}`}}>
                    <div style={{fontSize:9,fontWeight:600,color:n.hi?"#5C5C5C":"#606c38",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{n.l}</div>
                    <div style={{fontSize:14,fontWeight:700,color:n.hi?"#5C5C5C":"#FFFFFF"}}>{n.v}</div>
                  </div>)}
                </div>

                {/* Protein comparison bar */}
                <Lbl>Protein strength (8–14g range)</Lbl>
                <div style={{height:10,background:"#283618",borderRadius:10,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",background:`linear-gradient(90deg,#5C5C5C,#5C5C5C)`,width:`${pctOfMax}%`,borderRadius:10}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#E0DED8",fontWeight:600,marginBottom:16}}>
                  <span>8g (low)</span><span>11g (supermarket)</span><span>14g (pro)</span>
                </div>

                {/* Baking tips */}
                {f.tips && <><Lbl>Baking tips</Lbl>
                <div style={{background:"#FFFFFF",borderRadius:12,padding:"12px 14px",border:"1px solid #E0DED8"}}>
                  <p style={{fontSize:13,color:"#606c38",lineHeight:1.65}}>{f.tips}</p>
                </div></>}

                {!f.isCustom&&<div style={{fontSize:11,color:"#E0DED8",marginTop:12}}>Sodium: {f.sodium}mg · {f.where}</div>}
                {f.isCustom&&<button onClick={e=>{e.stopPropagation();setUserFlours(p=>p.filter(x=>x.id!==f.id));setExpandedFlour(null);}}
                  style={{marginTop:14,padding:"8px 14px",borderRadius:10,background:"#FFF0F0",color:"#9E3A3A",fontSize:12,fontWeight:600}}>Delete</button>}
              </div>}
            </Card>;
          })}

          {filtered.length===0 && <Card><p style={{textAlign:"center",color:"#606c38",padding:"20px 0"}}>No flours match your search.</p></Card>}
        </div>}

      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{display:"none"}}/>
    </div>
    </>
  );
}