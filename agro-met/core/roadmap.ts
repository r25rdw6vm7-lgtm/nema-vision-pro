export type RoadmapPhase = { id:string; title:string; domains:string[]; capabilities:string[] };

export const AGRO_MET_INFINITY_ROADMAP: RoadmapPhase[] = [
  { id:'P01', title:'Core Intelligence', domains:['core','data'], capabilities:['validation','provenance','freshness','uncertainty','calibration','anomaly detection','drift detection','model health'] },
  { id:'P02', title:'Field Digitalization', domains:['parcel','location'], capabilities:['GNSS','RTK','polygons','zones','elevation','slope','routing','coverage'] },
  { id:'P03', title:'Environment', domains:['weather','soil','microclimate'], capabilities:['realtime weather','forecast','ET0','VPD','soil profile','water balance','sensor health'] },
  { id:'P04', title:'Plant Intelligence', domains:['crop','phenology','vision'], capabilities:['growth stage','plant health','segmentation','tracking','before-after','video understanding'] },
  { id:'P05', title:'Biosecurity', domains:['disease','pest','weed'], capabilities:['disease onset','infection window','life cycle','degree days','thresholds','spread','weed hotspots'] },
  { id:'P06', title:'Remote Sensing', domains:['satellite','fusion'], capabilities:['NDVI','NDRE','NDMI','EVI','SAVI','time series','change detection','hotspots'] },
  { id:'P07', title:'Decision Intelligence', domains:['risk','decision'], capabilities:['multi-risk','72h','what-if','alternatives','cost-benefit','ROI','human approval'] },
  { id:'P08', title:'Digital Farm Twin', domains:['digital-twin'], capabilities:['parcel twin','soil twin','plant twin','growth simulation','intervention simulation'] },
  { id:'P09', title:'Agronomist AI', domains:['agronomist-ai','knowledge'], capabilities:['natural language','multimodal Q&A','evidence','RAG','knowledge graph','expert workflows'] },
  { id:'P10', title:'Operations', domains:['operations','robotics'], capabilities:['tasks','scouting','drone','tractor telemetry','autonomous routing','variable rate'] },
  { id:'P11', title:'Economics', domains:['economics','harvest'], capabilities:['costs','yield value','loss','profit','harvest window','quality','storage'] },
  { id:'P12', title:'Autonomy', domains:['automation','agents'], capabilities:['multi-agent supervision','continuous monitoring','adaptive sampling','automatic verification','closed-loop learning'] },
  { id:'P13', title:'Scale', domains:['regional','global'], capabilities:['regional radar','country radar','global outbreak intelligence','federated learning','multi-tenant scale'] },
  { id:'P∞', title:'Continuous Evolution', domains:['all'], capabilities:['new data sources','new models','new crops','new risks','new agents','new devices','new decisions','continuous learning'] },
];

export const SYSTEM_LOOP = ['observe','validate','fuse','understand','predict','simulate','decide','act','measure','learn','recalibrate'];
