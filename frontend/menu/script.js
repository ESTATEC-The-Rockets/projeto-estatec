document.addEventListener('DOMContentLoaded', () => {
    // Dropdown Estacionamentos
    const estBtn = document.getElementById('estBtn');
    const estDropdown = document.getElementById('estDropdown');

    if (estBtn) {
        estBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            estDropdown.classList.toggle('show');
        });
    }

    window.addEventListener('click', () => {
        if (estDropdown) estDropdown.classList.remove('show');
    });

    // Expandir Câmeras
    const btnCameras = document.getElementById('openCameras');
    const extraCameras = document.getElementById('extraCameras');

    if (btnCameras && extraCameras) {
        btnCameras.addEventListener('click', () => {
            extraCameras.classList.toggle('show-cameras');
            btnCameras.textContent = extraCameras.classList.contains('show-cameras') ? '-' : '+';
        });
    }

    // Expandir Carros Coluna 1
    const btnCarros1 = document.getElementById('openCarros1');
    const extraCarros1 = document.getElementById('extraCarros1');

    if (btnCarros1 && extraCarros1) {
        btnCarros1.addEventListener('click', () => {
            extraCarros1.classList.toggle('show-cars');
            btnCarros1.textContent = extraCarros1.classList.contains('show-cars') ? '-' : '+';
        });
    }

    // Expandir Carros Coluna 2
    const btnCarros2 = document.getElementById('openCarros2');
    const extraCarros2 = document.getElementById('extraCarros2');

    if (btnCarros2 && extraCarros2) {
        btnCarros2.addEventListener('click', () => {
            extraCarros2.classList.toggle('show-cars');
            btnCarros2.textContent = extraCarros2.classList.contains('show-cars') ? '-' : '+';
        });
    }
});