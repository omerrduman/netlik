(function () {
  "use strict";

  var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  var currentScript = document.currentScript;
  if (!currentScript) return;

  var freelancerId = currentScript.getAttribute("data-id");
  if (!freelancerId || !UUID_RE.test(freelancerId)) {
    console.warn("[netlik] embed.js: missing or invalid data-id attribute");
    return;
  }

  // Kendi origin'imizi script'in kendi src'sinden türetiyoruz, böylece bu
  // dosya localhost / preview / production ortamlarında değişiklik
  // gerektirmeden çalışır.
  var NETLIK_ORIGIN;
  try {
    NETLIK_ORIGIN = new URL(currentScript.src).origin;
  } catch {
    console.warn("[netlik] embed.js: could not determine origin");
    return;
  }

  var widgetUrl = NETLIK_ORIGIN + "/widget/" + encodeURIComponent(freelancerId);

  var isOpen = false;

  var bubble = document.createElement("button");
  bubble.setAttribute("aria-label", "Sohbeti aç");
  bubble.style.position = "fixed";
  bubble.style.bottom = "20px";
  bubble.style.right = "20px";
  bubble.style.width = "56px";
  bubble.style.height = "56px";
  bubble.style.borderRadius = "50%";
  bubble.style.border = "none";
  bubble.style.background = "linear-gradient(135deg, #22d3ee, #fb923c)";
  bubble.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
  bubble.style.cursor = "pointer";
  bubble.style.zIndex = "2147483000";

  var panel = document.createElement("div");
  panel.style.position = "fixed";
  panel.style.bottom = "88px";
  panel.style.right = "20px";
  panel.style.width = "380px";
  panel.style.height = "600px";
  panel.style.maxWidth = "calc(100vw - 40px)";
  panel.style.maxHeight = "calc(100vh - 120px)";
  panel.style.borderRadius = "16px";
  panel.style.overflow = "hidden";
  panel.style.boxShadow = "0 8px 32px rgba(0,0,0,0.35)";
  panel.style.display = "none";
  panel.style.zIndex = "2147483000";

  var iframe = document.createElement("iframe");
  iframe.src = widgetUrl;
  iframe.title = "Netlik";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  panel.appendChild(iframe);

  function setOpen(next) {
    isOpen = next;
    panel.style.display = isOpen ? "block" : "none";
    bubble.setAttribute("aria-label", isOpen ? "Sohbeti kapat" : "Sohbeti aç");
  }

  bubble.addEventListener("click", function () {
    setOpen(!isOpen);
  });

  // Savunma amaçlı: sadece kendi iframe'imizin origin'inden gelen mesajlara tepki ver.
  window.addEventListener("message", function (event) {
    if (event.origin !== NETLIK_ORIGIN) return;
    var data = event.data;
    if (data && data.type === "netlik:close") {
      setOpen(false);
    }
  });

  document.body.appendChild(bubble);
  document.body.appendChild(panel);
})();
