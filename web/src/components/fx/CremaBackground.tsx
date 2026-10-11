"use client";

import { useEffect, useRef } from "react";
import { installPointer, pointerNDC } from "@/lib/pointer";
import { perfTier } from "@/lib/perf";

/**
 * "Crema": a slow, marbled coffee surface drawn by one fragment shader (plain WebGL, no three.js).
 * Moving the mouse or a finger over it stirs the surface. Runs only while visible, at reduced
 * resolution and frame rate (lower still on phones); reduced motion gets a single still frame.
 */
const VERT = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
// Phones run "mediump" as real 16-bit floats: the sin-hash noise then breaks into blocks and
// stripes (desktop GPUs silently use 32-bit). Ask for highp wherever the GPU has it.
const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uStir;uniform vec3 uDay;uniform float uAmp;
varying vec2 v;
float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
void main(){
 vec2 asp=vec2(uRes.x/uRes.y,1.);
 vec2 p=(v-.5)*asp*2.4;
 vec2 m=(uMouse-.5)*asp*2.4;
 vec2 d=p-m;float r=dot(d,d);
 float a=uStir*2.2*exp(-r*1.6);
 p=m+mat2(cos(a),-sin(a),sin(a),cos(a))*d;
 float t=uTime*.035;
 vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));
 vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+t*1.4),fbm(p+3.*q+vec2(8.3,2.8)-t));
 float f=fbm(p+3.4*w);
 vec3 esp=vec3(.106,.090,.078);
 vec3 brown=vec3(.25,.15,.09);
 vec3 crema=mix(vec3(.66,.42,.25),uDay,.45);
 vec3 c=mix(esp,brown,smoothstep(.32,.78,f));
 c=mix(c,crema,smoothstep(.64,.92,f)*.6);
 c=mix(esp,c,uAmp);
 gl_FragColor=vec4(c,1.);
}`;

function dayRgb(): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--day-rgb").trim() || "200 155 109";
  const [r, g, b] = v.split(/\s+/).map(Number);
  return [r / 255, g / 255, b / 255];
}

export function CremaBackground({ amp = 0.7, className = "" }: { amp?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, powerPreference: "low-power" });
    if (!gl) return;
    installPointer();
    const lite = perfTier() === "low";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // the surface is soft, so a low-res buffer scales up cleanly; phones get ½ with a pixel cap
    const scale = 0.5;
    const maxPx = lite ? 220_000 : 600_000;
    const frameMs = 1000 / (lite ? 24 : 30);

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (k: string) => gl.getUniformLocation(prog, k);
    const U = { res: u("uRes"), time: u("uTime"), mouse: u("uMouse"), stir: u("uStir"), day: u("uDay"), amp: u("uAmp") };
    gl.uniform1f(U.amp, amp);
    let day = dayRgb();
    const onDay = () => (day = dayRgb());
    window.addEventListener("moka:day", onDay);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const k = Math.min(scale, Math.sqrt(maxPx / Math.max(1, r.width * r.height)));
      const w = Math.max(1, Math.round(r.width * k));
      const h = Math.max(1, Math.round(r.height * k));
      // phones fire resize when the URL bar slides; only touch the buffer when its size really changes
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(40);
    });
    ro.observe(canvas);
    resize();

    const mouse = [0.5, 0.5];
    let stir = 0;
    let visible = false;
    let raf = 0;
    let last = 0;
    const start = performance.now();
    function draw(t: number) {
      gl!.uniform2f(U.res, canvas!.width, canvas!.height);
      gl!.uniform1f(U.time, t);
      gl!.uniform2f(U.mouse, mouse[0], mouse[1]);
      gl!.uniform1f(U.stir, stir);
      gl!.uniform3f(U.day, day[0], day[1], day[2]);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < frameMs) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const nd = pointerNDC(canvas, 1500);
      if (nd && Math.abs(nd.x) <= 1 && Math.abs(nd.y) <= 1) {
        const tx = nd.x * 0.5 + 0.5;
        const ty = nd.y * 0.5 + 0.5;
        mouse[0] += (tx - mouse[0]) * 0.2;
        mouse[1] += (ty - mouse[1]) * 0.2;
        stir = Math.min(1.6, stir + Math.min(3, Math.hypot(nd.vx, nd.vy)) * dt * 0.9);
      }
      stir *= Math.exp(-0.9 * dt);
      draw((now - start) / 1000);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced && !document.hidden) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (visible && !reduced && !document.hidden) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);
    if (reduced) draw(40);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("moka:day", onDay);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [amp]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
