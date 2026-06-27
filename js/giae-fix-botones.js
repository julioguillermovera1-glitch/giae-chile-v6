/* GIAE Chile v3.2.5.3 · Fix seguro de botones
   Creador y Autor Principal: Julio Vera Concha
   Objetivo: reactivar navegación si los handlers originales no quedan enlazados.
   No modifica motores eléctricos ni normativa. */
(function(){
  "use strict";

  function log(msg){
    try{ console.info("[GIAE Fix Botones]", msg); }catch(e){}
  }

  function existe(fn){
    return typeof window[fn] === "function";
  }

  function abrirModuloSeguro(id){
    if(!id) return;
    try{
      if(typeof window.openModule === "function"){
        window.openModule(id);
        return;
      }
    }catch(e){
      console.error("[GIAE Fix Botones] Error openModule:", e);
    }

    const view = document.getElementById("moduleView");
    if(view){
      view.className = "module-view show ready";
      view.innerHTML = "<span class='badge ready'>Módulo</span><h2>" + id + "</h2><p>El módulo fue solicitado, pero el motor principal todavía no terminó de cargar.</p>";
    }
  }

  function reactivarBotones(){
    const nav = document.getElementById("mainMenu");
    const quick = document.getElementById("quickActions");

    try{
      if(nav && nav.children.length === 0 && typeof window.renderMenu === "function"){
        window.renderMenu();
      }
      if(quick && quick.children.length === 0 && typeof window.renderQuick === "function"){
        window.renderQuick();
      }
      if(typeof window.renderEngines === "function"){
        const grid = document.getElementById("engineGrid");
        if(grid && grid.children.length === 0) window.renderEngines();
      }
      if(typeof window.renderRIC === "function"){
        const ric = document.getElementById("ricGrid");
        if(ric && ric.children.length === 0) window.renderRIC();
      }
    }catch(e){
      console.warn("[GIAE Fix Botones] Render preventivo falló:", e);
    }

    document.querySelectorAll(".nav-btn").forEach(btn=>{
      if(btn.dataset.giaeFix === "1") return;
      btn.dataset.giaeFix = "1";
      btn.addEventListener("click", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        abrirModuloSeguro(this.dataset.id || this.dataset.target);
      }, true);
    });

    document.querySelectorAll(".quick").forEach(btn=>{
      if(btn.dataset.giaeFix === "1") return;
      btn.dataset.giaeFix = "1";
      btn.addEventListener("click", function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        const target = this.dataset.target;
        if(target === "demo"){
          abrirModuloSeguro("proyecto");
          setTimeout(function(){
            try{
              if(typeof window.cargarDemoProyecto === "function") window.cargarDemoProyecto();
            }catch(e){}
          },120);
        }else{
          abrirModuloSeguro(target);
        }
      }, true);
    });

    log("Botones revisados y reactivados.");
  }

  function instalarDelegadoGlobal(){
    if(document.body?.dataset.giaeDelegadoBotones === "1") return;
    if(document.body) document.body.dataset.giaeDelegadoBotones = "1";

    document.addEventListener("click", function(ev){
      const navBtn = ev.target.closest && ev.target.closest(".nav-btn");
      if(navBtn){
        ev.preventDefault();
        abrirModuloSeguro(navBtn.dataset.id || navBtn.dataset.target);
        return;
      }

      const quick = ev.target.closest && ev.target.closest(".quick");
      if(quick){
        ev.preventDefault();
        const target = quick.dataset.target;
        if(target === "demo"){
          abrirModuloSeguro("proyecto");
          setTimeout(function(){
            try{
              if(typeof window.cargarDemoProyecto === "function") window.cargarDemoProyecto();
            }catch(e){}
          },120);
        }else{
          abrirModuloSeguro(target);
        }
      }
    }, false);
  }

  function iniciar(){
    instalarDelegadoGlobal();
    reactivarBotones();
    setTimeout(reactivarBotones, 250);
    setTimeout(reactivarBotones, 1000);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", iniciar);
  }else{
    iniciar();
  }

  window.GIAE_FIX_BOTONES_3253 = {
    version: "3.2.5.3",
    reactivar: reactivarBotones
  };
})();
