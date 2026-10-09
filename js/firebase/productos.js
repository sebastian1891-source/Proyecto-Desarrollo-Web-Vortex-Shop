// =========================================================
// PRODUCTOS EN CLOUD FIRESTORE
// ---------------------------------------------------------
// Todas las consultas a la colección "productos" pasan por acá.
// El catálogo, el detalle y el carrito usan estas funciones.
//
// Estructura de cada documento (id del documento = id del producto):
//   nombre, descripcion, categoria, precio, stock,
//   disponible (true/false), imagen, imagenes [], caracteristicas []
// =========================================================

import { db } from "./config.js";

import {
    collection,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const COLECCION_PRODUCTOS = "productos";

// Convierte un documento de Firestore en un objeto producto con
// valores por defecto, por si algún campo falta o vino mal cargado.
function convertirDocumento(snapshot) {
    const datos = snapshot.data();
    const imagenes = Array.isArray(datos.imagenes) ? datos.imagenes : [];

    return {
        id: snapshot.id,
        nombre: datos.nombre ?? "Producto sin nombre",
        descripcion: datos.descripcion ?? "",
        categoria: datos.categoria ?? "Sin categoría",
        precio: Number(datos.precio) || 0,
        stock: Math.max(0, Number(datos.stock) || 0),
        disponible: datos.disponible !== false,
        imagen: datos.imagen || imagenes[0] || "",
        imagenes,
        caracteristicas: Array.isArray(datos.caracteristicas) ? datos.caracteristicas : []
    };
}

// Todos los productos de la colección
export async function obtenerProductos() {
    const snapshot = await getDocs(collection(db, COLECCION_PRODUCTOS));
    return snapshot.docs.map(convertirDocumento);
}

// Un producto por su id (null si no existe)
export async function obtenerProductoPorId(idProducto) {
    if (!idProducto) return null;

    const snapshot = await getDoc(doc(db, COLECCION_PRODUCTOS, idProducto));
    return snapshot.exists() ? convertirDocumento(snapshot) : null;
}

// Productos de una categoría (para "Productos relacionados")
export async function obtenerProductosPorCategoria(categoria) {
    const consulta = query(collection(db, COLECCION_PRODUCTOS), where("categoria", "==", categoria));
    const snapshot = await getDocs(consulta);
    return snapshot.docs.map(convertirDocumento);
}

// Un producto se puede comprar si está marcado como disponible y tiene stock
export function sePuedeComprar(producto) {
    return Boolean(producto) && producto.disponible && producto.stock > 0;
}

// Sube (o sobrescribe) una lista de productos en una sola operación.
// Se usa en carga-inicial.html con el arreglo local.
export async function guardarProductos(listaProductos) {
    const lote = writeBatch(db);

    listaProductos.forEach(({ id, ...datos }) => {
        lote.set(doc(db, COLECCION_PRODUCTOS, id), datos);
    });

    await lote.commit();
}

// Mensaje comprensible cuando falla una consulta a Firestore
export function mensajeErrorProductos(error) {
    switch (error?.code) {
        case "permission-denied":
            return "No tenés permiso para realizar esta acción.";
        case "unavailable":
        case "deadline-exceeded":
            return "No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.";
        default:
            return "No se pudieron cargar los productos. Intentá de nuevo en unos minutos.";
    }
}
