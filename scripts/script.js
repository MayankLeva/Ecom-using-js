let cartContainer = document.querySelector('#cartItemsDynamic');
var cartarr = [];
let currentProducts = []; // Track currently displayed products for sorting

function addToCart(product) {
  // latest cart lo
  let existingCart =
    JSON.parse(localStorage.getItem('lumiere_cart')) || [];
  // product already hai kya
  const existingItem = existingCart.find(
    item => item.id == product.id
  );
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    existingCart.push({
      ...product,
      quantity: 1
    });
  }
  // save updated cart
  localStorage.setItem(
    'lumiere_cart',
    JSON.stringify(existingCart)
  );
  // sync global array
  cartarr = existingCart;

  updateCartBadge();
  updateOrderTotal();

}


document.addEventListener('DOMContentLoaded', () => {
  const shopGrid = document.getElementById('shop-products-grid');
  const featuredGrid = document.getElementById('featured-products-grid');
  let allProducts = [];
  const validCategories = new Set(["electronics", "jewelery", "men's clothing", "women's clothing"]);

  /* ───────────────────────────────────────────────────────────
     MOBILE NAVIGATION TOGGLE
     ─────────────────────────────────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      // Prevent background scroll when nav is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile nav when a link is clicked
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ───────────────────────────────────────────────────────────
     NAVBAR SCROLL STATE
     ─────────────────────────────────────────────────────────── */
  const navbar = document.querySelector('.navbar');

  if (navbar) {
    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run on load
  }

  /* ───────────────────────────────────────────────────────────
     ACTIVE NAV LINK (based on current page)
     ─────────────────────────────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ───────────────────────────────────────────────────────────
     CATEGORY FILTER BUTTONS — UI TOGGLE ONLY
     ─────────────────────────────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.dataset.category;
      const filteredProducts = selectedCategory === 'all' || !validCategories.has(selectedCategory)
        ? allProducts
        : allProducts.filter(product => product.category.toLowerCase() === selectedCategory.toLowerCase());

      currentProducts = filteredProducts; // Track current products for sorting
      renderProductGrid(filteredProducts);
      console.log('[UI] Filter selected:', selectedCategory, '->', filteredProducts.length, 'products');
    });
  });

  /* ───────────────────────────────────────────────────────────
     SORT SELECT — UI FEEDBACK ONLY
     ─────────────────────────────────────────────────────────── */
  function sortProducts(products, sortValue) {
    const sorted = [...products]; // Create a copy to avoid mutating original

    switch (sortValue) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => b.id - a.id);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
        break;
      case 'featured':
      default:
        // Keep original order
        break;
    }

    return sorted;
  }

  const sortSelect = document.querySelector('.sort-select');

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const sortValue = e.target.value;
      console.log('[UI] Sort changed to:', sortValue);

      const sorted = sortProducts(currentProducts, sortValue);
      renderProductGrid(sorted);
    });
  }

  /* ───────────────────────────────────────────────────────────
     ADD TO CART BUTTONS — UI FEEDBACK ONLY
     ─────────────────────────────────────────────────────────── */
  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.dataset.productId;
      const productName = btn.dataset.productName;
      const productPrice = btn.dataset.price;
      const productImage =
        btn.closest('.product-card').querySelector('.product-img').src;
      addToCart({
        id: productId,
        name: productName,
        price: parseFloat(productPrice),
        image: productImage
      });

      showToast(`Added to cart ✓`);
      const originalText = btn.textContent;
      btn.textContent = 'Added ✓';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 1800);
    });
  });

  // get cart from localStorage on load
  function loadCart() {
    try {
      const savedCart = localStorage.getItem('lumiere_cart');
      //console.log('Loading cart from localStorage:', savedCart);  
      if (savedCart !== null) { 
        let cartarr = JSON.parse(savedCart);
        let cartlist = '';
        cartarr.forEach(item => {
          cartlist += `
          <div class="cart-item" data-product-id="${item.id}" data-price="${item.price}">
            <div class="cart-product-info">
              <div class="cart-product-img">
                <!-- TODO: <img src="product image URL" alt="Structured Wool Coat" /> -->
                <img src="${item.image}" alt="${item.name}" />
              </div>
              <div>
                <h3 class="cart-product-name">${item.name}</h3>
                
                <button class="btn btn-danger cart-remove" data-product-id="${item.id}">Remove</button>
              </div>
            </div>
            <div class="item-unit-price" style="font-size:0.95rem; font-weight:500;">
              $${item.price.toFixed(2)} <span style="color:#777; font-size:0.85rem;">each</span>
            </div>
            <div>
              <div class="qty-control">
                <!-- TODO: Decrease quantity in localStorage cart -->
                <button class="qty-btn" data-action="decrease" onclick="updateCartItemQuantity('${item.id}', -1)" aria-label="Decrease quantity">−</button>
                <span class="qty-value">${item.quantity || 1}</span>
                <!-- TODO: Increase quantity in localStorage cart -->
                <button class="qty-btn" data-action="increase" onclick="updateCartItemQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
          </div>
          `;
        });
        if (cartContainer) {
          cartContainer.innerHTML = cartlist;
        }
        // console.log('Cart loaded from localStorage:', cartarr); 
      }
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      cartarr = [];
    }
  }
  loadCart();

  // update cart item quantity in localStorage

  window.updateCartItemQuantity = function (productId, change) {
    const item = cartarr.find(i => i.id === productId);
    if (!item) return;

    item.quantity = Math.max(1, (item.quantity || 1) + change);
    localStorage.setItem('lumiere_cart', JSON.stringify(cartarr));
    // console.log(`Cart item ${productId} quantity updated to:`, item.quantity);

    const cartItemEl = cartContainer.querySelector(`.cart-item[data-product-id="${productId}"]`);
    if (cartItemEl) {
      const qtyEl = cartItemEl.querySelector('.qty-value');
      const lineTotalEl = cartItemEl.querySelector('.item-price');
      if (qtyEl) qtyEl.textContent = item.quantity;
      if (lineTotalEl) lineTotalEl.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
    }

    updateCartBadge();
    updateOrderTotal();
  };

  /* ───────────────────────────────────────────────────────────
     WISHLIST BUTTONS — UI TOGGLE ONLY
     ─────────────────────────────────────────────────────────── */
  const wishlistBtns = document.querySelectorAll('.product-wishlist');

  wishlistBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isLiked = btn.classList.toggle('liked');
      btn.innerHTML = isLiked ? '♥' : '♡';
      btn.style.color = isLiked ? '#c0392b' : '';

      console.log('[UI] Wishlist toggled:', isLiked);

      // TODO: Save wishlist state to localStorage or user account
      // Example:
      // const productId = btn.dataset.productId;
      // toggleWishlist(productId, isLiked);
    });
  });



  /* ───────────────────────────────────────────────────────────
     CART: REMOVE ITEM BUTTONS — UI ONLY
     ─────────────────────────────────────────────────────────── */
  document.querySelectorAll('.cart-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const cartItem = btn.closest('.cart-item');
      if (!cartItem) return;
      // Animate out
      cartItem.style.opacity = '0';
      cartItem.style.transform = 'translateX(20px)';
      cartItem.style.transition = 'all 0.3s ease';
      const productId = cartItem.dataset.productId;
      setTimeout(() => {
        cartItem.remove();
        console.log('[UI] Cart item removed from DOM');
        cartarr = cartarr.filter(item => item.id !== productId);
        localStorage.setItem('lumiere_cart', JSON.stringify(cartarr));
        updateCartBadge();
        updateOrderTotal();
      }, 300);
    });
  });

  /* ───────────────────────────────────────────────────────────
     TOAST NOTIFICATION UTILITY
     ─────────────────────────────────────────────────────────── */
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

  // Expose globally so other scripts or inline handlers can use it
  window.showToast = showToast;

  /* ───────────────────────────────────────────────────────────
     CART BADGE — PLACEHOLDER
     ─────────────────────────────────────────────────────────── */
  function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (!badge) return;

    const total = cartarr.reduce((sum, item) => sum + (item.quantity || 1), 0);
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
  }

  /* ───────────────────────────────────────────────────────────
     ORDER SUMMARY — TOTAL CALCULATION
     ─────────────────────────────────────────────────────────── */
  function updateOrderTotal() {
    const totalEls = document.querySelectorAll('.order-summary-total');
    if (totalEls.length === 0) return;

    const grandTotal = cartarr.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    totalEls.forEach(el => {
      el.textContent = `$${grandTotal.toFixed(2)}`;
    });
  }

  updateCartBadge();
  updateOrderTotal();

  function buildProductCard(product) {
    return `
      <article class="product-card" data-product-id="${product.id}" data-category="${product.category}">
        <div class="product-img-wrap">
          <img src="${product.image}" alt="${product.title}" class="product-img" />
          <button class="product-wishlist" data-product-id="${product.id}" aria-label="Wishlist">♡</button>
          <div class="product-actions">
            <button class="btn btn-accent add-to-cart-btn"
              data-product-id="${product.id}"
              data-product-name="${product.title}"
              data-price="${product.price}">Add to Cart</button>
          </div>
        </div>
        <div class="product-info">
          <p class="product-category">${product.category}</p>
          <h3 class="product-name">${product.title}</h3>
          <div class="product-pricing">
            <span class="product-price">$${product.price.toFixed(2)}</span>
          </div>
          <div class="product-rating">
            <span class="stars">★★★★★</span>
            <span class="rating-count">(${product.rating?.count || 0})</span>
          </div>
        </div>
      </article>
    `;
  }

  function updateProductsCount(count) {
    const countEl = document.getElementById('products-count');
    if (countEl) {
      countEl.textContent = `${count} product${count === 1 ? '' : 's'}`;
    }
  }

  function renderProductGrid(products) {
    if (!shopGrid) return;
    shopGrid.innerHTML = products.map(buildProductCard).join('');
    updateProductsCount(products.length);
  }

  function renderFeaturedProducts(products) {
    if (!featuredGrid || !Array.isArray(products)) return;

    const featuredProducts = [];
    const seenCategories = new Set();

    for (const product of products) {
      const category = product.category?.toLowerCase();
      if (!category || seenCategories.has(category)) continue;
      seenCategories.add(category);
      featuredProducts.push(product);
      if (featuredProducts.length === 4) break;
    }

    if (featuredProducts.length < 4) {
      for (const product of products) {
        if (!featuredProducts.includes(product)) {
          featuredProducts.push(product);
          if (featuredProducts.length === 4) break;
        }
      }
    }

    featuredGrid.innerHTML = featuredProducts.map(buildProductCard).join('');
  }
  function handleShopGridClick(e) {
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (addBtn) {
      e.stopPropagation();
      const productId = addBtn.dataset.productId;
      const productName = addBtn.dataset.productName;
      const price = addBtn.dataset.price;
      const productimg = addBtn.closest('.product-card').querySelector('.product-img').src;
      addToCart({
        id: productId,
        name: productName,
        price: parseFloat(price),
        image: productimg,
        quantity: 1
      });
      localStorage.setItem('lumiere_cart', JSON.stringify(cartarr));
      showToast(`Added "${productName}" to cart ✓`);
      addBtn.textContent = 'Added ✓';
      addBtn.disabled = true;
      setTimeout(() => {
        addBtn.textContent = 'Add to Cart';
        addBtn.disabled = false;
      }, 1800);
      updateCartBadge();
      updateOrderTotal();
      return;
    }

    const wishlistBtn = e.target.closest('.product-wishlist');
    if (wishlistBtn) {
      e.stopPropagation();
      const isLiked = wishlistBtn.classList.toggle('liked');
      wishlistBtn.innerHTML = isLiked ? '♥' : '♡';
      wishlistBtn.style.color = isLiked ? '#c0392b' : '';
      return;
    }

    const card = e.target.closest('.product-card');
    if (card && !e.target.closest('.product-actions') && !e.target.closest('.product-wishlist')) {
      const productId = card.dataset.productId;
      if (productId) {
        window.location.href = `product.html?id=${productId}`;
      }
    }
  }

  [shopGrid, featuredGrid].forEach(grid => {
    if (grid) {
      grid.addEventListener('click', handleShopGridClick);
    }
  });

  /* ───────────────────────────────────────────────────────────
     PROMO CODE FORM — UI ONLY
     ─────────────────────────────────────────────────────────── */
  const promoBtn = document.querySelector('.promo-btn');
  const promoInput = document.querySelector('.promo-input');

  if (promoBtn && promoInput) {
    promoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) return;

      console.log('[UI] Promo code submitted:', code);

      // TODO: Validate promo code against API or predefined list
      // Example:
      // const discount = await validatePromoCode(code);
      // if (discount) {
      //   applyDiscount(discount);
      //   showToast(`Promo code "${code}" applied!`);
      // } else {
      //   showToast('Invalid promo code.');
      // }

      showToast(`Checking code "${code}"...`);
    });
  }

  /* ───────────────────────────────────────────────────────────
     NEWSLETTER FORM — UI ONLY
     ─────────────────────────────────────────────────────────── */
  const newsletterBtn = document.querySelector('.newsletter-btn');
  const newsletterInput = document.querySelector('.newsletter-input');

  if (newsletterBtn && newsletterInput) {
    newsletterBtn.addEventListener('click', () => {
      const email = newsletterInput.value.trim();
      if (!email || !email.includes('@')) {
        showToast('Please enter a valid email.');
        return;
      }

      console.log('[UI] Newsletter signup:', email);

      // TODO: Submit email to newsletter service (Mailchimp, ConvertKit, etc.)
      // Example:
      // await subscribeToNewsletter(email);

      newsletterInput.value = '';
      showToast('Thank you for subscribing! ✉');
    });
  }

  /* ───────────────────────────────────────────────────────────
     PRODUCT CARDS — CLICK NAVIGATION
     ─────────────────────────────────────────────────────────── */
  /* ───────────────────────────────────────────────────────────
     SMOOTH SCROLL FOR ANCHOR LINKS
     ─────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Load products and render cards into the shop grid
  async function fetchProducts() {
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      const products = await response.json();
      allProducts = products;
      currentProducts = products; // Initialize currentProducts with all products
      renderProductGrid(products);
      renderFeaturedProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (shopGrid) {
        shopGrid.innerHTML = '<p class="error-message">Unable to load products. Please try again later.</p>';
      }
    }
  }

  fetchProducts();


});
