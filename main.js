document.addEventListener('DOMContentLoaded', function () {
    const productos = document.querySelectorAll('.producto');
    const carritoLista = document.getElementById('carritoLista');
    const totalPagar = document.getElementById('totalPagar');
    const finalizarBtn = document.getElementById('finalizarBtn');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Función para agregar un producto al carrito
    function agregarAlCarrito(nombre, precio) {
        const productoExistente = carrito.find(item => item.nombre === nombre);
        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            carrito.push({ nombre, precio, cantidad: 1 });
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
    }

    // Función para eliminar un producto del carrito
    function eliminarDelCarrito(nombre, cantidad) {
        cantidad = parseInt(cantidad);
              
        const productoExistente = carrito.find(item => item.nombre === nombre);
        if (productoExistente) {
            productoExistente.cantidad -= cantidad;
            if (productoExistente.cantidad <= 0) {
                carrito = carrito.filter(item => item.nombre !== nombre);
            }
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
    }  

    // Función para renderizar el carrito
    function renderizarCarrito() {
        carritoLista.innerHTML = '';
        let total = 0;
        carrito.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.nombre} x ${item.cantidad} - $${item.precio * item.cantidad}`;
            carritoLista.appendChild(listItem);
            // Botón para eliminar del carrito
            const eliminarBtn = document.createElement('button');
            eliminarBtn.textContent = 'Eliminar';
            eliminarBtn.addEventListener('click', () => {
                const cantidad = prompt(`Ingrese la cantidad de ${item.nombre} a eliminar:`);
                if (cantidad && !isNaN(cantidad)) {
                    eliminarDelCarrito(item.nombre, parseInt(cantidad));
                }
            });
            listItem.appendChild(eliminarBtn);
            total += item.precio * item.cantidad;
        });
        totalPagar.textContent = `Total a pagar: $${total}`;
    }

    // Evento para agregar un producto al carrito
    productos.forEach(producto => {
        const agregarBtn = producto.querySelector('.agregarBtn');
        agregarBtn.addEventListener('click', () => {
            const nombre = agregarBtn.getAttribute('data-nombre');
            const precio = parseInt(producto.querySelector('p:nth-child(3)').textContent.substring(1));
            agregarAlCarrito(nombre, precio);
        });
    });

    // Evento para finalizar la compra
    finalizarBtn.addEventListener('click', () => {
        if (carrito.length === 0) {
            alert('Su carrito está vacío. Agregue productos para continuar.');
        } else {
            const precioTotal = calcularPrecioTotal();
            const confirmarCompra = confirm(`Está a punto de confirmar su pago por $${precioTotal}. ¿Está seguro de su compra?`);
            if (confirmarCompra) {
                alert('¡Muchas gracias por su compra! Vuelva pronto.');
                carrito = [];
                localStorage.removeItem('carrito');
                renderizarCarrito();
            }
        }
    });

    // Función para calcular el precio total del carrito
    function calcularPrecioTotal() {
        return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    // Verificar si hay un carrito guardado en el localStorage al cargar la página
    renderizarCarrito();
});

