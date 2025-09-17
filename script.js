// ShopMart E-commerce Frontend - Clean Version 2.0
// Direct APIM calls only - NO CORS PROXIES

// API Configuration
const GET_PRODUCTS_URL = 'https://apim-ecommerce.azure-api.net/inventory-functionapp/products';
const SUBMIT_ORDER_URL = 'https://apim-ecommerce.azure-api.net/When_an_HTTP_request_is_received/paths/invoke';
const APIM_SUBSCRIPTION_KEY = 'f2c6e36e795947ec99d422438029af24';

console.log('🚀 ShopMart Clean v2.0 - Direct APIM calls only');

// Global state
let products = [];
let cart = [];

// DOM elements
const productsGrid = document.getElementById('products-grid');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartModal = document.getElementById('cart-modal');
const checkoutModal = document.getElementById('checkout-modal');
const orderConfirmationModal = document.getElementById('order-confirmation-modal');
const closeButton = document.querySelector('.close');
const checkoutCloseButton = document.getElementById('checkout-close');
const navCart = document.querySelector('.nav-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const backToCartBtn = document.getElementById('back-to-cart');
const continueShoppingBtn = document.getElementById('continue-shopping');
const checkoutForm = document.getElementById('checkout-form');
const checkoutItems = document.getElementById('checkout-items');
const checkoutTotal = document.getElementById('checkout-total');
const confirmationItems = document.getElementById('confirmation-items');
const confirmationTotal = document.getElementById('confirmation-total');

// Fetch and display products
async function fetchAndDisplayProducts() {
    try {
        console.log('Fetching products from:', GET_PRODUCTS_URL);
        
        const response = await fetch(GET_PRODUCTS_URL, {
            headers: {
                'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTION_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status}`);
        }

        products = await response.json();
        console.log('Products loaded:', products.length);
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = '<p>Error loading products. Please try again.</p>';
    }
}

// Display products
function displayProducts(products) {
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const price = product.unitPrice || product.UnitPrice || 0;
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        
        const productName = product.productName || product.ProductName || product.name || product.Name;
        const productId = product.productId || product.ProductId || product.id || product.Id;
        const description = product.description || product.Description || '';
        const stock = product.stock || product.Stock || 50;
        
        const isOutOfStock = stock <= 0;
        
        if (!productName) {
            console.warn('Product missing name:', product);
            return;
        }
        
        const productCard = document.createElement('div');
        productCard.className = `product-card ${isOutOfStock ? 'out-of-stock' : ''}`;
        productCard.innerHTML = `
            <h3 class="product-title">${productName}</h3>
            <p class="product-description">${description}</p>
            <p class="product-price">₹${numericPrice.toLocaleString('en-IN')}</p>
            ${isOutOfStock ? 
                '<button class="btn btn-disabled" disabled>Out of Stock</button>' : 
                `<button class="btn btn-primary" data-product-id="${productId}">Add to Cart</button>`
            }
            <div class="added-feedback" style="display: none;">
                <i class="fas fa-check-circle"></i>
                <span>Added to Cart!</span>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => 
        (p.productId || p.ProductId || p.id || p.Id) === productId
    );
    
    if (!product) return;
    
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: productId,
            productName: product.productName || product.ProductName || product.name || product.Name,
            unitPrice: product.unitPrice || product.UnitPrice || 0,
            quantity: 1
        });
    }
    
    showAddedFeedback(productId);
    renderCart();
}

// Show added feedback
function showAddedFeedback(productId) {
    const button = document.querySelector(`[data-product-id="${productId}"]`);
    if (button) {
        const productCard = button.closest('.product-card');
        const feedback = productCard.querySelector('.added-feedback');
        
        if (feedback) {
            feedback.style.display = 'block';
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 2000);
        }
    }
}

// Render cart
function renderCart() {
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCount.textContent = cartItemCount;
    const cartCountInline = document.getElementById('cart-count-inline');
    if (cartCountInline) {
        cartCountInline.textContent = cartItemCount;
    }
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
        cartTotal.textContent = '0';
    } else {
        cartItems.innerHTML = cart.map(item => {
            const itemPrice = item.unitPrice || 0;
            const itemTotal = itemPrice * item.quantity;
            
            return `
                <div class="cart-item">
                    <span>${item.productName} (x${item.quantity})</span>
                    <span>₹${itemTotal.toLocaleString('en-IN')}</span>
                </div>
            `;
        }).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        cartTotal.textContent = total.toLocaleString('en-IN');
    }
}

// Checkout functions
function openCheckoutModal() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span>${item.productName} (x${item.quantity})</span>
            <span>₹${(item.unitPrice * item.quantity).toLocaleString('en-IN')}</span>
        </div>
    `).join('');
    
    checkoutTotal.textContent = total.toLocaleString('en-IN');
    
    cartModal.style.display = 'none';
    checkoutModal.style.display = 'block';
}

function closeCheckoutModal() {
    checkoutModal.style.display = 'none';
}

function backToCart() {
    checkoutModal.style.display = 'none';
    cartModal.style.display = 'block';
}

// Order confirmation functions
function showOrderConfirmation(orderData, orderResult) {
    // Populate confirmation items
    confirmationItems.innerHTML = cart.map(item => `
        <div class="confirmation-item">
            <span>${item.productName} (x${item.quantity})</span>
            <span>₹${(item.unitPrice * item.quantity).toLocaleString('en-IN')}</span>
        </div>
    `).join('');
    
    // Set total
    const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    confirmationTotal.textContent = total.toLocaleString('en-IN');
    
    // Close checkout modal and show confirmation
    checkoutModal.style.display = 'none';
    orderConfirmationModal.style.display = 'block';
}

function closeOrderConfirmation() {
    orderConfirmationModal.style.display = 'none';
}

// Submit order - DIRECT APIM CALL ONLY
async function submitOrder(orderData) {
    try {
        console.log('=== SUBMITTING ORDER TO APIM ===');
        console.log('URL:', SUBMIT_ORDER_URL);
        console.log('Payload:', JSON.stringify(orderData, null, 2));
        
        const response = await fetch(SUBMIT_ORDER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTION_KEY
            },
            body: JSON.stringify(orderData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            console.log('Success (JSON):', result);
            return result;
        } else {
            // Handle non-JSON response (likely HTML or text)
            const textResult = await response.text();
            console.log('Success (Text):', textResult);
            
            // Try to extract meaningful info or create a mock response
            const mockResult = {
                success: true,
                message: textResult.substring(0, 100), // First 100 chars
                orderId: `ORDER_${Date.now()}`, // Generate a temporary order ID
                status: 'submitted'
            };
            
            return mockResult;
        }
    } catch (error) {
        console.error('Order submission error:', error);
        throw error;
    }
}

// Handle checkout form submission
function handleCheckoutSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(checkoutForm);
    const shippingAddress = {
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode')
    };
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    const lineItems = cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice
    }));
    
    const orderData = {
        totalAmount: totalAmount,
        shippingAddress: shippingAddress,
        lineItems: lineItems
    };
    
    const submitBtn = document.getElementById('place-order');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    submitOrder(orderData)
        .then(result => {
            console.log('Order successful:', result);
            
            // Show order confirmation modal instead of alert
            showOrderConfirmation(orderData, result);
            
            // Clear cart and reset form
            cart = [];
            renderCart();
            checkoutForm.reset();
        })
        .catch(error => {
            console.error('Order failed:', error);
            
            // Provide more user-friendly error messages
            let errorMessage = 'Failed to place order.';
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage += '\nNetwork error: Please check your internet connection.';
            } else if (error.message.includes('CORS')) {
                errorMessage += '\nCORS error: API configuration issue.';
            } else if (error.message.includes('JSON')) {
                errorMessage += '\nAPI returned unexpected response format.';
            } else {
                errorMessage += `\nError: ${error.message}`;
            }
            
            alert(errorMessage);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        });
}

// Event listeners
productsGrid.addEventListener('click', (event) => {
    if (event.target && event.target.matches('button.btn-primary')) {
        const productId = event.target.dataset.productId;
        addToCart(productId);
    }
});

navCart.addEventListener('click', () => {
    cartModal.style.display = 'block';
});

document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'view-cart-btn') {
        cartModal.style.display = 'block';
    }
});

closeButton.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

checkoutBtn.addEventListener('click', openCheckoutModal);
checkoutCloseButton.addEventListener('click', closeCheckoutModal);
backToCartBtn.addEventListener('click', backToCart);
continueShoppingBtn.addEventListener('click', closeOrderConfirmation);
checkoutForm.addEventListener('submit', handleCheckoutSubmit);

window.addEventListener('click', (event) => {
    if (event.target == cartModal) {
        cartModal.style.display = 'none';
    }
    if (event.target == checkoutModal) {
        checkoutModal.style.display = 'none';
    }
    if (event.target == orderConfirmationModal) {
        orderConfirmationModal.style.display = 'none';
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', fetchAndDisplayProducts);
