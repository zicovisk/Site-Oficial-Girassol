// Girassol Loja de Flores — comportamento da página
// Produtos, caixas e secção da época vêm de dados/produtos.json.

const WHATSAPP = "351935481981";
const MSG_GERAL = "Olá! Vi o site da Girassol e gostaria de fazer uma encomenda.";
const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduzir) document.documentElement.classList.add("reduzir");

const linkWhatsApp = msg => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const escapar = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// 1) Headline do hero: cada palavra sobe dentro de uma máscara (feito já, antes de tudo, para não piscar)
const h1 = document.querySelector(".hero h1");
h1.setAttribute("aria-label", h1.textContent.trim());
h1.innerHTML = h1.textContent.trim().split(/\s+/)
  .map((p, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${escapar(p)}</span></span>`).join(" ");

// 2) Conteúdo a partir do produtos.json
function mostrarRamos(ramos) {
  const lista = document.getElementById("lista-ramos");
  lista.innerHTML = ramos.filter(r => r.visivel !== false).map((r, i) => `
    <article class="prod" data-reveal style="--d:${(i % 3) * 150}ms">
      <div class="foto"><img src="${escapar(r.foto)}" alt="${escapar(r.alt || r.nome)}" loading="lazy" decoding="async"></div>
      <h3>${escapar(r.nome)}</h3>
      <a class="link wa" data-produto="${escapar(r.nome)}" href="https://wa.me/${WHATSAPP}">Encomendar <span class="seta">→</span></a>
    </article>`).join("");
}

function mostrarCaixas(caixas) {
  const mosaico = document.getElementById("mosaico-caixas");
  mosaico.innerHTML = caixas.filter(c => c.visivel !== false).slice(0, 3).map((c, i) => `
    <div class="foto" data-reveal="clip" style="--d:${i * 200}ms"><img src="${escapar(c.foto)}" alt="${escapar(c.alt || c.nome)}" loading="lazy" decoding="async"></div>`).join("");
}

function mostrarEpoca(epoca) {
  const sec = document.getElementById("epoca");
  if (!epoca || !epoca.ativa) { sec.hidden = true; return; }
  sec.querySelector(".epoca-titulo").textContent = epoca.titulo;
  sec.querySelector(".epoca-texto").textContent = epoca.texto;
  sec.querySelector(".epoca-botao").dataset.msg = epoca.mensagem_whatsapp || MSG_GERAL;
  sec.querySelector(".colagem").innerHTML = (epoca.fotos || []).slice(0, 4).map((f, i) => `
    <div class="foto f${i + 1}" data-reveal="clip" style="--d:${i * 150}ms"><img src="${escapar(f.foto)}" alt="${escapar(f.alt)}" loading="lazy" decoding="async"></div>`).join("");
}

async function carregarDados() {
  try {
    const resp = await fetch("dados/produtos.json", { cache: "no-cache" });
    const dados = await resp.json();
    mostrarRamos(dados.ramos || []);
    mostrarCaixas(dados.caixas || []);
    mostrarEpoca(dados.epoca);
  } catch (erro) {
    // Sem dados: mostra uma alternativa útil em vez de secções vazias
    document.getElementById("lista-ramos").innerHTML =
      `<p class="aviso-dados">Veja os nossos ramos no <a class="link" href="https://www.instagram.com/girassol_loja_de_flores/">Instagram</a> ou peça sugestões pelo <a class="link wa" href="https://wa.me/${WHATSAPP}">WhatsApp</a>.</p>`;
    document.getElementById("epoca").hidden = true;
    console.error("Não foi possível carregar dados/produtos.json", erro);
  }
}

// 3) Links de WhatsApp com mensagem contextual (origem + intenção)
function prepararWhatsApp(raiz = document) {
  raiz.querySelectorAll(".wa").forEach(a => {
    let msg = a.dataset.msg || MSG_GERAL;
    if (a.dataset.produto) msg = `Olá! Vi o site da Girassol e gostaria de encomendar o ${a.dataset.produto}. Está disponível?`;
    if (a.dataset.orcamento) msg = `Olá! Vi o site da Girassol e gostaria de ajuda para preparar um ramo ${a.dataset.orcamento}. É para oferecer e gostava de receber algumas sugestões.`;
    a.href = linkWhatsApp(msg);
    a.target = "_blank";
    a.rel = "noopener";
  });
}

// 4) Elementos aparecem suavemente ao entrar no ecrã
const observador = new IntersectionObserver(entradas => {
  entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); observador.unobserve(e.target); } });
}, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
const observarRevelar = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach(el => observador.observe(el));

// 5) Carrossel do hero: passa sozinho, pode-se arrastar, setas e barras
function iniciarCarrossel() {
  const caixa = document.querySelector(".hero .principal");
  const faixa = caixa.querySelector(".faixa-fotos");
  const slides = [...caixa.querySelectorAll(".slide")];
  const ctrl = document.querySelector(".controlos");
  const barras = [...ctrl.querySelectorAll(".barras button")];
  const contador = ctrl.querySelector(".contador b");
  const TEMPO = 6000;
  let atual = 0, timer = null, inicioX = 0, dx = 0, aArrastar = false;
  ctrl.style.setProperty("--tempo", TEMPO + "ms");

  function ir(n) {
    const volta = n >= slides.length || n < 0; // da última para a primeira (ou o contrário)
    atual = (n + slides.length) % slides.length;
    if (volta && !reduzir) {
      // em vez de recuar por todas as fotos, esbate e reaparece
      faixa.style.opacity = 0;
      setTimeout(() => {
        faixa.style.transition = "none";
        faixa.style.transform = `translateX(${-100 * atual}%)`;
        void faixa.offsetWidth;
        faixa.style.transition = "";
        faixa.style.opacity = 1;
      }, 500);
    } else {
      faixa.style.transform = `translateX(${-100 * atual}%)`;
    }
    slides.forEach((s, i) => { s.classList.toggle("ativo", i === atual); s.setAttribute("aria-hidden", i !== atual); });
    barras.forEach((b, i) => { b.classList.remove("ativo"); b.classList.toggle("feito", i < atual); });
    void ctrl.offsetWidth; // reinicia a animação da barra
    barras[atual].classList.add(reduzir ? "feito" : "ativo");
    contador.textContent = String(atual + 1).padStart(2, "0");
    agendar();
  }
  function agendar() {
    clearTimeout(timer);
    if (!reduzir && !ctrl.classList.contains("pausado")) timer = setTimeout(() => ir(atual + 1), TEMPO);
  }
  function pausar(sim) { ctrl.classList.toggle("pausado", sim); if (sim) clearTimeout(timer); else agendar(); }

  ctrl.querySelector(".ant").addEventListener("click", () => ir(atual - 1));
  ctrl.querySelector(".seg").addEventListener("click", () => ir(atual + 1));
  barras.forEach((b, i) => b.addEventListener("click", () => ir(i)));
  caixa.addEventListener("mouseenter", () => pausar(true));
  caixa.addEventListener("mouseleave", () => pausar(false));
  document.addEventListener("visibilitychange", () => pausar(document.hidden));

  // Arrastar para o lado (rato ou dedo)
  caixa.addEventListener("pointerdown", e => {
    aArrastar = true; inicioX = e.clientX; dx = 0;
    caixa.classList.add("a-arrastar"); caixa.setPointerCapture(e.pointerId); clearTimeout(timer);
  });
  caixa.addEventListener("pointermove", e => {
    if (!aArrastar) return;
    dx = e.clientX - inicioX;
    const nasPontas = (atual === 0 && dx > 0) || (atual === slides.length - 1 && dx < 0);
    faixa.style.transform = `translateX(calc(${-100 * atual}% + ${dx * (nasPontas ? 0.35 : 1)}px))`;
  });
  const soltar = () => {
    if (!aArrastar) return;
    aArrastar = false; caixa.classList.remove("a-arrastar");
    const limite = caixa.offsetWidth * 0.15;
    if (dx < -limite) ir(atual + 1); else if (dx > limite) ir(atual - 1); else ir(atual);
  };
  caixa.addEventListener("pointerup", soltar);
  caixa.addEventListener("pointercancel", soltar);
  caixa.addEventListener("keydown", e => { if (e.key === "ArrowRight") ir(atual + 1); if (e.key === "ArrowLeft") ir(atual - 1); });

  // Começa a passar depois da entrada do hero
  setTimeout(() => ir(0), reduzir ? 0 : 1600);
}

// 6) WhatsApp fixo: aparece depois do hero e esconde-se no rodapé (que já tem CTA)
function iniciarWhatsAppFixo() {
  const fixos = document.querySelectorAll(".wa-fixo");
  const cabecalho = document.getElementById("cabecalho");
  let passouHero = false, noRodape = false;
  const atualizar = () => fixos.forEach(f => f.classList.toggle("visivel", passouHero && !noRodape));
  new IntersectionObserver(([e]) => { passouHero = !e.isIntersecting; cabecalho.classList.toggle("com-scroll", passouHero); atualizar(); })
    .observe(document.getElementById("hero"));
  new IntersectionObserver(([e]) => { noRodape = e.isIntersecting; atualizar(); })
    .observe(document.getElementById("rodape"));
}

// 7) Scroll: palavras + selo + saída do hero + paralaxe subtil (desligado se "reduzir movimento")
function iniciarScroll() {
  if (reduzir) return;
  const palavras = document.getElementById("palavras");
  const itens = palavras.querySelectorAll("[data-grupo]");
  const heroEl = document.getElementById("hero");
  const heroTexto = heroEl.querySelector(".texto");
  const selo = heroEl.querySelector(".selo-giro .anel svg");
  const N = 3;          // número de palavras
  const FIM = 0.86;     // a partir daqui o fundo escurece e liga ao bloco "Não sabe o que oferecer"
  let ativo = -1, pedido = false;

  function noScroll() {
    pedido = false;
    const vh = innerHeight;
    const r = palavras.getBoundingClientRect();
    const p = Math.min(Math.max(-r.top / (r.height - vh), 0), 1);
    const idx = Math.min(Math.floor((p / FIM) * N), N - 1);
    const local = ((p / FIM) * N) % 1;
    if (idx !== ativo) {
      itens.forEach(el => {
        const g = +el.dataset.grupo;
        el.classList.toggle("ativa", g === idx);
        el.classList.toggle("saiu", g < idx);
      });
      ativo = idx;
    }
    palavras.querySelectorAll(".flutuante.ativa").forEach(el => el.style.setProperty("--p", local.toFixed(3)));
    palavras.classList.toggle("escuro", p > FIM);

    const hr = heroEl.getBoundingClientRect();
    const ph = Math.min(Math.max(-hr.top / hr.height, 0), 1);
    heroTexto.style.translate = `0 ${(ph * -50).toFixed(1)}px`;
    heroTexto.style.opacity = (1 - ph * 0.7).toFixed(3);
    selo.style.setProperty("--rot", `${(scrollY * 0.12).toFixed(1)}deg`);

    if (innerWidth > 800) {
      document.querySelectorAll("[data-speed]").forEach(el => {
        const b = el.getBoundingClientRect();
        const desvio = (b.top + b.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
        el.style.translate = `0 ${Math.max(Math.min(desvio, 60), -60).toFixed(1)}px`;
      });
    }
  }
  addEventListener("scroll", () => { if (!pedido) { pedido = true; requestAnimationFrame(noScroll); } }, { passive: true });
  addEventListener("resize", noScroll);
  noScroll();
}

// Arranque
prepararWhatsApp();
observarRevelar();
iniciarCarrossel();
iniciarWhatsAppFixo();
iniciarScroll();
carregarDados().then(() => { prepararWhatsApp(); observarRevelar(); });
