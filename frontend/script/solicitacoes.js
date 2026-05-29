// Função para tratar as ações dos botões de Aceitar/Rejeitar
function actionRequest(button, status) {
  // Encontra o card mais próximo que contém o botão clicado
  const card = button.closest('.request-card');
  const nome = card.getAttribute('data-nome');
  
  alert(`Solicitação de ${nome} foi ${status}!`);
  card.remove(); // Remove o card da lista visualmente
}

// Configuração do filtro dinâmico do campo de pesquisa
const searchInput = document.getElementById('searchInput');

if (searchInput) {
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const cards = document.querySelectorAll('.request-card');

    cards.forEach(card => {
      const nome = card.getAttribute('data-nome').toLowerCase();
      const placa = card.getAttribute('data-placa').toLowerCase();

      // Mostra o card se o termo de busca estiver no nome ou na placa
      if (nome.includes(searchTerm) || placa.includes(searchTerm)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
}