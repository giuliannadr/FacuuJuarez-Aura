const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL ?? 'http://localhost:3000/facuu'

const UPCOMING = [
  { date: '14 FEB', place: 'TUCUMÁN', event: 'BODA PRIVADA' },
  { date: '22 FEB', place: 'SALTA', event: 'GALA EMPRESARIAL' },
  { date: '01 MAR', place: 'CÓRDOBA', event: 'QUINCEAÑOS' },
  { date: '15 MAR', place: 'BUENOS AIRES', event: 'BODA' },
  { date: '29 MAR', place: 'JUJUY', event: 'EVENTO CORPORATIVO' },
  { date: '12 ABR', place: 'SANTIAGO DEL ESTERO', event: 'FIESTA PRIVADA' },
]

const BEBES = "'Bebas Neue', 'Arial Black', sans-serif"
const MONO = "'Courier New', Courier, monospace"

export default function Home() {
  return (
    <div className="bg-[#ecedee] overflow-x-hidden font-sans">
      {/* ══════════════════════════════════════════
          BANDA SUPERIOR — TICKER
      ══════════════════════════════════════════ */}
      <div className="h-[38px] bg-[#0f0f0f] flex items-center overflow-hidden border-b border-red-500/30 relative z-50">
        <div className="flex-shrink-0 flex items-center gap-2 px-[18px] h-full bg-red-500 relative z-[2]">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="white" aria-hidden>
            <polygon points="4,0 8,4 4,8 0,4" />
          </svg>
          <span
            className="text-white whitespace-nowrap uppercase tracking-[0.35em]"
            style={{ fontFamily: BEBES, fontSize: 11 }}
          >
            PRÓXIMAS FECHAS
          </span>
        </div>
        <div className="w-px h-[38px] bg-red-500/25 flex-shrink-0" />
        <div className="overflow-hidden flex-1">
          <div
            className="whitespace-nowrap inline-block"
            style={{ animation: 'marquee 38s linear infinite' }}
          >
            {[...UPCOMING, ...UPCOMING].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2.5 mr-[52px]">
                <span
                  className="text-red-500 tracking-[0.08em]"
                  style={{ fontFamily: BEBES, fontSize: 13 }}
                >
                  {item.date}
                </span>
                <span className="text-[9px] text-white/35">·</span>
                <span className="text-[9px] font-semibold tracking-[0.12em] text-white/85 uppercase">
                  {item.place}
                </span>
                <span className="text-[9px] text-white/25">—</span>
                <span className="text-[9px] tracking-[0.08em] text-white/45 uppercase">
                  {item.event}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HERO — #01
      ══════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden bg-[#ecedee]"
        style={{ height: 'calc(100svh - 38px)' }}
      >
        <div
          aria-hidden
          className="hero-watermark absolute left-[-3%] top-[-5%] z-[1] select-none pointer-events-none"
          style={{
            fontFamily: BEBES,
            fontSize: '68vw',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: 'transparent',
            WebkitTextStroke: '1.5px rgba(0,0,0,0.045)',
          }}
        >
          01
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/facuu.png"
          alt=""
          aria-hidden
          className="hero-img-echo3 absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{
            objectPosition: '50% 26%',
            filter: 'grayscale(1) brightness(0.08) contrast(30) blur(6px)',
            opacity: 0.3,
            mixBlendMode: 'multiply',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, white 5%, white 38%, transparent 52%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, white 5%, white 38%, transparent 52%)',
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/facuu.png"
          alt=""
          aria-hidden
          className="hero-img-echo2 absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{
            objectPosition: '50% 26%',
            filter: 'grayscale(1) brightness(0.08) contrast(30) blur(3px)',
            opacity: 0.38,
            mixBlendMode: 'multiply',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, white 3%, white 42%, transparent 56%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, white 3%, white 42%, transparent 56%)',
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/facuu.png"
          alt=""
          aria-hidden
          className="hero-img-echo1 absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{
            objectPosition: '50% 26%',
            filter: 'grayscale(1) brightness(0.1) contrast(20)',
            opacity: 0.45,
            mixBlendMode: 'multiply',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, white 2%, white 46%, transparent 58%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, white 2%, white 46%, transparent 58%)',
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/facuu.png"
          alt="Facuu Juarez DJ"
          className="hero-img-main absolute inset-0 w-full h-full object-cover mix-blend-multiply"
          style={{ objectPosition: '50% 26%', filter: 'grayscale(1) contrast(1.05)' }}
        />

        {/* Mobile: gradient inferior para legibilidad del texto sobre la foto */}
        <div
          aria-hidden
          className="absolute inset-0 z-[5] md:hidden pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, #ecedee 18%, rgba(236,237,238,0.92) 38%, rgba(236,237,238,0.4) 58%, transparent 78%)',
          }}
        />

        <div aria-hidden className="absolute inset-0 z-[8] pointer-events-none overflow-hidden">
          <div
            className="absolute left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(239,68,68,0.18) 25%, rgba(255,255,255,0.12) 50%, rgba(239,68,68,0.18) 75%, transparent)',
              animation: 'scanline 9s linear infinite',
            }}
          />
        </div>
        <div aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-500 z-10" />

        <div
          className="hero-col absolute left-[5%] top-[8%] z-10 flex flex-col justify-between"
          style={{ height: '82%' }}
        >
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-[18px] h-px bg-red-500" />
              <span className="text-[8px] font-bold tracking-[0.38em] uppercase text-[#a1a1aa]">
                Tucumán · Argentina
              </span>
            </div>
            <span
              className="hero-name block leading-[0.9] tracking-[0.03em] text-transparent [-webkit-text-stroke:2px_#18181b]"
              style={{ fontFamily: BEBES, fontSize: 'clamp(70px, 13vw, 155px)' }}
            >
              FACUU
            </span>
            <span
              className="hero-name block leading-[0.9] tracking-[0.03em] text-red-500"
              style={{ fontFamily: BEBES, fontSize: 'clamp(70px, 13vw, 155px)' }}
            >
              JUAREZ
            </span>
            <div className="mt-[18px] flex items-center gap-2.5">
              <div className="hero-sep-inner h-0.5 flex-1 max-w-[34vw] bg-red-500" />
              <svg width="6" height="6" viewBox="0 0 6 6" fill="#ef4444" aria-hidden>
                <polygon points="3,0 6,3 3,6 0,3" />
              </svg>
            </div>
            <p className="mt-3 text-[9px] font-semibold tracking-[0.3em] uppercase text-[#a1a1aa]">
              DJ · Productor · Tucumán
            </p>
          </div>
          <div>
            <div className="hero-stats flex items-end gap-5 mb-7">
              {[
                { val: '+200', label: 'EVENTOS' },
                { val: '8+', label: 'AÑOS' },
                { val: "45'", label: 'POR REUNIÓN' },
              ].map(({ val, label }, i) => (
                <div key={val} className="flex items-end gap-5">
                  {i > 0 && <div className="w-px h-[30px] bg-[#d4d4d8] mb-1" />}
                  <div>
                    <p
                      className="leading-none tracking-[0.02em] text-[#18181b]"
                      style={{ fontFamily: BEBES, fontSize: 30 }}
                    >
                      {val}
                    </p>
                    <p className="text-[8px] font-bold tracking-[0.25em] uppercase text-[#a1a1aa] mt-[3px]">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <a href={BOOKING_URL} className="cta-btn">
              <span className="cta-btn-label">Reservar una reunión</span>
              <span className="cta-btn-short" style={{ display: 'none' }}>
                Reservar
              </span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <a
          href={BOOKING_URL}
          className="hero-reservar absolute right-6 top-6 z-10 border border-black/20 bg-[rgba(236,237,238,0.6)] backdrop-blur-[8px] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-[#52525b] no-underline transition-all duration-200"
        >
          Reservar
        </a>

        <div className="hero-eq absolute right-6 bottom-[50px] z-10 flex items-end gap-[5px]">
          {[
            { h: 38, anim: 'eq1 0.9s ease-in-out infinite' },
            { h: 52, anim: 'eq2 0.75s ease-in-out 0.18s infinite' },
            { h: 32, anim: 'eq3 1.05s ease-in-out 0.08s infinite' },
            { h: 46, anim: 'eq1 0.85s ease-in-out 0.3s infinite' },
            { h: 38, anim: 'eq2 0.95s ease-in-out 0.12s infinite' },
          ].map(({ h, anim }, i) => (
            <span
              key={i}
              className="block w-[5px] rounded-[3px] bg-red-500 origin-bottom"
              style={{ height: h, animation: anim }}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-black/10 bg-[rgba(236,237,238,0.9)] backdrop-blur-[10px] overflow-hidden py-[9px]">
          <div
            className="whitespace-nowrap inline-block"
            style={{ animation: 'marquee 28s linear infinite' }}
          >
            {[0, 1].map((i) => (
              <span
                key={i}
                className="inline-flex items-center gap-4 pr-16 text-[8px] font-bold tracking-[0.3em] uppercase text-[#a1a1aa]"
              >
                {[
                  'DJ',
                  'BODAS',
                  'FIESTAS PRIVADAS',
                  'EVENTOS CORPORATIVOS',
                  'PRODUCTOR MUSICAL',
                  'TUCUMÁN · ARGENTINA',
                ].map((s, j) => (
                  <span key={j} className="inline-flex items-center gap-4">
                    {j > 0 && (
                      <svg width="5" height="5" viewBox="0 0 5 5" fill="#ef4444" aria-hidden>
                        <polygon points="2.5,0 5,2.5 2.5,5 0,2.5" />
                      </svg>
                    )}
                    <span>{s}</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRESENTACIÓN — #02
          Mobile: foto arriba (52svh) + contenido abajo en flujo
          Desktop: foto abs izquierda · contenido abs derecha · 100svh
      ══════════════════════════════════════════ */}
      <section className="relative bg-[#0e0e0e] overflow-hidden md:h-[100svh]">
        {/* ── Foto ──────────────────────────────────────────────
            mobile  → bloque en flujo, altura fija 52svh
            desktop → panel absoluto izquierdo 52% de ancho
        ────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden h-[52svh] md:absolute md:inset-y-0 md:left-0 md:h-auto md:w-[52%]">
          <div aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-500 z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/facuabout.jpg"
            alt="Facuu Juarez"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '50% 15%' }}
          />
          {/* Fade inferior — mobile */}
          <div
            aria-hidden
            className="absolute inset-0 md:hidden"
            style={{ background: 'linear-gradient(to bottom, transparent 45%, #0e0e0e 100%)' }}
          />
          {/* Fade derecho — desktop */}
          <div
            aria-hidden
            className="absolute inset-0 hidden md:block"
            style={{ background: 'linear-gradient(to right, transparent 45%, #0e0e0e 100%)' }}
          />
        </div>

        {/* ── Contenido ─────────────────────────────────────────
            mobile  → flujo natural después de la foto, bg oscuro
            desktop → panel absoluto derecho, centrado vertical
        ────────────────────────────────────────────────────── */}
        <div className="relative z-10 bg-[#0e0e0e] md:bg-transparent px-6 pt-6 pb-12 md:absolute md:inset-0 md:flex md:flex-col md:justify-center md:pl-[56%] md:pr-[5%] md:py-10">
          {/* Label */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-0.5 h-[14px] bg-red-500 shrink-0" />
            <span className="text-[7px] font-bold tracking-[0.4em] uppercase text-white/25">
              02 / PRESENTACIÓN
            </span>
          </div>

          {/* Nombre */}
          <div className="mb-4">
            <span
              className="block leading-[0.88] tracking-[0.02em] text-transparent [-webkit-text-stroke:2px_white]"
              style={{ fontFamily: BEBES, fontSize: 'clamp(56px, 16vw, 100px)' }}
            >
              FACUU
            </span>
            <span
              className="block leading-[0.88] tracking-[0.02em] text-red-500"
              style={{ fontFamily: BEBES, fontSize: 'clamp(56px, 16vw, 100px)' }}
            >
              JUAREZ
            </span>
          </div>

          {/* Rol */}
          <p className="text-[8px] font-semibold tracking-[0.3em] uppercase text-white/25 mb-5 md:mb-7">
            DJ · Productor · Tucumán, Argentina
          </p>

          {/* Bio */}
          <p
            className="text-[13px] leading-[1.75] text-white/52 mb-6 md:mb-7"
            style={{ maxWidth: 400 }}
          >
            Con más de 8 años recorriendo el NOA y +200 eventos, construye atmósferas que
            trascienden la pista. Desde bodas íntimas hasta galas de 500 personas — cada set es una
            narrativa diseñada para ese momento exacto.
          </p>

          {/* Stats */}
          <div className="flex items-end gap-5 mb-6 md:mb-7">
            {[
              { val: '+200', label: 'EVENTOS' },
              { val: '8+', label: 'AÑOS' },
              { val: "45'", label: 'POR REUNIÓN' },
            ].map(({ val, label }, i) => (
              <div key={val} className="flex items-end gap-5">
                {i > 0 && <div className="w-px h-7 bg-white/10 mb-1" />}
                <div>
                  <p
                    className="leading-none text-white"
                    style={{ fontFamily: BEBES, fontSize: 'clamp(26px, 3.2vw, 42px)' }}
                  >
                    {val}
                  </p>
                  <p className="text-[7px] font-bold tracking-[0.25em] uppercase text-white/28 mt-1">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tags — solo desktop */}
          <div className="hidden md:flex flex-wrap gap-1.5 mb-8">
            {['BODAS', 'GALAS', 'CORPORATIVO', 'QUINCEAÑOS'].map((t) => (
              <span
                key={t}
                className="text-[7px] font-bold tracking-[0.2em] uppercase border border-white/[0.1] px-2.5 py-1 text-white/25"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Pull quote — solo desktop */}
          <div
            className="hidden md:block border-l-[3px] border-red-500 pl-4"
            style={{ maxWidth: 400 }}
          >
            <p className="text-[12.5px] leading-[1.6] text-white/38 italic">
              &ldquo;No es solo música. Es el director musical de tu evento.&rdquo;
            </p>
            <p className="text-[7px] font-bold tracking-[0.28em] uppercase text-white/18 mt-2">
              — Facuu Juarez
            </p>
          </div>

          {/* CTA — solo mobile */}
          <a href={BOOKING_URL} className="cta-btn md:hidden mt-2 self-start">
            Reservar reunión
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRÓXIMAS FECHAS — #03
          Cabecera poster con mandala botánico
          + filas horizontales tipo cartelera de venue
      ══════════════════════════════════════════ */}
      <section className="bg-[#080808] overflow-hidden">
        <style>{`
          /* ── Fechas rows ── */
          .fd-row {
            display: flex;
            align-items: stretch;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            min-height: clamp(70px,9vw,110px);
            position: relative;
            overflow: hidden;
            cursor: default;
            transition: background 0.25s;
          }
          .fd-row::before {
            content: '';
            position: absolute;
            left: 0; top: 0; bottom: 0;
            width: 3px;
            background: #C8202B;
            transform: scaleY(0);
            transform-origin: center;
            transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          }
          .fd-row:hover { background: rgba(200,32,43,0.035); }
          .fd-row:hover::before { transform: scaleY(1); }

          .fd-date-col {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 2px;
            padding: 0 clamp(14px,2.2vw,32px) 0 4%;
            border-right: 1px solid rgba(255,255,255,0.06);
            min-width: clamp(60px,7.5vw,104px);
          }
          .fd-day {
            font-family: 'Bebas Neue','Arial Black',sans-serif;
            color: #C8202B;
            line-height: 0.82;
            letter-spacing: -0.02em;
            font-size: clamp(36px,5vw,68px);
            display: block;
          }
          .fd-month {
            font-family: 'Courier New',Courier,monospace;
            font-size: 6px;
            font-weight: 700;
            color: rgba(255,255,255,0.36);
            letter-spacing: 0.32em;
            text-transform: uppercase;
            display: block;
          }

          .fd-city-col {
            flex: 1;
            display: flex;
            align-items: center;
            padding: 0 clamp(14px,2vw,30px);
          }
          .fd-city {
            font-family: 'Bebas Neue','Arial Black',sans-serif;
            font-size: clamp(28px,5.5vw,80px);
            -webkit-text-stroke: 1px rgba(255,255,255,0.18);
            color: transparent;
            line-height: 1;
            letter-spacing: 0.02em;
            transition: color 0.25s ease, -webkit-text-stroke-color 0.25s ease;
          }
          .fd-row:hover .fd-city {
            color: rgba(255,255,255,0.88);
            -webkit-text-stroke-color: transparent;
          }

          .fd-meta-col {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-end;
            gap: 5px;
            padding: 0 4% 0 clamp(12px,1.5vw,24px);
            border-left: 1px solid rgba(255,255,255,0.06);
            min-width: clamp(64px,9vw,136px);
          }
          .fd-event {
            font-family: 'Courier New',Courier,monospace;
            font-size: 6px;
            color: rgba(255,255,255,0.22);
            letter-spacing: 0.18em;
            text-transform: uppercase;
            text-align: right;
            line-height: 1.5;
          }
          .fd-idx {
            font-family: 'Courier New',Courier,monospace;
            font-size: 7px;
            color: rgba(255,255,255,0.1);
            letter-spacing: 0.12em;
          }

          @media (max-width: 767px) {
            .fd-row { min-height: 64px; }

            .fd-date-col {
              width: 54px;
              min-width: 54px;
              padding: 0 10px 0 4%;
            }
            .fd-day { font-size: 28px; }
            .fd-month { font-size: 7px; }

            .fd-city-col { padding: 0 8px; overflow: hidden; }
            .fd-city {
              font-size: clamp(15px,4.5vw,24px);
              color: rgba(255,255,255,0.5);
              -webkit-text-stroke: none;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .fd-row:hover .fd-city { color: rgba(255,255,255,0.88); }

            .fd-meta-col {
              width: 82px;
              min-width: 82px;
              padding: 0 4% 0 8px;
            }
            .fd-event {
              font-size: 7px;
              letter-spacing: 0.08em;
              color: rgba(255,255,255,0.35);
            }
            .fd-idx { font-size: 8px; color: rgba(255,255,255,0.18); }
          }
        `}</style>

        {/* ── HEADER BLOCK ── */}
        <div
          style={{
            background: '#0a0a0a',
            padding: 'clamp(18px,2.5vw,32px) 4% clamp(12px,1.8vw,20px)',
          }}
        >
          {/* Etiqueta */}
          <div
            style={{
              marginBottom: 'clamp(8px,1.2vw,14px)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div style={{ width: 2, height: 13, background: '#ef4444', flexShrink: 0 }} />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 7,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.22)',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
              }}
            >
              03 / PRÓXIMAS FECHAS
            </span>
          </div>

          <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* SVG provisto por el cliente — fill-rule evenodd: rectángulo rojo + huecos orgánicos que muestran el fondo oscuro */}
            <svg
              aria-hidden
              viewBox="0 0 736 230"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block', width: '100%', height: 'clamp(185px,24vw,360px)' }}
            >
              <rect width="736" height="230" fill="#160504" />
              <path
                fill="#C8202B"
                fillRule="evenodd"
                d="M0 0 L736 0 L736 230 L0 230 Z M11.14 1.31 C12.30 1.36 12.34 1.44 12.96 1.69 C13.58 1.94 14.04 2.23 14.59 2.71 C15.13 3.20 15.35 3.13 16.00 4.38 C16.66 5.64 17.58 7.30 18.24 9.68 C18.89 12.05 19.14 12.58 19.66 17.57 C20.18 22.55 20.60 32.56 21.13 37.37 C21.65 42.18 21.94 42.23 22.56 44.28 C23.19 46.33 24.00 47.73 24.58 48.78 C25.17 49.83 24.98 49.63 25.81 50.12 C26.65 50.61 27.52 51.08 29.23 51.49 C30.95 51.90 32.66 52.15 35.34 52.40 C38.03 52.64 38.18 52.86 44.14 52.85 C50.10 52.85 61.53 52.77 68.44 52.38 C75.34 51.98 79.36 51.10 82.48 50.64 C85.60 50.17 84.37 50.32 85.79 49.79 C87.20 49.25 89.12 48.52 90.32 47.67 C91.53 46.83 91.92 46.32 92.50 45.11 C93.09 43.90 93.51 42.24 93.57 40.96 C93.63 39.68 93.30 39.09 92.81 37.99 C92.33 36.89 91.55 35.71 90.89 34.85 C90.23 33.99 90.43 34.13 89.15 33.22 C87.87 32.31 87.05 31.40 83.79 29.80 C80.54 28.19 78.04 26.94 71.06 24.31 C64.08 21.67 51.24 17.57 45.03 15.16 C38.81 12.76 38.63 12.29 36.56 10.95 C34.49 9.61 34.27 8.92 33.54 7.71 C32.80 6.50 32.50 5.22 32.48 4.23 C32.45 3.23 32.54 2.81 33.41 2.19 C34.28 1.56 34.63 1.17 37.29 0.76 C39.94 0.36 44.15 -0.01 48.17 -0.08 C52.18 -0.15 55.37 -0.07 59.58 0.36 C63.79 0.79 66.41 1.16 71.57 2.32 C76.72 3.49 83.83 5.82 88.23 6.82 C92.64 7.81 93.96 7.65 96.03 7.83 C98.10 8.02 97.80 8.01 99.72 7.84 C101.63 7.67 103.25 7.84 106.67 6.88 C110.09 5.92 115.29 3.62 118.70 2.49 C122.12 1.36 123.47 1.01 125.64 0.60 C127.81 0.19 129.02 0.12 130.75 0.23 C132.48 0.34 134.18 0.87 135.23 1.23 C136.28 1.59 136.19 1.81 136.56 2.23 C136.93 2.64 137.31 2.59 137.28 3.55 C137.25 4.51 138.43 3.47 136.40 7.56 C134.38 11.65 128.24 22.10 126.02 26.29 C123.80 30.48 124.55 29.40 124.06 30.84 C123.57 32.27 123.28 33.06 123.30 34.27 C123.32 35.48 123.69 36.52 124.17 37.54 C124.65 38.56 125.20 39.19 125.98 39.94 C126.76 40.68 127.61 41.28 128.50 41.68 C129.39 42.08 129.75 42.27 130.92 42.16 C132.09 42.05 133.24 41.74 135.02 41.07 C136.79 40.39 136.19 40.97 140.79 38.41 C145.39 35.84 155.18 29.82 160.57 26.82 C165.95 23.83 167.44 23.18 170.69 21.77 C173.94 20.37 175.55 19.80 178.61 19.02 C181.68 18.23 184.58 17.68 187.71 17.40 C190.85 17.11 193.79 17.22 196.03 17.43 C198.27 17.64 198.25 17.69 200.13 18.54 C202.02 19.40 203.77 20.09 206.51 22.18 C209.24 24.27 212.64 27.97 215.31 30.16 C217.99 32.35 219.30 33.30 221.35 34.33 C223.40 35.37 224.86 35.73 226.69 35.89 C228.52 36.05 229.53 35.91 231.51 35.23 C233.50 34.55 236.07 33.14 237.73 32.14 C239.39 31.13 239.74 30.67 240.74 29.64 C241.74 28.61 242.34 28.12 243.29 26.41 C244.24 24.69 245.19 23.14 246.02 20.11 C246.84 17.07 247.13 12.42 247.88 9.55 C248.63 6.68 249.36 5.45 250.18 4.16 C251.01 2.86 251.54 2.75 252.46 2.36 C253.39 1.97 254.58 1.93 255.34 2.00 C256.11 2.07 256.25 2.35 256.73 2.75 C257.20 3.15 257.37 3.04 257.98 4.25 C258.59 5.46 259.43 7.07 260.09 9.50 C260.76 11.93 261.20 14.24 261.68 17.75 C262.16 21.26 262.44 24.39 262.74 29.00 C263.05 33.61 263.31 39.60 263.38 43.36 C263.46 47.13 263.34 47.99 263.18 49.91 C263.01 51.83 262.82 52.89 262.46 54.03 C262.10 55.17 262.01 55.38 261.19 56.23 C260.37 57.08 259.74 57.95 257.91 58.74 C256.08 59.53 253.39 60.30 251.00 60.61 C248.61 60.92 247.02 60.80 244.63 60.45 C242.23 60.10 240.27 59.52 237.69 58.66 C235.10 57.81 232.93 56.41 230.27 55.70 C227.60 54.99 225.10 54.78 222.91 54.74 C220.71 54.69 220.24 54.88 218.08 55.46 C215.92 56.03 213.08 57.45 210.91 57.95 C208.73 58.45 207.79 58.39 206.00 58.23 C204.21 58.08 202.80 57.76 200.97 57.09 C199.13 56.42 197.67 55.56 195.81 54.51 C193.96 53.45 192.02 52.01 190.66 51.22 C189.29 50.44 189.48 50.52 188.22 50.13 C186.95 49.75 185.21 49.19 183.63 49.07 C182.04 48.95 181.57 48.74 179.41 49.48 C177.25 50.22 173.78 52.29 171.63 53.17 C169.47 54.04 170.27 54.00 167.44 54.34 C164.61 54.67 158.43 54.81 155.92 55.02 C153.41 55.24 154.82 55.09 153.50 55.55 C152.18 56.01 150.38 56.61 148.60 57.56 C146.82 58.52 145.42 59.44 143.61 60.86 C141.80 62.28 140.35 63.46 138.53 65.43 C136.71 67.41 135.73 68.28 133.48 71.85 C131.23 75.42 130.12 76.22 126.03 85.27 C121.94 94.32 114.26 114.30 110.77 122.14 C107.28 129.98 108.13 127.14 106.63 128.84 C105.13 130.55 103.98 130.85 102.43 131.62 C100.87 132.40 99.47 132.90 97.99 133.15 C96.50 133.41 95.75 133.45 94.19 133.03 C92.63 132.61 91.73 132.25 89.31 130.83 C86.90 129.41 83.51 126.56 80.77 125.14 C78.04 123.72 76.87 123.57 74.13 122.93 C71.39 122.30 68.98 121.93 65.54 121.61 C62.10 121.29 60.52 121.10 55.00 121.16 C49.48 121.21 39.99 121.57 34.87 121.91 C29.74 122.25 28.45 122.66 26.53 123.05 C24.61 123.44 24.74 123.70 24.19 124.09 C23.64 124.48 23.85 123.77 23.48 125.22 C23.11 126.68 22.36 127.76 22.14 132.16 C21.91 136.55 22.04 145.72 22.22 149.64 C22.41 153.56 22.69 152.56 23.15 153.94 C23.61 155.32 24.07 156.26 24.79 157.29 C25.50 158.33 26.16 159.00 27.13 159.69 C28.10 160.38 28.95 160.79 30.18 161.14 C31.40 161.49 32.45 161.63 33.93 161.64 C35.41 161.65 36.66 161.52 38.39 161.19 C40.13 160.85 38.86 161.43 43.56 159.78 C48.27 158.14 58.72 153.96 64.53 152.07 C70.34 150.17 72.39 149.81 75.83 149.24 C79.26 148.68 81.09 148.64 83.61 148.92 C86.13 149.19 88.10 150.00 89.84 150.77 C91.59 151.54 91.89 151.85 93.30 153.20 C94.71 154.54 95.96 156.56 97.67 158.25 C99.38 159.95 99.96 160.87 102.78 162.63 C105.60 164.38 110.66 166.46 113.33 168.01 C115.99 169.56 116.09 169.86 117.59 171.24 C119.10 172.61 119.50 172.68 121.67 175.64 C123.85 178.60 127.23 184.34 129.69 187.68 C132.14 191.02 132.28 191.25 135.31 194.21 C138.35 197.16 140.42 199.31 146.56 204.10 C152.70 208.90 164.63 217.09 169.43 220.83 C174.23 224.57 172.63 223.92 173.25 224.89 C173.86 225.85 173.74 225.71 172.87 226.19 C172.00 226.67 171.59 227.17 168.42 227.53 C165.25 227.89 158.91 228.24 155.25 228.19 C151.58 228.13 150.42 227.83 148.07 227.24 C145.72 226.65 144.07 226.00 142.18 224.92 C140.29 223.83 139.34 223.27 137.57 221.22 C135.80 219.17 133.70 215.36 132.34 213.52 C130.99 211.67 131.50 212.30 130.03 210.95 C128.56 209.61 126.58 207.77 124.19 206.05 C121.79 204.34 121.93 204.16 116.72 201.45 C111.51 198.73 100.84 193.91 95.25 190.97 C89.66 188.03 89.00 187.35 85.69 185.12 C82.37 182.89 79.31 180.11 76.82 178.57 C74.34 177.03 73.22 176.90 71.87 176.57 C70.51 176.23 70.42 176.23 69.31 176.70 C68.20 177.18 66.71 178.08 65.68 179.21 C64.65 180.33 64.00 181.79 63.60 182.94 C63.19 184.08 63.21 184.35 63.41 185.58 C63.61 186.81 63.98 187.99 64.72 189.78 C65.45 191.58 64.44 190.15 67.51 195.55 C70.57 200.94 78.91 214.74 81.75 219.77 C84.59 224.79 82.98 222.45 83.28 223.47 C83.58 224.49 84.11 224.87 83.40 225.43 C82.70 225.99 81.73 226.26 79.37 226.60 C77.01 226.93 77.92 227.17 70.27 227.28 C62.62 227.40 44.51 227.87 36.88 227.22 C29.24 226.57 30.89 225.55 27.88 223.67 C24.87 221.78 22.71 219.85 20.15 216.75 C17.59 213.66 15.78 210.78 13.67 206.48 C11.57 202.18 10.11 198.36 8.45 192.85 C6.80 187.34 5.69 182.58 4.49 175.86 C3.29 169.14 2.54 163.44 1.79 155.51 C1.04 147.58 0.65 148.94 0.34 131.80 C0.04 114.66 0.08 78.83 0.10 60.28 C0.12 41.73 0.26 37.77 0.46 28.74 C0.67 19.71 1.01 14.26 1.25 10.10 C1.49 5.94 1.27 7.00 1.80 5.63 C2.34 4.25 3.36 3.24 4.21 2.48 C5.07 1.73 5.30 1.62 6.55 1.41 C7.79 1.20 9.99 1.26 11.14 1.31Z M307.38 1.14 C309.66 1.21 309.82 1.23 311.07 1.46 C312.33 1.70 313.25 1.98 314.36 2.46 C315.47 2.94 316.27 3.40 317.24 4.12 C318.20 4.84 318.89 5.49 319.70 6.45 C320.52 7.41 321.10 8.25 321.76 9.45 C322.43 10.65 322.74 10.78 323.42 13.12 C324.09 15.46 324.94 17.18 325.49 22.46 C326.05 27.75 326.48 36.57 326.51 42.50 C326.55 48.44 326.04 52.36 325.69 55.44 C325.34 58.52 325.26 57.83 324.56 59.63 C323.87 61.42 323.76 62.52 321.82 65.44 C319.89 68.36 315.54 72.89 313.82 75.84 C312.10 78.80 312.15 77.46 312.27 81.84 C312.40 86.23 314.16 93.56 314.52 100.22 C314.89 106.88 314.24 114.19 314.30 118.83 C314.36 123.46 314.52 123.52 314.87 125.97 C315.21 128.42 315.34 129.75 316.21 132.42 C317.08 135.09 318.86 138.41 319.68 140.81 C320.50 143.21 320.62 144.44 320.77 145.75 C320.93 147.05 320.95 146.87 320.52 148.06 C320.09 149.25 319.55 150.90 318.41 152.37 C317.27 153.85 316.77 154.54 314.16 156.27 C311.55 158.00 306.42 160.70 303.91 161.98 C301.40 163.26 301.38 163.05 300.22 163.38 C299.07 163.71 298.68 163.94 297.50 163.81 C296.32 163.69 295.11 163.51 293.68 162.67 C292.25 161.82 290.75 161.14 289.55 159.13 C288.36 157.12 288.01 155.58 287.05 151.49 C286.10 147.41 285.27 142.91 284.25 136.42 C283.22 129.94 282.08 121.30 281.36 115.45 C280.63 109.61 280.48 108.19 280.22 103.97 C279.97 99.75 279.85 94.97 279.93 92.02 C280.01 89.06 280.27 89.02 280.67 87.56 C281.07 86.10 281.23 85.51 282.15 83.91 C283.06 82.30 284.15 80.50 285.74 78.66 C287.34 76.82 289.78 74.97 291.00 73.69 C292.21 72.41 291.92 72.98 292.48 71.55 C293.04 70.11 293.79 67.43 294.11 65.72 C294.43 64.01 294.42 64.30 294.26 62.03 C294.10 59.76 294.37 58.50 293.21 53.11 C292.05 47.72 289.07 37.32 287.83 32.08 C286.59 26.83 286.65 26.96 286.29 23.97 C285.94 20.97 285.72 17.92 285.87 15.44 C286.02 12.96 286.45 12.08 287.14 10.19 C287.83 8.30 288.74 6.35 289.73 4.94 C290.72 3.52 291.07 3.03 292.63 2.34 C294.20 1.64 295.76 1.28 298.42 1.06 C301.07 0.85 305.10 1.07 307.38 1.14Z M398.88 -0.05 C402.71 -0.21 403.64 -0.15 406.53 0.04 C409.42 0.23 412.78 0.62 414.93 1.01 C417.09 1.41 417.51 1.71 418.50 2.23 C419.49 2.74 419.83 2.86 420.44 3.89 C421.05 4.92 421.59 6.11 421.88 7.95 C422.17 9.79 422.25 11.50 422.04 14.11 C421.84 16.72 421.41 19.67 420.76 22.45 C420.11 25.23 419.50 26.77 418.44 29.56 C417.38 32.35 416.90 33.75 414.86 37.96 C412.82 42.18 409.56 48.72 407.13 52.98 C404.69 57.24 403.43 58.99 401.35 61.62 C399.27 64.24 397.13 66.13 395.58 67.55 C394.02 68.97 393.73 68.92 392.69 69.50 C391.66 70.08 390.85 70.44 389.81 70.78 C388.78 71.12 388.85 71.35 386.94 71.38 C385.02 71.41 381.50 71.22 379.17 70.95 C376.83 70.69 375.37 70.39 373.96 69.90 C372.55 69.40 371.85 68.79 371.31 68.21 C370.78 67.63 370.95 68.75 370.97 66.69 C370.99 64.63 370.37 64.42 371.42 56.79 C372.46 49.15 375.24 32.85 376.79 24.28 C378.33 15.71 379.14 12.90 380.02 9.19 C380.89 5.47 381.14 5.00 381.65 3.66 C382.16 2.32 382.21 2.24 382.86 1.75 C383.51 1.26 382.38 1.26 385.26 0.93 C388.15 0.61 395.05 0.11 398.88 -0.05Z M456.63 2.17 C457.82 2.81 459.07 3.78 460.04 4.79 C461.02 5.80 460.76 4.77 462.04 7.80 C463.32 10.83 465.63 18.07 467.16 21.62 C468.68 25.17 469.16 25.66 470.53 27.51 C471.90 29.35 473.43 30.71 474.75 31.87 C476.07 33.03 476.71 33.31 477.84 33.94 C478.98 34.56 479.57 34.94 481.06 35.34 C482.55 35.75 484.20 36.19 486.13 36.20 C488.05 36.20 489.52 36.04 491.75 35.36 C493.98 34.69 494.91 34.46 498.50 32.46 C502.09 30.46 507.96 26.36 511.69 24.24 C515.41 22.11 516.59 21.67 519.19 20.68 C521.79 19.68 523.40 19.14 526.13 18.69 C528.85 18.24 531.90 18.07 534.34 18.18 C536.78 18.28 538.10 18.79 539.69 19.29 C541.28 19.78 541.27 19.75 543.19 20.91 C545.10 22.07 546.05 22.45 550.31 25.72 C554.57 29.00 563.25 36.36 566.85 39.11 C570.45 41.86 568.49 40.33 570.30 41.01 C572.12 41.68 575.18 42.54 576.95 42.87 C578.72 43.20 579.01 42.96 580.14 42.84 C581.28 42.71 582.15 42.52 583.25 42.16 C584.35 41.80 584.36 42.11 586.27 40.84 C588.18 39.56 591.78 37.08 593.86 35.07 C595.94 33.07 597.00 31.27 597.82 29.69 C598.65 28.11 598.57 27.80 598.44 26.31 C598.32 24.83 597.84 23.19 597.14 21.44 C596.44 19.68 596.11 18.84 594.57 16.56 C593.04 14.28 589.95 10.81 588.60 8.77 C587.25 6.72 587.25 6.31 587.07 5.21 C586.89 4.11 587.23 3.32 587.60 2.64 C587.96 1.96 588.39 1.80 589.09 1.43 C589.80 1.06 589.71 0.84 591.51 0.59 C593.32 0.33 596.61 -0.02 599.13 0.01 C601.64 0.05 603.31 0.29 605.50 0.76 C607.69 1.23 609.30 1.79 611.31 2.63 C613.33 3.46 614.67 4.51 616.69 5.41 C618.70 6.32 620.31 6.98 622.50 7.64 C624.69 8.30 626.86 8.75 628.88 9.09 C630.89 9.42 631.11 9.60 633.67 9.50 C636.23 9.41 637.50 9.69 643.09 8.56 C648.69 7.44 657.85 4.62 664.75 3.24 C671.65 1.87 676.15 1.46 681.44 0.95 C686.73 0.43 689.33 0.45 694.13 0.39 C698.92 0.33 704.43 -0.09 708.06 0.61 C711.70 1.32 712.22 2.36 714.31 4.32 C716.40 6.29 717.90 8.31 719.67 11.53 C721.44 14.76 722.70 17.76 724.15 22.24 C725.61 26.73 726.62 30.71 727.76 36.45 C728.90 42.19 729.66 47.15 730.48 54.16 C731.30 61.16 731.82 67.10 732.32 75.36 C732.83 83.63 733.10 90.55 733.28 100.07 C733.47 109.60 733.60 118.76 733.37 128.28 C733.14 137.80 732.75 144.72 732.00 152.98 C731.26 161.24 730.47 167.17 729.20 174.17 C727.93 181.17 726.74 186.12 724.96 191.85 C723.17 197.59 721.58 201.56 719.27 206.03 C716.96 210.50 714.97 213.49 712.14 216.70 C709.31 219.90 706.91 221.91 703.57 223.86 C700.22 225.80 702.07 226.89 693.55 227.51 C685.04 228.13 664.79 227.50 656.25 227.31 C647.71 227.12 648.74 226.84 646.11 226.43 C643.48 226.02 642.44 225.63 641.65 225.03 C640.86 224.42 641.31 224.18 641.73 223.07 C642.15 221.96 641.64 221.83 643.98 218.86 C646.33 215.89 652.03 209.86 654.76 206.56 C657.49 203.27 657.86 202.62 659.17 200.56 C660.47 198.50 661.24 196.96 662.00 195.13 C662.77 193.29 663.14 191.94 663.39 190.34 C663.64 188.75 663.53 187.42 663.39 186.27 C663.25 185.11 663.02 184.77 662.62 183.94 C662.22 183.10 662.06 182.69 661.17 181.63 C660.27 180.57 658.87 179.12 657.66 178.03 C656.45 176.93 655.35 176.21 654.44 175.53 C653.52 174.85 653.58 174.72 652.56 174.25 C651.55 173.78 650.16 173.10 648.81 172.91 C647.46 172.71 646.41 172.79 645.06 173.18 C643.71 173.57 643.48 173.38 641.31 175.07 C639.14 176.76 635.51 180.48 633.00 182.58 C630.49 184.67 632.32 183.54 627.36 186.70 C622.40 189.85 611.07 196.22 605.44 200.11 C599.80 204.00 599.07 205.15 596.06 208.33 C593.06 211.51 590.69 215.55 588.74 217.77 C586.79 219.98 586.73 219.68 585.24 220.63 C583.75 221.59 582.41 222.28 580.46 223.09 C578.51 223.90 576.81 224.47 574.39 225.13 C571.97 225.79 569.91 226.25 567.03 226.76 C564.15 227.27 563.75 227.54 558.39 227.98 C553.03 228.41 545.33 229.03 537.25 229.17 C529.17 229.31 519.58 228.96 513.50 228.74 C507.43 228.53 508.23 228.59 503.50 227.96 C498.77 227.34 491.30 226.10 487.25 225.26 C483.20 224.43 483.02 224.10 481.00 223.35 C478.98 222.59 477.57 221.94 476.00 221.05 C474.43 220.15 473.38 219.40 472.25 218.37 C471.13 217.34 471.33 216.82 469.75 215.32 C468.17 213.81 466.04 211.73 463.48 210.02 C460.93 208.31 458.70 207.14 455.53 205.82 C452.36 204.50 451.39 203.94 445.89 202.71 C440.39 201.49 429.94 199.97 424.96 199.01 C419.98 198.06 420.13 197.97 418.22 197.41 C416.31 196.85 415.23 196.43 414.35 195.90 C413.47 195.37 413.38 195.18 413.34 194.47 C413.30 193.76 412.77 193.67 414.13 191.94 C415.49 190.21 419.29 186.82 420.91 184.85 C422.53 182.88 422.45 182.57 423.14 180.98 C423.83 179.39 424.29 178.00 424.76 176.01 C425.23 174.02 425.52 172.21 425.77 169.94 C426.01 167.67 426.13 165.50 426.12 163.40 C426.12 161.30 426.00 159.85 425.72 158.25 C425.44 156.65 425.11 155.60 424.55 154.51 C424.00 153.41 424.11 152.98 422.63 152.15 C421.14 151.33 420.68 150.67 416.31 149.91 C411.95 149.16 402.32 148.47 398.39 147.97 C394.46 147.47 395.83 147.61 394.46 147.14 C393.09 146.67 391.62 146.00 390.79 145.35 C389.97 144.69 389.82 144.83 389.87 143.48 C389.93 142.14 389.39 141.87 391.08 137.87 C392.78 133.87 397.37 125.70 399.30 121.28 C401.22 116.86 401.14 116.25 401.78 113.31 C402.42 110.38 402.66 107.25 402.85 104.97 C403.04 102.69 403.09 103.76 402.86 100.66 C402.62 97.55 401.63 91.25 401.56 87.72 C401.48 84.19 402.08 82.74 402.44 81.07 C402.80 79.40 403.08 79.30 403.57 78.44 C404.05 77.58 404.50 76.98 405.15 76.29 C405.80 75.60 406.38 75.13 407.19 74.61 C408.01 74.08 407.71 74.08 409.69 73.39 C411.68 72.70 415.76 71.67 418.22 70.78 C420.67 69.88 421.18 69.64 423.31 68.40 C425.45 67.16 428.17 65.44 430.09 63.90 C432.02 62.35 432.70 61.70 434.01 59.81 C435.33 57.92 436.28 56.13 437.40 53.41 C438.53 50.69 438.67 52.07 440.26 44.70 C441.85 37.34 444.74 19.80 446.24 12.50 C447.75 5.20 448.06 5.90 448.62 4.16 C449.18 2.41 448.81 3.31 449.35 2.81 C449.88 2.32 450.87 1.69 451.61 1.40 C452.34 1.12 452.52 1.11 453.43 1.24 C454.33 1.38 455.44 1.53 456.63 2.17Z M704.18 12.95 C708.25 12.40 706.23 12.88 707.24 13.38 C708.26 13.89 709.19 14.60 709.82 15.76 C710.45 16.92 710.49 17.78 710.74 19.83 C710.99 21.87 711.15 23.52 711.20 27.11 C711.25 30.69 711.23 36.30 711.02 39.76 C710.81 43.21 710.53 44.47 710.04 46.28 C709.55 48.09 709.19 48.92 708.31 49.82 C707.42 50.72 707.40 50.73 705.13 51.30 C702.86 51.87 701.07 52.47 695.70 52.99 C690.33 53.51 681.64 54.01 675.28 54.21 C668.92 54.40 665.39 54.30 660.38 54.08 C655.36 53.87 651.67 53.54 647.44 53.01 C643.20 52.47 640.10 51.90 636.83 51.12 C633.57 50.34 631.46 49.65 629.30 48.68 C627.14 47.70 626.17 47.01 624.83 45.69 C623.49 44.38 622.49 42.76 621.86 41.39 C621.23 40.01 621.22 39.41 621.33 38.06 C621.44 36.72 621.80 35.24 622.47 33.91 C623.14 32.59 624.10 31.54 625.06 30.70 C626.03 29.86 626.10 29.87 627.83 29.24 C629.56 28.61 630.22 28.31 634.68 27.18 C639.13 26.06 643.60 24.92 652.58 22.99 C661.57 21.06 675.31 18.26 684.60 16.45 C693.89 14.64 700.10 13.50 704.18 12.95Z M516.45 53.67 C519.10 54.18 520.33 54.63 522.13 55.30 C523.93 55.96 525.14 56.54 526.45 57.35 C527.76 58.17 528.59 58.87 529.41 59.84 C530.23 60.81 530.66 61.93 531.00 62.74 C531.34 63.56 531.33 63.44 531.29 64.36 C531.24 65.27 531.21 66.53 530.75 67.84 C530.30 69.16 529.73 70.24 528.75 71.68 C527.76 73.13 527.30 73.93 525.27 75.88 C523.23 77.82 520.00 80.69 517.45 82.48 C514.91 84.27 513.55 84.81 511.14 85.83 C508.72 86.85 508.20 87.31 504.03 88.15 C499.86 88.99 491.51 89.84 487.99 90.49 C484.48 91.15 485.68 91.23 484.48 91.80 C483.28 92.36 482.40 92.87 481.34 93.62 C480.28 94.37 479.50 95.03 478.57 95.96 C477.63 96.90 476.96 97.70 476.16 98.82 C475.36 99.95 475.31 99.36 474.13 102.21 C472.94 105.05 470.74 111.71 469.59 114.61 C468.44 117.52 468.45 117.08 467.73 118.37 C467.01 119.66 466.90 120.12 465.60 121.79 C464.29 123.45 462.52 125.76 460.48 127.62 C458.44 129.48 456.57 130.79 454.25 132.13 C451.93 133.46 449.69 134.41 447.61 135.05 C445.53 135.68 443.91 135.65 442.71 135.66 C441.50 135.66 441.47 135.40 440.90 135.09 C440.33 134.79 439.95 134.47 439.54 133.95 C439.12 133.44 438.86 132.96 438.60 132.23 C438.35 131.51 438.20 131.39 438.10 129.94 C438.01 128.49 437.95 126.78 438.07 124.19 C438.18 121.60 438.34 118.67 438.74 115.56 C439.13 112.46 439.71 109.50 440.27 106.94 C440.82 104.38 441.16 103.24 441.81 101.35 C442.47 99.45 443.06 98.06 443.92 96.39 C444.77 94.71 445.52 93.50 446.58 92.06 C447.64 90.61 447.89 90.04 449.80 88.36 C451.72 86.69 455.19 84.11 457.22 82.74 C459.25 81.37 458.97 81.60 461.06 80.75 C463.15 79.91 466.84 78.94 468.85 78.03 C470.86 77.12 471.10 76.73 472.23 75.71 C473.35 74.69 473.75 74.64 475.10 72.36 C476.45 70.09 478.63 65.12 479.74 63.07 C480.84 61.02 480.65 61.68 481.24 60.97 C481.82 60.25 481.91 59.98 482.99 59.10 C484.07 58.23 485.52 57.01 487.23 56.09 C488.93 55.18 489.91 54.67 492.46 54.03 C495.02 53.39 498.74 52.83 501.44 52.55 C504.13 52.27 504.73 52.26 507.44 52.46 C510.14 52.66 513.81 53.16 516.45 53.67Z M571.76 61.87 C573.74 62.83 575.73 63.65 578.53 65.73 C581.33 67.81 584.25 70.20 587.29 73.43 C590.34 76.66 593.09 80.32 595.43 83.65 C597.77 86.98 598.58 88.35 600.29 91.93 C602.00 95.51 603.86 100.45 604.95 103.54 C606.04 106.62 605.96 107.14 606.34 109.09 C606.71 111.03 606.91 112.50 607.05 114.34 C607.18 116.19 607.22 117.64 607.09 119.31 C606.96 120.99 606.62 122.59 606.34 123.66 C606.06 124.72 606.12 124.59 605.54 125.22 C604.95 125.84 604.17 126.73 603.08 127.13 C601.99 127.52 600.99 127.60 599.49 127.41 C597.99 127.22 596.47 126.81 594.76 126.06 C593.06 125.32 591.66 124.53 590.02 123.28 C588.38 122.03 587.15 120.87 585.64 119.13 C584.12 117.38 583.33 116.46 581.61 113.59 C579.89 110.73 578.17 106.80 576.08 103.20 C573.99 99.60 571.89 96.35 570.00 93.59 C568.10 90.84 567.92 90.65 565.55 87.89 C563.17 85.13 559.06 80.98 556.82 78.27 C554.58 75.55 553.95 74.30 553.11 72.83 C552.26 71.35 552.22 71.15 552.12 70.06 C552.02 68.97 552.08 67.91 552.55 66.78 C553.02 65.65 553.62 64.81 554.71 63.78 C555.79 62.75 556.98 61.76 558.59 61.06 C560.20 60.37 562.04 60.04 563.64 59.92 C565.25 59.80 566.04 60.05 567.50 60.40 C568.96 60.75 569.77 60.91 571.76 61.87Z M46.15 73.92 C51.73 75.19 62.03 77.80 66.92 79.13 C71.81 80.46 71.50 80.57 73.32 81.31 C75.15 82.04 75.98 82.38 77.07 83.20 C78.15 84.03 78.67 84.63 79.36 85.89 C80.05 87.14 80.62 88.75 80.89 90.18 C81.16 91.60 81.09 92.58 80.86 93.82 C80.62 95.05 80.27 95.97 79.59 97.03 C78.90 98.09 78.03 98.96 77.06 99.71 C76.09 100.45 75.67 100.70 74.20 101.17 C72.73 101.65 72.11 101.91 68.90 102.33 C65.70 102.74 60.69 103.19 56.39 103.46 C52.09 103.74 48.01 103.82 45.00 103.83 C41.99 103.84 41.48 103.72 39.70 103.54 C37.91 103.36 36.62 103.16 35.09 102.83 C33.55 102.49 32.46 102.17 31.17 101.68 C29.89 101.20 28.99 100.75 27.95 100.11 C26.92 99.47 26.21 98.91 25.43 98.11 C24.65 97.31 24.14 96.63 23.60 95.67 C23.07 94.72 22.86 95.40 22.47 92.81 C22.08 90.22 21.53 84.39 21.42 81.27 C21.32 78.15 21.63 76.96 21.87 75.46 C22.10 73.96 22.37 73.54 22.75 72.94 C23.12 72.34 22.92 72.39 23.95 72.13 C24.99 71.86 26.36 71.47 28.51 71.46 C30.66 71.45 32.73 71.62 35.91 72.06 C39.08 72.50 40.57 72.65 46.15 73.92Z M217.52 69.88 C218.80 70.04 218.83 70.15 219.95 70.91 C221.07 71.66 220.95 71.21 223.74 74.06 C226.53 76.91 232.05 82.84 235.42 86.75 C238.80 90.66 240.29 92.51 242.50 95.80 C244.72 99.09 246.17 101.67 247.71 105.03 C249.24 108.39 250.18 111.03 251.04 114.45 C251.90 117.88 252.27 120.02 252.49 124.06 C252.71 128.10 252.41 133.58 252.24 136.90 C252.07 140.21 251.87 140.90 251.55 142.48 C251.22 144.05 250.91 144.95 250.43 145.67 C249.95 146.39 249.63 146.54 248.89 146.48 C248.14 146.41 248.20 147.48 246.30 145.32 C244.40 143.16 241.26 137.65 238.34 134.49 C235.43 131.33 232.97 129.86 230.09 127.75 C227.22 125.64 226.00 124.85 222.37 122.77 C218.74 120.68 213.32 117.75 209.94 116.17 C206.55 114.59 205.58 114.45 203.56 113.98 C201.54 113.51 200.18 113.39 198.72 113.56 C197.25 113.72 196.23 114.44 195.40 114.89 C194.57 115.34 194.71 115.28 194.13 116.06 C193.54 116.84 192.78 117.43 192.15 119.23 C191.52 121.04 190.94 122.81 190.63 126.09 C190.33 129.37 190.64 134.34 190.47 137.46 C190.29 140.59 189.98 141.91 189.67 143.45 C189.35 144.99 189.36 145.07 188.71 146.02 C188.07 146.97 187.48 147.69 186.10 148.74 C184.72 149.80 183.32 150.67 181.07 151.87 C178.82 153.07 176.43 154.38 173.63 155.40 C170.82 156.43 167.90 157.14 165.47 157.55 C163.04 157.97 162.03 157.84 160.11 157.72 C158.19 157.60 156.24 157.17 154.81 156.87 C153.39 156.58 153.48 156.66 152.19 156.07 C150.89 155.48 149.10 154.69 147.61 153.58 C146.12 152.47 144.85 150.99 143.92 149.92 C142.98 148.85 143.10 149.03 142.41 147.64 C141.71 146.25 140.83 144.92 140.06 142.21 C139.29 139.50 138.54 135.53 138.14 132.61 C137.75 129.69 137.72 129.03 137.87 125.99 C138.02 122.96 138.17 119.92 138.98 115.75 C139.79 111.58 141.01 106.96 142.38 102.80 C143.76 98.65 145.14 95.59 146.63 92.67 C148.12 89.75 148.96 88.67 150.65 86.56 C152.34 84.46 154.27 82.60 156.01 80.98 C157.74 79.36 158.65 78.71 160.31 77.55 C161.98 76.40 163.34 75.45 165.25 74.56 C167.16 73.68 168.13 73.14 170.94 72.63 C173.75 72.12 176.49 71.65 180.88 71.72 C185.26 71.78 191.68 72.76 195.29 72.98 C198.90 73.21 199.13 73.08 200.95 72.97 C202.77 72.86 203.28 72.93 205.41 72.39 C207.54 71.86 210.61 70.44 212.79 69.99 C214.97 69.54 216.23 69.71 217.52 69.88Z M670.95 71.86 C674.08 72.02 676.52 72.38 679.64 73.13 C682.76 73.87 684.72 74.39 688.30 75.98 C691.88 77.58 696.17 79.95 699.52 82.01 C702.87 84.07 705.15 85.89 706.94 87.44 C708.72 88.99 708.76 89.14 709.43 90.61 C710.10 92.08 710.49 93.49 710.66 95.62 C710.83 97.75 710.69 100.65 710.38 102.44 C710.07 104.23 709.42 104.77 708.93 105.55 C708.45 106.33 708.55 106.23 707.70 106.79 C706.84 107.34 705.70 108.12 704.19 108.62 C702.68 109.13 701.31 109.41 699.30 109.61 C697.29 109.81 695.55 109.85 693.03 109.73 C690.50 109.61 689.26 109.60 685.29 108.92 C681.32 108.24 676.52 107.35 670.95 105.97 C665.38 104.59 659.43 102.85 654.36 101.26 C649.29 99.67 645.86 98.46 642.78 97.13 C639.69 95.81 638.49 95.16 637.23 93.92 C635.98 92.68 636.04 91.66 635.82 90.24 C635.60 88.83 635.81 87.22 636.01 86.06 C636.22 84.90 636.08 84.84 636.94 83.80 C637.80 82.76 638.88 81.57 640.80 80.28 C642.72 78.99 644.81 77.86 647.62 76.63 C650.42 75.39 653.77 74.22 656.39 73.44 C659.02 72.65 659.61 72.53 662.23 72.24 C664.85 71.96 667.82 71.70 670.95 71.86Z M520.36 121.00 C522.08 121.45 524.38 122.45 526.10 123.32 C527.81 124.20 528.19 124.45 529.89 125.87 C531.58 127.29 533.63 129.14 535.51 131.20 C537.40 133.26 539.12 135.60 540.36 137.30 C541.59 139.01 541.79 139.34 542.35 140.66 C542.92 141.97 543.38 143.53 543.50 144.61 C543.61 145.69 543.60 145.77 542.99 146.64 C542.38 147.52 541.61 148.50 540.11 149.48 C538.62 150.45 536.53 151.33 534.69 152.05 C532.84 152.78 531.65 153.09 529.88 153.49 C528.10 153.89 526.68 154.10 524.81 154.26 C522.95 154.42 521.46 154.45 519.50 154.37 C517.54 154.28 515.92 154.13 513.94 153.80 C511.96 153.48 510.23 153.14 508.51 152.55 C506.79 151.97 505.64 151.40 504.38 150.54 C503.13 149.68 502.34 148.90 501.55 147.77 C500.77 146.63 500.35 145.61 500.02 144.24 C499.69 142.86 499.64 141.61 499.72 140.14 C499.81 138.67 499.79 137.89 500.50 136.07 C501.21 134.24 502.14 132.12 503.67 130.01 C505.20 127.89 507.36 125.78 508.99 124.32 C510.62 122.87 511.39 122.56 512.75 121.93 C514.11 121.30 515.17 120.99 516.54 120.82 C517.91 120.66 518.64 120.55 520.36 121.00Z M681.34 125.59 C684.42 125.54 685.41 125.57 687.49 125.76 C689.56 125.95 691.07 126.19 692.87 126.64 C694.67 127.08 695.96 127.52 697.49 128.22 C699.02 128.92 700.09 129.56 701.35 130.51 C702.60 131.46 703.46 132.30 704.44 133.51 C705.41 134.72 706.06 135.76 706.77 137.22 C707.47 138.68 707.90 139.92 708.33 141.64 C708.76 143.35 708.98 144.79 709.13 146.76 C709.28 148.73 709.34 150.67 709.17 152.59 C708.99 154.51 708.71 155.87 708.15 157.43 C707.60 158.99 707.02 160.07 706.09 161.27 C705.16 162.47 704.28 163.27 702.97 164.12 C701.66 164.96 700.49 165.48 698.80 165.97 C697.11 166.46 695.65 166.70 693.58 166.83 C691.51 166.96 689.75 166.92 687.31 166.69 C684.86 166.47 686.29 167.14 679.98 165.56 C673.67 163.98 658.70 159.82 652.25 157.91 C645.81 155.99 646.09 155.69 644.17 154.92 C642.24 154.15 642.45 154.26 641.57 153.64 C640.68 153.02 639.85 152.25 639.26 151.50 C638.66 150.75 638.55 150.40 638.26 149.50 C637.97 148.60 637.72 147.40 637.64 146.50 C637.55 145.60 637.63 145.24 637.80 144.50 C637.97 143.76 637.85 143.49 638.61 142.39 C639.37 141.29 639.85 140.36 642.02 138.41 C644.20 136.46 647.96 133.33 650.70 131.56 C653.44 129.79 655.35 129.32 657.24 128.58 C659.13 127.84 658.81 127.93 661.18 127.47 C663.54 127.01 666.75 126.36 670.37 126.02 C674.00 125.68 678.26 125.64 681.34 125.59Z M356.38 152.56 C358.44 153.29 361.38 154.48 363.57 155.71 C365.76 156.94 366.73 157.84 368.55 159.39 C370.36 160.95 371.38 161.80 373.67 164.35 C375.96 166.89 378.99 170.60 381.27 173.53 C383.56 176.47 385.04 178.57 386.36 180.66 C387.67 182.74 388.15 184.14 388.56 185.10 C388.98 186.06 388.78 185.69 388.66 185.98 C388.54 186.28 389.37 186.32 387.90 186.76 C386.43 187.19 385.76 188.00 380.49 188.41 C375.23 188.82 363.62 189.02 358.64 189.04 C353.65 189.06 354.74 188.79 352.80 188.51 C350.87 188.23 349.49 187.94 347.88 187.47 C346.27 187.01 345.15 186.57 343.87 185.92 C342.59 185.27 341.72 184.69 340.77 183.85 C339.82 183.01 339.21 182.29 338.59 181.27 C337.97 180.25 337.61 179.38 337.32 178.17 C337.02 176.97 336.69 177.21 336.96 174.56 C337.23 171.91 338.04 166.77 338.82 163.45 C339.59 160.14 340.47 157.95 341.27 156.14 C342.07 154.33 342.21 154.18 343.24 153.38 C344.27 152.57 345.37 151.99 346.97 151.68 C348.57 151.37 350.44 151.50 352.14 151.65 C353.83 151.81 354.32 151.83 356.38 152.56Z M588.22 165.33 C589.69 165.75 591.03 166.17 592.25 166.89 C593.48 167.61 594.26 168.30 595.03 169.34 C595.81 170.39 596.24 171.33 596.56 172.69 C596.89 174.06 596.85 175.73 596.84 176.94 C596.83 178.14 596.89 178.07 596.50 179.40 C596.12 180.73 595.62 182.55 594.70 184.33 C593.77 186.11 592.84 187.49 591.37 189.28 C589.90 191.07 588.54 192.46 586.52 194.26 C584.50 196.05 582.56 197.56 580.15 199.25 C577.75 200.94 576.42 201.94 573.15 203.66 C569.89 205.37 565.44 207.42 562.03 208.78 C558.61 210.14 557.05 210.47 554.19 211.21 C551.34 211.96 550.38 212.27 546.16 212.92 C541.93 213.58 536.13 214.52 530.72 214.85 C525.31 215.19 520.63 215.06 516.09 214.78 C511.55 214.51 509.26 214.06 505.50 213.30 C501.74 212.54 499.39 212.02 495.19 210.56 C490.99 209.10 486.62 207.41 482.15 205.16 C477.69 202.92 474.21 200.80 470.37 198.11 C466.52 195.42 463.12 192.31 460.79 190.22 C458.46 188.12 458.47 187.80 457.43 186.48 C456.39 185.16 455.82 184.42 455.03 182.88 C454.23 181.33 453.47 179.30 453.03 177.88 C452.60 176.46 452.63 175.96 452.60 174.98 C452.58 173.99 452.66 173.27 452.90 172.41 C453.13 171.55 453.28 170.89 453.91 170.19 C454.54 169.49 455.60 168.92 456.38 168.51 C457.16 168.09 456.45 168.17 458.25 167.89 C460.06 167.61 462.89 167.03 466.43 166.96 C469.97 166.89 474.48 167.11 477.92 167.50 C481.36 167.88 482.85 168.33 485.53 169.09 C488.21 169.85 489.04 169.83 492.83 171.74 C496.62 173.64 502.24 177.43 506.59 179.66 C510.94 181.88 513.20 182.91 517.00 184.10 C520.80 185.29 522.98 185.81 527.69 186.26 C532.40 186.70 539.01 186.71 543.17 186.55 C547.32 186.40 548.60 186.02 550.78 185.41 C552.97 184.79 553.67 184.24 555.29 183.14 C556.92 182.03 557.62 181.44 559.79 179.27 C561.95 177.11 565.13 173.22 567.32 171.11 C569.51 169.01 570.55 168.51 571.95 167.56 C573.35 166.60 573.60 166.37 575.10 165.82 C576.59 165.27 578.65 164.74 580.27 164.51 C581.89 164.28 582.67 164.40 584.10 164.55 C585.53 164.70 586.75 164.91 588.22 165.33Z M288.23 169.44 C289.03 169.59 290.54 170.01 291.48 170.59 C292.43 171.17 292.29 170.62 293.48 172.66 C294.66 174.70 296.50 179.41 298.07 181.92 C299.64 184.43 300.79 185.41 302.18 186.63 C303.57 187.85 303.22 187.73 305.80 188.70 C308.38 189.67 314.30 191.21 316.52 191.99 C318.75 192.77 317.76 192.66 318.16 193.05 C318.57 193.43 318.99 193.71 318.76 194.12 C318.54 194.53 318.10 194.85 316.91 195.31 C315.72 195.78 316.30 195.85 312.14 196.67 C307.99 197.50 299.46 199.05 293.84 199.88 C288.23 200.71 284.19 201.03 280.93 201.27 C277.67 201.50 277.11 201.36 275.73 201.19 C274.35 201.02 273.75 200.80 273.27 200.32 C272.79 199.83 272.87 199.78 273.06 198.50 C273.26 197.21 273.02 196.83 274.36 193.18 C275.70 189.52 278.68 182.05 280.53 178.20 C282.37 174.35 283.42 173.30 284.59 171.78 C285.77 170.26 286.41 170.19 287.07 169.77 C287.72 169.34 287.44 169.29 288.23 169.44Z M193.26 185.13 C196.21 187.43 199.35 189.96 201.85 192.19 C204.36 194.43 205.97 196.21 207.19 197.53 C208.42 198.86 208.27 198.91 208.64 199.56 C209.02 200.21 209.20 200.65 209.28 201.15 C209.36 201.64 209.31 201.97 209.10 202.31 C208.89 202.64 209.28 202.79 208.11 203.03 C206.95 203.27 205.00 203.62 202.63 203.63 C200.27 203.63 197.41 203.45 194.98 203.06 C192.54 202.67 191.09 202.43 189.09 201.46 C187.09 200.49 185.61 199.46 183.88 197.67 C182.14 195.89 180.84 193.92 179.46 191.54 C178.08 189.16 177.03 186.68 176.20 184.43 C175.37 182.19 174.99 180.69 174.85 179.09 C174.71 177.48 175.14 176.22 175.41 175.50 C175.68 174.78 175.55 174.99 176.34 175.09 C177.14 175.19 178.19 175.29 179.83 176.06 C181.47 176.84 183.05 177.78 185.47 179.41 C187.89 181.04 190.31 182.82 193.26 185.13Z"
              />
            </svg>

            {/* Título centrado sobre el rectángulo */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontFamily: BEBES,
                  fontSize: 'clamp(50px,12vw,165px)',
                  color: '#f0e3c2',
                  display: 'block',
                  lineHeight: 0.87,
                  letterSpacing: '0.015em',
                  textAlign: 'center',
                }}
              >
                PRÓXIMAS
              </span>
              <span
                style={{
                  fontFamily: BEBES,
                  fontSize: 'clamp(50px,12vw,165px)',
                  color: '#f0e3c2',
                  display: 'block',
                  lineHeight: 0.87,
                  letterSpacing: '0.015em',
                  textAlign: 'center',
                }}
              >
                FECHAS
              </span>
            </div>
          </div>

          {/* Meta bar */}
          <div
            style={{
              paddingTop: 'clamp(8px,1.2vw,12px)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#ef4444',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 7,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                }}
              >
                6 DISPONIBLES
              </span>
            </div>
            <div
              style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 7,
                color: 'rgba(255,255,255,0.18)',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
              }}
            >
              TEMPORADA 2025
            </span>
            <a
              href={BOOKING_URL}
              style={{
                marginLeft: 'auto',
                fontFamily: MONO,
                fontSize: 7,
                color: 'rgba(255,255,255,0.28)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: 2,
              }}
            >
              RESERVAR →
            </a>
          </div>
        </div>

        {/* ── DATE ROWS ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {UPCOMING.map(({ date, place, event }, i) => {
            const [day, month] = date.split(' ')
            return (
              <div key={i} className="fd-row">
                {/* Date — día en rojo, mes en mono */}
                <div className="fd-date-col">
                  <span className="fd-day">{day}</span>
                  <span className="fd-month">{month}</span>
                </div>

                {/* Ciudad — enorme y outline, se rellena al hover */}
                <div className="fd-city-col">
                  <span className="fd-city">{place}</span>
                </div>

                {/* Meta — tipo de evento + número */}
                <div className="fd-meta-col">
                  <span className="fd-event">{event}</span>
                  <span className="fd-idx">{String(i + 1).padStart(2, '0')}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 5%',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 6,
              color: 'rgba(255,255,255,0.15)',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            TEMPORADA 2025
          </span>
          <a
            href={BOOKING_URL}
            style={{
              fontFamily: MONO,
              fontSize: 7,
              color: 'rgba(255,255,255,0.3)',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
              paddingBottom: 2,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Reservá tu fecha →
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MULTIMEDIA — #04
          Mundo 3: Hoja de contactos 35mm · Archivo fílmico
          Oscuro cálido, todo en Courier, grain táctil
      ══════════════════════════════════════════ */}
      <section className="bg-[#090705] overflow-hidden">
        {/* Tira de perforaciones superior — decorativa */}
        <div className="w-full h-7 flex items-center bg-[#050402] border-b border-black/40 overflow-hidden">
          <div className="flex items-center gap-0 flex-1">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 mx-[6px] w-[10px] h-[16px] rounded-[2px]"
                style={{ background: '#0a0806', border: '1px solid rgba(0,0,0,0.5)' }}
              />
            ))}
          </div>
        </div>

        {/* ID strip */}
        <div className="px-[5%] py-4 flex items-center justify-between border-b border-white/[0.03]">
          <p
            style={{
              fontFamily: MONO,
              fontSize: 8,
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.35em',
            }}
          >
            04 / MULTIMEDIA
          </p>
          <div className="flex items-center gap-2">
            <span className="rec-dot w-[5px] h-[5px] rounded-full bg-red-500 block" />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 7,
                color: 'rgba(239,68,68,0.65)',
                letterSpacing: '0.3em',
              }}
            >
              ARCHIVO ACTIVO
            </span>
          </div>
        </div>

        {/* Número de hoja de contactos + header */}
        <div className="px-[5%] pt-6 pb-4 border-b border-white/[0.03]">
          <div className="flex items-baseline gap-5">
            <p
              className="leading-none"
              style={{
                fontFamily: MONO,
                fontSize: 'clamp(52px, 10vw, 130px)',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.06)',
                letterSpacing: '-0.02em',
              }}
            >
              SHOWREEL
            </p>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 7,
                color: 'rgba(255,255,255,0.15)',
                letterSpacing: '0.3em',
                transform: 'translateY(-4px)',
              }}
            >
              2024–25
            </p>
          </div>
        </div>

        {/* ── FRAME PRINCIPAL ── */}
        <div className="px-[5%] pt-5">
          <div
            className="relative overflow-hidden film-grain-overlay"
            style={{ aspectRatio: '16/9', background: '#060504' }}
          >
            {/* Perforaciones top */}
            <div
              className="absolute top-0 left-0 right-0 z-10 h-[22px] flex items-center justify-around px-1"
              style={{ background: '#030201' }}
            >
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-[14px] rounded-[2px]"
                  style={{ background: '#060504', border: '1px solid rgba(0,0,0,0.7)' }}
                />
              ))}
            </div>
            {/* Perforaciones bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 z-10 h-[22px] flex items-center justify-around px-1"
              style={{ background: '#030201' }}
            >
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-[14px] rounded-[2px]"
                  style={{ background: '#060504', border: '1px solid rgba(0,0,0,0.7)' }}
                />
              ))}
            </div>

            {/* Número de frame */}
            <div className="absolute top-[28px] left-4 z-10">
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.15)',
                  letterSpacing: '0.1em',
                }}
              >
                001 ▷ 24fps · SP
              </span>
            </div>

            {/* Play */}
            <div className="absolute inset-[22px] flex items-center justify-center">
              <div className="relative group/play cursor-pointer">
                <div
                  className="absolute -inset-8 rounded-full border border-white/[0.04] animate-ping"
                  style={{ animationDuration: '3.5s' }}
                />
                <div
                  className="absolute -inset-3 rounded-full border border-white/[0.06] animate-ping"
                  style={{ animationDuration: '2.2s', animationDelay: '0.8s' }}
                />
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center group-hover/play:bg-red-500/10 transition-all duration-400"
                  style={{ border: '1.5px solid rgba(255,255,255,0.14)' }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="rgba(255,255,255,0.45)"
                    className="ml-1 group-hover/play:fill-white transition-all duration-300"
                    aria-hidden
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Label inferior */}
            <div className="absolute bottom-[28px] left-4 right-4 z-10 flex items-end justify-between">
              <div>
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 7,
                    color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.22em',
                  }}
                >
                  FACUU_JUAREZ_SHOWREEL_2024-25.mp4
                </p>
              </div>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: 7,
                  color: 'rgba(239,68,68,0.45)',
                  letterSpacing: '0.2em',
                }}
              >
                12:34
              </p>
            </div>
          </div>
        </div>

        {/* ── TIRA DE FRAMES SECUNDARIOS ── */}
        <div className="px-[5%] pt-3 pb-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: '002', label: 'BODA_TUC_2024', loc: 'Tucumán · Feb', dur: '03:42' },
              { num: '003', label: 'GALA_SAL_2024', loc: 'Salta · Ago', dur: '04:15' },
              { num: '004', label: 'QCEA_TUC_2025', loc: 'Tucumán · Ene', dur: '05:08' },
            ].map(({ num, label, loc, dur }) => (
              <div
                key={num}
                className="relative overflow-hidden film-grain-overlay cursor-pointer group/frame"
                style={{ aspectRatio: '4/3', background: '#060504' }}
              >
                {/* Perforaciones top */}
                <div
                  className="absolute top-0 left-0 right-0 z-10 h-[14px] flex items-center justify-around px-0.5"
                  style={{ background: '#030201' }}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-[9px] rounded-[1px]"
                      style={{ background: '#060504', border: '1px solid rgba(0,0,0,0.7)' }}
                    />
                  ))}
                </div>
                {/* Perforaciones bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 z-10 h-[14px] flex items-center justify-around px-0.5"
                  style={{ background: '#030201' }}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-[9px] rounded-[1px]"
                      style={{ background: '#060504', border: '1px solid rgba(0,0,0,0.7)' }}
                    />
                  ))}
                </div>

                {/* Frame number top-left */}
                <div className="absolute top-[18px] left-2 z-10">
                  <span style={{ fontFamily: MONO, fontSize: 6, color: 'rgba(255,255,255,0.12)' }}>
                    {num}
                  </span>
                </div>

                {/* Play micro */}
                <div className="absolute inset-[14px] flex items-center justify-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center group-hover/frame:border-red-500/40 transition-all duration-300"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="rgba(255,255,255,0.2)"
                      className="ml-0.5 group-hover/frame:fill-white/70 transition-all duration-300"
                      aria-hidden
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </div>

                {/* Label inferior */}
                <div className="absolute bottom-[18px] left-2 right-2 z-10">
                  <p
                    className="truncate"
                    style={{
                      fontFamily: MONO,
                      fontSize: 5,
                      color: 'rgba(255,255,255,0.2)',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {label}
                  </p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 5,
                        color: 'rgba(255,255,255,0.12)',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {loc}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 5,
                        color: 'rgba(239,68,68,0.3)',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {dur}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tira de perforaciones inferior — cierre */}
        <div className="w-full h-7 flex items-center bg-[#050402] border-t border-black/40 overflow-hidden">
          <div className="flex items-center gap-0 flex-1">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 mx-[6px] w-[10px] h-[16px] rounded-[2px]"
                style={{ background: '#0a0806', border: '1px solid rgba(0,0,0,0.5)' }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICIOS — #05  ·  Festival Lineup
      ══════════════════════════════════════════ */}
      <section className="bg-[#0a0a0a] overflow-hidden">
        <div className="px-[5%] h-11 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-[18px] bg-red-500" />
            <span
              className="tracking-[0.3em] uppercase text-white/30"
              style={{ fontFamily: BEBES, fontSize: 11 }}
            >
              05 / SERVICIOS
            </span>
          </div>
          <span className="text-[8px] tracking-[0.25em] text-white/15 uppercase">
            Tucumán · Argentina · NOA
          </span>
        </div>

        {[
          {
            name: 'BODAS',
            size: 'clamp(70px, 16vw, 215px)',
            alignClass: 'text-center',
            tag: '★ MÁS SOLICITADO',
          },
          {
            name: 'EVENTOS CORPORATIVOS',
            size: 'clamp(34px, 6.5vw, 88px)',
            alignClass: 'text-left',
            tag: null,
          },
          {
            name: 'FIESTAS PRIVADAS',
            size: 'clamp(44px, 9vw, 120px)',
            alignClass: 'text-right',
            tag: null,
          },
          {
            name: 'QUINCEAÑOS',
            size: 'clamp(60px, 13vw, 175px)',
            alignClass: 'text-left',
            tag: null,
          },
          {
            name: 'SHOWS & GALAS',
            size: 'clamp(46px, 9.5vw, 128px)',
            alignClass: 'text-center',
            tag: 'NUEVO',
          },
        ].map(({ name, size, alignClass, tag }, i) => (
          <div
            key={name}
            className={`group cursor-default transition-colors duration-300 hover:bg-red-500/[0.05] px-[5%] py-1.5 relative ${alignClass}${i > 0 ? ' border-t border-white/[0.04]' : ''}`}
          >
            <span
              className="inline-block leading-none tracking-[0.02em] text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.18)] group-hover:[-webkit-text-stroke:1.5px_rgba(239,68,68,0.72)] transition-all duration-300"
              style={{ fontFamily: BEBES, fontSize: size }}
            >
              {name}
            </span>
            {tag && (
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[7px] font-bold tracking-[0.3em] text-red-500 uppercase border border-red-500/40 px-2 py-0.5">
                {tag}
              </span>
            )}
          </div>
        ))}

        <div className="border-t border-white/5 overflow-hidden py-[9px]">
          <div
            className="whitespace-nowrap inline-block"
            style={{ animation: 'marquee 25s linear infinite' }}
          >
            {[0, 1].map((i) => (
              <span
                key={i}
                className="inline-flex items-center gap-[18px] pr-[60px] uppercase text-white/10 tracking-[0.22em]"
                style={{ fontFamily: BEBES, fontSize: 11 }}
              >
                {[
                  'BODAS',
                  'EVENTOS CORPORATIVOS',
                  'FIESTAS PRIVADAS',
                  'QUINCEAÑOS',
                  'SHOWS Y GALAS',
                ].map((s, j) => (
                  <span key={j} className="inline-flex items-center gap-[18px]">
                    {j > 0 && (
                      <svg width="4" height="4" viewBox="0 0 4 4" fill="#ef4444" aria-hidden>
                        <circle cx="2" cy="2" r="2" />
                      </svg>
                    )}
                    <span>{s}</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIOS — #06
      ══════════════════════════════════════════ */}
      <section className="bg-[#111111] overflow-hidden pt-[72px] px-[5%] relative">
        <div
          aria-hidden
          className="absolute top-[5%] left-[3%] leading-[0.8] tracking-[-0.02em] text-[rgba(239,68,68,0.055)] select-none pointer-events-none z-0"
          style={{ fontFamily: BEBES, fontSize: '28vw' }}
        >
          &ldquo;
        </div>

        <div className="flex items-center gap-2.5 mb-14 relative z-[1]">
          <div className="w-0.5 h-[18px] bg-red-500" />
          <span
            className="tracking-[0.3em] uppercase text-white/25"
            style={{ fontFamily: BEBES, fontSize: 11 }}
          >
            06 / TESTIMONIOS
          </span>
        </div>

        <div className="relative z-[1] mb-[52px]">
          <p
            className="leading-none tracking-[0.02em] text-white max-w-[82%] mb-7"
            style={{ fontFamily: BEBES, fontSize: 'clamp(36px, 7vw, 96px)' }}
          >
            LA MÚSICA PERFECTA. TODA LA NOCHE. SIN PAUSAS.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-7 h-px bg-red-500 flex-shrink-0" />
            <span className="text-[9px] font-bold tracking-[0.3em] text-red-500 uppercase">
              LUCAS Y VALENTINA
            </span>
            <span className="text-[8px] text-white/20 tracking-[0.12em] uppercase">
              · BODA · TUCUMÁN · 2024
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/[0.07] relative z-[1]">
          {[
            {
              quote:
                'El ambiente que creó en nuestra gala fue increíble. Todos los invitados comentaron la música toda la noche. Muy profesional y atento a cada detalle.',
              name: 'EMPRESA LOREM S.A.',
              event: 'GALA EMPRESARIAL',
              meta: 'SALTA · 2024',
            },
            {
              quote:
                'Su profesionalismo y la capacidad para leer el ambiente hicieron que mi quinceaños fuera exactamente lo que soñé.',
              name: 'JULIETA M.',
              event: 'QUINCEAÑOS',
              meta: 'TUCUMÁN · 2025',
            },
          ].map(({ quote, name, event, meta }, idx) => (
            <div
              key={name}
              className={`py-9${idx === 0 ? ' border-b border-white/[0.07] pb-8 md:border-b-0 md:border-r md:pr-10 md:pb-9' : ' pt-8 md:pt-9 md:pl-10'}`}
            >
              <p className="text-[8px] font-bold tracking-[0.3em] text-red-500 uppercase mb-4">
                {event}
              </p>
              <p className="text-[13.5px] leading-[1.75] text-white/55 italic mb-6">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-4 h-px bg-red-500 flex-shrink-0" />
                <span className="text-[8px] font-bold tracking-[0.25em] text-white/35 uppercase">
                  {name}
                </span>
                <span className="text-[8px] text-white/15 tracking-[0.12em]">· {meta}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="h-[72px]" />
      </section>

      {/* ══════════════════════════════════════════
          CONTACTO — #07
      ══════════════════════════════════════════ */}
      <section className="bg-[#0a0a0a] overflow-hidden relative">
        <div
          aria-hidden
          className="absolute right-[-2%] bottom-[8%] leading-none tracking-[-0.02em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.022)] select-none pointer-events-none whitespace-nowrap z-0"
          style={{ fontFamily: BEBES, fontSize: '28vw' }}
        >
          RESERVAR
        </div>

        <div className="px-[5%] pt-20 pb-16 relative z-[1]">
          <div className="flex items-center gap-4 mb-10">
            <span className="text-[7px] font-bold tracking-[0.4em] text-white/[0.18] uppercase border border-white/10 px-2.5 py-1">
              ADMIT ONE
            </span>
            <div className="w-px h-4 bg-white/[0.08]" />
            <div className="w-0.5 h-4 bg-red-500" />
            <span
              className="tracking-[0.3em] uppercase text-white/25"
              style={{ fontFamily: BEBES, fontSize: 11 }}
            >
              07 / CONTACTO
            </span>
          </div>
          <h2
            className="leading-[0.88] tracking-[0.01em] text-white mb-[52px]"
            style={{ fontFamily: BEBES, fontSize: 'clamp(52px, 10vw, 136px)' }}
          >
            TU EVENTO
            <br />
            MERECE
            <br />
            LO MEJOR.
          </h2>
          <div className="flex items-center gap-5 flex-wrap">
            <a
              href={BOOKING_URL}
              className="inline-flex items-center gap-3 bg-red-500 text-white px-8 py-3.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase no-underline"
            >
              Reservar una reunión
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="mailto:facuujuarez@gmail.com"
              className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/[0.28] no-underline border-b border-white/[0.12] pb-0.5"
            >
              o escribinos
            </a>
          </div>
        </div>

        <div className="mx-[5%] relative z-[1]">
          <div
            className="h-px"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 8px, transparent 8px, transparent 16px)',
            }}
          />
        </div>

        <div className="px-[5%] py-[18px] flex items-center justify-between relative z-[1]">
          <span
            className="text-white/40 tracking-[0.08em]"
            style={{ fontFamily: BEBES, fontSize: 15 }}
          >
            FACUU JUAREZ
          </span>
          <div className="flex items-center gap-5">
            <span className="text-[8px] tracking-[0.2em] text-white/[0.18] uppercase">
              Tucumán · Argentina
            </span>
            <div className="flex items-center gap-1.5">
              <svg width="4" height="4" viewBox="0 0 4 4" fill="rgba(239,68,68,0.4)" aria-hidden>
                <circle cx="2" cy="2" r="2" />
              </svg>
              <span className="text-[8px] tracking-[0.2em] text-white/[0.18] uppercase">2025</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
