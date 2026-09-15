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
    css='''<style>
    .solar-frame{opacity:0;animation:solar-pixel-frame 4.8s steps(1,end) infinite}
    @keyframes solar-pixel-frame{0%{opacity:1}4.166667%,100%{opacity:0}}
    @media(prefers-reduced-motion:reduce){.solar-frame{animation:none;opacity:0}.solar-frame:first-child{opacity:1}}
    </style>'''
    return template.replace('</head>',css+'</head>',1)
