"""Reproducible alpha extraction and landmark registration; never edits source art."""
from pathlib import Path
from collections import deque
import json, re, base64, gzip
import numpy as np
from chapter_structure import apply_chapters
from solar_spiral import apply_solar_spiral
from wave_loop import apply_wave_loop
from mantra_scene import apply_mantra_scene
from visualization_scene import apply_visualization_scene
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / 'public'
OUT = PUBLIC / 'assets' / 'figures'
OUT.mkdir(parents=True, exist_ok=True)
SHEET = Image.open(PUBLIC / 'uploads' / 'seating seqeunce.png').convert('RGB')

# Original-sheet pixel coordinates: crop, anatomical crown y, pelvis x/y,
# and exterior gaps between arm and torso. The halo is not a scale landmark.
SEATS = {
 'seat-hands': ((35,120,355,465),140,(195,395),[(112,345),(280,345)]),
 'seat-shoulders': ((425,120,745,465),140,(584,395),[(503,345),(665,345)]),
 'seat-chin': ((840,115,1100,465),131,(918,397),[]),
 'seat-spine': ((1205,120,1455,465),139,(1285,397),[]),
 'seat-cushions': ((60,585,350,940),600,(180,848),[]),
 'seat-heart': ((435,595,740,945),615,(585,874),[(500,816),(669,816)]),
 'seat-crown': ((815,578,1120,948),638,(968,874),[(880,815),(1050,815)]),
 'seat-column': ((1200,578,1480,948),608,(1338,874),[(1250,817),(1420,817)]),
}

def reachable(mask, seeds):
    h,w=mask.shape
    seen=np.zeros_like(mask)
    q=deque()
    for x,y in seeds:
        if 0<=x<w and 0<=y<h and mask[y,x] and not seen[y,x]:
            seen[y,x]=True; q.append((x,y))
    while q:
        x,y=q.popleft()
        for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            if 0<=xx<w and 0<=yy<h and mask[yy,xx] and not seen[yy,xx]:
                seen[yy,xx]=True; q.append((xx,yy))
    return seen

def extract(im, gaps=(), protected=()):
    rgb=np.pad(np.asarray(im.convert('RGB')).astype(np.float32),((32,32),(32,32),(0,0)))
    gaps=[(x+32,y+32) for x,y in gaps]
    peak=rgb.max(axis=2)
    bright=Image.fromarray(np.uint8(peak>=36)*255)
    # Close gaps in the luminous contour, then retain the dark body.
    contour=np.asarray(bright.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.MinFilter(21)))>0
    contour[[0,-1],:]=False; contour[:,[0,-1]]=False
    h,w=contour.shape
    seeds=[(x,0) for x in range(w)]+[(x,h-1) for x in range(w)]+[(0,y) for y in range(h)]+[(w-1,y) for y in range(h)]+list(gaps)
    solid=~reachable(~contour,seeds)
    if protected:
        support=Image.new('L',(w,h))
        ImageDraw.Draw(support).polygon([(x+32,y+32) for x,y in protected],fill=255)
        solid |= np.asarray(support)>0
    core=np.asarray(Image.fromarray(np.uint8(solid)*255).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2)))/255
    alpha=np.clip((peak-3)/252,0,1)
    alpha=np.maximum(alpha,core)
    # Unpremultiply the glow from its original black matte, preserving its
    # contribution on a dark backdrop while making it work on any backdrop.
    color=np.minimum(255,rgb/np.maximum(alpha[:,:,None],1/255))
    color[alpha==0]=0
    return Image.fromarray(np.dstack([color,np.rint(alpha*255)]).astype(np.uint8),'RGBA').crop((32,32,w-32,h-32))

def register(im, crown, pelvis):
    px,py=pelvis
    scale=540/(py-crown)
    # A common 1024 canvas, crown y=200, pelvis=(512,740), uniform scaling.
    tx=512-px*scale; ty=740-py*scale
    result=im.transform((1024,1024),Image.Transform.AFFINE,
        (1/scale,0,-tx/scale,0,1/scale,-ty/scale),
        resample=Image.Resampling.NEAREST)
    return result, {'crown_y':crown,'pelvis':[px,py],'scale':scale,
                    'translate':[tx,ty],'target_pelvis':[512,740],
                    'target_crown_y':200}

metadata={}
# Front-facing art uses a shared anatomical scaffold, rather than only two
# endpoints. Gentle piecewise scaling compensates for source drawing drift.
# Sheet coordinates: center x, crown/brow/chin/shoulder/navel/pelvis/base,
# half-widths at head, shoulders and folded legs. Profile poses stay separate.
FRONT={
 'seat-hands':(195.5,[140,180,220,250,345,395,445],[31,70,135]),
 'seat-shoulders':(583,[140,180,220,250,345,395,445],[31,70,137]),
 'seat-heart':(585,[615,655,696,727,824,878,927],[31,70,133]),
 'seat-crown':(967,[638,678,714,745,831,881,928],[31,70,135]),
 'seat-column':(1338,[608,648,690,720,820,877,926],[29,73,138]),
}

