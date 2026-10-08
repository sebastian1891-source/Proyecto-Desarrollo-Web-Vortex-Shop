// =========================================================
// AUTENTICACIÓN
// ---------------------------------------------------------
// Agrupa todas las operaciones con Firebase Authentication y el
// documento del usuario en Firestore. Las páginas (login, registro,
// perfil, navbar) usan estas funciones en vez de llamar a Firebase directo.
// =========================================================

import { auth, db, COLECCION_USUARIOS } from "./config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Crea la cuenta en Authentication y luego el documento en Firestore
// asociado al uid del nuevo usuario.
export async function registrarUsuario({ nombre, apellido, email, password }) {
    await setPersistence(auth, browserLocalPersistence);

    const credencial = await createUserWithEmailAndPassword(auth, email, password);
    const usuario = credencial.user;

    // Nombre visible (se usa en el navbar sin tener que leer Firestore)
    await updateProfile(usuario, { displayName: `${nombre} ${apellido}` });

    // Documento usuarios/{uid}
    await setDoc(doc(db, COLECCION_USUARIOS, usuario.uid), {
        uid: usuario.uid,
        nombre,
        apellido,
        email,
        rol: "cliente",
        fechaRegistro: serverTimestamp()
    });

    return usuario;
}

// Inicia sesión. browserLocalPersistence hace que la sesión
// se mantenga al recargar la página o cerrar el navegador.
export async function iniciarSesion(email, password) {
    await setPersistence(auth, browserLocalPersistence);
    const credencial = await signInWithEmailAndPassword(auth, email, password);
    return credencial.user;
}

export function cerrarSesion() {
    return signOut(auth);
}

// Ejecuta el callback cada vez que cambia el estado de la sesión
// (al cargar la página, al iniciar sesión y al cerrarla).
export function observarSesion(callback) {
    return onAuthStateChanged(auth, callback);
}

// Espera a que Firebase recupere la sesión guardada y devuelve
// el usuario actual (o null si no hay nadie logueado).
export async function obtenerUsuarioActual() {
    await auth.authStateReady();
    return auth.currentUser;
}

// Lee el documento usuarios/{uid}. Devuelve null si no existe.
export async function obtenerDatosUsuario(uid) {
    const snapshot = await getDoc(doc(db, COLECCION_USUARIOS, uid));
    return snapshot.exists() ? snapshot.data() : null;
}

// Convierte los códigos de error de Firebase en mensajes comprensibles
export function traducirError(error) {
    const mensajes = {
        "auth/email-already-in-use": "Ya existe una cuenta registrada con ese correo.",
        "auth/invalid-email": "El correo electrónico no es válido.",
        "auth/weak-password": "La contraseña es muy débil. Usá al menos 6 caracteres.",
        "auth/missing-password": "Ingresá tu contraseña.",
        "auth/invalid-credential": "El correo o la contraseña son incorrectos.",
        "auth/user-not-found": "El correo o la contraseña son incorrectos.",
        "auth/wrong-password": "El correo o la contraseña son incorrectos.",
        "auth/user-disabled": "Esta cuenta fue deshabilitada.",
        "auth/too-many-requests": "Demasiados intentos fallidos. Esperá unos minutos y volvé a intentar.",
        "auth/network-request-failed": "No hay conexión. Revisá tu internet e intentá de nuevo.",
        "auth/operation-not-allowed": "El registro con correo y contraseña no está habilitado en Firebase.",
        "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "Falta configurar Firebase: revisá los datos en js/firebase/config.js.",
        "auth/invalid-api-key": "Falta configurar Firebase: revisá los datos en js/firebase/config.js.",
        "permission-denied": "No se pudieron guardar tus datos. Revisá las reglas de Firestore."
    };

    return mensajes[error?.code] || "Ocurrió un error inesperado. Intentá de nuevo.";
}
