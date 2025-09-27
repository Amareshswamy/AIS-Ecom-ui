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
let currentOrder = null;
let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];

// DOM elements
const productsGrid = document.getElementById('products-grid');
const cartCount = document.getElementById('cart-count');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartModal = document.getElementById('cart-modal');
const checkoutModal = document.getElementById('checkout-modal');
const orderConfirmationModal = document.getElementById('order-confirmation-modal');
const orderDetailsModal = document.getElementById('order-details-modal');
const orderHistoryModal = document.getElementById('order-history-modal');
const closeButton = document.querySelector('.close');
const checkoutCloseButton = document.getElementById('checkout-close');
const orderDetailsCloseButton = document.getElementById('order-details-close');
const navCart = document.querySelector('.nav-cart');
const myOrdersBtn = document.getElementById('my-orders-btn');
const orderIdInput = document.getElementById('order-id-input');
const searchOrderBtn = document.getElementById('search-order-btn');
const tryAgainBtn = document.getElementById('try-again-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const backToCartBtn = document.getElementById('back-to-cart');
const continueShoppingBtn = document.getElementById('continue-shopping');
const viewOrderDetailsBtn = document.getElementById('view-order-details');
const backToConfirmationBtn = document.getElementById('back-to-confirmation');
const printOrderBtn = document.getElementById('print-order');
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
    // Store current order details
    currentOrder = {
        id: Date.now(), // Simple ID generation
        orderData: orderData,
        orderResult: orderResult,
        orderDate: new Date().toLocaleDateString('en-IN'),
        orderTime: new Date().toLocaleTimeString('en-IN'),
        items: [...cart] // Copy of cart items
    };
    
    // Save to order history
    orderHistory.unshift(currentOrder); // Add to beginning of array
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    
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

// Order details functions
function showOrderDetails() {
    if (!currentOrder) return;
    
    // Populate order information
    document.getElementById('order-date').textContent = currentOrder.orderDate;
    document.getElementById('order-time').textContent = currentOrder.orderTime;
    document.getElementById('details-total').textContent = '₹' + currentOrder.orderData.totalAmount.toLocaleString('en-IN');
    
    // Populate shipping address
    const address = currentOrder.orderData.shippingAddress;
    document.getElementById('shipping-address').innerHTML = `
        <div class="address-line">${address.street}</div>
        <div class="address-line">${address.city}, ${address.state}</div>
        <div class="address-line">PIN: ${address.zipCode}</div>
    `;
    
    // Populate ordered items
    document.getElementById('ordered-items').innerHTML = currentOrder.items.map(item => `
        <div class="ordered-item">
            <div class="item-info">
                <div class="item-name">${item.productName}</div>
                <div class="item-details">Quantity: ${item.quantity} × ₹${item.unitPrice.toLocaleString('en-IN')}</div>
            </div>
            <div class="item-price">₹${(item.unitPrice * item.quantity).toLocaleString('en-IN')}</div>
        </div>
    `).join('');
    
    // Show order details modal
    orderConfirmationModal.style.display = 'none';
    orderDetailsModal.style.display = 'block';
}

function closeOrderDetails() {
    orderDetailsModal.style.display = 'none';
}

function backToConfirmation() {
    orderDetailsModal.style.display = 'none';
    orderConfirmationModal.style.display = 'block';
}

function printOrder() {
    if (!currentOrder) return;
    
    // Create a printable version of the order
    const printContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #007bff;">ShopMart</h1>
                <h2>Order Receipt</h2>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>Order Information</h3>
                <p><strong>Date:</strong> ${currentOrder.orderDate}</p>
                <p><strong>Time:</strong> ${currentOrder.orderTime}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>Shipping Address</h3>
                <p>${currentOrder.orderData.shippingAddress.street}</p>
                <p>${currentOrder.orderData.shippingAddress.city}, ${currentOrder.orderData.shippingAddress.state}</p>
                <p>PIN: ${currentOrder.orderData.shippingAddress.zipCode}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>Items Ordered</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #007bff;">
                            <th style="text-align: left; padding: 10px;">Product</th>
                            <th style="text-align: center; padding: 10px;">Qty</th>
                            <th style="text-align: right; padding: 10px;">Price</th>
                            <th style="text-align: right; padding: 10px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${currentOrder.items.map(item => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">${item.productName}</td>
                                <td style="text-align: center; padding: 10px;">${item.quantity}</td>
                                <td style="text-align: right; padding: 10px;">₹${item.unitPrice.toLocaleString('en-IN')}</td>
                                <td style="text-align: right; padding: 10px;">₹${(item.unitPrice * item.quantity).toLocaleString('en-IN')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="border-top: 2px solid #007bff;">
                            <td colspan="3" style="text-align: right; padding: 15px; font-weight: bold;">Total Amount:</td>
                            <td style="text-align: right; padding: 15px; font-weight: bold; color: #007bff;">₹${currentOrder.orderData.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #6c757d;">
                <p>Thank you for shopping with ShopMart!</p>
            </div>
        </div>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order Receipt - ShopMart</title>
            <style>
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Order history functions
// Order search and lookup functions
function showOrderLookup() {
    // Show recent orders
    displayRecentOrders();
    
    // Reset search form
    orderIdInput.value = '';
    hideAllSearchStates();
    
    // Show the modal
    orderHistoryModal.style.display = 'block';
}

function hideAllSearchStates() {
    document.getElementById('order-search-results').style.display = 'none';
    document.getElementById('order-search-loading').style.display = 'none';
    document.getElementById('order-not-found').style.display = 'none';
}

function displayRecentOrders() {
    const recentOrdersList = document.getElementById('recent-orders-list');
    const noRecentOrders = document.getElementById('no-recent-orders');
    
    if (orderHistory.length === 0) {
        recentOrdersList.style.display = 'none';
        noRecentOrders.style.display = 'block';
    } else {
        recentOrdersList.style.display = 'block';
        noRecentOrders.style.display = 'none';
        
        // Show only last 3 orders
        const recentOrders = orderHistory.slice(-3).reverse();
        
        recentOrdersList.innerHTML = recentOrders.map(order => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const itemsSummary = order.items.length === 1 
                ? `${order.items[0].productName}` 
                : `${order.items[0].productName} +${order.items.length - 1} more`;
            
            return `
                <div class="order-history-item" data-order-id="${order.id}">
                    <div class="order-header">
                        <div class="order-info-header">
                            <div class="order-date">${order.orderDate}</div>
                            <div class="order-time">${order.orderTime}</div>
                        </div>
                        <div class="order-total-header">
                            <div class="order-amount">₹${order.orderData.totalAmount.toLocaleString('en-IN')}</div>
                            <div class="order-status">Completed</div>
                        </div>
                    </div>
                    <div class="order-items-summary">
                        ${itemCount} item${itemCount > 1 ? 's' : ''}: ${itemsSummary}
                    </div>
                </div>
            `;
        }).join('');
    }
}

async function searchOrderById(orderId) {
    if (!orderId.trim()) {
        alert('Please enter an Order ID');
        return;
    }
    
    // Show loading state
    hideAllSearchStates();
    document.getElementById('order-search-loading').style.display = 'block';
    searchOrderBtn.disabled = true;
    searchOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    
    try {
        // First check local storage
        const localOrder = orderHistory.find(order => 
            order.id.toLowerCase().includes(orderId.toLowerCase())
        );
        
        if (localOrder) {
            displaySearchResult(localOrder);
            return;
        }
        
        // If not found locally, try to fetch from API
        // Note: You'll need to implement an order lookup endpoint in your backend
        const response = await fetch(`${GET_PRODUCTS_URL.replace('/products', '/orders/' + orderId)}`, {
            headers: {
                'Ocp-Apim-Subscription-Key': APIM_SUBSCRIPTION_KEY
            }
        });
        
        if (response.ok) {
            const orderData = await response.json();
            displaySearchResult(orderData);
        } else if (response.status === 404) {
            showOrderNotFound();
        } else {
            throw new Error(`Failed to fetch order: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Order search error:', error);
        
        // Check if order exists in local storage with partial match
        const partialMatch = orderHistory.find(order => 
            order.id.toLowerCase().includes(orderId.toLowerCase()) ||
            orderId.toLowerCase().includes(order.id.toLowerCase())
        );
        
        if (partialMatch) {
            displaySearchResult(partialMatch);
        } else {
            showOrderNotFound();
        }
    } finally {
        // Reset button state
        searchOrderBtn.disabled = false;
        searchOrderBtn.innerHTML = '<i class="fas fa-search"></i> Search';
    }
}

function displaySearchResult(orderData) {
    hideAllSearchStates();
    const resultsDiv = document.getElementById('order-search-results');
    
    const itemCount = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
    
    resultsDiv.innerHTML = `
        <div class="search-result-header">
            <h3><i class="fas fa-check-circle" style="color: #28a745;"></i> Order Found</h3>
            <p>Order ID: <strong>${orderData.id}</strong></p>
        </div>
        
        <div class="order-summary-card">
            <div class="order-header">
                <div class="order-info-header">
                    <div class="order-date">${orderData.orderDate}</div>
                    <div class="order-time">${orderData.orderTime}</div>
                </div>
                <div class="order-total-header">
                    <div class="order-amount">₹${orderData.orderData.totalAmount.toLocaleString('en-IN')}</div>
                    <div class="order-status">Completed</div>
                </div>
            </div>
            
            <div class="order-items-preview">
                <h4>Items (${itemCount}):</h4>
                ${orderData.items.map(item => `
                    <div class="item-preview">
                        <span>${item.productName}</span>
                        <span>Qty: ${item.quantity} × ₹${item.unitPrice.toLocaleString('en-IN')}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="shipping-info">
                <h4>Shipping Address:</h4>
                <p>${orderData.orderData.shippingAddress.street}</p>
                <p>${orderData.orderData.shippingAddress.city}, ${orderData.orderData.shippingAddress.state} ${orderData.orderData.shippingAddress.zipCode}</p>
            </div>
            
            <div class="order-actions">
                <button class="btn btn-primary" onclick="viewOrderDetails('${orderData.id}')">
                    <i class="fas fa-eye"></i> View Full Details
                </button>
                <button class="btn btn-secondary" onclick="printOrderById('${orderData.id}')">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        </div>
    `;
    
    resultsDiv.style.display = 'block';
}

function showOrderNotFound() {
    hideAllSearchStates();
    document.getElementById('order-not-found').style.display = 'block';
}

function viewOrderDetails(orderId) {
    const order = orderHistory.find(o => o.id === orderId);
    if (order) {
        currentOrder = order;
        showOrderDetails();
    }
}

function printOrderById(orderId) {
    const order = orderHistory.find(o => o.id === orderId);
    if (order) {
        currentOrder = order;
        printOrder();
    }
}

function resetSearch() {
    orderIdInput.value = '';
    hideAllSearchStates();
    orderIdInput.focus();
}

function closeOrderHistory() {
    orderHistoryModal.style.display = 'none';
}

function viewOrderFromHistory(orderId) {
    const order = orderHistory.find(o => o.id == orderId);
    if (!order) return;
    
    // Set as current order and show details
    currentOrder = order;
    closeOrderHistory();
    showOrderDetails();
}

function printOrderFromHistory(orderId) {
    const order = orderHistory.find(o => o.id == orderId);
    if (!order) return;
    
    // Temporarily set as current order for printing
    const originalOrder = currentOrder;
    currentOrder = order;
    printOrder();
    currentOrder = originalOrder;
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
viewOrderDetailsBtn.addEventListener('click', showOrderDetails);
orderDetailsCloseButton.addEventListener('click', closeOrderDetails);
backToConfirmationBtn.addEventListener('click', backToConfirmation);
printOrderBtn.addEventListener('click', printOrder);
myOrdersBtn.addEventListener('click', showOrderLookup);
searchOrderBtn.addEventListener('click', () => {
    const orderId = orderIdInput.value.trim();
    searchOrderById(orderId);
});
orderIdInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const orderId = orderIdInput.value.trim();
        searchOrderById(orderId);
    }
});
tryAgainBtn.addEventListener('click', resetSearch);
checkoutForm.addEventListener('submit', handleCheckoutSubmit);

// Event delegation for order history actions
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('view-details-btn')) {
        const orderId = event.target.dataset.orderId;
        viewOrderFromHistory(orderId);
    }
    if (event.target.classList.contains('print-receipt-btn')) {
        const orderId = event.target.dataset.orderId;
        printOrderFromHistory(orderId);
    }
});

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
    if (event.target == orderDetailsModal) {
        orderDetailsModal.style.display = 'none';
    }
    if (event.target == orderHistoryModal) {
        closeOrderHistory();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', fetchAndDisplayProducts);
