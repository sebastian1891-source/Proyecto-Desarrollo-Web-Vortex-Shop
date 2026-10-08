# Identidad del proyecto

**Nombre del proyecto**: Vortex Shop

**Nombre del estudiante**: Sebastián Camacho

**Descripción del e-commerce**: 
Vortex Shop es un sitio web de comercio electrónico especializado en productos de tecnología y electrónica. La tienda está orientada a ofrecer una experiencia de navegación moderna, clara y accesible, permitiendo a los usuarios conocer diferentes categorías de productos tecnológicos.
El proyecto se desarrolla de forma incremental mediante sprints, ampliando progresivamente las funcionalidades del sistema sin eliminar las implementadas en etapas anteriores.

**Temática**: Tecnología y electrónica

**Productos**: Celulares, computadoras, periféricos, componentes y accesorios tecnológicos.

**Público objetivo**: Jóvenes y adultos interesados en tecnología, gaming, informática y dispositivos electrónicos.

**Tecnologías utilizadas**: 
Durante el Sprint 1 se utilizaron las siguientes tecnologías:
HTML5: estructura semántica de la página.
CSS3: personalización de la identidad visual y diseño responsive.
Bootstrap 5.3.3: sistema de grillas, navbar, botones, modal y componentes responsivos.
Bootstrap Icons: íconos utilizados en la identidad visual y distintas secciones.
Git: control de versiones.
GitHub: almacenamiento remoto del repositorio y seguimiento de los commits.
Visual Studio Code: entorno de desarrollo.
Live Server: ejecución local del proyecto durante el desarrollo.

**Estilo de comunicación**: Moderno, directo, tecnológico y accesible

**Colores principales**: Azul oscuro, celeste y blanco

**Tipografía**: Inter

**Identidad visual**: Logotipo con el nombre "Vortex Shop" acompañado de un ícono de computadora

**Categorías iniciales**: Celulares, Computación, Gaming, Periféricos y Accesorios.

**Instrucciones de ejecución**:
Clonar o descargar el repositorio del proyecto.
Abrir la carpeta del proyecto en Visual Studio Code.
Verificar que la extensión Live Server esté instalada.
Hacer clic derecho sobre el archivo index.html.
Seleccionar la opción Open with Live Server.
El sitio se abrirá en el navegador predeterminado.

**Funcionalidades desarrolladas en el Sprint 1**
Durante el Sprint 1 se desarrollaron las siguientes funcionalidades y características:

Personalización completa de la identidad visual del proyecto.
Cambio del nombre de la tienda a Vortex Shop.
Incorporación de una marca visual con ícono de computadora.
Definición de una paleta de colores coherente basada en azul oscuro, celeste y blanco.
Aplicación de la tipografía Inter.
Personalización del navbar.
Creación de una sección hero adaptada a la temática del e-commerce.
Incorporación de productos destacados estáticos.
Creación de tarjetas de productos utilizando Bootstrap.
Incorporación de una sección de beneficios.
Personalización del footer.
Uso de Bootstrap para la estructura y los componentes.
Implementación de diseño responsive.
Pruebas del sitio en tamaños aproximados de:
375 px (teléfono),
768 px (tablet),
1366 px (escritorio).
Verificación de la correcta reorganización de las tarjetas y adaptación del navbar, imágenes, botones y textos.

**Decisiones de diseño adoptadas**:
Para mantener una identidad visual uniforme en toda la aplicación se adoptaron las siguientes decisiones:

Color principal: azul oscuro (#0b1f3a), utilizado en el navbar, secciones destacadas y elementos estructurales.
Color secundario: celeste (#38bdf8), utilizado en botones, íconos y elementos de interacción.
Color de acento: blanco, utilizado para superficies y contraste.
Tipografía: Inter, elegida por su legibilidad y estética moderna.
Botones: bordes redondeados y efectos hover sutiles para reforzar la interacción.
Tarjetas: fondos blancos, bordes suaves, esquinas redondeadas y sombras discretas.
Fondos: tonos claros para el contenido principal y azul oscuro para las secciones que requieren mayor contraste.
Diseño responsive: se utilizaron las grillas y componentes de Bootstrap junto con media queries en CSS para adaptar la interfaz a teléfonos, tablets y escritorios.

**Funcionalidades incorporadas en el Sprint 2**
- Catálogo generado dinámicamente desde JavaScript (antes escrito a mano en el HTML).
- Buscador de productos por nombre y filtro por categoría, combinables entre sí, sin recargar la página.
- Ordenamiento por nombre y por precio, y contador de resultados encontrados.
- Detalle de producto dinámico mediante una única página (`producto.html?id=`).
- Carrito de compras: agregar, quitar y modificar cantidades, con control de stock, subtotal, total y envío simulado.
- Carrusel de imágenes, características técnicas, productos relacionados y valoraciones/comentarios en el detalle de producto.

**Correcciones posteriores a la devolución del Sprint 2**
- Si el carrito ya tiene la cantidad máxima disponible de un producto, al intentar agregarlo de nuevo se muestra un aviso de que no se pueden agregar más unidades (antes decía que se había agregado).
- Se quitó la opción "Producto" del menú y del footer: la ficha se abre desde "Ver producto" en el catálogo, y en ella el menú resalta "Catálogo".
- El carrito muestra el precio unitario de cada artículo además del subtotal.
- Desde el carrito se puede volver al producto (clic en la imagen o el nombre) y seguir comprando con el botón "Seguir comprando".
- El iPhone 16 Pro Max tiene dos imágenes en el carrusel de su ficha.

**Representación de los productos**
Cada producto es un objeto dentro de un arreglo (`productos`), con los campos: `id`, `nombre`, `descripcion`, `categoria`, `precio`, `stock`, `imagen`, `caracteristicas` y, de forma opcional, `imagenes` (arreglo de fotos para el carrusel de la ficha).

**Organización de los archivos JavaScript**
- `js/productos.js`: arreglo de productos, catálogo dinámico, búsqueda, filtro y orden.
- `js/carrito.js`: lógica del carrito de compras.
- `js/detalleProducto.js`: ficha dinámica de producto y productos relacionados.
- `js/valoraciones.js`: valoraciones y comentarios.
- `js/base.js`: sin cambios respecto al Sprint 1.

**Información guardada en LocalStorage**
- Carrito de compras: `id` de cada producto agregado y su cantidad.
- Valoraciones: estrellas (1 a 5) y comentario de cada producto, agrupados por `id` de producto.

**Funcionalidades pendientes para el siguiente sprint**
- Checkout y confirmación real del pedido.
- Inicio de sesión y registro de usuarios.
- Sección "Mi perfil" funcional.
- Panel administrativo funcional.
- Gestión y consulta de estado de pedidos.