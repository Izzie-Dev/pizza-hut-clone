document.addEventListener('DOMContentLoaded', () => {

    // --- Sample Pizza Data ---
    const pizzaData = [
        { id: 1, name: 'Margherita', category: 'veg', desc: 'Classic cheese and tomato base.', price: 18000, img: 'assets/pizza-margherita.png' },
        { id: 2, name: 'Pepperoni', category: 'meat', desc: 'Loaded with spicy pepperoni slices.', price: 22000, img: 'assets/pizza-pepperoni.png' },
        { id: 3, name: 'Veggie Supreme', category: 'veg', desc: 'Onions, peppers, olives, and mushrooms.', price: 20000, img: 'assets/pizza-veggie.png' },
        { id: 4, name: 'Hawaiian', category: 'special', desc: 'A sweet and savory mix of ham and pineapple.', price: 21000, img: 'assets/pizza-hawaiian.png' },
        { id: 5, name: 'BBQ Chicken', category: 'meat', desc: 'Grilled chicken with smoky BBQ sauce.', price: 24000, img: 'assets/pizza-bbq-chicken.png' }
    ];

    // --- DOM Elements ---
    const menuGallery = document.querySelector('.menu-gallery');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const cartButton = document.querySelector('.cart-button');
    const orderNowBtn = document.getElementById('order-now-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.querySelector('.close-cart');
    const overlay = document.querySelector('.overlay');
    const cartBody = document.querySelector('.cart-body');
    const cartSubtotalEl = document.getElementById('cart-subtotal-price');
    const cartCounter = document.querySelector('.cart-counter');

    // --- Initialize Cart from localStorage ---
    let cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];

    // --- Functions ---

    // Render Pizza Menu
    const renderMenu = (filter = 'all') => {
        menuGallery.innerHTML = '';
        const filteredPizzas = pizzaData.filter(pizza => filter === 'all' || pizza.category === filter);

        if (filteredPizzas.length === 0) {
            menuGallery.innerHTML = '<p>No pizzas found in this category.</p>';
            return;
        }
        
        filteredPizzas.forEach(pizza => {
            const pizzaCard = `
                <div class="pizza-card" data-id="${pizza.id}">
                    <img src="${pizza.img}" alt="${pizza.name}" loading="lazy">
                    <div class="pizza-card-content">
                        <h3>${pizza.name}</h3>
                        <p>${pizza.desc}</p>
                        <p class="pizza-price">TSh ${pizza.price.toLocaleString()}</p>
                        <button class="btn btn-primary add-to-cart-btn">Ongeza Kwenye Kikapu</button>
                    </div>
                </div>`;
            menuGallery.insertAdjacentHTML('beforeend', pizzaCard);
        });
    };

    // Render Cart
    const renderCart = () => {
        cartBody.innerHTML = '';
        if (cart.length === 0) {
            cartBody.innerHTML = '<p class="cart-empty-msg">Kikapu chako ni kitupu.</p>';
        } else {
            cart.forEach(item => {
                const cartItemHTML = `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>TSh ${item.price.toLocaleString()}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="qty-btn decrease-qty" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn increase-qty" data-id="${item.id}">+</button>
                    </div>
                </div>`;
                cartBody.insertAdjacentHTML('beforeend', cartItemHTML);
            });
        }
        updateCartInfo();
    };

    // Update Cart Subtotal and Counter
    const updateCartInfo = () => {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        cartSubtotalEl.textContent = `TSh ${subtotal.toLocaleString()}`;
        
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'block' : 'none';

        localStorage.setItem('pizzaCart', JSON.stringify(cart));
    };

    // Add to Cart Logic
    const addToCart = (id) => {
        const pizza = pizzaData.find(p => p.id === id);
        const cartItem = cart.find(item => item.id === id);

        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...pizza, quantity: 1 });
        }
        renderCart();
        showCart();
    };
    
    // Add custom pizza to cart
    const addCustomPizzaToCart = () => {
        const sizeEl = document.querySelector('input[name="size"]:checked');
        const crustEl = document.querySelector('input[name="crust"]:checked');
        const toppingsEls = document.querySelectorAll('input[name="topping"]:checked');

        let price = parseInt(sizeEl.value) + parseInt(crustEl.value);
        let toppingsList = [];
        toppingsEls.forEach(t => {
            price += parseInt(t.value);
            toppingsList.push(t.dataset.name);
        });

        const customPizza = {
            id: `custom-${Date.now()}`,
            name: `Pizza Maalum (${sizeEl.dataset.name})`,
            price: price,
            quantity: 1,
            img: 'assets/pizza-margherita.png', // Placeholder
            desc: `Unga: ${crustEl.dataset.name}. Toppings: ${toppingsList.join(', ')}`
        };

        cart.push(customPizza);
        renderCart();
        showCart();
    };

    // Update Cart Quantity
    const updateQuantity = (id, change) => {
        const cartItem = cart.find(item => item.id === id);
        if (cartItem) {
            cartItem.quantity += change;
            if (cartItem.quantity <= 0) {
                cart = cart.filter(item => item.id !== id);
            }
        }
        renderCart();
    };
    
    // Toggle Mobile Menu
    const toggleMobileMenu = () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    };

    // Show/Hide Cart Modal
    const showCart = () => {
        cartModal.classList.add('open');
        overlay.classList.add('open');
    };
    const hideCart = () => {
        cartModal.classList.remove('open');
        overlay.classList.remove('open');
    };
    
    // Update Custom Pizza Price
    const updateCustomPrice = () => {
        const sizePrice = parseInt(document.querySelector('input[name="size"]:checked').value);
        const crustPrice = parseInt(document.querySelector('input[name="crust"]:checked').value);
        let toppingsPrice = 0;
        document.querySelectorAll('input[name="topping"]:checked').forEach(topping => {
            toppingsPrice += parseInt(topping.value);
        });
        const totalPrice = sizePrice + crustPrice + toppingsPrice;
        document.querySelector('.custom-price').textContent = `TSh ${totalPrice.toLocaleString()}`;
    };

    // --- Event Listeners ---

    // Menu Filtering
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            renderMenu(btn.dataset.filter);
        });
    });

    // Add to Cart from Menu
    menuGallery.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const card = e.target.closest('.pizza-card');
            const id = parseInt(card.dataset.id);
            addToCart(id);
        }
    });

    // Hamburger Menu
    hamburger.addEventListener('click', toggleMobileMenu);
    navMenu.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
            toggleMobileMenu();
        }
    });

    // Cart Interactions
    cartButton.addEventListener('click', showCart);
    orderNowBtn.addEventListener('click', showCart);
    closeCartBtn.addEventListener('click', hideCart);
    overlay.addEventListener('click', hideCart);

    // Cart Quantity Adjustment
    cartBody.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('increase-qty')) {
            updateQuantity(id, 1);
        }
        if (e.target.classList.contains('decrease-qty')) {
            updateQuantity(id, -1);
        }
    });
    
    // Custom Pizza Price Calculator
    document.querySelector('.customizer-options').addEventListener('change', updateCustomPrice);
    document.querySelector('.add-custom-to-cart').addEventListener('click', addCustomPizzaToCart);

    // --- Initial Load ---
    renderMenu();
    renderCart();
});