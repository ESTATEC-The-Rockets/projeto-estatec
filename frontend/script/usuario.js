let currentSelectedUserId = null;
let currentSelectedType = 'VISITANTE'; // Padrão inicial

// Abre o modal associando ao ID do cliente correspondente vindo do BD
function handleTipo(id) {
    currentSelectedUserId = id;
    document.getElementById("type-modal").classList.add("active");
    switchTab('VISITANTE'); // Sempre reseta abrindo em Visitante
}

// Fecha o modal limpando os campos
function closeModal() {
    document.getElementById("type-modal").classList.remove("active");
    document.getElementById("input-inicio").value = "";
    document.getElementById("input-fim").value = "";
    currentSelectedUserId = null;
}

// Gerencia a troca de abas (Visitante / Fixo)
function switchTab(type) {
    currentSelectedType = type;
    const tabVisitante = document.getElementById("tab-visitante");
    const tabFixo = document.getElementById("tab-fixo");
    const datesContainer = document.getElementById("date-inputs-container");

    if (type === 'VISITANTE') {
        tabVisitante.classList.add("active");
        tabFixo.classList.remove("active");
        // Mostra os campos de data no fluxo de visitante
        datesContainer.style.display = "flex";
    } else {
        tabFixo.classList.add("active");
        tabVisitante.classList.remove("active");
        // Oculta os campos de data no fluxo de Fixo conforme imagem 2
        datesContainer.style.display = "none";
    }
}

// Máscara simples e automática para barra de data (dd/mm/aaaa) nos inputs
const dateInputs = [document.getElementById("input-inicio"), document.getElementById("input-fim")];
dateInputs.forEach(input => {
    input.addEventListener("input", (e) => {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length >= 2) v = v.substring(0, 2) + "/" + v.substring(2);
        if (v.length >= 5) v = v.substring(0, 5) + "/" + v.substring(5, 9);
        e.target.value = v;
    });
});

// Ação disparada ao pressionar o botão "SALVAR"
function saveTypeSelection() {
    const dataInicio = document.getElementById("input-inicio").value;
    const dataFim = document.getElementById("input-fim").value;

    const payload = {
        userId: currentSelectedUserId,
        tipo: currentSelectedType,
        inicio: currentSelectedType === 'VISITANTE' ? dataInicio : null,
        fim: currentSelectedType === 'VISITANTE' ? dataFim : null
    };

    console.log("Dados prontos para salvar no Banco de Dados:", payload);

    /* Envio para o seu backend
    fetch('/api/salvar-tipo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    */

    alert(`Salvo com sucesso como ${currentSelectedType}!`);
    closeModal();
}

// Fecha se clicar fora da caixa do modal
window.onclick = function(event) {
    const modal = document.getElementById("type-modal");
    if (event.target === modal) {
        closeModal();
    }
}