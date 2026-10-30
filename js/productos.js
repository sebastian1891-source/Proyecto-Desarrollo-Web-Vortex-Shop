// =========================================================
// CATÁLOGO (catalogo.html)
// ---------------------------------------------------------
// Los productos se obtienen de la colección "productos" de Firestore.
// Una vez descargados, la búsqueda, el filtro por categoría, el
// rango de precio y el orden se aplican sobre esa lista (sin volver
// a consultar). Se muestran de a PRODUCTOS_POR_PAGINA con "Cargar más".
// =========================================================

import { obtenerProductos, mensajeErrorProductos } from "./firebase/productos.js";
import { crearTarjetaProducto, crearHtmlCargando, crearHtmlEstado, conBotonOcupado } from "./productosUI.js";
import { agregarYNotificar } from "./carrito.js";
import "./favoritos.js"; // corazones de favoritos

// Productos traídos de Firestore (fuente del catálogo)
let productos = [];

// Paginación: cuántas tarjetas se muestran por vez
const PRODUCTOS_POR_PAGINA = 8;
let cantidadVisible = PRODUCTOS_POR_PAGINA;
let resultadoActual = []; // lista ya filtrada y ordenada

const contenedor = document.querySelector("#catalogo-container");
const buscador = document.querySelector("#buscador");
const selectCategoria = document.querySelector("#filtroCategoria");
const selectOrden = document.querySelector("#ordenarPor");
const btnLimpiar = document.querySelector("#btnLimpiarFiltros");
const contador = document.querySelector("#resultado-contador");
const inputPrecioMinimo = document.querySelector("#precioMinimo");
const inputPrecioMaximo = document.querySelector("#precioMaximo");
const errorPrecio = document.querySelector("#errorPrecio");
const paginacion = document.querySelector("#paginacion");
const btnCargarMas = document.querySelector("#btnCargarMas");

// Habilita o deshabilita los controles de búsqueda mientras no hay datos
function habilitarFiltros(habilitar) {
    [buscador, selectCategoria, selectOrden, btnLimpiar, inputPrecioMinimo, inputPrecioMaximo].forEach(el => {
        if (el) el.disabled = !habilitar;
    });
}

// Muestra cuántos productos coinciden y cuántos se están viendo
function actualizarContadorResultados(total, mostrados) {
    if (!contador) return;

    if (total === 0) {
        contador.textContent = "0 productos encontrados";
    } else if (mostrados < total) {
        contador.textContent = `Mostrando ${mostrados} de ${total} productos encontrados`;
    } else {
        contador.textContent = total === 1 ? "1 producto encontrado" : `${total} productos encontrados`;
    }
}

// Botón "Cargar más": visible solo si quedan productos sin mostrar
function actualizarPaginacion() {
    if (!paginacion) return;

    const restantes = resultadoActual.length - cantidadVisible;
    paginacion.classList.toggle("d-none", restantes <= 0);

    if (btnCargarMas && restantes > 0) {
        const siguientes = Math.min(restantes, PRODUCTOS_POR_PAGINA);
        btnCargarMas.textContent = `Cargar ${siguientes} ${siguientes === 1 ? "producto" : "productos"} más (quedan ${restantes})`;
    }
}

