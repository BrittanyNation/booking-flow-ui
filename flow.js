/* Atlas Bike Tours — working booking flow.
   State lives in localStorage so the tour, date, riders, bikes, and
   add-ons chosen on steps 1-2 travel to checkout and confirmation.
   Front-end demo only: no real booking is made, no payment is taken. */
(function () {
  "use strict";

  var STATE_KEY = "atlas-booking-v1";
  var BOOKED_KEY = "atlas-last-booking-v1";
  var TAX_RATE = 0.08;

  var TOURS = {
    coastal:  { name: "Coastal Sunrise Ride", price: 68,  departs: "7:00 AM" },
    city:     { name: "Old Town City Loop",   price: 54,  departs: "10:00 AM" },
    vineyard: { name: "Vineyard Valley Ride", price: 112, departs: "9:00 AM" }
  };
  var BIKES = {
    hybrid: { name: "Comfort hybrid", perRider: 0 },
    ebike:  { name: "E-bike",         perRider: 18 },
    road:   { name: "Road bike",      perRider: 12 }
  };
  var ADDONS = {
    picnic: { name: "Picnic basket",        price: 24 },
    photo:  { name: "Photo package",        price: 15 },
    flex:   { name: "Flexible cancellation", price: 9 }
  };

  function defaults() {
    return {
      tour: "coastal", date: "2026-11-07", riders: 2, bike: "hybrid",
      addons: { picnic: true, photo: false, flex: false }
    };
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STATE_KEY));
      if (s && TOURS[s.tour]) return Object.assign(defaults(), s);
    } catch (e) {}
    return defaults();
  }
  function save(s) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function totals(s) {
    var tour = TOURS[s.tour], bike = BIKES[s.bike] || BIKES.hybrid;
    var lines = [];
    lines.push({ label: s.riders + (s.riders === 1 ? " rider" : " riders") + " × $" + tour.price, amount: s.riders * tour.price });
    if (bike.perRider > 0) {
      lines.push({ label: bike.name + " — " + s.riders + " × $" + bike.perRider, amount: bike.perRider * s.riders });
    }
    Object.keys(ADDONS).forEach(function (k) {
      if (s.addons[k]) lines.push({ label: ADDONS[k].name, amount: ADDONS[k].price });
    });
    var subtotal = lines.reduce(function (sum, l) { return sum + l.amount; }, 0);
    var tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    return { lines: lines, subtotal: subtotal, tax: tax, total: subtotal + tax };
  }
  function money(n) { return "$" + n.toFixed(2); }
  function fmtDate(iso, withTime, tourKey) {
    if (!iso) return "";
    var parts = iso.split("-").map(Number);
    var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var out = days[d.getUTCDay()] + ", " + months[d.getUTCMonth()] + " " + d.getUTCDate();
    if (withTime) out += " · " + TOURS[tourKey].departs;
    return out;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  /* Render the "Your ride" summary <dl> from state. */
  function renderSummary(dl, s, totalLabel) {
    if (!dl) return;
    var t = totals(s), tour = TOURS[s.tour];
    var rows = [
      '<div class="row"><dt>Tour</dt><dd><strong>' + esc(tour.name) + "</strong></dd></div>",
      '<div class="row"><dt>Date</dt><dd>' + esc(fmtDate(s.date, true, s.tour)) + "</dd></div>"
    ];
    t.lines.forEach(function (l) {
      rows.push('<div class="row"><dt>' + esc(l.label) + "</dt><dd>" + money(l.amount) + "</dd></div>");
    });
    rows.push('<div class="row"><dt>Taxes &amp; fees</dt><dd>' + money(t.tax) + "</dd></div>");
    rows.push('<div class="row total"><dt>' + (totalLabel || "Total due today") + "</dt><dd>" + money(t.total) + "</dd></div>");
    dl.innerHTML = rows.join("");
    return t;
  }

  /* ---------- Step 1: choose a tour ---------- */
  function initIndex() {
    var cards = document.querySelectorAll("[data-tour-card]");
    if (!cards.length) return;
    var state = load();
    function render() {
      Array.prototype.forEach.call(cards, function (card) {
        var key = card.getAttribute("data-tour-card");
        var on = key === state.tour;
        card.classList.toggle("selected", on);
        var badge = card.querySelector(".badge");
        if (badge) {
          if (!badge.getAttribute("data-orig")) badge.setAttribute("data-orig", badge.textContent);
          badge.textContent = on ? "Selected" : badge.getAttribute("data-orig");
        }
        var btn = card.querySelector("[data-choose]");
        if (btn) {
          btn.textContent = on ? "Continue with this tour →" : "Choose this tour";
          btn.classList.toggle("btn-primary", on);
          btn.classList.toggle("btn-ghost", !on);
        }
      });
    }
    Array.prototype.forEach.call(cards, function (card) {
      var btn = card.querySelector("[data-choose]");
      if (btn) btn.addEventListener("click", function () {
        state.tour = card.getAttribute("data-tour-card");
        save(state); render();
      });
    });
    render();
  }

  /* ---------- Step 2: date, riders, bikes, add-ons ---------- */
  function initDetails() {
    var dateEl = document.getElementById("date");
    if (!dateEl) return;
    var state = load();
    var ridersEl = document.getElementById("riders");
    var bikeEl = document.getElementById("bike");
    var dl = document.querySelector(".summary dl");
    var dateErr = document.getElementById("err-date");
    var stepperTour = document.getElementById("stepper-tour");

    /* restore saved selections */
    dateEl.value = state.date;
    ridersEl.selectedIndex = Math.min(state.riders - 1, ridersEl.options.length - 1);
    bikeEl.selectedIndex = state.bike === "ebike" ? 1 : state.bike === "road" ? 2 : 0;
    var boxes = { picnic: document.getElementById("addon-picnic"), photo: document.getElementById("addon-photo"), flex: document.getElementById("addon-flex") };
    Object.keys(boxes).forEach(function (k) { if (boxes[k]) boxes[k].checked = !!state.addons[k]; });

    function sync() {
      state.date = dateEl.value;
      state.riders = ridersEl.selectedIndex + 1;
      state.bike = bikeEl.selectedIndex === 1 ? "ebike" : bikeEl.selectedIndex === 2 ? "road" : "hybrid";
      Object.keys(boxes).forEach(function (k) { if (boxes[k]) state.addons[k] = boxes[k].checked; });
      save(state);
      renderSummary(dl, state);
      if (stepperTour) stepperTour.textContent = TOURS[state.tour].name;
    }
    [dateEl, ridersEl, bikeEl].forEach(function (el) { el.addEventListener("change", sync); });
    Object.keys(boxes).forEach(function (k) { if (boxes[k]) boxes[k].addEventListener("change", sync); });
    var cont = document.getElementById("to-checkout");
    if (cont) cont.addEventListener("click", function (ev) {
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var parts = (dateEl.value || "").split("-").map(Number);
      var chosen = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : null;
      if (!chosen || chosen < today) {
        ev.preventDefault();
        if (dateErr) { dateErr.textContent = "Please pick a tour date in the future."; dateErr.classList.add("show"); }
        dateEl.focus();
      }
    });
    if (stepperTour) stepperTour.textContent = TOURS[state.tour].name;
    renderSummary(dl, state);
  }

  /* ---------- Step 3: checkout ---------- */
  function initCheckout() {
    var form = document.getElementById("checkout-form");
    if (!form) return;
    var state = load();
    var dl = document.querySelector(".summary dl");
    var payBtn = document.getElementById("pay-btn");
    var stepperDate = document.getElementById("stepper-date");
    var t = renderSummary(dl, state);
    if (stepperDate) stepperDate.textContent = fmtDate(state.date, false, state.tour) + " · " + state.riders + (state.riders === 1 ? " rider" : " riders");
    if (payBtn) payBtn.textContent = "Pay " + money(t.total) + " & book →";

    function setError(input, errId, bad) {
      var err = document.getElementById(errId);
      if (err) err.classList.toggle("show", bad);
      if (input) input.classList.toggle("invalid", bad);
      return !bad;
    }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = document.getElementById("name");
      var email = document.getElementById("email");
      var card = document.getElementById("card");
      var exp = document.getElementById("exp");
      var cvc = document.getElementById("cvc");
      var ok = true;
      ok = setError(name, "err-name", name.value.trim().length < 2) && ok;
      ok = setError(email, "err-email", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) && ok;
      ok = setError(card, "err-card", card.value.replace(/\D/g, "").length !== 16) && ok;
      var expOk = /^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(exp.value.trim());
      if (expOk) {
        var p = exp.value.replace(/\s/g, "").split("/");
        var expDate = new Date(2000 + Number(p[1]), Number(p[0]), 0);
        expOk = expDate >= new Date();
      }
      ok = setError(exp, "err-exp", !expOk) && ok;
      ok = setError(cvc, "err-cvc", !/^\d{3,4}$/.test(cvc.value.trim())) && ok;
      if (!ok) {
        var firstBad = form.querySelector(".invalid");
        if (firstBad) firstBad.focus();
        return;
      }
      t = totals(state);
      var parts = state.date.split("-").map(Number);
      var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      var ref = "ATLAS-" + parts[2] + months[parts[1] - 1] + "-" + (1000 + Math.floor(Math.random() * 9000));
      var booking = {
        ref: ref, tour: state.tour, date: state.date, riders: state.riders,
        name: name.value.trim(), email: email.value.trim(),
        total: t.total, tax: t.tax, lines: t.lines
      };
      try { localStorage.setItem(BOOKED_KEY, JSON.stringify(booking)); } catch (e) {}
      window.location.href = "confirmation.html";
    });
  }

  /* ---------- Confirmation ---------- */
  function initConfirmation() {
    var refEl = document.getElementById("conf-ref");
    if (!refEl) return;
    var booking = null;
    try { booking = JSON.parse(localStorage.getItem(BOOKED_KEY)); } catch (e) {}
    if (!booking) return; /* sample content stays as the designed example */
    var s = { tour: booking.tour, date: booking.date, riders: booking.riders, bike: "hybrid", addons: {} };
    refEl.textContent = booking.ref;
    var receipt = document.getElementById("conf-receipt");
    if (receipt) receipt.textContent = "Confirmation email + receipt for " + money(booking.total);
    var dl = document.querySelector(".summary dl");
    if (dl) {
      dl.innerHTML =
        '<div class="row"><dt>Tour</dt><dd><strong>' + esc(TOURS[booking.tour].name) + "</strong></dd></div>" +
        '<div class="row"><dt>Date</dt><dd>' + esc(fmtDate(booking.date, true, booking.tour)) + "</dd></div>" +
        '<div class="row"><dt>Riders</dt><dd>' + booking.riders + "</dd></div>" +
        '<div class="row total"><dt>Paid today</dt><dd>' + money(booking.total) + "</dd></div>";
    }
    var again = document.getElementById("book-another");
    if (again) again.addEventListener("click", function () {
      try { localStorage.removeItem(STATE_KEY); } catch (e) {}
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initIndex(); initDetails(); initCheckout(); initConfirmation();
  });
})();
