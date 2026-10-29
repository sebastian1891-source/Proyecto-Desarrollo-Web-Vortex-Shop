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
    writeBatch,
    addDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const COLECCION_PRODUCTOS = "productos";

// Categorías que se ofrecen al crear o editar un producto en el panel
export const CATEGORIAS = ["Accesorios", "Celulares", "Computación", "Gaming", "Periféricos"];

// Imagen que se usa cuando un producto no tiene una propia
export const IMAGEN_POR_DEFECTO = "img/sin-imagen.svg";

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

// ---------- PANEL ADMINISTRATIVO (Sprint 4) ----------
// Las reglas de Firestore solo permiten crear y editar productos
// completos a usuarios con rol "administrador".

// Crea un producto nuevo. Firestore genera el id del documento.
// Devuelve el id creado (sirve para el link "Ver en el catálogo").
export async function crearProducto(datos) {
    const imagen = datos.imagen || IMAGEN_POR_DEFECTO;

    const referencia = await addDoc(collection(db, COLECCION_PRODUCTOS), {
        ...datos,
        imagen,
        imagenes: [imagen],
        fechaCreacion: serverTimestamp()
    });

    return referencia.id;
}

// Guarda los cambios de un producto existente. Se usa updateDoc
// (no setDoc) para no borrar los campos que el formulario no edita.
// Si cambia la imagen principal, se reemplaza la primera del carrusel
// y se conservan las demás.
export async function actualizarProducto(idProducto, datos, imagenesActuales = []) {
    const imagen = datos.imagen || IMAGEN_POR_DEFECTO;
    const imagenes = [imagen, ...imagenesActuales.slice(1).filter(img => img !== imagen)];

    await updateDoc(doc(db, COLECCION_PRODUCTOS, idProducto), {
        ...datos,
        imagen,
        imagenes,
        fechaActualizacion: serverTimestamp()
    });
}

// Activa o desactiva un producto sin borrarlo. Un producto desactivado
// sigue en el catálogo como "No disponible" y no se puede comprar.
export async function cambiarDisponibilidad(idProducto, disponible) {
    await updateDoc(doc(db, COLECCION_PRODUCTOS, idProducto), {
        disponible,
        fechaActualizacion: serverTimestamp()
    });
}

// Elimina un producto y sus valoraciones en una sola operación.
// Los pedidos ya realizados no se tocan: guardan su propia copia
// del nombre y el precio de cada producto.
export async function eliminarProducto(idProducto) {
    const valoraciones = await getDocs(
        query(collection(db, "valoraciones"), where("idProducto", "==", idProducto))
    );

    const lote = writeBatch(db);
    valoraciones.docs.forEach(documento => lote.delete(documento.ref));
    lote.delete(doc(db, COLECCION_PRODUCTOS, idProducto));
    await lote.commit();

    return valoraciones.size;
}

// Mensaje comprensible cuando falla una consulta a Firestore
export function mensajeErrorProductos(error) {
    switch (error?.code) {
        case "permission-denied":
            return "No tenés permiso para realizar esta acción. Verificá que tu cuenta tenga el rol administrador y que las reglas de Firestore estén publicadas.";
        case "not-found":
            return "El producto ya no existe en Firestore. Actualizá la lista.";
        case "unavailable":
        case "deadline-exceeded":
            return "No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.";
        default:
            return "No se pudieron cargar los productos. Intentá de nuevo en unos minutos.";
    }
}
