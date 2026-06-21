
window.GIAE={};
GIAE.data={empalmes:null};
GIAE.state={proyecto:{compania:"CGE",sistema:"mono",kw:0},cargas:[],evidencias:[],resultados:{}};
GIAE.storage={key:"giae_v4_modular",load(){try{let r=localStorage.getItem(this.key);if(r)GIAE.state=JSON.parse(r)}catch(e){}},save(){localStorage.setItem(this.key,JSON.stringify(GIAE.state));GIAE.app.stats()},reset(){if(confirm("¿Borrar datos locales?")){localStorage.removeItem(this.key);location.reload()}}};
GIAE.calc={n(v,d=0){let x=Number(v);return isFinite(x)?x:d},kwW(kw){return this.n(kw)*1000},iKW(kw,s="mono",fp=1){let w=this.kwW(kw);return s==="trifa"?w/(Math.sqrt(3)*380*fp):w/(220*fp)},iW(w,s="mono",fp=1){return s==="trifa"?w/(Math.sqrt(3)*380*fp):w/(220*fp)},prot(i){return[6,10,16,20,25,32,40,50,63,80,100,125,160,200,225,250,320,400,500,630].find(x=>x>=i)||"Revisar"},cond(i,t=""){t=t.toLowerCase();if(t.includes("alumbrado")&&i<=10)return 1.5;if(i<=16)return 2.5;if(i<=25)return 4;if(i<=32)return 6;if(i<=40)return 10;if(i<=63)return 16;if(i<=80)return 25;if(i<=100)return 35;return"Revisar"},ducto(i){if(i<=16)return"20 mm";if(i<=32)return"25 mm";if(i<=63)return"32 mm";if(i<=100)return"40 mm";return"Revisar"}};
GIAE.proyecto={guardar(){if(!GIAE.demo.exigirDemo('guardar proyectos'))return;let p=GIAE.state.proyecto;p.nombre=pNombre.value;p.cliente=pCliente.value;p.rut=GIAE.rut.formatear(pRut.value);pRut.value=p.rut;if(p.rut && !GIAE.rut.validar(p.rut)){alert("El RUT ingresado no es válido. Se guardará formateado, pero debes revisarlo.");}p.direccion=pDir.value;p.comuna=pComuna.value;p.compania=pComp.value;p.sistema=pSis.value;p.kw=GIAE.calc.n(pKw.value);p.obs=pObs.value;GIAE.storage.save();alert("Proyecto guardado")},cargar(){let p=GIAE.state.proyecto;pNombre.value=p.nombre||"";pCliente.value=p.cliente||"";pRut.value=GIAE.rut.formatear(p.rut||"");pDir.value=p.direccion||"";pComuna.value=p.comuna||"Coronel";pComp.value=p.compania||"CGE";pSis.value=p.sistema||"mono";pKw.value=p.kw||"";pObs.value=p.obs||""}};
GIAE.cuadro={totalW(){return GIAE.state.cargas.reduce((a,c)=>a+(c.Wd||0),0)},totalKW(){return this.totalW()/1000},agregar(){let W=GIAE.calc.n(cW.value),fd=GIAE.calc.n(cFD.value,1),fp=GIAE.calc.n(cFP.value,1),s=cSis.value,Wd=W*fd,I=GIAE.calc.iW(Wd,s,fp),prot=GIAE.calc.prot(I),cond=GIAE.calc.cond(I,cTipo.value);GIAE.state.cargas.push({nombre:cNom.value||"Circuito",tipo:cTipo.value,sistema:s,fase:cFase.value,W,fd,fp,Wd,I,proteccion:prot,conductor:cond});GIAE.storage.save();this.render()},limpiar(){if(confirm("¿Limpiar cargas?")){GIAE.state.cargas=[];GIAE.storage.save();this.render()}},render(){let c=GIAE.state.cargas;if(!c.length){tablaCargas.innerHTML="No hay cargas.";return}tablaCargas.innerHTML=`<table><tr><th>#</th><th>Circuito</th><th>Tipo</th><th>Sistema</th><th>Fase</th><th>W</th><th>W demandado</th><th>A</th><th>Protección</th><th>Conductor</th></tr>${c.map((x,i)=>`<tr><td>${i+1}</td><td>${x.nombre}</td><td>${x.tipo}</td><td>${x.sistema}</td><td>${x.fase}</td><td>${x.W}</td><td>${x.Wd}</td><td>${x.I.toFixed(2)}</td><td>${x.proteccion} A</td><td>${x.conductor} mm²</td></tr>`).join("")}</table><h3>Total demandado: ${this.totalW().toFixed(0)} W / ${this.totalKW().toFixed(2)} kW</h3>`}};

GIAE.motorEmpalme={
  recomendar({kw,sistema,compania,fp,icc}){
    const I=GIAE.calc.iKW(kw,sistema,fp||1);
    const emp=GIAE.empalme.sel(compania,sistema,kw);
    const prot=GIAE.calc.prot(I);
    const cond=GIAE.calc.cond(I);
    const ducto=GIAE.calc.ducto(I);
    const pdc=icc?Math.ceil(icc*1.2):0;
    const pdcComercial=[6000,10000,15000,25000,36000,50000].find(x=>x>=pdc)||"Revisar";
    const obs=[];
    const alertas=[];
    obs.push("Validar factibilidad con la empresa distribuidora.");
    obs.push("Validar RIC/SEC, caída de tensión, puesta a tierra y capacidad real del alimentador.");
    if(sistema==="mono" && kw>8) alertas.push("Potencia monofásica alta: evaluar factibilidad o cambio a sistema trifásico.");
    if(I>40 && sistema==="mono") alertas.push("Corriente monofásica superior a 40 A: revisar límite de empalme, protección y conductor.");
    if(!icc || icc<=0) alertas.push("Falta Icc para definir poder de corte de la protección.");
    if(pdc && pdc>pdcComercial && pdcComercial!=="Revisar") alertas.push("Poder de corte comercial podría ser insuficiente.");
    if(cond==="Revisar") alertas.push("Corriente alta: conductor debe revisarse con tabla normativa y método de instalación.");
    if(kw<=0) alertas.push("Ingrese kW contratado/solicitado para calcular correctamente.");
    return {kw,w:kw*1000,sistema,compania,fp,I,emp,prot,cond,ducto,pdc,pdcComercial,obs,alertas};
  },
  html(r){
    const sis=r.sistema==="mono"?"Monofásico 220 V":"Trifásico 380 V";
    const alertaHtml=r.alertas.length?`<div class="warn"><b>Alertas:</b><br>${r.alertas.map(x=>"⚠ "+x).join("<br>")}</div>`:`<div class="ok">✓ Sin alertas críticas preliminares.</div>`;
    return `
      <div class="ok"><b>Empalme recomendado:</b> ${r.emp.codigo}</div>
      <span class="pill">${r.compania}</span>
      <span class="pill">${sis}</span>
      <span class="pill">${r.kw.toFixed(2)} kW</span>
      <h3>Resultado técnico preliminar</h3>
      <table>
        <tr><th>Dato</th><th>Resultado</th></tr>
        <tr><td>Potencia contratada / solicitada</td><td>${r.kw.toFixed(2)} kW</td></tr>
        <tr><td>Equivalente interno</td><td>${r.w.toFixed(0)} W</td></tr>
        <tr><td>Corriente estimada</td><td>${r.I.toFixed(2)} A</td></tr>
        <tr><td>Medición</td><td>${r.emp.medidor||"Revisar"}</td></tr>
        <tr><td>Protección sugerida</td><td>${r.emp.proteccion||r.prot+" A"}</td></tr>
        <tr><td>Conductor preliminar</td><td>${r.emp.conductor||r.cond+" mm² Cu"}</td></tr>
        <tr><td>Canalización preliminar</td><td>${r.ducto}</td></tr>
        <tr><td>Poder de corte mínimo</td><td>${r.pdc?r.pdc+" A = 1,2 × Icc":"Ingrese Icc"}</td></tr>
        <tr><td>Poder de corte comercial sugerido</td><td>${r.pdcComercial}</td></tr>
      </table>
      ${alertaHtml}
      <div class="warnline"><b>Observaciones RIC/SEC:</b><br>${r.obs.map(x=>"• "+x).join("<br>")}<br>• ${r.emp.observacion||"Revisar condiciones reales de instalación."}</div>
      <div class="mini">Resultado preliminar. Debe validarse con tablas oficiales, profesional autorizado y distribuidora.</div>
    `;
  }
};

