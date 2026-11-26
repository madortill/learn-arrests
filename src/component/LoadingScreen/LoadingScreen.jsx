import React from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ stage = 'initial', progress = 0 }) {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const isInitial = stage === 'initial';

  return (
    <div
      className={`loading-screen is-${stage}`}
      role="status"
      aria-live="polite"
      aria-busy={safeProgress < 100}
    >
      <div className="loading-content-wrapper">
        {isInitial ? (
          /* =========================================
             טעינה ראשונית — יהלום נקי בהשראת BookendScreen
          ========================================= */
          <div className="initial-loader">
            <div className="loading-diamond-stage">
              <div className="loading-line" />

              <div className="loading-diamond-box">
                <svg
                  className="loading-diamond-svg"
                  viewBox="0 0 160 120"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="ldFacetLight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#f3ecff" stopOpacity="0.45" />
                    </linearGradient>

                    <linearGradient id="ldFacetMid" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" stopColor="#efe6ff" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#c7b0e8" stopOpacity="0.45" />
                    </linearGradient>

                    <linearGradient id="ldFacetDeep" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#b89ce0" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#8c6bb8" stopOpacity="0.65" />
                    </linearGradient>
                  </defs>

                  {/* פאות פנימיות רכות */}
                  <g className="ld-diamond-fills">
                    <polygon points="80,5 55,42 15,42" fill="url(#ldFacetLight)" />
                    <polygon points="80,5 105,42 55,42" fill="url(#ldFacetMid)" />
                    <polygon points="80,5 145,42 105,42" fill="url(#ldFacetLight)" />
                    <polygon points="15,42 55,42 80,65" fill="url(#ldFacetMid)" />
                    <polygon points="55,42 105,42 80,65" fill="url(#ldFacetLight)" />
                    <polygon points="105,42 145,42 80,65" fill="url(#ldFacetMid)" />
                    <polygon points="15,42 80,65 80,115" fill="url(#ldFacetDeep)" />
                    <polygon points="145,42 80,115 80,65" fill="url(#ldFacetMid)" />
                  </g>

                  {/* קווי מתאר והחלוקה הפנימית של היהלום */}
                  <g className="ld-diamond-lines">
                    <path
                      className="ld-diamond-outline"
                      d="M80 5 L145 42 L80 115 L15 42 Z"
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
                </svg>
              </div>

              <div className="loading-line" />
            </div>
          </div>
        ) : (
          /* =========================================
             שני שלבי המעבר — רכב ליווי בנסיעה
          ========================================= */
          <div className="transition-loader">
            <div className="road-scene">
              {/* קווי תנועה עדינים ברקע */}
              <div className="speed-streaks" aria-hidden="true">
                <span className="speed-streak s1" />
                <span className="speed-streak s2" />
              </div>

              {/* רכב ליווי מפורט (SVG) */}
              <div className="loading-vehicle">
                <svg
                  className="vehicle-svg"
                  viewBox="0 0 460 190"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="headlightCone" x1="0%" y1="50%" x2="100%" y2="50%">
                      <stop offset="0%" stopColor="#fffbe0" stopOpacity="0.7" />
                      <stop offset="60%" stopColor="#fffbe0" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#fffbe0" stopOpacity="0" />
                    </linearGradient>

                    <linearGradient id="vanBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="55%" stopColor="#eef2f6" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>

                    <linearGradient id="windowGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2b3a55" />
                      <stop offset="100%" stopColor="#162033" />
                    </linearGradient>

                    <linearGradient id="mpStripeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="50%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>

                  {/* אלומת פנס קדמי */}
                  <polygon
                    className="vehicle-headlight-beam"
                    points="366,108 456,90 456,148 366,126"
                    fill="url(#headlightCone)"
                  />

                  {/* הילות צ'קלקה */}
                  <circle className="siren-halo siren-halo-blue" cx="236" cy="34" r="22" />
                  <circle className="siren-halo siren-halo-red" cx="256" cy="34" r="22" />

                  {/* גוף הרכב */}
                  <g className="vehicle-chassis">
                    {/* צ'קלקה על הגג */}
                    <rect x="224" y="33" width="44" height="9" rx="4" fill="#27272a" />
                    <rect className="siren-lens-blue" x="226" y="30" width="19" height="8" rx="3.5" />
                    <rect className="siren-lens-red" x="247" y="30" width="19" height="8" rx="3.5" />

                    {/* מרכב */}
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
                      stroke="#2b2638"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />

                    {/* חלון אחורי */}
                    <rect
                      x="46"
                      y="54"
                      width="78"
                      height="34"
                      rx="7"
                      fill="url(#windowGlassGrad)"
                      stroke="#2b2638"
                      strokeWidth="2"
                    />
                    <path
                      d="M58 55 V87 M72 55 V87 M86 55 V87 M100 55 V87 M114 55 V87
                         M47 65 H123 M47 76 H123"
                      stroke="#94a3b8"
                      strokeWidth="1.2"
                      opacity="0.45"
                    />

                    {/* חלון אמצעי */}
                    <rect
                      x="134"
                      y="54"
                      width="94"
                      height="34"
                      rx="7"
                      fill="url(#windowGlassGrad)"
                      stroke="#2b2638"
                      strokeWidth="2"
                    />
                    <polygon
                      points="146,56 164,56 152,86 138,86"
                      fill="#ffffff"
                      opacity="0.18"
                    />

                    {/* חלון קדמי */}
                    <path
                      d="M238 54
                         L272 54
                         C285 54 295 59 304 70
                         L316 85
                         C318 87 316 88 313 88
                         L238 88 Z"
                      fill="url(#windowGlassGrad)"
                      stroke="#2b2638"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="250,56 268,56 256,86 242,86"
                      fill="#ffffff"
                      opacity="0.22"
                    />

                    {/* מראת צד */}
                    <rect x="294" y="78" width="14" height="11" rx="4" fill="#2b2638" />

                    {/* פס סימון צדדי */}
                    <rect x="34" y="98" width="326" height="7" rx="2" fill="url(#mpStripeGrad)" />

                    {/* קווי דלתות וידיות */}
                    <line x1="233" y1="52" x2="233" y2="132" stroke="#64748b" strokeWidth="1.6" opacity="0.65" />
                    <line x1="129" y1="52" x2="129" y2="132" stroke="#64748b" strokeWidth="1.6" opacity="0.65" />
                    <rect x="242" y="92" width="13" height="4" rx="2" fill="#3f3a4f" />
                    <rect x="142" y="92" width="13" height="4" rx="2" fill="#3f3a4f" />

                    {/* פגושים */}
                    <rect x="25" y="124" width="24" height="12" rx="4" fill="#2b2638" />
                    <rect x="348" y="124" width="26" height="12" rx="4" fill="#2b2638" />

                    {/* פנסים */}
                    <path d="M354 105 L368 109 L369 120 L352 118 Z" fill="#fffbe0" stroke="#d8b589" strokeWidth="1.5" />
                    <rect x="28" y="94" width="6" height="22" rx="2.5" fill="#ef4444" />
                  </g>

                  {/* גלגל אחורי */}
                  <g className="vehicle-wheel-group">
                    <circle cx="95" cy="136" r="28" fill="#1e1b29" stroke="#2b2638" strokeWidth="3" />
                    <circle cx="95" cy="136" r="17" fill="#64748b" />
                    <circle cx="95" cy="136" r="13" fill="#e2e8f0" />
                    <g className="wheel-spokes">
                      <line x1="95" y1="123" x2="95" y2="149" stroke="#2b2638" strokeWidth="3" />
                      <line x1="82" y1="136" x2="108" y2="136" stroke="#2b2638" strokeWidth="3" />
                      <line x1="86" y1="127" x2="104" y2="145" stroke="#2b2638" strokeWidth="2.5" />
                      <line x1="104" y1="127" x2="86" y2="145" stroke="#2b2638" strokeWidth="2.5" />
                    </g>
                    <circle cx="95" cy="136" r="5" fill="#2b2638" />
                  </g>

                  {/* גלגל קדמי */}
                  <g className="vehicle-wheel-group">
                    <circle cx="305" cy="136" r="28" fill="#1e1b29" stroke="#2b2638" strokeWidth="3" />
                    <circle cx="305" cy="136" r="17" fill="#64748b" />
                    <circle cx="305" cy="136" r="13" fill="#e2e8f0" />
                    <g className="wheel-spokes">
                      <line x1="305" y1="123" x2="305" y2="149" stroke="#2b2638" strokeWidth="3" />
                      <line x1="292" y1="136" x2="318" y2="136" stroke="#2b2638" strokeWidth="3" />
                      <line x1="296" y1="127" x2="314" y2="145" stroke="#2b2638" strokeWidth="2.5" />
                      <line x1="314" y1="127" x2="296" y2="145" stroke="#2b2638" strokeWidth="2.5" />
                    </g>
                    <circle cx="305" cy="136" r="5" fill="#2b2638" />
                  </g>
                </svg>
              </div>

              {/* כביש פשוט ונקי */}
              <div className="scene-road">
                <div className="road-lane-dashes" />
              </div>
            </div>
          </div>
        )}

        {/* מספר אחוזים בלבד */}
        <span className="loading-percent">{safeProgress}%</span>
      </div>
    </div>
  );
}