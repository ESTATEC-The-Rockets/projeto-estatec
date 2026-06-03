document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       SIDEBAR RECOLHÍVEL
    ========================= */

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", () => {

            sidebar.classList.toggle("collapsed");

        });

    }

    /* =========================
       DATA AUTOMÁTICA
    ========================= */

    const currentDate =
        document.getElementById("currentDate");

    const currentDay =
        document.getElementById("currentDay");

    if (currentDate && currentDay) {

        const hoje = new Date();

        currentDate.textContent =
            hoje.toLocaleDateString(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

        currentDay.textContent =
            hoje.toLocaleDateString(
                "pt-BR",
                {
                    weekday: "long"
                }
            );

    }

    /* =========================
       MENU ATIVO
    ========================= */

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.addEventListener("click", () => {

            navItems.forEach(nav => {

                nav.classList.remove("active");

            });

            item.classList.add("active");

        });

    });

    /* =========================
       NOTIFICAÇÕES
    ========================= */

    const badges =
        document.querySelectorAll(
            ".notification-badge"
        );

    badges.forEach(badge => {

        const valor =
            parseInt(
                badge.textContent.trim()
            );

        if (valor <= 0) {

            badge.style.display = "none";

        }

    });

});