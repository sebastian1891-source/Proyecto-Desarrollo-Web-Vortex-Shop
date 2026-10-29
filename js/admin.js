// =========================================================
// PANEL ADMINISTRATIVO (admin.html) · Sprint 4
// ---------------------------------------------------------
// Página protegida: solo la ven usuarios con rol "administrador".
// Un cliente que escriba admin.html en la barra de direcciones es
// redirigido al inicio con un aviso (ver exigirAdministrador en roles.js).
//
// El panel se divide en pestañas; cada una vive en su archivo de js/admin/:
//   Resumen     → resumen.js      (estadísticas generales)
//   Productos   → productos.js    (crear, editar, desactivar y eliminar)
//   Pedidos     → pedidos.js      (consulta y cambio de estado)
//   Comentarios → comentarios.js  (moderación de opiniones)
//   Usuarios    → usuarios.js     (consulta de usuarios y su actividad)
//
// Las pestañas comparten los datos leídos de Firestore en "datos" y se
// avisan los cambios (ej: al cancelar un pedido se actualiza el stock
// y el resumen se vuelve a calcular).
// =========================================================

import { exigirAdministrador } from "./firebase/roles.js";
import { escaparHtml } from "./mensajes.js";
import { iniciarResumen } from "./admin/resumen.js";
import { iniciarProductos, recargarProductos } from "./admin/productos.js";
import { iniciarPedidos } from "./admin/pedidos.js";
import { iniciarComentarios, cargar as recargarComentarios } from "./admin/comentarios.js";
import { iniciarUsuarios } from "./admin/usuarios.js";

const contenedor = document.querySelector("#admin-container");

const PESTANIAS = [
    { id: "resumen", texto: "Resumen" },
    { id: "productos", texto: "Productos" },
    { id: "pedidos", texto: "Pedidos" },
    { id: "comentarios", texto: "Comentarios" },
    { id: "usuarios", texto: "Usuarios" }
];

// ---------- Datos compartidos y avisos de cambios ----------
const datos = { productos: undefined, pedidos: undefined, usuarios: undefined, valoraciones: undefined };
const suscriptores = [];

const contexto = {
    datos,
    suscribir: funcion => suscriptores.push(funcion),
    avisarCambio: clave => suscriptores.forEach(funcion => funcion(clave)),
    recargarProductos: () => recargarProductos(),
    irAPestania: id => mostrarPestania(id, true)
};

// ---------- Estructura ----------
function dibujarPanel(usuario) {
    const nombre = usuario.displayName?.split(" ")[0] ?? usuario.email;

    contenedor.innerHTML = `
        <div class="section-heading mb-4">
            <div>
                <span class="eyebrow">Administración</span>
                <h1 class="fw-bold mb-1">Panel administrativo</h1>
                <p class="text-secondary mb-0">Hola, ${escaparHtml(nombre)}. Gestioná productos, pedidos, comentarios y usuarios de Vortex Shop.</p>
            </div>
            <div class="d-flex gap-2 flex-wrap">
                <a class="btn btn-outline-primary btn-sm" href="catalogo.html" target="_blank" rel="noopener">Ver catálogo</a>
                <a class="btn btn-outline-secondary btn-sm" href="carga-inicial.html">Carga inicial</a>
            </div>
        </div>

        <ul class="nav nav-pills admin-tabs mb-4" role="tablist">
            ${PESTANIAS.map(p => `
                <li class="nav-item" role="presentation">
                    <button class="nav-link" type="button" role="tab" id="tab-${p.id}" data-pestania="${p.id}"
                        aria-controls="seccion-${p.id}" aria-selected="false">${p.texto}</button>
                </li>`).join("")}
        </ul>

        ${PESTANIAS.map(p => `<section id="seccion-${p.id}" class="d-none" role="tabpanel" aria-labelledby="tab-${p.id}"></section>`).join("")}
    `;

    contenedor.querySelector(".admin-tabs").addEventListener("click", evento => {
        const id = evento.target.closest("[data-pestania]")?.dataset.pestania;
        if (id) mostrarPestania(id, true);
    });
}

function mostrarPestania(id, actualizarUrl = false) {
    if (!PESTANIAS.some(p => p.id === id)) id = "resumen";

    PESTANIAS.forEach(p => {
        const activa = p.id === id;
        contenedor.querySelector(`#seccion-${p.id}`).classList.toggle("d-none", !activa);
        const boton = contenedor.querySelector(`#tab-${p.id}`);
        boton.classList.toggle("active", activa);
        boton.setAttribute("aria-selected", String(activa));
    });

    // La pestaña queda en la URL (admin.html#pedidos) para poder recargar o compartir el enlace
    if (actualizarUrl) history.replaceState(null, "", `#${id}`);
}

// ---------- Inicio ----------
const usuario = await exigirAdministrador("admin.html");

if (usuario) {
    dibujarPanel(usuario);
    mostrarPestania(location.hash.slice(1));

    const seccion = id => contenedor.querySelector(`#seccion-${id}`);

    iniciarResumen(seccion("resumen"), contexto);

    let cantidadAnterior;
    await Promise.allSettled([
        iniciarProductos(seccion("productos"), {
            onCambio: productos => {
                // Si se eliminó un producto, también se borraron sus opiniones
                const seElimino = cantidadAnterior !== undefined && productos.length < cantidadAnterior;
                cantidadAnterior = productos.length;
                datos.productos = productos;
                contexto.avisarCambio("productos");
                if (seElimino && datos.valoraciones) recargarComentarios();
            }
        }),
        iniciarPedidos(seccion("pedidos"), contexto),
        iniciarComentarios(seccion("comentarios"), contexto),
        iniciarUsuarios(seccion("usuarios"), contexto)
    ]);
}