GIAE.empalme={traer(){let kw=GIAE.state.proyecto.kw||GIAE.cuadro.totalKW();eKw.value=kw.toFixed(2);eW.value=(kw*1000).toFixed(0);eComp.value=GIAE.state.proyecto.compania||"CGE";eSis.value=GIAE.state.proyecto.sistema||"mono"},sel(comp,s,kw){let d=GIAE.data.empalmes?.[comp]||[];return d.find(x=>x.sistema===s&&kw>=x.kwMin&&kw<=x.kwMax)||{codigo:s==="mono"&&kw>8?"Factibilidad / evaluar trifásico":"Revisar distribuidora",proteccion:"Revisar",conductor:"Revisar"}},calcular(){let kw=GIAE.calc.n(eKw.value),s=eSis.value,comp=eComp.value,fp=GIAE.calc.n(eFP.value,1),icc=GIAE.calc.n(eIcc.value);eW.value=(kw*1000).toFixed(0);let r=GIAE.motorEmpalme.recomendar({kw,sistema:s,compania:comp,fp,icc});GIAE.state.resultados.empalme={kw,w:r.w,sistema:s,compania:comp,corriente:r.I,empalme:r.emp,pdc:r.pdc,proteccion:r.prot,conductor:r.cond,ducto:r.ducto,alertas:r.alertas,observaciones:r.obs};GIAE.storage.save();resEmp.innerHTML=GIAE.motorEmpalme.html(r);if(GIAE.estadisticas)GIAE.estadisticas.inc('empalmes')}};
GIAE.sec={generar(){let c=GIAE.state.cargas;if(!c.length){vistaSEC.innerHTML='<div class="warn">No hay circuitos cargados.</div>';return}let tw=0,r=0,s=0,t=0;let rows=c.map((x,i)=>{tw+=x.Wd;if(x.fase==="R")r+=x.I;if(x.fase==="S")s+=x.I;if(x.fase==="T")t+=x.I;let dif=(x.tipo==="Alumbrado"||x.tipo==="Enchufes")?"2x25A/30mA":"40A/30mA";return`<tr><td>TG</td><td>${i+1}</td><td>${x.nombre}</td><td>${x.tipo}</td><td>${x.Wd.toFixed(0)}</td><td>${(x.Wd/1000).toFixed(2)}</td><td>${x.fase==="R"?x.I.toFixed(2):""}</td><td>${x.fase==="S"?x.I.toFixed(2):""}</td><td>${x.fase==="T"?x.I.toFixed(2):""}</td><td>${x.proteccion}A</td><td>${dif}</td><td>${x.conductor} mm²</td><td>${x.conductor} mm²</td><td>RZ1/THHN</td><td>${GIAE.calc.ducto(x.I)}</td><td>${x.tipo}</td></tr>`}).join("");let p=GIAE.state.proyecto;let h=`<div class="secwrap"><table class="sectable"><tr><th colspan="16" class="sectitle">CUADRO DE CARGAS PROFESIONAL PRELIMINAR - GIAE CHILE</th></tr><tr><th>TAB.</th><th>CTO</th><th>CIRCUITO</th><th>TIPO</th><th>W</th><th>kW</th><th>R</th><th>S</th><th>T</th><th>DISY.</th><th>DIF.</th><th>DISTRIB.</th><th>DERIV.</th><th>TIPO CABLE</th><th>DUCTO</th><th>DESC.</th></tr>${rows}<tr class="sectotal"><td colspan="4">TOTAL</td><td>${tw.toFixed(0)}</td><td>${(tw/1000).toFixed(2)}</td><td>${r.toFixed(2)}</td><td>${s.toFixed(2)}</td><td>${t.toFixed(2)}</td><td colspan="7">Proyecto: ${p.nombre||"Sin nombre"} · Cliente: ${p.cliente||"Sin cliente"} · Compañía: ${p.compania||"Sin compañía"}</td></tr></table><p>GIAE Chile v6.2 · Julio Vera Concha © 2026 · Validar con RIC/SEC.</p></div>`;vistaSEC.innerHTML=h;GIAE.state.resultados.sec=h;GIAE.storage.save()},descargar(){if(!GIAE.demo.exigirDemo('descargar cuadro SEC'))return;GIAE.informe.download("Cuadro_SEC_GIAE.html",vistaSEC.innerHTML)}};
GIAE.conductores={traer(){let kw=GIAE.state.proyecto.kw||GIAE.cuadro.totalKW();dKw.value=kw.toFixed(2);dSis.value=GIAE.state.proyecto.sistema||"mono"},calcular(){let kw=GIAE.calc.n(dKw.value),sis=dSis.value,fp=GIAE.calc.n(dFP.value,1),I=GIAE.calc.iKW(kw,sis,fp),rho=dMat.value==="aluminio"?0.0282:0.0175,V=sis==="trifa"?380:220,f=sis==="trifa"?Math.sqrt(3):2,dv=f*I*rho*GIAE.calc.n(dL.value)/GIAE.calc.n(dSec.value),pct=dv/V*100,smin=GIAE.calc.n(dIcc.value)*Math.sqrt(GIAE.calc.n(dT.value,.1))/115;resCond.innerHTML=`<div class="${smin>GIAE.calc.n(dSec.value)?'err':'ok'}">Smin cortocircuito: ${smin.toFixed(2)} mm²</div><div class="${pct>3?'warn':'ok'}">Caída: ${dv.toFixed(2)} V (${pct.toFixed(2)}%)</div><p>Corriente: ${I.toFixed(2)} A</p>`}};
GIAE.protecciones={calcular(){let ib=GIAE.calc.n(prIb.value),iz=GIAE.calc.n(prIz.value),icc=GIAE.calc.n(prIcc.value),inn=GIAE.calc.prot(ib),cum=ib<=inn&&inn<=iz,pdc=Math.ceil(icc*1.2),com=[6000,10000,15000,25000,36000,50000].find(x=>x>=pdc)||"Revisar";resProt.innerHTML=`<div class="${cum?'ok':'err'}">${cum?'Cumple':'No cumple'}: ${ib} ≤ ${inn} ≤ ${iz}</div><div class="warn">PdC ≥ ${pdc} A. Comercial sugerido: ${com} A</div>`}};
GIAE.canal={sugerir(){let m=Math.max(0,...GIAE.state.cargas.map(c=>c.I));caN.value=GIAE.state.proyecto.sistema==="trifa"?4:3;caDc.value=m<=16?5:m<=32?7:m<=63?10:13;caDucto.value=m<=16?20:m<=32?25:m<=63?32:40},calcular(){let n=GIAE.calc.n(caN.value),dc=GIAE.calc.n(caDc.value),dd=GIAE.calc.n(caDucto.value),max=GIAE.calc.n(caMax.value,40),pct=(n*Math.PI*(dc/2)**2)/(Math.PI*(dd/2)**2)*100;resCanal.innerHTML=`<div class="${pct<=max?'ok':'err'}">Ocupación: ${pct.toFixed(1)}% ${pct<=max?'cumple':'supera'} máximo ${max}%</div>`}};
GIAE.unilineal={generar(){let p=GIAE.state.proyecto,emp=GIAE.state.resultados.empalme;let lines=[`COMPAÑÍA: ${p.compania||"Sin compañía"}`,`EMPALME: ${emp?.empalme?.codigo||"Por definir"}`,"","Red distribución","│","├── Medidor","├── Protección general","├── Tablero General",...GIAE.state.cargas.map((c,i)=>`│   ├── C${i+1} ${c.nombre} | ${c.tipo} | ${c.proteccion} A | ${c.conductor} mm²`),"└── Puesta a tierra RIC 06"];vistaUni.textContent=lines.join("\\n");GIAE.state.resultados.unilineal=vistaUni.textContent;GIAE.storage.save()},copiar(){navigator.clipboard.writeText(vistaUni.textContent).then(()=>alert("Copiado"))}};
GIAE.evidencias={agregar(){let file=evFile.files[0],it={tipo:evTipo.value,desc:evDesc.value,img:null,fecha:new Date().toLocaleString("es-CL")};if(file){let r=new FileReader();r.onload=()=>{it.img=r.result;GIAE.state.evidencias.push(it);GIAE.storage.save();this.render()};r.readAsDataURL(file)}else{GIAE.state.evidencias.push(it);GIAE.storage.save();this.render()}},limpiar(){if(confirm("¿Limpiar evidencias?")){GIAE.state.evidencias=[];GIAE.storage.save();this.render()}},render(){let e=GIAE.state.evidencias;if(!e.length){listaEv.innerHTML="No hay evidencias.";return}listaEv.innerHTML=e.map(x=>`<div class="ev"><b>${x.tipo}</b><br>${x.desc||""}<br><small>${x.fecha}</small>${x.img?`<br><img src="${x.img}">`:""}</div>`).join("")}};
GIAE.asistente={resumen(){let d=GIAE.experto.diagnosticar();return{p:d.p,kw:d.kw,I:d.I,emp:d.emp,prot:d.prot,cond:d.cond,alertas:d.alertas,ok:d.ok}},analizar(){let r=this.resumen();resAsis.innerHTML=`<div class="ok"><b>Análisis técnico preliminar v6.2</b><br>Proyecto: ${r.p.nombre||'Sin nombre'}<br>Cliente: ${r.p.cliente||'Sin cliente'}<br>RUT: ${GIAE.rut.formatear(r.p.rut||'No informado')}<br>Potencia contratada/solicitada: ${r.kw.toFixed(2)} kW<br>Corriente aproximada: ${r.I.toFixed(2)} A<br>Empalme sugerido: ${r.emp.codigo}<br>Protección preliminar: ${r.prot} A<br>Conductor preliminar: ${r.cond} mm² Cu<br><br><b>Estado:</b><br>${r.ok.map(x=>'✓ '+x).join('<br>')}<br>${r.alertas.map(x=>'⚠ '+x).join('<br>')}<br><br><b>Nota:</b> validar siempre con RIC/SEC y distribuidora.</div>`},recomendacionSEC(){resAsis.innerHTML=`<div class="ok"><b>Observación SEC preliminar</b><br>${GIAE.experto.observacionSEC()}</div>`},autoCompletar(){let d=GIAE.experto.diagnosticar();eKw.value=d.kw.toFixed(2);eW.value=(d.kw*1000).toFixed(0);eComp.value=d.comp;eSis.value=d.sis;prIb.value=d.I.toFixed(2);prIz.value=d.cond==='Revisar'?40:Math.max(40,Number(d.cond)*6);dKw.value=d.kw.toFixed(2);dSis.value=d.sis;resAsis.innerHTML='<div class="ok">Sugerencias cargadas en Motor Empalme, Protecciones y Conductores.</div>'},faltantes(){let p=GIAE.state.proyecto,f=[];if(!p.nombre||!p.cliente||!p.direccion)f.push("Completar proyecto");if(!GIAE.state.cargas.length)f.push("Agregar cuadro de carga");if(!GIAE.state.resultados.empalme)f.push("Calcular empalme por kW");if(!GIAE.state.resultados.unilineal)f.push("Generar unilineal");if(!GIAE.state.evidencias.length)f.push("Agregar evidencias");resAsis.innerHTML=f.length?`<div class="warn"><b>Faltantes:</b><br>${f.map(x=>"• "+x).join("<br>")}</div>`:`<div class="ok">Sin faltantes básicos.</div>`},responder(){if(GIAE.copiloto&&window.aPreg&&aPreg.value.trim()){GIAE.copiloto.responder();return}let q=aPreg.value.toLowerCase(),r=this.resumen();if(q.includes("empalme"))resAsis.innerHTML=`<div class="ok">Empalme sugerido: <b>${r.emp.codigo}</b> por ${r.kw.toFixed(2)} kW contratado/solicitado.</div>`;else if(q.includes("prote"))resAsis.innerHTML=`<div class="ok">Protección preliminar: ${r.prot} A.</div>`;else if(q.includes("conductor")||q.includes("cable"))resAsis.innerHTML=`<div class="ok">Conductor preliminar: ${r.cond} mm² Cu.</div>`;else if(q.includes("falta"))this.faltantes();else this.analizar()}};
GIAE.informe={generar(){let p=GIAE.state.proyecto,emp=GIAE.state.resultados.empalme,sec=GIAE.state.resultados.sec||"Cuadro SEC no generado",uni=GIAE.state.resultados.unilineal||"Unilineal no generado",ev=GIAE.state.evidencias.map(x=>`<div class="ev"><b>${x.tipo}</b><br>${x.desc||""}${x.img?`<br><img src="${x.img}">`:""}</div>`).join("")||"Sin evidencias";vistaInforme.innerHTML=`<h2>Informe Técnico Preliminar GIAE Chile</h2><p><b>Autor sistema:</b> Julio Vera Concha © 2026</p><h3>Proyecto</h3><p>${p.nombre||""}<br>${p.cliente||""}<br>${p.direccion||""}<br>${p.compania||""}</p><h3>Empalme</h3><p>${emp?.empalme?.codigo||"No calculado"}</p><h3>Cuadro SEC</h3>${sec}<h3>Unilineal</h3><pre class="code">${uni}</pre><h3>Evidencias</h3>${ev}<p>Validar con RIC/SEC y distribuidora.</p>`},download(n,c){let b=new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${n}</title><link rel="stylesheet" href="css/styles.css"></head><body>${c}</body></html>`],{type:"text/html"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=n;a.click();URL.revokeObjectURL(u)},descargar(){if(!GIAE.demo.exigirDemo('descargar informes'))return;this.download("Informe_GIAE_Chile.html",vistaInforme.innerHTML)}};

GIAE.rut={
  limpiar(v){return (v||"").replace(/[^0-9kK]/g,"").toUpperCase()},
  formatear(v){
    let s=this.limpiar(v);
    if(!s) return "";
    let dv=s.slice(-1);
    let cuerpo=s.slice(0,-1);
    cuerpo=cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g,".");
    return cuerpo?`${cuerpo}-${dv}`:dv;
  },
  validar(v){
    let s=this.limpiar(v);
    if(s.length<2) return false;
    let cuerpo=s.slice(0,-1);
    let dv=s.slice(-1);
    let suma=0,m=2;
    for(let i=cuerpo.length-1;i>=0;i--){
      suma+=Number(cuerpo[i])*m;
      m=m===7?2:m+1;
    }
    let res=11-(suma%11);
    let dvCalc=res===11?"0":res===10?"K":String(res);
    return dv===dvCalc;
  },
  instalar(){
    const el=document.getElementById("pRut");
    if(!el) return;
    el.addEventListener("input",()=>{
      const pos=el.selectionStart;
      el.value=this.formatear(el.value);
    });
    el.addEventListener("blur",()=>{
      if(el.value && !this.validar(el.value)){
        el.classList.add("input-error");
        alert("RUT no válido. Revísalo antes de guardar.");
      }else{
        el.classList.remove("input-error");
      }
    });
  }
};


GIAE.experto={
  diagnosticar(){
    let p=GIAE.state.proyecto;
    let kw=p.kw||GIAE.cuadro.totalKW();
    let sis=p.sistema||"mono";
    let comp=p.compania||"CGE";
    let I=GIAE.calc.iKW(kw,sis,1);
    let emp=GIAE.empalme.sel(comp,sis,kw);
    let prot=GIAE.calc.prot(I);
    let cond=GIAE.calc.cond(I);
    let alertas=[];
    let ok=[];
    if(!p.nombre) alertas.push("Falta nombre del proyecto.");
    if(!p.cliente) alertas.push("Falta cliente.");
    if(!p.rut) alertas.push("Falta RUT del cliente.");
    if(!p.direccion) alertas.push("Falta dirección.");
    if(!kw || kw<=0) alertas.push("Falta potencia contratada/solicitada en kW o cuadro de carga.");
    if(!GIAE.state.cargas.length) alertas.push("Falta cuadro de carga.");
    if(sis==="mono" && kw>8) alertas.push("Potencia monofásica alta: evaluar factibilidad o sistema trifásico.");
    if(I>40 && sis==="mono") alertas.push("Corriente monofásica alta: revisar protección, conductor y factibilidad.");
    if(GIAE.state.cargas.length) ok.push("Cuadro de carga cargado.");
    if(p.rut && GIAE.rut && GIAE.rut.validar(p.rut)) ok.push("RUT válido.");
    if(kw>0) ok.push("Potencia base disponible para cálculo de empalme.");
    return {p,kw,sis,comp,I,emp,prot,cond,alertas,ok};
  },
  observacionSEC(){
    const d=this.diagnosticar();
    return `Proyecto eléctrico preliminar para ${d.p.compania||"distribuidora"}, con potencia solicitada de ${d.kw.toFixed(2)} kW en sistema ${d.sis==="mono"?"monofásico":"trifásico"}. Empalme preliminar sugerido: ${d.emp.codigo}. La información debe ser validada con factibilidad de la empresa distribuidora, normativa RIC vigente, cálculo de caída de tensión, capacidad de conductores, protecciones, puesta a tierra y antecedentes exigidos para declaración SEC.`;
  }
};



GIAE.demo={
  sessionKey:"giae_demo_ok",
  modo(){return sessionStorage.getItem(this.sessionKey)||""},
  login(){
    const u=(document.getElementById("loginUser")?.value||"").trim().toLowerCase();
    const p=(document.getElementById("loginPass")?.value||"").trim();
    if(u==="demo" && p==="demo123"){
      sessionStorage.setItem(this.sessionKey,"demo");
      this.aplicarModo();
      document.getElementById("demoLogin")?.classList.add("oculto");
    }else{
      alert("Acceso demo incorrecto. Usa usuario demo y clave demo123.");
    }
  },
  entrarLibre(){
    sessionStorage.setItem(this.sessionKey,"visitante");
    this.aplicarModo();
    document.getElementById("demoLogin")?.classList.add("oculto");
  },
  revisar(){
    // v6.2: nunca recuerda localStorage ni entra solo.
    localStorage.removeItem(this.sessionKey);
    const x=document.getElementById("demoLogin");
    if(!x) return;
    if(this.modo()){
      x.classList.add("oculto");
    }else{
      x.classList.remove("oculto");
    }
    this.aplicarModo();
  },
  aplicarModo(){
    const modo=this.modo()||"sin acceso";
    if(window.sessionMode){
      sessionMode.textContent = modo==="demo" ? "Modo Demo · usuario demo" : modo==="visitante" ? "Modo Visitante · acceso limitado" : "Selecciona un modo de acceso";
    }
    document.body.classList.toggle("modo-visitante", modo==="visitante");
    document.body.classList.toggle("modo-demo", modo==="demo");
  },
  exigirDemo(accion){
    if(this.modo()==="visitante"){
      alert(`Modo visitante: ${accion} estará disponible en demo/profesional. Ingresa como demo para probar más funciones.`);
      return false;
    }
    if(!this.modo()){
      alert("Primero debes ingresar como demo o visitante.");
      return false;
    }
    return true;
  },
  salir(){
    sessionStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.sessionKey);
    const x=document.getElementById("demoLogin");
    if(x) x.classList.remove("oculto");
    this.aplicarModo();
  }
};


GIAE.comunidad={
  keySug:"giae_sugerencias_v52",
  keyInt:"giae_interesados_v52",
  keyVal:"giae_valoraciones_v52",
  arr(k){try{return JSON.parse(localStorage.getItem(k)||"[]")}catch(e){return[]}},
  save(k,v){localStorage.setItem(k,JSON.stringify(v));this.render()},
  guardarSugerencia(){
    const item={nombre:sugNombre.value.trim(),correo:sugCorreo.value.trim(),texto:sugTexto.value.trim(),fecha:new Date().toLocaleString("es-CL")};
    if(!item.nombre||!item.texto){alert("Completa nombre y comentario.");return}
    const a=this.arr(this.keySug);a.push(item);this.save(this.keySug,a);
    sugNombre.value="";sugCorreo.value="";sugTexto.value="";
    alert("Sugerencia guardada localmente.");
  },
  guardarInteresado(){
    const item={nombre:proNombre.value.trim(),empresa:proEmpresa.value.trim(),correo:proCorreo.value.trim(),telefono:proTelefono.value.trim(),region:proRegion.value.trim(),cargo:proCargo.value.trim(),necesidad:proNecesidad.value.trim(),fecha:new Date().toLocaleString("es-CL")};
    if(!item.nombre||!item.correo){alert("Completa nombre y correo.");return}
    const a=this.arr(this.keyInt);a.push(item);this.save(this.keyInt,a);
    proNombre.value="";proEmpresa.value="";proCorreo.value="";proTelefono.value="";proRegion.value="";proCargo.value="";proNecesidad.value="";
    alert("Solicitud guardada localmente. Copia la lista para respaldarla.");
  },
  valorar(n){const a=this.arr(this.keyVal);a.push(Number(n));this.save(this.keyVal,a);alert("Gracias por valorar GIAE.");},
  copiarSugerencias(){navigator.clipboard.writeText(JSON.stringify(this.arr(this.keySug),null,2)).then(()=>alert("Sugerencias copiadas."))},
  copiarInteresados(){navigator.clipboard.writeText(JSON.stringify(this.arr(this.keyInt),null,2)).then(()=>alert("Interesados copiados."))},
  render(){
    const sug=this.arr(this.keySug), ints=this.arr(this.keyInt), vals=this.arr(this.keyVal);
    if(window.listaSugerencias) listaSugerencias.innerHTML=sug.length?sug.map(x=>`<div class="ev"><b>${x.nombre}</b> ${x.correo?`· ${x.correo}`:""}<br>${x.texto}<br><small>${x.fecha}</small></div>`).join(""):"No hay sugerencias guardadas.";
    if(window.listaInteresados) listaInteresados.innerHTML=ints.length?ints.map(x=>`<div class="ev"><b>${x.nombre}</b> · ${x.empresa||"Sin empresa"}<br>${x.correo} · ${x.telefono||""}<br>${x.region||""} · ${x.cargo||""}<br>${x.necesidad||""}<br><small>${x.fecha}</small></div>`).join(""):"No hay interesados registrados.";
    if(window.statInteresados) statInteresados.textContent=ints.length;
    if(window.statSugerencias) statSugerencias.textContent=sug.length;
    if(window.statRegiones) statRegiones.textContent=[...new Set(ints.map(x=>(x.region||"").toLowerCase()).filter(Boolean))].length;
    if(window.statValoracion) statValoracion.textContent=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):"0";
  }
};


GIAE.bibliotecaSEC={
  items:[
    {tipo:"Empalme BT 1F",aplicacion:"Viviendas y cargas monofásicas pequeñas.",normativa:"RIC 01, RIC 02, RIC 04, RIC 06 y criterios de distribuidora.",observacion:"Validar potencia contratada, ubicación del medidor y factibilidad."},
    {tipo:"Empalme BT 3F",aplicacion:"Instalaciones trifásicas, locales comerciales y cargas mayores.",normativa:"RIC 01, RIC 02, RIC 04, RIC 05, RIC 06.",observacion:"Revisar equilibrio de fases, protecciones, conductor y canalización."},
    {tipo:"Empalme BT AP",aplicacion:"Alumbrado público o alimentación asociada a servicios exteriores.",normativa:"RIC aplicable, exigencias municipales y distribuidora.",observacion:"Validar ubicación, protección, puesta a tierra y gabinete."},
    {tipo:"Empalme BT Subterráneo",aplicacion:"Acometidas subterráneas y proyectos con canalización enterrada.",normativa:"RIC 04, RIC 05, RIC 06 y exigencias de zanja/canalización.",observacion:"Revisar profundidad, ductos, cámaras, conductores y sellos."},
    {tipo:"Empalme Concentrado",aplicacion:"Edificios, conjuntos habitacionales o múltiples suministros.",normativa:"RIC 01, RIC 02, RIC 18 y requisitos de compañía.",observacion:"Requiere coordinación de tableros, medidores y espacios técnicos."},
    {tipo:"Medición Indirecta BT",aplicacion:"Potencias altas en baja tensión con transformadores de corriente.",normativa:"RIC, protocolos de medición y exigencias específicas de distribuidora.",observacion:"Requiere estudio y aprobación previa de la compañía."},
    {tipo:"MT Indirecta",aplicacion:"Proyectos de media tensión o clientes con demanda elevada.",normativa:"Normativa MT, SEC, distribuidora y proyecto especializado.",observacion:"Requiere ingeniería dedicada y factibilidad formal."}
  ],
  render(){
    if(!window.bibliotecaSECGrid)return;
    bibliotecaSECGrid.innerHTML=this.items.map(x=>`<div class="lib-card"><h3>${x.tipo}</h3><p><b>Aplicación:</b> ${x.aplicacion}</p><p><b>Normativa:</b> ${x.normativa}</p><p><b>Observación:</b> ${x.observacion}</p></div>`).join("");
  }
};

GIAE.secPro={
  riesgo(r){
    let puntos=0;
    if(r.kw>8 && r.sistema==="mono")puntos+=2;
    if(r.I>40)puntos+=1;
    if(r.alertas&&r.alertas.length)puntos+=r.alertas.length;
    if(puntos>=4)return "Alto";
    if(puntos>=2)return "Medio";
    return "Bajo";
  },
  generarDesdeEmpalme(){
    const p=GIAE.state.proyecto||{};
    const e=GIAE.state.resultados?.empalme;
    if(!e){alert("Primero calcula el empalme experto.");return}
    const riesgo=this.riesgo({kw:e.kw||0,sistema:e.sistema,I:e.corriente||0,alertas:e.alertas||[]});
    const fecha=new Date().toLocaleDateString("es-CL");
    vistaInforme.innerHTML=`
      <div class="report">
        <h1>GIAE Chile</h1>
        <h2>Informe Técnico Preliminar SEC</h2>
        <p><b>Gestor Inteligente de Análisis para Empalmes</b></p>
        <hr>
        <h3>1. Datos del proyecto</h3>
        <table>
          <tr><td>Proyecto</td><td>${p.nombre||"No informado"}</td></tr>
          <tr><td>Cliente</td><td>${p.cliente||"No informado"}</td></tr>
          <tr><td>RUT</td><td>${p.rut||"No informado"}</td></tr>
          <tr><td>Dirección</td><td>${p.direccion||"No informado"}</td></tr>
          <tr><td>Comuna</td><td>${p.comuna||"No informado"}</td></tr>
          <tr><td>Compañía</td><td>${p.compania||e.compania||"No informado"}</td></tr>
          <tr><td>Fecha</td><td>${fecha}</td></tr>
        </table>
        <h3>2. Resultado Motor Experto SEC</h3>
        <table>
          <tr><td>Potencia</td><td>${(e.kw||0).toFixed(2)} kW</td></tr>
          <tr><td>Equivalente</td><td>${(e.w||0).toFixed(0)} W</td></tr>
          <tr><td>Sistema</td><td>${e.sistema==="mono"?"Monofásico":"Trifásico"}</td></tr>
          <tr><td>Corriente estimada</td><td>${(e.corriente||0).toFixed(2)} A</td></tr>
          <tr><td>Empalme recomendado</td><td>${e.empalme?.codigo||"Revisar"}</td></tr>
          <tr><td>Protección sugerida</td><td>${e.empalme?.proteccion||e.proteccion+" A"}</td></tr>
          <tr><td>Conductor preliminar</td><td>${e.empalme?.conductor||e.conductor+" mm² Cu"}</td></tr>
          <tr><td>Canalización preliminar</td><td>${e.ducto||"Revisar"}</td></tr>
          <tr><td>Nivel de riesgo</td><td>${riesgo}</td></tr>
        </table>
        <h3>3. Observaciones RIC/SEC</h3>
        <ul>${(e.observaciones||[]).map(x=>`<li>${x}</li>`).join("")}</ul>
        <h3>4. Alertas técnicas</h3>
        ${(e.alertas&&e.alertas.length)?`<ul>${e.alertas.map(x=>`<li>${x}</li>`).join("")}</ul>`:"<p>Sin alertas críticas preliminares.</p>"}
        <h3>5. Nota técnica</h3>
        <p>Este informe es preliminar. Debe validarse con normativa RIC/SEC vigente, tablas oficiales, condiciones reales de instalación, factibilidad de la empresa distribuidora y revisión de profesional autorizado.</p>
        <p><b>Desarrollado por:</b> Julio Vera Concha</p>
      </div>`;
    GIAE.historial.guardarActual(false);if(GIAE.estadisticas)GIAE.estadisticas.inc('informes');
  }
};

GIAE.historial={
  key:"giae_historial_v57",
  arr(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  save(a){localStorage.setItem(this.key,JSON.stringify(a));this.render()},
  guardarActual(mostrar=true){
    const p=GIAE.state.proyecto||{}, e=GIAE.state.resultados?.empalme||{};
    const item={fecha:new Date().toLocaleString("es-CL"),nombre:p.nombre||"Proyecto sin nombre",cliente:p.cliente||"",rut:p.rut||"",potencia:e.kw||p.kw||0,resultado:e.empalme?.codigo||"Pendiente",estado:e.empalme?"Calculado":"Pendiente"};
    const a=this.arr();a.unshift(item);this.save(a.slice(0,50));
    if(mostrar)alert("Proyecto guardado en historial local.");
  },
  render(){
    if(!window.historialLista)return;
    const q=(window.historialBuscar?.value||"").toLowerCase();
    let a=this.arr();
    if(q)a=a.filter(x=>`${x.fecha} ${x.nombre} ${x.cliente} ${x.rut} ${x.resultado} ${x.estado}`.toLowerCase().includes(q));
    historialLista.innerHTML=a.length?`<table><tr><th>Fecha</th><th>Proyecto</th><th>Cliente</th><th>RUT</th><th>kW</th><th>Resultado</th><th>Estado</th></tr>${a.map(x=>`<tr><td>${x.fecha}</td><td>${x.nombre}</td><td>${x.cliente}</td><td>${x.rut}</td><td>${Number(x.potencia||0).toFixed(2)}</td><td>${x.resultado}</td><td>${x.estado}</td></tr>`).join("")}</table>`:"No hay proyectos guardados.";
  },
  exportar(){
    const data=JSON.stringify(this.arr(),null,2);
    const blob=new Blob([data],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="historial_giae_v57.json";a.click();URL.revokeObjectURL(a.href);
  },
  limpiar(){if(confirm("¿Borrar historial local?")){localStorage.removeItem(this.key);this.render();}}
};


GIAE.estadisticas={
  key:"giae_stats_v58",
  base(){try{return JSON.parse(localStorage.getItem(this.key)||'{"empalmes":0,"informes":0,"visitas":0}')}catch(e){return{empalmes:0,informes:0,visitas:0}}},
  save(x){localStorage.setItem(this.key,JSON.stringify(x));},
  inc(k){const x=this.base();x[k]=(x[k]||0)+1;this.save(x);this.actualizar();},
  actualizar(){
    const stats=this.base();
    const hist=GIAE.historial?.arr?GIAE.historial.arr():[];
    const sug=GIAE.comunidad?.arr?GIAE.comunidad.arr(GIAE.comunidad.keySug):[];
    if(window.estProyectos) estProyectos.textContent=hist.length;
    if(window.estEmpalmes) estEmpalmes.textContent=stats.empalmes||0;
    if(window.estInformes) estInformes.textContent=stats.informes||0;
    if(window.estSugerencias) estSugerencias.textContent=sug.length;
    if(window.estConsultas) estConsultas.textContent=(GIAE.copiloto?GIAE.copiloto.consultas().length:0);
    if(window.estadisticasDetalle){
      estadisticasDetalle.innerHTML=`<table><tr><th>Indicador</th><th>Valor</th></tr><tr><td>Proyectos guardados</td><td>${hist.length}</td></tr><tr><td>Empalmes calculados</td><td>${stats.empalmes||0}</td></tr><tr><td>Informes generados</td><td>${stats.informes||0}</td></tr><tr><td>Sugerencias recibidas</td><td>${sug.length}</td></tr><tr><td>Consultas técnicas</td><td>${GIAE.copiloto?GIAE.copiloto.consultas().length:0}</td></tr><tr><td>Visitas de sesión</td><td>${stats.visitas||0}</td></tr></table>`;
    }
  },
  exportar(){
    const data={fecha:new Date().toLocaleString("es-CL"),stats:this.base(),historial:GIAE.historial?.arr?GIAE.historial.arr():[]};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="estadisticas_giae_v58.json";a.click();URL.revokeObjectURL(a.href);
  }
};


GIAE.ricInteligente={
  data:[],
  async cargar(){try{this.data=await fetch("data/ric.json").then(r=>r.json())}catch(e){this.data=[]}this.renderCards(this.data);},
  normalizar(t){return (t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")},
  buscar(){
    const q=this.normalizar(window.ricQuery?.value||""), cat=window.ricCategoria?.value||"", modo=window.ricModo?.value||"todos";
    let lista=this.data||[];
    if(cat)lista=lista.filter(x=>x.categoria===cat);
    if(q){const palabras=q.split(/\s+/).filter(Boolean);lista=lista.map(x=>{const texto=this.normalizar(`${x.ric} ${x.titulo} ${x.categoria} ${x.resumen} ${x.aplica} ${x.keywords}`);const score=palabras.reduce((a,p)=>a+(texto.includes(p)?1:0),0);return {...x,score};}).filter(x=>modo==="todos"?x.score>0||!q:x.score>0).sort((a,b)=>(b.score||0)-(a.score||0));}
    this.renderCards(lista);this.responder(q,lista);
  },
  responder(q,lista){
    if(!window.ricRespuesta)return;
    if(!q){ricRespuesta.innerHTML="Escribe una consulta para comenzar.";return}
    if(!lista.length){ricRespuesta.innerHTML='<div class="warn">No se encontraron coincidencias. Prueba con: empalme, tablero, tierra, conductor, protección, TE1.</div>';return}
    const top=lista.slice(0,4);
    ricRespuesta.innerHTML=`<div class="ok"><b>RIC aplicables encontrados:</b><br>${top.map(x=>`• <b>${x.ric}</b> — ${x.titulo}`).join("<br>")}</div><div class="warnline"><b>Observación GIAE:</b><br>${this.observacion(q)}</div>`;
  },
  observacion(q){
    if(q.includes("empalme"))return "Revisar factibilidad de distribuidora, potencia contratada/solicitada, medición, tablero general, puesta a tierra y documentación del proyecto.";
    if(q.includes("tierra"))return "Revisar continuidad del conductor de protección, enlaces equipotenciales, barra de tierra y medición de resistencia.";
    if(q.includes("tablero"))return "Revisar protección general, diferenciales, identificación de circuitos, barras de neutro/tierra y capacidad de corriente.";
    if(q.includes("conductor")||q.includes("cable"))return "Revisar sección, método de instalación, caída de tensión, temperatura, canalización y protección asociada.";
    if(q.includes("te1")||q.includes("sec"))return "Preparar memoria, cuadro de carga, unilineal, datos de instalación, antecedentes del instalador y revisión final.";
    return "Resultado preliminar. Validar siempre con RIC/SEC vigente, distribuidora y profesional autorizado.";
  },
  renderCards(lista){if(!window.ricGrid)return;ricGrid.innerHTML=(lista||[]).map(x=>`<div class="ric-card"><div class="ric-badge">${x.ric}</div><h3>${x.titulo}</h3><span class="pill">${x.categoria}</span><p><b>Resumen:</b> ${x.resumen}</p><p><b>Aplica a:</b> ${x.aplica}</p></div>`).join("");}
};


GIAE.copiloto={
  key:"giae_consultas_copiloto_v510",
  consultas(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  guardarConsulta(q,tipo="copiloto"){
    const a=this.consultas();
    a.unshift({fecha:new Date().toLocaleString("es-CL"),consulta:q,tipo});
    localStorage.setItem(this.key,JSON.stringify(a.slice(0,100)));
    if(GIAE.estadisticas)GIAE.estadisticas.actualizar();if(GIAE.centroProyectos)GIAE.centroProyectos.render();if(GIAE.materiales)GIAE.materiales.render();if(GIAE.presupuestos)GIAE.presupuestos.render();if(GIAE.historialTecnico)GIAE.historialTecnico.render();if(GIAE.bibliotecaDoc)GIAE.bibliotecaDoc.render();
  },
  n(v,d=0){let x=Number(v);return isFinite(x)?x:d},
  normalizar(t){return (t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")},
  extraerKW(q){
    const m=q.match(/(\d+(?:[.,]\d+)?)\s*(kw|kilowatt|kilowatts)/i);
    return m?this.n(m[1].replace(",","."),0):0;
  },
  extraerA(q){
    const m=q.match(/(\d+(?:[.,]\d+)?)\s*(a|amp|ampere|amperes)/i);
    return m?this.n(m[1].replace(",","."),0):0;
  },
  sistema(q){
    q=this.normalizar(q);
    if(q.includes("trifa")||q.includes("380")||q.includes("3f")||q.includes("tres fase"))return "trifa";
    return "mono";
  },
  ricRelacionados(q){
    q=this.normalizar(q);
    const r=[];
    if(q.includes("empalme")||q.includes("acometida")||q.includes("medidor"))r.push("RIC 01");
    if(q.includes("tablero")||q.includes("distribucion"))r.push("RIC 02");
    if(q.includes("kw")||q.includes("demanda")||q.includes("alimentador")||q.includes("potencia"))r.push("RIC 03");
    if(q.includes("conductor")||q.includes("cable")||q.includes("canalizacion")||q.includes("ducto"))r.push("RIC 04");
    if(q.includes("proteccion")||q.includes("automatico")||q.includes("diferencial")||q.includes("cortocircuito"))r.push("RIC 05");
    if(q.includes("tierra")||q.includes("malla")||q.includes("equipotencial"))r.push("RIC 06");
    if(q.includes("te1")||q.includes("sec")||q.includes("declaracion"))r.push("RIC 18","RIC 19");
    if(!r.length)r.push("RIC 01","RIC 02","RIC 04","RIC 06");
    return [...new Set(r)];
  },
  checklistSegun(q){
    q=this.normalizar(q);
    let base=["Datos del cliente y dirección","Potencia contratada/solicitada en kW","Cuadro de carga","Cálculo de empalme","Protección general","Conductor y canalización","Puesta a tierra RIC 06","Plano unilineal","Evidencias fotográficas","Revisión final"];
    if(q.includes("te1")||q.includes("sec"))base.push("Antecedentes para declaración SEC","Datos del instalador autorizado","Memoria técnica");
    if(q.includes("colegio")||q.includes("publico")||q.includes("reunion"))base.push("Revisión de recinto de reunión de personas","Alumbrado de emergencia");
    if(q.includes("industria")||q.includes("taller")||q.includes("motor"))base.push("Revisión de fuerza/motores","Coordinación de protecciones");
    return base;
  },
  analizar(q){
    const original=q||"";
    q=this.normalizar(original);
    const kw=this.extraerKW(original);
    const amp=this.extraerA(original);
    const sis=this.sistema(q);
    const fp=1;
    let corriente=0;
    if(kw>0)corriente=GIAE.calc.iKW(kw,sis,fp);
    else if(amp>0)corriente=amp;
    const proteccion=corriente?GIAE.calc.prot(corriente):"Revisar";
    const conductor=corriente?GIAE.calc.cond(corriente):"Revisar";
    const ducto=corriente?GIAE.calc.ducto(corriente):"Revisar";
    let empalme="Revisar proyecto";
    if(kw>0){
      try{empalme=GIAE.empalme.sel(GIAE.state.proyecto.compania||"CGE",sis,kw).codigo||"Revisar distribuidora"}catch(e){empalme=sis==="trifa"?"BT Trifásico preliminar":"BT Monofásico preliminar"}
    }else if(q.includes("tierra")) empalme="No aplica empalme directo";
    const ric=this.ricRelacionados(q);
    const checklist=this.checklistSegun(q);
    const alertas=[];
    if(sis==="mono"&&kw>8)alertas.push("Potencia monofásica alta: evaluar factibilidad o sistema trifásico.");
    if(kw>27&&sis==="trifa")alertas.push("Potencia alta: evaluar medición indirecta y factibilidad formal.");
    if(!kw&&!amp&&!q.includes("tierra")&&!q.includes("tablero")&&!q.includes("te1"))alertas.push("No se detectó potencia o corriente. Agrega kW o amperes para mejorar la recomendación.");
    return {original,q,kw,amp,sis,corriente,proteccion,conductor,ducto,empalme,ric,checklist,alertas};
  },
  html(r){
    const sis=r.sis==="trifa"?"Trifásico 380 V":"Monofásico 220 V";
    const datos=r.kw?`<tr><td>Potencia detectada</td><td>${r.kw.toFixed(2)} kW</td></tr>`:r.amp?`<tr><td>Corriente detectada</td><td>${r.amp.toFixed(2)} A</td></tr>`:"";
    return `<div class="copiloto-card">
      <h3>🤖 Análisis preliminar GIAE</h3>
      <table>
        ${datos}
        <tr><td>Sistema sugerido</td><td>${sis}</td></tr>
        <tr><td>Corriente estimada</td><td>${r.corriente?r.corriente.toFixed(2)+" A":"Revisar"}</td></tr>
        <tr><td>Empalme sugerido</td><td>${r.empalme}</td></tr>
        <tr><td>Protección preliminar</td><td>${r.proteccion}${typeof r.proteccion==="number"?" A":""}</td></tr>
        <tr><td>Conductor preliminar</td><td>${r.conductor}${typeof r.conductor==="number"?" mm² Cu":""}</td></tr>
        <tr><td>Canalización preliminar</td><td>${r.ducto}</td></tr>
      </table>
      <div class="ok"><b>RIC relacionados:</b><br>${r.ric.map(x=>"• "+x).join("<br>")}</div>
      <div class="panel checklist-box"><b>Checklist SEC preliminar:</b><br>${r.checklist.map(x=>"☐ "+x).join("<br>")}</div>
      ${r.alertas.length?`<div class="warn"><b>Alertas:</b><br>${r.alertas.map(x=>"⚠ "+x).join("<br>")}</div>`:"<div class='ok'>✓ Sin alertas críticas preliminares.</div>"}
      <div class="mini">Resultado orientativo. Validar con normativa RIC/SEC vigente, distribuidora y profesional autorizado.</div>
    </div>`;
  },
  responder(){
    const q=window.aPreg?.value||"";
    if(!q.trim()){alert("Escribe una consulta técnica.");return}
    const r=this.analizar(q);
    this.guardarConsulta(q);
    if(window.resAsis)resAsis.innerHTML=this.html(r);
  },
  responderRapido(){
    const q=window.quickCopiloto?.value||"";
    if(!q.trim()){alert("Escribe una consulta técnica.");return}
    const r=this.analizar(q);
    this.guardarConsulta(q,"rapida");
    if(window.quickCopilotoResp)quickCopilotoResp.innerHTML=this.html(r);
  },
  checklist(){
    const q=window.aPreg?.value||"proyecto electrico";
    const r=this.analizar(q);
    this.guardarConsulta(q,"checklist");
    if(window.resAsis)resAsis.innerHTML=`<div class="ok"><b>Checklist SEC preliminar</b><br>${r.checklist.map(x=>"☐ "+x).join("<br>")}</div>`;
  }
};


GIAE.informeAuto={
  key:"giae_informes_auto_v511",
  ultimo:"",
  informes(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  guardarHistorial(){
    if(!this.ultimo){alert("Primero genera un informe automático.");return}
    const p=GIAE.state.proyecto||{};
    const a=this.informes();
    a.unshift({fecha:new Date().toLocaleString("es-CL"),proyecto:p.nombre||"Proyecto sin nombre",cliente:p.cliente||"",html:this.ultimo});
    localStorage.setItem(this.key,JSON.stringify(a.slice(0,30)));
    alert("Informe guardado en historial local.");
    if(GIAE.estadisticas)GIAE.estadisticas.actualizar();if(GIAE.centroProyectos)GIAE.centroProyectos.render();if(GIAE.materiales)GIAE.materiales.render();if(GIAE.presupuestos)GIAE.presupuestos.render();if(GIAE.historialTecnico)GIAE.historialTecnico.render();if(GIAE.bibliotecaDoc)GIAE.bibliotecaDoc.render();
  },
  fecha(){return new Date().toLocaleDateString("es-CL")},
  proyectoTabla(){
    const p=GIAE.state.proyecto||{};
    return `<table>
      <tr><td>Proyecto</td><td>${p.nombre||"No informado"}</td></tr>
      <tr><td>Cliente</td><td>${p.cliente||"No informado"}</td></tr>
      <tr><td>RUT</td><td>${p.rut||"No informado"}</td></tr>
      <tr><td>Dirección</td><td>${p.direccion||"No informado"}</td></tr>
      <tr><td>Comuna</td><td>${p.comuna||"No informado"}</td></tr>
      <tr><td>Compañía</td><td>${p.compania||"No informado"}</td></tr>
      <tr><td>Sistema</td><td>${p.sistema==="trifa"?"Trifásico 380 V":"Monofásico 220 V"}</td></tr>
      <tr><td>Potencia solicitada</td><td>${p.kw||"No informado"} kW</td></tr>
      <tr><td>Fecha</td><td>${this.fecha()}</td></tr>
    </table>`;
  },
  cargasTabla(){
    const c=GIAE.state.cargas||[];
    if(!c.length)return "<p>No se registran cargas en el cuadro de carga.</p>";
    return `<table><tr><th>Circuito</th><th>Tipo</th><th>Sistema</th><th>Fase</th><th>Potencia W</th><th>Corriente A</th></tr>${c.map(x=>`<tr><td>${x.nombre}</td><td>${x.tipo}</td><td>${x.sistema}</td><td>${x.fase}</td><td>${x.w}</td><td>${Number(x.I||0).toFixed(2)}</td></tr>`).join("")}</table>`;
  },
  empalmeTabla(){
    const e=GIAE.state.resultados?.empalme;
    if(!e)return "<p>No se registra cálculo de empalme. Ejecuta Motor Empalme para completar esta sección.</p>";
    return `<table>
      <tr><td>Potencia</td><td>${Number(e.kw||0).toFixed(2)} kW</td></tr>
      <tr><td>Equivalente</td><td>${Number(e.w||0).toFixed(0)} W</td></tr>
      <tr><td>Sistema</td><td>${e.sistema==="trifa"?"Trifásico":"Monofásico"}</td></tr>
      <tr><td>Corriente estimada</td><td>${Number(e.corriente||0).toFixed(2)} A</td></tr>
      <tr><td>Empalme recomendado</td><td>${e.empalme?.codigo||"Revisar"}</td></tr>
      <tr><td>Protección sugerida</td><td>${e.empalme?.proteccion||e.proteccion||"Revisar"}</td></tr>
      <tr><td>Conductor preliminar</td><td>${e.empalme?.conductor||e.conductor||"Revisar"}</td></tr>
      <tr><td>Canalización preliminar</td><td>${e.ducto||"Revisar"}</td></tr>
    </table>`;
  },
  normativa(){
    const e=GIAE.state.resultados?.empalme;
    const lista=["RIC 01 Empalmes","RIC 02 Tableros eléctricos","RIC 04 Conductores y canalizaciones","RIC 05 Protecciones eléctricas","RIC 06 Puesta a tierra","RIC 18 Documentación de proyectos","RIC 19 Puesta en servicio y declaración"];
    if(e?.sistema==="trifa")lista.push("Revisión de equilibrio de fases y factibilidad de distribuidora");
    return `<ul>${lista.map(x=>`<li>${x}</li>`).join("")}</ul>`;
  },
  observaciones(){
    const e=GIAE.state.resultados?.empalme;
    const obs=[
      "El presente informe es preliminar y se genera como apoyo técnico.",
      "Los cálculos deben validarse con condiciones reales de instalación.",
      "La selección final de empalme debe confirmarse con la empresa distribuidora.",
      "La documentación final debe ser revisada por profesional autorizado."
    ];
    if(e?.alertas?.length) e.alertas.forEach(x=>obs.push(x));
    if(e?.observaciones?.length) e.observaciones.forEach(x=>obs.push(x));
    return `<ul>${obs.map(x=>`<li>${x}</li>`).join("")}</ul>`;
  },
  generar(){
    const p=GIAE.state.proyecto||{};
    const html=`<div class="report informe-auto">
      <div class="portada-giae">
        <img src="assets/giae-logo.svg" alt="GIAE Chile" class="report-logo">
        <h1>GIAE Chile</h1>
        <h2>Gestor Inteligente de Análisis para Empalmes</h2>
        <h3>Informe Técnico Preliminar</h3>
        <p><b>Proyecto:</b> ${p.nombre||"No informado"}</p>
        <p><b>Fecha:</b> ${this.fecha()}</p>
        <p><b>Versión:</b> v6.2 Generador Automático de Informes</p>
      </div>
      <hr>
      <h2>1. Descripción del Proyecto</h2>
      ${this.proyectoTabla()}
      <h2>2. Cuadro de Carga</h2>
      ${this.cargasTabla()}
      <h2>3. Análisis de Empalme</h2>
      ${this.empalmeTabla()}
      <h2>4. Conductores, Canalizaciones y Protecciones</h2>
      <p>Esta sección se alimenta de los módulos de cálculo disponibles en GIAE. Cuando no existan cálculos específicos, se recomienda completar los módulos correspondientes antes de emitir una versión final.</p>
      <h2>5. Normativa Relacionada</h2>
      ${this.normativa()}
      <h2>6. Observaciones Técnicas</h2>
      ${this.observaciones()}
      <h2>7. Conclusión</h2>
      <p>Resultado preliminar generado por GIAE Chile. Toda información debe ser validada con normativa vigente, distribuidora correspondiente y profesional autorizado.</p>
      <div class="legal-note"><b>Aviso legal:</b> GIAE Chile es una herramienta independiente de apoyo técnico. No está afiliada, patrocinada ni certificada por la Superintendencia de Electricidad y Combustibles.</div>
      <p><b>Desarrollado por:</b> Julio Vera Concha</p>
    </div>`;
    this.ultimo=html;
    if(window.vistaInformeAuto)vistaInformeAuto.innerHTML=html;
    if(window.vistaInforme)vistaInforme.innerHTML=html;
    if(GIAE.estadisticas)GIAE.estadisticas.inc("informes");
  },
  descargar(){
    if(!this.ultimo)this.generar();
    const full=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Informe GIAE v6.2</title><style>body{font-family:Arial;padding:30px;color:#111}table{width:100%;border-collapse:collapse;margin:12px 0}td,th{border:1px solid #ccc;padding:8px;text-align:left}.report-logo{width:90px}.portada-giae{text-align:center}.legal-note{background:#fff3cd;padding:12px;border-radius:8px}</style></head><body>${this.ultimo}</body></html>`;
    const blob=new Blob([full],{type:"text/html;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="informe_giae_v5_11.html";a.click();URL.revokeObjectURL(a.href);
  },
  imprimir(){if(!this.ultimo)this.generar();setTimeout(()=>window.print(),200)}
};


GIAE.centroProyectos={
  key:"giae_centro_proyectos_v512",
  arr(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  save(a){localStorage.setItem(this.key,JSON.stringify(a));this.render()},
  snapshot(){
    return {
      version:"v6.2",
      fecha:new Date().toLocaleString("es-CL"),
      proyecto:GIAE.state.proyecto||{},
      cargas:GIAE.state.cargas||[],
      evidencias:GIAE.state.evidencias||[],
      resultados:GIAE.state.resultados||{}
    };
  },
  nombre(item){
    return item?.proyecto?.nombre || "Proyecto sin nombre";
  },
  guardar(){
    const item=this.snapshot();
    const a=this.arr();
    a.unshift(item);
    this.save(a.slice(0,80));
    alert("Proyecto guardado en Centro de Proyectos.");
  },
  cargar(i){
    const item=this.arr()[i];
    if(!item){alert("Proyecto no encontrado.");return}
    GIAE.state.proyecto=item.proyecto||{};
    GIAE.state.cargas=item.cargas||[];
    GIAE.state.evidencias=item.evidencias||[];
    GIAE.state.resultados=item.resultados||{};
    GIAE.storage.save();
    GIAE.app.init();
    alert("Proyecto cargado correctamente.");
  },
  duplicar(i){
    const a=this.arr();
    const item=JSON.parse(JSON.stringify(a[i]||{}));
    if(!item.proyecto)item.proyecto={};
    item.fecha=new Date().toLocaleString("es-CL");
    item.proyecto.nombre=(item.proyecto.nombre||"Proyecto")+" - copia";
    a.unshift(item);
    this.save(a);
  },
  eliminar(i){
    if(!confirm("¿Eliminar este proyecto del Centro de Proyectos?"))return;
    const a=this.arr();a.splice(i,1);this.save(a);
  },
  nuevo(){
    if(!confirm("¿Crear proyecto limpio? Se borrarán datos actuales en pantalla, no los proyectos guardados."))return;
    GIAE.state.proyecto={};
    GIAE.state.cargas=[];
    GIAE.state.evidencias=[];
    GIAE.state.resultados={};
    GIAE.storage.save();
    location.reload();
  },
  limpiar(){
    if(confirm("¿Borrar todos los proyectos guardados localmente?")){localStorage.removeItem(this.key);this.render();}
  },
  exportar(){
    const data=JSON.stringify(this.snapshot(),null,2);
    const blob=new Blob([data],{type:"application/json;charset=utf-8"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="proyecto_giae_v5_12.json";
    a.click();
    URL.revokeObjectURL(a.href);
  },
  importar(ev){
    const file=ev.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const item=JSON.parse(reader.result);
        const a=this.arr();a.unshift(item);this.save(a);
        alert("Proyecto importado al Centro de Proyectos.");
      }catch(e){alert("Archivo JSON inválido.");}
    };
    reader.readAsText(file);
  },
  render(){
    if(!window.listaCentroProyectos)return;
    const q=(window.buscarProyectoCentro?.value||"").toLowerCase();
    let a=this.arr();
    if(q)a=a.filter(x=>`${x.fecha} ${x.proyecto?.nombre||""} ${x.proyecto?.cliente||""} ${x.proyecto?.rut||""}`.toLowerCase().includes(q));
    if(!a.length){listaCentroProyectos.innerHTML="No hay proyectos guardados.";return}
    listaCentroProyectos.innerHTML=`<table><tr><th>Fecha</th><th>Proyecto</th><th>Cliente</th><th>RUT</th><th>kW</th><th>Acciones</th></tr>${a.map((x,i)=>`<tr><td>${x.fecha||""}</td><td>${x.proyecto?.nombre||"Sin nombre"}</td><td>${x.proyecto?.cliente||""}</td><td>${x.proyecto?.rut||""}</td><td>${x.proyecto?.kw||""}</td><td><button class="btn mini-btn" onclick="GIAE.centroProyectos.cargar(${i})">Abrir</button> <button class="btn mini-btn" onclick="GIAE.centroProyectos.duplicar(${i})">Duplicar</button> <button class="btn mini-btn danger" onclick="GIAE.centroProyectos.eliminar(${i})">Eliminar</button></td></tr>`).join("")}</table>`;
  }
};


GIAE.informeAuto.exportarWord=function(){
  if(!this.ultimo)this.generar();
  const content=`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Informe GIAE Word</title></head><body>${this.ultimo}</body></html>`;
  const blob=new Blob([content],{type:"application/msword;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="informe_giae_v5_12.doc";a.click();URL.revokeObjectURL(a.href);
};
GIAE.informeAuto.exportarExcel=function(){
  const p=GIAE.state.proyecto||{}, e=GIAE.state.resultados?.empalme||{}, cargas=GIAE.state.cargas||[];
  let html="<table><tr><th colspan='2'>Proyecto</th></tr>";
  html+=`<tr><td>Nombre</td><td>${p.nombre||""}</td></tr><tr><td>Cliente</td><td>${p.cliente||""}</td></tr><tr><td>RUT</td><td>${p.rut||""}</td></tr><tr><td>Potencia kW</td><td>${p.kw||e.kw||""}</td></tr>`;
  html+="<tr><th colspan='6'>Cuadro de Carga</th></tr><tr><th>Circuito</th><th>Tipo</th><th>Sistema</th><th>Fase</th><th>W</th><th>Corriente A</th></tr>";
  html+=cargas.map(x=>`<tr><td>${x.nombre||""}</td><td>${x.tipo||""}</td><td>${x.sistema||""}</td><td>${x.fase||""}</td><td>${x.w||""}</td><td>${Number(x.I||0).toFixed(2)}</td></tr>`).join("");
  html+=`<tr><th colspan='2'>Empalme</th></tr><tr><td>Empalme recomendado</td><td>${e.empalme?.codigo||""}</td></tr><tr><td>Corriente</td><td>${e.corriente||""}</td></tr><tr><td>Protección</td><td>${e.proteccion||e.empalme?.proteccion||""}</td></tr></table>`;
  const content=`<html><head><meta charset='utf-8'></head><body>${html}</body></html>`;
  const blob=new Blob([content],{type:"application/vnd.ms-excel;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="datos_giae_v5_12.xls";a.click();URL.revokeObjectURL(a.href);
};


GIAE.utilDescarga={
  bajar(nombre, contenido, tipo="text/html;charset=utf-8"){
    const blob=new Blob([contenido],{type:tipo});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=nombre;a.click();URL.revokeObjectURL(a.href);
  }
};

GIAE.plantillasDist={
  ultimo:"",
  generar(){
    const p=GIAE.state.proyecto||{}, empresa=distEmpresa.value, tramite=distTramite.value, obs=distObs.value;
    const requisitos=["Datos del titular/cliente","Dirección del proyecto","Potencia solicitada en kW","Sistema monofásico/trifásico","Cuadro de carga","Plano unilineal","Fotografías/evidencias","Puesta a tierra","Factibilidad según distribuidora"];
    this.ultimo=`<div class="report"><h1>Plantilla ${empresa}</h1><h2>${tramite}</h2><table><tr><td>Proyecto</td><td>${p.nombre||""}</td></tr><tr><td>Cliente</td><td>${p.cliente||""}</td></tr><tr><td>RUT</td><td>${p.rut||""}</td></tr><tr><td>Comuna</td><td>${p.comuna||""}</td></tr><tr><td>Potencia</td><td>${p.kw||""} kW</td></tr></table><h3>Checklist preliminar</h3><ul>${requisitos.map(x=>`<li>${x}</li>`).join("")}</ul><h3>Observaciones</h3><p>${obs||"Sin observaciones."}</p><p class="mini">Validar siempre con requisitos actualizados de la distribuidora.</p></div>`;
    vistaPlantillaDist.innerHTML=this.ultimo;
  },
  descargar(){if(!this.ultimo)this.generar();GIAE.utilDescarga.bajar("plantilla_distribuidora_giae.html",this.ultimo)}
};

GIAE.materiales={
  key:"giae_materiales_v60",
  arr(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  save(a){localStorage.setItem(this.key,JSON.stringify(a));this.render()},
  agregar(){
    const item={nombre:matNombre.value,categoria:matCat.value,unidad:matUnidad.value,precio:Number(matPrecio.value||0)};
    if(!item.nombre){alert("Ingresa nombre de material.");return}
    const a=this.arr();a.unshift(item);this.save(a);matNombre.value="";matPrecio.value=0;
  },
  cargarBase(){
    const base=[
      ["Cable Cu 2,5 mm²","Conductores","m",850],["Cable Cu 6 mm²","Conductores","m",1900],["Cable Cu 10 mm²","Conductores","m",3200],
      ["Automático 1x16A","Protecciones","unidad",4500],["Automático 3x40A","Protecciones","unidad",18000],["Diferencial 2x25A 30mA","Protecciones","unidad",22000],
      ["Ducto PVC 25 mm","Canalizaciones","m",900],["Tablero 12 módulos","Tableros","unidad",16000],["Barra tierra cobre","Puesta a tierra","unidad",12000]
    ].map(x=>({nombre:x[0],categoria:x[1],unidad:x[2],precio:x[3]}));
    this.save([...base,...this.arr()]);
  },
  exportar(){GIAE.utilDescarga.bajar("materiales_giae_v60.json",JSON.stringify(this.arr(),null,2),"application/json;charset=utf-8")},
  render(){
    if(!window.listaMateriales)return;
    const a=this.arr();
    listaMateriales.innerHTML=a.length?`<table><tr><th>Material</th><th>Categoría</th><th>Unidad</th><th>Precio</th></tr>${a.map(x=>`<tr><td>${x.nombre}</td><td>${x.categoria}</td><td>${x.unidad}</td><td>$${Number(x.precio||0).toLocaleString("es-CL")}</td></tr>`).join("")}</table>`:"Sin materiales.";
  }
};

GIAE.presupuestos={
  key:"giae_presupuesto_v60",
  arr(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  save(a){localStorage.setItem(this.key,JSON.stringify(a));this.render()},
  agregar(){
    const item={item:preItem.value,cantidad:Number(preCant.value||0),unidad:preUnidad.value,precio:Number(prePrecio.value||0)};
    if(!item.item){alert("Ingresa ítem.");return}
    const a=this.arr();a.push(item);this.save(a);preItem.value="";preCant.value=1;prePrecio.value=0;
  },
  sugerirDesdeProyecto(){
    const e=GIAE.state.resultados?.empalme;
    const sug=[
      {item:"Tablero general",cantidad:1,unidad:"unidad",precio:35000},
      {item:`Conductor preliminar ${e?.conductor||"según cálculo"} mm²`,cantidad:30,unidad:"m",precio:2500},
      {item:`Protección ${e?.proteccion||"según cálculo"} A`,cantidad:1,unidad:"unidad",precio:18000},
      {item:"Canalización PVC/EMT",cantidad:20,unidad:"m",precio:1500}
    ];
    this.save([...this.arr(),...sug]);
  },
  total(){return this.arr().reduce((s,x)=>s+(Number(x.cantidad||0)*Number(x.precio||0)),0)},
  render(){
    if(!window.vistaPresupuesto)return;
    const a=this.arr();
    vistaPresupuesto.innerHTML=a.length?`<table><tr><th>Ítem</th><th>Cantidad</th><th>Unidad</th><th>Precio</th><th>Total</th></tr>${a.map(x=>`<tr><td>${x.item}</td><td>${x.cantidad}</td><td>${x.unidad}</td><td>$${Number(x.precio).toLocaleString("es-CL")}</td><td>$${(x.cantidad*x.precio).toLocaleString("es-CL")}</td></tr>`).join("")}<tr><th colspan="4">Total</th><th>$${this.total().toLocaleString("es-CL")}</th></tr></table>`:"Sin presupuesto.";
  },
  exportarExcel(){
    const html=`<html><body>${vistaPresupuesto.innerHTML}</body></html>`;
    GIAE.utilDescarga.bajar("presupuesto_giae_v60.xls",html,"application/vnd.ms-excel;charset=utf-8");
  },
  descargarHTML(){GIAE.utilDescarga.bajar("presupuesto_giae_v60.html",vistaPresupuesto.innerHTML)},
  limpiar(){localStorage.removeItem(this.key);this.render()}
};

GIAE.historialTecnico={
  key:"giae_historial_tecnico_v60",
  arr(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  save(a){localStorage.setItem(this.key,JSON.stringify(a));this.render()},
  agregar(){const item={fecha:new Date().toLocaleString("es-CL"),tipo:htTipo.value,responsable:htResp.value,detalle:htDetalle.value};if(!item.detalle){alert("Ingresa detalle.");return}const a=this.arr();a.unshift(item);this.save(a);htDetalle.value="";},
  exportar(){GIAE.utilDescarga.bajar("historial_tecnico_giae_v60.json",JSON.stringify(this.arr(),null,2),"application/json;charset=utf-8")},
  limpiar(){if(confirm("¿Limpiar historial técnico?")){localStorage.removeItem(this.key);this.render()}},
  render(){if(!window.listaHistorialTecnico)return;const a=this.arr();listaHistorialTecnico.innerHTML=a.length?`<table><tr><th>Fecha</th><th>Tipo</th><th>Responsable</th><th>Detalle</th></tr>${a.map(x=>`<tr><td>${x.fecha}</td><td>${x.tipo}</td><td>${x.responsable}</td><td>${x.detalle}</td></tr>`).join("")}</table>`:"Sin registros."}
};

GIAE.comparadorNormativo={
  buscar(t){t=(t||"").toLowerCase();let r=[];if(t.includes("empalme"))r.push("RIC 01");if(t.includes("tablero"))r.push("RIC 02");if(t.includes("conductor")||t.includes("canal"))r.push("RIC 04");if(t.includes("prote"))r.push("RIC 05");if(t.includes("tierra"))r.push("RIC 06");if(t.includes("te1")||t.includes("document"))r.push("RIC 18","RIC 19");return r.length?r:["RIC 01","RIC 04","RIC 06"]},
  comparar(){const a=normA.value,b=normB.value;const ra=this.buscar(a),rb=this.buscar(b);vistaComparador.innerHTML=`<table><tr><th>Tema</th><th>Normativa relacionada</th></tr><tr><td>${a}</td><td>${ra.join(", ")}</td></tr><tr><td>${b}</td><td>${rb.join(", ")}</td></tr></table><div class="warn">Comparación preliminar. Validar con normativa vigente.</div>`}
};

GIAE.bibliotecaDoc={
  key:"giae_biblioteca_doc_v60",
  arr(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  save(a){localStorage.setItem(this.key,JSON.stringify(a));this.render()},
  agregar(){const item={fecha:new Date().toLocaleString("es-CL"),nombre:docNombre.value,tipo:docTipo.value,desc:docDesc.value};if(!item.nombre){alert("Ingresa nombre del documento.");return}const a=this.arr();a.unshift(item);this.save(a);docNombre.value="";docDesc.value="";},
  exportar(){GIAE.utilDescarga.bajar("biblioteca_documental_giae_v60.json",JSON.stringify(this.arr(),null,2),"application/json;charset=utf-8")},
  limpiar(){if(confirm("¿Limpiar biblioteca documental?")){localStorage.removeItem(this.key);this.render()}},
  render(){if(!window.listaBibliotecaDoc)return;const a=this.arr();listaBibliotecaDoc.innerHTML=a.length?`<table><tr><th>Fecha</th><th>Nombre</th><th>Tipo</th><th>Descripción</th></tr>${a.map(x=>`<tr><td>${x.fecha}</td><td>${x.nombre}</td><td>${x.tipo}</td><td>${x.desc}</td></tr>`).join("")}</table>`:"Sin documentos."}
};

GIAE.app={init(){document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.getElementById(b.dataset.view).classList.add("active")});GIAE.demo.revisar();GIAE.storage.load();GIAE.proyecto.cargar();GIAE.rut.instalar();GIAE.cuadro.render();GIAE.evidencias.render();GIAE.comunidad.render();GIAE.bibliotecaSEC.render();GIAE.historial.render();GIAE.estadisticas.actualizar();if(GIAE.centroProyectos)GIAE.centroProyectos.render();if(GIAE.materiales)GIAE.materiales.render();if(GIAE.presupuestos)GIAE.presupuestos.render();if(GIAE.historialTecnico)GIAE.historialTecnico.render();if(GIAE.bibliotecaDoc)GIAE.bibliotecaDoc.render();if(GIAE.ricInteligente)GIAE.ricInteligente.buscar();if(window.eKw)eKw.addEventListener('input',()=>{eW.value=(GIAE.calc.n(eKw.value)*1000).toFixed(0)});if(!sessionStorage.getItem('giae_visit_counted_v58')){sessionStorage.setItem('giae_visit_counted_v58','1');if(GIAE.estadisticas)GIAE.estadisticas.inc('visitas');}GIAE.demo.aplicarModo();this.stats()},stats(){if(window.stCargas)stCargas.textContent=GIAE.state.cargas.length}};
window.addEventListener("DOMContentLoaded",async()=>{try{GIAE.data.empalmes=await fetch("data/empalmes.json").then(r=>r.json())}catch(e){GIAE.data.empalmes={CGE:[],COELCHA:[],COPELEC:[]}}if(GIAE.ricInteligente)await GIAE.ricInteligente.cargar();GIAE.app.init()});



/* v6.2 Corrección de Publicación - módulos profesionales forzados */
GIAE.utilDescarga=GIAE.utilDescarga||{
  bajar(nombre, contenido, tipo="text/html;charset=utf-8"){
    const blob=new Blob([contenido],{type:tipo});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=nombre;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }
};

GIAE.plantillasDist={
  ultimo:"",
  generar(){
    const p=GIAE.state.proyecto||{};
    const empresa=window.distEmpresa?.value||"CGE";
    const tramite=window.distTramite?.value||"Solicitud de factibilidad";
    const obs=window.distObs?.value||"Sin observaciones.";
    this.ultimo=`<div class="report"><h1>Plantilla Distribuidora ${empresa}</h1><h2>${tramite}</h2><table><tr><td>Proyecto</td><td>${p.nombre||""}</td></tr><tr><td>Cliente</td><td>${p.cliente||""}</td></tr><tr><td>RUT</td><td>${p.rut||""}</td></tr><tr><td>Potencia</td><td>${p.kw||""} kW</td></tr></table><h3>Checklist</h3><ul><li>Datos del cliente</li><li>Dirección</li><li>Potencia solicitada</li><li>Cuadro de carga</li><li>Unilineal</li><li>Fotografías</li><li>Puesta a tierra</li></ul><p>${obs}</p></div>`;
    if(window.vistaPlantillaDist)vistaPlantillaDist.innerHTML=this.ultimo;
  },
  descargar(){if(!this.ultimo)this.generar();GIAE.utilDescarga.bajar("plantilla_distribuidora_giae.html",this.ultimo)}
};

GIAE.materiales={
  key:"giae_materiales_v601",
  arr(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  save(a){localStorage.setItem(this.key,JSON.stringify(a));this.render()},
  agregar(){const item={nombre:matNombre.value,categoria:matCat.value,unidad:matUnidad.value,precio:Number(matPrecio.value||0)};if(!item.nombre){alert("Ingresa material.");return}const a=this.arr();a.unshift(item);this.save(a);matNombre.value="";},
  cargarBase(){const base=[["Cable Cu 2,5 mm²","Conductores","m",850],["Cable Cu 6 mm²","Conductores","m",1900],["Cable Cu 10 mm²","Conductores","m",3200],["Automático 1x16A","Protecciones","unidad",4500],["Automático 3x40A","Protecciones","unidad",18000],["Ducto PVC 25 mm","Canalizaciones","m",900],["Tablero 12 módulos","Tableros","unidad",16000]].map(x=>({nombre:x[0],categoria:x[1],unidad:x[2],precio:x[3]}));this.save([...base,...this.arr()]);},
  exportar(){GIAE.utilDescarga.bajar("materiales_giae_v601.json",JSON.stringify(this.arr(),null,2),"application/json;charset=utf-8")},
  render(){if(!window.listaMateriales)return;const a=this.arr();listaMateriales.innerHTML=a.length?`<table><tr><th>Material</th><th>Categoría</th><th>Unidad</th><th>Precio</th></tr>${a.map(x=>`<tr><td>${x.nombre}</td><td>${x.categoria}</td><td>${x.unidad}</td><td>$${Number(x.precio||0).toLocaleString("es-CL")}</td></tr>`).join("")}</table>`:"Sin materiales."}
};

GIAE.presupuestos={
  key:"giae_presupuesto_v601",
  arr(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  save(a){localStorage.setItem(this.key,JSON.stringify(a));this.render()},
  agregar(){const item={item:preItem.value,cantidad:Number(preCant.value||0),unidad:preUnidad.value,precio:Number(prePrecio.value||0)};if(!item.item){alert("Ingresa ítem.");return}const a=this.arr();a.push(item);this.save(a);preItem.value="";preCant.value=1;prePrecio.value=0;},
  sugerirDesdeProyecto(){const e=GIAE.state.resultados?.empalme||{};const sug=[{item:"Tablero general",cantidad:1,unidad:"unidad",precio:35000},{item:`Conductor preliminar ${e.conductor||""}`,cantidad:30,unidad:"m",precio:2500},{item:`Protección ${e.proteccion||""}`,cantidad:1,unidad:"unidad",precio:18000},{item:"Canalización PVC/EMT",cantidad:20,unidad:"m",precio:1500}];this.save([...this.arr(),...sug]);},
  total(){return this.arr().reduce((s,x)=>s+(x.cantidad*x.precio),0)},
  render(){if(!window.vistaPresupuesto)return;const a=this.arr();vistaPresupuesto.innerHTML=a.length?`<table><tr><th>Ítem</th><th>Cantidad</th><th>Unidad</th><th>Precio</th><th>Total</th></tr>${a.map(x=>`<tr><td>${x.item}</td><td>${x.cantidad}</td><td>${x.unidad}</td><td>$${Number(x.precio).toLocaleString("es-CL")}</td><td>$${(x.cantidad*x.precio).toLocaleString("es-CL")}</td></tr>`).join("")}<tr><th colspan="4">Total</th><th>$${this.total().toLocaleString("es-CL")}</th></tr></table>`:"Sin presupuesto."},
  exportarExcel(){const html=`<html><head><meta charset="utf-8"></head><body>${window.vistaPresupuesto?.innerHTML||""}</body></html>`;GIAE.utilDescarga.bajar("presupuesto_giae_v601.xls",html,"application/vnd.ms-excel;charset=utf-8")},
  descargarHTML(){GIAE.utilDescarga.bajar("presupuesto_giae_v601.html",window.vistaPresupuesto?.innerHTML||"")},
  limpiar(){localStorage.removeItem(this.key);this.render()}
};

GIAE.historialTecnico={
  key:"giae_historial_tecnico_v601",
  arr(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  save(a){localStorage.setItem(this.key,JSON.stringify(a));this.render()},
  agregar(){const item={fecha:new Date().toLocaleString("es-CL"),tipo:htTipo.value,responsable:htResp.value,detalle:htDetalle.value};if(!item.detalle){alert("Ingresa detalle.");return}const a=this.arr();a.unshift(item);this.save(a);htDetalle.value="";},
  exportar(){GIAE.utilDescarga.bajar("historial_tecnico_giae_v601.json",JSON.stringify(this.arr(),null,2),"application/json;charset=utf-8")},
  limpiar(){if(confirm("¿Limpiar historial técnico?")){localStorage.removeItem(this.key);this.render()}},
  render(){if(!window.listaHistorialTecnico)return;const a=this.arr();listaHistorialTecnico.innerHTML=a.length?`<table><tr><th>Fecha</th><th>Tipo</th><th>Responsable</th><th>Detalle</th></tr>${a.map(x=>`<tr><td>${x.fecha}</td><td>${x.tipo}</td><td>${x.responsable}</td><td>${x.detalle}</td></tr>`).join("")}</table>`:"Sin registros."}
};

GIAE.comparadorNormativo={
  buscar(t){t=(t||"").toLowerCase();let r=[];if(t.includes("empalme"))r.push("RIC 01");if(t.includes("tablero"))r.push("RIC 02");if(t.includes("conductor")||t.includes("canal"))r.push("RIC 04");if(t.includes("prote"))r.push("RIC 05");if(t.includes("tierra"))r.push("RIC 06");if(t.includes("te1")||t.includes("document"))r.push("RIC 18","RIC 19");return r.length?r:["RIC 01","RIC 04","RIC 06"]},
  comparar(){const a=normA.value,b=normB.value;const ra=this.buscar(a),rb=this.buscar(b);vistaComparador.innerHTML=`<table><tr><th>Tema</th><th>Normativa relacionada</th></tr><tr><td>${a}</td><td>${ra.join(", ")}</td></tr><tr><td>${b}</td><td>${rb.join(", ")}</td></tr></table><div class="warn">Comparación preliminar. Validar con normativa vigente.</div>`}
};

GIAE.bibliotecaDoc={
  key:"giae_biblioteca_doc_v601",
  arr(){try{return JSON.parse(localStorage.getItem(this.key)||"[]")}catch(e){return[]}},
  save(a){localStorage.setItem(this.key,JSON.stringify(a));this.render()},
  agregar(){const item={fecha:new Date().toLocaleString("es-CL"),nombre:docNombre.value,tipo:docTipo.value,desc:docDesc.value};if(!item.nombre){alert("Ingresa nombre del documento.");return}const a=this.arr();a.unshift(item);this.save(a);docNombre.value="";docDesc.value="";},
  exportar(){GIAE.utilDescarga.bajar("biblioteca_documental_giae_v601.json",JSON.stringify(this.arr(),null,2),"application/json;charset=utf-8")},
  limpiar(){if(confirm("¿Limpiar biblioteca documental?")){localStorage.removeItem(this.key);this.render()}},
  render(){if(!window.listaBibliotecaDoc)return;const a=this.arr();listaBibliotecaDoc.innerHTML=a.length?`<table><tr><th>Fecha</th><th>Nombre</th><th>Tipo</th><th>Descripción</th></tr>${a.map(x=>`<tr><td>${x.fecha}</td><td>${x.nombre}</td><td>${x.tipo}</td><td>${x.desc}</td></tr>`).join("")}</table>`:"Sin documentos."}
};

if(GIAE.informeAuto){
  GIAE.informeAuto.exportarWord=function(){
    if(!this.ultimo)this.generar();
    const content=`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Informe GIAE Word</title></head><body>${this.ultimo}</body></html>`;
    GIAE.utilDescarga.bajar("informe_giae_v601.doc",content,"application/msword;charset=utf-8");
  };
  GIAE.informeAuto.exportarExcel=function(){
    const p=GIAE.state.proyecto||{}, e=GIAE.state.resultados?.empalme||{}, cargas=GIAE.state.cargas||[];
    let html="<table><tr><th colspan='2'>Proyecto</th></tr>";
    html+=`<tr><td>Nombre</td><td>${p.nombre||""}</td></tr><tr><td>Cliente</td><td>${p.cliente||""}</td></tr><tr><td>RUT</td><td>${p.rut||""}</td></tr><tr><td>Potencia kW</td><td>${p.kw||e.kw||""}</td></tr>`;
    html+="<tr><th colspan='6'>Cuadro de Carga</th></tr><tr><th>Circuito</th><th>Tipo</th><th>Sistema</th><th>Fase</th><th>W</th><th>Corriente A</th></tr>";
    html+=cargas.map(x=>`<tr><td>${x.nombre||""}</td><td>${x.tipo||""}</td><td>${x.sistema||""}</td><td>${x.fase||""}</td><td>${x.w||""}</td><td>${Number(x.I||0).toFixed(2)}</td></tr>`).join("");
    html+=`<tr><th colspan='2'>Empalme</th></tr><tr><td>Empalme recomendado</td><td>${e.empalme?.codigo||""}</td></tr><tr><td>Corriente</td><td>${e.corriente||""}</td></tr><tr><td>Protección</td><td>${e.proteccion||e.empalme?.proteccion||""}</td></tr></table>`;
    GIAE.utilDescarga.bajar("datos_giae_v601.xls",`<html><head><meta charset='utf-8'></head><body>${html}</body></html>`,"application/vnd.ms-excel;charset=utf-8");
  };
}

window.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{
  if(GIAE.centroProyectos)GIAE.centroProyectos.render();
  if(GIAE.materiales)GIAE.materiales.render();
  if(GIAE.presupuestos)GIAE.presupuestos.render();
  if(GIAE.historialTecnico)GIAE.historialTecnico.render();
  if(GIAE.bibliotecaDoc)GIAE.bibliotecaDoc.render();
},400));



/* v6.2 Exportación Profesional */
GIAE.exportacionPro={
  ultimo:"",
  nombreSeguro(t){return (t||"giae").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\w\-]+/g,"_").replace(/_+/g,"_").slice(0,60)},
  bajar(nombre, contenido, tipo){
    const blob=new Blob([contenido],{type:tipo});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=nombre;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),600);
  },
  datosProyecto(){
    const p=GIAE.state.proyecto||{};
    return {
      nombre:p.nombre||"Proyecto GIAE",
      cliente:p.cliente||"",
      rut:p.rut||"",
      direccion:p.direccion||"",
      comuna:p.comuna||"",
      compania:p.compania||"",
      sistema:p.sistema==="trifa"?"Trifásico 380 V":"Monofásico 220 V",
      kw:p.kw||""
    };
  },
  generarBase(){
    const p=this.datosProyecto();
    const cargas=GIAE.state.cargas||[];
    const e=GIAE.state.resultados?.empalme||{};
    const fecha=new Date().toLocaleString("es-CL");
    this.ultimo=`<div class="report informe-pro">
      <div class="portada-giae">
        <img src="assets/giae-logo.svg" class="report-logo" alt="GIAE Chile">
        <h1>GIAE Chile</h1>
        <h2>Gestor Inteligente de Análisis para Empalmes</h2>
        <h3>Informe Técnico Profesional</h3>
        <p><b>Versión:</b> v6.2 Exportación Profesional</p>
        <p><b>Fecha:</b> ${fecha}</p>
      </div>

      <h2>1. Datos del Proyecto</h2>
      <table>
        <tr><td>Proyecto</td><td>${p.nombre}</td></tr>
        <tr><td>Cliente</td><td>${p.cliente}</td></tr>
        <tr><td>RUT</td><td>${p.rut}</td></tr>
        <tr><td>Dirección</td><td>${p.direccion}</td></tr>
        <tr><td>Comuna</td><td>${p.comuna}</td></tr>
        <tr><td>Compañía</td><td>${p.compania}</td></tr>
        <tr><td>Sistema</td><td>${p.sistema}</td></tr>
        <tr><td>Potencia</td><td>${p.kw} kW</td></tr>
      </table>

      <h2>2. Cuadro de Carga</h2>
      ${cargas.length?`<table><tr><th>Circuito</th><th>Tipo</th><th>Sistema</th><th>Fase</th><th>W</th><th>Corriente A</th></tr>${cargas.map(x=>`<tr><td>${x.nombre||""}</td><td>${x.tipo||""}</td><td>${x.sistema||""}</td><td>${x.fase||""}</td><td>${x.w||""}</td><td>${Number(x.I||0).toFixed(2)}</td></tr>`).join("")}</table>`:"<p>No hay cargas registradas.</p>"}

      <h2>3. Resultado de Empalme</h2>
      <table>
        <tr><td>Empalme recomendado</td><td>${e.empalme?.codigo||"Pendiente"}</td></tr>
        <tr><td>Corriente estimada</td><td>${e.corriente?Number(e.corriente).toFixed(2)+" A":"Pendiente"}</td></tr>
        <tr><td>Protección</td><td>${e.proteccion||e.empalme?.proteccion||"Pendiente"}</td></tr>
        <tr><td>Conductor</td><td>${e.conductor||e.empalme?.conductor||"Pendiente"}</td></tr>
        <tr><td>Canalización</td><td>${e.ducto||"Pendiente"}</td></tr>
      </table>

      <h2>4. Normativa y Observaciones</h2>
      <ul>
        <li>RIC 01: Empalmes.</li>
        <li>RIC 02: Tableros eléctricos.</li>
        <li>RIC 04: Conductores y canalizaciones.</li>
        <li>RIC 05: Protecciones.</li>
        <li>RIC 06: Puesta a tierra.</li>
        <li>RIC 18 y 19: Documentación y puesta en servicio.</li>
      </ul>

      <h2>5. Conclusión</h2>
      <p>Informe preliminar generado por GIAE Chile. La información debe ser validada con normativa vigente, empresa distribuidora y profesional autorizado.</p>
      <p><b>Desarrollado por:</b> Julio Vera Concha</p>
    </div>`;
    if(window.vistaExportacionPro)vistaExportacionPro.innerHTML=this.ultimo;
    if(window.vistaInforme)vistaInforme.innerHTML=this.ultimo;
    return this.ultimo;
  },
  word(){
    if(!this.ultimo)this.generarBase();
    const p=this.datosProyecto();
    const content=`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Informe GIAE</title><style>body{font-family:Arial}table{width:100%;border-collapse:collapse}td,th{border:1px solid #999;padding:6px}.portada-giae{text-align:center}.report-logo{width:85px}</style></head><body>${this.ultimo}</body></html>`;
    this.bajar(`${this.nombreSeguro(p.nombre)}_Informe_GIAE_v6_1.doc`,content,"application/msword;charset=utf-8");
  },
  excel(){
    const p=this.datosProyecto();
    const cargas=GIAE.state.cargas||[];
    const e=GIAE.state.resultados?.empalme||{};
    let html=`<table><tr><th colspan="2">GIAE Chile v6.2 - Datos del Proyecto</th></tr>
      <tr><td>Proyecto</td><td>${p.nombre}</td></tr><tr><td>Cliente</td><td>${p.cliente}</td></tr><tr><td>RUT</td><td>${p.rut}</td></tr><tr><td>Potencia kW</td><td>${p.kw}</td></tr>
      <tr><th colspan="6">Cuadro de Carga</th></tr><tr><th>Circuito</th><th>Tipo</th><th>Sistema</th><th>Fase</th><th>W</th><th>Corriente A</th></tr>`;
    html+=cargas.map(x=>`<tr><td>${x.nombre||""}</td><td>${x.tipo||""}</td><td>${x.sistema||""}</td><td>${x.fase||""}</td><td>${x.w||""}</td><td>${Number(x.I||0).toFixed(2)}</td></tr>`).join("");
    html+=`<tr><th colspan="2">Empalme</th></tr><tr><td>Empalme recomendado</td><td>${e.empalme?.codigo||""}</td></tr><tr><td>Corriente</td><td>${e.corriente||""}</td></tr><tr><td>Protección</td><td>${e.proteccion||e.empalme?.proteccion||""}</td></tr></table>`;
    this.bajar(`${this.nombreSeguro(p.nombre)}_Datos_GIAE_v6_1.xls`,`<html><head><meta charset="utf-8"></head><body>${html}</body></html>`,"application/vnd.ms-excel;charset=utf-8");
  },
  html(){
    if(!this.ultimo)this.generarBase();
    const p=this.datosProyecto();
    this.bajar(`${this.nombreSeguro(p.nombre)}_Informe_GIAE_v6_1.html`,`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Informe GIAE</title></head><body>${this.ultimo}</body></html>`,"text/html;charset=utf-8");
  },
  pdf(){
    if(!this.ultimo)this.generarBase();
    if(window.vistaExportacionPro)vistaExportacionPro.innerHTML=this.ultimo;
    setTimeout(()=>window.print(),250);
  },
  validar(){
    const tests=[
      ["Centro de Proyectos", !!GIAE.centroProyectos],
      ["Informe Automático", !!GIAE.informeAuto],
      ["Exportación Pro", !!GIAE.exportacionPro],
      ["Word compatible", typeof GIAE.exportacionPro.word==="function"],
      ["Excel compatible", typeof GIAE.exportacionPro.excel==="function"],
      ["PDF navegador", typeof GIAE.exportacionPro.pdf==="function"],
      ["Cuadro de carga", Array.isArray(GIAE.state.cargas)],
      ["Proyecto", !!GIAE.state.proyecto]
    ];
    const html=`<table><tr><th>Módulo</th><th>Estado</th></tr>${tests.map(x=>`<tr><td>${x[0]}</td><td>${x[1]?"✅ OK":"❌ Revisar"}</td></tr>`).join("")}</table>`;
    if(window.vistaValidacionPro)vistaValidacionPro.innerHTML=html;
  }
};

if(GIAE.informeAuto){
  GIAE.informeAuto.exportarWord=()=>GIAE.exportacionPro.word();
  GIAE.informeAuto.exportarExcel=()=>GIAE.exportacionPro.excel();
}



/* v6.2 Mobile Pro */
GIAE.mobile={
  groups:{
    proyectos:[
      ["proyecto","📁 Proyecto"],
      ["centroProyectos","📂 Centro de Proyectos"],
      ["evidencias","📷 Evidencias"],
      ["historial","📁 Historial"]
    ],
    calculos:[
      ["empalme","🧲 Motor Empalme"],
      ["conductores","🔌 Conductores / Icc"],
      ["protecciones","🛡️ Protecciones"],
      ["canalizaciones","🧱 Canalizaciones"]
    ],
    documentos:[
      ["cuadro","📊 Cuadro de Carga"],
      ["sec","📋 Cuadro SEC Pro"],
      ["unilineal","📐 Unilineal"],
      ["informe","📄 Informe"],
      ["exportacionPro","📤 Exportación Pro"],
      ["presupuestos","💰 Presupuestos"]
    ],
    normativa:[
      ["bibliotecaSEC","📚 Biblioteca Normativa"],
      ["ricInteligente","🧠 Motor Normativo"],
      ["comparadorNormativo","⚖️ Comparador Normativo"]
    ],
    herramientas:[
      ["materialesDB","🧰 Materiales"],
      ["historialTecnico","🕘 Historial Técnico"],
      ["bibliotecaDoc","📚 Biblioteca Documental"],
      ["sugerencias","💡 Sugerencias"]
    ],
    sistema:[
      ["panel","🏠 Panel Principal"],
      ["instructivo","📘 Instructivo"],
      ["acerca","ℹ️ Acerca de GIAE"],
      ["config","⚙️ Configuración"]
    ]
  },
  titles:{
    proyectos:"📁 Proyectos",
    calculos:"⚡ Cálculos",
    documentos:"📄 Documentos",
    normativa:"📚 Normativa",
    herramientas:"🧰 Herramientas",
    sistema:"⚙️ Sistema"
  },
  toggleMenu(){document.body.classList.toggle("mobile-menu-open")},
  closeMenu(){document.body.classList.remove("mobile-menu-open")},
  go(view){
    if(GIAE.app&&GIAE.app.show){GIAE.app.show(view)}
    else{
      document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
      const el=document.getElementById(view); if(el)el.classList.add("active");
    }
    this.closeMenu(); this.closeGroup();
    setTimeout(()=>window.scrollTo({top:0,behavior:"smooth"}),80);
  },
  openGroup(name){
    const box=document.getElementById("mobileGroupBox");
    const title=document.getElementById("mobileGroupTitle");
    const links=document.getElementById("mobileGroupLinks");
    if(!box||!links)return;
    title.textContent=this.titles[name]||"Accesos rápidos";
    links.innerHTML=(this.groups[name]||[]).map(x=>`<button onclick="GIAE.mobile.go('${x[0]}')">${x[1]}</button>`).join("");
    box.classList.add("active"); this.closeMenu();
  },
  closeGroup(){
    const box=document.getElementById("mobileGroupBox");
    if(box)box.classList.remove("active");
  }
};

document.addEventListener("click",e=>{
  const btn=e.target.closest(".nav");
  if(btn&&window.innerWidth<=900){
    setTimeout(()=>GIAE.mobile.closeMenu(),60);
    setTimeout(()=>window.scrollTo({top:0,behavior:"smooth"}),120);
  }
});
window.addEventListener("resize",()=>{if(window.innerWidth>900)document.body.classList.remove("mobile-menu-open")});
