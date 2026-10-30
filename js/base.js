// =========================================================
// BASE (se carga en todas las páginas, sin módulos)
// ---------------------------------------------------------
//  - Resalta en el menú la página actual (data-page).
//  - Abre el modal "Conocé Vortex" del inicio.
//  - Modo oscuro: botón en el navbar que recuerda la elección.
//  - Contador del carrito en el link "Carrito" del navbar.
//  - Animación suave de las tarjetas al aparecer en pantalla.
// =========================================================

// ---------- MODO OSCURO ----------
// El tema se aplica antes de mostrar la página con un pequeño script en
// el <head> de cada HTML (así no hay un "parpadeo" claro al cargar).
// Bootstrap 5.3 cambia sus componentes con el atributo data-bs-theme.
const CLAVE_TEMA = "vortexTema";

function temaActual() {
    return document.documentElement.getAttribute("data-bs-theme") === "dark" ? "oscuro" : "claro";
}

function aplicarTema(tema) {
    document.documentElement.setAttribute("data-bs-theme", tema === "oscuro" ? "dark" : "light");
    try { localStorage.setItem(CLAVE_TEMA, tema); } catch (e) { /* sin almacenamiento: solo dura esta visita */ }
    actualizarBotonTema();
}

const ICONO_LUNA = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
const ICONO_SOL = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;

function actualizarBotonTema() {
    const boton = document.querySelector("#btnTema");
    if (!boton) return;
    const oscuro = temaActual() === "oscuro";
    boton.innerHTML = oscuro ? ICONO_SOL : ICONO_LUNA;
    boton.setAttribute("aria-label", oscuro ? "Activar modo claro" : "Activar modo oscuro");
    boton.title = oscuro ? "Modo claro" : "Modo oscuro";
    boton.setAttribute("aria-pressed", String(oscuro));
}

function crearBotonTema() {
    const contenedorNavbar = document.querySelector(".navbar > .container");
    if (!contenedorNavbar || document.querySelector("#btnTema")) return;

    const boton = document.createElement("button");
    boton.type = "button";
    boton.id = "btnTema";
    boton.className = "btn-tema";
    boton.addEventListener("click", () => aplicarTema(temaActual() === "oscuro" ? "claro" : "oscuro"));

    contenedorNavbar.insertBefore(boton, contenedorNavbar.querySelector(".navbar-toggler"));
    actualizarBotonTema();
}

// ---------- CONTADOR DEL CARRITO ----------
// Lee el carrito de LocalStorage (misma clave que js/carrito.js) y muestra
// la cantidad total de unidades. Se actualiza cuando carrito.js avisa un
// cambio (evento "vortex:carrito") o cuando cambia en otra pestaña.
const CLAVE_CARRITO = "vortexCarrito";

function contarUnidadesCarrito() {
    try {
        const carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];
        return carrito.reduce((suma, item) => suma + (Number(item.cantidad) || 0), 0);
    } catch (e) {
        return 0;
    }
}

function actualizarContadorCarrito(animar = false) {
    const total = contarUnidadesCarrito();

    // En celulares el menú está plegado: el contador también se muestra
    // sobre el botón del menú (hamburguesa) para que se vea sin abrirlo.
    const toggler = document.querySelector(".navbar-toggler");
    if (toggler && !toggler.querySelector(".badge-carrito")) {
        toggler.style.position = "relative";
        toggler.insertAdjacentHTML("beforeend", `<span class="badge-carrito badge-toggler d-none" aria-hidden="true"></span>`);
    }

    document.querySelectorAll('.navbar .nav-link[data-page="carrito"], .navbar-toggler').forEach(link => {
        let badge = link.querySelector(".badge-carrito");
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "badge-carrito";
            link.appendChild(badge);
        }

        const anterior = badge.textContent;
        badge.textContent = total > 99 ? "99+" : String(total);
        badge.classList.toggle("d-none", total === 0);
        if (link.classList.contains("nav-link")) {
            link.setAttribute("aria-label", total === 0 ? "Carrito (vacío)" : `Carrito (${total} ${total === 1 ? "unidad" : "unidades"})`);
        }

        if (animar && anterior !== badge.textContent && total > 0) {
            badge.classList.remove("rebote");
            void badge.offsetWidth; // reinicia la animación
            badge.classList.add("rebote");
        }
    });
}

// ---------- ANIMACIONES AL APARECER ----------
// Las tarjetas empiezan invisibles (clase "revelar") y aparecen con un
// fundido cuando entran en pantalla. Si el navegador no tiene
// IntersectionObserver, o el usuario pidió reducir el movimiento, se muestran directamente.
const SELECTOR_ANIMADO = ".product-card, .benefit-card, .stat-card, .pedido-card";
const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let observadorAparicion = null;

function prepararAnimaciones(raiz) {
    if (!observadorAparicion) return;
    const elementos = raiz.matches?.(SELECTOR_ANIMADO) ? [raiz] : [...raiz.querySelectorAll?.(SELECTOR_ANIMADO) ?? []];

    elementos.forEach(el => {
        if (el.classList.contains("revelar")) return;
        el.classList.add("revelar");
        observadorAparicion.observe(el);
    });
}

function iniciarAnimaciones() {
    if (sinMovimiento || !("IntersectionObserver" in window)) return;

    observadorAparicion = new IntersectionObserver(entradas => {
        // Las que aparecen juntas lo hacen escalonadas (efecto cascada)
        entradas.filter(e => e.isIntersecting).forEach((entrada, i) => {
            entrada.target.style.animationDelay = `${Math.min(i, 8) * 60}ms`;
            entrada.target.classList.add("visible");
            observadorAparicion.unobserve(entrada.target);
        });
    }, { rootMargin: "0px 0px -40px 0px" });

    prepararAnimaciones(document.body);

    // El catálogo, el carrito y el panel crean tarjetas con JavaScript:
    // se observan también las que se agregan después.
    new MutationObserver(cambios => {
        cambios.forEach(c => c.addedNodes.forEach(nodo => {
            if (nodo.nodeType === 1) prepararAnimaciones(nodo);
        }));
    }).observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
}

// ---------- INICIO ----------
document.addEventListener("DOMContentLoaded", () => {
    const p = document.body.dataset.page;

    document.querySelectorAll("[data-page]").forEach(a =>
        a.classList.toggle("active", a.dataset.page === p)
    );

    document.querySelector("#btnProjectInfo")?.addEventListener("click", () =>
        bootstrap.Modal.getOrCreateInstance(document.querySelector("#projectInfoModal")).show()
    );

    crearBotonTema();
    actualizarContadorCarrito();
    iniciarAnimaciones();
});

window.addEventListener("vortex:carrito", () => actualizarContadorCarrito(true));
window.addEventListener("storage", evento => {
    if (evento.key === CLAVE_CARRITO) actualizarContadorCarrito(true);
    if (evento.key === CLAVE_TEMA && evento.newValue) aplicarTema(evento.newValue);
});
