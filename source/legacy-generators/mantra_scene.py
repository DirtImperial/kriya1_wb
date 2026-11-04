"""Composite the supplied arrow over the registered empty body without altering source art."""

def apply_mantra_scene(template):

    scene='''<style>

      [data-layer="mantra-so"] text,[data-layer="mantra-hum"] text { transform-origin:512px 536px; }

      [data-layer="mantra-so"].mantra-active { animation:mantra-inhale 12s linear infinite; }

      [data-layer="mantra-hum"].mantra-active { animation:mantra-exhale 12s linear infinite; }

      [data-layer="mantra-so"].mantra-active text { animation:mantra-so-grow 12s ease-in-out infinite; }

      [data-layer="mantra-hum"].mantra-active text { animation:mantra-hum-shrink 12s ease-in-out infinite; }

      @keyframes mantra-inhale { 0%,49.99% {opacity:1;} 50%,100% {opacity:0;} }

      @keyframes mantra-exhale { 0%,49.99% {opacity:0;} 50%,100% {opacity:1;} }

      @keyframes mantra-so-grow { 0% {transform:scale(.35);} 50%,100% {transform:scale(2.7);} }

      @keyframes mantra-hum-shrink { 0%,50% {transform:scale(1.8);} 100% {transform:scale(.65);} }

      @media (prefers-reduced-motion:reduce) {

        [data-layer="mantra-so"].mantra-active text { animation:none; transform:scale(1); }

        [data-layer="mantra-hum"].mantra-active text { animation:none; transform:scale(1); }

      }

    </style><div data-layer="mantra" style="position:absolute;inset:0;opacity:0;transition:opacity 1s ease;pointer-events:none;">

    <svg viewBox="0 0 1024 1024" width="100%" height="100%" role="img" aria-label="Empty body with an upward pink arrow labeled SO and downward blue arrow labeled HUM">

      <image href="assets/figures/breath-0.png?v=4" width="1024" height="1024"/>

      <svg x="476" y="196" width="72" height="656" viewBox="0 44 98 468" preserveAspectRatio="none" style="mix-blend-mode:screen"><image href="assets/mantra-arrow-original.png" width="98" height="512"/></svg>

      <text x="512" y="173" text-anchor="middle" fill="#ff72b0" font-family="monospace" font-weight="bold" font-size="38">SO</text>

      <text x="512" y="888" text-anchor="middle" fill="#9293ff" font-family="monospace" font-weight="bold" font-size="38">HUM</text>

    </svg></div>'''

    scene+='''<div data-layer="mantra-so" style="position:absolute;inset:0;opacity:0;transition:opacity 1s ease;pointer-events:none;">

    <svg viewBox="0 0 1024 1024" width="100%" height="100%" role="img" aria-label="Full cloud body with SO centered over the torso">

      <image href="assets/figures/breath-3.png?v=4" width="1024" height="1024"/>

      <text x="512" y="536" text-anchor="middle" dominant-baseline="middle" fill="#fff3fb" stroke="#18234e" stroke-width="7" paint-order="stroke" font-family="monospace" font-weight="bold" font-size="72">SO</text>

    </svg></div>'''

    scene+='''<div data-layer="mantra-hum" style="position:absolute;inset:0;opacity:0;transition:opacity 1s ease;pointer-events:none;">

    <svg viewBox="0 0 1024 1024" width="100%" height="100%" role="img" aria-label="Empty body with HUM centered over the torso">

      <image href="assets/figures/breath-0.png?v=4" width="1024" height="1024"/>

      <text x="512" y="536" text-anchor="middle" dominant-baseline="middle" fill="#fff3fb" stroke="#18234e" stroke-width="7" paint-order="stroke" font-family="monospace" font-weight="bold" font-size="72">HUM</text>

    </svg></div>'''

    # All four body frames and both words share the same 12-second CSS clock.
    import re
    intro, cycle = scene.split('<div data-layer="mantra-so"', 1)
    cycle = re.sub(r'<image[^>]+/>', '', cycle)
    body = '''<style>
      [data-layer="mantra-body"] image { opacity:0; }
      [data-layer="mantra-body"].mantra-active image { animation:mantra-body-0 12s linear infinite; }
      [data-layer="mantra-body"].mantra-active .breath-1 { animation-name:mantra-body-1; }
      [data-layer="mantra-body"].mantra-active .breath-2 { animation-name:mantra-body-2; }
      [data-layer="mantra-body"].mantra-active .breath-3 { animation-name:mantra-body-3; }
      @keyframes mantra-body-0 {0%,100%{opacity:1;}16.6667%,83.3333%{opacity:0;}}
      @keyframes mantra-body-1 {0%,33.3333%,66.6667%,100%{opacity:0;}16.6667%,83.3333%{opacity:1;}}
      @keyframes mantra-body-2 {0%,16.6667%,50%,83.3333%,100%{opacity:0;}33.3333%,66.6667%{opacity:1;}}
      @keyframes mantra-body-3 {0%,33.3333%,66.6667%,100%{opacity:0;}50%{opacity:1;}}
    </style><div data-layer="mantra-body" style="position:absolute;inset:0;opacity:0;pointer-events:none;">
      <svg viewBox="0 0 1024 1024" width="100%" height="100%" role="img" aria-label="Body filling with SO and emptying with HUM">'''
    body += ''.join(f'<image class="breath-{i}" href="assets/figures/breath-{i}.png?v=5" width="1024" height="1024"/>' for i in range(4))
    scene = intro + body + '</svg></div><div data-layer="mantra-so"' + cycle
    template=template.replace('      <!-- seated posture frames (crossfade) -->',scene+'\n      <!-- seated posture frames (crossfade) -->')

    template=template.replace("    set('column', S.graphic === 'column' ? 1 : 0);","    set('column', S.graphic === 'column' ? 1 : 0);\n    set('mantra', S.graphic === 'mantra' ? 1 : 0);")

    template=template.replace("    set('mantra', S.graphic === 'mantra' ? 1 : 0);", "    set('mantra', S.graphic === 'mantra' ? 1 : 0);\n    set('mantra-so', S.graphic === 'mantra-cycle' ? 1 : 0);")

    template=template.replace("    set('mantra-so', S.graphic === 'mantra-cycle' ? 1 : 0);", "    set('mantra-so', S.graphic === 'mantra-cycle' ? 1 : 0);\n    set('mantra-hum', S.graphic === 'mantra-cycle' ? 1 : 0);")

    template=template.replace("    set('mantra-so', S.graphic === 'mantra-cycle' ? 1 : 0);", "    set('mantra-so', S.graphic === 'mantra-cycle' ? 1 : 0);\n    this.root.querySelector('[data-layer=\"mantra-so\"]').classList.toggle('mantra-active', S.graphic === 'mantra-cycle');")

    template=template.replace("    set('mantra-hum', S.graphic === 'mantra-cycle' ? 1 : 0);", "    set('mantra-hum', S.graphic === 'mantra-cycle' ? 1 : 0);\n    this.root.querySelector('[data-layer=\"mantra-hum\"]').classList.toggle('mantra-active', S.graphic === 'mantra-cycle');")

    template=template.replace("    set('mantra', S.graphic === 'mantra' ? 1 : 0);", "    set('mantra', S.graphic === 'mantra' ? 1 : 0);\n    set('mantra-body', S.graphic === 'mantra-cycle' ? 1 : 0);\n    this.root.querySelector('[data-layer=\"mantra-body\"]').classList.toggle('mantra-active', S.graphic === 'mantra-cycle');")
    return template

