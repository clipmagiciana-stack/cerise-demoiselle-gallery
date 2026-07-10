// Cerise Demoiselle Studio: WebAR Gallery Application Logic

// Product Catalog Dataset
const products = [
  {
    id: "koi-sensei",
    name: "Koï Sensei",
    description: "A beautifully detailed, artisanal round candle depicting a tranquil pond scene. Features a hand-painted swimming koï fish surrounded by blooming lotus flowers, cherry blossoms, and floating lily pads.",
    material: "Soy & Beeswax Blend",
    dimensions: "10 x 10 x 5 cm",
    weight: "380g",
    burnTime: "~45 Hours",
    fragrance: "Green Tea, Cherry Blossom & Bamboo",
    glb: "Koï Sensei.glb",
    image: "Koï Sensei.png"
  },
  {
    id: "fleur-de-lotus",
    name: "Fleur de Lotus",
    description: "An elegant candle sculpted in the shape of a fully bloomed lotus flower. Its organic layered petals create beautiful shadow play when lit, making it a peaceful addition to any sanctuary.",
    material: "Natural Beeswax & Soy",
    dimensions: "9.5 x 9.5 x 6 cm",
    weight: "250g",
    burnTime: "~35 Hours",
    fragrance: "Lotus Blossom, White Tea & Jasmine",
    glb: "Fleur de Lotus.glb",
    image: "Fleur de Lotus.png"
  },
  {
    id: "nymphea",
    name: "Nymphéa",
    description: "Inspired by Claude Monet's water lilies, Nymphéa is a delicate, floating-style candle that captures the raw elegance of wild aquatic flora. Highly detailed and hand-finished.",
    material: "Organic Soy Wax",
    dimensions: "9 x 9 x 4.5 cm",
    weight: "280g",
    burnTime: "~35 Hours",
    fragrance: "Water Lily, Cucumber & Sea Salt",
    glb: "Nymphéa.glb",
    image: "Nymphéa.png"
  },
  {
    id: "kyss",
    name: "Kyss",
    description: "A modern sculptural candle with abstract organic folds and flowing waves. Kyss represents warmth, connection, and contemporary art, serving as a statement sculpture for your mantelpiece.",
    material: "Premium Pillar Soy Wax",
    dimensions: "8 x 8 x 12 cm",
    weight: "420g",
    burnTime: "~50 Hours",
    fragrance: "Warm Amber, Sandalwood & Sweet Vanilla",
    glb: "Kyss.glb",
    image: "Kyss.png"
  },
  {
    id: "lit-de-fleurs",
    name: "Lit de Fleurs",
    description: "A stunning, wide candle with a top surface completely covered in a dense, detailed bed of tiny, delicate spring flowers. A feast for both the eyes and the senses.",
    material: "Pure Soy Wax",
    dimensions: "11 x 11 x 5.5 cm",
    weight: "400g",
    burnTime: "~40 Hours",
    fragrance: "Wild Rose, Peony & Fresh Freesia",
    glb: "Lit de Fleurs .glb", // Trailing space in file name preserved
    image: "Lit de Fleurs.png"
  },
  {
    id: "blue-nigel",
    name: "Blue Nigel",
    description: "A whimsical, stylized modern character candle in a serene powder blue shade. This art toy sculpture adds a playful, contemporary pop of design to your home decor.",
    material: "Soy Wax (Sculptural)",
    dimensions: "7 x 7.5 x 11 cm",
    weight: "310g",
    burnTime: "~30 Hours",
    fragrance: "Sea Mist, Driftwood & Sage",
    glb: "Blue Nigel.glb",
    image: "Blue Nigel.png"
  },
  {
    id: "green-nigel",
    name: "Green Nigel",
    description: "A whimsical, stylized modern character candle in a soft, elegant sage green tone. Blending playful character art with high-end craftsmanship, it is a perfect conversation starter.",
    material: "Soy Wax (Sculptural)",
    dimensions: "7 x 7.5 x 11 cm",
    weight: "310g",
    burnTime: "~30 Hours",
    fragrance: "Foret Pine, Sage & Eucalyptus",
    glb: "Green Nigel.glb",
    image: "Green Nigel.png"
  }
];

