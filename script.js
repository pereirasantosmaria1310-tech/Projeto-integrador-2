/* === 1. PALETA === */
const ESPECTRO = [
  { nome:"Vermelho", hex:"#E63946", rgb:[230,57,70],   lambda:"~700 nm", desc:"Maior comprimento de onda, menor energia." },
  { nome:"Laranja",  hex:"#F77F00", rgb:[247,127,0],  lambda:"~620 nm", desc:"Transição entre vermelho e amarelo." },
  { nome:"Amarelo",  hex:"#FCBF49", rgb:[252,191,73], lambda:"~580 nm", desc:"Alta luminosidade, muito sensível ao olho." },
  { nome:"Verde",    hex:"#2A9D8F", rgb:[42,157,143], lambda:"~530 nm", desc:"Centro do espectro visível." },
  { nome:"Azul",     hex:"#0077B6", rgb:[0,119,182],  lambda:"~470 nm", desc:"Alta energia, comprimento curto." },
  { nome:"Anil",     hex:"#5A189A", rgb:[90,24,154],  lambda:"~430 nm", desc:"Entre azul e violeta." },
  { nome:"Violeta",  hex:"#9D4EDD", rgb:[157,78,221], lambda:"~400 nm", desc:"Menor comprimento, maior energia." },
  { nome:"Rosa",     hex:"#E91E63", rgb:[233,30,99],  lambda:"extra",  desc:"Cor extrassistêmica (mistura)." },
  { nome:"Ciano",    hex:"#00BCD4", rgb:[0,188,212],  lambda:"extra",  desc:"Mistura aditiva de verde e azul." },
  { nome:"Lima",     hex:"#CDDC39", rgb:[205,220,57], lambda:"extra",  desc:"Mistura aditiva de verde e amarelo." },
  { nome:"Pêssego",  hex:"#FFAB91", rgb:[255,171,145],lambda:"extra",  desc:"Tom claro entre vermelho e laranja." },
  { nome:"Lavanda",  hex:"#B39DDB", rgb:[179,157,219],lambda:"extra",  desc:"Tom claro entre violeta e branco." }
];

/* === 2. ESTADO E DOM === */
let velocidade = 50, numCores = 7, pausado = false;
const velInput = document.getElementById('velocidade');
const coresInput = document.getElementById('num-cores');
const velValor = document.getElementById('vel-valor');
const coresValor = document.getElementById('cores-valor');
const btnPausarDisco = document.getElementById('btn-pausar-disco');
const btnResetDisco = document.getElementById('btn-reset-disco');
const freqFusao = document.getElementById('freq-fusao');
const estadoDisco = document.getElementById('estado-disco');
const corSwatch = document.getElementById('cor-swatch');
const corNome = document.getElementById('cor-nome');
const corDesc = document.getElementById('cor-desc');
const corDisplay = document.getElementById('cor-display');

function atualizarDisplays(){
  velValor.textContent = velocidade;
  coresValor.textContent = numCores;
  freqFusao.textContent = (velocidade/60).toFixed(1)+' Hz';
  if(pausado) estadoDisco.textContent='Pausado';
  else if(velocidade===0) estadoDisco.textContent='Parado';
  else if(velocidade>=1500) estadoDisco.textContent='Branco Puro';
  else if(velocidade>=800) estadoDisco.textContent='Fundindo...';
  else estadoDisco.textContent='Girando';
}
velInput.addEventListener('input', e=>{ velocidade=parseInt(e.target.value); atualizarDisplays(); });
coresInput.addEventListener('input', e=>{ numCores=parseInt(e.target.value); atualizarDisplays(); });
btnPausarDisco.addEventListener('click', ()=>{ pausado=!pausado; btnPausarDisco.textContent=pausado?'▶ Retomar':'⏸ Pausar'; atualizarDisplays(); });
btnResetDisco.addEventListener('click', ()=>{ velocidade=50; numCores=7; pausado=false; velInput.value=50; coresInput.value=7; btnPausarDisco.textContent='⏸ Pausar'; atualizarDisplays(); });
atualizarDisplays();

