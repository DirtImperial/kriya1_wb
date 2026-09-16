"""Five-chapter review structure; chapters 3–5 contain provisional copy."""

import re



CHAPTERS=['Posture','Breath','Mantra','Visualization','Integration','Cultivating Unconditional Love']



def apply_chapters(template):

    start=template.index("      { eyebrow: 'The Spine'")

    end=template.index('\n    ];',start)

    template=template[:start]+'''      { title: 'SO HUM', accent: '#bcd0ff', bg: 'stars', graphic: 'mantra', still: true, body: 'Upon inhalation gently intone the sound "SO" along the entire inhalation and then vocalize the sound "HA" along the exhalation ending with an "UMMM" much like an "OM".' },

      { title: 'SO HUM', accent: '#bcd0ff', bg: 'stars', graphic: 'mantra-cycle', still: true, body: 'After several rounds of quietly vocalizing the "SO HUM" rhythmic mantra then internalize the sounds in your inner mind until it becomes a steady almost involuntary inner sound.' },

      { title: 'Envision your spine', accent: '#bcd0ff', bg: 'stars', graphic: 'column', body: 'Visualize a hollow luminous column roughly in the center of your back. With every in-breath and out-breath it becomes more awake and energized.' },

      { title: 'Ground, mountain, sky', accent: '#ffd27a', bg: 'finale', body: 'Imagine your body in an empty expanse, spanning the ground, the mountain and the sky.' },

      { title: 'Rest in the expanse', accent: '#ffd27a', bg: 'finale', body: 'Let the horizon pass through the navel and the mountain peak meet the third eye. Allow the sky to open above you.' },

      { title: 'Bring the four together', accent: '#57e0d6', bg: 'finale', body: 'Find the seat. Follow the wave breath. Continue the SO-HUM rhythm in your mind. Hold the visualization. Let these four aspects support one practice.' },

      { title: 'Build familiarity', accent: '#57e0d6', bg: 'finale', scene: 'aligned-breath', body: 'Build your practice with the 4 anchors: Posture, Breath, Mantra and Visualization. If you become distracted always fall back on simple rhythmic breathing and work your way back up.' },

      { title: 'Let it become natural', accent: '#57e0d6', bg: 'finale', body: 'As the practice becomes familiar, soften the deliberate guidance. Let the rhythm become automatic, returning to an anchor whenever you need it.' },
      { title: 'Recognizing the Root Gurus', accent: '#ffdca1', bg: 'mountain', closing: true, body: 'At the conclusion of the practice, take a moment to thank and recognize all the beings in your life who have brought you to this moment: parents, friends, and teachers. Offer special gratitude to Mahavatar Babaji and his Kriya transmissions.' }'''+template[end:]

    template=template.replace("      { eyebrow: 'The Breath'", "      { title: 'The empty vessel', accent: '#bcd0ff', bg: 'stars', graphic: 'vessel', still: true, body: 'Feel the outline of the body as an open vessel. Notice the space within, while the breath continues easily.' },\n" + "      { eyebrow: 'The Breath'", 1)

    template=template.replace("eyebrow: s.eyebrow, title: s.title, body: s.body,", "eyebrow: this.state.stage === 0 ? s.eyebrow : 'Chapter ' + this.chapterFor(this.state.stage) + ' · ' + this.chapterNames[this.chapterFor(this.state.stage)-1], title: s.title, body: s.body,")

    template=template.replace('  componentDidMount() {', '''  chapterNames = ['Posture','Breath','Mantra','Visualization','Integration','Cultivating Unconditional Love'];

  chapterFor(i) { return i === 0 ? 0 : i < 8 ? 1 : i < 11 ? 2 : i < 13 ? 3 : i < 16 ? 4 : i < 19 ? 5 : 6; }



  componentDidMount() {''')

    template=template.replace("    const s = this.state.stage, S = this.STAGES[s];", "    const s = this.state.stage, S = this.STAGES[s];\n    const chapterSelect = this.root.querySelector('[data-chapter-select]');\n    if (chapterSelect) chapterSelect.value = String(this.chapterFor(s));\n    if (S.still) this.root.querySelectorAll('[data-vfig]').forEach(f => f.style.opacity = +f.dataset.vfig === 0 ? 1 : 0);")

    template=template.replace('      if (!figs) return;', '      if (!figs || this.STAGES[this.state.stage].still) return;')

    template=template.replace("if (hint) hint.style.opacity = s === 0 ? 1 : 0;", "if (hint) hint.style.display = s === 0 ? 'block' : 'none';")

    template=template.replace("    this._onKey = (e) => {", "    this._onKey = (e) => {\n      if (['SELECT','INPUT','BUTTON'].includes(e.target.tagName)) return;")

    template=template.replace("      onStageClick: () => this.go(this.state.stage + 1),", "      onStageClick: (e) => { if (!e.target.closest('[data-chapter-select]')) this.go(this.state.stage + 1); },\n      onChapter: (e) => { e.stopPropagation(); this.go([0,1,8,11,13,16,19][+e.target.value]); },")

    options='<option value="0">Overview</option>'+''.join(f'<option value="{i}">{i} · {name}</option>' for i,name in enumerate(CHAPTERS,1))

    nav='<select data-chapter-select="" aria-label="Chapter" onchange="{{ onChapter }}" style="position:absolute;top:16px;left:16px;z-index:25;max-width:calc(100% - 84px);padding:10px 12px;border:0;border-radius:0;background:transparent;color:#eef4ff;font:16px system-ui;cursor:pointer;">'+options+'</select>'

    template=template.replace('  <!-- fullscreen toggle -->',nav+'\n  <!-- fullscreen toggle -->')

    template=template.replace('hint-placeholder-count="13"','hint-placeholder-count="20"')

    template=re.sub(r'<button[^>]*aria-label="Toggle fullscreen".*?</button>', '', template, flags=re.S)

    template=template.replace('</head>', '''<style>

[data-chapter-select]{color-scheme:dark}

[data-chapter-select]:focus-visible{outline:2px solid #8bbcff;outline-offset:3px}

@media(max-width:600px){

 [data-graphiczone]{margin-top:64px;}

 [data-chapter-select]{top:max(12px,env(safe-area-inset-top))!important;left:12px!important;padding:8px!important;}

}

</style>'''+'</head>',1)

    template=template.replace('<div data-eyebrow=""', '<div data-closing-mantra="">Om Kriya Baba Ji Namah Om</div><img data-closing-portrait="" src="assets/babaji-mountain-v1.png" alt="Mahavatar Babaji seated before the mountain"/><div data-eyebrow=""',1)
    template=template.replace("    const s = this.state.stage, S = this.STAGES[s];", "    const s = this.state.stage, S = this.STAGES[s];\n    this.root.querySelector('[data-graphiczone]').parentElement.classList.toggle('closing-page', !!S.closing);")
    template=template.replace('</head>', """<style>
[data-closing-mantra],[data-closing-portrait]{display:none;}
.closing-page{justify-content:center;background:linear-gradient(rgba(3,5,18,.38),rgba(3,5,18,.8)),url('assets/01-landscape.png') center/cover;}
.closing-page [data-graphiczone]{display:none;}
.closing-page [data-textzone]{padding:64px 24px 70px!important;gap:10px!important;text-shadow:0 2px 12px #000;}
.closing-page [data-closing-mantra]{display:block;font-size:clamp(1.65rem,3.5vw,2.8rem);font-weight:600;line-height:1.15;color:#ffe5b4;margin-bottom:0;text-wrap:balance;}
.closing-page [data-closing-portrait]{display:block;width:auto;height:clamp(160px,30vh,320px);max-width:100%;object-fit:contain;mask-image:radial-gradient(ellipse closest-side,#000 78%,transparent 100%);}
.closing-page h1{font-size:clamp(1.6rem,3vw,2.5rem)!important;}
.closing-page [data-body]{max-width:52ch!important;}
.closing-page [data-eyebrow]{letter-spacing:.2em!important;line-height:1.6;}
@media(max-width:600px){.closing-page [data-textzone]{gap:10px!important;}.closing-page [data-closing-mantra]{margin-bottom:0;}.closing-page [data-body]{font-size:1.12rem!important;}}
</style></head>""",1)
    return template