// Selectors
const productGrid = document.getElementById("product-grid");
const detailModal = document.getElementById("detail-modal");
const modalBackdrop = document.getElementById("modal-backdrop");
const closeModalBtn = document.getElementById("close-modal-btn");
const mainViewer = document.getElementById("main-viewer");
const hiddenArViewer = document.getElementById("hidden-ar-viewer");
const viewerLoader = document.getElementById("viewer-loader");

// Modal details selectors
const modalTitle = document.getElementById("exhibit-title");
const modalDescription = document.getElementById("exhibit-description");
const modalMaterial = document.getElementById("exhibit-material");
const modalDimensions = document.getElementById("exhibit-dimensions");
const modalWeight = document.getElementById("exhibit-weight");
const modalBurn = document.getElementById("exhibit-burn");
const modalFragrance = document.getElementById("exhibit-fragrance");
const modalArBtn = document.getElementById("modal-ar-btn");

// Model controls selectors
const btnRotate = document.getElementById("btn-rotate");
const btnReset = document.getElementById("btn-reset");

// QR Code modal selectors
const qrModal = document.getElementById("qr-modal");
const qrBackdrop = document.getElementById("qr-backdrop");
const closeQrBtn = document.getElementById("close-qr-btn");
const qrCodeImage = document.getElementById("qr-code-image");

// Active product variable
let activeProduct = null;

// Sniff Mobile/Tablet Device
function checkIsMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Generate QR Code URL using client-side API
function generateQRUrl(productId) {
  const mobileUrl = `${window.location.origin}${window.location.pathname}?ar=${encodeURIComponent(productId)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(mobileUrl)}&color=6b122e&margin=10`;
}

// Initialize Product Grid
function initGallery() {
  productGrid.innerHTML = "";
  
  products.forEach(product => {
    // Card Element creation
    const card = document.createElement("div");
    card.className = "exhibit-card";
    card.setAttribute("data-id", product.id);
    
    card.innerHTML = `
      <div class="card-image-container">
        <img src="${product.image}" alt="${product.name}" class="card-image" loading="lazy">
        <button class="card-ar-btn" title="View in Space">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <path d="M12 7l6 3.5V17l-6 3.5L6 17v-6.5L12 7z" />
            <path d="M12 7v13.5" />
            <path d="M6 10.5l6 3.5 6-3.5" />
          </svg>
        </button>
      </div>
      <div class="card-content">
        <h3 class="card-title">${product.name}</h3>
      </div>
    `;
    
    // Add Event Listeners to Card
    card.addEventListener("click", (e) => {
      const arBtn = card.querySelector(".card-ar-btn");
      
      // If clicked the AR button, launch AR flow
      if (e.target === arBtn || arBtn.contains(e.target)) {
        e.stopPropagation();
        triggerAR(product);
      } else {
        // Otherwise, open interactive 3D modal
        openProductModal(product);
      }
    });
    
    productGrid.appendChild(card);
  });
}

// Open Detail/Preview Modal
function openProductModal(product) {
  activeProduct = product;
  
  // Update specs UI text
  modalTitle.textContent = product.name;
  modalDescription.textContent = product.description;
  modalMaterial.textContent = product.material;
  modalDimensions.textContent = product.dimensions;
  modalWeight.textContent = product.weight;
  modalBurn.textContent = product.burnTime;
  modalFragrance.textContent = product.fragrance;
  
  // Show modal loader and update viewer source
  viewerLoader.style.opacity = "1";
  viewerLoader.style.pointerEvents = "all";
  
  mainViewer.src = product.glb;
  
  // Show modal container
  detailModal.style.display = "flex";
  // Force browser layout repaint before adding class to trigger transitions
  detailModal.offsetHeight; 
  detailModal.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scrolling
}

// Close Detail/Preview Modal
function closeProductModal() {
  detailModal.classList.remove("active");
  document.body.style.overflow = "";
  
  setTimeout(() => {
    detailModal.style.display = "none";
    mainViewer.src = ""; // Unload model from GPU memory
  }, 300);
  
  activeProduct = null;
}

