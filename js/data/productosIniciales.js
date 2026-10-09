// =========================================================
// PRODUCTOS INICIALES (respaldo / carga inicial)
// ---------------------------------------------------------
// Este arreglo YA NO es la fuente del catálogo: los productos se leen
// de la colección "productos" de Cloud Firestore.
// Se conserva solo para cargar los datos por primera vez desde
// carga-inicial.html (o para restaurarlos si se borran).
// El "id" se usa como id del documento en Firestore, así los
// carritos guardados en LocalStorage siguen funcionando.
// =========================================================

export const productosIniciales = [
    {
        id: "p1",
        nombre: "Auriculares inalámbricos Aiwa Awknc1090",
        descripcion: "Sonido envolvente y conexión inalámbrica.",
        categoria: "Accesorios",
        precio: 2490,
        stock: 10,
        disponible: true,
        imagen: "img/Auriculares1.png",
        imagenes: ["img/Auriculares1.png"],
        caracteristicas: [
            "Bluetooth 5.0",
            "Batería de hasta 20 horas",
            "Micrófono integrado",
            "Controles táctiles"
        ]
    },
    {
        id: "p2",
        nombre: "Iphone 16 Pro Max",
        descripcion: "Potencia y rendimiento para todos los días.",
        categoria: "Celulares",
        precio: 59990,
        stock: 5,
        disponible: true,
        imagen: "img/Iphone16ProMax1.jpg",
        imagenes: [
            "img/Iphone16ProMax1.jpg",
            "img/ImagenPrincipal1.jpg"
        ],
        caracteristicas: [
            "Pantalla OLED de 6.9\"",
            "Chip A18 Pro",
            "Cámara triple de 48MP",
            "Resistencia al agua IP68"
        ]
    },
    {
        id: "p3",
        nombre: "Notebook Pro",
        descripcion: "Rendimiento y movilidad para tus proyectos.",
        categoria: "Computación",
        precio: 34990,
        stock: 8,
        disponible: true,
        imagen: "img/Laptop1.png",
        imagenes: ["img/Laptop1.png"],
        caracteristicas: [
            "Procesador Intel Core i7",
            "16GB de memoria RAM",
            "SSD de 512GB",
            "Pantalla 15.6\" Full HD"
        ]
    },
    {
        id: "p4",
        nombre: "Teclado Mecánico RGB MKMinibes Switch Outemu Blue",
        descripcion: "Precisión y comodidad para trabajar y jugar.",
        categoria: "Periféricos",
        precio: 3750,
        stock: 15,
        disponible: true,
        imagen: "img/TecladoMecanico1.png",
        imagenes: ["img/TecladoMecanico1.png"],
        caracteristicas: [
            "Switches Outemu Blue",
            "Retroiluminación RGB",
            "Conexión USB-C",
            "Teclas anti-ghosting"
        ]
    }
];
