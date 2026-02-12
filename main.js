// ============ PERFORMANCE DETECTION ============
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
const isLowPerf = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
const pMul = isLowPerf ? 0.3 : 1;

// ============ LOADING SCREEN ============
window.addEventListener('load', () => { setTimeout(() => document.getElementById('loader').classList.add('hidden'), 2000); });

// ============ CUSTOM CURSOR ============
const cursorDot = document.getElementById('cursor-dot');
const cursorTrail = document.getElementById('cursor-trail');
let cxT = 0, cyT = 0, cxA = 0, cyA = 0;

document.addEventListener('mousemove', e => {
    cxT = e.clientX; cyT = e.clientY;
    cursorDot.style.left = cxT + 'px';
    cursorDot.style.top = cyT + 'px';
});
(function animC() {
    cxA += (cxT - cxA) * 0.15; cyA += (cyT - cyA) * 0.15;
    cursorTrail.style.left = cxA + 'px'; cursorTrail.style.top = cyA + 'px';
    requestAnimationFrame(animC);
})();

// Hover states
document.querySelectorAll('a,button,.service-card,.gallery-item,.review-card,.step').forEach(el => {
    el.addEventListener('mouseenter', () => { cursorDot.classList.add('hovering'); cursorTrail.classList.add('hovering'); });
    el.addEventListener('mouseleave', () => { cursorDot.classList.remove('hovering'); cursorTrail.classList.remove('hovering'); });
});

// ============ MAGNETIC BUTTONS ============
document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ============ MOUSE TRACKING ============
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ============ HERO TEXT — CHAR-BY-CHAR REVEAL ============
(function() {
    const title = document.getElementById('hero-title');
    const text = title.textContent;
    title.innerHTML = '';
    text.split('').forEach((ch, i) => {
        if (ch === ' ') { title.appendChild(document.createTextNode(' ')); return; }
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        span.style.animationDelay = (0.8 + i * 0.04) + 's';
        title.appendChild(span);
    });
})();

// ============ SPARK PARTICLES (2D canvas) ============
(function(){
    const canvas = document.getElementById('spark-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
    resize(); window.addEventListener('resize', resize);

    const max = Math.floor(80 * pMul);
    const sparks = [];
    function spawn() {
        const cx = w * 0.5 + (Math.random() - 0.5) * w * 0.3;
        const cy = h * 0.45 + (Math.random() - 0.5) * h * 0.2;
        const a = Math.random() * Math.PI * 2;
        const sp = 1 + Math.random() * 3;
        const orange = Math.random() > 0.4;
        sparks.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 1, life: 1, decay: 0.008 + Math.random()*0.015, size: 1+Math.random()*2,
            r: orange?255:0, g: orange?(120+Math.random()*80|0):(140+Math.random()*60|0), b: orange?0:255 });
    }
    function anim() {
        requestAnimationFrame(anim);
        ctx.clearRect(0, 0, w, h);
        if (sparks.length < max && Math.random() > 0.5) spawn();
        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            s.x += s.vx; s.y += s.vy; s.vy += 0.04; s.vx *= 0.99; s.life -= s.decay;
            if (s.life <= 0) { sparks.splice(i, 1); continue; }
            ctx.globalAlpha = s.life * 0.8;
            ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
            ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    anim();
})();

// ============ THREE.JS BACKGROUND PARTICLES ============
(function(){
    const canvas = document.getElementById('three-bg');
    if (!canvas || typeof THREE === 'undefined') return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const count = Math.floor(400 * pMul);
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3), vel = new Float32Array(count * 3), col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        pos[i*3]=(Math.random()-.5)*25; pos[i*3+1]=(Math.random()-.5)*25; pos[i*3+2]=(Math.random()-.5)*12;
        vel[i*3]=(Math.random()-.5)*.003; vel[i*3+1]=(Math.random()-.5)*.003;
        const t=Math.random();
        if(t<.5){col[i*3]=0;col[i*3+1]=.4+t;col[i*3+2]=1}
        else if(t<.8){col[i*3]=0;col[i*3+1]=.7;col[i*3+2]=.9}
        else{col[i*3]=.8;col[i*3+1]=.9;col[i*3+2]=1}
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: .04, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false, vertexColors: true, sizeAttenuation: true });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    function anim() {
        requestAnimationFrame(anim);
        const p = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
            p[i*3] += vel[i*3]; p[i*3+1] += vel[i*3+1];
            if (Math.abs(p[i*3]) > 12) vel[i*3] *= -1;
            if (Math.abs(p[i*3+1]) > 12) vel[i*3+1] *= -1;
        }
        geo.attributes.position.needsUpdate = true;
        pts.rotation.y += .0001;
        renderer.render(scene, camera);
    }
    anim();
    window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
})();

