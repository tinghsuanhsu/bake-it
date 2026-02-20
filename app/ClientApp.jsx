'use client';
import { useState, useEffect, useRef, useCallback } from "react";

/* ─── VIEWS ─────────────────────────────────────── */
const VIEWS = { RECIPES:"recipes", BAKE:"bake", LOG:"log", INGREDIENTS:"ingredients" };

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
const STEP_COLORS = ["#5C5C5C","#606c38","#8A8A8A","#283618","#787878","#4A6628","#A0A0A0","#7A8A48"];
const DEFAULT_STEPS = [
  { id:"autolyse",   name:"Autolyse",      duration:30  },
  { id:"levain_mix", name:"Levain + Mix",  duration:20  },
  { id:"bulk",       name:"Bulk Ferment",  duration:240, sfCount:5 },
  { id:"divide",     name:"Divide & Rest", duration:30  },
  { id:"shape",      name:"Shape",         duration:15  },
  { id:"proof",      name:"Proof",         duration:60  },
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
const Lbl  = ({children,style={}}) => <div style={{fontSize:11,fontWeight:700,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,...style}}>{children}</div>;
const SecH = ({children}) => <div style={{fontSize:13,fontWeight:600,color:"#606c38",margin:"20px 0 8px",paddingLeft:4}}>{children}</div>;
const Inp  = ({value,onChange,type="text",placeholder="",style={}}) => <input value={value} onChange={onChange} type={type} placeholder={placeholder} style={{background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",borderRadius:0,padding:"6px 2px",fontSize:15,color:"#283618",fontFamily:"inherit",outline:"none",width:"100%",...style}}/>;
const Stat = ({label,value,highlight,color}) => <div><div style={{fontSize:11,fontWeight:700,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{label}</div><div style={{fontSize:20,fontWeight:800,letterSpacing:"-0.02em",color:highlight?"#9E3A3A":color||"#FFFFFF"}}>{value}</div></div>;
const Badge = ({children,color="#5C5C5C"}) => <span style={{background:color+"18",color,fontSize:11,fontWeight:700,borderRadius:8,padding:"3px 9px",display:"inline-block"}}>{children}</span>;

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
  const [view,setView]             = useState(VIEWS.RECIPES);
  const [recipes,setRecipes]       = useState([{...makeRecipe(), name:"Classic Sourdough"}]);
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
  const [photoTarget,setPhotoTarget] = useState(null);
  const fileRef = useRef(null);

  // ingredients page state
  const [flourSearch,setFlourSearch]   = useState("");
  const [flourFilter,setFlourFilter]   = useState("All");
  const [expandedFlour,setExpandedFlour] = useState(null);

  // ── API: load recipes from DB on mount ──────────────
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError,   setDbError]   = useState(null);

  useEffect(() => {
    fetch('/api/recipes')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setRecipes(data);
        setDbLoading(false);
      })
      .catch(err => { setDbError(err.message); setDbLoading(false); });
  }, []);

  // ── API: save recipe whenever it changes ─────────────
  const saveRecipe = useCallback(async (recipe) => {
    try {
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      });
    } catch (e) { console.warn('Save recipe failed:', e); }
  }, []);

  // ── API: delete recipe ────────────────────────────────
  const deleteRecipe = useCallback(async (id) => {
    setRecipes(rs => rs.filter(x => x.id !== id));
    try {
      await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    } catch (e) { console.warn('Delete recipe failed:', e); }
  }, []);

  // ── API: save bake log ────────────────────────────────
  const saveBakeLog = useCallback(async (log) => {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (e) { console.warn('Save log failed:', e); }
  }, []);

  // ── API: save photo ───────────────────────────────────
  const savePhoto = useCallback(async (photoPayload) => {
    try {
      await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoPayload),
      });
    } catch (e) { console.warn('Save photo failed:', e); }
  }, []);



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
  const handlePhoto = e => { const file=e.target.files[0]; if(!file||photoTarget==null)return; const reader=new FileReader(); reader.onload=ev=>setStepPhotos(p=>({...p,[photoTarget]:[...(p[photoTarget]||[]),{src:ev.target.result,ts:Date.now()}]})); reader.readAsDataURL(file); e.target.value=""; };

  // recipe helpers
  const upd  = (id,fn) => setRecipes(rs=>rs.map(r=>r.id===id?fn(r):r));
  const updE = fn => editId && upd(editId,fn);
  const addRecipe = () => { const r=makeRecipe(); setRecipes(rs=>[...rs,r]); saveRecipe(r); setEditId(r.id); };

  // flour filter
  const flourTypes = ["All",...new Set(FLOUR_DB.map(f=>f.type))];
  const filtered = FLOUR_DB.filter(f=>{
    const t=flourFilter==="All"||f.type===flourFilter;
    const q=!flourSearch||[f.name,f.brand,f.type].some(x=>x.toLowerCase().includes(flourSearch.toLowerCase()));
    return t&&q;
  });

  const TABS = [{v:VIEWS.RECIPES,l:"Recipes"},{v:VIEWS.BAKE,l:"Bake"},{v:VIEWS.LOG,l:"Log"},{v:VIEWS.INGREDIENTS,l:"Ingredients"}];

  return (
    {dbLoading && (
      <div style={{position:'fixed',inset:0,background:'#283618',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,flexDirection:'column',gap:12}}>
        <div style={{width:56,height:56,borderRadius:14,border:'2px solid rgba(255,255,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:28,fontWeight:800,color:'#fff'}}>B</span>
        </div>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:14,fontFamily:"'Open Sans',sans-serif"}}>Loading your recipes…</p>
      </div>
    )}
    <div style={{minHeight:"100vh",background:"#F8F8F6",fontFamily:"'Open Sans', sans-serif",color:"#283618"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
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

      {/* NAV */}
      <nav style={{background:"rgba(40,54,24,0.97)",backdropFilter:"blur(20px)",borderBottom:"0.5px solid #E0DED8",position:"sticky",top:0,zIndex:100,height:54,display:"flex",alignItems:"center",padding:"0 16px",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:8,border:"2px solid rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:15,fontWeight:800,color:"#FFFFFF",lineHeight:1}}>B</span>
          </div>
          <span style={{fontWeight:700,fontSize:17,letterSpacing:"-0.03em",color:"#FFFFFF"}}>Bake it</span>
        </div>
        <div style={{display:"flex",background:"#FFFFFF",borderRadius:11,padding:3,gap:1}}>
          {TABS.map(({v,l})=>(
            <button key={v} onClick={()=>{setEditId(null);setView(v);}}
              style={{padding:"5px 10px",borderRadius:8,fontSize:12,fontWeight:600,background:view===v&&!editId?"#E0DED8":"transparent",color:view===v&&!editId?"#283618":"#8A8A84",boxShadow:view===v&&!editId?"0 1px 4px rgba(0,0,0,0.08)":"none",transition:"all 0.2s"}}>{l}</button>
          ))}
        </div>
      </nav>

      <div style={{maxWidth:580,margin:"0 auto",padding:"20px 16px 90px"}}>

        {/* ══════════════════════════════
            RECIPES LIST
        ══════════════════════════════ */}
        {view===VIEWS.RECIPES && !editId && <div className="su">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
            <div>
              <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.03em",marginBottom:2}}>Recipes</div>
              <div style={{fontSize:14,color:"#606c38"}}>{recipes.length} saved</div>
            </div>
            <button onClick={addRecipe} style={{padding:"10px 18px",borderRadius:14,background:"#283618",color:"#F8F8F6",fontSize:14,fontWeight:700}}>+ New</button>
          </div>

          {recipes.map(r=>{
            const primaryFlourIng = r.ingredients.find(i=>i.type==="flour");
            const primaryFlour    = primaryFlourIng?.flourId ? FLOUR_DB.find(f=>f.id===primaryFlourIng.flourId) : null;
            const flourG          = parseFloat(r.ingredients.find(i=>i.type==="flour")?.grams)||0;
            const totalMin        = (r.autolyseEnabled?r.steps:r.steps.filter(s=>s.id!=="autolyse")).reduce((a,s)=>a+s.durationMin,0);
            return <Card key={r.id} style={{padding:0,overflow:"hidden"}}>

              <div style={{padding:"16px 18px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
                  <div style={{fontSize:18,fontWeight:800,letterSpacing:"-0.02em"}}>{r.name}</div>
                  <div style={{display:"flex",gap:8,flexShrink:0}}>
                    <button onClick={()=>setEditId(r.id)} style={{padding:"6px 13px",borderRadius:10,background:"#EFEFED",color:"#283618",fontSize:13,fontWeight:600}}>Edit</button>
                    <button onClick={()=>startBake(r)} style={{padding:"6px 14px",borderRadius:10,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:700}}>Bake →</button>
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
                      <div style={{fontSize:10,fontWeight:700,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{f?f.name:i.label}</div>
                      <div style={{fontSize:15,fontWeight:800}}>{i.grams}g</div>
                      {i.type!=="flour"&&flourG>0&&<div style={{fontSize:11,color:"#5C5C5C",fontWeight:700}}>{bkPct(parseFloat(i.grams),flourG)}%</div>}
                    </div>;
                  })}
                </div>
              </div>
              <div style={{padding:"10px 18px",background:"#FFFFFF",borderTop:"0.5px solid #E0DED8",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#606c38",flex:1,marginRight:12}}>{r.notes||"No notes"}</span>
                <button onClick={()=>deleteRecipe(r.id)} style={{fontSize:12,color:"#9E3A3A",background:"none",fontWeight:600,flexShrink:0}}>Delete</button>
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
            <div style={{flex:1,fontSize:22,fontWeight:800,letterSpacing:"-0.02em"}}>Edit Recipe</div>
            <button onClick={()=>{startBake(editRecipe);setEditId(null);}} style={{padding:"8px 16px",borderRadius:12,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:700}}>Bake →</button>
          </div>

          {/* Name */}
          <Card>
            <input value={editRecipe.name} onChange={e=>updE(r=>({...r,name:e.target.value}))} placeholder="Recipe name"
              style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",borderRadius:0,padding:"6px 2px",fontSize:20,fontWeight:800,color:"#283618",outline:"none",letterSpacing:"-0.02em"}}/>
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
                      style={{fontSize:11,fontWeight:700,padding:"3px 7px",borderRadius:6,background:(editRecipe.tempUnit||"F")===u?"#283618":"transparent",color:(editRecipe.tempUnit||"F")===u?"#F8F8F6":"#ACACAC",border:"none",transition:"all 0.15s",cursor:"pointer"}}>°{u}</button>)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Dough formula */}
          <SecH>Dough Formula</SecH>
          <Card style={{padding:0,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 72px 64px 30px",padding:"9px 16px",background:"#E0DED8",borderBottom:"0.5px solid #E0DED8",gap:8,alignItems:"center"}}>
              {["Ingredient","Grams","Baker's %",""].map((h,i)=><div key={i} style={{fontSize:10,fontWeight:700,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",textAlign:i===1||i===2?"center":"left"}}>{h}</div>)}
            </div>

            {editRecipe.ingredients.map((ing,idx)=>{
              const flourG=parseFloat(editRecipe.ingredients.find(i=>i.type==="flour")?.grams)||0;
              const grams =parseFloat(ing.grams)||0;
              const pct   =ing.type==="flour"?"100.0":(flourG?bkPct(grams,flourG):"—");
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
                              style={{fontSize:10,fontWeight:700,color:"#606c38",background:"#EFEFED",border:"none",borderRadius:8,padding:"3px 7px",whiteSpace:"nowrap",flexShrink:0}}>
                              Use list
                            </button>
                          </div>
                        ) : (
                          /* Dropdown from DB */
                          <div>
                            <select value={ing.flourId||""}
                              onChange={e=>{
                                if(e.target.value==="__manual__"){
                                  updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,manual:true,flourId:"",label:""}:i)}));
                                } else {
                                  const f=FLOUR_DB.find(fl=>fl.id===e.target.value);
                                  updE(r=>({...r,ingredients:r.ingredients.map(i=>i.id===ing.id?{...i,flourId:e.target.value,label:f?f.name:i.label}:i)}));
                                }
                              }}
                              style={{background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"5px 2px",fontSize:14,fontWeight:600,color:flour?"#283618":"#606c38",outline:"none",width:"100%",cursor:"pointer",appearance:"auto"}}>
                              <option value="">Select flour…</option>
                              <optgroup label="─── White Bread">
                                {FLOUR_DB.filter(f=>f.type==="White Bread"||f.type==="White Bread (T55)"||f.type==="Organic White Bread"||f.type==="Organic Stoneground White"||f.type==="Stoneground Heritage White"||f.type==="High-Protein White Bread"||f.type==="Professional White Bread"||f.type==="Supermarket Bread Flour").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g protein)</option>)}
                              </optgroup>
                              <optgroup label="─── Wholemeal">
                                {FLOUR_DB.filter(f=>f.type==="Wholemeal Bread"||f.type==="Wholemeal").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g protein)</option>)}
                              </optgroup>
                              <optgroup label="─── Rye">
                                {FLOUR_DB.filter(f=>f.type==="Rye"||f.type==="Whole Rye"||f.type==="Light Rye").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g protein)</option>)}
                              </optgroup>
                              <optgroup label="─── Spelt">
                                {FLOUR_DB.filter(f=>f.type==="Spelt").map(f=><option key={f.id} value={f.id}>{f.brand} — {f.name} ({f.protein}g protein)</option>)}
                              </optgroup>
                              <optgroup label="───">
                                <option value="__manual__">Not in list — enter manually…</option>
                              </optgroup>
                            </select>
                            {flour && <div style={{fontSize:11,color:"#606c38",marginTop:2,fontWeight:600}}>{flour.type} · {flour.protein}g protein/100g</div>}
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
                  <div style={{fontSize:13,fontWeight:700,color:"#5C5C5C",textAlign:"center"}}>{pct!=="—"?pct+"%":"—"}</div>
                  <button onClick={()=>updE(r=>({...r,ingredients:r.ingredients.filter(i=>i.id!==ing.id)}))}
                    style={{width:24,height:24,borderRadius:"50%",background:"#E8E8E8",color:"#5C5C5C",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                </div>
              </div>;
            })}

            <div style={{padding:"10px 16px",borderTop:"0.5px solid #E0DED8",display:"flex",gap:8}}>
              <button onClick={()=>updE(r=>({...r,ingredients:[...r.ingredients,{id:uid(),type:"flour",flourId:null,label:"",grams:""}]}))}
                style={{flex:1,padding:"9px",borderRadius:10,background:"#E8E8E8",color:"#5C5C5C",fontSize:13,fontWeight:700,border:"1.5px dashed #A0A0A0"}}>+ Flour</button>
              <button onClick={()=>updE(r=>({...r,ingredients:[...r.ingredients,{id:uid(),type:"other",flourId:null,label:"",grams:""}]}))}
                style={{flex:1,padding:"9px",borderRadius:10,background:"#F2F2F0",color:"#606c38",fontSize:13,fontWeight:700,border:"1.5px dashed #606c38"}}>+ Ingredient</button>
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
                    style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,border:"1px solid #E0DED8",background:editRecipe.autolyseEnabled?"#283618":"#E0DED8",color:editRecipe.autolyseEnabled?"#F8F8F6":"#606c38"}}>{editRecipe.autolyseEnabled?"On":"Off"}</button>}
                  {isBulk && <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:11,color:"#606c38",fontWeight:600}}>S&F</span>
                    <input type="number" value={s.sfCount} min={0} max={10}
                      onChange={e=>updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,sfCount:parseInt(e.target.value)||0}:st)}))}
                      style={{width:36,background:"transparent",border:"none",borderBottom:"1.5px solid #E0DED8",borderRadius:0,padding:"3px 0",fontSize:13,fontWeight:700,color:s.sfCount>0?s.color:"#606c38",textAlign:"center"}}/>
                  </div>}
                  {!disabled && <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <input type="number" value={displayVal} min={1} step={unit==="hr"?0.5:1}
                      onChange={e=>{const v=parseFloat(e.target.value)||1;const m=unit==="hr"?Math.round(v*60):Math.round(v);updE(r=>({...r,steps:r.steps.map((st,j)=>j===i?{...st,durationMin:m}:st)}));}}
                      style={{width:48,background:"#283618",border:"1px solid #E0DED8",borderRadius:8,padding:"5px 4px",fontSize:13,fontWeight:600,textAlign:"center"}}/>
                    <div style={{display:"flex",background:"#283618",borderRadius:8,border:"1px solid #E0DED8",overflow:"hidden"}}>
                      {["min","hr"].map(u=><button key={u} onClick={()=>updE(r=>({...r,stepUnit:{...r.stepUnit,[s.id]:u}}))}
                        style={{padding:"4px 6px",fontSize:11,fontWeight:700,background:unit===u?"#283618":"transparent",color:unit===u?"#F8F8F6":"#606c38"}}>{u}</button>)}
                    </div>
                  </div>}
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
                <span style={{fontSize:28,fontWeight:800,color:"#E0DED8"}}>B</span>
              </div>
              <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>No active bake</div>
              <p style={{color:"#606c38",fontSize:15,marginBottom:28,lineHeight:1.5}}>Choose a recipe and tap Bake to start.</p>
              {recipes.length>0 && <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{fontSize:12,fontWeight:700,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4,textAlign:"left"}}>Quick Start</div>
                {recipes.map(r=><button key={r.id} onClick={()=>startBake(r)}
                  style={{padding:"14px 18px",borderRadius:14,background:"#FFFFFF",border:"1px solid #E0DED8",color:"#283618",fontSize:15,fontWeight:700,textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 6px rgba(0,0,0,0.08)"}}>
                  {r.name}<span style={{color:"#5C5C5C",fontSize:13,fontWeight:700}}>Bake →</span>
                </button>)}
              </div>}
            </div>
          ) : <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.03em"}}>{bakeRecipe.name}</div>
                <div style={{fontSize:13,color:"#606c38",marginTop:3}}>Started {timeStr(bakeStartTime)} · {bakeRecipe.loaves} × {bakeRecipe.loafG}g · DDT {bakeRecipe.ddt}°{bakeRecipe.tempUnit||"F"}</div>
              </div>
              {activeStep!=null&&activeStep<bakeRecipe.steps.length&&
                <div style={{background:bakeRecipe.steps[activeStep].color+"22",color:bakeRecipe.steps[activeStep].color,borderRadius:20,padding:"6px 13px",fontSize:13,fontWeight:700}}>
                  {activeStep+1}/{bakeRecipe.steps.length}
                </div>}
            </div>

            {activeStep!=null&&activeStep<bakeRecipe.steps.length&&(()=>{
              const s=bakeRecipe.steps[activeStep],sfNext=nextSfIn(activeStep);
              return <Card style={{padding:24}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
                  <div style={{fontSize:11,fontWeight:800,color:s.color,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.name}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#606c38"}}>{fmtDur(s.durationMin)}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:24,marginBottom:22}}>
                  <Ring progress={prog(activeStep)} color={s.color}>
                    <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.04em",lineHeight:1}}>{fmtTime(remaining(activeStep))}</div>
                    <div style={{fontSize:10,fontWeight:700,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>left</div>
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
                {s.sfCount>0&&<div style={{marginBottom:18}}>
                  <Lbl>Stretch &amp; Folds</Lbl>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {Array.from({length:s.sfCount},(_,i)=>i+1).map(n=>{
                      const done=sfDone[activeStep]?.has(n);
                      return <button key={n} onClick={()=>toggleSF(activeStep,n)}
                        style={{width:44,height:44,borderRadius:13,background:done?s.color:"#E0DED8",color:done?"#FFFFFF":"#606c38",fontSize:15,fontWeight:800,boxShadow:done?`0 4px 12px ${s.color}44`:"none"}}>
                        {done?"✓":n}
                      </button>;
                    })}
                  </div>
                </div>}
                <textarea placeholder={`Notes for ${s.name}…`} value={stepNotes[activeStep]||""} onChange={e=>setStepNotes(p=>({...p,[activeStep]:e.target.value}))} rows={2}
                  style={{width:"100%",background:"#F8F8F6",border:"none",borderLeft:"3px solid #E0DED8",borderRadius:0,padding:"8px 12px",fontSize:14,color:"#283618",resize:"vertical",lineHeight:1.65,marginBottom:14,outline:"none",fontFamily:"inherit"}}/>
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
                  style={{width:"100%",padding:"16px",borderRadius:14,background:s.color,color:"#283618",fontSize:16,fontWeight:800,boxShadow:`0 6px 20px ${s.color}55`,letterSpacing:"-0.01em"}}>
                  Complete → {activeStep+1<bakeRecipe.steps.length?bakeRecipe.steps[activeStep+1].name:"Finish"}
                </button>
              </Card>;
            })()}

            {activeStep===null&&<Card><div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{width:56,height:56,borderRadius:18,background:"#283618",margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:24,fontWeight:800,color:"#5C5C5C"}}>✓</span>
              </div>
              <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>Bake complete!</div>
              <p style={{color:"#606c38",fontSize:14}}>Check your log for the session summary.</p>
            </div></Card>}

            <SecH>Timeline — tap to edit notes</SecH>
            <Card style={{padding:0,overflow:"hidden"}}>
              {bakeRecipe.steps.map((s,i)=>{
                const isPast=activeStep!=null&&i<activeStep,isCurr=i===activeStep,isFuture=activeStep!=null&&i>activeStep;
                const canEdit=isPast||isCurr,isOpen=editingStep===i;
                return <div key={s.id} style={{borderBottom:i<bakeRecipe.steps.length-1?"0.5px solid #1E2C30":"none"}}>
                  <div onClick={()=>canEdit&&setEditingStep(isOpen?null:i)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px",opacity:isFuture?0.35:1,cursor:canEdit?"pointer":"default",userSelect:"none"}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:isPast?"#5C5C5C":isCurr?s.color:"#E0DED8",flexShrink:0,transition:"background 0.4s"}}/>
                    <span style={{flex:1,fontSize:15,fontWeight:isCurr?700:400}}>{s.name}</span>
                    {stepNotes[i]&&<span style={{fontSize:11,color:"#606c38",fontWeight:700}}>note</span>}
                    {(stepPhotos[i]?.length||0)>0&&<span style={{fontSize:11,color:"#606c38",fontWeight:700}}>{stepPhotos[i].length} photo{stepPhotos[i].length>1?"s":""}</span>}
                    {isPast&&!isOpen&&<span style={{color:"#5C5C5C",fontSize:11,fontWeight:700}}>done</span>}
                    {isCurr&&<span className="pulse" style={{fontSize:11,fontWeight:800,color:s.color}}>ACTIVE</span>}
                    <span style={{fontSize:13,color:"#606c38"}}>{fmtDur(s.durationMin)}</span>
                    {s.sfCount>0&&<span style={{fontSize:11,fontWeight:700,color:s.color,background:s.color+"20",borderRadius:7,padding:"2px 7px"}}>×{s.sfCount}</span>}
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
                    <button onClick={()=>setEditingStep(null)} style={{marginTop:14,padding:"9px 20px",borderRadius:10,background:"#283618",color:"#F8F8F6",fontSize:13,fontWeight:700}}>Done</button>
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
          <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.03em",marginBottom:4}}>Session Log</div>
          <div style={{fontSize:14,color:"#606c38",marginBottom:20}}>{bakeStartTime&&bakeRecipe?`${bakeRecipe.name} · Started ${timeStr(bakeStartTime)}`:"No active session"}</div>

          {bakeRecipe&&<><SecH>Recipe</SecH>
          <Card>
            <div style={{fontSize:16,fontWeight:800,marginBottom:12}}>{bakeRecipe.name}</div>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              {bakeRecipe.ingredients.filter(i=>parseFloat(i.grams)).map(i=>{
                const fl=i.flourId?FLOUR_DB.find(f=>f.id===i.flourId):null;
                const flourG=parseFloat(bakeRecipe.ingredients.find(x=>x.type==="flour")?.grams)||0;
                return <div key={i.id}>
                  <Lbl>{fl?fl.name:i.label}</Lbl>
                  <div style={{fontSize:18,fontWeight:800}}>{i.grams}g</div>
                  {i.type!=="flour"&&flourG>0&&<div style={{fontSize:12,fontWeight:700,color:"#5C5C5C"}}>{bkPct(parseFloat(i.grams),flourG)}%</div>}
                </div>;
              })}
            </div>
          </Card></>}

          <SecH>Step Notes</SecH>
          {bakeRecipe&&bakeRecipe.steps.some((_,i)=>stepNotes[i]||stepPhotos[i]?.length)?(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {bakeRecipe.steps.map((s,i)=>{
                if(!stepNotes[i]&&!stepPhotos[i]?.length)return null;
                return <Card key={s.id}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:s.color}}/>
                    <span style={{fontSize:15,fontWeight:700}}>{s.name}</span>
                    {stepStartTimes[i]&&<span style={{fontSize:12,color:"#606c38",marginLeft:"auto"}}>{timeStr(stepStartTimes[i])}</span>}
                  </div>
                  {stepNotes[i]&&<p style={{fontSize:14,color:"#606c38",lineHeight:1.65,marginBottom:stepPhotos[i]?.length?12:0}}>{stepNotes[i]}</p>}
                  {stepPhotos[i]?.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{stepPhotos[i].map((ph,pi)=><img key={pi} src={ph.src} alt="" style={{height:80,width:80,objectFit:"cover",borderRadius:14,border:"1px solid #E0DED8"}}/>)}</div>}
                </Card>;
              })}
            </div>
          ):<Card><p style={{fontSize:14,color:"#9A9A90",textAlign:"center",padding:"8px 0"}}>Notes appear here as you bake.</p></Card>}

          <SecH>Session Notes</SecH>
          <Card>
            <textarea value={sessionNotes} onChange={e=>setSessionNotes(e.target.value)} placeholder="Crumb, environment, what to tweak…" rows={5}
              style={{width:"100%",background:"transparent",border:"none",borderBottom:"2px solid #E0DED8",borderRadius:0,padding:"6px 2px",fontSize:15,color:"#283618",resize:"vertical",lineHeight:1.7,outline:"none",fontFamily:"inherit"}}/>
          </Card>
        </div>}

        {/* ══════════════════════════════
            INGREDIENTS
        ══════════════════════════════ */}
        {view===VIEWS.INGREDIENTS && <div className="su">
          <div style={{fontSize:26,fontWeight:800,letterSpacing:"-0.03em",marginBottom:2}}>Ingredients</div>
          <div style={{fontSize:14,color:"#606c38",marginBottom:18}}>Australian flour database · {FLOUR_DB.length} flours</div>

          {/* Search */}
          <input value={flourSearch} onChange={e=>setFlourSearch(e.target.value)} placeholder="Search flour or brand…"
            style={{width:"100%",background:"#FFFFFF",border:"1px solid #E0DED8",borderRadius:14,padding:"12px 16px",fontSize:15,color:"#283618",outline:"none",boxShadow:"0 1px 4px rgba(0,0,0,0.4)",marginBottom:12}}/>

          {/* Type filters */}
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginBottom:20,scrollbarWidth:"none"}}>
            {flourTypes.map(t=>(
              <button key={t} onClick={()=>setFlourFilter(t)}
                style={{padding:"6px 13px",borderRadius:20,fontSize:12,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,background:flourFilter===t?"#283618":"#FFFFFF",color:flourFilter===t?"#F8F8F6":"#606c38",border:`1px solid ${flourFilter===t?"#283618":"#E0DED8"}`,transition:"all 0.2s"}}>
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
                    <div style={{fontSize:11,fontWeight:700,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{f.brand}</div>
                    <div style={{fontSize:16,fontWeight:800,letterSpacing:"-0.01em",marginBottom:8}}>{f.name}</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <Badge color="#606c38">{f.type}</Badge>
                      <Badge color="#606c38">{f.sizes.join(", ")}</Badge>
                    </div>
                  </div>
                  {/* Protein callout */}
                  <div style={{textAlign:"center",flexShrink:0,minWidth:56}}>
                    <div style={{fontSize:24,fontWeight:900,color:"#283618",letterSpacing:"-0.03em",lineHeight:1}}>{f.protein}<span style={{fontSize:12,fontWeight:600,color:"#606c38"}}>g</span></div>
                    <div style={{fontSize:9,fontWeight:700,color:"#606c38",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>protein</div>
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
                    <div style={{fontSize:9,fontWeight:700,color:n.hi?"#5C5C5C":"#606c38",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:5}}>{n.l}</div>
                    <div style={{fontSize:14,fontWeight:800,color:n.hi?"#5C5C5C":"#FFFFFF"}}>{n.v}</div>
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

                <div style={{fontSize:11,color:"#E0DED8",marginTop:12}}>Sodium: {f.sodium}mg · {f.where}</div>
              </div>}
            </Card>;
          })}

          {filtered.length===0 && <Card><p style={{textAlign:"center",color:"#606c38",padding:"20px 0"}}>No flours match your search.</p></Card>}
        </div>}

      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{display:"none"}}/>
    </div>
  );
}

export default App;