def register_front(im, center, ys, widths):
    target_y=np.array([200,280,365,430,640,740,846],dtype=float)
    # Extrapolate beyond the body to retain halos, arrows and floor glow.
    source_y=np.array(ys,dtype=float)
    dest=np.arange(1024,dtype=float)
    sy=np.interp(dest,target_y,source_y)
    sy[dest<200]=source_y[0]+(dest[dest<200]-200)*(source_y[1]-source_y[0])/80
    sy[dest>846]=source_y[-1]+(dest[dest>846]-846)*(source_y[-1]-source_y[-2])/106
    horizontal=np.interp(dest,[280,430,790],np.array(widths)/[65.65,148.24,285.88])
    sx=center+(np.arange(1024)[None,:]-512)*horizontal[:,None]
    ix=np.rint(sx).astype(int); iy=np.rint(sy).astype(int)[:,None]
    pixels=np.asarray(im)
    valid=(ix>=0)&(ix<im.width)&(iy>=0)&(iy<im.height)
    result=pixels[np.clip(iy,0,im.height-1),np.clip(ix,0,im.width-1)].copy()
    result[~valid]=0
    return Image.fromarray(result),{'method':'front-anatomical-scaffold',
        'source_center_x':center,'source_y':ys,'source_half_widths':widths,
        'target_center_x':512,'target_y':target_y.tolist(),
        'target_half_widths':[65.65,148.24,285.88]}

for name,(box,crown,pelvis,gaps) in SEATS.items():
    x,y,_,_=box
    im=SHEET.crop(box)
    # Remove the isolated instructional arrows before alpha extraction.
    # These source-sheet rectangles contain only arrows and background.
    arrow_boxes={
        'seat-shoulders':[(462,170,501,247),(664,170,706,247)],
        'seat-heart':[(474,674,506,739),(666,674,702,742)],
        'seat-chin':[(998,190,1038,280)],
    }
    for left,top,right,bottom in arrow_boxes.get(name,[]):
        ImageDraw.Draw(im).rectangle((left-x,top-y,right-x,bottom-y),fill=(0,0,0))
    protected=[]
    if name in ('seat-chin','seat-spine'):
        # Their dark folded legs have an open, faint outer contour. Protect
        # this interior explicitly rather than turning the legs into glass.
        poly=[(875,285),(900,290),(913,330),(930,350),(932,384),(995,381),(1045,383),
              (1066,399),(1063,416),(1047,427),(1050,439),
              (1005,443),(925,442),(887,436),(874,425)]
        dx=368 if name=='seat-spine' else 0
        protected=[(px+dx-x,py-y) for px,py in poly]
    transparent=extract(im,[(gx-x,gy-y) for gx,gy in gaps],protected)
    if name in FRONT:
        cx,ys,widths=FRONT[name]
        aligned,landmarks=register_front(transparent,cx-x,[v-y for v in ys],widths)
    else:
        aligned,landmarks=register(transparent,crown-y,(pelvis[0]-x,pelvis[1]-y))
    aligned.save(OUT/(name+'.png'))
    metadata[name]={'source':'uploads/seating seqeunce.png','crop':box,**landmarks}

for i in range(4):
    name=f'breath-{i}'
    im=Image.open(PUBLIC/'assets'/(name+'.png')).convert('RGB')
    # Discard neighboring-panel arrow fragments without touching the figure.
    a=np.asarray(im).copy(); a[285:340,374:]=0; a[285:340,:15]=0
    transparent=extract(Image.fromarray(a),[(91,390),(288,390)])
    aligned,landmarks=register_front(transparent,[190,193,194,195][i],
        [88,145,204,246,397,478,549],[45,105,182])
    aligned.save(OUT/(name+'.png'))
    metadata[name]={'source':'assets/'+name+'.png',**landmarks}

(OUT/'registration.json').write_text(json.dumps(metadata,indent=2)+'\n',encoding='utf-8')

# Clean the diagram without changing the ribbon, main arrows or core wording.
diagram=np.asarray(Image.open(PUBLIC/'assets'/'wave-diagram.png').convert('RGB')).copy()
diagram[:215]=0  # Fade in/out labels and upper portions of small arrows.
diagram[805:890,380:570]=0
diagram[805:890,965:1150]=0
# The remaining colored arrow fragments are isolated above the ribbon.
mask=diagram.max(axis=2)>25
for yy in range(215,282):
    for xx in list(range(175,320))+list(range(1200,1320)):
        if mask[yy,xx]:
            component=reachable(mask,[(xx,yy)])
            if int(component.sum())<3000:
                diagram[component]=0
            mask[component]=False
alpha=np.clip((diagram.max(axis=2).astype(float)-25)/25,0,1)
diagram_rgba=Image.fromarray(np.dstack([diagram,np.rint(alpha*255).astype('uint8')]))
diagram_rgba.save(PUBLIC/'assets'/'wave-diagram-clean.png')

# Generate a review version only. Production index.html remains unchanged.
original=(ROOT/'reference'/'original-netlify-index.html').read_text(encoding='utf-8')
pattern=r'(<script type="__bundler/template">)(.*?)(</script>)'
match=re.search(pattern,original,re.S)
template=apply_chapters(json.loads(match.group(2)))
template=re.sub(r'(<img src=")[^"]+(" alt="wave breathing cycle")',
                r'\g<1>assets/wave-diagram-clean.png?v=1\2',template)
