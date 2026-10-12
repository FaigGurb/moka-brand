"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[635],{5635:(e,t,r)=>{r.r(t),r.d(t,{default:()=>p});var n=r(5155),i=r(4877),a=r(258),o=r(950),l=r(5661),s=r(8945),u=r(2115),v=r(5339);let f={uniforms:{tDiffuse:{value:null},h:{value:1/512}},vertexShader:`
      varying vec2 vUv;

      void main() {

        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

      }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float h;

    varying vec2 vUv;

    void main() {

    	vec4 sum = vec4( 0.0 );

    	sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;
    	sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;
    	sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;
    	sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;

    	gl_FragColor = sum;

    }
  `},c={uniforms:{tDiffuse:{value:null},v:{value:1/512}},vertexShader:`
    varying vec2 vUv;

    void main() {

      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }
  `,fragmentShader:`

  uniform sampler2D tDiffuse;
  uniform float v;

  varying vec2 vUv;

  void main() {

    vec4 sum = vec4( 0.0 );

    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;
    sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;

    gl_FragColor = sum;

  }
  `},m=u.forwardRef(({scale:e=10,frames:t=1/0,opacity:r=1,width:n=1,height:a=1,blur:o=1,near:l=0,far:m=10,resolution:d=512,smooth:h=!0,color:g="#000000",depthWrite:p=!1,renderOrder:x,...y},D)=>{let U,w,b=u.useRef(null),M=(0,i.C)(e=>e.scene),j=(0,i.C)(e=>e.gl),E=u.useRef(null);n*=Array.isArray(e)?e[0]:e||1,a*=Array.isArray(e)?e[1]:e||1;let[S,R,C,P,k,L,I]=u.useMemo(()=>{let e=new v.nWS(d,d),t=new v.nWS(d,d);t.texture.generateMipmaps=e.texture.generateMipmaps=!1;let r=new v.bdM(n,a).rotateX(Math.PI/2),i=new v.eaF(r),o=new v.CSG;o.depthTest=o.depthWrite=!1,o.onBeforeCompile=e=>{e.uniforms={...e.uniforms,ucolor:{value:new v.Q1f(g)}},e.fragmentShader=e.fragmentShader.replace("void main() {",`uniform vec3 ucolor;
           void main() {
          `),e.fragmentShader=e.fragmentShader.replace("vec4( vec3( 1.0 - fragCoordZ ), opacity );","vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );")};let l=new v.BKk(f),s=new v.BKk(c);return s.depthTest=l.depthTest=!1,[e,r,o,i,l,s,t]},[d,n,a,e,g]),_=e=>{P.visible=!0,P.material=k,k.uniforms.tDiffuse.value=S.texture,k.uniforms.h.value=e/256,j.setRenderTarget(I),j.render(P,E.current),P.material=L,L.uniforms.tDiffuse.value=I.texture,L.uniforms.v.value=e/256,j.setRenderTarget(S),j.render(P,E.current),P.visible=!1},T=0;return(0,i.D)(()=>{E.current&&(t===1/0||T<t)&&(T++,U=M.background,w=M.overrideMaterial,b.current.visible=!1,M.background=null,M.overrideMaterial=C,j.setRenderTarget(S),j.render(M,E.current),_(o),h&&_(.4*o),j.setRenderTarget(null),b.current.visible=!0,M.overrideMaterial=w,M.background=U)}),u.useImperativeHandle(D,()=>b.current,[]),u.createElement("group",(0,s.A)({"rotation-x":Math.PI/2},y,{ref:b}),u.createElement("mesh",{renderOrder:x,geometry:R,scale:[1,-1,1],rotation:[-Math.PI/2,0,0]},u.createElement("meshBasicMaterial",{transparent:!0,map:S.texture,opacity:r,depthWrite:p})),u.createElement("orthographicCamera",{ref:E,args:[-n/2,n/2,a/2,-a/2,l,m]}))});var d=r(5751);let h={S:1.9,M:2.3,L:2.7};function g(e){let{size:t,reducedMotion:r}=e,a=(0,u.useRef)(null),o=(0,u.useRef)(h[t]),l=(0,u.useMemo)(()=>{let e=document.createElement("canvas");return e.width=2048,e.height=1024,e},[]),s=(0,u.useMemo)(()=>{let e=new v.GOR(l);return e.colorSpace=v.er$,e.anisotropy=8,e},[l]);(0,u.useEffect)(()=>{let e=l.width,t=l.height,r=l.getContext("2d");r.fillStyle="#f7f6f3",r.fillRect(0,0,e,t),r.globalAlpha=.05;for(let n=0;n<900;n++)r.fillStyle=n%2?"#b8b0a6":"#ffffff",r.fillRect(997*n%e,613*n%t,2,1);for(let n of(r.globalAlpha=1,[0,.5*e,e]))!function(e,t,r,n,i){let a=d.mt.find(e=>"K"===e.id),o=n/155;e.save(),e.translate(t-445*o,r-77*o),e.scale(o,o),e.fillStyle=i;let l=(0,d.AP)(a.poly);[l.top,l.bottom].forEach(t=>{e.beginPath(),t.forEach((t,r)=>{let[n,i]=t;return r?e.lineTo(n,i):e.moveTo(n,i)}),e.closePath(),e.fill()}),e.strokeStyle=i,e.lineWidth=8,e.stroke(new Path2D(d.Jb)),e.restore()}(r,n,.55*t,.26*t,"#141414");r.fillStyle="rgba(0,0,0,0.08)",r.fillRect(0,0,e,.02*t),s.needsUpdate=!0},[l,s]);let f=(0,u.useMemo)(()=>{let e=new v.nzx([new v.I9Y(.6,0),new v.I9Y(.84,1)],96),t=new v.tcD(.6,64).rotateX(Math.PI/2);return{body:e,bottom:t,lid:new v.nzx([[0,.16],[.5,.16],[.62,.12],[.7,.1],[.74,.06],[.86,.05],[.9,.02],[.9,-.04],[.85,-.06]].map(e=>{let[t,r]=e;return new v.I9Y(t,r)}),96),rim:new v.O3Y(.85,.025,12,96).rotateX(Math.PI/2)}},[]),c=(0,u.useMemo)(()=>({paper:new v._4j({map:s,roughness:.62,side:v.$EB}),plain:new v._4j({color:"#f2f1ee",roughness:.7}),lid:new v._4j({color:"#141414",roughness:.32}),hole:new v.V9B({color:"#000000"})}),[s]);(0,u.useEffect)(()=>()=>{Object.values(f).forEach(e=>e.dispose()),Object.values(c).forEach(e=>e.dispose()),s.dispose()},[f,c,s]);let{gl:m}=(0,i.C)(),g=(0,u.useRef)({angle:.4,vel:0,dragging:!1,lastX:0,idle:0});(0,u.useEffect)(()=>{let e=m.domElement;e.style.touchAction="pan-y",e.style.cursor="grab";let t=t=>{g.current.dragging=!0,g.current.lastX=t.clientX,e.style.cursor="grabbing"},r=e=>{let t=g.current;if(!t.dragging)return;let r=e.clientX-t.lastX;t.lastX=e.clientX,t.angle+=.012*r,t.vel=.012*r*60,t.idle=0},n=()=>{g.current.dragging=!1,e.style.cursor="grab"};return e.addEventListener("pointerdown",t),window.addEventListener("pointermove",r),window.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),()=>{e.removeEventListener("pointerdown",t),window.removeEventListener("pointermove",r),window.removeEventListener("pointerup",n),e.removeEventListener("pointercancel",n)}},[m]);let p=(0,u.useRef)(null),x=(0,u.useRef)(null);return(0,i.D)((e,n)=>{o.current+=(h[t]-o.current)*(1-Math.pow(.002,n));let i=o.current;p.current&&p.current.scale.set(1,i,1),x.current&&(x.current.position.y=i);let l=g.current;l.dragging||(l.idle+=n,l.angle+=l.vel*n,l.vel*=Math.exp(-3*n),!r&&l.idle>1.2&&(l.angle+=.35*n*Math.min(1,l.idle-1.2))),a.current&&(a.current.rotation.y=l.angle,a.current.position.y=-i/2-.1+(r?0:.04*Math.sin(.8*e.clock.elapsedTime)))}),(0,n.jsxs)("group",{ref:a,children:[(0,n.jsx)("mesh",{ref:p,geometry:f.body,material:c.paper}),(0,n.jsx)("mesh",{geometry:f.bottom,material:c.plain}),(0,n.jsxs)("group",{ref:x,children:[(0,n.jsx)("mesh",{geometry:f.rim,material:c.plain}),(0,n.jsx)("mesh",{geometry:f.lid,material:c.lid}),(0,n.jsx)("mesh",{position:[0,.165,.42],"rotation-x":-Math.PI/2,material:c.hole,children:(0,n.jsx)("planeGeometry",{args:[.22,.07]})})]})]})}function p(e){return(0,n.jsxs)(a.Hl,{frameloop:e.active?"always":"never",dpr:e.touch?[1,1.5]:[1,2],camera:{position:[0,.9,6.4],fov:32},gl:{antialias:!0,alpha:!0},"aria-hidden":"true",children:[(0,n.jsx)("ambientLight",{intensity:.5}),(0,n.jsx)("directionalLight",{position:[3,4,5],intensity:1.8,color:"#fff4e6"}),(0,n.jsx)("directionalLight",{position:[-4,2,-3],intensity:.6,color:"#c89b6d"}),(0,n.jsxs)(o.OH,{resolution:64,children:[(0,n.jsx)(l.O,{intensity:2,position:[0,3,4],scale:[6,1,1],color:"#fff6ea"}),(0,n.jsx)(l.O,{intensity:1,position:[-4,0,2],"rotation-y":Math.PI/2,scale:[3,3,1],color:"#ffe2a6"})]}),(0,n.jsx)(g,{...e}),(0,n.jsx)(m,{frames:45,position:[0,-1.6,0],opacity:.45,scale:6,blur:2.6,far:3,resolution:e.touch?256:512},e.size)]})}}}]);