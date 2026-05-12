document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const imageEl = document.getElementById('product-image');
  const titleEl = document.getElementById('product-title');
  const categoryEl = document.getElementById('product-category');
  const descriptionEl = document.getElementById('product-description');
  const priceEl = document.getElementById('product-price');
  const ratingCountEl = document.getElementById('product-rating');
  const badgeEl = document.getElementById('product-badge');
  const detailCategoryEl = document.getElementById('product-detail-category');
  const skuEl = document.getElementById('product-sku');
  const errorEl = document.getElementById('product-error');
  const addToCartBtn = document.getElementById('add-to-cart-detail');


  function showToast(message, duration = 2500) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🛍</span> ${message}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  function showError(message) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.color = '#c0392b';
      errorEl.style.marginTop = '32px';
    }
  }

  function formatPrice(value) {
    return value ? `$${value.toFixed(2)}` : '$0.00';
  }

  if (!productId) {
    showError('Product not found. Open this page from the shop listing.');
    return;
  }

  async function loadProduct() {
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
      if (!response.ok) throw new Error('Product not found');
      const product = await response.json();

      imageEl.src = product.image;
      imageEl.alt = product.title;
      titleEl.textContent = product.title;
      categoryEl.textContent = product.category;
      descriptionEl.textContent = product.description;
      priceEl.textContent = formatPrice(product.price);
      ratingCountEl.textContent = `(${product.rating?.count || 0})`;
      detailCategoryEl.textContent = product.category;
      skuEl.textContent = `LUM-${String(product.id).padStart(3, '0')}`;
      badgeEl.textContent = product.rating?.rate >= 4.5 ? 'Best Seller' : 'Featured';

      if (addToCartBtn) {
        addToCartBtn.dataset.productId = product.id;
        addToCartBtn.dataset.productName = product.title;
        addToCartBtn.dataset.price = product.price;
      }
    } catch (error) {
      showError('Unable to load product details. Please refresh or try again later.');
      console.error(error);
    }
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const id = addToCartBtn.dataset.productId;
      const name = addToCartBtn.dataset.productName;
      const price = parseFloat(addToCartBtn.dataset.price);

      if (id && name && !Number.isNaN(price)) {
        const savedCart = localStorage.getItem('lumiere_cart');
        const cart = savedCart ? JSON.parse(savedCart) : [];
        const existing = cart.find(item => item.id === id);

        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1;
        } else {
          cart.push({ id, name, price, image: imageEl.src, quantity: 1 });
        }

        localStorage.setItem('lumiere_cart', JSON.stringify(cart));
      }

      showToast('Added to cart ✓');
      addToCartBtn.textContent = 'Added ✓';
      addToCartBtn.disabled = true;
      setTimeout(() => {
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.disabled = false;
      }, 1800);
    });
  }

  loadProduct();
});
