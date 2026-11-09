"""Shared landscape and breathing coordinates for chapter four."""
from pathlib import Path
import numpy as np
from PIL import Image

def apply_visualization_scene(template):
    # INACTIVE: writes public/assets/visualization-landscape.png. Guard runs before the write.
    from legacy_guard import refuse_unless_allowed
    refuse_unless_allowed('visualization_scene.py')
    public=Path(__file__).resolve().parents[2]/'public'
    src=np.asarray(Image.open(public/'assets/01-landscape.png').convert('RGB'))
    scale=360/284
    tx=512-636*scale
    ty=280-606*scale
    # Keep the mountain uniformly scaled. Extend only the far outside edge
    # pixels for wide screens, rather than stretching the mountain or figure.
    xs=np.clip(np.rint((np.arange(5120)-2048-tx)/scale).astype(int),0,src.shape[1]-1)
    ys=np.clip(np.rint((np.arange(1024)-ty)/scale).astype(int),0,src.shape[0]-1)
    Image.fromarray(src[ys[:,None],xs[None,:]]).save(public/'assets/visualization-landscape.png')
    frames=''.join(f'<image data-vfig="{i}" href="assets/figures/breath-{i}.png?v=4" width="1024" height="1024" style="opacity:{1 if i==0 else 0};transition:opacity 1.4s ease"/>' for i in range(4))
    scene='''<div data-layer="visualization" style="position:absolute;inset:0;opacity:0;transition:opacity 1s ease;pointer-events:none;">
    <svg viewBox="0 0 1024 1024" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="overflow:visible" role="img" aria-label="Breathing body aligned with mountain peak at the third eye and horizon at the navel">
    <image href="assets/visualization-landscape.png" x="-2048" y="0" width="5120" height="1024"/>
    '''+frames+'</svg></div>'
    template=template.replace('      <!-- seated posture frames (crossfade) -->',scene+'\n      <!-- seated posture frames (crossfade) -->')
    template=template.replace("    set('landscape', (S.bg === 'mountain' || S.bg === 'finale') ? 1 : 0);", "    const visualization = (this.chapterFor(s) >= 4 && S.bg === 'finale') || S.scene === 'aligned-breath';\n    set('visualization', visualization ? 1 : 0);\n    set('landscape', !visualization && (S.bg === 'mountain' || S.bg === 'finale') ? 1 : 0);")
    template=template.replace("set('finale', S.bg === 'finale' ? 1 : 0);", "set('finale', !visualization && S.bg === 'finale' ? 1 : 0);")
    return template

