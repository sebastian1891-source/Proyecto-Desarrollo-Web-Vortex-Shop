// =========================================================
// ROLES DE USUARIO (Sprint 4)
// ---------------------------------------------------------
// El sitio distingue dos roles, guardados en el campo "rol" del
// documento usuarios/{uid} de Firestore:
//   - "cliente":       se asigna automáticamente al registrarse.
//   - "administrador": se asigna MANUALMENTE desde la consola de Firebase.
// Todas las páginas consultan el rol con estas funciones, así el
// nombre de cada rol está escrito en un solo lugar.
//
// Ocultar un link o redirigir desde JavaScript mejora la experiencia,
// pero la protección real de los datos la dan las reglas de Firestore
// (firestore.rules), que verifican el mismo campo "rol".
// =========================================================

import { obtenerUsuarioActual, obtenerDatosUsuario } from "./auth.js";
import { guardarMensajePendiente } from "../mensajes.js";

export const ROLES = Object.freeze({
    CLIENTE: "cliente",
    ADMINISTRADOR: "administrador"
});

// Devuelve el rol del usuario guardado en Firestore.
// Si el documento no existe o no tiene rol, se lo trata como cliente
// (nunca se otorgan permisos de administrador por defecto).
export async function obtenerRolUsuario(uid) {
    const datos = await obtenerDatosUsuario(uid);
    return datos?.rol === ROLES.ADMINISTRADOR ? ROLES.ADMINISTRADOR : ROLES.CLIENTE;
}

export async function esAdministrador(usuario) {
    if (!usuario) return false;
    return (await obtenerRolUsuario(usuario.uid)) === ROLES.ADMINISTRADOR;
}

// Protege una página de administración. Se llama al comienzo del
// script de la página, antes de mostrar cualquier contenido:
//   - Sin sesión: redirige al login y, al ingresar, vuelve a esta página.
//   - Con sesión pero sin rol administrador: redirige al inicio con un aviso.
//   - Si no se pudo consultar el rol: redirige al inicio con un aviso.
// Devuelve el usuario si es administrador, o null si se lo redirigió.
// Funciona también si el usuario escribe la URL directamente.
export async function exigirAdministrador(paginaActual) {
    const usuario = await obtenerUsuarioActual();

    if (!usuario) {
        guardarMensajePendiente("Iniciá sesión con una cuenta de administrador para acceder a esa sección.");
        window.location.replace(`login.html?redirect=${paginaActual}`);
        return null;
    }

    try {
        if (await esAdministrador(usuario)) return usuario;

        guardarMensajePendiente("No tenés permisos para acceder al panel de administración. Esa sección es solo para administradores.");
    } catch (error) {
        console.error(error);
        guardarMensajePendiente("No pudimos verificar tus permisos. Revisá tu conexión e intentá de nuevo.");
    }

    window.location.replace("index.html");
    return null;
}
