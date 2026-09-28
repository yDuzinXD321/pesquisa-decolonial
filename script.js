const API_URL =
  "https://script.google.com/macros/s/AKfycbx0nA8Vboc8ud7U33eN0IOHkFydQ26FJwWsKOsUknOSLuFwcsJzLkil1yTkGzHL8sDx/exec";


const questions = [

  [
    "Você considera que a escola apresenta diferentes culturas durante as aulas?",
    ["Sempre", "Frequentemente", "Às vezes", "Raramente", "Nunca"]
  ],

  [
    "Você já estudou na escola conteúdos sobre culturas indígenas?",
    ["Sim", "Não", "Não me lembro"]
  ],

  [
    "Você já estudou conteúdos relacionados à cultura e história africana e afro-brasileira?",
    ["Sim", "Não", "Não me lembro"]
  ],

  [
    "Você considera que os livros e materiais utilizados nas aulas apresentam diferentes culturas?",
    ["Sempre", "Frequentemente", "Às vezes", "Raramente", "Nunca"]
  ],

  [
    "Você acha que a escola valoriza conhecimentos diferentes daqueles tradicionalmente apresentados nos livros?",
    ["Sim", "Parcialmente", "Não", "Não sei responder"]
  ],

  [
    "Nas aulas, os professores costumam apresentar diferentes pontos de vista sobre acontecimentos históricos?",
    ["Sempre", "Frequentemente", "Às vezes", "Raramente", "Nunca"]
  ],

  [
    "Você considera importante estudar culturas e conhecimentos de diferentes povos?",
    ["Muito importante", "Importante", "Pouco importante", "Não considero importante"]
  ],

  [
    "Você já percebeu alguma cultura sendo apresentada de forma estereotipada ou simplificada em materiais escolares?",
    ["Sim", "Não", "Não sei identificar"]
  ],

  [
    "Você gostaria que a escola trabalhasse mais conteúdos relacionados à diversidade cultural?",
    ["Sim", "Talvez", "Não"]
  ],

  [
    "De modo geral, você considera que sua escola valoriza a diversidade cultural?",
    ["Sim", "Parcialmente", "Não", "Não sei responder"]
  ]

];


// =====================================================
// CRIAR QUESTIONÁRIO
// =====================================================

const form = document.getElementById("form");


questions.forEach((question, index) => {

  const div = document.createElement("div");

  div.className = "question";

  let html = `
    <h3>${index + 1}. ${question[0]}</h3>
  `;

  question[1].forEach(option => {

    html += `
      <label class="option">
        <input
          type="radio"
          name="q${index}"
          value="${option}"
          required
        >
        ${option}
      </label>
    `;

  });

  div.innerHTML = html;

  form.appendChild(div);

});


// =====================================================
// ENVIAR RESPOSTAS
// =====================================================

document.getElementById("send").addEventListener("click", async () => {

  if (!form.reportValidity()) {
    return;
  }

  const answers = [];

  for (let i = 0; i < questions.length; i++) {

    const selected =
      document.querySelector(
        `input[name="q${i}"]:checked`
      );

    if (!selected) {
      return;
    }

    answers.push(selected.value);
  }


  const status =
    document.getElementById("status");

  status.textContent =
    "Enviando resposta...";


  try {

    await fetch(API_URL, {

      method: "POST",

      mode: "no-cors",

      headers: {
        "Content-Type":
          "text/plain;charset=utf-8"
      },

      body: JSON.stringify({
        answers: answers
      })

    });


    form.reset();


    status.textContent =
      "Resposta enviada com sucesso! Obrigado por participar.";


    setTimeout(() => {

      loadResults();

    }, 1500);


  } catch (error) {

    status.textContent =
      "Não foi possível enviar a resposta. Verifique sua internet.";

    console.error(error);

  }

});


// =====================================================
// CARREGAR RESULTADOS
// =====================================================

function loadResults() {

  const status =
    document.getElementById("resultsStatus");

  if (status) {
    status.textContent =
      "Carregando resultados...";
  }


  const oldScript =
    document.getElementById("resultsLoader");

  if (oldScript) {
    oldScript.remove();
  }


  const script =
    document.createElement("script");


  script.id =
    "resultsLoader";


  script.src =
    API_URL +
    "?callback=renderResults&tempo=" +
    Date.now();


  script.onerror = function() {

    if (status) {

      status.textContent =
        "Erro ao carregar os resultados.";

    }

  };


  document.body.appendChild(script);

}


// =====================================================
// RECEBER RESULTADOS
// =====================================================

function renderResults(data) {

  console.log("Resultados recebidos:", data);


  const status =
    document.getElementById("resultsStatus");

  const total =
    document.getElementById("totalResponses");

  const updated =
    document.getElementById("lastUpdate");

  const charts =
    document.getElementById("charts");


  if (!data || data.ok !== true) {

    if (status) {

      status.textContent =
        "Não foi possível carregar os resultados.";

    }

    return;

  }


  // TOTAL

  if (total) {

    total.textContent =
      data.total;

  }


  // DATA

  if (updated) {

    updated.textContent =
      data.updatedAt;

  }


  // GRÁFICOS

  if (charts) {

    charts.innerHTML = "";


    data.questions.forEach((question, index) => {

      const box =
        document.createElement("div");

      box.className =
        "result-question";


      const title =
        document.createElement("h3");

      title.textContent =
        `${index + 1}. ${question.text}`;


      box.appendChild(title);


      const counts =
        Object.values(question.counts);


      const max =
        Math.max(...counts, 1);


      question.options.forEach(option => {

        const count =
          question.counts[option] || 0;


        let percentage = 0;


        if (data.total > 0) {

          percentage =
            ((count / data.total) * 100)
            .toFixed(1);

        }


        const row =
          document.createElement("div");

      row.className =
          "result-row";


        row.innerHTML = `

          <div class="result-label">

            <span>${option}</span>

            <strong>
              ${count} (${percentage}%)
            </strong>

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


      charts.appendChild(box);

    });

  }


  if (status) {

    status.textContent =
      "Resultados atualizados.";

  }

}


// =====================================================
// BOTÃO ATUALIZAR
// =====================================================

const refresh =
  document.getElementById("refresh");


if (refresh) {

  refresh.addEventListener(
    "click",
    loadResults
  );

}


// =====================================================
// CARREGAR RESULTADOS AO ABRIR
// =====================================================

loadResults();