// Trigger AR Flow (Mobile native WebAR vs Desktop QR fallback)
function triggerAR(product) {
  if (checkIsMobile()) {
    // If mobile, load model in hidden model viewer and trigger instant native AR
    hiddenArViewer.src = product.glb;
    
    // Give a brief delay for model-viewer to process GLTF path
    setTimeout(() => {
      hiddenArViewer.activateAR();
    }, 100);
  } else {
    // If desktop, show QR code scan modal
    qrCodeImage.src = generateQRUrl(product.id);
    
    qrModal.style.display = "flex";
    qrModal.offsetHeight;
    qrModal.classList.add("active");
  }
}

// Close QR Modal
function closeQrModal() {
  qrModal.classList.remove("active");
  setTimeout(() => {
    qrModal.style.display = "none";
    qrCodeImage.src = ""; // Clear src
  }, 300);
}

// Setup Event Handlers
function setupEventListeners() {
  // Modal Close triggers
  closeModalBtn.addEventListener("click", closeProductModal);
  modalBackdrop.addEventListener("click", closeProductModal);
  
  // QR Close triggers
  closeQrBtn.addEventListener("click", closeQrModal);
  qrBackdrop.addEventListener("click", closeQrModal);
  
  // Model loading finished event handler
  mainViewer.addEventListener("load", () => {
    viewerLoader.style.opacity = "0";
    viewerLoader.style.pointerEvents = "none";
  });
  
  // Viewer Controls (Rotate & Reset view)
  btnRotate.addEventListener("click", () => {
    const isRotating = mainViewer.hasAttribute("auto-rotate");
    if (isRotating) {
      mainViewer.removeAttribute("auto-rotate");
      btnRotate.classList.remove("active");
    } else {
      mainViewer.setAttribute("auto-rotate", "");
      btnRotate.classList.add("active");
    }
  });
  
  btnReset.addEventListener("click", () => {
    // Reset camera-orbit and camera-target to default values
    mainViewer.cameraOrbit = "unset";
    mainViewer.cameraTarget = "unset";
  });
  
  // Modal main AR trigger
  modalArBtn.addEventListener("click", () => {
    if (activeProduct) {
      triggerAR(activeProduct);
    }
  });
}

// Check if mobile has loaded via QR scan URL '?ar=koi-sensei'
function checkIncomingARParameter() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetArId = urlParams.get("ar");
  
  if (targetArId) {
    const product = products.find(p => p.id === targetArId);
    if (product) {
      // Clear parameter from address bar history to keep URL clean
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // On mobile, web security requires a user gesture to start AR camera.
      // So we show a clean overlay to prompt the user to trigger AR.
      showArPromptOverlay(product);
    }
  }
}

// Prompt overlay to capture User Gesture for AR launch on page load
function showArPromptOverlay(product) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.zIndex = "9999";
  overlay.style.background = "#FAF8F5";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.padding = "30px";
  overlay.style.textAlign = "center";
  
  overlay.innerHTML = `
    <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 32px; color: #6b122e; margin-bottom: 12px;">Place in Your Room</h2>
    <p style="font-family: 'Inter', sans-serif; font-size: 15px; color: #78716c; margin-bottom: 30px; max-width: 320px;">
      Tap the button below to materialize <strong>${product.name}</strong> in your physical environment.
    </p>
    <button id="launch-ar-prompt-btn" class="modal-ar-btn" style="max-width: 280px;">
      Launch AR Camera
    </button>
  `;
  
  document.body.appendChild(overlay);
  
  const launchBtn = overlay.querySelector("#launch-ar-prompt-btn");
  launchBtn.addEventListener("click", () => {
    // Launch WebAR camera
    triggerAR(product);
    
    // Remove overlay after a small delay
    setTimeout(() => {
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.4s ease";
      setTimeout(() => overlay.remove(), 400);
    }, 1000);
  });
}

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  initGallery();
  setupEventListeners();
  checkIncomingARParameter();
});
