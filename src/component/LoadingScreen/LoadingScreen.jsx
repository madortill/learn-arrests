import React from 'react';
import './LoadingScreen.css';

const STAGE_TITLES = {
  initial: 'טוענים את הלומדה...',
  'transition-1': 'יוצאים לדרך אל המעצר...',
  'transition-2': 'ממשיכים לדרך לבסיס הכליאה...',
};

export default function LoadingScreen({ stage = 'initial', progress = 0 }) {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const isInitial = stage === 'initial';
  const titleText = STAGE_TITLES[stage] || STAGE_TITLES['transition-1'];

  return (
    <div
      className={`loading-screen is-${stage}`}
      role="status"
      aria-live="polite"
      aria-busy={safeProgress < 100}
    >
      {/* שכבת עומק ואור ברקע */}
      <div className="loading-ambient-glow" aria-hidden="true" />

      <div className="loading-content-wrapper">
        {isInitial ? (
          /* =========================================
             טעינה ראשונית — יהלום משודרג בהשראת BookendScreen
          ========================================= */
          <div className="initial-loader">
            <div className="loading-diamond-stage">
              <div className="loading-line loading-line-right" />

              <div className="loading-diamond-box">
                <div className="diamond-halo" />
                <div className="diamond-ring" />

                <svg
                  className="loading-diamond-svg"
                  viewBox="0 0 160 120"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="ldCrownLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#9ec0de" stopOpacity="0.22" />
                    </linearGradient>

                    <linearGradient id="ldCrownCenter" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" stopColor="#fffbe0" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#dce8f3" stopOpacity="0.25" />
                    </linearGradient>

                    <linearGradient id="ldCrownRight" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#dce8f3" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#5d82a6" stopOpacity="0.28" />
                    </linearGradient>

                    <linearGradient id="ldPavilionLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#88a4be" stopOpacity="0.32" />
                      <stop offset="100%" stopColor="#264366" stopOpacity="0.5" />
                    </linearGradient>

                    <linearGradient id="ldPavilionRight" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#b9cde0" stopOpacity="0.38" />
                      <stop offset="100%" stopColor="#1b324f" stopOpacity="0.58" />
                    </linearGradient>

                    <linearGradient id="ldStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fffbe0" />
                      <stop offset="50%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#9ec0de" />
                    </linearGradient>
                  </defs>

                  {/* פאות קריסטל מוארות */}
                  <g className="ld-diamond-fills">
                    <polygon
                      className="ld-fill-facet ld-f1"
                      points="80,5 55,42 15,42"
                      fill="url(#ldCrownLeft)"
                    />
                    <polygon
                      className="ld-fill-facet ld-f2"
                      points="80,5 105,42 55,42"
                      fill="url(#ldCrownCenter)"
                    />
                    <polygon
                      className="ld-fill-facet ld-f3"
                      points="80,5 145,42 105,42"
                      fill="url(#ldCrownRight)"
                    />
                    <polygon
                      className="ld-fill-facet ld-f4"
                      points="15,42 55,42 80,65"
                      fill="url(#ldCrownCenter)"
                    />
                    <polygon
                      className="ld-fill-facet ld-f5"
                      points="55,42 105,42 80,65"
                      fill="url(#ldCrownLeft)"
                    />
                    <polygon
                      className="ld-fill-facet ld-f6"
                      points="105,42 145,42 80,65"
                      fill="url(#ldCrownRight)"
                    />
                    <polygon
                      className="ld-fill-facet ld-f7"
                      points="15,42 80,65 80,115"
                      fill="url(#ldPavilionLeft)"
                    />
                    <polygon
                      className="ld-fill-facet ld-f8"
                      points="145,42 80,115 80,65"
                      fill="url(#ldPavilionRight)"
                    />
                  </g>

                  {/* קווי המתאר והחלוקה הפנימית (בהשראת BookendScreen) */}
                  <g className="ld-diamond-lines">
                    <path
                      className="ld-diamond-outline"
                      d="M80 5 L145 42 L80 115 L15 42 Z"
                      stroke="url(#ldStrokeGrad)"
                    />
                    <path
                      className="ld-diamond-facet"
                      d="M15 42 L55 42 L80 5 L105 42 L145 42"
                    />
                    <path
                      className="ld-diamond-facet"
                      d="M15 42 L80 65 L145 42"
                    />
                    <path
                      className="ld-diamond-facet"
                      d="M55 42 L80 115 L80 65"
                    />
                    <path
                      className="ld-diamond-facet"
                      d="M105 42 L80 115"
                    />
                    <path
                      className="ld-diamond-center"
                      d="M80 5 L80 115"
                    />
                  </g>

                  {/* נצנוצי אור בקודקודים */}
                  <g className="ld-sparkles">
                    <path
                      className="ld-sparkle ld-sparkle-1"
                      d="M80 -3 L82.2 3 L88 5 L82.2 7 L80 13 L77.8 7 L72 5 L77.8 3 Z"
                    />
                    <path
                      className="ld-sparkle ld-sparkle-2"
                      d="M145 35 L146.8 40.2 L152 42 L146.8 43.8 L145 49 L143.2 43.8 L138 42 L143.2 40.2 Z"
                    />
                    <path
                      className="ld-sparkle ld-sparkle-3"
                      d="M34 26 L35.4 30.2 L39.5 31.5 L35.4 32.8 L34 37 L32.6 32.8 L28.5 31.5 L32.6 30.2 Z"
                    />
                  </g>
                </svg>
              </div>

              <div className="loading-line loading-line-left" />
            </div>
          </div>
        ) : (
          /* =========================================
             שני שלבי המעבר — סצנת נסיעה מפורטת
          ========================================= */
          <div className="transition-loader">
            <div className="road-scene">
              {/* רקע שמיים ואופק */}
              <div className="scene-sky">
                <div className="scene-horizon-glow" />
                <div className="scene-hills" />
                <div className="scene-poles">
                  <span className="road-pole pole-1" />
                  <span className="road-pole pole-2" />
                  <span className="road-pole pole-3" />
                  <span className="road-pole pole-4" />
                </div>
              </div>

              {/* מעקה בטיחות וכביש פרספקטיבי */}
              <div className="scene-guardrail" />
              <div className="scene-road">
                <div className="road-edge-top" />
                <div className="road-lane-dashes" />
                <div className="road-edge-bottom" />
              </div>

              {/* קווי רוח ומהירות */}
              <div className="speed-streaks" aria-hidden="true">
                <span className="speed-streak s1" />
                <span className="speed-streak s2" />
                <span className="speed-streak s3" />
              </div>

              {/* צל הרכב על הכביש */}
              <div className="vehicle-ground-shadow" aria-hidden="true" />

              {/* רכב ליווי מפורט (SVG) */}
              <div className="loading-vehicle">
                <svg
                  className="vehicle-svg"
                  viewBox="0 0 460 190"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    {/* אלומת פנס קדמית (הרכב נוסע ימינה) */}
                    <linearGradient id="headlightCone" x1="0%" y1="50%" x2="100%" y2="50%">
                      <stop offset="0%" stopColor="#fffbe0" stopOpacity="0.65" />
                      <stop offset="55%" stopColor="#fffbe0" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#fffbe0" stopOpacity="0" />
                    </linearGradient>

                    {/* צבע מרכב הרכב */}
                    <linearGradient id="vanBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f8fafc" />
                      <stop offset="48%" stopColor="#e2e8f0" />
                      <stop offset="85%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>

                    {/* גג וחלק עליון */}
                    <linearGradient id="vanRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#dce4ee" />
                    </linearGradient>

                    {/* חלונות כהים */}
                    <linearGradient id="windowGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e3a5f" />
                      <stop offset="55%" stopColor="#0f233c" />
                      <stop offset="100%" stopColor="#091526" />
                    </linearGradient>

                    {/* פס סימון משטרה צבאית */}
                    <linearGradient id="mpStripeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1d4ed8" />
                      <stop offset="50%" stopColor="#d10917" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>

                  {/* אלומת פנס קדמי */}
                  <polygon
                    className="vehicle-headlight-beam"
                    points="366,108 460,86 460,154 366,126"
                    fill="url(#headlightCone)"
                  />

                  {/* הילות צ'קלקה על הגג */}
                  <circle
                    className="siren-halo siren-halo-blue"
                    cx="236"
                    cy="34"
                    r="26"
                  />
                  <circle
                    className="siren-halo siren-halo-red"
                    cx="256"
                    cy="34"
                    r="26"
                  />

                  {/* גוף הרכב הראשי */}
                  <g className="vehicle-chassis">
                    {/* בסיס צ'קלקה על הגג */}
                    <rect
                      x="224"
                      y="33"
                      width="44"
                      height="9"
                      rx="4"
                      fill="#1e293b"
                    />
                    <rect
                      className="siren-lens-blue"
                      x="226"
                      y="30"
                      width="19"
                      height="8"
                      rx="3.5"
                    />
                    <rect
                      className="siren-lens-red"
                      x="247"
                      y="30"
                      width="19"
                      height="8"
                      rx="3.5"
                    />

                    {/* מעטפת המרכב (מיניוואן ליווי מודרני הפונה ימינה) */}
                    <path
                      d="M42 134
                         L36 134
                         C31 134 28 130 28 124
                         L30 74
                         C31 54 42 42 64 42
                         L268 42
                         C288 42 304 49 318 66
                         L342 86
                         C358 91 368 100 370 114
                         L371 128
                         C371 133 367 136 361 136
                         L344 136
                         C344 114 326 98 305 98
                         C284 98 266 114 266 136
                         L134 136
                         C134 114 116 98 95 98
                         C74 98 56 114 56 136
                         Z"
                      fill="url(#vanBodyGrad)"
                      stroke="#1e293b"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />

                    {/* הדגשת גג עליונה */}
                    <path
                      d="M64 44 L266 44 C284 44 299 50 312 65 L44 65 C47 51 54 44 64 44 Z"
                      fill="url(#vanRoofGrad)"
                      opacity="0.85"
                    />

                    {/* חלון אחורי (תא עצורים עם רשת פנימית עדינה) */}
                    <rect
                      x="46"
                      y="54"
                      width="78"
                      height="34"
                      rx="7"
                      fill="url(#windowGlassGrad)"
                      stroke="#25364a"
                      strokeWidth="2"
                    />
                    <path
                      d="M58 55 V87 M72 55 V87 M86 55 V87 M100 55 V87 M114 55 V87
                         M47 65 H123 M47 76 H123"
                      stroke="#64748b"
                      strokeWidth="1.2"
                      opacity="0.45"
                    />

                    {/* חלון צד אמצעי */}
                    <rect
                      x="134"
                      y="54"
                      width="94"
                      height="34"
                      rx="7"
                      fill="url(#windowGlassGrad)"
                      stroke="#25364a"
                      strokeWidth="2"
                    />
                    {/* השתקפות זכוכית */}
                    <polygon
                      points="146,56 164,56 152,86 138,86"
                      fill="#ffffff"
                      opacity="0.16"
                    />

                    {/* חלון נהג / קדמי */}
                    <path
                      d="M238 54
                         L272 54
                         C285 54 295 59 304 70
                         L316 85
                         C318 87 316 88 313 88
                         L238 88 Z"
                      fill="url(#windowGlassGrad)"
                      stroke="#25364a"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="250,56 268,56 256,86 242,86"
                      fill="#ffffff"
                      opacity="0.2"
                    />

                    {/* מראת צד */}
                    <rect
                      x="294"
                      y="78"
                      width="14"
                      height="11"
                      rx="4"
                      fill="#1e293b"
                    />

                    {/* פס סימון משטרה צבאית לאורך הצד */}
                    <rect
                      x="34"
                      y="98"
                      width="326"
                      height="7"
                      rx="2"
                      fill="url(#mpStripeGrad)"
                    />
                    <rect
                      x="34"
                      y="105"
                      width="326"
                      height="2.5"
                      fill="#fffbe0"
                      opacity="0.9"
                    />

                    {/* ידיות דלתות וקווי הפרדה */}
                    <line
                      x1="233"
                      y1="52"
                      x2="233"
                      y2="132"
                      stroke="#64748b"
                      strokeWidth="1.6"
                      opacity="0.65"
                    />
                    <line
                      x1="129"
                      y1="52"
                      x2="129"
                      y2="132"
                      stroke="#64748b"
                      strokeWidth="1.6"
                      opacity="0.65"
                    />
                    <rect x="242" y="92" width="13" height="4" rx="2" fill="#334155" />
                    <rect x="142" y="92" width="13" height="4" rx="2" fill="#334155" />

                    {/* פגוש תחתון קדמי ואחורי */}
                    <rect x="25" y="124" width="24" height="12" rx="4" fill="#1e293b" />
                    <rect x="348" y="124" width="26" height="12" rx="4" fill="#1e293b" />

                    {/* פנס קדמי */}
                    <path
                      d="M354 105 L368 109 L369 120 L352 118 Z"
                      fill="#fffbe0"
                      stroke="#d8b589"
                      strokeWidth="1.5"
                    />

                    {/* פנס אחורי אדום */}
                    <rect
                      x="28"
                      y="94"
                      width="6"
                      height="22"
                      rx="2.5"
                      fill="#ef4444"
                    />
                  </g>

                  {/* גלגל אחורי */}
                  <g className="vehicle-wheel-group wheel-rear">
                    <circle cx="95" cy="136" r="28" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
                    <circle cx="95" cy="136" r="18" fill="#475569" />
                    <circle cx="95" cy="136" r="14" fill="#cbd5e1" />
                    <g className="wheel-spokes">
                      <line x1="95" y1="122" x2="95" y2="150" stroke="#1e293b" strokeWidth="3" />
                      <line x1="81" y1="136" x2="109" y2="136" stroke="#1e293b" strokeWidth="3" />
                      <line x1="85" y1="126" x2="105" y2="146" stroke="#1e293b" strokeWidth="2.5" />
                      <line x1="105" y1="126" x2="85" y2="146" stroke="#1e293b" strokeWidth="2.5" />
                    </g>
                    <circle cx="95" cy="136" r="5" fill="#1e293b" />
                  </g>

                  {/* גלגל קדמי */}
                  <g className="vehicle-wheel-group wheel-front">
                    <circle cx="305" cy="136" r="28" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
                    <circle cx="305" cy="136" r="18" fill="#475569" />
                    <circle cx="305" cy="136" r="14" fill="#cbd5e1" />
                    <g className="wheel-spokes">
                      <line x1="305" y1="122" x2="305" y2="150" stroke="#1e293b" strokeWidth="3" />
                      <line x1="291" y1="136" x2="319" y2="136" stroke="#1e293b" strokeWidth="3" />
                      <line x1="295" y1="126" x2="315" y2="146" stroke="#1e293b" strokeWidth="2.5" />
                      <line x1="315" y1="126" x2="295" y2="146" stroke="#1e293b" strokeWidth="2.5" />
                    </g>
                    <circle cx="305" cy="136" r="5" fill="#1e293b" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* כותרת בעיצוב זהה לכותרת של BookendScreen */}
        <h2 className="loading-main-title">{titleText}</h2>

        {/* מד התקדמות תואם לעיצוב הלומדה */}
        <div className="loading-progress-area">
          <div
            className="loading-progress-track"
            role="progressbar"
            aria-valuenow={safeProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="loading-progress-fill"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
          <span className="loading-progress-percent">{safeProgress}%</span>
        </div>
      </div>
    </div>
  );
}