/* === 3. DISCO PERFEITO + FUSÃO AO BRANCO PURO === */
const discoSketch = (p)=>{
  let angulo=0, raio=170;
  p.setup = ()=>{
    const w = Math.min(document.getElementById('disco-canvas-wrapper').offsetWidth-20, 460);
    p.createCanvas(w,400).parent('disco-canvas-wrapper');
    raio = Math.min(w,400)/2 - 20;
    p.angleMode(p.RADIANS);
  };
  p.draw = ()=>{
    p.clear();
    p.translate(p.width/2, p.height/2);
    if(!pausado && !document.documentElement.classList.contains('pausado')) angulo += (velocidade/60)*0.05;

    let fatorFusao = 0;
    if(velocidade>800) fatorFusao = p.constrain(p.map(velocidade,800,1500,0,1),0,1);

    const angSetor = p.TWO_PI/numCores;
    let hoverIndex = -1;
    p.rotate(angulo);

    if(fatorFusao>=1){
      p.noStroke(); p.fill(255,255,255); p.circle(0,0,raio*2);
    } else {
      for(let i=0;i<numCores;i++){
        const c = ESPECTRO[i%ESPECTRO.length];
        p.fill(p.lerp(c.rgb[0],255,fatorFusao), p.lerp(c.rgb[1],255,fatorFusao), p.lerp(c.rgb[2],255,fatorFusao));
        p.noStroke();
        p.arc(0,0,raio*2,raio*2, i*angSetor, (i+1)*angSetor, p.PIE);
      }
      if(fatorFusao<0.95){
        p.stroke(255,255,255,p.lerp(60,0,fatorFusao)); p.strokeWeight(1);
        for(let i=0;i<numCores;i++){ const a=i*angSetor; p.line(0,0,p.cos(a)*raio,p.sin(a)*raio); }
      }
    }

    p.noFill(); p.stroke(255,255,255,90); p.strokeWeight(2); p.circle(0,0,raio*2);
    p.noStroke(); p.fill(250,245,234); p.circle(0,0,raio*0.14);
    p.fill(14,34,51); p.circle(0,0,raio*0.05);

    if(fatorFusao<0.8){
      const mx=p.mouseX-p.width/2, my=p.mouseY-p.height/2;
      const rx=mx*p.cos(-angulo)-my*p.sin(-angulo), ry=mx*p.sin(-angulo)+my*p.cos(-angulo);
      const dist=p.sqrt(rx*rx+ry*ry);
      if(dist<=raio && dist>raio*0.1){
        let mA=p.atan2(ry,rx); if(mA<0) mA+=p.TWO_PI;
        const idx=p.floor(mA/angSetor);
        if(idx>=0 && idx<numCores){
          hoverIndex=idx;
          p.push(); p.fill(255,255,255,100); p.noStroke();
          p.arc(0,0,raio*2,raio*2, idx*angSetor, (idx+1)*angSetor, p.PIE); p.pop();
        }
      }
    }

    if(hoverIndex>=0){
      const c=ESPECTRO[hoverIndex%ESPECTRO.length];
      corSwatch.style.background=c.hex;
      corNome.textContent=c.nome+' ('+c.lambda+')';
      corDesc.textContent=c.desc;
      corDisplay.classList.add('ativa');
    } else if(fatorFusao>=0.8){
      corSwatch.style.background='#FFFFFF';
      corNome.textContent='Branco Puro (Síntese Aditiva)';
      corDesc.textContent='As cores se fundiram completamente devido à alta velocidade.';
      corDisplay.classList.add('ativa');
    } else {
      corSwatch.style.background='#333';
      corNome.textContent='Passe o mouse sobre o disco';
      corDesc.textContent='Cada fatia corresponde a uma cor do espectro visível.';
      corDisplay.classList.remove('ativa');
    }
  };
  p.windowResized = ()=>{
    const w=Math.min(document.getElementById('disco-canvas-wrapper').offsetWidth-20,460);
    p.resizeCanvas(w,400); raio=Math.min(w,400)/2-20;
  };
};
new p5(discoSketch);

/* === 4. MENU MOBILE === */
const btnMenu=document.getElementById('botao-menu'), menu=document.getElementById('menu-principal');
btnMenu.addEventListener('click',()=>{ const a=menu.classList.toggle('aberto'); btnMenu.setAttribute('aria-expanded',a); });
menu.querySelectorAll('a').forEach(l=>l.addEventListener('click',()=>{ menu.classList.remove('aberto'); btnMenu.setAttribute('aria-expanded','false'); }));

/* === 5. VOLTAR AO TOPO === */
const voltarTopo=document.getElementById('voltar-topo');
window.addEventListener('scroll',()=>{ voltarTopo.classList.toggle('aparece', window.scrollY>500); });
voltarTopo.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

/* === 6. REVELAR AO ROLAR === */
const obs=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visivel'); }),{threshold:0.1});
document.querySelectorAll('.revelar').forEach(el=>obs.observe(el));

/* === 7. FAQ === */
document.querySelectorAll('.faq-pergunta').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item=btn.parentElement, aberta=item.classList.contains('aberta');
    document.querySelectorAll('.faq-item').forEach(i=>{ i.classList.remove('aberta'); i.querySelector('.faq-pergunta').setAttribute('aria-expanded','false'); });
    if(!aberta){ item.classList.add('aberta'); btn.setAttribute('aria-expanded','true'); }
  });
});

/* === 8. ACESSIBILIDADE === */
let fontSize=100;
document.getElementById('btn-aumentar').addEventListener('click',()=>{ fontSize=Math.min(150,fontSize+10); document.documentElement.style.fontSize=fontSize+'%'; });
document.getElementById('btn-reduzir').addEventListener('click',()=>{ fontSize=Math.max(80,fontSize-10); document.documentElement.style.fontSize=fontSize+'%'; });
document.getElementById('btn-fonte-padrao').addEventListener('click',()=>{ fontSize=100; document.documentElement.style.fontSize='100%'; });
document.getElementById('btn-contraste').addEventListener('click',function(){ this.setAttribute('aria-pressed', document.documentElement.classList.toggle('alto-contraste')); });
document.getElementById('btn-pausar').addEventListener('click',function(){ this.setAttribute('aria-pressed', document.documentElement.classList.toggle('pausado')); });
