// TreasuryFlows — shared interactions (no framework, no build step)

(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  if (toggle && nav && header) {
    toggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  document.querySelectorAll(".reveal-stagger").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty("--stagger-i", i);
    });
  });

  var statEls = document.querySelectorAll(".stat-num[data-count]");
  if (statEls.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffixEl = el.querySelector(".suffix");
      var suffix = suffixEl ? suffixEl.outerHTML : "";
      if (prefersReducedMotion) {
        el.innerHTML = target + suffix;
        return;
      }
      var duration = 1100;
      var start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(target * eased);
        el.innerHTML = value + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      statEls.forEach(animateCount);
    } else {
      var statObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              statObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      statEls.forEach(function (el) {
        statObserver.observe(el);
      });
    }
  }

  var networkCanvas = document.querySelector(".hero-network");
  if (networkCanvas && networkCanvas.getContext) {
    var ctx = networkCanvas.getContext("2d");
    var colors = ["#e0a878", "#93b79c", "#7fa5c9"];
    var width, height, dpr, particles;

    var resize = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = networkCanvas.clientWidth;
      height = networkCanvas.clientHeight;
      networkCanvas.width = width * dpr;
      networkCanvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    var createParticles = function () {
      var count = Math.max(24, Math.min(70, Math.round((width * height) / 16000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: 1.1 + Math.random() * 1.4,
          color: colors[i % colors.length]
        });
      }
    };

    var draw = function () {
      ctx.clearRect(0, 0, width, height);
      var maxDist = Math.min(150, width / 5.5);

      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i];
          var b = particles[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = (1 - dist / maxDist) * 0.22;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 0.75;
      particles.forEach(function (p) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    var step = function () {
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });
      draw();
      window.requestAnimationFrame(step);
    };

    resize();
    createParticles();
    draw();

    if (!prefersReducedMotion) {
      window.requestAnimationFrame(step);
    }

    var resizeTimer;
    window.addEventListener(
      "resize",
      function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
          resize();
          createParticles();
          draw();
        }, 150);
      },
      { passive: true }
    );
  }
})();
