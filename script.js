/* =============================================================
   Minder — Akıllı Yönlendirme (Smart Redirect)
   Cihaz tespiti: iOS -> App Store, Android -> Play Store,
   Desktop -> masaüstü vitrini gösterilir.
   ============================================================= */
(function () {
  "use strict";

  // --- Yapılandırma --------------------------------------------
  var REDIRECT_DELAY_MS = 2000; // 2 saniye
  var APP_STORE_URL = "#";      // TODO: App Store linki güncellenecek
  var PLAY_STORE_URL = "#";     // TODO: Play Store linki güncellenecek

  // --- DOM referansları ----------------------------------------
  var redirectScreen = document.getElementById("redirect-screen");
  var redirectText = document.getElementById("redirect-text");
  var desktopContent = document.getElementById("desktop-content");
  var yearEl = document.getElementById("year");

  // --- Cihaz tespiti -------------------------------------------
  var ua = navigator.userAgent || navigator.vendor || window.opera || "";

  // iOS: iPhone/iPad/iPod. iPadOS 13+ Safari UA'sı "Mac" der,
  // bu yüzden MacIntel + dokunmatik kontrolü eklenir.
  var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  if (!isIOS && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    isIOS = true;
  }

  // Android
  var isAndroid = /Android/i.test(ua);

  // --- Yönlendirme mantığı -------------------------------------
  if (isIOS) {
    showRedirect("Seni App Store'a yönlendiriyoruz...", APP_STORE_URL);
  } else if (isAndroid) {
    showRedirect("Seni Play Store'a yönlendiriyoruz...", PLAY_STORE_URL);
  } else {
    showDesktop();
  }

  // --- Yardımcı fonksiyonlar -----------------------------------
  function showRedirect(message, url) {
    if (redirectText) redirectText.textContent = message;
    if (redirectScreen) redirectScreen.classList.remove("hidden");
    if (desktopContent) desktopContent.classList.add("hidden");

    window.setTimeout(function () {
      // '#' ise gerçek yönlendirme yapma (yer tutucu)
      if (url && url !== "#") {
        window.location.href = url;
      }
    }, REDIRECT_DELAY_MS);
  }

  function showDesktop() {
    if (redirectScreen) redirectScreen.classList.add("hidden");
    if (desktopContent) desktopContent.classList.remove("hidden");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }
})();
