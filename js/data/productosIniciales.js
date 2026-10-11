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
    },
    {
        id: "p5",
        nombre: "Samsung Galaxy S24 128GB",
        descripcion: "Pantalla brillante, cámara versátil e inteligencia artificial integrada.",
        categoria: "Celulares",
        precio: 42990,
        stock: 7,
        disponible: true,
        imagen: "img/SamsungGalaxyS24.jpg",
        imagenes: ["img/SamsungGalaxyS24.jpg"],
        caracteristicas: [
            "Pantalla Dynamic AMOLED 2X de 6.2\"",
            "8GB de RAM y 128GB de almacenamiento",
            "Cámara principal de 50MP",
            "Batería de 4000 mAh con carga rápida"
        ]
    },
    {
        id: "p6",
        nombre: "Motorola Moto G84 5G 256GB",
        descripcion: "Gran batería y conectividad 5G a un precio accesible.",
        categoria: "Celulares",
        precio: 13990,
        stock: 12,
        disponible: true,
        imagen: "img/MotorolaMotoG84.jpg",
        imagenes: ["img/MotorolaMotoG84.jpg"],
        caracteristicas: [
            "Pantalla pOLED de 6.5\" a 120Hz",
            "12GB de RAM y 256GB de almacenamiento",
            "Cámara de 50MP con estabilización óptica",
            "Batería de 5000 mAh"
        ]
    },
    {
        id: "p7",
        nombre: "Notebook Lenovo IdeaPad Slim 3",
        descripcion: "Liviana y rápida para estudiar y trabajar todo el día.",
        categoria: "Computación",
        precio: 27990,
        stock: 6,
        disponible: true,
        imagen: "img/LenovoIdeaPadSlim3.jpg",
        imagenes: ["img/LenovoIdeaPadSlim3.jpg"],
        caracteristicas: [
            "Procesador AMD Ryzen 5 7520U",
            "8GB de RAM y SSD de 512GB",
            "Pantalla 15.6\" Full HD",
            "Peso de 1.6 kg"
        ]
    },
    {
        id: "p8",
        nombre: "Monitor LG 27\" Full HD IPS",
        descripcion: "Colores precisos y bordes finos para tu escritorio.",
        categoria: "Computación",
        precio: 9490,
        stock: 10,
        disponible: true,
        imagen: "img/MonitorLG27.jpg",
        imagenes: ["img/MonitorLG27.jpg"],
        caracteristicas: [
            "Panel IPS de 27\" Full HD",
            "Frecuencia de 75Hz con AMD FreeSync",
            "Entradas HDMI y VGA",
            "Diseño sin bordes en tres lados"
        ]
    },
    {
        id: "p9",
        nombre: "Consola PlayStation 5 Slim",
        descripcion: "Juegos de nueva generación con carga ultrarrápida.",
        categoria: "Gaming",
        precio: 32990,
        stock: 4,
        disponible: true,
        imagen: "img/PlayStation5Slim.jpg",
        imagenes: ["img/PlayStation5Slim.jpg"],
        caracteristicas: [
            "SSD de 1TB",
            "Gráficos en 4K hasta 120 fps",
            "Lector de discos incluido",
            "Joystick DualSense incluido"
        ]
    },
    {
        id: "p10",
        nombre: "Joystick DualSense PS5",
        descripcion: "Respuesta háptica y gatillos adaptativos para sentir cada juego.",
        categoria: "Gaming",
        precio: 3990,
        stock: 14,
        disponible: true,
        imagen: "img/JoystickDualSense.jpg",
        imagenes: ["img/JoystickDualSense.jpg"],
        caracteristicas: [
            "Respuesta háptica",
            "Gatillos adaptativos",
            "Micrófono integrado",
            "Batería recargable por USB-C"
        ]
    },
    {
        id: "p11",
        nombre: "Nintendo Switch OLED",
        descripcion: "Jugá en la tele o en modo portátil con una pantalla OLED vibrante.",
        categoria: "Gaming",
        precio: 21990,
        stock: 5,
        disponible: true,
        imagen: "img/NintendoSwitchOLED.jpg",
        imagenes: ["img/NintendoSwitchOLED.jpg"],
        caracteristicas: [
            "Pantalla OLED de 7\"",
            "64GB de almacenamiento interno",
            "Base con puerto LAN",
            "Joy-Con incluidos"
        ]
    },
    {
        id: "p12",
        nombre: "Mouse Gamer Logitech G502 HERO",
        descripcion: "Precisión extrema y botones programables para cada partida.",
        categoria: "Periféricos",
        precio: 2690,
        stock: 20,
        disponible: true,
        imagen: "img/MouseLogitechG502.jpg",
        imagenes: ["img/MouseLogitechG502.jpg"],
        caracteristicas: [
            "Sensor HERO de 25.600 DPI",
            "11 botones programables",
            "Pesas ajustables",
            "Iluminación RGB LIGHTSYNC"
        ]
    },
    {
        id: "p13",
        nombre: "Webcam Logitech C920 HD Pro",
        descripcion: "Videollamadas y clases en Full HD con sonido estéreo.",
        categoria: "Periféricos",
        precio: 3290,
        stock: 9,
        disponible: true,
        imagen: "img/WebcamLogitechC920.jpg",
        imagenes: ["img/WebcamLogitechC920.jpg"],
        caracteristicas: [
            "Video Full HD 1080p a 30 fps",
            "Enfoque automático",
            "Dos micrófonos estéreo",
            "Conexión USB"
        ]
    },
    {
        id: "p14",
        nombre: "Mousepad Gamer XL RGB Redragon",
        descripcion: "Superficie amplia y suave con iluminación RGB en los bordes.",
        categoria: "Periféricos",
        precio: 1290,
        stock: 25,
        disponible: true,
        imagen: "img/MousepadRedragonRGB.jpg",
        imagenes: ["img/MousepadRedragonRGB.jpg"],
        caracteristicas: [
            "Tamaño 80 x 30 cm",
            "Iluminación RGB con varios modos",
            "Base de goma antideslizante",
            "Bordes cosidos"
        ]
    },
    {
        id: "p15",
        nombre: "Cargador rápido Samsung USB-C 25W",
        descripcion: "Carga rápida y segura para tu celular.",
        categoria: "Accesorios",
        precio: 890,
        stock: 30,
        disponible: true,
        imagen: "img/CargadorSamsung25W.jpg",
        imagenes: ["img/CargadorSamsung25W.jpg"],
        caracteristicas: [
            "Potencia de 25W",
            "Puerto USB-C",
            "Compatible con Super Fast Charging",
            "Protección contra sobrecarga"
        ]
    },
    {
        id: "p16",
        nombre: "Disco SSD externo Samsung T7 1TB",
        descripcion: "Guardá y transportá tus archivos a alta velocidad.",
        categoria: "Accesorios",
        precio: 5490,
        stock: 8,
        disponible: true,
        imagen: "img/SSDSamsungT7.jpg",
        imagenes: ["img/SSDSamsungT7.jpg"],
        caracteristicas: [
            "Capacidad de 1TB",
            "Velocidad de hasta 1050 MB/s",
            "Conexión USB 3.2 tipo C",
            "Cuerpo de aluminio resistente a golpes"
        ]
    }
];
