import {useState,useMemo} from 'react';import {createRoot} from 'react-dom/client';
const I18N={"en":{"format":"Format","minify":"Minify","copy":"Copy","tree":"Tree","raw":"Raw","invalid":"Invalid JSON","sort":"Sort keys"},"de":{"format":"Formatieren","minify":"Minifizieren","copy":"Kopieren","tree":"Baum","raw":"Roh","invalid":"Ungültiges JSON","sort":"Schlüssel sortieren"}};
let lang=localStorage.getItem('lang')||'en';const t=k=>I18N[lang][k]||k;
const SAMPLE=JSON.stringify({user:{name:'ada',roles:['admin','dev'],stats:{posts:128,followers:2048}},tags:['json','react','tool'],active:true,score:null,note:'json lens demo'},null,2);
function TreeNode({k,v,depth}){
  const [open,setOpen]=useState(depth<2);
  const isObj=v!==null&&typeof v==='object';
  if(!isObj){
    let cls='n',txt=String(v);
    if(typeof v==='string'){cls='s';txt='"'+v+'"';}
    if(typeof v==='boolean'){cls='b';txt=String(v);}
    if(v===null){cls='b';txt='null';}
    return <div style={{paddingLeft:depth*14}}><span className="k">"{k}"</span>: <span className={cls}>{txt}</span></div>;
  }
  const entries=Object.entries(v);
  return <details open={open} onToggle={e=>setOpen(e.target.open)} style={{paddingLeft:depth*14}}>
    <summary onClick={e=>{e.preventDefault();setOpen(!open);}}><span className="k">"{k}"</span>: {Array.isArray(v)?'[${entries.length}]':'{'+entries.length+'}'}</summary>
    <div>{entries.map(([kk,vv])=><TreeNode key={kk} k={kk} v={vv} depth={depth+1}/>)}</div>
  </details>;
}
function App(){
  const [text,setText]=useState(SAMPLE);
  const [mode,setMode]=useState('tree');
  const [err,setErr]=useState(null);
  const [sort,setSort]=useState(false);
  const parsed=useMemo(()=>{try{const p=JSON.parse(text);setErr(null);return p;}catch(e){setErr(e.message);return null;}},[text]);
  const sorted=useMemo(()=>{if(!parsed||!sort)return parsed;const s=o=>Array.isArray(o)?o.map(s):(o&&typeof o==='object'?Object.fromEntries(Object.keys(o).sort().map(k=>[k,s(o[k])])):o);return s(parsed);},[parsed,sort]);
  function act(fn){if(!parsed)return;setText(fn(sorted));setMode('raw');}
  return <div className="jl">
    <div className="left">
      <textarea value={text} onChange={e=>setText(e.target.value)} spellCheck="false"/>
      <div className="stats">{err?<span className="err">{err}</span>:' '}</div>
    </div>
    <div className="mid"><div style={{display:'flex',flexDirection:'column',gap:8}}>
      <button onClick={()=>act(v=>JSON.stringify(v,null,2))}>{t('format')}</button>
      <button onClick={()=>act(v=>JSON.stringify(v))}>{t('minify')}</button>
      <button onClick={()=>setMode(mode==='tree'?'raw':'tree')}>{mode==='tree'?t('raw'):t('tree')}</button>
      <button onClick={()=>navigator.clipboard.writeText(mode==='tree'?JSON.stringify(sorted):text)}>{t('copy')}</button>
      <button onClick={()=>setSort(!sort)} style={{fontSize:11}}>{t('sort')}</button>
    </div></div>
    <div className="right">
      {mode==='tree'&&parsed?<div className="tree">{Array.isArray(parsed)?parsed.map((v,i)=><TreeNode key={i} k={String(i)} v={v} depth={0}/>):Object.entries(parsed).map(([k,v])=><TreeNode key={k} k={k} v={v} depth={0}/>)}</div>
      :<textarea readOnly value={text} style={{flex:1}}/>}
    </div>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);