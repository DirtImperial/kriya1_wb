"""A front-facing spiral expanding from a fixed solar-plexus origin."""
import math,re

def apply_solar_spiral(template):
    template=template.replace('Let the heart-center radiate outward.',
        'Imagine a gentle force moving outward from the solar plexus into the space around you')
    # Redraw every frame on one fixed pixel grid. Scaling a smooth SVG would
    # change pixel sizes; these square cells remain eight artwork pixels wide.
    frames=[]
    for frame in range(24):
        waves=[]
        for wave in range(3):
            phase=((frame/24)+wave/3)%1
            scale=.12+phase*1.18
            cells=set()
            for i in range(641):
                t=i/640
                angle=t*math.pi*5
                radius=(8+150*t)*scale
                cells.add((round(radius*math.cos(angle)/8)*8,
                           round(radius*math.sin(angle)/8)*8))
            path=' '.join(f'M{x-4} {y-4}h8v8h-8z' for x,y in sorted(cells))
            color=['#e6c8ff','#bd83f5','#8054b9'][min(2,int(phase*3))]
            waves.append(f'<path d="{path}" fill="{color}"/>')
        frames.append(f'<g class="solar-frame" style="animation-delay:{-(24-frame)*.2:.1f}s">'+''.join(waves)+'</g>')
    spiral=''.join(frames)
    svg=f'''<svg viewBox="0 0 1024 1024" width="100%" height="100%" role="img" aria-label="A gentle spiral expanding toward you from the solar plexus" style="overflow:visible">
      <image href="assets/figures/seat-shoulders.png?v=4" width="1024" height="1024"/>
      <g transform="translate(512 520)" shape-rendering="crispEdges">{spiral}<path d="M-4 -4h8v8h-8z" fill="#f1deff"/></g>
    </svg>'''
    template=re.sub(r'<img data-seat="5"[^>]+>',
        '<div data-seat="5" style="position:absolute;inset:0;opacity:0;transition:opacity .9s ease;">'+svg+'</div>',template)
    crown='''<svg viewBox="0 0 1024 1024" width="100%" height="100%" role="img" aria-label="A soft glow gently pulsing from the crown">
      <defs><radialGradient id="crown-soft-light"><stop offset="0" stop-color="#decaff" stop-opacity=".65"/><stop offset=".35" stop-color="#ad8cf0" stop-opacity=".28"/><stop offset="1" stop-color="#9274dc" stop-opacity="0"/></radialGradient><linearGradient id="crown-ray" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#d9c5ff" stop-opacity=".7"/><stop offset="1" stop-color="#ae95f7" stop-opacity="0"/></linearGradient></defs>
      <image href="assets/figures/seat-shoulders.png?v=4" width="1024" height="1024"/>
      <g class="crown-rays" fill="none" stroke="url(#crown-ray)" stroke-width="4" stroke-linecap="round"><path d="M492 190 Q477 130 454 75 M502 183 Q495 110 487 45 M512 180 V32 M522 183 Q529 110 537 45 M532 190 Q547 130 570 75"/></g><g transform="translate(512 200)"><ellipse class="crown-soft-pulse" cy="-12" rx="90" ry="65" fill="url(#crown-soft-light)"/></g>
    </svg>'''
    template=re.sub(r'<img data-seat="6"[^>]+>',
        '<div data-seat="6" style="position:absolute;inset:0;opacity:0;transition:opacity .9s ease;">'+crown+'</div>',template)
    css='''<style>
    .crown-rays{animation:crown-ray-pulse 5s ease-in-out infinite;}
    @keyframes crown-ray-pulse{0%,100%{opacity:.4}50%{opacity:.9}}
    @media(prefers-reduced-motion:reduce){.crown-rays{animation:none;opacity:.6}}
    .crown-soft-pulse{animation:crown-soft-pulse 5s ease-in-out infinite;transform-origin:0 0}
    @keyframes crown-soft-pulse{0%,100%{opacity:.35;transform:scale(.75)}50%{opacity:.8;transform:scale(1.15)}}
    @media(prefers-reduced-motion:reduce){.crown-soft-pulse{animation:none;opacity:.5}}
    .solar-frame{opacity:0;animation:solar-pixel-frame 4.8s steps(1,end) infinite}
    @keyframes solar-pixel-frame{0%{opacity:1}4.166667%,100%{opacity:0}}
    @media(prefers-reduced-motion:reduce){.solar-frame{animation:none;opacity:0}.solar-frame:first-child{opacity:1}}
    </style>'''
    return template.replace('</head>',css+'</head>',1)