// Dibuja las tarjetas desde la posición "desde" (0 = se redibuja todo)
function renderizarCatalogo(desde = 0) {
    const visibles = resultadoActual.slice(0, cantidadVisible);
    actualizarContadorResultados(resultadoActual.length, visibles.length);

    if (desde === 0) contenedor.innerHTML = "";

    if (resultadoActual.length === 0) {
        contenedor.innerHTML = `<p class="text-secondary">No se encontraron productos que coincidan con tu búsqueda.</p>`;
        actualizarPaginacion();
        return;
    }

    visibles.slice(desde).forEach(producto => {
        contenedor.appendChild(crearTarjetaProducto(producto));
    });

    actualizarPaginacion();
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

// Lee un campo de precio: devuelve el número, o null si está vacío
function leerPrecio(input) {
    if (!input || input.value.trim() === "") return null;
    const numero = Number(input.value);
    return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

// Lee el rango de precio y marca el error si el mínimo supera al máximo.
// Con el rango inválido no se filtra por precio (se avisa al usuario).
function obtenerRangoPrecio() {
    const minimo = leerPrecio(inputPrecioMinimo);
    const maximo = leerPrecio(inputPrecioMaximo);
    const invalido = minimo !== null && maximo !== null && minimo > maximo;

    [inputPrecioMinimo, inputPrecioMaximo].forEach(input => input?.classList.toggle("is-invalid", invalido));
    errorPrecio?.classList.toggle("d-none", !invalido);

    return invalido ? { minimo: null, maximo: null } : { minimo, maximo };
}

// Filtra según el texto buscado, la categoría elegida y el rango de precio
function filtrarProductos(texto, categoria, { minimo, maximo }) {
    const textoBuscado = texto.trim().toLowerCase();

    return productos.filter(producto => {
        const coincideNombre = producto.nombre.toLowerCase().includes(textoBuscado);
        const coincideCategoria = categoria === "" || producto.categoria === categoria;
        const coincidePrecio = (minimo === null || producto.precio >= minimo)
                            && (maximo === null || producto.precio <= maximo);

        return coincideNombre && coincideCategoria && coincidePrecio;
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

// Lee los controles, filtra, ordena y vuelve a mostrar la primera página
function aplicarFiltros() {
    const texto = buscador ? buscador.value : "";
    const categoria = selectCategoria ? selectCategoria.value : "";
    const orden = selectOrden ? selectOrden.value : "";

    resultadoActual = ordenarProductos(filtrarProductos(texto, categoria, obtenerRangoPrecio()), orden);
    cantidadVisible = PRODUCTOS_POR_PAGINA;
    renderizarCatalogo();
}

// Muestra la página siguiente sin redibujar las tarjetas que ya están
function cargarMas() {
    const desde = cantidadVisible;
    cantidadVisible += PRODUCTOS_POR_PAGINA;
    renderizarCatalogo(desde);

    // Lleva el foco a la primera tarjeta nueva (útil con teclado)
    contenedor.children[desde]?.querySelector("a.btn-primary")?.focus({ preventScroll: true });
}

// Sugiere en los campos de precio el rango real del catálogo
function mostrarRangoDisponible() {
    if (productos.length === 0) return;
    const precios = productos.map(p => p.precio);
    if (inputPrecioMinimo) inputPrecioMinimo.placeholder = `Mín. ${Math.min(...precios).toLocaleString("es-UY")}`;
    if (inputPrecioMaximo) inputPrecioMaximo.placeholder = `Máx. ${Math.max(...precios).toLocaleString("es-UY")}`;
}

function inicializarEventos() {
    buscador?.addEventListener("input", aplicarFiltros);
    selectCategoria?.addEventListener("change", aplicarFiltros);
    selectOrden?.addEventListener("change", aplicarFiltros);
    inputPrecioMinimo?.addEventListener("input", aplicarFiltros);
    inputPrecioMaximo?.addEventListener("input", aplicarFiltros);
    btnCargarMas?.addEventListener("click", cargarMas);

    btnLimpiar?.addEventListener("click", () => {
        if (buscador) buscador.value = "";
        if (selectCategoria) selectCategoria.value = "";
        if (selectOrden) selectOrden.value = "";
        if (inputPrecioMinimo) inputPrecioMinimo.value = "";
        if (inputPrecioMaximo) inputPrecioMaximo.value = "";
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
    paginacion?.classList.add("d-none");
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
    mostrarRangoDisponible();
    habilitarFiltros(true);
    aplicarFiltros();
}

if (contenedor) {
    inicializarEventos();
    cargarCatalogo();
}