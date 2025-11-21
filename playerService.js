/* 
  PlayerService - modular custom video player with HLS support and FULLY custom controls.
  Loads hls.js dynamically when needed from esm.sh. Exposes .playItem(item) and .close().
*/
export class PlayerService {
  constructor() {
    this.container = null;
    this.player = null;
    this.hls = null;
    this.current = null;
    this._bound = {};
    this._controls = {};
    this._controlsVisible = true;
    this._hideTimeout = null;
    
    try{
      const saved = localStorage.getItem('player_last_v1');
      if(saved){
        this.lastPlayback = JSON.parse(saved);
      } else {
        this.lastPlayback = null;
      }
    }catch(e){
      this.lastPlayback = null;
    }
  }

  async _loadHls() {
    if (this.hls) return this.hls;
    try {
      const mod = await import('https://esm.sh/hls.js@1.4.8');
      return (this.hls = mod.default ? mod.default : mod);
    } catch (e) {
      return null;
    }
  }

  _createOverlay() {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-video-overlay';
    overlay.setAttribute('role', 'dialog');
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      zIndex: '99999',
      touchAction: 'none'
    });

    const frame = document.createElement('div');
    frame.className = 'fullscreen-video-frame';
    Object.assign(frame.style, {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    });

    const video = document.createElement('video');
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    video.controls = false;
    video.muted = false;
    Object.assign(video.style, {
      background: '#000',
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    });
    video.addEventListener('contextmenu', (e)=> e.preventDefault());

    frame.appendChild(video);

    // ===== CONTROLES CUSTOMIZADOS =====
    
    // Botão Play/Pause Central
    const centerPlay = document.createElement('button');
    centerPlay.type = 'button';
    centerPlay.className = 'player-center-btn';
    centerPlay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>`;
    Object.assign(centerPlay.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'none',
      border: 'none',
      padding: '0',
      cursor: 'pointer',
      zIndex: '100002',
      opacity: '0.9',
      transition: 'opacity 0.2s'
    });

    // Barra de Controles Inferior
    const controlBar = document.createElement('div');
    controlBar.className = 'player-controls';
    Object.assign(controlBar.style, {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
      padding: '20px 15px 15px',
      zIndex: '100001',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'opacity 0.3s, transform 0.3s',
      opacity: '1',
      transform: 'translateY(0)'
    });

    // Barra de Progresso
    const progressContainer = document.createElement('div');
    Object.assign(progressContainer.style, {
      width: '100%',
      height: '4px',
      background: 'rgba(255,255,255,0.12)',
      borderRadius: '2px',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'visible'
    });

    const progressBar = document.createElement('div');
    Object.assign(progressBar.style, {
      width: '0%',
      height: '100%',
      background: 'linear-gradient(90deg,#ff3b3b,#ff8ac2)',
      borderRadius: '2px',
      position: 'relative',
      transition: 'width 0.1s linear'
    });

    const progressThumb = document.createElement('div');
    Object.assign(progressThumb.style, {
      position: 'absolute',
      right: '-6px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '12px',
      height: '12px',
      background: '#ff3b3b',
      borderRadius: '50%',
      boxShadow: '0 0 6px rgba(255,59,59,0.35)'
    });

    progressBar.appendChild(progressThumb);
    progressContainer.appendChild(progressBar);

    // Linha de Controles (play, tempo, volume, fullscreen)
    const controlsRow = document.createElement('div');
    Object.assign(controlsRow.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      color: 'white'
    });

    // Botão Play/Pause
    const playBtn = document.createElement('button');
    playBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>`;
    Object.assign(playBtn.style, {
      background: 'none',
      border: 'none',
      padding: '0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    });

    // Tempo
    const timeLabel = document.createElement('span');
    timeLabel.textContent = '00:00 / 00:00';
    Object.assign(timeLabel.style, {
      fontSize: '14px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      whiteSpace: 'nowrap',
      userSelect: 'none'
    });

    // Spacer
    const spacer = document.createElement('div');
    spacer.style.flex = '1';

    // Volume
    const volumeContainer = document.createElement('div');
    Object.assign(volumeContainer.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    });

    const volumeBtn = document.createElement('button');
    volumeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
    Object.assign(volumeBtn.style, {
      background: 'none',
      border: 'none',
      padding: '0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    });

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '100';
    volumeSlider.value = '100';
    Object.assign(volumeSlider.style, {
      width: '80px',
      height: '4px',
      cursor: 'pointer',
      appearance: 'none',
      background: 'rgba(255,255,255,0.12)',
      borderRadius: '2px',
      outline: 'none'
    });

    // Estilo do thumb do volume
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      input[type="range"].player-volume::-webkit-slider-thumb {
        appearance: none;
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
      }
      input[type="range"].player-volume::-moz-range-thumb {
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        border: none;
        cursor: pointer;
      }
      /* ensure range track looks consistent */
      input[type="range"].player-volume { background: rgba(255,255,255,0.12); height: 4px; }
    `;
    document.head.appendChild(styleSheet);
    volumeSlider.classList.add('player-volume');

    volumeContainer.appendChild(volumeBtn);
    volumeContainer.appendChild(volumeSlider);

    // Botão Fechar
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: 'rgba(0,0,0,0.6)',
      border: 'none',
      padding: '8px',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '100003',
      transition: 'background 0.2s'
    });

    // Montar controles
    controlsRow.appendChild(playBtn);
    controlsRow.appendChild(timeLabel);
    controlsRow.appendChild(spacer);
    controlsRow.appendChild(volumeContainer);

    controlBar.appendChild(progressContainer);
    controlBar.appendChild(controlsRow);

    frame.appendChild(centerPlay);
    frame.appendChild(controlBar);
    frame.appendChild(closeBtn);
    overlay.appendChild(frame);
    document.body.appendChild(overlay);

    // Always attempt to enter browser fullscreen when the overlay is created
    try {
      if (overlay.requestFullscreen) {
        overlay.requestFullscreen().catch(()=>{ /* ignore fullscreen failures */ });
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(()=>{});
      }
    } catch (e) { /* noop */ }

    // Salvar referências
    this.container = overlay;
    this.player = video;
    this._controls = {
      centerPlay,
      controlBar,
      playBtn,
      timeLabel,
      progressContainer,
      progressBar,
      volumeBtn,
      volumeSlider,
      closeBtn,
      progressBarElement: progressBar
    };

    // ===== EVENTOS =====

    // Play/Pause central
    centerPlay.addEventListener('click', (e)=> {
      e.stopPropagation();
      this.togglePlay();
    });

    // Play/Pause botão
    playBtn.addEventListener('click', ()=> this.togglePlay());

    // Progresso - click to seek
    progressContainer.addEventListener('click', (e)=> {
      const rect = progressContainer.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if(this.player && this.player.duration){
        this.player.currentTime = pct * this.player.duration;
      }
    });

    // Dragging thumb seeking (basic mousedown/touch support)
    let dragging = false;
    const startDrag = (clientX) => {
      dragging = true;
      const rect = progressContainer.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if(this.player && this.player.duration){
        this.player.currentTime = pct * this.player.duration;
      }
    };
    const moveDrag = (clientX) => {
      if(!dragging) return;
      startDrag(clientX);
    };
    const endDrag = ()=> { dragging = false; };
    progressThumb.addEventListener('pointerdown', (ev)=> { ev.preventDefault(); startDrag(ev.clientX); window.addEventListener('pointermove', onPointerMove); window.addEventListener('pointerup', onPointerUp); });
    const onPointerMove = (ev)=> moveDrag(ev.clientX);
    const onPointerUp = (ev)=> { endDrag(); window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp); };

    // Volume
    volumeSlider.addEventListener('input', ()=> {
      if(this.player){
        this.player.volume = volumeSlider.value / 100;
        this.player.muted = volumeSlider.value == 0;
      }
    });

    volumeBtn.addEventListener('click', ()=> {
      if(!this.player) return;
      this.player.muted = !this.player.muted;
      volumeSlider.value = this.player.muted ? 0 : Math.round((this.player.volume || 1) * 100);
    });

    // Fechar
    closeBtn.addEventListener('click', ()=> this.close());

    // Mostrar/esconder controles (auto-hide)
    let hideTimer = null;
    const showControls = ()=> {
      controlBar.style.opacity = '1';
      controlBar.style.transform = 'translateY(0)';
      centerPlay.style.opacity = this.player && this.player.paused ? '0.9' : '0';
      
      if(hideTimer) clearTimeout(hideTimer);
      if(this.player && !this.player.paused){
        hideTimer = setTimeout(()=> {
          controlBar.style.opacity = '0';
          controlBar.style.transform = 'translateY(20px)';
          centerPlay.style.opacity = '0';
        }, 3000);
      }
    };

    overlay.addEventListener('mousemove', showControls);
    overlay.addEventListener('touchstart', showControls);
    // clicking on backdrop toggles play/pause (but not when clicking controls)
    overlay.addEventListener('click', (e)=> {
      if(e.target === overlay || e.target === frame || e.target === video){
        this.togglePlay();
      }
    });

    // Player events
    this._bound.ended = ()=> this.close();
    this._bound.error = (e)=> console.error('Video error', e);
    this._bound.timeupdate = ()=> {
      try{
        const cur = this.player.currentTime || 0;
        const dur = this.player.duration || 0;
        const save = {
          id: this.current?.id,
          videoUrl: this.current?.videoUrl,
          title: this.current?.title,
          currentTime: cur,
          duration: dur,
          ts: Date.now()
        };
        localStorage.setItem('player_last_v1', JSON.stringify(save));
      }catch(e){}
      this._updateUI();
    };

    this._bound.play = ()=> {
      const pauseSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
      playBtn.innerHTML = pauseSVG;
      centerPlay.style.opacity = '0';
      showControls();
    };

    this._bound.pause = ()=> {
      const playSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>`;
      playBtn.innerHTML = playSVG;
      centerPlay.style.opacity = '0.9';
      controlBar.style.opacity = '1';
      controlBar.style.transform = 'translateY(0)';
    };

    this.player.addEventListener('ended', this._bound.ended);
    this.player.addEventListener('error', this._bound.error);
    this.player.addEventListener('timeupdate', this._bound.timeupdate);
    this.player.addEventListener('play', this._bound.play);
    this.player.addEventListener('pause', this._bound.pause);

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  _updateUI(){
    if(!this.player || !this._controls) return;
    const cur = this.player.currentTime || 0;
    const dur = this.player.duration || 0;
    const pct = dur > 0 ? (cur / dur) * 100 : 0;
    
    try {
      this._controls.progressBarElement.style.width = pct + '%';
    } catch(e){}
    this._controls.timeLabel.textContent = `${this._formatTime(cur)} / ${this._formatTime(dur)}`;
  }

  _formatTime(s){
    if(!isFinite(s) || s <= 0) return '00:00';
    const sec = Math.floor(s % 60).toString().padStart(2,'0');
    const min = Math.floor((s/60) % 60).toString().padStart(2,'0');
    const hr = Math.floor(s/3600);
    return hr > 0 ? `${hr}:${min}:${sec}` : `${min}:${sec}`;
  }

  togglePlay(){
    if(!this.player) return;
    if(this.player.paused){
      this.player.play().catch(()=>{});
    } else {
      this.player.pause();
    }
  }

  async _toggleFullscreen(){
    try{
      if(document.fullscreenElement){
        await document.exitFullscreen();
      } else if(this.container.requestFullscreen){
        await this.container.requestFullscreen();
      }
    }catch(e){}
  }

  async playItem(item = {}) {
    if(!item || !item.videoUrl) {
      console.warn('PlayerService.playItem: missing videoUrl');
      return;
    }
    this.current = item;
    this._createOverlay();

    const url = item.videoUrl || item.video;
    const isHls = url && (url.endsWith('.m3u8') || url.includes('.m3u8'));

    try{ this.player.muted = false; }catch(e){}

    if(isHls){
      const HlsLib = await this._loadHls();
      if(HlsLib && HlsLib.isSupported()){
        try{
          this.hlsInstance = new HlsLib({ maxBufferLength: 30 });
          this.hlsInstance.attachMedia(this.player);
          this.hlsInstance.on(HlsLib.Events.MANIFEST_PARSED, ()=> {
            this.player.play().catch(()=>{});
          });
          this.hlsInstance.on(HlsLib.Events.ERROR, (event, data)=> {
            console.error('HLS error', event, data);
            if(data?.fatal){
              try{ this.hlsInstance.destroy(); }catch(e){}
            }
          });
          this.hlsInstance.loadSource(url);
        }catch(e){
          this.player.src = url;
          try{ await this.player.play(); }catch(err){}
        }
      } else {
        this.player.src = url;
        try{ await this.player.play(); }catch(err){}
      }
    } else {
      this.player.src = url;
      try{ await this.player.play(); }catch(err){}
    }

    // Restaurar posição salva
    try{
      const saved = this.lastPlayback || JSON.parse(localStorage.getItem('player_last_v1') || 'null');
      if(saved?.videoUrl === url && saved.currentTime > 0){
        const trySet = ()=>{
          try{
            this.player.currentTime = Math.min(saved.currentTime, this.player.duration || saved.currentTime);
          }catch(e){}
        };
        if(this.player.readyState >= 1) trySet();
        else this.player.addEventListener('loadedmetadata', trySet, { once:true });
      }
    }catch(e){}

    try{
      const initSave = {
        id: this.current?.id,
        videoUrl: this.current?.videoUrl,
        title: this.current?.title,
        currentTime: 0,
        duration: 0,
        ts: Date.now()
      };
      localStorage.setItem('player_last_v1', JSON.stringify(initSave));
      this.lastPlayback = initSave;
    }catch(e){}
  }

  async close(){
    try{
      if(this.player){
        try{
          const save = {
            id: this.current?.id,
            videoUrl: this.current?.videoUrl,
            title: this.current?.title,
            currentTime: this.player.currentTime || 0,
            duration: this.player.duration || 0,
            ts: Date.now()
          };
          localStorage.setItem('player_last_v1', JSON.stringify(save));
        }catch(e){}
        
        this.player.pause();
        this.player.removeEventListener('timeupdate', this._bound.timeupdate);
        this.player.removeEventListener('ended', this._bound.ended);
        this.player.removeEventListener('play', this._bound.play);
        this.player.removeEventListener('pause', this._bound.pause);
        this.player.removeEventListener('error', this._bound.error);
        
        try{
          this.player.removeAttribute('src');
          this.player.load();
        }catch(e){}
      }

      if(this.hlsInstance){
        try{ this.hlsInstance.destroy(); }catch(e){}
        this.hlsInstance = null;
      }
    }catch(e){}

    if(this.container?.parentNode){
      this.container.parentNode.removeChild(this.container);
    }
    
    this.container = null;
    this.player = null;
    this.current = null;
    this._controls = {};

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    
    try{ if(document.fullscreenElement) await document.exitFullscreen(); }catch(e){}
  }
}