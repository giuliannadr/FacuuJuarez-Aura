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

export default function Home() {
  return (
    <div className="bg-[#ecedee] overflow-x-hidden font-sans">
      {/* ══════════════════════════════════════════
          BANDA SUPERIOR — PRÓXIMAS FECHAS
      ══════════════════════════════════════════ */}
      <div className="h-[38px] bg-[#0f0f0f] flex items-center overflow-hidden border-b border-red-500/30 relative z-50">
        {/* Etiqueta fija */}
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

        {/* Separador */}
        <div className="w-px h-[38px] bg-red-500/25 flex-shrink-0" />

        {/* Ticker */}
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
          HERO
      ══════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden bg-[#ecedee]"
        style={{ height: 'calc(100svh - 38px)' }}
      >
        {/* Marca de agua "01" */}
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

        {/* ── Ecos de movimiento ── */}
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

        {/* ── Imagen principal ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/facuu.png"
          alt="Facuu Juarez DJ"
          className="hero-img-main absolute inset-0 w-full h-full object-cover mix-blend-multiply"
          style={{
            objectPosition: '50% 26%',
            filter: 'grayscale(1) contrast(1.05)',
          }}
        />

        {/* ── Scan line sutil ── */}
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

        {/* ── Barra roja izquierda ── */}
        <div aria-hidden className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-500 z-10" />

        {/* ── Columna izquierda ── */}
        <div
          className="hero-col absolute left-[5%] top-[8%] z-10 flex flex-col justify-between"
          style={{ height: '82%' }}
        >
          {/* Bloque tipográfico */}
          <div>
            {/* Tag editorial */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-[18px] h-px bg-red-500" />
              <span className="text-[8px] font-bold tracking-[0.38em] uppercase text-[#a1a1aa]">
                Tucumán · Argentina
              </span>
            </div>

            {/* FACUU — outlined */}
            <span
              className="hero-name block leading-[0.9] tracking-[0.03em] text-transparent [-webkit-text-stroke:2px_#18181b]"
              style={{ fontFamily: BEBES, fontSize: 'clamp(70px, 13vw, 155px)' }}
            >
              FACUU
            </span>

            {/* JUAREZ — rojo */}
            <span
              className="hero-name block leading-[0.9] tracking-[0.03em] text-red-500"
              style={{ fontFamily: BEBES, fontSize: 'clamp(70px, 13vw, 155px)' }}
            >
              JUAREZ
            </span>

            {/* Separador rojo */}
            <div className="mt-[18px] flex items-center gap-2.5">
              <div className="hero-sep-inner h-0.5 flex-1 max-w-[34vw] bg-red-500" />
              <svg width="6" height="6" viewBox="0 0 6 6" fill="#ef4444" aria-hidden>
                <polygon points="3,0 6,3 3,6 0,3" />
              </svg>
            </div>

            {/* Subtitle */}
            <p className="mt-3 text-[9px] font-semibold tracking-[0.3em] uppercase text-[#a1a1aa]">
              DJ · Productor · Tucumán
            </p>
          </div>

          {/* Stats + CTA */}
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

        {/* ── Reservar — top right ── */}
        <a
          href={BOOKING_URL}
          className="hero-reservar absolute right-6 top-6 z-10 border border-black/20 bg-[rgba(236,237,238,0.6)] backdrop-blur-[8px] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-[#52525b] no-underline transition-all duration-200"
        >
          Reservar
        </a>

        {/* ── Ecualizador — bottom right ── */}
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

        {/* ── Marquee inferior ── */}
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
                <span>DJ</span>
                <svg width="5" height="5" viewBox="0 0 5 5" fill="#ef4444" aria-hidden>
                  <polygon points="2.5,0 5,2.5 2.5,5 0,2.5" />
                </svg>
                <span>BODAS</span>
                <svg width="5" height="5" viewBox="0 0 5 5" fill="#ef4444" aria-hidden>
                  <polygon points="2.5,0 5,2.5 2.5,5 0,2.5" />
                </svg>
                <span>FIESTAS PRIVADAS</span>
                <svg width="5" height="5" viewBox="0 0 5 5" fill="#ef4444" aria-hidden>
                  <polygon points="2.5,0 5,2.5 2.5,5 0,2.5" />
                </svg>
                <span>EVENTOS CORPORATIVOS</span>
                <svg width="5" height="5" viewBox="0 0 5 5" fill="#ef4444" aria-hidden>
                  <polygon points="2.5,0 5,2.5 2.5,5 0,2.5" />
                </svg>
                <span>PRODUCTOR MUSICAL</span>
                <svg width="5" height="5" viewBox="0 0 5 5" fill="#ef4444" aria-hidden>
                  <polygon points="2.5,0 5,2.5 2.5,5 0,2.5" />
                </svg>
                <span>TUCUMÁN · ARGENTINA</span>
                <svg width="5" height="5" viewBox="0 0 5 5" fill="#ef4444" aria-hidden>
                  <polygon points="2.5,0 5,2.5 2.5,5 0,2.5" />
                </svg>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICIOS — #02  ·  Festival Lineup
      ══════════════════════════════════════════ */}
      <section className="bg-[#0a0a0a] overflow-hidden">
        {/* ID band */}
        <div className="px-[5%] h-11 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-[18px] bg-red-500" />
            <span
              className="tracking-[0.3em] uppercase text-white/30"
              style={{ fontFamily: BEBES, fontSize: 11 }}
            >
              02 / SERVICIOS
            </span>
          </div>
          <span className="text-[8px] tracking-[0.25em] text-white/15 uppercase">
            Tucumán · Argentina · NOA
          </span>
        </div>

        {/* Festival lineup — variable size & alignment like a real poster */}
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

        {/* Bottom scrolling strip */}
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
                <span>BODAS</span>
                <svg width="4" height="4" viewBox="0 0 4 4" fill="#ef4444" aria-hidden>
                  <circle cx="2" cy="2" r="2" />
                </svg>
                <span>EVENTOS CORPORATIVOS</span>
                <svg width="4" height="4" viewBox="0 0 4 4" fill="#ef4444" aria-hidden>
                  <circle cx="2" cy="2" r="2" />
                </svg>
                <span>FIESTAS PRIVADAS</span>
                <svg width="4" height="4" viewBox="0 0 4 4" fill="#ef4444" aria-hidden>
                  <circle cx="2" cy="2" r="2" />
                </svg>
                <span>QUINCEAÑOS</span>
                <svg width="4" height="4" viewBox="0 0 4 4" fill="#ef4444" aria-hidden>
                  <circle cx="2" cy="2" r="2" />
                </svg>
                <span>SHOWS Y GALAS</span>
                <svg width="4" height="4" viewBox="0 0 4 4" fill="#ef4444" aria-hidden>
                  <circle cx="2" cy="2" r="2" />
                </svg>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SOBRE MÍ — #03  ·  Dossier editorial
      ══════════════════════════════════════════ */}
      <section className="bg-[#ecedee] overflow-hidden">
        {/* ID band */}
        <div className="px-[5%] h-11 flex items-center justify-between border-b border-black/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-[18px] bg-red-500" />
            <span
              className="tracking-[0.3em] uppercase text-black/30"
              style={{ fontFamily: BEBES, fontSize: 11 }}
            >
              03 / SOBRE MÍ
            </span>
          </div>
          <span className="text-[8px] tracking-[0.25em] text-[#a1a1aa] uppercase">
            Tucumán · Argentina
          </span>
        </div>

        {/* Stats bar — 3 big numbers across the top */}
        <div className="flex border-b border-black/[0.08]">
          {(
            [
              { val: '+200', label: 'EVENTOS' },
              { val: '8+', label: 'AÑOS' },
              { val: "45'", label: 'POR REUNIÓN' },
            ] as const
          ).map(({ val, label }, i) => (
            <div
              key={val}
              className={`flex-1 px-[5%] py-7 relative${i > 0 ? ' border-l border-black/[0.08]' : ''}`}
            >
              {i === 0 && <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-red-500" />}
              <p
                className="leading-none tracking-[0.02em] text-[#18181b]"
                style={{ fontFamily: BEBES, fontSize: 'clamp(52px, 7vw, 96px)' }}
              >
                {val}
              </p>
              <p className="text-[7px] font-bold tracking-[0.3em] uppercase text-[#a1a1aa] mt-1.5">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* 2-col: bio left / pull quote right */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="px-[5%] py-10 border-b border-black/[0.08] md:border-b-0 md:border-r md:py-[40px]">
            <p className="text-[8px] font-bold tracking-[0.35em] uppercase text-[#a1a1aa] mb-4">
              BIOGRAFÍA
            </p>
            <p className="text-[13.5px] leading-[1.78] text-[#52525b]">
              Lorem ipsum sobre Facuu Juarez — DJ nacido y criado en Tucumán con más de 8 años
              recorriendo eventos en el NOA. Desde bodas íntimas hasta galas corporativas de 500
              personas, construye atmósferas que se quedan en la memoria de cada invitado.
            </p>
            <p className="text-[13.5px] leading-[1.78] text-[#52525b] mt-3.5">
              Su estilo fusiona géneros con precisión: leer al público, anticiparse a sus momentos y
              convertir cada transición en una experiencia emocional.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['BODAS', 'GALAS', 'CORPORATIVO', 'QUINCEAÑOS', 'SHOWS'].map((t) => (
                <span
                  key={t}
                  className="text-[7px] font-bold tracking-[0.2em] uppercase border border-black/15 px-2.5 py-1 text-[#71717a]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="px-[5%] py-10 md:py-[40px]">
            <p
              className="leading-[1.05] tracking-[0.02em] text-[#18181b] border-l-[3px] border-red-500 pl-5"
              style={{ fontFamily: BEBES, fontSize: 'clamp(32px, 4vw, 56px)' }}
            >
              &ldquo;NO ES SOLO MÚSICA. ES EL DIRECTOR MUSICAL DE TU EVENTO.&rdquo;
            </p>
            <p className="mt-4 text-[8px] font-bold tracking-[0.3em] uppercase text-[#a1a1aa] pl-[23px]">
              — Facuu Juarez
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIOS — #04  ·  Cita cinematográfica
      ══════════════════════════════════════════ */}
      <section className="bg-[#111111] overflow-hidden pt-[72px] px-[5%] relative">
        {/* Decorative quote mark — absolute, behind content */}
        <div
          aria-hidden
          className="absolute top-[5%] left-[3%] leading-[0.8] tracking-[-0.02em] text-[rgba(239,68,68,0.055)] select-none pointer-events-none z-0"
          style={{ fontFamily: BEBES, fontSize: '28vw' }}
        >
          &ldquo;
        </div>

        {/* Label */}
        <div className="flex items-center gap-2.5 mb-14 relative z-[1]">
          <div className="w-0.5 h-[18px] bg-red-500" />
          <span
            className="tracking-[0.3em] uppercase text-white/25"
            style={{ fontFamily: BEBES, fontSize: 11 }}
          >
            04 / TESTIMONIOS
          </span>
        </div>

        {/* Main featured quote */}
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

        {/* Secondary quotes grid */}
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
              className={`py-9${
                idx === 0
                  ? ' border-b border-white/[0.07] pb-8 md:border-b-0 md:border-r md:pr-10 md:pb-9'
                  : ' pt-8 md:pt-9 md:pl-10'
              }`}
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
          CONTACTO — #05  ·  Concert ticket
      ══════════════════════════════════════════ */}
      <section className="bg-[#0a0a0a] overflow-hidden relative">
        {/* Watermark RESERVAR */}
        <div
          aria-hidden
          className="absolute right-[-2%] bottom-[8%] leading-none tracking-[-0.02em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.022)] select-none pointer-events-none whitespace-nowrap z-0"
          style={{ fontFamily: BEBES, fontSize: '28vw' }}
        >
          RESERVAR
        </div>

        {/* Main ticket body */}
        <div className="px-[5%] pt-20 pb-16 relative z-[1]">
          {/* Tag row */}
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
              05 / CONTACTO
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

        {/* Perforated separator line */}
        <div className="mx-[5%] relative z-[1]">
          <div
            className="h-px"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 8px, transparent 8px, transparent 16px)',
            }}
          />
        </div>

        {/* Ticket stub footer */}
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
