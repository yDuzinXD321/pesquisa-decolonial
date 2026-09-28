// COLE A URL DO SEU GOOGLE APPS SCRIPT PUBLICADO AQUI:
const API_URL = "https://script.google.com/macros/s/AKfycbx0nA8Vboc8ud7U33eN0IOHkFydQ26FjWwsKOsUknOSLuFwcsJzLkil1yTkGzHL8sDx/exec";

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

document.getElementById("send").addEventListener("click", async ()=>{
  if(!form.reportValidity()) return;

  if(API_URL.includes("COLE_AQUI")){
    document.getElementById("status").style.color="#b14d35";
    document.getElementById("status").textContent="O site ainda precisa ser conectado ao Google Apps Script. Siga o passo a passo fornecido junto do projeto.";
    return;
  }

  const answers=questions.map((_,i)=>document.querySelector(`input[name="q${i}"]:checked`).value);
  const status=document.getElementById("status");
  status.style.color="#287a59";
  status.textContent="Enviando resposta...";

  try{
    await fetch(API_URL,{
      method:"POST",
      mode:"no-cors",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({answers})
    });
    form.reset();
    status.textContent="Resposta enviada com sucesso! Obrigado por participar.";
    window.scrollTo({top:document.getElementById("questionario").offsetTop-70,behavior:"smooth"});
  }catch(err){
    status.style.color="#b14d35";
    status.textContent="Não foi possível enviar agora. Verifique a conexão com a internet.";
  }
});
