/* NOVA - CRAZY DARK interactions: cursor glow, magnetic, ticker, parallax, tilt, drag */
(function(){
  var SERVER="https://nova-ai-omega-lemon.vercel.app";
  var KEY="nova_pk_40d32c478e27559616acfd7827347d437b1c207d3d9f1e1c0375759d81bbb6da";
  function inject(src){
    if(document.querySelector('script[src*="'+src+'"]')) return;
    if(src.indexOf('nova-widget')!==-1 && document.getElementById('nova-widget')) return;
    if(src.indexOf('nova-tracker')!==-1 && window.NOVATracker) return;
    var s=document.createElement("script");
    s.src=SERVER.replace(/\/$/,"")+src;
    s.setAttribute("data-public-key",KEY);
    s.setAttribute("data-api",SERVER);
    s.async=true; document.body.appendChild(s);
  }
  inject("/widget/nova-tracker.js");
  inject("/widget/nova-widget.js");

  // nav scroll + hide on down
  var nav=document.querySelector(".nav");
  if(nav){
    var lastY=scrollY;
    var onScroll=function(){
      nav.classList.toggle("scrolled", scrollY>16);
      if(scrollY>lastY && scrollY>120) nav.classList.add("hide"); else nav.classList.remove("hide");
      lastY=scrollY;
    };
    addEventListener("scroll", onScroll,{passive:true}); onScroll();
  }
  // drawer
  var ham=document.getElementById("ham"), drawer=document.getElementById("drawer");
  if(ham&&drawer){
    ham.addEventListener("click",function(){
      var open=drawer.classList.toggle("open");
      ham.classList.toggle("on",open);
      ham.setAttribute("aria-expanded", open?"true":"false");
      document.body.style.overflow=open?"hidden":"";
    });
    drawer.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){drawer.classList.remove("open");ham.classList.remove("on");document.body.style.overflow="";});});
  }

  // reveal with blur
  var els=document.querySelectorAll(".rv");
  if("IntersectionObserver" in window && els.length){
    var io=new IntersectionObserver(function(ents){
      ents.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} });
    },{threshold:.14, rootMargin:"0px 0px -40px 0px"});
    els.forEach(function(el){
      var siblings=el.parentElement?el.parentElement.querySelectorAll(".rv"):null;
      if(siblings && siblings.length>1){
        var idx=[].indexOf.call(siblings, el);
        el.style.transitionDelay=(Math.min(idx,6)*70)+"ms";
      }
      io.observe(el);
    });
  } else { els.forEach(function(e){e.classList.add("in");}); }

  // cursor glow - desktop only
  var glow=document.createElement("div"); glow.className="cursor-glow"; document.body.appendChild(glow);
  var isTouch = 'ontouchstart' in window;
  if(!isTouch){
    var mx=0,my=0, gx=0,gy=0, raf=null;
    addEventListener("mousemove",function(e){ mx=e.clientX; my=e.clientY; glow.style.opacity="1"; if(!raf) raf=requestAnimationFrame(tick); });
    addEventListener("mouseleave",function(){ glow.style.opacity="0"; });
    function tick(){
      gx += (mx-gx)*0.12; gy += (my-gy)*0.12;
      glow.style.left=gx+"px"; glow.style.top=gy+"px";
      if(Math.abs(mx-gx)>0.5 || Math.abs(my-gy)>0.5) raf=requestAnimationFrame(tick); else raf=null;
    }
  } else {
    glow.style.display="none";
  }

  // magnetic buttons - Framer inspo
  document.querySelectorAll(".btn").forEach(function(btn){
    if(isTouch) return;
    btn.addEventListener("mousemove",function(e){
      var r=btn.getBoundingClientRect();
      var x=e.clientX - r.left, y=e.clientY - r.top;
      btn.style.setProperty("--x", x+"px");
      btn.style.setProperty("--y", y+"px");
      var cx=r.left + r.width/2, cy=r.top + r.height/2;
      var dx=(e.clientX - cx)*0.14, dy=(e.clientY - cy)*0.22;
      btn.style.transform="translate("+dx+"px,"+dy+"px)";
    });
    btn.addEventListener("mouseleave",function(){
      btn.style.transform="";
    });
  });

  // 3D tilt cards - subtle Framer liquid glass
  document.querySelectorAll(".card, .shot, .plan").forEach(function(card){
    if(isTouch) return;
    card.addEventListener("mousemove",function(e){
      var r=card.getBoundingClientRect();
      var x=(e.clientX - r.left)/r.width - .5;
      var y=(e.clientY - r.top)/r.height - .5;
      card.style.transform="perspective(1000px) rotateY("+(x*6)+"deg) rotateX("+(-y*6)+"deg) translateY(-6px)";
    });
    card.addEventListener("mouseleave",function(){ card.style.transform=""; });
  });

  // parallax orbs
  var orbs=document.querySelectorAll(".orb");
  if(orbs.length && !isTouch){
    addEventListener("scroll",function(){
      var y=scrollY;
      orbs.forEach(function(o,i){
        var speed=0.04 + i*0.02;
        o.style.transform="translateY("+(y*speed)+"px)";
      });
    },{passive:true});
  }

  // number ticker - Squarespace stats
  function animateCount(el){
    var target=parseInt(el.getAttribute("data-count"),10);
    if(isNaN(target)) return;
    var suffix=el.getAttribute("data-suffix")||"";
    var cur=0, steps=60, inc=target/steps, t=0;
    var timer=setInterval(function(){
      t++; cur+=inc;
      if(t>=steps){ cur=target; clearInterval(timer); }
      el.textContent=(target>=1000? Math.round(cur).toLocaleString(): Math.round(cur))+suffix;
    },16);
  }
  var counters=document.querySelectorAll("[data-count]");
  if(counters.length && "IntersectionObserver" in window){
    var cio=new IntersectionObserver(function(ents){
      ents.forEach(function(e){
        if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); }
      });
    },{threshold:.6});
    counters.forEach(function(c){cio.observe(c);});
  }

  // hero typewriter for prompt input
  var promptInput=document.getElementById("heroPrompt");
  if(promptInput){
    var phrases=["Ask about booking tomorrow...","Do you have size 42?","Recover my abandoned cart","Show running shoes under $100"];
    var pi=0, ci=0, del=false, hold=0;
    function type(){
      var cur=phrases[pi];
      if(!del){
        promptInput.placeholder=cur.slice(0,ci+1);
        ci++;
        if(ci===cur.length){ del=true; hold=18; }
      } else {
        if(hold>0){ hold--; }
        else {
          promptInput.placeholder=cur.slice(0,ci-1);
          ci--;
          if(ci===0){ del=false; pi=(pi+1)%phrases.length; }
        }
      }
      setTimeout(type, del? (hold?90:40) : 85);
    }
    type();
  }

  // showcase horizontal drag - Squarespace carousel
  document.querySelectorAll(".showcase-track").forEach(function(track){
    var isDown=false, startX, scrollLeft;
    track.addEventListener("mousedown",function(e){ isDown=true; track.classList.add("dragging"); startX=e.pageX - track.offsetLeft; scrollLeft=track.scrollLeft; });
    track.addEventListener("mouseleave",function(){ isDown=false; track.classList.remove("dragging"); });
    track.addEventListener("mouseup",function(){ isDown=false; track.classList.remove("dragging"); });
    track.addEventListener("mousemove",function(e){
      if(!isDown) return;
      e.preventDefault();
      var x=e.pageX - track.offsetLeft;
      var walk=(x - startX)*1.6;
      track.scrollLeft=scrollLeft - walk;
    });
    // touch
    track.addEventListener("touchstart",function(e){ startX=e.touches[0].pageX - track.offsetLeft; scrollLeft=track.scrollLeft; },{passive:true});
    track.addEventListener("touchmove",function(e){
      var x=e.touches[0].pageX - track.offsetLeft;
      var walk=(x - startX)*1.6;
      track.scrollLeft=scrollLeft - walk;
    },{passive:true});
    // auto scroll slowly
    var auto=setInterval(function(){ if(!isDown && track.matches(":hover")===false){ track.scrollLeft+=0.35; if(track.scrollLeft+track.clientWidth>=track.scrollWidth-2) track.scrollLeft=0; } },16);
    track.addEventListener("mouseenter",function(){ clearInterval(auto); });
  });

  // agent pipeline active cycle - Emergent + Framer
  var nodes=document.querySelectorAll(".pipeline .node");
  if(nodes.length){
    var ni=0;
    setInterval(function(){
      nodes.forEach(function(n){n.classList.remove("active");});
      nodes[ni].classList.add("active");
      ni=(ni+1)%nodes.length;
    },1400);
  }

  // hero chat demo - keep previous but enhanced
  var chat=document.getElementById("liveChat");
  if(chat){
    var steps=[
      {who:"a", tag:"grounded answer", text:"Hey! I'm Nova - running shoes under $100? Runner Pro restocked, or I can show your budget picks."},
      {who:"u", text:"Do you have size 42?"},
      {who:"a", tag:"remembers you", text:"Yes - 7-12 in stock. You left 42 in cart - hold it? 🛒"},
      {who:"u", text:"Book me tomorrow 3pm?"},
      {who:"a", tag:"chrono live", text:"Held tomorrow 3:00 PM for 5 min. Confirm to book?"}
    ];
    var cont=chat.querySelector(".bubbles");
    if(cont){
      var idx=0;
      function add(s, d){
        setTimeout(function(){
          var b=document.createElement("div");
          b.className="bubble "+s.who;
          b.innerHTML=s.tag?'<span class="tag">'+s.tag+'</span>'+s.text:s.text;
          b.style.opacity="0"; b.style.transform="translateY(8px)";
          cont.appendChild(b);
          requestAnimationFrame(function(){ b.style.transition=".4s var(--ease)"; b.style.opacity="1"; b.style.transform="none"; });
          cont.scrollTop=cont.scrollHeight;
          if(cont.children.length>6) cont.removeChild(cont.firstChild);
        },d);
      }
      function loop(){
        if(!cont) return;
        cont.innerHTML="";
        var t=400;
        steps.forEach(function(s,i){ t+= i? 1500:0; add(s,t); });
        setTimeout(loop, t+4000);
      }
      loop();
      chat.querySelectorAll(".chip").forEach(function(c){
        c.addEventListener("click",function(){
          var b=document.createElement("div"); b.className="bubble u"; b.textContent=c.textContent;
          cont.appendChild(b); cont.scrollTop=cont.scrollHeight;
          setTimeout(function(){
            var r=document.createElement("div"); r.className="bubble a"; r.innerHTML='<span class="tag">grounded answer</span>Got it - handling "'+c.textContent+'" with your live knowledge.';
            cont.appendChild(r); cont.scrollTop=cont.scrollHeight;
          },700);
        });
      });
      var send=chat.querySelector("#chatSend");
      var inp=chat.querySelector("#chatInput");
      if(send && inp){
        function sendMsg(){
          var v=inp.value.trim(); if(!v) return;
          var b=document.createElement("div"); b.className="bubble u"; b.textContent=v;
          cont.appendChild(b); inp.value=""; cont.scrollTop=cont.scrollHeight;
          setTimeout(function(){
            var r=document.createElement("div"); r.className="bubble a"; r.innerHTML='<span class="tag">grounded answer</span>On it - checked your store & memory. Want me to confirm details?';
            cont.appendChild(r); cont.scrollTop=cont.scrollHeight;
          },700);
        }
        send.addEventListener("click",sendMsg);
        inp.addEventListener("keydown",function(e){ if(e.key==="Enter") sendMsg(); });
      }
    }
  }

  // marquee duplicate
  document.querySelectorAll(".marquee-track").forEach(function(t){
    if(t.dataset.cloned) return;
    t.dataset.cloned="1";
    t.innerHTML+=t.innerHTML;
  });

  // FAQ single open
  document.querySelectorAll("details").forEach(function(d){
    d.addEventListener("toggle",function(){ if(d.open) document.querySelectorAll("details").forEach(function(o){ if(o!==d) o.removeAttribute("open"); }); });
  });

  // year
  var y=document.getElementById("yr"); if(y) y.textContent=new Date().getFullYear();
})();