// ============ THREE.JS HERO — INTERLOCKING GEARS ============
(function(){
    if (isMobile) return;
    const canvas = document.getElementById('hero-three');
    const hero = document.querySelector('.hero');
    if (!canvas || !hero || typeof THREE === 'undefined') return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(hero.offsetWidth, hero.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, hero.offsetWidth / hero.offsetHeight, 0.1, 100);
    camera.position.z = 6; camera.position.y = 0.5;

    function gearShape(outerR, innerR, teeth, tw) {
        const shape = new THREE.Shape();
        const apt = (Math.PI * 2) / teeth, ht = apt * tw;
        for (let i = 0; i < teeth; i++) {
            const a = i * apt;
            const v1x=Math.cos(a-ht)*innerR,v1y=Math.sin(a-ht)*innerR;
            const t1x=Math.cos(a-ht*.6)*outerR,t1y=Math.sin(a-ht*.6)*outerR;
            const t2x=Math.cos(a+ht*.6)*outerR,t2y=Math.sin(a+ht*.6)*outerR;
            const v2x=Math.cos(a+ht)*innerR,v2y=Math.sin(a+ht)*innerR;
            const na=(i+1)*apt;
            const nv1x=Math.cos(na-ht)*innerR,nv1y=Math.sin(na-ht)*innerR;
            if(i===0)shape.moveTo(v1x,v1y);else shape.lineTo(v1x,v1y);
            shape.lineTo(t1x,t1y);shape.lineTo(t2x,t2y);shape.lineTo(v2x,v2y);shape.lineTo(nv1x,nv1y);
        }
        shape.closePath();
        const hole = new THREE.Path(); hole.absarc(0,0,innerR*.4,0,Math.PI*2,true); shape.holes.push(hole);
        return shape;
    }

    const vs = `varying vec3 vN,vP;void main(){vN=normalize(normalMatrix*normal);vP=(modelViewMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
    const fs = `uniform float uT;varying vec3 vN,vP;void main(){vec3 V=normalize(-vP);float fr=pow(1.-max(dot(vN,V),0.),3.);vec3 base=vec3(.1,.13,.18),acc=vec3(0.,.64,1.);vec3 L=normalize(vec3(1.,1.,2.));float sp=pow(max(dot(reflect(-L,vN),V),0.),64.);float sp2=pow(max(dot(reflect(-normalize(vec3(-1.,.5,1.)),vN),V),0.),32.);float sw=sin(vP.x*2.+vP.y*2.+uT*1.5)*.5+.5;vec3 c=base+acc*fr*.7+vec3(.8,.9,1.)*sp*.8+acc*sp2*.4+acc*sw*.06+acc*pow(fr,2.)*.3;gl_FragColor=vec4(c,.92+fr*.08);}`;
    const ext = { depth: .3, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 2 };

    function makeGear(oR, iR, teeth, tw, pos3) {
        const geo = new THREE.ExtrudeGeometry(gearShape(oR, iR, teeth, tw), ext); geo.center();
        const mat = new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, uniforms: { uT: { value: 0 } }, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geo, mat); mesh.position.set(pos3[0], pos3[1], pos3[2]);
        scene.add(mesh);
        const wire = new THREE.Mesh(geo.clone(), new THREE.MeshBasicMaterial({ color: 0x00A3FF, wireframe: true, transparent: true, opacity: .04 }));
        wire.position.copy(mesh.position); scene.add(wire);
        return { mesh, wire, mat, teeth };
    }

    const g1 = makeGear(1.6, 1.25, 16, .35, [-0.3, 0, 0]);
    const g2 = makeGear(1.0, 0.78, 10, .35, [2.1, 0.9, 0]);
    const g3 = makeGear(0.7, 0.55, 8, .35, [-2.0, -1.4, 0.2]);

    // Orbital rings
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(2.8,.006,16,128), new THREE.MeshBasicMaterial({color:0x00A3FF,transparent:true,opacity:.2}));
    r1.rotation.x = Math.PI*.4; scene.add(r1);
    const r2 = new THREE.Mesh(new THREE.TorusGeometry(3.2,.004,16,128), new THREE.MeshBasicMaterial({color:0x00A3FF,transparent:true,opacity:.1}));
    r2.rotation.x = Math.PI*.6; r2.rotation.y = Math.PI*.2; scene.add(r2);

    // Grid floor
    const gridMat = new THREE.ShaderMaterial({
        transparent: true, uniforms: { uT: { value: 0 } }, side: THREE.DoubleSide,
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `uniform float uT;varying vec2 vUv;void main(){vec2 g=abs(fract(vUv*20.-.5)-.5)/fwidth(vUv*20.);float l=min(g.x,g.y);float v=1.-min(l,1.);float d=length(vUv-.5)*2.;float f=1.-smoothstep(.2,.8,d);gl_FragColor=vec4(0.,.64,1.,v*f*.1*(sin(uT*.5)*.3+.7));}`
    });
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(20,20,40,40), gridMat);
    grid.rotation.x = -Math.PI*.5; grid.position.y = -2.8; scene.add(grid);

    // 3D sparks at mesh point
    const spkCount = Math.floor(60 * pMul);
    const spkGeo = new THREE.BufferGeometry();
    const spkPos = new Float32Array(spkCount * 3);
    const spkVel = [], spkLife = [];
    for (let i = 0; i < spkCount; i++) {
        spkPos[i*3]=2.1; spkPos[i*3+1]=0.9; spkPos[i*3+2]=0;
        spkVel.push({x:(Math.random()-.5)*.08, y:(Math.random()-.5)*.08+.03, z:(Math.random()-.5)*.04});
        spkLife.push(Math.random());
    }
    spkGeo.setAttribute('position', new THREE.BufferAttribute(spkPos, 3));
    const spkMat = new THREE.PointsMaterial({size:.04,color:0xff8800,transparent:true,opacity:.8,blending:THREE.AdditiveBlending,depthWrite:false});
    scene.add(new THREE.Points(spkGeo, spkMat));

    let scrollOff = 0;
    window.addEventListener('scroll', () => { scrollOff = window.scrollY * 0.002; });

    function anim() {
        requestAnimationFrame(anim);
        const t = performance.now() * 0.001;
        g1.mat.uniforms.uT.value = t; g2.mat.uniforms.uT.value = t; g3.mat.uniforms.uT.value = t;
        gridMat.uniforms.uT.value = t;

        const baseRot = t * 0.2;
        const tiltX = Math.PI * 0.15 + Math.sin(t * 0.15) * 0.08 + mouseY * 0.1;

        g1.mesh.rotation.set(tiltX, 0, baseRot); g1.mesh.position.y = -scrollOff;
        g2.mesh.rotation.set(tiltX, 0, -baseRot * (16/10) + Math.PI/10); g2.mesh.position.y = 0.9 - scrollOff;
        g3.mesh.rotation.set(tiltX, 0, -baseRot * (16/8)); g3.mesh.position.y = -1.4 - scrollOff;

        [g1,g2,g3].forEach(g => { g.wire.rotation.copy(g.mesh.rotation); g.wire.position.copy(g.mesh.position); });
        r1.rotation.z = t * .1; r2.rotation.z = -t * .08;
        grid.position.y = -2.8 - scrollOff;

        const sp = spkGeo.attributes.position.array;
        for (let i = 0; i < spkCount; i++) {
            spkLife[i] -= 0.015;
            if (spkLife[i] <= 0) {
                sp[i*3]=1+Math.random()*.4; sp[i*3+1]=.5+Math.random()*.4-scrollOff; sp[i*3+2]=(Math.random()-.5)*.3;
                spkVel[i]={x:(Math.random()-.5)*.06,y:Math.random()*.05+.02,z:(Math.random()-.5)*.03};
                spkLife[i]=.5+Math.random()*.5;
            }
            sp[i*3]+=spkVel[i].x; sp[i*3+1]+=spkVel[i].y; sp[i*3+2]+=spkVel[i].z;
            spkVel[i].y -= 0.001;
        }
        spkGeo.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }
    anim();
    window.addEventListener('resize', () => { camera.aspect=hero.offsetWidth/hero.offsetHeight; camera.updateProjectionMatrix(); renderer.setSize(hero.offsetWidth,hero.offsetHeight); });
})();

// ============ LIGHTBOX ============
window.openLightbox = function(el) {
    document.getElementById('lightbox-img').src = el.querySelector('img').src;
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
};
window.closeLightbox = function() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
};
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ============ NAVIGATION ============
const hamburger = document.getElementById('hamburger'), mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => { hamburger.classList.toggle('active'); mobileMenu.classList.toggle('active'); });
window.closeMenu = function() { hamburger.classList.remove('active'); mobileMenu.classList.remove('active'); };
window.addEventListener('scroll', () => { document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50); });

// ============ GSAP + SCROLLTRIGGER ============
gsap.registerPlugin(ScrollTrigger);

// Service cards — 3D flip in
gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.to(card, {
        opacity: 1, rotateY: 0, duration: 0.8, delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true,
            onEnter: () => card.classList.add('visible')
        }
    });
});

// Steps — staggered entrance
gsap.utils.toArray('.step').forEach((step, i) => {
    gsap.from(step, {
        opacity: 0, y: 60, duration: 0.8, delay: i * 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: step, start: 'top 85%', once: true }
    });
});

// About — slide in
gsap.from('.about-visual', { opacity: 0, x: -80, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.about-visual', start: 'top 80%', once: true } });
gsap.from('.about-features', { opacity: 0, x: 80, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.about-features', start: 'top 80%', once: true } });

// Wipe reveal on section titles
gsap.utils.toArray('.wipe-reveal').forEach(el => {
    ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => el.classList.add('revealed')
    });
});

// Hero entrance
gsap.from('.hero-content', { opacity: 0, y: 60, duration: 1.2, ease: 'power3.out' });
gsap.from('.hero-label', { opacity: 0, y: 20, duration: .8, delay: .3 });
gsap.from('.hero-sub', { opacity: 0, y: 20, duration: .8, delay: .6 });
gsap.from('.hero-stats-line', { opacity: 0, y: 20, duration: .8, delay: .8 });
gsap.from('.hero-buttons', { opacity: 0, y: 20, duration: .8, delay: 1 });
gsap.from('.scroll-indicator', { opacity: 0, duration: 1, delay: 1.5 });

// Hero photo parallax
gsap.to('.hero-bg-photo', { y: 100, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });

// Gallery — horizontal scroll
const galleryTrack = document.getElementById('gallery-track');
if (galleryTrack) {
    const totalW = galleryTrack.scrollWidth - window.innerWidth;
    gsap.to(galleryTrack, {
        x: () => -totalW,
        ease: 'none',
        scrollTrigger: {
            trigger: '.gallery-section',
            start: 'top top',
            end: () => '+=' + totalW,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
        }
    });
}

// Reviews — 3D card fan + tilt on mouse
const reviewCards = gsap.utils.toArray('.review-card');
reviewCards.forEach((card, i) => {
    gsap.from(card, {
        opacity: 0, rotateY: -30, rotateX: 10, y: 60, duration: 0.8, delay: i * 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true }
    });

    // Parallax tilt on mouse
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// Star animation
const starObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.star').forEach((star, i) => {
                setTimeout(() => star.classList.add('animated'), i * 100);
            });
            starObs.unobserve(e.target);
        }
    });
}, { threshold: 0.3 });
document.querySelectorAll('.review-card').forEach(c => starObs.observe(c));

// Stats — counter with glitch
const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el.dataset.static) return;
        counterObs.unobserve(el);
        const target = parseFloat(el.dataset.target);
        const decimal = el.dataset.decimal === 'true';
        const dur = 2000, start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            let val = eased * target;
            // Glitch flicker near end
            if (p > 0.7 && p < 0.95 && Math.random() > 0.7) {
                val += (Math.random() - 0.5) * target * 0.1;
            }
            el.textContent = decimal ? val.toFixed(1) : Math.floor(val) + '+';
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = decimal ? target.toFixed(1) : target + '+';
        }
        requestAnimationFrame(tick);
    });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-number').forEach(el => counterObs.observe(el));

// Service card 3D tilt on mouse
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// Nav active section highlight
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[data-section]');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    navLinks.forEach(a => {
        a.classList.toggle('active', a.dataset.section === current);
    });
});

// Floating call + back to top visibility
const floatingCall = document.getElementById('floating-call');
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    const show = window.scrollY > 600;
    floatingCall.classList.toggle('visible', show);
    backToTop.classList.toggle('visible', show);
});
backToTop.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

// Contact map section entrance
gsap.from('.map-container', { opacity: 0, y: 40, duration: 1, scrollTrigger: { trigger: '.map-container', start: 'top 85%', once: true } });

// CTA section
gsap.from('.cta-banner-content', { opacity: 0, y: 40, duration: 1, scrollTrigger: { trigger: '.cta-banner', start: 'top 80%', once: true } });
