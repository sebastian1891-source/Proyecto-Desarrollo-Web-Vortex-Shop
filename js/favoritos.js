// =========================================================
// FAVORITOS (corazón en las tarjetas y en la ficha de producto)
// ---------------------------------------------------------
// - Con sesión: el corazón agrega o quita el producto de los favoritos
//   del usuario (se guardan en Firestore, ver firebase/favoritos.js).
// - Sin sesión: se avisa que hay que iniciar sesión.
// - Los favoritos se listan en "Mi perfil".
// Cualquier página que dibuje botones .btn-favorito[data-id] los tiene
// funcionando con solo importar este archivo.
// =========================================================

import { observarSesion } from "./firebase/auth.js";
import { obtenerFavoritos, agregarFavorito, quitarFavorito } from "./firebase/favoritos.js";
import { mostrarAviso } from "./mensajes.js";

let usuarioActual = null;
let favoritos = new Set();
let cargados = false;

// ---------- Consulta (sin esperar a Firestore) ----------
export function esFavorito(idProducto) {
    return favoritos.has(idProducto);
}

// Evento para que otras partes de la página (ej: Mi perfil) se actualicen
function avisarCambio() {
    window.dispatchEvent(new CustomEvent("vortex:favoritos", { detail: { ids: [...favoritos] } }));
}

// ---------- Corazones ----------
// El HTML del botón lo arma crearBotonFavorito (productosUI.js).
// Actualiza los corazones (de toda la página o de una parte) según la lista actual
function pintarCorazones(raiz = document) {
    raiz.querySelectorAll(".btn-favorito[data-id]").forEach(boton => {
        const activo = favoritos.has(boton.dataset.id);
        const nombre = boton.dataset.nombre ?? "";
        boton.classList.toggle("activo", activo);
        boton.setAttribute("aria-pressed", String(activo));
        boton.title = activo ? "Quitar de favoritos" : "Agregar a favoritos";
        boton.setAttribute("aria-label", `${boton.title}: ${nombre}`);
    });
}

// ---------- Alternar ----------
async function alternarFavorito(boton) {
    const idProducto = boton.dataset.id;
    const nombre = boton.dataset.nombre ?? "El producto";

    if (!usuarioActual) {
        mostrarAviso("Iniciá sesión para guardar productos en tus favoritos.");
        return;
    }
    if (!cargados || boton.disabled) return;

    const agregar = !favoritos.has(idProducto);

    // Se muestra el cambio al instante y se revierte si Firestore falla
    agregar ? favoritos.add(idProducto) : favoritos.delete(idProducto);
    pintarCorazones();
    boton.classList.remove("latido");
    void boton.offsetWidth;
    if (agregar) boton.classList.add("latido");
    boton.disabled = true;

    try {
        if (agregar) {
            await agregarFavorito(usuarioActual.uid, idProducto);
        } else {
            await quitarFavorito(usuarioActual.uid, idProducto);
        }
        mostrarAviso(agregar ? `"${nombre}" se agregó a tus favoritos.` : `"${nombre}" se quitó de tus favoritos.`);
        avisarCambio();
    } catch (error) {
        console.error(error);
        agregar ? favoritos.delete(idProducto) : favoritos.add(idProducto);
        pintarCorazones();
        mostrarAviso("No se pudieron actualizar tus favoritos. Revisá tu conexión e intentá de nuevo.");
    } finally {
        boton.disabled = false;
    }
}

// Las tarjetas del catálogo, la ficha y el perfil se crean con JavaScript:
// cada vez que aparecen botones nuevos se pintan con el estado actual.
new MutationObserver(cambios => {
    cambios.forEach(c => c.addedNodes.forEach(nodo => {
        if (nodo.nodeType === 1) pintarCorazones(nodo.parentNode ?? document);
    }));
}).observe(document.body, { childList: true, subtree: true });

// Un solo listener para toda la página (las tarjetas se redibujan seguido)
document.addEventListener("click", evento => {
    const boton = evento.target.closest(".btn-favorito[data-id]");
    if (!boton) return;
    evento.preventDefault();
    alternarFavorito(boton);
});

// ---------- Sesión ----------
// Al iniciar o cerrar sesión se cargan (o se vacían) los favoritos
observarSesion(async usuario => {
    usuarioActual = usuario;
    favoritos = new Set();
    cargados = false;

    if (usuario) {
        try {
            favoritos = new Set(await obtenerFavoritos(usuario.uid));
        } catch (error) {
            console.error(error);
        }
    }

    cargados = true;
    pintarCorazones();
    avisarCambio();
});
