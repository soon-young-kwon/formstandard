(function(){
try{
var EX=["바벨 벤치프레스","인클라인 벤치프레스","랫풀다운","바벨 로우","밀리터리 프레스","레터럴 레이즈","바벨 컬","리버스 바벨 컬","스쿰트","데드리프트"];
function $(i){return document.getElementById(i)}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function safeDel(k){try{localStorage.removeItem(k)}catch(e){}}
function load(){try{return JSON.parse(safeGet("ln_diary")||"[]")}catch(e){return[]}}
function saveAll(a){safeSet("ln_diary",JSON.stringify(a))}
function draftKey(){return "ln_draft_"+today()}
function loadDraft(){try{return JSON.parse(safeGet(draftKey())||"[]")}catch(e){return[]}}
function saveDraft(){safeSet(draftKey(),JSON.stringify(draft))}
function clone(x){return JSON.parse(JSON.stringify(x))}
var formPicked=EX[0];
var draft=loadDraft();
var pickSel={};
function go(n){
  var screens=document.querySelectorAll(".screen");
  for(var i=0;i<screens.length;i++)screens[i].classList.remove("on");
  $("s-"+n).classList.add("on");
  var navs=document.querySelectorAll(".nav button");
  for(var j=0;j<navs.length;j++)navs[j].classList.toggle("on",navs[j].getAttribute("data-go")===n);
  if(n==="today"){draft=loadDraft();paintToday();}
  if(n==="cal")paintCal();
  if(n==="ability")paintAb();
}
var navs=document.querySelectorAll(".nav button");
for(var ni=0;ni<navs.length;ni++)(function(b){b.onclick=function(){go(b.getAttribute("data-go"));};})(navs[ni]);
(function(){
  var d=["일","월","화","수","목","금","토"],n=new Date(),s=new Date(n);
  s.setDate(n.getDate()-n.getDay());
  var h="";
  for(var i=0;i<7;i++)h+="<span>"+d[i]+"</span>";
  for(var i=0;i<7;i++){
    var x=new Date(s);x.setDate(s.getDate()+i);
    h+="<button type='button' class='"+(x.toDateString()===n.toDateString()?"on":"")+"'>"+x.getDate()+"</button>";
  }
  if($("weekBar"))$("weekBar").innerHTML=h;
  if($("todayTitle"))$("todayTitle").textContent=(n.getMonth()+1)+"월 "+n.getDate()+"일 "+d[n.getDay()]+"요일";
})();
function daySaved(){var list=load();for(var i=0;i<list.length;i++)if(list[i].date===today())return list[i];return null;}
function lastSets(name){
  var list=load();
  for(var i=0;i<list.length;i++){
    var items=list[i].items||[];
    for(var j=0;j<items.length;j++)if(items[j].name===name&&items[j].sets&&items[j].sets.length)return items[j].sets;
  }
  return [{w:20,r:10,done:false},{w:20,r:10,done:false},{w:20,r:10,done:false}];
}
function noteOf(items){return items.map(function(it){var s=(it.sets||[]).map(function(x){return x.w+"kg × "+x.r+"회";}).join(", ");return it.name+" · "+s;}).join("\n");}
function volOf(it){var v=0;var sets=it.sets||[];for(var i=0;i<sets.length;i++)v+=(Number(sets[i].w)||0)*(Number(sets[i].r)||0);return v;}
function openPick(){
  pickSel={};var box=$("pickList");if(!box)return;box.innerHTML="";
  for(var i=0;i<EX.length;i++){
    var already=false;for(var j=0;j<draft.length;j++)if(draft[j].name===EX[i])already=true;
    var row=document.createElement("label");row.className="pickrow";
    var cb=document.createElement("input");cb.type="checkbox";cb.disabled=already;
    cb.onchange=(function(name){return function(){pickSel[name]=this.checked;};})(EX[i]);
    var tx=document.createElement("span");tx.textContent=EX[i]+(already?" (이미 넣음)":"");
    row.appendChild(cb);row.appendChild(tx);box.appendChild(row);
  }
  $("pickMask").classList.add("on");
}
function addPicked(){
  var n=0;
  for(var i=0;i<EX.length;i++){
    if(!pickSel[EX[i]])continue;
    var exists=false;for(var j=0;j<draft.length;j++)if(draft[j].name===EX[i])exists=true;
    if(exists)continue;
    var prev=lastSets(EX[i]).map(function(s){return {w:s.w,r:s.r,done:false};});
    draft.push({name:EX[i],sets:prev});n++;
  }
  saveDraft();$("pickMask").classList.remove("on");paintToday();
  if($("statusLine"))$("statusLine").textContent=n?n+"개 종목을 넣었습니다.":"고른 종목이 없습니다.";
}
if($("btnPickAdd"))$("btnPickAdd").onclick=addPicked;
if($("btnPickClose"))$("btnPickClose").onclick=function(){$("pickMask").classList.remove("on");};
function bindNum(inp,ei,si,key){
  inp.oninput=function(){
    var v=parseFloat(this.value);if(!isFinite(v))v=0;
    draft[ei].sets[si][key]=key==="r"?parseInt(this.value,10)||0:v;saveDraft();
    var vol=document.getElementById("vol-"+ei);if(vol)vol.textContent="종목 볼륨 "+volOf(draft[ei])+"kg";
  };
}
function paintToday(){
  var saved=daySaved();var home=$("homeBox"),sess=$("sessionBox"),sav=$("savedBox");
  if(!home)return;home.innerHTML="";if(sess)sess.innerHTML="";if(sav)sav.innerHTML="";
  if(!draft.length && !saved){
    if($("statusLine"))$("statusLine").textContent="오늘 세션이 없습니다.";
    home.innerHTML="<div class='card'><p class='lead'>운동을 시작해 볼까요?</p><button class='blue' type='button' id='btnStart'>운동 시작하기</button></div>";
    $("btnStart").onclick=openPick;return;
  }
  if(!draft.length && saved){
    sav.innerHTML="<div class='card'><p class='k'>오늘 저장됨</p><pre style='white-space:pre-wrap'>"+saved.note+"</pre></div><button class='primary' type='button' id='btnEdit'>저장 취소 · 편집</button>";
    $("btnEdit").onclick=unsave;return;
  }
  for(var ei=0;ei<draft.length;ei++){
    var it=draft[ei];var card=document.createElement("div");card.className="card";
    card.innerHTML="<h2>"+(ei+1)+" "+it.name+"</h2>";
    var table=document.createElement("table");table.className="tbl";
    table.innerHTML="<tr><th>세트</th><th>kg</th><th>회</th><th>완료</th></tr>";
    var sets=it.sets||[];
    for(var si=0;si<sets.length;si++){
      var tr=document.createElement("tr");
      var td1=document.createElement("td");td1.textContent=String(si+1);
      var td2=document.createElement("td");var inw=document.createElement("input");inw.inputMode="decimal";inw.value=sets[si].w;bindNum(inw,ei,si,"w");td2.appendChild(inw);
      var td3=document.createElement("td");var inr=document.createElement("input");inr.inputMode="numeric";inr.value=sets[si].r;bindNum(inr,ei,si,"r");td3.appendChild(inr);
      var td4=document.createElement("td");var ck=document.createElement("button");ck.type="button";ck.className="done"+(sets[si].done?" on":"");ck.textContent=sets[si].done?"\u2713":"";
      ck.onclick=(function(e,s,btn){return function(){draft[e].sets[s].done=!draft[e].sets[s].done;btn.className="done"+(draft[e].sets[s].done?" on":"");btn.textContent=draft[e].sets[s].done?"\u2713":"";saveDraft();};})(ei,si,ck);
      td4.appendChild(ck);tr.appendChild(td1);tr.appendChild(td2);tr.appendChild(td3);tr.appendChild(td4);table.appendChild(tr);
    }
    card.appendChild(table);sess.appendChild(card);
  }
  var actions=document.createElement("div");
  actions.innerHTML="<button class='ghost' type='button' id='btnAddEx'>+ 운동 추가</button><button class='blue' type='button' id='btnSave'>오늘 운동 끝 · 저장</button>";
  sess.appendChild(actions);$("btnAddEx").onclick=openPick;$("btnSave").onclick=saveDay;
}
function saveDay(){
  if(!draft.length)return;
  var items=clone(draft);var list=load().filter(function(d){return d.date!==today();});
  list.unshift({date:today(),note:noteOf(items),items:items});saveAll(list.slice(0,60));safeDel(draftKey());draft=[];paintToday();paintAb();
}
function unsave(){
  var saved=daySaved();if(!saved)return;draft=clone(saved.items||[]);saveDraft();
  saveAll(load().filter(function(d){return d.date!==today();}));paintToday();paintAb();
}
function paintPickForm(){
  var box=$("exList");if(!box)return;box.innerHTML="";
  for(var i=0;i<EX.length;i++){
    var b=document.createElement("button");b.type="button";b.className="exbtn"+(EX[i]===formPicked?" on":"");b.textContent=EX[i];
    b.onclick=(function(name){return function(){formPicked=name;if($("formPicked"))$("formPicked").textContent="선택: "+name;paintPickForm();};})(EX[i]);
    box.appendChild(b);
  }
  if($("formPicked"))$("formPicked").textContent="선택: "+formPicked;
}
var cal=new Date();
if($("btnPrev"))$("btnPrev").onclick=function(){cal.setMonth(cal.getMonth()-1);paintCal();};
if($("btnNext"))$("btnNext").onclick=function(){cal.setMonth(cal.getMonth()+1);paintCal();};
function paintCal(){
  if(!$("calTitle"))return;
  var y=cal.getFullYear(),m=cal.getMonth();$("calTitle").textContent=y+"년 "+(m+1)+"월";
  var start=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();var h="";
  for(var i=0;i<start;i++)h+="<span></span>";
  for(var d=1;d<=days;d++){
    var iso=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
    var has=load().some(function(z){return z.date===iso;});
    h+="<button type='button' class='"+(has?"has":"")+"' data-iso='"+iso+"'>"+d+"</button>";
  }
  $("calGrid").innerHTML=h;
}
function paintAb(){
  if(!$("abVol"))return;
  var list=load(),v=0,pr={};
  list.forEach(function(d){(d.items||[]).forEach(function(it){(it.sets||[]).forEach(function(s){v+=(Number(s.w)||0)*(Number(s.r)||0);if((Number(s.w)||0)>(pr[it.name]||0))pr[it.name]=Number(s.w);});});});
  $("abVol").textContent=String(Math.round(v));$("abPr").textContent=String(Object.keys(pr).length);
}
var hasFile=false;
if($("file"))$("file").onchange=function(){hasFile=!!(this.files&&this.files[0]);if($("fileMeta"))$("fileMeta").textContent=hasFile?this.files[0].name:"파일을 고르세요";};
function makePrompt(){return "KEEP 자세 분석 요청\n종목: "+formPicked+"\n규칙: KNOWHOW 읽고 분석. 준비자세 → 장점 → 단점 바로 밑 개선 → 다음 촬영.\n점수·의료 금지. 안 보이는 관절은 단정하지 말 것.\n아래 영상을 이 종목으로 분석해 주세요.";}
if($("btnSendGrok"))$("btnSendGrok").onclick=function(){
  if(!hasFile){if($("fileMeta"))$("fileMeta").textContent="사진이나 영상을 먼저 고르세요.";return;}
  var p=makePrompt();
  if($("sendMeta"))$("sendMeta").textContent="요청 글을 복사했습니다. 이 그록 방에 붙여 넣고 영상도 올리세요.";
  if($("reportBox")){$("reportBox").style.display="block";$("reportBox").innerHTML="<pre style='white-space:pre-wrap'>"+p.replace(/</g,"<")+"</pre>";}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(p);
};
if($("btnSaveReport"))$("btnSaveReport").onclick=function(){
  var txt=(($("reportIn")&&$("reportIn").value)||"").trim();
  if(!txt){if($("sendMeta"))$("sendMeta").textContent="리포트를 붙여 넣으세요.";return;}
  var all=[];try{all=JSON.parse(safeGet("ln_reports")||"[]")}catch(e){all=[];}
  all.unshift({date:today(),exercise:formPicked,text:txt});safeSet("ln_reports",JSON.stringify(all.slice(0,40)));
  if($("sendMeta"))$("sendMeta").textContent="리포트를 저장했습니다.";
};
if($("btnClear"))$("btnClear").onclick=function(){if(confirm("기록을 지울까요?")){safeDel("ln_diary");safeDel(draftKey());draft=[];paintToday();paintAb();}};
paintPickForm();paintToday();paintAb();
}catch(err){document.body.innerHTML="<p style='padding:20px;color:#fff'>화면 오류: "+String(err)+"</p>";}
})();
