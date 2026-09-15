"""Five-chapter review structure; chapters 3–5 contain provisional copy."""
import re

CHAPTERS=['Posture','Breath','Mantra','Visualization','Integration']

def apply_chapters(template):
    start=template.index("      { eyebrow: 'The Spine'")
    end=template.index('\n    ];',start)
    template=template[:start]+'''      { title: 'SO HUM', accent: '#bcd0ff', bg: 'stars', graphic: 'mantra', still: true, body: 'Upon inhalation imagine the sound your breath makes is "SO" like a slow wind and the exhalation is "HUM" like a prolonged OM.' },
      { title: 'SO', accent: '#ff72b0', bg: 'stars', graphic: 'mantra-so', still: true, body: 'The "SO" quiet intonation continues until the end of the inhalation.' },
      { title: 'HUM', accent: '#9293ff', bg: 'stars', graphic: 'mantra-hum', still: true, body: 'As the exhalation continues quietly maintain the "HUM" sound ending with a low hum as lungs empty.' },
      { title: 'Envision your spine', accent: '#bcd0ff', bg: 'stars', graphic: 'column', body: 'Visualize a hollow luminous column roughly in the center of your back. With every in-breath and out-breath it becomes more awake and energized.' },
      { title: 'Ground, mountain, sky', accent: '#ffd27a', bg: 'finale', body: 'Imagine your body in an empty expanse, spanning the ground, the mountain and the sky.' },
      { title: 'Rest in the expanse', accent: '#ffd27a', bg: 'finale', body: 'Let the horizon pass through the navel and the mountain peak meet the third eye. Allow the sky to open above you.' },
      { title: 'Bring the four together', accent: '#57e0d6', bg: 'finale', body: 'Find the seat. Follow the wave breath. Continue the SO-HUM rhythm in your mind. Hold the visualization. Let these four aspects support one practice.' },
      { title: 'Build familiarity', accent: '#57e0d6', bg: 'finale', scene: 'aligned-breath', body: 'Practice with the 4 anchors: Posture, Breath, Mantra and Visualization. Merging in and out of emptiness' },
      { title: 'Let it become natural', accent: '#57e0d6', bg: 'finale', body: 'As the practice becomes familiar, soften the deliberate guidance. Let the rhythm become automatic, returning to an anchor whenever you need it.' }'''+template[end:]
    template=template.replace("      { eyebrow: 'The Breath'", "      { title: 'The empty vessel', accent: '#bcd0ff', bg: 'stars', graphic: 'vessel', still: true, body: 'Feel the outline of the body as an open vessel. Notice the space within, while the breath continues easily.' },\n" + "      { eyebrow: 'The Breath'", 1)
    template=template.replace("eyebrow: s.eyebrow, title: s.title, body: s.body,", "eyebrow: this.state.stage === 0 ? s.eyebrow : 'Chapter ' + this.chapterFor(this.state.stage) + ' · ' + this.chapterNames[this.chapterFor(this.state.stage)-1], title: s.title, body: s.body,")
    template=template.replace('  componentDidMount() {', '''  chapterNames = ['Posture','Breath','Mantra','Visualization','Integration'];
  chapterFor(i) { return i === 0 ? 0 : i < 8 ? 1 : i < 11 ? 2 : i < 14 ? 3 : i < 17 ? 4 : 5; }

  componentDidMount() {''')
    template=template.replace("    const s = this.state.stage, S = this.STAGES[s];", "    const s = this.state.stage, S = this.STAGES[s];\n    const chapterSelect = this.root.querySelector('[data-chapter-select]');\n    if (chapterSelect) chapterSelect.value = String(this.chapterFor(s));\n    if (S.still) this.root.querySelectorAll('[data-vfig]').forEach(f => f.style.opacity = +f.dataset.vfig === 0 ? 1 : 0);")
    template=template.replace('      if (!figs) return;', '      if (!figs || this.STAGES[this.state.stage].still) return;')
    template=template.replace("if (hint) hint.style.opacity = s === 0 ? 1 : 0;", "if (hint) hint.style.display = s === 0 ? 'block' : 'none';")
    template=template.replace("    this._onKey = (e) => {", "    this._onKey = (e) => {\n      if (['SELECT','INPUT','BUTTON'].includes(e.target.tagName)) return;")
    template=template.replace("      onStageClick: () => this.go(this.state.stage + 1),", "      onStageClick: (e) => { if (!e.target.closest('[data-chapter-select]')) this.go(this.state.stage + 1); },\n      onChapter: (e) => { e.stopPropagation(); this.go([0,1,8,11,14,17][+e.target.value]); },")
    options='<option value="0">Overview</option>'+''.join(f'<option value="{i}">{i} · {name}</option>' for i,name in enumerate(CHAPTERS,1))
    nav='<select data-chapter-select="" aria-label="Chapter" onchange="{{ onChapter }}" style="position:absolute;top:16px;left:16px;z-index:25;max-width:calc(100% - 84px);padding:10px 12px;border:1px solid #ffffff40;border-radius:10px;background:#101321;color:#eef4ff;font:14px system-ui;cursor:pointer;">'+options+'</select>'
    template=template.replace('  <!-- fullscreen toggle -->',nav+'\n  <!-- fullscreen toggle -->')
    template=template.replace('hint-placeholder-count="13"','hint-placeholder-count="20"')
    return template






