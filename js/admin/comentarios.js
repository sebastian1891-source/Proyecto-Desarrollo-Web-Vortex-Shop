// =========================================================
// PANEL · PESTAÑA COMENTARIOS (opcional)
// ---------------------------------------------------------
// Moderación de opiniones: lista de todas las valoraciones,
// filtrable por producto y puntuación, con opción de eliminarlas.
// =========================================================

import { obtenerTodasLasValoraciones, eliminarValoracion } from "../firebase/valoraciones.js";
import { escaparHtml, mostrarAviso } from "../mensajes.js";
import { confirmar } from "./confirmar.js";
import { formatearFecha, dibujarEstrellas, mensajeCargando, mostrarErrorCarga, mensajeErrorFirestore, normalizar } from "./utilidades.js";

let seccion, ctx;

function nombreProducto(idProducto) {
    return (ctx.datos.productos ?? []).find(p => p.id === idProducto)?.nombre ?? "Producto eliminado";
}

function dibujarSeccion() {
    seccion.innerHTML = `
        <div class="auth-card">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h2 class="h5 fw-bold mb-0">Comentarios <span class="text-secondary fw-normal" id="contadorComentarios"></span></h2>
                <button type="button" class="btn btn-outline-primary btn-sm" id="btnRecargarComentarios">Actualizar</button>
            </div>

            <div class="row g-2 mb-3">
                <div class="col-sm-5">
                    <input type="search" class="form-control form-control-sm" id="buscarComentario" placeholder="Buscar en comentarios o autor">
                </div>
                <div class="col-sm-4">
                    <select class="form-select form-select-sm" id="filtroProductoComentario" aria-label="Filtrar por producto"></select>
                </div>
                <div class="col-sm-3">
                    <select class="form-select form-select-sm" id="filtroEstrellas" aria-label="Filtrar por puntuación">
                        <option value="">Todas las puntuaciones</option>
                        ${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${n} ${n === 1 ? "estrella" : "estrellas"}</option>`).join("")}
                    </select>
                </div>
            </div>

            <div id="listaComentarios"></div>
        </div>
    `;

    seccion.querySelector("#btnRecargarComentarios").addEventListener("click", cargar);
    ["#buscarComentario", "#filtroProductoComentario", "#filtroEstrellas"].forEach(sel =>
        seccion.querySelector(sel).addEventListener(sel === "#buscarComentario" ? "input" : "change", dibujarLista));

    seccion.querySelector("#listaComentarios").addEventListener("click", evento => {
        const boton = evento.target.closest("button[data-eliminar]");
        if (boton) borrar(boton.dataset.eliminar, boton);
    });
}

function actualizarFiltroProductos() {
    const select = seccion.querySelector("#filtroProductoComentario");
    const elegido = select.value;
    const ids = [...new Set((ctx.datos.valoraciones ?? []).map(v => v.idProducto))];
    const opciones = ids.map(id => ({ id, nombre: nombreProducto(id) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    select.innerHTML = `<option value="">Todos los productos</option>` +
        opciones.map(o => `<option value="${escaparHtml(o.id)}">${escaparHtml(o.nombre)}</option>`).join("");
    if (ids.includes(elegido)) select.value = elegido;
}

function dibujarLista() {
    if (!seccion) return;
    const lista = seccion.querySelector("#listaComentarios");
    const todas = ctx.datos.valoraciones;
    if (!todas) return;

    const texto = normalizar(seccion.querySelector("#buscarComentario").value.trim());
    const producto = seccion.querySelector("#filtroProductoComentario").value;
    const estrellas = Number(seccion.querySelector("#filtroEstrellas").value);

    const filtradas = todas.filter(v =>
        (producto === "" || v.idProducto === producto) &&
        (!estrellas || v.estrellas === estrellas) &&
        (texto === "" || normalizar(`${v.comentario} ${v.autor}`).includes(texto))
    );

    seccion.querySelector("#contadorComentarios").textContent =
        filtradas.length === todas.length ? `(${todas.length})` : `(${filtradas.length} de ${todas.length})`;

    if (todas.length === 0) {
        lista.innerHTML = `<p class="text-secondary mb-0">Todavía no hay opiniones.</p>`;
        return;
    }
    if (filtradas.length === 0) {
        lista.innerHTML = `<p class="text-secondary mb-0">Ningún comentario coincide con los filtros.</p>`;
        return;
    }

    lista.innerHTML = filtradas.map(v => `
        <article class="comentario-admin">
            <div class="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                <div>
                    <a href="producto.html?id=${encodeURIComponent(v.idProducto)}" target="_blank" rel="noopener" class="fw-semibold">${escaparHtml(nombreProducto(v.idProducto))}</a>
                    <div class="small text-secondary">${escaparHtml(v.autor || "Anónimo")} · ${formatearFecha(v.fecha, true)}</div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    ${dibujarEstrellas(v.estrellas)}
                    <button type="button" class="btn btn-outline-danger btn-sm" data-eliminar="${escaparHtml(v.id)}">Eliminar</button>
                </div>
            </div>
            <p class="mb-0 mt-2">${escaparHtml(v.comentario)}</p>
        </article>
    `).join("");
}

async function borrar(idValoracion, boton) {
    const valoracion = (ctx.datos.valoraciones ?? []).find(v => v.id === idValoracion);
    if (!valoracion) return;

    const acepta = await confirmar({
        titulo: "Eliminar comentario",
        mensaje: `¿Eliminar la opinión de ${valoracion.autor || "este usuario"} sobre "${nombreProducto(valoracion.idProducto)}"? Esta acción no se puede deshacer.`,
        textoBoton: "Eliminar",
        peligro: true
    });
    if (!acepta) return;

    boton.disabled = true;
    boton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>`;

    try {
        await eliminarValoracion(idValoracion);
        mostrarAviso("Se eliminó el comentario.");
        await cargar();
    } catch (error) {
        console.error(error);
        mostrarAviso(mensajeErrorFirestore(error, "No se pudo eliminar el comentario. Intentá de nuevo."));
        boton.disabled = false;
        boton.textContent = "Eliminar";
    }
}

export async function cargar() {
    const lista = seccion.querySelector("#listaComentarios");
    lista.innerHTML = mensajeCargando("Cargando comentarios...");

    try {
        ctx.datos.valoraciones = await obtenerTodasLasValoraciones();
        actualizarFiltroProductos();
        dibujarLista();
        ctx.avisarCambio("valoraciones");
    } catch (error) {
        console.error(error);
        mostrarErrorCarga(lista, mensajeErrorFirestore(error, "No se pudieron cargar los comentarios."), cargar);
    }
}

export async function iniciarComentarios(elemento, contexto) {
    seccion = elemento;
    ctx = contexto;
    dibujarSeccion();

    // Si cambian los productos (ej: se elimina uno), se actualizan los nombres
    ctx.suscribir(clave => {
        if (clave === "productos" && ctx.datos.valoraciones) {
            actualizarFiltroProductos();
            dibujarLista();
        }
    });

    await cargar();
}
