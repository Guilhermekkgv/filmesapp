export function createCard(movie, onClick){
  const tpl = document.getElementById('movie-card-template');
  const el = tpl.content.firstElementChild.cloneNode(true);
  const posterEl = el.querySelector('.poster');

  // load poster via Image to detect failures
  const img = new Image();
  img.src = movie.poster;
  img.onload = () => {
    posterEl.style.backgroundImage = `url(${movie.poster})`;
  };
  img.onerror = () => {
    // clear bg and show centered error message
    posterEl.style.backgroundImage = '';
    posterEl.classList.add('poster-error');
    let msg = posterEl.querySelector('.error-msg');
    if(!msg){
      msg = document.createElement('div');
      msg.className = 'error-msg';
      msg.textContent = 'Imagem não carregou';
      posterEl.appendChild(msg);
    }
    // dispatch a custom event to signal that this movie's poster failed to load
    const ev = new CustomEvent('postererror', { detail: { id: movie.id }, bubbles: true, composed: true });
    // dispatch on the card element (so local listeners can react)
    el.dispatchEvent(ev);
    // also dispatch on document to ensure global handlers always receive it and perform automatic removal
    try { document.dispatchEvent(ev); } catch(e) { /* noop */ }
  };

  el.querySelector('.title').textContent = movie.title;
  // show only year in subtitle (single source of year) — ensure no rating/star appears in card
  el.querySelector('.subtitle').textContent = `${movie.year}`;
  // removed separate year badge population to keep only one year display
  // el.querySelector('.year').textContent = movie.year;
  el.addEventListener('click', ()=>onClick(movie.id));
  return el;
}

export function createSection(title, node, onSeeAll){
  const wrap = document.createElement('section');
  wrap.className = 'section';
  const header = document.createElement('div');
  header.className = 'section-header';
  const h2 = document.createElement('h2'); h2.textContent = title;
  const seeAll = document.createElement('div'); seeAll.className='see-all'; seeAll.textContent='Ver tudo';
  if(typeof onSeeAll === 'function'){
    seeAll.style.cursor = 'pointer';
    seeAll.addEventListener('click', ()=>{
      onSeeAll();
    });
  }
  header.append(h2, seeAll);
  wrap.append(header, node);
  return wrap;
}

// New: create a full-screen list page element (does not include a "Fechar" button)
export function createFullListPage(title, list, onCardClick, onPosterError){
  const page = document.createElement('div');
  page.className = 'full-list-page';
  // add entry animation class
  page.classList.add('enter-slide');
  page.addEventListener('animationend', ()=> page.classList.remove('enter-slide'), { once: true });

  // full-screen styles inline so caller can append directly
  Object.assign(page.style, {
    position: 'fixed',
    inset: '0',
    zIndex: 30,
    // match the app background so "Ver tudo" page visually aligns with the home screen
    background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(18,20,22,1) 100%)',
    padding: '20px',
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch'
  });

  // Hide global bottom UI (icons/fab) while this full-list page is open
  const bottomBar = document.querySelector('.bottom-icon-bar');
  const fabBtn = document.querySelector('.admin-fab');
  if (bottomBar) bottomBar.style.display = 'none';
  if (fabBtn) fabBtn.style.display = 'none';

  const topBar = document.createElement('div');
  topBar.style.display = 'flex';
  topBar.style.alignItems = 'center';
  topBar.style.justifyContent = 'flex-start';
  topBar.style.marginBottom = '12px';

  // NEW: add left-arrow "voltar" button similar to modal close icon
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.setAttribute('aria-label', 'Voltar');
  backBtn.style.display = 'inline-flex';
  backBtn.style.alignItems = 'center';
  backBtn.style.justifyContent = 'center';
  backBtn.style.width = '40px';
  backBtn.style.height = '40px';
  backBtn.style.marginRight = '12px';
  backBtn.style.padding = '8px';
  backBtn.style.border = 'none';
  backBtn.style.background = 'transparent';
  backBtn.style.color = '#fff';
  backBtn.style.borderRadius = '10px';
  backBtn.style.cursor = 'pointer';
  backBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>';
  backBtn.addEventListener('click', ()=>{
    // animate page out then remove
    page.classList.add('exit-slide');
    page.addEventListener('animationend', ()=> page.remove(), { once: true });
    // fallback removal
    setTimeout(()=>{ if(document.body.contains(page)) page.remove(); }, 400);
  });
  topBar.appendChild(backBtn);

  const titleEl = document.createElement('div');
  titleEl.textContent = title;
  titleEl.style.fontSize = '18px';
  titleEl.style.fontWeight = '700';
  titleEl.style.color = '#fff';

  topBar.appendChild(titleEl);

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  // Force three-card columns so cards appear 3 across (denser layout) and reduce gap for compactness
  grid.style.gridTemplateColumns = 'repeat(3, 140px)';
  grid.style.gap = '6px';
  grid.style.alignItems = 'start';
  grid.style.justifyContent = 'center';
  grid.style.paddingBottom = '18px';

  list.forEach(m=>{
    const card = createCard(m, onCardClick);
    // enforce same fixed card dimensions as home
    card.style.width = '140px';
    card.style.minWidth = '140px';
    card.style.minHeight = '200px';
    // bubble up postererror to caller if provided
    card.addEventListener('postererror', (ev)=>{
      if(typeof onPosterError === 'function') onPosterError(ev);
      // remove the card element from the grid when poster fails
      card.remove();
    });
    grid.appendChild(card);
  });

  page.append(topBar, grid);

  // restore hidden global UI when the full-list page is removed
  const restoreGlobalUI = () => {
    if (bottomBar) bottomBar.style.display = '';
    if (fabBtn) fabBtn.style.display = '';
  };

  // if the page is removed by external code, ensure UI is restored
  page.addEventListener('remove', restoreGlobalUI);
  // also hook into the back button logic (already animates + removes page)
  // ensure we restore when the page is removed after animation (backBtn already calls page.remove())
  topBar.querySelector('button').addEventListener('click', ()=> {
    // restore immediately (visual) — the animated removal will follow
    restoreGlobalUI();
  });

  return page;
}

