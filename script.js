const API_URL = "https://script.google.com/macros/s/AKfycbx0nA8Vboc8ud7U33eN0IOHkFydQ26FjWwsKOsUknOSLuFwcsJzLkil1yTkGzHL8sDx/exec";

const questions = [
  ["Você considera que a escola apresenta diferentes culturas durante as aulas?", ["Sempre","Frequentemente","Às vezes","Raramente","Nunca"]],
  ["Você já estudou na escola conteúdos sobre culturas indígenas?", ["Sim","Não","Não me lembro"]],
  ["Você já estudou conteúdos relacionados à cultura e história africana e afro-brasileira?", ["Sim","Não","Não me lembro"]],
  ["Você considera que os livros e materiais utilizados nas aulas apresentam diferentes culturas?", ["Sempre","Frequentemente","Às vezes","Raramente","Nunca"]],
  ["Você acha que a escola valoriza conhecimentos diferentes daqueles tradicionalmente apresentados nos livros?", ["Sim","Parcialmente","Não","Não sei responder"]],
  ["Nas aulas, os professores costumam apresentar diferentes pontos de vista sobre acontecimentos históricos?", ["Sempre","Frequentemente","Às vezes","Raramente","Nunca"]],
  ["Você considera importante estudar culturas e conhecimentos de diferentes povos?", ["Muito importante","Importante","Pouco importante","Não considero importante"]],
  ["Você já percebeu alguma cultura sendo apresentada de forma estereotipada ou simplificada em materiais escolares?", ["Sim","Não","Não sei identificar"]],
  ["Você gostaria que a escola trabalhasse mais conteúdos relacionados à diversidade cultural?", ["Sim","Talvez","Não"]],
  ["De modo geral, você considera que sua escola valoriza a diversidade cultural?", ["Sim","Parcialmente","Não","Não sei responder"]]
];


// =========================
// CRIAÇÃO DO QUESTIONÁRIO
// =========================

const form = document.getElementById("form");

questions.forEach((q, i) => {

  const div = document.createElement("div");

  div.className = "question";

  div.innerHTML =
    `<h3>${i + 1}. ${q[0]}</h3>` +
    q[1]
      .map(o =>
        `<label class="option">
          <input required type="radio" name="q${i}" value="${o}">
          ${o}
        </label>`
      )
      .join("");

  form.appendChild(div);
});


// =========================
// ENVIO DAS RESPOSTAS
// =========================

document.getElementById("send").addEventListener("click", async () => {

  if (!form.reportValidity()) return;

  const answers = questions.map(
    (_, i) =>
      document.querySelector(`input[name="q${i}"]:checked`).value
  );

  const status = document.getElementById("status");

  status.style.color = "#287a59";
  status.textContent = "Enviando resposta...";

  try {

    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        answers: answers
      })
    });

    form.reset();

    status.textContent =
      "Resposta enviada com sucesso! Obrigado por participar.";

    window.scrollTo({
      top: document.getElementById("questionario").offsetTop - 70,
      behavior: "smooth"
    });

    // Atualiza os resultados depois do envio
    setTimeout(loadResults, 1000);

  } catch (err) {

    status.style.color = "#b14d35";

    status.textContent =
      "Não foi possível enviar agora. Verifique a conexão com a internet.";
  }
});


// =========================
// RESULTADOS DA PESQUISA
// =========================

function loadResults() {

  const status = document.getElementById("resultsStatus");

  if (status) {
    status.textContent = "Carregando resultados...";
  }

  const old = document.getElementById("resultsLoader");

  if (old) {
    old.remove();
  }

  const script = document.createElement("script");

  script.id = "resultsLoader";

  script.src =
    API_URL +
    "?callback=renderResults&_=" +
    Date.now();

  script.onerror = function() {

    if (status) {
      status.textContent =
        "Erro ao carregar os resultados.";
    }

  };

  document.body.appendChild(script);
}


// =========================
// MOSTRAR RESULTADOS
// =========================

function renderResults(data) {

  const status = document.getElementById("resultsStatus");

  const total = document.getElementById("totalResults");

  const updated = document.getElementById("updatedAt");

  const container = document.getElementById("resultsContainer");


  if (!data || !data.ok) {

    if (status) {
      status.textContent =
        "Não foi possível carregar os resultados.";
    }

    return;
  }


  // Total de respostas

  if (total) {
    total.textContent = data.total;
  }


  // Última atualização

  if (updated) {
    updated.textContent = data.updatedAt;
  }


  // Limpa gráficos antigos

  if (container) {

    container.innerHTML = "";


    data.questions.forEach((question, index) => {

      const box = document.createElement("div");

      box.className = "result-question";


      const title = document.createElement("h3");

      title.textContent =
        `${index + 1}. ${question.text}`;

      box.appendChild(title);


      const max = Math.max(
        ...Object.values(question.counts),
        1
      );


      question.options.forEach(option => {

        const count = question.counts[option] || 0;

        const percentage =
          data.total > 0
            ? ((count / data.total) * 100).toFixed(1)
            : "0.0";


        const row = document.createElement("div");

        row.className = "result-row";


        row.innerHTML = `
          <div class="result-label">
            <span>${option}</span>
            <strong>${count} (${percentage}%)</strong>
          </div>

          <div class="bar-background">
            <div
              class="bar"
              style="width:${(count / max) * 100}%">
            </div>
          </div>
        `;


        box.appendChild(row);

      });


      if (container) {
        container.appendChild(box);
      }

    });

  }


  if (status) {
    status.textContent =
      "Resultados atualizados.";
  }
}


// =========================
// BOTÃO ATUALIZAR
// =========================

const refreshButton =
  document.getElementById("refreshResults");

if (refreshButton) {

  refreshButton.addEventListener(
    "click",
    loadResults
  );

}


// =========================
// CARREGAR RESULTADOS AO ABRIR
// =========================

loadResults();
