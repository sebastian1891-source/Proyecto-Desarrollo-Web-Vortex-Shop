// =========================================================
// VALORACIONES EN CLOUD FIRESTORE
// ---------------------------------------------------------
// Colección "valoraciones". Cada usuario puede dejar UNA opinión
// por producto: el id del documento es "<idProducto>_<uid>", así
// si vuelve a opinar se actualiza la que ya tenía.
//
// Estructura: idProducto, uid, autor, estrellas (1 a 5), comentario, fecha
// =========================================================

import { db } from "./config.js";

import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const COLECCION_VALORACIONES = "valoraciones";
export const LARGO_MINIMO_COMENTARIO = 5;
export const LARGO_MAXIMO_COMENTARIO = 500;

// Valida la puntuación y el contenido. Devuelve "" si está todo bien.
export function validarValoracion(estrellas, comentario) {
    if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) {
        return "Elegí de 1 a 5 estrellas.";
    }

    const texto = comentario.trim();
    if (texto.length < LARGO_MINIMO_COMENTARIO) {
        return `Escribí un comentario de al menos ${LARGO_MINIMO_COMENTARIO} caracteres.`;
    }
    if (texto.length > LARGO_MAXIMO_COMENTARIO) {
        return `El comentario no puede superar los ${LARGO_MAXIMO_COMENTARIO} caracteres.`;
    }
    return "";
}

// Nombre que se muestra junto a la opinión: "Sebastián C."
function nombrePublico(usuario) {
    if (!usuario.displayName) return usuario.email.split("@")[0];

    const [nombre, apellido = ""] = usuario.displayName.split(" ");
    return apellido ? `${nombre} ${apellido.charAt(0)}.` : nombre;
}

// Opiniones de un producto, de la más nueva a la más vieja
export async function obtenerValoraciones(idProducto) {
    const consulta = query(collection(db, COLECCION_VALORACIONES), where("idProducto", "==", idProducto));
    const snapshot = await getDocs(consulta);

    return snapshot.docs
        .map(documento => ({ id: documento.id, ...documento.data() }))
        .sort((a, b) => (b.fecha?.toMillis?.() ?? 0) - (a.fecha?.toMillis?.() ?? 0));
}

// Crea o actualiza la opinión del usuario autenticado sobre un producto
export async function guardarValoracion(usuario, idProducto, estrellas, comentario) {
    const error = validarValoracion(estrellas, comentario);
    if (error) throw new Error(error);

    await setDoc(doc(db, COLECCION_VALORACIONES, `${idProducto}_${usuario.uid}`), {
        idProducto,
        uid: usuario.uid,
        autor: nombrePublico(usuario),
        estrellas,
        comentario: comentario.trim(),
        fecha: serverTimestamp()
    });
}


// ---------- PANEL ADMINISTRATIVO ----------
// Todas las opiniones de todos los productos, de la más nueva a la más vieja
export async function obtenerTodasLasValoraciones() {
    const snapshot = await getDocs(collection(db, COLECCION_VALORACIONES));

    return snapshot.docs
        .map(documento => ({ id: documento.id, ...documento.data() }))
        .sort((a, b) => (b.fecha?.toMillis?.() ?? 0) - (a.fecha?.toMillis?.() ?? 0));
}

// Elimina una opinión (las reglas lo permiten al autor o a un administrador)
export async function eliminarValoracion(idValoracion) {
    await deleteDoc(doc(db, COLECCION_VALORACIONES, idValoracion));
}
