// =========================================================
// PIEZAS DE INTERFAZ COMPARTIDAS (catálogo, detalle y carrito)
// =========================================================

import { escaparHtml } from "./mensajes.js";
import { sePuedeComprar } from "./firebase/productos.js";

// Da formato de moneda al precio, ej: 2500 -> "$ 2.500"
export function formatearPrecio(precio) {
    return "$ " + Number(precio).toLocaleString("es-UY");
}

// Texto y clase del estado de stock/disponibilidad
export function obtenerEstadoStock(producto) {
    if (!producto.disponible) return { texto: "No disponible", clase: "text-danger fw-semibold" };
    if (producto.stock === 0) return { texto: "Sin stock", clase: "text-danger fw-semibold" };
    return { texto: `${producto.stock} unidades disponibles`, clase: "text-secondary" };
}

// Crea el elemento HTML (columna + tarjeta) para un producto
export function crearTarjetaProducto(producto) {
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6 col-xl-3";

    const estado = obtenerEstadoStock(producto);
    const comprable = sePuedeComprar(producto);

    columna.innerHTML = `
        <article class="product-card h-100">
            <div class="product-image">
                <img src="${escaparHtml(producto.imagen)}" alt="${escaparHtml(producto.nombre)}">
            </div>
            <div class="p-3">
                <span class="eyebrow">${escaparHtml(producto.categoria)}</span>
                <h3 class="h5 mt-2">${escaparHtml(producto.nombre)}</h3>
                <p class="text-secondary small mb-1">${escaparHtml(producto.descripcion)}</p>
                <p class="small ${estado.clase} mb-2">${estado.texto}</p>
                <div class="d-flex justify-content-between align-items-center product-footer">
                    <strong>${formatearPrecio(producto.precio)}</strong>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary btn-sm btn-agregar-carrito"
                            data-id="${escaparHtml(producto.id)}" ${comprable ? "" : "disabled"}>
                            Agregar
                        </button>
                        <a href="producto.html?id=${encodeURIComponent(producto.id)}" class="btn btn-primary btn-sm">Ver producto</a>
                    </div>
                </div>
            </div>
        </article>
    `;

    return columna;
}

// Bloque para estados especiales: cargando, vacío, error
export function crearHtmlCargando(texto = "Cargando productos...") {
    return `
        <div class="col-12 text-center py-5 text-secondary">
            <div class="spinner-border mb-3" role="status" aria-hidden="true"></div>
            <p class="mb-0">${texto}</p>
        </div>
    `;
}

export function crearHtmlEstado({ icono, titulo, texto, boton = "" }) {
    return `
        <div class="col-12">
            <section class="locked-module py-4">
                <div class="locked-icon">${icono}</div>
                <h2 class="h4 fw-bold">${titulo}</h2>
                <p class="lead">${texto}</p>
                ${boton}
            </section>
        </div>
    `;
}

// Ejecuta una acción asíncrona (ej: agregar al carrito) mostrando un spinner
// en el botón y deshabilitándolo, para evitar clics repetidos mientras se consulta Firestore
export async function conBotonOcupado(boton, accion) {
    const textoOriginal = boton.innerHTML;
    boton.disabled = true;
    boton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>`;

    try {
        await accion();
    } finally {
        boton.disabled = false;
        boton.innerHTML = textoOriginal;
    }
}
