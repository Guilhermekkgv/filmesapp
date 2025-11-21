import { MOVIES } from './data.js';
import { createCard, createSection, createFullListPage } from './components.js';
import { PlayerService } from './playerService.js';
import { MovieStorage } from './movieStorage.js';

const app = document.getElementById('app');

function qs(sel, ctx=document){ return ctx.querySelector(sel); }

// ---- Load persisted MOVIES from localStorage (if any) ----
try{
  const saved = localStorage.getItem('app_movies_v1');
  if(saved){
    const parsed = JSON.parse(saved);
    if(Array.isArray(parsed) && parsed.length){
      // Replace in-memory MOVIES contents while keeping the exported reference intact
      MOVIES.length = 0;
      parsed.forEach(m => MOVIES.push(m));
    }
  }
}catch(e){
  console.warn('Could not load saved movies', e);
}

let state = {
  activeGenre: null,
  modal: null,
  view: 'home' // new: 'home' or 'admin'
};

// New hardcoded rows for requested sections (keeps original MOVIES intact)
const CONTINUE_WATCHING = [
  { id: 1001, title: "Inception", year: 2010, type: "movie", genres:["Sci-Fi"], poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", progress: 45 },
  { id: 1002, title: "The Matrix", year: 1999, type: "movie", genres:["Action"], poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", progress: 67 },
  { id: 1003, title: "Breaking Bad", year: 2008, type: "series", genres:["Drama"], poster: "https://image.tmdb.org/t/p/w500/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg", progress: 30 },
  { id: 1004, title: "Interstellar", year: 2014, type: "movie", genres:["Adventure"], poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", progress: 22 }
];

const FILMES_POPULARES = [
  { id: 2001, title: "The Dark Knight", year: 2008, poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { id: 2002, title: "Pulp Fiction", year: 1994, poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
  { id: 2003, title: "Fight Club", year: 1999, poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
  { id: 2004, title: "Forrest Gump", year: 1994, poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
  { id: 2005, title: "The Godfather", year: 1972, poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" }
];

const SERIES_EM_ALTA = [
  { id: 3001, title: "Stranger Things", year: 2016, poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg" },
  { id: 3002, title: "Game of Thrones", year: 2011, poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg" },
  { id: 3003, title: "The Crown", year: 2016, poster: "https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg" },
  { id: 3004, title: "Peaky Blinders", year: 2013, poster: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg" },
  { id: 3005, title: "The Witcher", year: 2019, poster: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg" }
];

const EM_DESTAQUE = [
  { id: 4001, title: "Dune", year: 2021, poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg" },
  { id: 4002, title: "Oppenheimer", year: 2023, poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
  { id: 4003, title: "Avatar", year: 2009, poster: "https://image.tmdb.org/t/p/w500/6EiRUJpuoeQPghrs3YNsnGdVI4I.jpg" },
  { id: 4004, title: "Spider-Man", year: 2021, poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg" },
  { id: 4005, title: "The Batman", year: 2022, poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg" }
];

const ACAO = [
  { id: 5001, title: "John Wick", year: 2014, poster: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg" },
  { id: 5002, title: "Mad Max", year: 2015, poster: "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg" },
  { id: 5003, title: "Gladiator", year: 2000, poster: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg" },
  { id: 5004, title: "Die Hard", year: 1988, poster: "https://image.tmdb.org/t/p/w500/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg" },
  { id: 5005, title: "Top Gun", year: 2022, poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg" }
];

// helper to persist MOVIES to localStorage
function persistMovies(){
  try{
    localStorage.setItem('app_movies_v1', JSON.stringify(MOVIES));
  }catch(e){
    console.warn('Failed to persist movies', e);
  }
}

// helper to remove movie by id from known arrays and re-render content
function removeMovieById(id){
  const lists = [MOVIES, CONTINUE_WATCHING, FILMES_POPULARES, SERIES_EM_ALTA, EM_DESTAQUE, ACAO];
  let removed = false;
  lists.forEach(arr=>{
    const idx = arr.findIndex(m=>m.id===id);
    if(idx > -1){ arr.splice(idx,1); removed = true; }
  });
  if(removed){
    // persist change to MOVIES in case a published item was removed
    persistMovies();
    // if admin panel exists and may show published list, keep it — just refresh main content
    renderContent();
  }
}

function buildHorizontal(list, onClick){
  const row = document.createElement('div'); row.className='horizontal';
  list.forEach(m=>{
    const card = createCard(m, onClick);
    // listen for poster load errors and automatically remove the movie
    card.addEventListener('postererror', (ev)=>{
      const id = ev.detail && ev.detail.id;
      if(id) removeMovieById(id);
    });
    row.appendChild(card);
  });
  return row;
}

function buildHorizontalFromList(list, onClick, options = {}){
  const row = document.createElement('div'); row.className='horizontal';
  list.forEach(m=>{
    const card = createCard(m, onClick);
    // listen for poster load errors and automatically remove the movie
    card.addEventListener('postererror', (ev)=>{
      const id = ev.detail && ev.detail.id;
      if(id) removeMovieById(id);
    });
    // for continue watching, append a small progress bar under the subtitle
    if(options.showProgress && typeof m.progress === 'number'){
      const wrap = document.createElement('div');
      wrap.className = 'progress-wrap';
      const bar = document.createElement('div'); bar.className='progress-bar';
      const fill = document.createElement('div'); fill.className='progress-fill';
      fill.style.width = `${m.progress}%`;
      const pct = document.createElement('div'); pct.className='progress-pct'; pct.textContent = `${m.progress}%`;
      bar.appendChild(fill);
      wrap.append(bar, pct);
      // attach progress under meta (inside card meta area)
      const meta = card.querySelector('.meta');
      if(meta) meta.appendChild(wrap);
    }
    row.appendChild(card);
  });
  return row;
}

// New: show full-screen list for a section (now delegates to components)
function openFullList(title, list){
  if(!Array.isArray(list)) list = [];
  // remove any existing full-page container
  const prev = document.querySelector('.full-list-page');
  if(prev) prev.remove();

  const page = createFullListPage(title, list, openModal, (ev)=>{
    const id = ev.detail && ev.detail.id;
    if(id) removeMovieById(id);
  });

  // Append page to body. Note: no "Fechar" button is added per requirement.
  document.body.appendChild(page);
}

function buildTopBar(){
  const top = document.createElement('div'); top.className='topbar';
  // topbar intentionally minimal and no longer includes an Admin toggle button
  return top;
}

function groupSections(){
  // keep original grouping for backward compatibility
  const nowPlaying = MOVIES.slice(0,5);
  const popular = [...MOVIES].sort((a,b)=>b.rating-a.rating).slice(0,6);
  const topRated = MOVIES.filter(m=>m.rating>=8.5);
  return { nowPlaying, popular, topRated };
}

function renderContent(){
  const content = document.createElement('div'); content.className='content';

  const groups = groupSections();
  content.appendChild( createSection('Em cartaz', buildHorizontal(groups.nowPlaying, openModal), ()=> openFullList('Em cartaz', groups.nowPlaying)) );
  content.appendChild( createSection('Populares', buildHorizontal(groups.popular, openModal), ()=> openFullList('Populares', groups.popular)) );
  if(groups.topRated.length) content.appendChild( createSection('Mais bem avaliados', buildHorizontal(groups.topRated, openModal), ()=> openFullList('Mais bem avaliados', groups.topRated)) );

  content.appendChild( createSection('Continuar Assistindo', buildHorizontalFromList(CONTINUE_WATCHING, openModal), ()=> openFullList('Continuar Assistindo', CONTINUE_WATCHING)) );
  content.appendChild( createSection('Filmes Populares', buildHorizontalFromList(FILMES_POPULARES, openModal), ()=> openFullList('Filmes Populares', FILMES_POPULARES)) );
  content.appendChild( createSection('Séries em Alta', buildHorizontalFromList(SERIES_EM_ALTA, openModal), ()=> openFullList('Séries em Alta', SERIES_EM_ALTA)) );
  content.appendChild( createSection('Em Destaque', buildHorizontalFromList(EM_DESTAQUE, openModal), ()=> openFullList('Em Destaque', EM_DESTAQUE)) );
  content.appendChild( createSection('Ação', buildHorizontalFromList(ACAO, openModal), ()=> openFullList('Ação', ACAO)) );

  // attach to app (replace existing content area) with exit animation for the old content
  const old = app.querySelector('.content');
  if(old) {
    // animate old out, then replace
    old.classList.add('exit-slide');
    old.addEventListener('animationend', () => {
      old.replaceWith(content);
      // apply enter animation when new content mounts
      content.classList.add('enter-slide');
      content.addEventListener('animationend', ()=> content.classList.remove('enter-slide'), { once: true });
    }, { once: true });
  } else {
    app.appendChild(content);
    // apply enter animation when content mounts
    content.classList.add('enter-slide');
    content.addEventListener('animationend', ()=> content.classList.remove('enter-slide'), { once: true });
  }
}

// instantiate and expose player service for global usage
window.appServices = window.appServices || {};
window.appServices.player = new PlayerService();

// instantiate MovieStorage for persistent movie DB
const movieDB = new MovieStorage();

// -------------- ADMIN UI AND LOGIC --------------

function renderAdmin(){
  // admin panel contains: form for fields, live preview, list of published items, validation, import sample, and clear.
  const container = document.createElement('div');
  container.className = 'admin-panel';

  const header = document.createElement('div'); header.className = 'admin-header';
  const h = document.createElement('h2'); h.textContent = 'Admin — Publicar Filme';
  const desc = document.createElement('div'); desc.className = 'admin-desc'; desc.textContent = 'Preencha os campos e clique em Publicar. Use Preview antes de publicar.';
  header.append(h, desc);

  // form
  const form = document.createElement('form'); form.className = 'admin-form';
  form.addEventListener('submit', (e)=>e.preventDefault());

  const makeField = (labelText, name, placeholder='', type='text')=>{
    const row = document.createElement('div'); row.className='form-row';
    const label = document.createElement('label'); label.textContent = labelText; label.htmlFor = `admin-${name}`;
    let input;
    if(type === 'textarea'){
      input = document.createElement('textarea');
    } else {
      input = document.createElement('input'); input.type = type;
    }
    input.id = `admin-${name}`; input.name = name; input.placeholder = placeholder;
    input.className = 'form-input';
    row.append(label, input);
    return {row, input};
  };

  const titleField = makeField('Título','title','Ex: Meu Filme');
  const yearField = makeField('Ano','year','2024','number');
  const posterField = makeField('URL do Poster','poster','https://.../poster.jpg');
  // add recommended size note under the poster URL field
  const posterNote = document.createElement('div');
  posterNote.className = 'form-note';
  posterNote.textContent = '700×1000 px';
  posterField.row.appendChild(posterNote);
  // file input for poster upload
  const posterFileRow = document.createElement('div'); posterFileRow.className='form-row';
  const posterFileLabel = document.createElement('label'); posterFileLabel.textContent = 'Enviar Poster (arquivo)'; posterFileLabel.htmlFor = 'admin-poster-file';
  const posterFileInput = document.createElement('input'); posterFileInput.type='file'; posterFileInput.accept='image/*'; posterFileInput.id='admin-poster-file'; posterFileInput.className='form-input';
  posterFileRow.append(posterFileLabel, posterFileInput);
  // keep a reference to the object URL so we can revoke it later
  let posterFileUrl = null;
  posterFileInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(!f){
      if(posterFileUrl){ URL.revokeObjectURL(posterFileUrl); posterFileUrl = null; }
      updatePreview();
      return;
    }
    if(posterFileUrl) { URL.revokeObjectURL(posterFileUrl); posterFileUrl = null; }
    posterFileUrl = URL.createObjectURL(f);
    // clear textual URL to avoid confusion
    posterField.input.value = '';
    updatePreview();
  });

  // --- NEW: backdrop/secondary image fields (optional) ---
  const backdropField = makeField('URL da Imagem Secundária (backdrop) (opcional)','backdrop','https://.../backdrop.jpg');
  const backdropNote = document.createElement('div');
  backdropNote.className = 'form-note';
  backdropNote.textContent = '1600×900 px';
  backdropField.row.appendChild(backdropNote);

  const backdropFileRow = document.createElement('div'); backdropFileRow.className='form-row';
  const backdropFileLabel = document.createElement('label'); backdropFileLabel.textContent = 'Enviar Imagem Secundária (arquivo)'; backdropFileLabel.htmlFor = 'admin-backdrop-file';
  const backdropFileInput = document.createElement('input'); backdropFileInput.type='file'; backdropFileInput.accept='image/*'; backdropFileInput.id='admin-backdrop-file'; backdropFileInput.className='form-input';
  backdropFileRow.append(backdropFileLabel, backdropFileInput);
  let backdropFileUrl = null;
  backdropFileInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(!f){
      if(backdropFileUrl){ URL.revokeObjectURL(backdropFileUrl); backdropFileUrl = null; }
      updatePreview();
      return;
    }
    if(backdropFileUrl) { URL.revokeObjectURL(backdropFileUrl); backdropFileUrl = null; }
    backdropFileUrl = URL.createObjectURL(f);
    // clear textual URL to avoid confusion
    backdropField.input.value = '';
    updatePreview();
  });
  // append the backdrop fields into the form (after poster rows)
  // --- NEW: Video field (URL or file) ---
  const videoField = makeField('URL do Vídeo (opcional)','video','https://.../video.mp4');
  const videoNote = document.createElement('div');
  videoNote.className = 'form-note';
  videoNote.textContent = 'Arquivos grandes podem demorar; preferencialmente mp4';
  videoField.row.appendChild(videoNote);

  const videoFileRow = document.createElement('div'); videoFileRow.className='form-row';
  const videoFileLabel = document.createElement('label'); videoFileLabel.textContent = 'Enviar Vídeo (arquivo)'; videoFileLabel.htmlFor = 'admin-video-file';
  const videoFileInput = document.createElement('input'); videoFileInput.type='file'; videoFileInput.accept='video/*'; videoFileInput.id='admin-video-file'; videoFileInput.className='form-input';
  videoFileRow.append(videoFileLabel, videoFileInput);
  let videoFileUrl = null;
  videoFileInput.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(!f){
      if(videoFileUrl){ URL.revokeObjectURL(videoFileUrl); videoFileUrl = null; }
      updatePreview();
      return;
    }
    if(videoFileUrl) { URL.revokeObjectURL(videoFileUrl); videoFileUrl = null; }
    videoFileUrl = URL.createObjectURL(f);
    // clear textual URL to avoid confusion
    videoField.input.value = '';
    updatePreview();
  });

  form.append(
    titleField.row,
    yearField.row,
    posterField.row,
    posterFileRow,
    backdropField.row,
    backdropFileRow,
    videoField.row,
    videoFileRow,
    // create missing fields: genres, rating and overview
    (()=>{ 
      const gf = makeField('Gêneros','genres','Drama, Thriller'); 
      const rf = makeField('Nota','rating','7.5','number'); 
      const of = makeField('Sinopse','overview','Escreva a sinopse aqui...','textarea'); 
      // keep references in outer scope by assigning to variables with those names
      window.__admin_genresField = gf;
      window.__admin_ratingField = rf;
      window.__admin_overviewField = of;
      return gf.row;
    })(),
    // append rating and overview rows after genres
    (()=>{
      const rf = window.__admin_ratingField;
      const of = window.__admin_overviewField;
      return rf.row;
    })(),
    (()=>{
      const of = window.__admin_overviewField;
      return of.row;
    })()
  );

  // expose shorter local references for the rest of the function to use
  const genresField = window.__admin_genresField;
  const ratingField = window.__admin_ratingField;
  const overviewField = window.__admin_overviewField;
  // local reference to video field
  const localVideoField = videoField;

  // action buttons
  const actions = document.createElement('div'); actions.className='admin-actions';
  const previewBtn = document.createElement('button'); previewBtn.className='nav-btn'; previewBtn.type='button'; previewBtn.textContent='Preview';
  const publishBtn = document.createElement('button'); publishBtn.className='nav-btn'; publishBtn.type='button'; publishBtn.textContent='Publicar';
  const clearBtn = document.createElement('button'); clearBtn.className='nav-btn'; clearBtn.type='button'; clearBtn.textContent='Limpar';

  actions.append(previewBtn, publishBtn, clearBtn);

  // live preview area
  const previewWrap = document.createElement('div'); previewWrap.className = 'admin-preview-wrap';
  // hide preview area until user clicks Preview
  previewWrap.style.display = 'none';
  const previewCard = document.createElement('div'); previewCard.className='card admin-preview';
  const previewPoster = document.createElement('div'); previewPoster.className='poster';
  previewPoster.style.background = 'linear-gradient(180deg, rgba(20,20,20,0.9), rgba(12,12,12,0.95))';
  const previewMeta = document.createElement('div'); previewMeta.className='meta';
  const previewTitle = document.createElement('h3'); previewTitle.className='title'; previewTitle.textContent='—';
  const previewSubtitle = document.createElement('p'); previewSubtitle.className='subtitle'; previewSubtitle.textContent='—';
  previewMeta.append(previewTitle, previewSubtitle);
  previewCard.append(previewPoster, previewMeta);
  previewWrap.append(previewCard);

  // published list to show what was added
  const publishedList = document.createElement('div'); publishedList.className='admin-published';
  const pubHeader = document.createElement('h3'); pubHeader.textContent = '';
  publishedList.append(pubHeader);

  // helper validation
  const validate = ()=>{
    const title = titleField.input.value.trim();
    const poster = posterField.input.value.trim();
    const year = yearField.input.value.trim();
    const errors = [];
    if(!title) errors.push('Título é obrigatório');
    // poster is optional as URL if a file was uploaded — require at least one source if you want an image
    if(!poster && !posterFileUrl) errors.push('Poster é obrigatório (URL ou arquivo)');
    if(year && isNaN(Number(year))) errors.push('Ano inválido');
    return errors;
  };

  function updatePreview(){
    const title = titleField.input.value.trim() || '—';
    const genres = genresField.input.value.trim();
    const year = yearField.input.value.trim();
    const poster = posterField.input.value.trim();
    const backdrop = backdropField.input.value.trim();
    // prefer uploaded poster file then poster URL
    const chosenPoster = posterFileUrl || (poster || '');
    // prefer uploaded backdrop file, then backdrop URL, then poster (fallback)
    const chosenBackdrop = backdropFileUrl || (backdrop || '') || chosenPoster || '';
    previewTitle.textContent = title;
    previewSubtitle.textContent = year ? year : (genres ? genres.split(',')[0].trim() : '—');
    if(chosenPoster){
      const img = new Image();
      img.onload = ()=> previewPoster.style.backgroundImage = `url(${chosenPoster})`;
      img.onerror = ()=> previewPoster.style.backgroundImage = '';
      img.src = chosenPoster;
    } else {
      previewPoster.style.backgroundImage = '';
    }
    // set a small page-level backdrop preview if available (use poster if no backdrop provided)
    previewCard.dataset.backdrop = chosenBackdrop || '';
  }

  // attach events to update preview live
  // Preview should only update when Preview button is clicked (no live updates)
  // inputs will not trigger updatePreview automatically

  // actions handlers
  previewBtn.addEventListener('click', ()=>{
    const errors = validate();
    if(errors.length){
      alert('Corrija: ' + errors.join('; '));
      return;
    }
    // update preview once when Preview is clicked
    // ensure preview area is visible
    previewWrap.style.display = 'flex';
    updatePreview();
    // also show modal preview of how it will appear
    const movie = {
      id: Date.now(),
      title: titleField.input.value.trim(),
      year: Number(yearField.input.value.trim()) || '',
      // prefer uploaded file object URL, otherwise textual URL
      poster: posterFileUrl || posterField.input.value.trim(),
      backdrop: backdropFileUrl || backdropField.input.value.trim() || undefined,
      video: videoFileUrl || localVideoField.input.value.trim() || undefined,
      genres: (genresField.input.value || '').split(',').map(s=>s.trim()).filter(Boolean),
      overview: overviewField.input.value.trim(),
      rating: ratingField.input.value ? Number(ratingField.input.value) : undefined
    };
    openModal(movie.id, movie); // open preview modal with provided movie object (doesn't publish)
  });

  publishBtn.addEventListener('click', ()=>{
    const errors = validate();
    if(errors.length){
      alert('Corrija: ' + errors.join('; '));
      return;
    }
    const movie = {
      id: Date.now(),
      title: titleField.input.value.trim(),
      year: Number(yearField.input.value.trim()) || '',
      poster: posterFileUrl || posterField.input.value.trim(),
      backdrop: backdropFileUrl || backdropField.input.value.trim() || undefined,
      video: videoFileUrl || localVideoField.input.value.trim() || undefined,
      genres: (genresField.input.value || '').split(',').map(s=>s.trim()).filter(Boolean),
      overview: overviewField.input.value.trim(),
      rating: ratingField.input.value ? Number(ratingField.input.value) : undefined
    };
    // publish to MOVIES array in-memory
    MOVIES.unshift(movie); // add to beginning so it shows in Em cartaz

    // Persist updated MOVIES so published items survive reloads
    persistMovies();

    // Persist to MovieStorage so player can look up by ID (and keep canonical videoUrl)
    try {
      movieDB.save(movie);
    } catch (e) { console.warn('movieDB save failed', e); }

    // add to published list UI
    const item = document.createElement('div'); item.className='published-item';
    item.textContent = `${movie.title} (${movie.year || '—'})`;
    const removeBtn = document.createElement('button'); removeBtn.className='nav-btn small'; removeBtn.type='button'; removeBtn.textContent='Remover';
    removeBtn.addEventListener('click', ()=>{
      // remove from MOVIES and UI
      const idx = MOVIES.findIndex(m=>m.id===movie.id);
      if(idx>-1) MOVIES.splice(idx,1);
      // persist after removal
      persistMovies();
      // remove from movieDB as well
      try{ movieDB.delete(movie.id); }catch(e){}
      item.remove();
      renderContent();
    });
    item.append(removeBtn);
    publishedList.append(item);
    // re-render content to show new movie
    renderContent();
    // hide the inline preview after publish (preview must be explicitly requested again)
    previewWrap.style.display = 'none';
    // don't revoke the movie poster object URL since it's now used in MOVIES; it will be revoked if user clears before publishing
    alert('Filme publicado!');
  });

  // Note: Import sample functionality removed — admin now fills fields or uploads files.
  
  clearBtn.addEventListener('click', ()=>{
    [titleField.input, yearField.input, posterField.input, backdropField.input, genresField.input, overviewField.input, ratingField.input].forEach(i=>i.value='');
    if(posterFileUrl){ URL.revokeObjectURL(posterFileUrl); posterFileUrl = null; posterFileInput.value = ''; }
    if(backdropFileUrl){ URL.revokeObjectURL(backdropFileUrl); backdropFileUrl = null; backdropFileInput.value = ''; }
    if(videoFileUrl){ URL.revokeObjectURL(videoFileUrl); videoFileUrl = null; videoFileInput.value = ''; }
    updatePreview();
    // hide preview area when clearing fields
    previewWrap.style.display = 'none';
  });

  // initial preview update
  // do not auto-run preview on admin open; preview only when user clicks Preview

  container.append(header, form, actions, previewWrap, publishedList);

  return container;
}

function renderMainArea(){
  // replace the central content area depending on view
  if(state.view === 'admin'){
    // animate existing content out if present, then show admin
    const old = app.querySelector('.content');
    const showAdmin = ()=>{
      const adminEl = renderAdmin();
      const existingAdmin = app.querySelector('.admin-panel');
      if(existingAdmin) existingAdmin.replaceWith(adminEl); else app.appendChild(adminEl);
      adminEl.classList.add('enter-slide');
      adminEl.addEventListener('animationend', ()=> adminEl.classList.remove('enter-slide'), { once: true });
    };

    if(old){
      old.classList.add('exit-slide');
      old.addEventListener('animationend', ()=> {
        old.remove();
        showAdmin();
      }, { once: true });
    } else {
      // if old admin exists just replace
      const oldAdmin = app.querySelector('.admin-panel');
      if(oldAdmin) oldAdmin.remove();
      showAdmin();
    }
  } else {
    // ensure admin panel removed and regular content displayed with animated transitions
    const oldAdmin = app.querySelector('.admin-panel');
    if(oldAdmin){
      oldAdmin.classList.add('exit-slide');
      oldAdmin.addEventListener('animationend', ()=> {
        oldAdmin.remove();
        renderContent();
      }, { once: true });
    } else {
      renderContent();
    }
  }
}

function openModal(id, overrideMovie){
  const movie = overrideMovie || MOVIES.find(m=>m.id===id) ||
                CONTINUE_WATCHING.find(m=>m.id===id) ||
                FILMES_POPULARES.find(m=>m.id===id) ||
                SERIES_EM_ALTA.find(m=>m.id===id) ||
                EM_DESTAQUE.find(m=>m.id===id) ||
                ACAO.find(m=>m.id===id);
  if(!movie) return;
  state.modal = movie.id;

  // remove any previously created modal/backdrop to avoid duplicated images
  const prevBackdrop = document.querySelector('.fade-backdrop');
  if(prevBackdrop) prevBackdrop.remove();
  const prevModal = document.querySelector('.modal');
  if(prevModal) prevModal.remove();

  // Hide bottom UI (icons/fab) while modal is open
  const bottomBar = document.querySelector('.bottom-icon-bar');
  const fab = document.querySelector('.admin-fab');
  if(bottomBar) bottomBar.style.display = 'none';
  if(fab) fab.style.display = 'none';

  // backdrop
  const backdrop = document.createElement('div'); backdrop.className='fade-backdrop';
  // Use the same non-transparent page background (linear gradient) so modal backdrop is opaque
  backdrop.style.background = 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(18,20,22,1) 100%)';

  // modal
  const modal = document.createElement('div'); modal.className='modal';
  // close
  const close = document.createElement('button');
  close.className = 'icon-btn close left-close';
  // left arrow SVG (touch-friendly)
  close.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>';

  // poster on top and info below (stacked)
  const poster = document.createElement('div'); poster.className='poster modal-poster'; poster.style.backgroundImage=`url(${movie.poster})`;
  const topSlice = document.createElement('div');
  topSlice.className = 'backdrop-top';
  const topImg = movie.backdrop || movie.poster;
  if(topImg) topSlice.style.backgroundImage = `url(${topImg})`;
  backdrop.appendChild(topSlice);

  const info = document.createElement('div'); info.className='info';
  const h = document.createElement('h2'); h.textContent = movie.title;

  const genresLine = document.createElement('div'); genresLine.className = 'meta-line';
  const genresLabel = document.createElement('span'); genresLabel.className='meta-label'; genresLabel.textContent = 'Gêneros:';
  const genresValue = document.createElement('span'); genresValue.className='meta-value'; genresValue.textContent = (movie.genres || []).join(', ');
  genresLine.append(genresLabel, genresValue);

  const yearLine = document.createElement('div'); yearLine.className = 'meta-line';
  const yearLabel = document.createElement('span'); yearLabel.className='meta-label'; yearLabel.textContent = 'Ano:';
  const yearValue = document.createElement('span'); yearValue.className='meta-value'; yearValue.textContent = `${movie.year || ''}`;
  yearLine.append(yearLabel, yearValue);

  let watchWrap; // move declaration to function scope so it can be referenced when assembling info later

  if(movie.video){
    watchWrap = document.createElement('div');
    watchWrap.style.marginTop = '8px';
    // rectangular "Assistir" button placed above the synopsis (replaces circular icon)
    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'rect-play-btn';
    playBtn.textContent = 'Assistir';
    watchWrap.className = 'play-wrap';
    watchWrap.appendChild(playBtn);

    // Play action: use PlayerService when available
    playBtn.addEventListener('click', async ()=>{
      // prefer PlayerService for playback if available
      if(movie && movie.video){
        try{
          const svc = window.appServices && window.appServices.player;
          if(svc && typeof svc.playItem === 'function'){
            // Try to retrieve canonical saved movie from movieDB to ensure videoUrl key is present
            const stored = movieDB.getById(movie.id);
            const payload = stored ? stored : { id: movie.id, title: movie.title, videoUrl: movie.video };
            svc.playItem(payload);
            return;
          }
        }catch(e){
          console.error('PlayerService playItem failed', e);
        }
      }
      // If we reach here, the PlayerService is not available or movie has no video
      if(!movie || !movie.video){
        alert('Nenhum vídeo disponível para este item.');
      } else {
        alert('Player indisponível no momento.');
      }
    });
  }

  const p = document.createElement('p'); p.textContent = movie.overview || ''; p.style.color='var(--muted)';
  // place the play button above the synopsis if it exists
  if(movie.video){
    info.append(h, watchWrap, p, genresLine, yearLine);
  } else {
    info.append(h, p, genresLine, yearLine);
  }
  modal.append(close, poster, info);
  document.body.append(backdrop, modal);

  // apply quick slide-in animation to modal
  modal.classList.add('enter-slide');
  modal.addEventListener('animationend', ()=> modal.classList.remove('enter-slide'), { once: true });
  backdrop.classList.add('enter-slide');
  backdrop.addEventListener('animationend', ()=> backdrop.classList.remove('enter-slide'), { once: true });

  function closeModal(){
    // animate backdrop and modal out, then remove
    backdrop.classList.add('exit-slide');
    modal.classList.add('exit-slide');
    let removed = false;
    modal.addEventListener('animationend', ()=> {
      if(removed) return;
      removed = true;
      backdrop.remove(); modal.remove();
      state.modal = null;
      // restore bottom UI visibility
      if(bottomBar) bottomBar.style.display = '';
      if(fab) fab.style.display = '';
    }, { once: true });
    // fallback remove after a short timeout in case animationend doesn't fire
    setTimeout(()=>{
      if(removed) return;
      removed = true;
      backdrop.remove(); modal.remove();
      state.modal = null;
      if(bottomBar) bottomBar.style.display = '';
      if(fab) fab.style.display = '';
    }, 400);
  }

  close.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
}

function init(){
  // Build UI shell: topbar, content placeholder, bottom nav
  const top = buildTopBar();
  app.appendChild(top);
  const content = document.createElement('div'); content.className='content'; app.appendChild(content);

  // Create a horizontal bottom icon bar with labels under each icon
  const bottomBar = document.createElement('nav');
  bottomBar.className = 'bottom-icon-bar';
  // helper to create an icon item
  const makeIconItem = (opts) => {
    const item = document.createElement('button');
    item.className = 'icon-item';
    item.setAttribute('aria-label', opts.label || '');
    item.title = opts.label || '';
    item.type = 'button';
    const svgWrap = document.createElement('div');
    svgWrap.className = 'icon-svg';
    svgWrap.innerHTML = opts.svg || '';
    const txt = document.createElement('div');
    txt.className = 'icon-label';
    txt.textContent = opts.label || '';
    item.append(svgWrap, txt);
    if(typeof opts.onClick === 'function') item.addEventListener('click', opts.onClick);
    return item;
  };

  // Home icon (Lucide 'Home') - always navigates to main/home view
  const homeIcon = makeIconItem({
    label: 'Início',
    // replaced SVG with Lucide "home" icon markup
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-icon lucide-house" aria-hidden="true" focusable="false"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
    onClick: ()=>{
      state.view = 'home';
      renderMainArea();
      // update active state on admin icon later by toggling classes
      const adminBtn = document.querySelector('.icon-item.admin-toggle-btn');
      if(adminBtn) adminBtn.classList.remove('active');
      // reflect active in home icon
      homeIcon.classList.add('active');
    }
  });

  // Admin icon (Lucide 'User') - toggles admin view
  const adminIcon = makeIconItem({
    label: 'Admin',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    onClick: (e)=>{
      e.stopPropagation();
      state.view = (state.view === 'admin') ? 'home' : 'admin';
      renderMainArea();
      // update visual states
      if(state.view === 'admin'){ adminIcon.classList.add('active'); homeIcon.classList.remove('active'); }
      else { adminIcon.classList.remove('active'); homeIcon.classList.add('active'); }
    }
  });
  adminIcon.classList.add('admin-toggle-btn');

  // Ensure initial active icon matches initial state
  if(state.view === 'admin') adminIcon.classList.add('active'); else homeIcon.classList.add('active');

  // assemble bottom bar
  bottomBar.append(homeIcon, adminIcon);
  // attach bottom bar to body so it sits above content but inside viewport
  document.body.appendChild(bottomBar);

  // remove previous floating admin fab if it exists (clean up older element)
  const oldFabBtn = document.querySelector('.admin-fab');
  if(oldFabBtn) oldFabBtn.remove();

  renderMainArea();

  // Global poster error handler: ensure any postererror event removes the movie from in-memory lists
  // and refreshes the UI so the movie is no longer visible anywhere.
  // This catches posterior events that might not be handled locally.
  function globalPosterErrorHandler(ev){
    try{
      const id = ev && ev.detail && ev.detail.id;
      if(!id) return;
      removeMovieById(id);
      // remove any floating full-list pages' cards with the same id to keep UI consistent
      document.querySelectorAll('.full-list-page .card').forEach(card=>{
        const titleEl = card.querySelector('.title');
        if(!titleEl) return;
        // crude id match: compare dataset or title fallback — if card removed earlier this is no-op
        // If card elements include a data-id we could use it; fallback: remove card when its poster shows empty.
        const poster = card.querySelector('.poster');
        if(poster && poster.classList.contains('poster-error')) card.remove();
      });
    }catch(err){
      // noop
    }
  }
  // attach to document to catch bubbled custom events from card components
  document.addEventListener('postererror', globalPosterErrorHandler, { passive: true });
}

init();