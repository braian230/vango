// contenedor donde se dibujaran los productos
const products = document.getElementById("prods");
// accede a los elementos de la plantilla
const templateCard = document.querySelector("#template-card").content;
// items del carrito
const items = document.getElementById("items");
// footer carrito
const footer = document.getElementById("footer");
// template cart-footer
const templateCartFooter = document.querySelector("#template-cart-footer").content;
// template cart-item
const templateCartItem = document.querySelector("#template-cart-item").content;
// fragment
const fragment = document.createDocumentFragment();
// obj carrito
let carrito = {};

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("carrito")) {
        carrito = JSON.parse(localStorage.getItem("carrito"));
    }
    fetchProds();
    drawCart(carrito);
});

//Datos JSON local 

const fetchProds = async () => {
    try {
        const res = await fetch('apiacero.json');
        const data = await res.json();
        drawCards(data);
    } catch (error) {
        console.error(error);
    }
}

const drawCards = (prods) => {
    prods.forEach((prod) => {
        // titulo
        templateCard.querySelector("h5").textContent = prod.title;

        // parrafo
        templateCard.querySelector("p").textContent = prod.precio;

        // imagen
        templateCard.querySelector("img").setAttribute("src", prod.img);

        // texto alternativo
        templateCard.querySelector("img").setAttribute("title", prod.title);

        // settear id a boton
        templateCard.querySelector("button").setAttribute("id", `btn-${prod.id}`);

        // para no mutar el template
        const clone = templateCard.cloneNode(true);

        // agregar al fragment
        fragment.appendChild(clone);
    });

    // agregar fragment al dom
    products.appendChild(fragment);

    prods.forEach((prod) => {
        // event listener boton comprar
        document.getElementById(`btn-${prod.id}`).addEventListener("click", () => {
            addToCar(prod);
        });
    });
};

const addToCar = (prod) => {
    let quantity = 1;
    // si ya se agrego al carrito aumente la cantidad
    if (carrito.hasOwnProperty(prod.id)) {
        quantity = carrito[prod.id].quantity + 1;
    }
    carrito[prod.id] = { ...prod, quantity }
    // guardar productos del carrito en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));
    //Sweet Alert
    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Añadiste un producto al carrito',
        showConfirmButton: false,
        timer: 1500
      })
    drawCart();
};

const drawCart = () => {
    items.innerHTML = null;

    Object.values(carrito).forEach((prod) => {

        // id
        templateCartItem.querySelector("th").textContent = prod.id;

        // nombre prod
        templateCartItem.querySelectorAll("td")[0].textContent = prod.title

        // cantidad
        templateCartItem.querySelectorAll("td")[1].textContent = prod.quantity

        // settear id btn aumentar cantidad
        templateCartItem.querySelector(".btn-primary").setAttribute("id", `increase-${prod.id}`);

        // settear id btn disminuir cantidad
        templateCartItem.querySelector(".btn-danger").setAttribute("id", `decrease-${prod.id}`);

        // subtotal
        templateCartItem.querySelector("span").textContent = prod.quantity * prod.precio;

        // clonar template e incluir en el fragment
        const clone = templateCartItem.cloneNode(true);
        fragment.appendChild(clone);
    });
    // agregar al dom
    items.appendChild(fragment);

    // dibujar footer segun si hay productos en el carrito o no
    drawFooter();

    // settear eventlistener a botones aumentar y reducir cantidad
    Object.values(carrito).forEach((prod) => {
        document.getElementById(`increase-${prod.id}`).addEventListener("click", () => btnAction(false, prod));
        document.getElementById(`decrease-${prod.id}`).addEventListener("click", () => btnAction(true, prod));
    });

};

const drawFooter = () => {
    footer.innerHTML = null;
    // carrito esta vacio
    if (Object.keys(carrito).length === 0) {
        // agregar mensaje de carrito vacio
        footer.innerHTML = '<th scope="row" colspan="5" class="text-danger">Carrito vacío - comience a comprar!</th>';
    } else {
        // se obtiene cuantos productos se han agregado al carrito
        const totalQuantity = Object.values(carrito).reduce((acc, { quantity }) => acc + quantity, 0);

        // se obtiene el valor total de los productos en el carrito
        const totalValue = Object.values(carrito).reduce((acc, { quantity, precio }) => acc + quantity * precio, 0);

        // se establece el valor del 'td' correspondiente a la cantidad
        templateCartFooter.querySelectorAll("td")[0].textContent = totalQuantity;

        // se establece el valor del 'td' correspondiente al valor total
        templateCartFooter.querySelector("span").textContent = totalValue;

        // setter id btn limpiar carrito
        templateCartFooter.querySelector("button").setAttribute("id", "clean-cart");

        // clonar template
        const clone = templateCartFooter.cloneNode(true);

        // agregar clon a fragmento
        fragment.appendChild(clone);

        // agregar al dom
        footer.appendChild(fragment);

        // event listener boton limpiar carrito (se debe realizar despues de cargarse en el dom)
        document.getElementById("clean-cart").addEventListener("click", () => cleanCart());
    }
};

const cleanCart = () => {
    // limpiar el obj carrito
    carrito = {};
    // limpiar localStorage
    localStorage.clear();
    drawCart();
}

const btnAction = (decrease, prod) => {
    if (decrease === true) {
        const newQuantity = prod.quantity - 1;
        // si el producto esta out of stock, eliminalo
        if (newQuantity <= 0) {
            delete carrito[prod.id];
        } else {
            // si no, actualizar producto
            carrito[prod.id] = { ...prod };
            carrito[prod.id].quantity = prod.quantity - 1;
        }
    } else {
        // actualizar producto
        carrito[prod.id] = { ...prod };
        carrito[prod.id].quantity = prod.quantity + 1;
    }
    // actualiza carrito en localStorage
    localStorage.setItem("carrito", JSON.stringify(carrito));

    drawCart();
};