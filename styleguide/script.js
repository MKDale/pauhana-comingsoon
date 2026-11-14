(function () {
  "use strict";

  var PALETTE = [
    { id: "scoop-yellow", name: "scoop yellow", hex: "#FFB814", text: "#010B13", use: "Primary brand color. Large fields and label backgrounds." },
    { id: "sunrise-orange", name: "sunrise orange", hex: "#FE4B00", text: "#010B13", use: "Energy color for splats, stickers and the spiked line." },
    { id: "dark-sea-blue", name: "dark sea blue", hex: "#007B97", text: "#F9FBFC", use: "Grounding color. Works for body text with white." },
    { id: "coral-blue", name: "coral blue", hex: "#4FE4F9", text: "#010B13", use: "Bright aqua accent for highlights and the classic line." },
    { id: "sea-foam-white", name: "sea foam white", hex: "#F9FBFC", text: "#010B13", use: "Page and label background." },
    { id: "ink", name: "ink", hex: "#010B13", text: "#F9FBFC", use: "Wordmark, body text and the one color logo." }
  ];

  /* WCAG contrast */
  function channel(c) {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function luminance(hex) {
    var h = hex.replace("#", "");
    var r = parseInt(h.slice(0, 2), 16);
    var g = parseInt(h.slice(2, 4), 16);
    var b = parseInt(h.slice(4, 6), 16);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }
  function ratio(a, b) {
    var la = luminance(a);
    var lb = luminance(b);
    var hi = Math.max(la, lb);
    var lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }

  /* Toast */
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 1600);
  }

  /* Copy helper with a fallback for older browsers */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject();
      } catch (e) { reject(e); }
    });
  }

  /* Swatches */
  var swatchWrap = document.getElementById("swatches");
  PALETTE.forEach(function (c) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "swatch";
    btn.style.background = c.hex;
    btn.style.color = c.text;
    btn.setAttribute("aria-label", "Copy " + c.name + " hex code " + c.hex);
    btn.innerHTML =
      '<span class="swatch__name"></span>' +
      '<span><span class="swatch__hex"></span><span class="swatch__use" style="display:block"></span></span>';
    btn.querySelector(".swatch__name").textContent = c.name;
    btn.querySelector(".swatch__hex").textContent = c.hex;
    btn.querySelector(".swatch__use").textContent = c.use;
    btn.addEventListener("click", function () {
      copyText(c.hex).then(
        function () { showToast("Copied " + c.hex); },
        function () { showToast("Could not copy. Select the code by hand."); }
      );
    });
    swatchWrap.appendChild(btn);
  });

  /* Button demo */
  Array.prototype.slice.call(document.querySelectorAll("[data-demo]")).forEach(function (el) {
    el.addEventListener("click", function () { showToast(el.getAttribute("data-demo")); });
  });


  /* Contrast checker */
  var fg = document.getElementById("fg");
  var bg = document.getElementById("bg");
  var preview = document.getElementById("preview");
  var result = document.getElementById("result");

  function fill(select, selected) {
    PALETTE.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c.hex;
      o.textContent = c.name + " (" + c.hex + ")";
      if (c.id === selected) o.selected = true;
      select.appendChild(o);
    });
  }
  fill(fg, "ink");
  fill(bg, "scoop-yellow");

  function update() {
    preview.style.color = fg.value;
    preview.style.background = bg.value;
    var r = ratio(fg.value, bg.value);
    var rounded = (Math.round(r * 10) / 10).toFixed(1);
    var verdict;
    if (r >= 4.5) verdict = "Passes for all text.";
    else if (r >= 3) verdict = "Large text only (24px and up).";
    else verdict = "Fails. Do not use for text.";
    result.textContent = rounded + " to 1. " + verdict;
  }
  fg.addEventListener("change", update);
  bg.addEventListener("change", update);
  update();

  /* Display type tester */
  var input = document.getElementById("tester-input");
  var out = document.getElementById("tester-oi");
  var note = document.getElementById("tester-note");
  function updateTester() {
    var v = input.value || "";
    out.textContent = v;
    var warnings = [];
    if (/pau\s*hana/i.test(v)) warnings.push("Never set \"Pau Hana\" in Oi. Use the logo artwork.");
    if (v.length > 26) warnings.push("Oi is for short headings. Keep it to two lines at most.");
    if (/\b21\s*\+|alcohol|contains/i.test(v)) warnings.push("Alcohol and 21+ notices stay in Josefin Sans.");
    note.textContent = warnings.join(" ");
  }
  input.addEventListener("input", updateTester);
  updateTester();

  /* Active nav link on scroll */
  var links = Array.prototype.slice.call(document.querySelectorAll(".topbar__nav a"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { if (s) io.observe(s); });
  }
})();
