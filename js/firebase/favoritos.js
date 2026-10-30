// =========================================================
// FAVORITOS EN CLOUD FIRESTORE
// ---------------------------------------------------------
// Los favoritos de cada usuario se guardan en su propio documento
// usuarios/{uid}, en el campo "favoritos" (lista de ids de productos).
// Así se conservan entre dispositivos y no hace falta una colección nueva:
// las reglas ya permiten que cada usuario edite su documento (sin tocar el rol).
// =========================================================

import { db, COLECCION_USUARIOS } from "./config.js";

import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function obtenerFavoritos(uid) {
    const snapshot = await getDoc(doc(db, COLECCION_USUARIOS, uid));
    const lista = snapshot.exists() ? snapshot.data().favoritos : [];
    return Array.isArray(lista) ? lista : [];
}

// arrayUnion / arrayRemove agregan o quitan un id sin leer la lista
// completa y sin crear repetidos.
export async function agregarFavorito(uid, idProducto) {
    await updateDoc(doc(db, COLECCION_USUARIOS, uid), { favoritos: arrayUnion(idProducto) });
}

export async function quitarFavorito(uid, idProducto) {
    await updateDoc(doc(db, COLECCION_USUARIOS, uid), { favoritos: arrayRemove(idProducto) });
}