seat_order=['hands','cushions','shoulders','spine','chin','heart','crown']
for i,name in enumerate(seat_order):
    template=re.sub(r'(<img data-seat="'+str(i)+r'" src=")[^"]+',
                    r'\g<1>assets/figures/seat-'+name+'.png',template)
for i in range(4):
    template=re.sub(r'(<img data-vfig="'+str(i)+r'" src=")[^"]+',
                    r'\g<1>assets/figures/breath-'+str(i)+'.png',template)
template=re.sub(r'(<img src=")[^"]+(" alt="luminous body")',
                r'\g<1>assets/figures/breath-3.png\2',template)
template=re.sub(r'(<img src=")[^"]+(" alt="luminous column")',
                r'\g<1>assets/figures/seat-column.png\2',template)
overrides='''<style>
img[alt="wave breathing cycle"]{animation:none!important;transform:none!important;opacity:1!important}
[data-layer="wavediagram"]{mix-blend-mode:normal!important}
[data-layer="seated"],[data-layer="vessel"],[data-layer="column"]{mix-blend-mode:normal!important}
[data-seat],[data-vfig],[data-layer="column"] img{padding:0!important;width:100%!important;height:100%!important;object-fit:contain!important;animation:none!important}
img[alt="luminous body"]{mix-blend-mode:normal!important;animation:none!important}
</style>'''
template=apply_mantra_scene(template)
template=apply_wave_loop(template)
template=apply_solar_spiral(template)
template=apply_visualization_scene(template)
template=template.replace('</head>',overrides+'</head>',1)
manifest=json.loads(re.search(r'<script type="__bundler/manifest">(.*?)</script>',original,re.S).group(1))
bundle=PUBLIC/'assets'/'preview-bundle'
bundle.mkdir(exist_ok=True)
paths={}
for uuid,entry in manifest.items():
    mime=entry['mime']
    ext={'image/png':'.png','image/jpeg':'.jpg','font/woff2':'.woff2',
         'text/javascript':'.js','application/javascript':'.js','text/css':'.css'}.get(mime,'.bin')
    data=base64.b64decode(entry['data'])
    if entry.get('compressed'): data=gzip.decompress(data)
    destination=bundle/(uuid+ext)
    destination.write_bytes(data)
    paths[uuid]='assets/preview-bundle/'+destination.name
    template=template.replace(uuid,paths[uuid])
ext_match=re.search(r'<script type="__bundler/ext_resources">(.*?)</script>',original,re.S)
resources={e['id']:paths[e['uuid']] for e in json.loads(ext_match.group(1)) if e['uuid'] in paths} if ext_match else {}
template=re.sub(r'\s+(?:integrity|crossorigin)="[^"]*"','',template)
review=template.replace('<head>','<head><script>window.__resources='+json.dumps(resources)+';</script>',1)
review=re.sub(r'(assets/figures/[^"?]+\.png)',r'\1?v=4',review)
(PUBLIC/'transparent-preview.html').write_text(review,encoding='utf-8')
(PUBLIC/'index.html').write_text(review,encoding='utf-8')

names=list(SEATS)+[f'breath-{i}' for i in range(4)]
bg=Image.open(PUBLIC/'assets'/'01-landscape.png').convert('RGBA')
# Register the original landscape to the same square as the figures.
# Source landmarks: summit (636,606), horizon y=890. Figure landmarks:
# brow center (512,280), navel y=640. Uniform scale preserves the mountain.
landscape_scale=(640-280)/(890-606)
landscape_x=512-636*landscape_scale
landscape_y=280-606*landscape_scale
bg=bg.transform((1024,1024),Image.Transform.AFFINE,
    (1/landscape_scale,0,-landscape_x/landscape_scale,
     0,1/landscape_scale,-landscape_y/landscape_scale),
    resample=Image.Resampling.BICUBIC)
bg.save(PUBLIC/'assets'/'registered-landscape.png')
sheet=Image.new('RGB',(1200,((len(names)+3)//4)*340),'#111721')
d=ImageDraw.Draw(sheet)
for i,name in enumerate(names):
    tile=bg.resize((300,300)).copy()
    tile.alpha_composite(Image.open(OUT/(name+'.png')).resize((300,300),Image.Resampling.NEAREST))
    sheet.paste(tile.convert('RGB'),((i%4)*300,(i//4)*340))
    d.text(((i%4)*300+12,(i//4)*340+311),name,fill='white')
sheet.save(ROOT/'figure-review.jpg',quality=92)
for f in OUT.glob('*.png'):
    a=np.asarray(Image.open(f))[:,:,3]
    assert a.min()==0 and a.max()==255 and np.any((a>0)&(a<255)),f
    assert np.all(a[0]==0) and np.all(a[-1]==0) and np.all(a[:,0]==0) and np.all(a[:,-1]==0), f'clipped: {f}'
print(f'Generated and alpha-checked {len(names)} registered figures.')












