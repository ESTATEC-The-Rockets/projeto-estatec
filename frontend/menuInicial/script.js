document.addEventListener('DOMContentLoaded', () => {
    const dropBtn = document.getElementById('dropBtn');
    const dropdown = document.getElementById('myDropdown');

    if (dropBtn) {
        dropBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
    }

    // Fecha se clicar fora
    window.onclick = function(event) {
        if (!event.target.matches('.btn-gray')) {
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    }
});