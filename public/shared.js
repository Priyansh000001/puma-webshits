(function () {
  const PRODUCTS = {
    obsidian: {
      id: "obsidian",
      name: "Nitro Elite Speed",
      color: "Obsidian Black / Gold",
      price: 14999,
      img: "./images/shoe_obsidian_black.png"
    },
    arctic: {
      id: "arctic",
      name: "Nitro Elite Speed",
      color: "Arctic White / Ice",
      price: 14999,
      img: "./images/shoe_arctic_white.png"
    },
    savanna: {
      id: "savanna",
      name: "Nitro Elite Speed",
      color: "Savanna Gold / Earth",
      price: 14999,
      img: "./images/shoe_savanna_gold.png"
    },
    velocity: {
      id: "velocity",
      name: "Velocity Nitro 3",
      color: "Shadow Lime / Asphalt",
      price: 11999,
      img: "./images/shoe_arctic_white.png"
    },
    fastR: {
      id: "fastR",
      name: "Fast-R Nitro Elite 2",
      color: "Plasma Green / Black",
      price: 17999,
      img: "./images/shoe_obsidian_black.png"
    },
    deviate: {
      id: "deviate",
      name: "Deviate Elite 3",
      color: "Bone White / Ember",
      price: 15999,
      img: "./images/shoe_savanna_gold.png"
    }
  };

  const SIZES = ["UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"];
  const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cart = [];
  let pendingProductId = null;
  let selectedSize = null;

  function currency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  function loadCart() {
    try {
      cart = JSON.parse(window.localStorage.getItem("pumaHungryCart") || "[]");
    } catch (error) {
      cart = [];
    }
  }

  function saveCart() {
    window.localStorage.setItem("pumaHungryCart", JSON.stringify(cart));
  }

  function setBodyLock(isLocked) {
    document.body.style.overflow = isLocked ? "hidden" : "";
  }

  function getCartCount() {
    return cart.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  }

  function renderCart() {
    const badge = document.getElementById("cart-badge");
    const countLabel = document.getElementById("cart-count-label");
    const itemsNode = document.getElementById("cart-items");
    const emptyNode = document.getElementById("cart-empty");
    const subtotalNode = document.getElementById("cart-subtotal");
    const count = getCartCount();
    const subtotal = cart.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);

    if (badge) {
      if (count > 0) {
        badge.style.display = "flex";
        badge.textContent = String(count);
      } else {
        badge.style.display = "none";
      }
    }

    if (countLabel) {
      countLabel.textContent = count + " item" + (count === 1 ? "" : "s");
    }

    if (subtotalNode) {
      subtotalNode.textContent = currency(subtotal);
    }

    if (!itemsNode || !emptyNode) {
      return;
    }

    if (!cart.length) {
      itemsNode.style.display = "none";
      itemsNode.innerHTML = "";
      emptyNode.style.display = "flex";
      return;
    }

    itemsNode.style.display = "block";
    emptyNode.style.display = "none";
    itemsNode.innerHTML = cart
      .map(function (item) {
        return (
          '<article class="flex gap-4 border-b border-white/6 py-4">' +
          '<div class="h-21 w-21 shrink-0 rounded-2xl bg-white/5 p-2">' +
          renderProductVisual(item.productId, "h-full w-full rounded-xl") +
          "</div>" +
          '<div class="flex min-w-0 flex-1 flex-col gap-2">' +
          '<div class="flex items-start justify-between gap-3">' +
          '<div><p class="text-sm font-bold text-white">' + item.name + '</p><p class="text-xs text-white/55">' + item.color + " · " + item.size + "</p></div>" +
          '<button class="remove-item text-xs uppercase tracking-[0.18em] text-white/45 hover:text-white" data-item-id="' + item.id + '" aria-label="Remove item">×</button>' +
          "</div>" +
          '<div class="mt-auto flex items-center justify-between gap-3">' +
          '<div class="flex items-center gap-2">' +
          '<button class="qty-btn flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-white hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]" data-item-id="' + item.id + '" data-delta="-1" aria-label="Decrease quantity">−</button>' +
          '<span class="text-sm text-white">' + item.qty + "</span>" +
          '<button class="qty-btn flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-white hover:border-[var(--brand-green)] hover:bg-[var(--brand-green)]" data-item-id="' + item.id + '" data-delta="1" aria-label="Increase quantity">+</button>' +
          "</div>" +
          '<p class="font-label text-xl font-bold text-white">' + currency(item.price * item.qty) + "</p>" +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    itemsNode.querySelectorAll(".qty-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        changeQty(button.dataset.itemId, Number(button.dataset.delta));
      });
    });

    itemsNode.querySelectorAll(".remove-item").forEach(function (button) {
      button.addEventListener("click", function () {
        removeFromCart(button.dataset.itemId);
      });
    });
  }

  function addToCart(productId, size) {
    const product = PRODUCTS[productId];
    if (!product) {
      return;
    }

    const itemId = productId + "_" + size.replace(/\s+/g, "");
    const existing = cart.find(function (item) {
      return item.id === itemId;
    });

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: itemId,
        productId: product.id,
        name: product.name,
        color: product.color,
        price: product.price,
        img: product.img,
        size: size,
        qty: 1
      });
    }

    saveCart();
    renderCart();
    openCart();
  }

  function removeFromCart(itemId) {
    cart = cart.filter(function (item) {
      return item.id !== itemId;
    });
    saveCart();
    renderCart();
  }

  function changeQty(itemId, delta) {
    cart = cart
      .map(function (item) {
        if (item.id === itemId) {
          return Object.assign({}, item, { qty: item.qty + delta });
        }
        return item;
      })
      .filter(function (item) {
        return item.qty > 0;
      });
    saveCart();
    renderCart();
  }

  function openCart() {
    toggleOverlay("cart", true);
  }

  function closeCart() {
    toggleOverlay("cart", false);
  }

  function openSizeSheet(productId) {
    const product = PRODUCTS[productId];
    const title = document.getElementById("size-product-name");
    const subtitle = document.getElementById("size-product-color");
    const grid = document.getElementById("size-grid");
    const confirm = document.getElementById("confirm-size");
    if (!product || !grid || !confirm) {
      return;
    }

    pendingProductId = productId;
    selectedSize = null;
    title.textContent = product.name;
    subtitle.textContent = product.color;
    confirm.disabled = true;
    confirm.classList.add("opacity-30");
    grid.innerHTML = SIZES.map(function (size) {
      return '<button class="size-btn rounded-lg border border-white/12 px-3 py-4 text-sm text-white transition hover:border-[var(--brand-green)]" data-size="' + size + '">' + size + "</button>";
    }).join("");

    grid.querySelectorAll(".size-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        selectedSize = button.dataset.size;
        grid.querySelectorAll(".size-btn").forEach(function (node) {
          node.classList.remove("selected");
        });
        button.classList.add("selected");
        confirm.disabled = false;
        confirm.classList.remove("opacity-30");
      });
    });

    toggleOverlay("size", true);
  }

  function closeSizeSheet() {
    toggleOverlay("size", false);
    pendingProductId = null;
    selectedSize = null;
  }

  function openSearch() {
    toggleOverlay("search", true);
    const input = document.getElementById("search-input");
    if (input) {
      window.setTimeout(function () {
        input.focus();
      }, 120);
    }
    renderSearchResults("");
  }

  function closeSearch() {
    toggleOverlay("search", false);
  }

  function toggleOverlay(type, isOpen) {
    const overlay = document.getElementById(type + "-overlay");
    const panel = document.getElementById(type === "cart" ? "cart-drawer" : type === "size" ? "size-sheet" : "search-panel");
    if (overlay) {
      overlay.classList.toggle("open", isOpen);
    }
    if (panel) {
      panel.classList.toggle("open", isOpen);
    }

    const hasOpen =
      document.getElementById("cart-drawer")?.classList.contains("open") ||
      document.getElementById("size-sheet")?.classList.contains("open") ||
      document.getElementById("search-panel")?.classList.contains("open") ||
      document.getElementById("mobile-nav-overlay")?.classList.contains("open");
    setBodyLock(Boolean(hasOpen));
  }

  function renderSearchResults(query) {
    const node = document.getElementById("search-results");
    if (!node) {
      return;
    }

    const term = query.trim().toLowerCase();
    const results = Object.keys(PRODUCTS)
      .map(function (key) {
        return PRODUCTS[key];
      })
      .filter(function (product) {
        if (!term) {
          return true;
        }
        return (product.name + " " + product.color).toLowerCase().indexOf(term) !== -1;
      });

    node.innerHTML = results
      .map(function (product) {
        return (
          '<button class="search-result-card flex min-w-[240px] flex-1 items-center gap-4 rounded-2xl p-4 text-left" data-product-id="' + product.id + '">' +
          '<div class="h-13 w-13 rounded-xl bg-white/5 p-2">' + renderProductVisual(product.id, "h-full w-full rounded-lg") + "</div>" +
          '<div class="min-w-0 flex-1"><p class="text-sm font-bold text-white">' + product.name + '</p><p class="text-xs text-white/55">' + product.color + "</p></div>" +
          '<span class="text-xs uppercase tracking-[0.18em] text-[var(--brand-green)]">+ Add</span>' +
          "</button>"
        );
      })
      .join("");

    node.querySelectorAll("[data-product-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        closeSearch();
        openSizeSheet(button.dataset.productId);
      });
    });
  }

  function renderProductVisual(productId, className) {
    const product = PRODUCTS[productId] || PRODUCTS.obsidian;
    return (
      '<img src="' + product.img + '" alt="' + product.name + " " + product.color + '" class="' + className + ' object-contain" onerror="this.replaceWith((function(){var d=document.createElement(\'div\');d.className=\'' + className + ' product-placeholder rounded-lg px-2 text-[10px] font-bold uppercase tracking-[0.2em]\';d.textContent=\'Nitro Elite Speed\';return d;})())">' 
    );
  }

  function mountProductVisuals() {
    document.querySelectorAll("[data-product-visual]").forEach(function (node) {
      node.innerHTML = renderProductVisual(node.dataset.productVisual, node.dataset.visualClass || "h-full w-full object-contain");
    });
  }

  function setupNavbar() {
    const nav = document.getElementById("sticky-nav");
    const heroSection = document.getElementById("hero-canvas-section");
    const hamburger = document.getElementById("hamburger");
    const mobileOverlay = document.getElementById("mobile-nav-overlay");
    const mobileClose = document.getElementById("mobile-nav-close");

    if (nav) {
      nav.classList.add("glass");
    }

    function toggleMobile(open) {
      if (!mobileOverlay || !hamburger) {
        return;
      }
      mobileOverlay.classList.toggle("open", open);
      hamburger.classList.toggle("active", open);
      const hasOpen =
        open ||
        document.getElementById("cart-drawer")?.classList.contains("open") ||
        document.getElementById("size-sheet")?.classList.contains("open") ||
        document.getElementById("search-panel")?.classList.contains("open");
      setBodyLock(Boolean(hasOpen));
    }

    if (hamburger) {
      hamburger.addEventListener("click", function () {
        toggleMobile(!mobileOverlay.classList.contains("open"));
      });
    }

    if (mobileClose) {
      mobileClose.addEventListener("click", function () {
        toggleMobile(false);
      });
    }

    mobileOverlay?.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggleMobile(false);
      });
    });

    if (motionReduced) {
      nav?.classList.add("visible", "scrolled-far");
      return;
    }

    if (heroSection && window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.ScrollTrigger.create({
        trigger: "#hero-canvas-section",
        start: "top top",
        end: "bottom top",
        onUpdate: function (self) {
          if (self.progress > 0.3) {
            nav.classList.add("visible");
          } else {
            nav.classList.remove("visible");
          }
          nav.classList.toggle("scrolled-far", self.progress >= 1);
        }
      });
    } else {
      nav?.classList.add("visible", "scrolled-far");
    }
  }

  function setupPreloader() {
    const preloader = document.getElementById("preloader");
    const main = document.getElementById("main-content");
    if (!preloader || !main) {
      return;
    }

    window.setTimeout(function () {
      preloader.classList.add("fade-out");
      main.classList.add("ready");
      window.setTimeout(function () {
        preloader.style.display = "none";
      }, 500);
    }, 1800);
  }

  function setupHeroCanvas() {
    const canvas = document.getElementById("hero-canvas");
    const heroText = document.getElementById("hero-text");
    const brand = document.getElementById("hero-brand-label");
    const stat = document.getElementById("hero-speed-stat");
    if (!canvas) {
      heroText?.classList.remove("hero-reveal");
      return;
    }

    const context = canvas.getContext("2d");
    const frameCount = 192;
    const images = [];
    const heroObj = { frame: 0 };

    function fitCanvas() {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(ratio, ratio);
      drawFrame(Math.round(heroObj.frame));
    }

    function drawFallback() {
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      const gradient = context.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, "#0a0a0a");
      gradient.addColorStop(1, "#203c14");
      context.fillStyle = gradient;
      context.fillRect(0, 0, rect.width, rect.height);
      context.fillStyle = "rgba(255,255,255,0.08)";
      context.font = "700 16px Satoshi, sans-serif";
      context.fillText("NITRO ELITE SPEED SERIES", 36, rect.height - 48);
    }

    function drawFrame(index) {
      const rect = canvas.getBoundingClientRect();
      const image = images[index];
      context.clearRect(0, 0, rect.width, rect.height);
      if (!image || !image.complete || !image.naturalWidth) {
        drawFallback();
        return;
      }

      const hRatio = rect.width / image.naturalWidth;
      const vRatio = rect.height / image.naturalHeight;
      const ratio = Math.max(hRatio, vRatio);
      const width = image.naturalWidth * ratio;
      const height = image.naturalHeight * ratio;
      const x = (rect.width - width) / 2;
      const y = (rect.height - height) / 2;
      context.drawImage(image, x, y, width, height);
    }

    function preloadFrames() {
      for (let i = 0; i < frameCount; i += 1) {
        (function (frameIndex) {
          const img = new Image();
          img.onload = function () {
            if (frameIndex === 0) {
              drawFrame(0);
            }
          };
          img.src = "./assets/frames/ezgif-frame-" + String(frameIndex + 1).padStart(3, "0") + ".jpg";
          images[frameIndex] = img;
        })(i);
      }

      if (images[0] && images[0].complete && images[0].naturalWidth > 0) {
        drawFrame(0);
      }
    }

    fitCanvas();
    preloadFrames();
    window.addEventListener("resize", fitCanvas);

    if (motionReduced || !window.gsap || !window.ScrollTrigger) {
      heroText?.classList.remove("hero-reveal");
      brand?.classList.remove("opacity-0");
      stat?.classList.remove("opacity-0");
      drawFrame(1);
      document.getElementById("sticky-nav")?.classList.add("visible", "scrolled-far");
      return;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.to(heroObj, {
      frame: frameCount - 1,
      ease: "none",
      snap: "frame",
      scrollTrigger: {
        trigger: "#hero-canvas-section",
        start: "top 36px",
        end: "bottom bottom",
        scrub: true
      },
      onUpdate: function () {
        drawFrame(Math.round(heroObj.frame));
      }
    });

    window.gsap.to(".hero-reveal", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#hero-canvas-section",
        start: "top+=20% top",
        end: "top+=35% top",
        scrub: true
      }
    });

    window.gsap.to([brand, stat], {
      opacity: 1,
      duration: 0.8,
      stagger: 0.08,
      scrollTrigger: {
        trigger: "#hero-canvas-section",
        start: "top+=45% top",
        end: "top+=60% top",
        scrub: true
      }
    });
  }

  function setupCoreActions() {
    document.querySelectorAll(".add-to-cart-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        openSizeSheet(button.dataset.productId);
      });
    });

    document.getElementById("cart-btn")?.addEventListener("click", openCart);
    document.getElementById("cart-close")?.addEventListener("click", closeCart);
    document.getElementById("cart-overlay")?.addEventListener("click", closeCart);
    document.getElementById("search-btn")?.addEventListener("click", openSearch);
    document.getElementById("search-close")?.addEventListener("click", closeSearch);
    document.getElementById("search-overlay")?.addEventListener("click", closeSearch);
    document.getElementById("size-close")?.addEventListener("click", closeSizeSheet);
    document.getElementById("size-overlay")?.addEventListener("click", closeSizeSheet);

    document.getElementById("confirm-size")?.addEventListener("click", function () {
      if (!pendingProductId || !selectedSize) {
        return;
      }
      addToCart(pendingProductId, selectedSize);
      closeSizeSheet();
    });

    document.getElementById("checkout-btn")?.addEventListener("click", function () {
      window.alert("Checkout coming soon!\n\nThis is a portfolio demo — no real transactions.");
    });

    const searchInput = document.getElementById("search-input");
    searchInput?.addEventListener("input", function () {
      renderSearchResults(searchInput.value);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeCart();
        closeSizeSheet();
        closeSearch();
        document.getElementById("mobile-nav-overlay")?.classList.remove("open");
        document.getElementById("hamburger")?.classList.remove("active");
        setBodyLock(false);
      }
    });
  }

  function setupEmailForm() {
    const form = document.getElementById("email-form");
    const success = document.getElementById("email-success");
    if (!form || !success) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      form.style.opacity = "0";
      form.style.pointerEvents = "none";
      window.setTimeout(function () {
        form.style.display = "none";
        success.classList.remove("hidden");
        success.classList.add("flex");
      }, 240);
    });
  }

  function setupCarousel() {
    const carousel = document.getElementById("athlete-carousel");
    if (!carousel) {
      return;
    }

    const dots = Array.from(document.querySelectorAll(".athlete-dot"));
    const cards = Array.from(carousel.children);

    function updateDots() {
      const activeIndex = Math.round(carousel.scrollLeft / (cards[0].offsetWidth + 2));
      dots.forEach(function (dot, index) {
        dot.classList.toggle("active", index === activeIndex);
      });
    }

    document.getElementById("athlete-prev")?.addEventListener("click", function () {
      carousel.scrollBy({ left: -(cards[0].offsetWidth + 2), behavior: "smooth" });
    });

    document.getElementById("athlete-next")?.addEventListener("click", function () {
      carousel.scrollBy({ left: cards[0].offsetWidth + 2, behavior: "smooth" });
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        carousel.scrollTo({ left: index * (cards[0].offsetWidth + 2), behavior: "smooth" });
      });
    });

    carousel.addEventListener("scroll", updateDots, { passive: true });
    updateDots();
  }

  function setupEssentialsHover() {
    document.querySelectorAll(".essentials-card").forEach(function (card) {
      const shoe = card.querySelector(".essentials-shoe");
      const background = card.querySelector(".editorial-image");
      card.addEventListener("mouseenter", function () {
        shoe?.style.setProperty("transform", "scale(1.18) translateY(-8px)");
        background?.style.setProperty("transform", "scale(1.05)");
      });
      card.addEventListener("mouseleave", function () {
        shoe?.style.setProperty("transform", "");
        background?.style.setProperty("transform", "");
      });
    });
  }

  function setupCounters() {
    const counters = document.querySelectorAll(".stat-counter[data-target]");
    if (!counters.length) {
      return;
    }

    function animateCounter(node) {
      const target = Number(node.dataset.target);
      const suffix = node.dataset.suffix || "";
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
    }

    if (motionReduced || !window.gsap || !window.ScrollTrigger) {
      counters.forEach(function (counter) {
        counter.textContent = counter.dataset.target + (counter.dataset.suffix || "");
      });
      return;
    }

    window.ScrollTrigger.create({
      trigger: "#sustainability",
      start: "top 75%",
      once: true,
      onEnter: function () {
        counters.forEach(animateCounter);
      }
    });
  }

  function setupAnimations() {
    if (motionReduced || !window.gsap || !window.ScrollTrigger) {
      document.querySelectorAll(".hero-reveal").forEach(function (node) {
        node.style.opacity = "1";
        node.style.transform = "none";
      });
      return;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);

    if (document.querySelector(".word")) {
      window.gsap.from(".word", {
        opacity: 0,
        y: 40,
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#product-intro",
          start: "top 60%"
        }
      });
    }

    if (document.querySelector(".product-card")) {
      window.gsap.from(".product-card", {
        opacity: 0,
        y: 40,
        stagger: 0.14,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#product-grid",
          start: "top 75%"
        }
      });
    }

    if (document.getElementById("forest-bg")) {
      window.gsap.to("#forest-bg", {
        backgroundPositionY: "70%",
        ease: "none",
        scrollTrigger: {
          trigger: "#forest-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
      window.gsap.from("#forest-content > *", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#forest-section",
          start: "top 65%"
        }
      });
    }

    if (document.getElementById("jungle-bg")) {
      window.gsap.to("#jungle-bg", {
        backgroundPositionY: "70%",
        ease: "none",
        scrollTrigger: {
          trigger: "#jungle-section",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }

    if (document.querySelector("#snarl-copy > div")) {
      window.gsap.from("#snarl-copy > div > *", {
        opacity: 0,
        x: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#snarl-copy",
          start: "top 70%"
        }
      });
    }

    if (document.querySelector(".essentials-card")) {
      window.gsap.from(".essentials-card", {
        opacity: 0,
        y: 48,
        stagger: 0.18,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#essentials",
          start: "top 75%"
        }
      });
    }

    if (document.querySelector("#email-section > div")) {
      window.gsap.from("#email-section > div > *", {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#email-section",
          start: "top 75%"
        }
      });
    }
  }

  function ready() {
    loadCart();
    mountProductVisuals();
    renderCart();
    setupPreloader();
    setupNavbar();
    setupHeroCanvas();
    setupCoreActions();
    setupEmailForm();
    setupCarousel();
    setupEssentialsHover();
    setupCounters();
    setupAnimations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
})();
