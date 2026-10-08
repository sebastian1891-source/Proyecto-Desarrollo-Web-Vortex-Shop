// =========================================================
// CONFIGURACIÓN DE FIREBASE
// ---------------------------------------------------------
// Reemplazá los valores de firebaseConfig por los de tu proyecto.
// Los encontrás en la consola de Firebase:
// Configuración del proyecto (⚙️) > General > Tus apps > App web > "Configuración del SDK" (opción "Config").
//
// Estos datos NO son secretos: identifican al proyecto. Lo que protege la
// información son las reglas de seguridad de Firestore (ver README).
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBa3K5WmCJq89kGE5XBZ9cHZ2huCbZWwSw",
    authDomain: "vortex-shop-5d30b.firebaseapp.com",
    projectId: "vortex-shop-5d30b",
    storageBucket: "vortex-shop-5d30b.firebasestorage.app",
    messagingSenderId: "108890525633",
    appId: "1:108890525633:web:a849d4ab4c75d3cd106940"
};

// Se inicializa la app una sola vez y se exportan los servicios
// para que el resto de los archivos los importen desde acá.
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Nombre de la colección de Firestore donde se guarda un documento por usuario (id = uid)
export const COLECCION_USUARIOS = "usuarios";
