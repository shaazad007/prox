/**
 * Heading Image Slider — GitHub-hosted version
 * ---------------------------------------------------------------------
 * YE KAISE USE KARNA HAI:
 * 1. Is file ko GitHub repo mein push karein.
 * 2. jsDelivr ka public CDN link banayein:
 *      https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/scc-heading-image-slider.js
 *    (@main ki jagah apni branch ka naam bhi de sakte hain)
 * 3. Apni Flutter app se jab post ka body_html banayein, to H3 blocks ke
 *    BILKUL AAKHIR MEIN ye line jod dein:
 *      <script src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/scc-heading-image-slider.js"></script>
 *
 * CONFLICT-SAFE KYUN HAI:
 * - Script apna "container" khud dhoondta hai (document.currentScript ke
 *   zariye) — sirf usi post ke H3 elements ko dekhta hai jis post ke
 *   andar is script ka <script src="..."> tag likha gaya hai.
 * - Saari CSS classes "scc-his-" prefix ke saath hain (unique naam).
 * - Agar kabhi galti se do dafa load ho jaye, khud detect karke dobara
 *   process nahi karega.
 *
 * NOTE: jsDelivr public GitHub repos ko kuch der (kabhi 10-15 minute)
 * baad cache karta hai — file update karne ke baad turant changes na
 * dikhein to thoda wait karein, ya purging ke liye jsdelivr.com/tools
 * purge use karein.
 */
(function () {
  "use strict";

  var thisScript = document.currentScript;
  var container  = thisScript ? thisScript.parentElement : null;

  if (!container) { return; }

  // Agar is container par pehle se process ho chuka hai to dobara mat karo.
  if (container.getAttribute("data-scc-his-done") === "1") { return; }

  var QUERY_KEY    = "imgpage";
  var ALLOWED_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"];

  // Container ke andar jo heading tag (H3 waghera) sab se zyada bar
  // (kam se kam 2) repeat ho rahi hai, wahi "slide" tag maante hain.
  var chosenTag = null;
  var bestCount = 1;

  for (var t = 0; t < ALLOWED_TAGS.length; t++) {
    var tag   = ALLOWED_TAGS[t];
    var count = container.getElementsByTagName(tag).length;
    if (count > bestCount) {
      bestCount = count;
      chosenTag = tag;
    }
  }

  if (!chosenTag) { return; } // Kaafi headings nahi milin.

  var headings = container.getElementsByTagName(chosenTag);

  // NodeList live hoti hai, is liye pehle ek static array bana lete hain.
  var headingsArray = Array.prototype.slice.call(headings);
  var slides = [];

  headingsArray.forEach(function (node) {
    var img = node.querySelector("img");
    if (!img) { return; }

    var clone     = node.cloneNode(true);
    var clonedImg = clone.querySelector("img");
    if (clonedImg) { clone.removeChild(clonedImg); }

    slides.push({
      image: img.getAttribute("src"),
      caption: clone.textContent.replace(/\s+/g, " ").trim()
    });
  });

  var total = slides.length;
  if (total < 2) { return; }

  // ---- By default sirf ek hi image nazar aaye: saare original H3 ----
  // ---- blocks hata dete hain, sirf current slide dikhate hain.    ----
  headingsArray.forEach(function (node) {
    if (node.parentNode) { node.parentNode.removeChild(node); }
  });

  var params  = new URLSearchParams(window.location.search);
  var current = parseInt(params.get(QUERY_KEY), 10);
  if (!current || current < 1) { current = 1; }
  if (current > total) { current = total; }

  var index  = current - 1;
  var slide  = slides[index];
  var number = total - index; // Countdown: total se 1 tak.

  function buildUrl(pageNum) {
    var p = new URLSearchParams(window.location.search);
    p.set(QUERY_KEY, pageNum);
    return window.location.pathname + "?" + p.toString();
  }

  var wrapper = document.createElement("div");
  wrapper.className = "scc-his-wrapper";

  var imageDiv = document.createElement("div");
  imageDiv.className = "scc-his-image";
  var imgEl = document.createElement("img");
  imgEl.src = slide.image;
  imgEl.loading = "lazy";
  imageDiv.appendChild(imgEl);
  wrapper.appendChild(imageDiv);

  var navDiv = document.createElement("div");
  navDiv.className = "scc-his-nav";

  if (current > 1) {
    var backA = document.createElement("a");
    backA.href = buildUrl(current - 1);
    backA.className = "scc-his-btn scc-his-back";
    backA.innerHTML = "&lsaquo; Back";
    navDiv.appendChild(backA);
  } else {
    var backSpan = document.createElement("span");
    backSpan.className = "scc-his-btn scc-his-back scc-his-disabled";
    backSpan.innerHTML = "&lsaquo; Back";
    navDiv.appendChild(backSpan);
  }

  if (current < total) {
    var nextA = document.createElement("a");
    nextA.href = buildUrl(current + 1);
    nextA.className = "scc-his-btn scc-his-next";
    nextA.innerHTML = "Next &rsaquo;";
    navDiv.appendChild(nextA);
  } else {
    var nextSpan = document.createElement("span");
    nextSpan.className = "scc-his-btn scc-his-next scc-his-disabled";
    nextSpan.innerHTML = "Next &rsaquo;";
    navDiv.appendChild(nextSpan);
  }

  wrapper.appendChild(navDiv);

  var captionEl = document.createElement("h3");
  captionEl.className = "scc-his-caption";
  captionEl.textContent = number + (slide.caption ? ". " + slide.caption : ".");
  wrapper.appendChild(captionEl);

  // Wrapper ko usi jagah daal dete hain jahan script tag khud tha,
  // taake post ke content flow mein sahi jagah par nazar aaye.
  container.insertBefore(wrapper, thisScript);

  container.setAttribute("data-scc-his-done", "1");

  // CSS sirf ek baar poore page par inject ho.
  if (!document.getElementById("scc-his-styles")) {
    var style = document.createElement("style");
    style.id = "scc-his-styles";
    style.textContent =
      ".scc-his-wrapper { max-width: 100%; margin: 20px 0; }" +
      ".scc-his-image img { display: block; width: 100%; max-width: 100%; height: auto; border-radius: 4px; }" +
      ".scc-his-nav { display: flex; justify-content: space-between; gap: 10px; margin: 14px 0; }" +
      ".scc-his-btn { flex: 1; display: block; text-align: center; padding: 12px 18px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 4px; background: #111; color: #fff; box-sizing: border-box; }" +
      ".scc-his-btn.scc-his-back { background: #888; }" +
      ".scc-his-btn.scc-his-disabled { opacity: 0.5; cursor: not-allowed; }" +
      ".scc-his-caption { font-size: 22px; font-weight: 700; margin: 10px 0; }";
    document.head.appendChild(style);
  }
})();
