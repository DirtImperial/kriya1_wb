"""Pixel-grid figure eight with a single continuous direction of travel."""
import math
import re

def apply_wave_loop(template):
    def point(t):
        return 450+350*math.sin(t),250+140*math.sin(2*t)
    def pixel_path(points):
        cells={(round(x/4)*4,round(y/4)*4) for x,y in points}
        return ' '.join(f'M{x-2} {y-2}h4v4h-4z' for x,y in sorted(cells))
    points=[point(i*math.tau/720) for i in range(721)]
    ribbon='M'+' L'.join(f'{round(x/4)*4},{round(y/4)*4}' for x,y in points)
    frames=[]
    # Equal arc-length spacing prevents arrows slowing down at the crossover.
    distances=[0]
    for a,b in zip(points,points[1:]):
        distances.append(distances[-1]+math.dist(a,b))
    def at(f):
        target=(f%1)*distances[-1]
        i=next(i for i in range(1,len(distances)) if distances[i]>=target)
        u=(target-distances[i-1])/(distances[i]-distances[i-1])
        a,b=points[i-1],points[i]
        return a[0]+u*(b[0]-a[0]),a[1]+u*(b[1]-a[1])
    for frame in range(48):
        pixels=[]
        for arrow in range(2):
            # Quarter-loop spacing avoids simultaneous crossover arrivals.
            phase=frame/48+arrow/4
            for k in range(40):
                pixels.append(at(phase-k*.001))
            x,y=at(phase)
            bx,by=at(phase-.003)
            angle=math.atan2(y-by,x-bx)
            for side in [-1,1]:
                for k in range(21):
                    pixels.append((x-k*math.cos(angle)+side*k*.65*math.sin(angle),y-k*math.sin(angle)-side*k*.65*math.cos(angle)))
        frames.append(f'<path class="wave-flow-frame" style="animation-delay:{-8+frame/6:.6f}s" d="{pixel_path(pixels)}"/>')
    svg='''<svg class="wave-loop" viewBox="0 0 900 510" role="img" aria-label="Arrows flowing continuously around a figure eight: inhalation and exhalation" style="width:min(92%,680px);max-height:88%;overflow:visible">
    <defs><linearGradient id="wave-ribbon"><stop stop-color="#00aac6"/><stop offset=".42" stop-color="#40c7dc"/><stop offset=".58" stop-color="#d55799"/><stop offset="1" stop-color="#d73587"/></linearGradient></defs>'''
    svg+=f'<path d="{ribbon}" fill="none" stroke="#65cad9" stroke-width="56" stroke-linejoin="bevel"/><path d="{ribbon}" fill="none" stroke="url(#wave-ribbon)" stroke-width="48" stroke-linejoin="bevel"/>'
    svg+='<g fill="#ecfaff" shape-rendering="crispEdges">'+''.join(frames)+'</g>'
    for x,label in [(235,'75% full'),(665,'75% empty')]:
        svg+=f'<text x="{x}" y="48" text-anchor="middle" fill="#dfe7ef" font-family="monospace" font-weight="bold" font-size="24">{label}</text>'
    for x,color,lines in [(235,'#39dcea',['EXHALATION','CONTRACTION','RETREAT']),(665,'#ee65b2',['INHALATION','EXPANSION','PARTICIPATION'])]:
        for i,line in enumerate(lines):
            svg+=f'<text x="{x}" y="{225+i*36}" text-anchor="middle" fill="{color}" font-family="monospace" font-weight="bold" font-size="22">{line}</text>'
    svg+='<text x="450" y="463" text-anchor="middle" fill="#dfe7ef" font-family="monospace" font-weight="bold" font-size="22">SLOW BREATHING</text><text x="450" y="492" text-anchor="middle" fill="#dfe7ef" font-family="monospace" font-weight="bold" font-size="22">BUT NEVER HOLD</text></svg>'
    template=re.sub(r'<img[^>]*alt="wave breathing cycle"[^>]*>',lambda _:svg,template)
    css='''<style>.wave-flow-frame{opacity:0;animation:wave-flow 8s steps(1,end) infinite}@keyframes wave-flow{0%,2.08332%{opacity:1}2.08333%,100%{opacity:0}}@media(prefers-reduced-motion:reduce){.wave-flow-frame{animation:none}.wave-flow-frame:first-child{opacity:1}}</style>'''
    return template.replace('</head>',css+'</head>',1)

