"""Composite the supplied arrow over the registered empty body without altering source art."""
def apply_mantra_scene(template):
    scene='''<div data-layer="mantra" style="position:absolute;inset:0;opacity:0;transition:opacity 1s ease;pointer-events:none;">
    <svg viewBox="0 0 1024 1024" width="100%" height="100%" role="img" aria-label="Empty body with an upward pink arrow labeled SO and downward blue arrow labeled HUM">
      <image href="assets/figures/breath-0.png?v=4" width="1024" height="1024"/>
      <svg x="476" y="365" width="72" height="345" viewBox="0 44 98 468" preserveAspectRatio="none" style="mix-blend-mode:screen"><image href="assets/mantra-arrow-original.png" width="98" height="512"/></svg>
      <text x="512" y="344" text-anchor="middle" fill="#ff72b0" font-family="monospace" font-weight="bold" font-size="38">SO</text>
      <text x="512" y="752" text-anchor="middle" fill="#9293ff" font-family="monospace" font-weight="bold" font-size="38">HUM</text>
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
    template=template.replace('      <!-- seated posture frames (crossfade) -->',scene+'\n      <!-- seated posture frames (crossfade) -->')
    template=template.replace("    set('column', S.graphic === 'column' ? 1 : 0);","    set('column', S.graphic === 'column' ? 1 : 0);\n    set('mantra', S.graphic === 'mantra' ? 1 : 0);")
    template=template.replace("    set('mantra', S.graphic === 'mantra' ? 1 : 0);", "    set('mantra', S.graphic === 'mantra' ? 1 : 0);\n    set('mantra-so', S.graphic === 'mantra-so' ? 1 : 0);")
    template=template.replace("    set('mantra-so', S.graphic === 'mantra-so' ? 1 : 0);", "    set('mantra-so', S.graphic === 'mantra-so' ? 1 : 0);\n    set('mantra-hum', S.graphic === 'mantra-hum' ? 1 : 0);")
    return template
