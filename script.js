// URL do seu Google Apps Script publicado como aplicativo da Web.
const API_URL = "https://script.google.com/macros/s/AKfycbx0nA8Vboc8ud7U33eN0IOHkFydQ26FjWwsKOsUknOSLuFwcsJzLkil1yTkGzHL8sDx/exec";

// Se quiser, coloque aqui o link da sua planilha Google.
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1fDPP__k0AY3o4IUzDYwcTdTh78E-6yUPx-3POVjcsv0/edit?gid=2037532189#gid=2037532189";

const questions = [
["Você considera que a escola apresenta diferentes culturas durante as aulas?",["Sempre","Frequentemente","Às vezes","Raramente","Nunca"]],
["Você já estudou na escola conteúdos sobre culturas indígenas?",["Sim","Não","Não me lembro"]],
["Você já estudou conteúdos relacionados à cultura e história africana e afro-brasileira?",["Sim","Não","Não me lembro"]],
["Você considera que os livros e materiais utilizados nas aulas apresentam diferentes culturas?",["Sempre","Frequentemente","Às vezes","Raramente","Nunca"]],
["Você acha que a escola valoriza conhecimentos diferentes daqueles tradicionalmente apresentados nos livros?",["Sim","Parcialmente","Não","Não sei responder"]],
["Nas aulas, os professores costumam apresentar diferentes pontos de vista sobre acontecimentos históricos?",["Sempre","Frequentemente","Às vezes","Raramente","Nunca"]],
["Você considera importante estudar culturas e conhecimentos de diferentes povos?",["Muito importante","Importante","Pouco importante","Não considero importante"]],
["Você já percebeu alguma cultura sendo apresentada de forma estereotipada ou simplificada em materiais escolares?",["Sim","Não","Não sei identificar"]],
["Você gostaria que a escola trabalhasse mais conteúdos relacionados à diversidade cultural?",["Sim","Talvez","Não"]],
["De modo geral, você considera que sua escola valoriza a diversidade cultural?",["Sim","Parcialmente","Não","Não sei responder"]]
];

const form = document.getElementById("form");
questions.forEach((q,i)=>{
  const div=document.createElement("div");
  div.className="question";
  div.innerHTML=`<h3>${i+1}. ${q[0]}</h3>`+
    q[1].map(o=>`<label class="option"><input required type="radio" name="q${i}" value="${o}">${o}</label>`).join("");
  form.appendChild(div);
});

function configured(){
  return API_URL && !API_URL.includes("COLE_AQUI");
}

function sendAnswers(){
  if(!form.reportValidity()) return;

  const status=document.getElementById("status");
  if(!configured()){
    status.style.color="#b14d35";
    status.textContent="O site ainda não está conectado ao Google Apps Script.";
    return;
  }

  const answers=questions.map((_,i)=>document.querySelector(`input[name="q${i}"]:checked`).value);
  status.style.color="#287a59";
  status.textContent="Enviando resposta...";

  fetch(API_URL,{
    method:"POST",
    mode:"no-cors",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify({answers})
  }).then(()=>{
    form.reset();
    status.textContent="Resposta enviada com sucesso! Obrigado por participar.";
    setTimeout(loadResults, 800);
  }).catch(()=>{
    status.style.color="#b14d35";
    status.textContent="Não foi possível enviar agora. Verifique a conexão com a internet.";
  });
}

document.getElementById("send").addEventListener("click", sendAnswers);

function escapeHtml(value){
  return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}

function renderResults(data){
  const status=document.getElementById("resultsStatus");
  if(!data || !data.ok){
    status.textContent="Não foi possível carregar os resultados.";
    return;
  }

  document.getElementById("totalResponses").textContent=data.total;
  document.getElementById("lastUpdate").textContent=data.updatedAt || "Agora";
  status.textContent=data.total === 0 ? "Ainda não há respostas coletadas." : "Resultados carregados automaticamente.";

  const charts=document.getElementById("charts");
  charts.innerHTML="";

  data.questions.forEach((q, index)=>{
    const card=document.createElement("article");
    card.className="chartCard";
    const total=Math.max(1, data.total);
    const rows=q.options.map(option=>{
      const count=Number(q.counts[option] || 0);
      const percent=data.total ? (count/data.total)*100 : 0;
      return `<div class="barRow">
        <div class="barLabel"><span>${escapeHtml(option)}</span><b>${count} (${percent.toFixed(1)}%)</b></div>
        <div class="barTrack"><div class="barFill" style="width:${percent}%"></div></div>
      </div>`;
    }).join("");

    card.innerHTML=`<div class="chartNumber">QUESTÃO ${index+1}</div><h3>${escapeHtml(q.text)}</h3>${rows}`;
    charts.appendChild(card);
  });
}

window.renderResults = renderResults;

function loadResults(){
  if(!configured()){
    document.getElementById("resultsStatus").textContent="Conecte o site ao Google Apps Script para visualizar os resultados.";
    return;
  }

  const old=document.getElementById("resultsLoader");
  if(old) old.remove();
  const script=document.createElement("script");
  script.id="resultsLoader";
  script.src=API_URL + (API_URL.includes("?") ? "&" : "?") + "callback=renderResults&_=" + Date.now();
  script.onerror=()=>{
    document.getElementById("resultsStatus").textContent="Não foi possível carregar os gráficos. Verifique se o Apps Script está implantado como 'Qualquer pessoa'.";
  };
  document.body.appendChild(script);
}

if(SHEET_URL && !SHEET_URL.includes("COLE_AQUI")){
  document.getElementById("sheetLink").href=SHEET_URL;
}else{
  document.getElementById("sheetLink").style.display="none";
}

document.getElementById("refresh").addEventListener("click", loadResults);
loadResults();
