/* MOKA game sounds — synthesised with Web Audio (no files except the sound logo).
   Same palette as the brand sound logo: a pour that rises in pitch and a glass "tink" (E6 + B6).
   Audio starts only after a user gesture; the mute choice is remembered (localStorage 'moka-sound').
   On iPhone, Web Audio follows the silent switch. */
(function(){
  var KEY='moka-sound', ctx=null, master=null, noiseBuf=null, logoBuf=null, logoLoading=false;
  var muted=false;try{muted=localStorage.getItem(KEY)==='off'}catch(e){}
  var LOGO=(document.currentScript&&document.currentScript.src||'').replace(/game\/shared\/sound\.js.*$/,'brand-kit/moka-sound-logo.wav');

  function ensure(){
    if(!ctx){
      var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
      try{ctx=new AC()}catch(e){return null}
      master=ctx.createGain();master.gain.value=muted?0:.9;
      var comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;
      master.connect(comp);comp.connect(ctx.destination);
      var n=ctx.sampleRate*2;noiseBuf=ctx.createBuffer(1,n,ctx.sampleRate);
      var d=noiseBuf.getChannelData(0),b=0;for(var i=0;i<n;i++){b=.97*b+.03*(Math.random()*2-1);d[i]=b*6}
    }
    if(ctx.state==='suspended')ctx.resume();
    return ctx;
  }
  function unlock(){ensure();loadLogo()}
  ['pointerdown','keydown','touchend'].forEach(function(ev){window.addEventListener(ev,unlock,{passive:true,capture:true})});

  function loadLogo(){
    if(logoBuf||logoLoading||!ctx||!LOGO||!window.fetch)return;logoLoading=true;
    fetch(LOGO).then(function(r){return r.arrayBuffer()}).then(function(a){
      return new Promise(function(res,rej){ctx.decodeAudioData(a,res,rej)})}).then(function(b){logoBuf=b}).catch(function(){});
  }
  function live(){return !muted&&ensure()}

  // one decaying sine "tink" (optionally detuned partial for a glassy edge)
  function tone(f,t0,dur,vol,type){
    var o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type||'sine';o.frequency.setValueAtTime(f,t0);
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.006);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    o.connect(g);g.connect(master);o.start(t0);o.stop(t0+dur+.05);
  }
  function glass(f,t0,vol){tone(f,t0,.7,vol);tone(f*2.76,t0,.25,vol*.25)}
  function noise(t0,dur,f0,f1,vol,q){
    var s=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),g=ctx.createGain();
    s.buffer=noiseBuf;bp.type='bandpass';bp.Q.value=q||6;
    bp.frequency.setValueAtTime(f0,t0);bp.frequency.exponentialRampToValueAtTime(f1,t0+dur);
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.01);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    s.connect(bp);bp.connect(g);g.connect(master);s.start(t0);s.stop(t0+dur+.05);
  }

  var E6=1318.5,B6=1975.5,pour=null;
  var S={
    get muted(){return muted},
    setMuted:function(m){
      muted=!!m;try{localStorage.setItem(KEY,muted?'off':'on')}catch(e){}
      if(master)master.gain.setTargetAtTime(muted?0:.9,ctx.currentTime,.02);
      if(muted)S.pourStop();
      document.querySelectorAll('.snd').forEach(sync);
    },
    /** continuous pour; level 0..1 raises the pitch like a filling cup */
    pourStart:function(){
      if(pour||!live())return;
      var t=ctx.currentTime,s=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),g=ctx.createGain();
      s.buffer=noiseBuf;s.loop=true;bp.type='bandpass';bp.Q.value=9;bp.frequency.value=420;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.32,t+.08);
      s.connect(bp);bp.connect(g);g.connect(master);s.start(t);pour={s:s,bp:bp,g:g};
    },
    pourLevel:function(l){if(pour)pour.bp.frequency.setTargetAtTime(420+Math.min(1,Math.max(0,l))*900,ctx.currentTime,.05)},
    pourStop:function(){
      if(!pour)return;var p=pour,t=ctx.currentTime;pour=null;
      p.g.gain.cancelScheduledValues(t);p.g.gain.setTargetAtTime(0,t,.05);p.s.stop(t+.3);
    },
    tink:function(){if(!live())return;var t=ctx.currentTime;glass(E6,t,.32);glass(B6,t+.09,.26)},
    good:function(){if(!live())return;glass(B6*.75,ctx.currentTime,.22)},
    bad:function(){if(!live())return;var t=ctx.currentTime;tone(196,t,.32,.28,'triangle');tone(147,t+.1,.4,.24,'triangle')},
    overflow:function(){if(!live())return;noise(ctx.currentTime,.5,1400,300,.4,3);S.bad()},
    /** short wooden "tok" — pitch picks the variant */
    pop:function(p){if(!live())return;var t=ctx.currentTime,f=(p||1)*520;
      var o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(f*1.6,t);o.frequency.exponentialRampToValueAtTime(f,t+.05);
      g.gain.setValueAtTime(.35,t);g.gain.exponentialRampToValueAtTime(.0001,t+.14);o.connect(g);g.connect(master);o.start(t);o.stop(t+.2)},
    gold:function(){if(!live())return;var t=ctx.currentTime;glass(E6,t,.24);glass(B6,t+.06,.22);glass(E6*2,t+.12,.12)},
    flip:function(){if(!live())return;noise(ctx.currentTime,.09,2600,900,.28,2)},
    /** combo/streak step: rises a fifth each level */
    step:function(n){if(!live())return;glass(E6*Math.pow(1.5,Math.min(n,3)-1)/1.5,ctx.currentTime,.18)},
    /** the brand sound logo at the result moment (synth fallback) */
    logo:function(){
      if(!live())return;var t=ctx.currentTime;
      if(logoBuf){var s=ctx.createBufferSource(),g=ctx.createGain();g.gain.value=.8;s.buffer=logoBuf;s.connect(g);g.connect(master);s.start(t);return}
      noise(t,.85,430,1310,.3,9);glass(E6,t+.9,.3);glass(B6,t+.99,.24);
    }
  };

  var ON='<path d="M3 6h3l4-3v10l-4-3H3z" fill="currentColor"/><path d="M12 5.5a3.5 3.5 0 010 5M13.8 3.5a6 6 0 010 9" fill="none" stroke="currentColor" stroke-width="1.5"/>';
  var OFF='<path d="M3 6h3l4-3v10l-4-3H3z" fill="currentColor"/><path d="M12 6l3.5 4M15.5 6L12 10" stroke="currentColor" stroke-width="1.5"/>';
  var LABEL={az:['Səsi söndür','Səsi aç'],en:['Mute sound','Turn sound on'],ru:['Выключить звук','Включить звук']};
  function lang(){var l=document.documentElement.lang;return LABEL[l]?l:'az'}
  function sync(b){b.innerHTML='<svg viewBox="0 0 18 16" aria-hidden="true">'+(muted?OFF:ON)+'</svg>';b.setAttribute('aria-pressed',String(muted));b.setAttribute('aria-label',LABEL[lang()][muted?1:0]);b.title=b.getAttribute('aria-label')}
  /** adds the mute toggle to a container (the game header) */
  S.button=function(parent){
    var b=document.createElement('button');b.type='button';b.className='snd';sync(b);
    b.addEventListener('click',function(){S.setMuted(!muted);if(!muted){ensure();S.good()}});
    parent.appendChild(b);
    new MutationObserver(function(){sync(b)}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    return b;
  };
  document.addEventListener('visibilitychange',function(){if(document.hidden){S.pourStop();ctx&&ctx.suspend&&ctx.suspend()}else if(ctx&&!muted)ctx.resume()});
  window.MokaSound=S;
})();
