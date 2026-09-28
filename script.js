const API_URL =
"https://script.google.com/macros/s/AKfycbx0nA8Vboc8ud7U33eN0IOHkFydQ26FjWwsKOsUknOSLuFwcsJzLkil1yTkGzHL8sDx/exec";


const questions = [

[
"Você considera que a escola apresenta diferentes culturas durante as aulas?",
["Sempre","Frequentemente","Às vezes","Raramente","Nunca"]
],

[
"Você já estudou na escola conteúdos sobre culturas indígenas?",
["Sim","Não","Não me lembro"]
],

[
"Você já estudou conteúdos relacionados à cultura e história africana e afro-brasileira?",
["Sim","Não","Não me lembro"]
],

[
"Você considera que os livros e materiais utilizados nas aulas apresentam diferentes culturas?",
["Sempre","Frequentemente","Às vezes","Raramente","Nunca"]
],

[
"Você acha que a escola valoriza conhecimentos diferentes daqueles tradicionalmente apresentados nos livros?",
["Sim","Parcialmente","Não","Não sei responder"]
],

[
"Nas aulas, os professores costumam apresentar diferentes pontos de vista sobre acontecimentos históricos?",
["Sempre","Frequentemente","Às vezes","Raramente","Nunca"]
],

[
"Você considera importante estudar culturas e conhecimentos de diferentes povos?",
["Muito importante","Importante","Pouco importante","Não considero importante"]
],

[
"Você já percebeu alguma cultura sendo apresentada de forma estereotipada ou simplificada em materiais escolares?",
["Sim","Não","Não sei identificar"]
],

[
"Você gostaria que a escola trabalhasse mais conteúdos relacionados à diversidade cultural?",
["Sim","Talvez","Não"]
],

[
"De modo geral, você considera que sua escola valoriza a diversidade cultural?",
["Sim","Parcialmente","Não","Não sei responder"]
]

];


const form = document.getElementById("form");


questions.forEach((question, index) => {

    const div = document.createElement("div");

    div.className = "question";

    div.innerHTML =
        `<h3>${index + 1}. ${question[0]}</h3>` +

        question[1].map(option => `
            <label class="option">
                <input
                    type="radio"
                    name="q${index}"
                    value="${option}"
                    required
                >
                ${option}
            </label>
        `).join("");

    form.appendChild(div);

});


/* =========================
   ENVIAR RESPOSTAS
========================= */

document.getElementById("send").addEventListener("click", async () => {

    if (!form.reportValidity()) {
        return;
    }

    const status = document.getElementById("status");

    status.textContent = "Enviando resposta...";
    status.style.color = "#26734d";


    const answers = questions.map((_, index) => {

        return document.querySelector(
            `input[name="q${index}"]:checked`
        ).value;

    });


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

        setTimeout(loadResults, 1000);


    } catch (error) {

        console.error(error);

        status.textContent =
            "Erro ao enviar a resposta.";

        status.style.color = "#b14d35";

    }

});


/* =========================
   CARREGAR RESULTADOS
========================= */

async function loadResults() {

    const status =
        document.getElementById("resultsStatus");

    status.textContent =
        "Carregando resultados...";


    try {

        const resposta = await fetch(
            API_URL + "?t=" + Date.now()
        );

        const data = await resposta.json();


        if (!data.ok) {

            throw new Error(
                "API retornou erro."
            );

        }


        document.getElementById(
            "totalResponses"
        ).textContent = data.total;


        document.getElementById(
            "lastUpdate"
        ).textContent = data.updatedAt;


        status.textContent =
            "Resultados carregados automaticamente.";


        mostrarGraficos(data);


    } catch (error) {

        console.error(error);

        status.textContent =
            "Erro ao carregar os resultados.";

    }

}


/* =========================
   CRIAR GRÁFICOS
========================= */

function mostrarGraficos(data) {

    const container =
        document.getElementById("charts");


    container.innerHTML = "";


    data.questions.forEach((question, index) => {

        const chart =
            document.createElement("div");


        chart.className = "chart";


        let html = `
            <h3>
                ${index + 1}. ${question.text}
            </h3>
        `;


        question.options.forEach(option => {

            const quantidade =
                Number(
                    question.counts[option] || 0
                );


            const porcentagem =
                data.total > 0
                    ? (quantidade / data.total) * 100
                    : 0;


            html += `

                <div class="bar">

                    <div class="bar-info">

                        <span>
                            ${option}
                        </span>

                        <strong>
                            ${quantidade}
                            (${porcentagem.toFixed(1)}%)
                        </strong>

                    </div>


                    <div class="bar-bg">

                        <div
                            class="bar-fill"
                            style="width:${porcentagem}%"
                        ></div>

                    </div>

                </div>

            `;

        });


        chart.innerHTML = html;


        container.appendChild(chart);

    });

}


/* =========================
   BOTÃO ATUALIZAR
========================= */

document.getElementById("refresh")
    .addEventListener(
        "click",
        loadResults
    );


/* =========================
   INICIAR
========================= */

loadResults();