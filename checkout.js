/* NOVA checkout — Add-ons Edition */
(function(){
  var PLANS={
    launch:{label:"Launch",m:29,y:290},
    growth:{label:"Growth",m:79,y:790},
    scale:{label:"Scale",m:199,y:1990},
    unlimited:{label:"Unlimited",m:499,y:4990}
  };
  var SETUP={launch:99,growth:199,scale:499,unlimited:999};
  var ADDON_PRICES={
    multi_unlock:{launch:{m:20,y:200}, growth:{m:0,y:0}, scale:{m:0,y:0}, unlimited:{m:0,y:0}, label:"Multi-Agent Unlock"},
    extra_agent:{launch:{m:25,y:250}, growth:{m:15,y:150}, scale:{m:9,y:90}, unlimited:{m:0,y:0}, label:"Extra Agent (deprecated — unified)"},
    voice_channel:{launch:{m:29,y:290}, growth:{m:19,y:190}, scale:{m:12,y:120}, unlimited:{m:0,y:0}, label:"Voice Channel"},
    multilanguage:{launch:{m:15,y:150}, growth:{m:12,y:120}, scale:{m:8,y:80}, unlimited:{m:0,y:0}, label:"Multi-Language"},
    custom_behaviour:{launch:{m:15,y:150}, growth:{m:12,y:120}, scale:{m:9,y:90}, unlimited:{m:0,y:0}, label:"Custom Behaviour Pack (5 extra rules)"}
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
    ["launch","growth","scale","unlimited"].forEach(function(p){
      var el=$("op-"+p);
      if(el) el.textContent="$"+PLANS[p][c==="y"?"y":"m"]+(c==="y"?"/yr":"/mo");
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
    if(sSub) sSub.textContent="$"+P[cycle]+per;
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
    if(sDisc) sDisc.textContent=total;
    if(sThen) sThen.textContent="Then $"+ (PLANS[plan].m + (function(){ var a=0; if(addons.multi_unlock) a+=ADDON_PRICES.multi_unlock[plan].m; if(addons.extra_agent) a+=ADDON_PRICES.extra_agent[plan].m*addons.extra_agent; if(addons.voice_channel) a+=ADDON_PRICES.voice_channel[plan].m; if(addons.multilanguage) a+=ADDON_PRICES.multilanguage[plan].m; if(addons.custom_behaviour) a+=ADDON_PRICES.custom_behaviour[plan].m*addons.custom_behaviour; return a; })()) +"/mo starting day 15"+(setupIncluded?" · Annual billing — you save 2 months.":" · Cancel anytime before that and pay nothing.");
    if(payBtn) payBtn.textContent="Start free trial — $0.00 today" + (addT ? " · then $"+total+per : "");
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
        // store purchased for portal demo
        try{
          if(addons.extra_agent || addons.voice_channel || addons.multilanguage || addons.multi_unlock){
            let p=JSON.parse(localStorage.getItem("nova_purchased_roles")||"[]");
            if(addons.extra_agent && !p.includes("sales")) p.push("sales");
            if(addons.voice_channel && !p.includes("voice_receptionist")) p.push("voice_receptionist");
            localStorage.setItem("nova_purchased_roles", JSON.stringify(p));
            localStorage.setItem("nova_purchased_addons", JSON.stringify(addons));
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
