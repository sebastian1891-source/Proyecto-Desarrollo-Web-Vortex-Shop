// =========================================================
// CATÁLOGO (catalogo.html)
// ---------------------------------------------------------
// Los productos se obtienen de la colección "productos" de Firestore.
// Una vez descargados, la búsqueda, el filtro por categoría y el
// orden se aplican sobre esa lista (sin volver a consultar).
// =========================================================

import { obtenerProductos, mensajeErrorProductos } from "./firebase/productos.js";
import { crearTarjetaProducto, crearHtmlCargando, crearHtmlEstado, conBotonOcupado } from "./productosUI.js";
import { agregarYNotificar } from "./carrito.js";

// Productos traídos de Firestore (fuente del catálogo)
let productos = [];

const contenedor = document.querySelector("#catalogo-container");
const buscador = document.querySelector("#buscador");
const selectCategoria = document.querySelector("#filtroCategoria");
const selectOrden = document.querySelector("#ordenarPor");
const btnLimpiar = document.querySelector("#btnLimpiarFiltros");
const contador = document.querySelector("#resultado-contador");

// Habilita o deshabilita los controles de búsqueda mientras no hay datos
function habilitarFiltros(habilitar) {
    [buscador, selectCategoria, selectOrden, btnLimpiar].forEach(el => {
        if (el) el.disabled = !habilitar;
    });
}

// Muestra cuántos productos coinciden con la búsqueda/filtro actual
function actualizarContadorResultados(cantidad) {
    if (!contador) return;

    contador.textContent = cantidad === 1
        ? "1 producto encontrado"
        : `${cantidad} productos encontrados`;
}

// Recorre la lista y agrega cada tarjeta al contenedor
function renderizarCatalogo(listaProductos) {
    actualizarContadorResultados(listaProductos.length);
    contenedor.innerHTML = "";

    if (listaProductos.length === 0) {
        contenedor.innerHTML = `<p class="text-secondary">No se encontraron productos que coincidan con tu búsqueda.</p>`;
        return;
    }

    listaProductos.forEach(producto => {
        contenedor.appendChild(crearTarjetaProducto(producto));
    });
}

// Genera las opciones del <select> a partir de las categorías
// presentes en los productos (sin repetidas)
function inicializarFiltroCategorias() {
    if (!selectCategoria) return;

    // Se deja solo "Todas las categorías" (por si se recarga tras un error)
    selectCategoria.querySelectorAll("option:not([value=''])").forEach(op => op.remove());

    const categoriasUnicas = [...new Set(productos.map(p => p.categoria))].sort();

    categoriasUnicas.forEach(categoria => {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectCategoria.appendChild(opcion);
    });
}

// Filtra según el texto buscado y la categoría elegida
function filtrarProductos(texto, categoria) {
    const textoBuscado = texto.trim().toLowerCase();

    return productos.filter(producto => {
        const coincideNombre = producto.nombre.toLowerCase().includes(textoBuscado);
        const coincideCategoria = categoria === "" || producto.categoria === categoria;

        return coincideNombre && coincideCategoria;
    });
}

// Ordena una copia de la lista según el criterio elegido
function ordenarProductos(lista, criterio) {
    const copia = [...lista];

    switch (criterio) {
        case "nombre-asc":
            return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
        case "nombre-desc":
            return copia.sort((a, b) => b.nombre.localeCompare(a.nombre));
        case "precio-asc":
            return copia.sort((a, b) => a.precio - b.precio);
        case "precio-desc":
            return copia.sort((a, b) => b.precio - a.precio);
        default:
            return copia;
    }
}

// Lee los controles, filtra, ordena y vuelve a renderizar
function aplicarFiltros() {
    const texto = buscador ? buscador.value : "";
    const categoria = selectCategoria ? selectCategoria.value : "";
    const orden = selectOrden ? selectOrden.value : "";

    renderizarCatalogo(ordenarProductos(filtrarProductos(texto, categoria), orden));
}

function inicializarEventos() {
    buscador?.addEventListener("input", aplicarFiltros);
    selectCategoria?.addEventListener("change", aplicarFiltros);
    selectOrden?.addEventListener("change", aplicarFiltros);

    btnLimpiar?.addEventListener("click", () => {
        if (buscador) buscador.value = "";
        if (selectCategoria) selectCategoria.value = "";
        if (selectOrden) selectOrden.value = "";
        aplicarFiltros();
    });

    // Delegación de eventos: el contenedor se redibuja en cada búsqueda
    contenedor.addEventListener("click", evento => {
        const botonAgregar = evento.target.closest(".btn-agregar-carrito");
        if (botonAgregar) {
            conBotonOcupado(botonAgregar, () => agregarYNotificar(botonAgregar.dataset.id, 1));
            return;
        }

        if (evento.target.closest("#btnReintentarCatalogo")) {
            cargarCatalogo();
        }
    });
}

// Consulta Firestore y muestra el catálogo (o el mensaje que corresponda)
async function cargarCatalogo() {
    habilitarFiltros(false);
    if (contador) contador.textContent = "";
    contenedor.innerHTML = crearHtmlCargando("Cargando productos...");

    try {
        productos = await obtenerProductos();
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = crearHtmlEstado({
            icono: "⚠️",
            titulo: "No pudimos cargar el catálogo",
            texto: mensajeErrorProductos(error),
            boton: `<button class="btn btn-primary mt-2" id="btnReintentarCatalogo">Reintentar</button>`
        });
        return;
    }

    if (productos.length === 0) {
        contenedor.innerHTML = crearHtmlEstado({
            icono: "📦",
            titulo: "Todavía no hay productos",
            texto: "El catálogo está vacío por el momento. Volvé a visitarnos pronto."
        });
        return;
    }

    inicializarFiltroCategorias();
    habilitarFiltros(true);
    aplicarFiltros();
}

if (contenedor) {
    inicializarEventos();
    cargarCatalogo();
}