"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[635],{5635:(e,t,r)=>{r.r(t),r.d(t,{default:()=>p});var n=r(5155),i=r(4877),l=r(258),a=r(950),o=r(5661),s=r(8945),u=r(2115),v=r(5339);let f={uniforms:{tDiffuse:{value:null},h:{value:1/512}},vertexShader:`
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
  `},m=u.forwardRef(({scale:e=10,frames:t=1/0,opacity:r=1,width:n=1,height:l=1,blur:a=1,near:o=0,far:m=10,resolution:d=512,smooth:h=!0,color:g="#000000",depthWrite:p=!1,renderOrder:x,...y},D)=>{let U,w,b=u.useRef(null),M=(0,i.C)(e=>e.scene),E=(0,i.C)(e=>e.gl),S=u.useRef(null);n*=Array.isArray(e)?e[0]:e||1,l*=Array.isArray(e)?e[1]:e||1;let[j,R,P,k,C,L,T]=u.useMemo(()=>{let e=new v.nWS(d,d),t=new v.nWS(d,d);t.texture.generateMipmaps=e.texture.generateMipmaps=!1;let r=new v.bdM(n,l).rotateX(Math.PI/2),i=new v.eaF(r),a=new v.CSG;a.depthTest=a.depthWrite=!1,a.onBeforeCompile=e=>{e.uniforms={...e.uniforms,ucolor:{value:new v.Q1f(g)}},e.fragmentShader=e.fragmentShader.replace("void main() {",`uniform vec3 ucolor;
           void main() {
          `),e.fragmentShader=e.fragmentShader.replace("vec4( vec3( 1.0 - fragCoordZ ), opacity );","vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );")};let o=new v.BKk(f),s=new v.BKk(c);return s.depthTest=o.depthTest=!1,[e,r,a,i,o,s,t]},[d,n,l,e,g]),I=e=>{k.visible=!0,k.material=C,C.uniforms.tDiffuse.value=j.texture,C.uniforms.h.value=e/256,E.setRenderTarget(T),E.render(k,S.current),k.material=L,L.uniforms.tDiffuse.value=T.texture,L.uniforms.v.value=e/256,E.setRenderTarget(j),E.render(k,S.current),k.visible=!1},A=0;return(0,i.D)(()=>{S.current&&(t===1/0||A<t)&&(A++,U=M.background,w=M.overrideMaterial,b.current.visible=!1,M.background=null,M.overrideMaterial=P,E.setRenderTarget(j),E.render(M,S.current),I(a),h&&I(.4*a),E.setRenderTarget(null),b.current.visible=!0,M.overrideMaterial=w,M.background=U)}),u.useImperativeHandle(D,()=>b.current,[]),u.createElement("group",(0,s.A)({"rotation-x":Math.PI/2},y,{ref:b}),u.createElement("mesh",{renderOrder:x,geometry:R,scale:[1,-1,1],rotation:[-Math.PI/2,0,0]},u.createElement("meshBasicMaterial",{transparent:!0,map:j.texture,opacity:r,depthWrite:p})),u.createElement("orthographicCamera",{ref:S,args:[-n/2,n/2,l/2,-l/2,o,m]}))});var d=r(5751);let h={S:1.9,M:2.3,L:2.7};function g(e){let{sleeve:t,ink:r,line:l,size:a,reducedMotion:o}=e,s=(0,u.useRef)(null),f=(0,u.useRef)(h[a]),c=(0,u.useMemo)(()=>{let e=document.createElement("canvas");return e.width=2048,e.height=1024,e},[]),m=(0,u.useMemo)(()=>{let e=new v.GOR(c);return e.colorSpace=v.er$,e.anisotropy=8,e},[c]);(0,u.useEffect)(()=>{!function(e,t,r,n,i){let l=e.width,a=e.height,o=e.getContext("2d");o.fillStyle="#f5f1ea",o.fillRect(0,0,l,a),o.globalAlpha=.05;for(let e=0;e<900;e++)o.fillStyle=e%2?"#b8b0a6":"#ffffff",o.fillRect(997*e%l,613*e%a,2,1);o.globalAlpha=1;let s=.36*a,u=.68*a;for(let e of(o.fillStyle=t,o.fillRect(0,s,l,u-s),o.fillStyle=n,o.fillRect(0,s+(u-s)*({S:.78,M:.55,L:.3})[i]-5,l,10),[0,.5*l,l])){let t=.25*l;!function(e,t,r,n,i){let l=n/675;e.save(),e.translate(t,r),e.scale(l,l),e.fillStyle=i;let a=t=>{e.beginPath(),t.forEach((t,r)=>{let[n,i]=t;return r?e.lineTo(n,i):e.moveTo(n,i)}),e.closePath(),e.fill()};d.mt.forEach(e=>{let t=(0,d.AP)(e.poly);a(t.top),a(t.bottom)}),e.strokeStyle=i,e.lineWidth=8,e.stroke(new Path2D(d.Jb)),e.restore()}(o,e-t/2,s+(u-s)*.2,t,r),function(e,t,r,n,i){let l=d.mt.find(e=>"K"===e.id),a=n/155;e.save(),e.translate(t-445*a,r-77*a),e.scale(a,a),e.fillStyle=i;let o=(0,d.AP)(l.poly);[o.top,o.bottom].forEach(t=>{e.beginPath(),t.forEach((t,r)=>{let[n,i]=t;return r?e.lineTo(n,i):e.moveTo(n,i)}),e.closePath(),e.fill()}),e.strokeStyle=i,e.lineWidth=8,e.stroke(new Path2D(d.Jb)),e.restore()}(o,e,.83*a,.12*a,"#1b1714")}o.fillStyle="rgba(0,0,0,0.08)",o.fillRect(0,0,l,.02*a)}(c,t,r,l,a),m.needsUpdate=!0},[c,m,t,r,l,a]);let g=(0,u.useMemo)(()=>{let e=new v.nzx([new v.I9Y(.6,0),new v.I9Y(.84,1)],96),t=new v.tcD(.6,64).rotateX(Math.PI/2);return{body:e,bottom:t,lid:new v.nzx([[0,.16],[.5,.16],[.62,.12],[.7,.1],[.74,.06],[.86,.05],[.9,.02],[.9,-.04],[.85,-.06]].map(e=>{let[t,r]=e;return new v.I9Y(t,r)}),96),rim:new v.O3Y(.85,.025,12,96).rotateX(Math.PI/2)}},[]),p=(0,u.useMemo)(()=>({paper:new v.uSd({map:m,roughness:.62,sheen:.3,side:v.$EB}),plain:new v._4j({color:"#efe9df",roughness:.7}),lid:new v.uSd({color:"#1b1714",roughness:.35,clearcoat:.6}),hole:new v.V9B({color:"#000000"})}),[m]);(0,u.useEffect)(()=>()=>{Object.values(g).forEach(e=>e.dispose()),Object.values(p).forEach(e=>e.dispose()),m.dispose()},[g,p,m]);let{gl:x}=(0,i.C)(),y=(0,u.useRef)({angle:.4,vel:0,dragging:!1,lastX:0,idle:0});(0,u.useEffect)(()=>{let e=x.domElement;e.style.touchAction="pan-y",e.style.cursor="grab";let t=t=>{y.current.dragging=!0,y.current.lastX=t.clientX,e.style.cursor="grabbing"},r=e=>{let t=y.current;if(!t.dragging)return;let r=e.clientX-t.lastX;t.lastX=e.clientX,t.angle+=.012*r,t.vel=.012*r*60,t.idle=0},n=()=>{y.current.dragging=!1,e.style.cursor="grab"};return e.addEventListener("pointerdown",t),window.addEventListener("pointermove",r),window.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),()=>{e.removeEventListener("pointerdown",t),window.removeEventListener("pointermove",r),window.removeEventListener("pointerup",n),e.removeEventListener("pointercancel",n)}},[x]);let D=(0,u.useRef)(null),U=(0,u.useRef)(null);return(0,i.D)((e,t)=>{f.current+=(h[a]-f.current)*(1-Math.pow(.002,t));let r=f.current;D.current&&D.current.scale.set(1,r,1),U.current&&(U.current.position.y=r);let n=y.current;n.dragging||(n.idle+=t,n.angle+=n.vel*t,n.vel*=Math.exp(-3*t),!o&&n.idle>1.2&&(n.angle+=.35*t*Math.min(1,n.idle-1.2))),s.current&&(s.current.rotation.y=n.angle,s.current.position.y=-r/2-.1+(o?0:.04*Math.sin(.8*e.clock.elapsedTime)))}),(0,n.jsxs)("group",{ref:s,children:[(0,n.jsx)("mesh",{ref:D,geometry:g.body,material:p.paper}),(0,n.jsx)("mesh",{geometry:g.bottom,material:p.plain}),(0,n.jsxs)("group",{ref:U,children:[(0,n.jsx)("mesh",{geometry:g.rim,material:p.plain}),(0,n.jsx)("mesh",{geometry:g.lid,material:p.lid}),(0,n.jsx)("mesh",{position:[0,.165,.42],"rotation-x":-Math.PI/2,material:p.hole,children:(0,n.jsx)("planeGeometry",{args:[.22,.07]})})]})]})}function p(e){return(0,n.jsxs)(l.Hl,{frameloop:e.active?"always":"never",dpr:e.touch?[1,1.5]:[1,2],camera:{position:[0,.9,6.4],fov:32},gl:{antialias:!0,alpha:!0},"aria-hidden":"true",children:[(0,n.jsx)("ambientLight",{intensity:.5}),(0,n.jsx)("directionalLight",{position:[3,4,5],intensity:1.8,color:"#fff4e6"}),(0,n.jsx)("directionalLight",{position:[-4,2,-3],intensity:.6,color:"#c89b6d"}),(0,n.jsxs)(a.OH,{resolution:64,children:[(0,n.jsx)(o.O,{intensity:2,position:[0,3,4],scale:[6,1,1],color:"#fff6ea"}),(0,n.jsx)(o.O,{intensity:1,position:[-4,0,2],"rotation-y":Math.PI/2,scale:[3,3,1],color:"#ffe2a6"})]}),(0,n.jsx)(g,{...e}),(0,n.jsx)(m,{position:[0,-1.6,0],opacity:.45,scale:6,blur:2.6,far:3})]})}}}]);