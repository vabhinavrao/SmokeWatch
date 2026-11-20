/**
 * SmokeWatch - Progressive Web App Registration & Native Install Prompt
 */

(function() {
  // 1. Register Service Worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => {
          console.log("[PWA] ServiceWorker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] ServiceWorker registration failed:", err);
        });
    });
  }

  // 2. Handle Native Install Prompt (beforeinstallprompt)
  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install buttons if present
    const installBtns = document.querySelectorAll(".btn-pwa-install");
    installBtns.forEach(btn => {
      btn.style.display = "inline-flex";
      btn.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        installBtns.forEach(b => b.style.display = "none");
      });
    });
  });

  window.addEventListener("appinstalled", () => {
    console.log("[PWA] SmokeWatch application was successfully installed.");
    deferredPrompt = null;
    const installBtns = document.querySelectorAll(".btn-pwa-install");
    installBtns.forEach(btn => btn.style.display = "none");
  });

  // Hide install buttons if already running in standalone PWA mode
  if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
    document.addEventListener("DOMContentLoaded", () => {
      const installBtns = document.querySelectorAll(".btn-pwa-install");
      installBtns.forEach(btn => btn.style.display = "none");
    });
  }
})();
