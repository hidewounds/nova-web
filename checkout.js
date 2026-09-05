/* NOVA checkout — Curated 4 plans + 20% yearly */
(function(){
  var PLANS={
    launch:{label:"Launch",m:29,y:278},
    growth:{label:"Growth",m:79,y:758},
    scale:{label:"Scale",m:199,y:1910},
    custom:{label:"Custom",m:499,y:4790}
  };
  var SETUP={launch:99,growth:199,scale:499,custom:999};
  var ADDON_PRICES={
    multi_unlock:{launch:{m:20,y:192}, growth:{m:0,y:0}, scale:{m:0,y:0}, custom:{m:0,y:0}, label:"Multi-Agent Unlock"},
    extra_agent:{launch:{m:25,y:240}, growth:{m:15,y:144}, scale:{m:9,y:86}, custom:{m:0,y:0}, label:"Extra Agent (deprecated — unified)"},
    voice_channel:{launch:{m:29,y:278}, growth:{m:19,y:182}, scale:{m:0,y:0}, custom:{m:0,y:0}, label:"Voice Channel"},
    multilanguage:{launch:{m:15,y:144}, growth:{m:12,y:115}, scale:{m:0,y:0}, custom:{m:0,y:0}, label:"Multi-Language"},
    custom_behaviour:{launch:{m:15,y:144}, growth:{m:12,y:115}, scale:{m:0,y:0}, custom:{m:0,y:0}, label:"Custom Behaviour Pack (5 extra rules)"}
  };
  var plan="growth", cycle="m";
  var addons={multi_unlock:false, extra_agent:0, voice_channel:false, multilanguage:false, custom_behaviour:0};
  try{
    var q=new URLSearchParams(location.search);
    if(PLANS[q.get("plan")]) plan=q.get("plan");
    if(q.get("cycle")==="y"||q.get("cycle")==="m") cycle=q.get("cycle");
    if(q.get("addon_multi")==="1" || q.get("addon_multi_unlock")==="1") addons.multi_unlock=true;
    if(q.get("addon_extra")) addons.extra_agent=Math.max(0, parseInt(q.get("addon_extra"),10)||0);
    if(q.get("addon_voice")==="1") addons.voice_channel=true;
    if(q.get("addon_lang")==="1" || q.get("addon_multilanguage")==="1") addons.multilanguage=true;
    if(q.get("addon_custom")==="1" || q.get("addon_custom_behaviour")==="1") addons.custom_behaviour=1;
    if(q.get("addon_custom_extra")) addons.custom_behaviour=Math.max(0, parseInt(q.get("addon_custom_extra"),10)||1);
    // also handle generic addons param from addons.html
    if(q.get("addon_extra_agent")) addons.extra_agent=Math.max(0, parseInt(q.get("addon_extra_agent"),10)||0);
  }catch(e){}
  // ---- login required for purchase — collect under login ----
  try{
    var loginEmail=null; try{ loginEmail=localStorage.getItem('nova_web_login')||sessionStorage.getItem('nova_web_login'); }catch{}
    if(!loginEmail){
      // redirect to login, preserve checkout params
      var next='checkout.html'+location.search;
      location.href='login.html?next='+encodeURIComponent(next);
      return;
    }
    // prefill form from login
    var loginBiz=null; try{ loginBiz=localStorage.getItem('nova_web_login_biz'); }catch{}
    // also show logged-in banner
    setTimeout(function(){
      var panel=document.getElementById('payPanel');
      if(panel && loginEmail){
        var banner=document.createElement('div');
        banner.style.cssText='margin-bottom:14px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:rgba(16,185,129,.08);font-size:12.5px;display:flex;justify-content:space-between;align-items:center;gap:10px';
        banner.innerHTML='<span>Logged in as <b>'+loginEmail+'</b>'+(loginBiz?' · '+loginBiz:'')+'</span><a href="login.html?next='+encodeURIComponent('checkout.html'+location.search)+'" style="font-size:12px;color:var(--violet);font-weight:700">Switch</a>';
        panel.insertBefore(banner, panel.firstChild);
        var fNameEl=document.getElementById('fName'); var fEmailEl=document.getElementById('fEmail');
        if(fEmailEl && !fEmailEl.value) fEmailEl.value=loginEmail;
        if(fNameEl && loginBiz && !fNameEl.value) fNameEl.value=loginBiz;
        // also store identity for checkout
        try{ var ident=JSON.parse(localStorage.getItem('nova_checkout_identity')||'{}'); ident.email=loginEmail; ident.businessName=loginBiz||ident.businessName; localStorage.setItem('nova_checkout_identity', JSON.stringify(ident)); }catch{}
      }
    }, 300);
  }catch(e){}

  function $(id){return document.getElementById(id);}
  function setCycle(c){
    cycle=c;
    var m=$("cyM"), y=$("cyY");
    if(m&&y){
      m.classList.toggle("on",c==="m");
      y.classList.toggle("on",c==="y");
      if(m.classList.contains("on")){ m.style.background="#eff6ff"; m.style.borderColor="#2563eb"; m.style.color="#1d4ed8"; }
      else { m.style.background=""; m.style.borderColor=""; m.style.color=""; }
      if(y.classList.contains("on")){ y.style.background="#ecfdf5"; y.style.borderColor="#10b981"; y.style.color="#059669"; }
      else { y.style.background=""; y.style.borderColor=""; y.style.color=""; }
      var pm=document.getElementById("cycM"); var py=document.getElementById("cycY");
      if(pm) pm.classList.toggle("on",c==="m");
      if(py) py.classList.toggle("on",c==="y");
    }
    ["launch","growth","scale","custom"].forEach(function(p){
      var el=$("op-"+p);
      if(!el) return;
      if(p==="custom"){ el.textContent="Custom"; }
      else el.textContent="$"+PLANS[p][c==="y"?"y":"m"]+(c==="y"?"/yr":"/mo");
    });
    render();
  }
  window.setCycle=setCycle;

  function pick(p){
    plan=p;
    document.querySelectorAll(".pill-opt").forEach(function(el){
      var on=el.getAttribute("data-plan")===p;
      el.classList.toggle("on",on);
      var inp=el.querySelector("input");
      if(inp) inp.checked=on;
    });
    render();
  }

  function addonTotal(){
    var total=0;
    var per=cycle;
    if(addons.multi_unlock) total+=ADDON_PRICES.multi_unlock[plan][per];
    if(addons.extra_agent) total+=ADDON_PRICES.extra_agent[plan][per]*addons.extra_agent;
    if(addons.voice_channel) total+=ADDON_PRICES.voice_channel[plan][per];
    if(addons.multilanguage) total+=ADDON_PRICES.multilanguage[plan][per];
    if(addons.custom_behaviour) total+=ADDON_PRICES.custom_behaviour[plan][per]*addons.custom_behaviour;
    return total;
  }

  function render(){
    var P=PLANS[plan];
    var per=cycle==="y"?"/yr":"/mo";
    var setupIncluded=cycle==="y";
    var sPlan=$("sPlan"), sSub=$("sSub"), sSetup=$("sSetup"), sDisc=$("sDisc"), sThen=$("sThen"), payBtn=$("payBtn"), sAddons=$("sAddons");
    if(sPlan) sPlan.textContent=P.label+" plan ("+(cycle==="y"?"yearly":"monthly")+")";
    if(sSub) sSub.textContent= plan==="custom" ? "Custom" : "$"+P[cycle]+per;
    // add-ons list
    if(sAddons){
      var html="";
      var per2=per;
      if(addons.multi_unlock){
        var pr=ADDON_PRICES.multi_unlock[plan][cycle];
        if(pr===0) html+='<div class="sumrow" style="color:#10b981"><span>Multi-Agent Unlock</span><span>Included</span></div>';
        else html+='<div class="sumrow"><span>Multi-Agent Unlock</span><span>+$'+pr+per2+'</span></div>';
      }
      if(addons.extra_agent){
        var up=ADDON_PRICES.extra_agent[plan][cycle];
        if(up!==0) html+='<div class="sumrow"><span>Extra Agent ×'+addons.extra_agent+'</span><span>+$'+(up*addons.extra_agent)+per2+'</span></div>';
        else html+='<div class="sumrow" style="color:#10b981"><span>Extra Agent ×'+addons.extra_agent+'</span><span>Included</span></div>';
      }
      if(addons.voice_channel){
        var vp=ADDON_PRICES.voice_channel[plan][cycle];
        if(vp===0) html+='<div class="sumrow" style="color:#10b981"><span>Voice Channel</span><span>Included</span></div>';
        else html+='<div class="sumrow"><span>Voice Channel</span><span>+$'+vp+per2+'</span></div>';
      }
      if(addons.multilanguage){
        var lp=ADDON_PRICES.multilanguage[plan][cycle];
        if(lp===0) html+='<div class="sumrow" style="color:#10b981"><span>Multi-Language</span><span>Included</span></div>';
        else html+='<div class="sumrow"><span>Multi-Language</span><span>+$'+lp+per2+'</span></div>';
      }
      if(addons.custom_behaviour){
        var cp=ADDON_PRICES.custom_behaviour[plan][cycle];
        if(cp===0) html+='<div class="sumrow" style="color:#10b981"><span>Custom Behaviour ×'+addons.custom_behaviour+'</span><span>Included</span></div>';
        else html+='<div class="sumrow"><span>Custom Behaviour Pack ×'+addons.custom_behaviour+'</span><span>+$'+(cp*addons.custom_behaviour)+per2+'</span></div>';
      }
      sAddons.innerHTML=html;
    }
    if(sSetup){
      sSetup.textContent=setupIncluded?"Included ✓":"$"+SETUP[plan]+" (waived during trial)";
      sSetup.style.color=setupIncluded?"#059669":"var(--mut-2)";
      sSetup.style.fontWeight=setupIncluded?"700":"500";
    }
    var base=P[cycle];
    var addT=addonTotal();
    var total=base+addT;
    if(sDisc) sDisc.textContent= plan==="custom" ? "Custom" : total;
    if(sThen) sThen.textContent= plan==="custom" ? "Bespoke — book a call for pricing" : "Then $"+ (PLANS[plan].m + (function(){ var a=0; if(addons.multi_unlock) a+=ADDON_PRICES.multi_unlock[plan].m; if(addons.extra_agent) a+=ADDON_PRICES.extra_agent[plan].m*addons.extra_agent; if(addons.voice_channel) a+=ADDON_PRICES.voice_channel[plan].m; if(addons.multilanguage) a+=ADDON_PRICES.multilanguage[plan].m; if(addons.custom_behaviour) a+=ADDON_PRICES.custom_behaviour[plan].m*addons.custom_behaviour; return a; })()) +"/mo starting day 15"+(setupIncluded?" · Annual billing — you save 2 months.":" · Cancel anytime before that and pay nothing.");
    if(payBtn) payBtn.textContent= plan==="custom" ? "Book a Call — bespoke" : "Start free trial — $0.00 today" + (addT ? " · then $"+total+per : "");
    try{
      var qs=new URLSearchParams({plan:plan, cycle:cycle});
      if(addons.multi_unlock) qs.set("addon_multi","1");
      if(addons.extra_agent) qs.set("addon_extra", String(addons.extra_agent));
      if(addons.voice_channel) qs.set("addon_voice","1");
      if(addons.multilanguage) qs.set("addon_lang","1");
      if(addons.custom_behaviour) qs.set("addon_custom", String(addons.custom_behaviour));
      history.replaceState(null,"","?"+qs.toString());
    }catch(e){}
  }

  document.querySelectorAll(".pill-opt").forEach(function(el){
    el.addEventListener("click", function(){ pick(el.getAttribute("data-plan")); });
  });

  var fCard=$("fCard"), fExp=$("fExp"), fCvc=$("fCvc");
  if(fCard){
    fCard.addEventListener("input", function(){
      var v=this.value.replace(/\D/g,"").slice(0,16);
      this.value=v.replace(/(.{4})/g,"$1 ").trim();
    });
  }
  if(fExp){
    fExp.addEventListener("input", function(){
      var v=this.value.replace(/\D/g,"").slice(0,4);
      this.value=v.length>2? v.slice(0,2)+"/"+v.slice(2): v;
    });
  }
  if(fCvc){
    fCvc.addEventListener("input", function(){ this.value=this.value.replace(/\D/g,"").slice(0,4); });
  }

  var form=$("payForm");
  if(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var bad=[];
      var fName=$("fName"), fEmail=$("fEmail");
      if(!fName.value.trim()) bad.push(fName);
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fEmail.value)) bad.push(fEmail);
      if(fCard.value.replace(/\D/g,"").length<15) bad.push(fCard);
      if(!/^\d\d\/\d\d$/.test(fExp.value)) bad.push(fExp);
      if(fCvc.value.length<3) bad.push(fCvc);
      if(bad.length){
        bad.forEach(function(f){
          f.classList.add("error");
          f.style.borderColor="#ef4444";
          setTimeout(function(){ f.style.borderColor=""; f.classList.remove("error"); },1800);
        });
        bad[0].focus();
        form.animate([{transform:"translateX(0)"},{transform:"translateX(6px)"},{transform:"translateX(-6px)"},{transform:"translateX(0)"}],{duration:320, easing:"ease"});
        return;
      }
      var btn=$("payBtn");
      btn.disabled=true;
      btn.textContent="Processing…";
      btn.style.opacity=".7";
      setTimeout(function(){
        form.style.display="none";
        var head=document.querySelector("h3[style*='margin-bottom:4px']");
        if(head) head.style.display="none";
        document.getElementById("okPanel").style.display="block";
        var msg=document.getElementById("okMsg");
        var addT=addonTotal();
        var total=PLANS[plan][cycle]+addT;
        if(msg) msg.textContent="Your 14-day free trial for "+PLANS[plan].label+" ("+(cycle==="y"?"yearly":"monthly")+")"+(addT?" + add-ons ($"+addT+"/"+(cycle==="y"?"yr":"mo")+")":"")+" has started. Total $"+total+"/"+(cycle==="y"?"yr":"mo")+" after trial. Our team will reach out within hours.";
        // store purchased for portal demo + under login for identification
        try{
          if(addons.extra_agent || addons.voice_channel || addons.multilanguage || addons.multi_unlock){
            let p=JSON.parse(localStorage.getItem("nova_purchased_roles")||"[]");
            if(addons.extra_agent && !p.includes("sales")) p.push("sales");
            if(addons.voice_channel && !p.includes("voice_receptionist")) p.push("voice_receptionist");
            localStorage.setItem("nova_purchased_roles", JSON.stringify(p));
            localStorage.setItem("nova_purchased_addons", JSON.stringify(addons));
          }
          // collect under login — easier to identify
          var loginEmail=null; try{ loginEmail=localStorage.getItem('nova_web_login')||sessionStorage.getItem('nova_web_login'); }catch{}
          if(loginEmail){
            var purchase={email:document.getElementById('fEmail').value.trim(), name:document.getElementById('fName').value.trim(), business:(function(){ try{ return localStorage.getItem('nova_web_login_biz')||""; }catch{ return ""; }})(), plan:plan, cycle:cycle, addons:JSON.parse(JSON.stringify(addons)), at:Date.now(), total:total};
            try{ localStorage.setItem('nova_purchase_'+loginEmail, JSON.stringify(purchase)); }catch{}
            try{ localStorage.setItem('nova_checkout_identity', JSON.stringify({email:loginEmail, businessName:purchase.business, plan:plan, at:Date.now()})); }catch{}
            try{ var list=JSON.parse(localStorage.getItem('nova_purchases')||'[]'); list.push(purchase); localStorage.setItem('nova_purchases', JSON.stringify(list)); }catch{}
            // also report to NOVA AI for admin visibility (best-effort)
            try{
              var key="nova_pk_40d32c478e27559616acfd7827347d437b1c207d3d9f1e1c0375759d81bbb6da";
              fetch("http://127.0.0.1:3000/api/v1/behavior",{method:"POST",headers:{"Content-Type":"application/json","x-nova-key":key},body:JSON.stringify({eventType:"purchase", customerId:loginEmail, eventData:{plan:plan, cycle:cycle, total:total, email:loginEmail}})});
            }catch{}
          }
        }catch(e){}
        window.scrollTo({top:0, behavior:"smooth"});
      }, 1300);
    });
  }

  setCycle(cycle);
  pick(plan);
  // also render addons after pick
  render();
})();
