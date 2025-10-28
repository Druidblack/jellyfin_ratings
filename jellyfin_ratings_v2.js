if (typeof GM_xmlhttpRequest === 'undefined') {
  // Массив прокси — старый и новый
  const PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest='
  ];
  const DIRECT_DOMAINS = [
    'api.mdblist.com',
    'graphql.anilist.co',
    'query.wikidata.org',
    'www.google.com',
    'kinopoiskapiunofficial.tech',
	'api.themoviedb.org' 
  ];

  window.GM_xmlhttpRequest = function({ method = 'GET', url, headers = {}, data, onload, onerror }) {
    // решаем, нужно ли проксировать
    const isDirect = DIRECT_DOMAINS.some(d => url.includes(d));
    let fetchUrl;
    if (isDirect) {
      fetchUrl = url;
    } else {
      // выбираем случайный прокси
      const proxy = PROXIES[Math.floor(Math.random() * PROXIES.length)];
      // добавляем cache-bust
      const sep = url.includes('?') ? '&' : '?';
      const bump = `_=${Date.now()}`;
      fetchUrl = proxy + encodeURIComponent(url + sep + bump);
    }

    fetch(fetchUrl, {
      method,
      headers,
      body: data,
      cache: 'no-store'         // запрещаем браузерному кэшу
    })
    .then(response =>
      response.text().then(text =>
        onload({ status: response.status, responseText: text })
      )
    )
    .catch(err => {
      if (typeof onerror === 'function') onerror(err);
    });
  };
}

;(function() {
  'use strict';

  // === API Keys ===
  const MDBLIST_API_KEY    = 'api_key';
  const KINOPOISK_API_KEY  = 'api_key';
  const TMDB_API_KEY       = 'api_key';

  // === Logos ===
  const LOGO = {
    imdb:               'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/IMDb.png',
    tmdb:               'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/TMDB.png',
    tomatoes:           'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Rotten_Tomatoes.png',
    tomatoes_rotten:    'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Rotten_Tomatoes_rotten.png',
    tomatoes_certified: 'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/rotten-tomatoes-certified.png',
    audience:           'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Rotten_Tomatoes_positive_audience.png',
    audience_rotten:    'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Rotten_Tomatoes_negative_audience.png',
    rotten_ver:         'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/roten_tomatoes_ver.png',
    metacritic:         'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Metacritic.png',
    metacriticms:       'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/metacriticms.png',
    metacriticus:       'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/mus2.png',
    rogerebert:         'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Roger_Ebert.png',
    trakt:              'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Trakt.png',
    letterboxd:         'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/letterboxd.png',
    kinopoisk:          'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/kinopoisk.png',
    myanimelist:        'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/mal.png',
    anilist:            'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/anilist.png',
    allocine_crit:      'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/allocine_crit.png',
    allocine_user:      'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/allocine_user.png',
    douban:             'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/douban.png'
  };

  let currentImdbId = null;
  scanLinks();
  setInterval(scanLinks, 1000);

// === Управление видимостью встроенных рейтингов (звёзды/критика) ===
function getStarBox(node) {
  return node?.closest('.itemMiscInfo.itemMiscInfo-primary') || node?.parentElement || null;
}

function setBuiltInStarsHidden(box, hide) {
  if (!box) return;
  const stars  = box.querySelector('.starRatingContainer.mediaInfoItem');
  const critic = box.querySelector('.mediaInfoItem.mediaInfoCriticRating');

  [stars, critic].forEach(el => {
    if (!el) return;
    if (hide) {
      if (!('origStyle' in el.dataset)) {
        el.dataset.origStyle = el.getAttribute('style') || '';
      }
      el.style.color = 'transparent';
      el.style.fontSize = '0';
    } else {
      if ('origStyle' in el.dataset) {
        el.setAttribute('style', el.dataset.origStyle);
        delete el.dataset.origStyle;
      } else {
        el.style.color = '';
        el.style.fontSize = '';
      }
    }
  });
}

// скрываем встроенные рейтинги только если контейнер непустой
function updateStarsVisibilityFor(container) {
  if (!container) return;
  const hasContent =
    container.childElementCount > 0 ||
    (container.textContent && container.textContent.trim().length > 0);
  setBuiltInStarsHidden(getStarBox(container), hasContent);
}

// следим за наполнением контейнера
function watchRatingContainer(container) {
  // мгновенная проверка
  setTimeout(() => updateStarsVisibilityFor(container), 0);

  // реакции на асинхронные изменения
  const obs = new MutationObserver(() => updateStarsVisibilityFor(container));
  obs.observe(container, { childList: true, subtree: true, characterData: true });
  container.__ratingsObserver = obs;
}


function scanLinks() {
  // получаем текущий IMDb ID и при смене — чистим наши контейнеры аккуратно
  document.querySelectorAll('a.emby-button[href*="imdb.com/title/"]').forEach(a => {
    if (a.dataset.imdbProcessed) return;
    a.dataset.imdbProcessed = 'true';
    const m = a.href.match(/imdb\.com\/title\/(tt\d+)/);
    const newImdbId = m ? m[1] : null;

    // если страница обновилась — перед удалением наших контейнеров вернём звёзды и остановим наблюдателей
    if (newImdbId !== currentImdbId) {
      document.querySelectorAll('.mdblist-rating-container').forEach(el => {
        try { el.__ratingsObserver?.disconnect(); } catch {}
        setBuiltInStarsHidden(getStarBox(el), false);
        el.remove();
      });
      currentImdbId = newImdbId;
    }
  });

  // ⚠️ ВАЖНО: больше НЕ скрываем встроенные рейтинги здесь безусловно.
  // Раньше было:
  // document.querySelectorAll('div.starRatingContainer.mediaInfoItem, div.mediaInfoItem.mediaInfoCriticRating').forEach(...)

// обрабатываем TMDB-ссылки (generic -> season -> episode)
	const tmdbLinks = Array.from(document.querySelectorAll('a.emby-button[href*="themoviedb.org/"]'))
	  .filter(a => !a.dataset.mdblistProcessed)
	  .sort((a,b) => {
		const s = h => /\/episode\//.test(h) ? 2 : (/\/season\//.test(h) ? 1 : 0);
		return s(a.href) - s(b.href);
	  });

	tmdbLinks.forEach(a => {
	  a.dataset.mdblistProcessed = 'true';
	  processLink(a);
	});
}


function processLink(link) {
  // Сначала пытаемся распознать ссылку серии:
  // https://www.themoviedb.org/tv/{tvId}/season/{s}/episode/{e}
  const ep = link.href.match(/themoviedb\.org\/tv\/(\d+)\/season\/(\d+)\/episode\/(\d+)/);
  
    // Затем — ссылку сезона (при этом исключаем эпизод)
  const sn = !ep && link.href.match(/themoviedb\.org\/tv\/(\d+)\/season\/(\d+)(?!\/episode)/);

  // Базовый разбор для movie/tv
  const m = link.href.match(/themoviedb\.org\/(movie|tv)\/(\d+)/);
  if (!m) return;
  const type   = m[1] === 'tv' ? 'show' : 'movie';
  const tmdbId = m[2];


  // Контекст TMDb: либо эпизод, либо сезон, либо null
  const episodeInfo = ep ? {
    isEpisode: true,
    tvId: ep[1],
    season: parseInt(ep[2], 10),
    episode: parseInt(ep[3], 10)
  } : (sn ? {
    isSeason: true,
    tvId: sn[1],
    season: parseInt(sn[2], 10)
  } : null);

  const presentRe = '(?:present|now|current|Н\\/В|Н\\.В\\.|н\\/в|н\\.в\\.|по\\s*наст\\.?\\s*времен[ию]?)';
  const dash = '[–—-]'; // варианты тире/дефиса
  const isYearish  = t => /^\d{4}$/.test(t) || new RegExp(`^\\d{4}\\s*${dash}\\s*(?:\\d{4}|${presentRe})$`, 'i').test(t);
  const isRuntime  = t => /^\d+\\s*(?:m|min|мин)\\b/i.test(t);

  // 1) Обрабатываем КАЖДЫЙ блок meta-инфы ровно один раз, выбирая единственный якорь по приоритету
  document.querySelectorAll('.itemMiscInfo.itemMiscInfo-primary').forEach(box => {
    const items = Array.from(box.querySelectorAll('.mediaInfoItem'));
    const officialEl = box.querySelector('.mediaInfoItem.mediaInfoText.mediaInfoOfficialRating');
    const yearEl     = items.find(el => isYearish((el.textContent || '').trim()));
    const runtimeEl  = items.find(el => isRuntime((el.textContent || '').trim()));
    const lastItem   = box.querySelector('.mediaInfoItem:last-of-type');

    const anchor = officialEl || yearEl || runtimeEl || lastItem;
    if (anchor) insert(anchor, type, tmdbId, episodeInfo);
  });

  // 2) На случай, если официальный рейтинг есть вне .itemMiscInfo-primary (редко) — вставляем один раз и там
  document.querySelectorAll('.mediaInfoItem.mediaInfoText.mediaInfoOfficialRating').forEach(el => {
    if (!el.closest('.itemMiscInfo.itemMiscInfo-primary')) {
      insert(el, type, tmdbId, episodeInfo);
    }
  });
}

function insert(target, type, tmdbId, episodeInfo) {
  // удаляем предыдущий контейнер сразу после якоря
  while (target.nextElementSibling?.classList.contains('mdblist-rating-container')) {
    const old = target.nextElementSibling;
    try { old.__ratingsObserver?.disconnect(); } catch {}
    setBuiltInStarsHidden(getStarBox(old), false); // вернём звёзды на случай, если старый был пуст
    old.remove();
  }

  const container = document.createElement('div');
  container.className = 'mdblist-rating-container';
  container.style.cssText = 'display:inline-flex; align-items:center; margin-left:6px;';
  target.insertAdjacentElement('afterend', container);

  // <<< ВАЖНО: следим за наполнением контейнера и скрываем звёзды только когда есть данные >>>
  watchRatingContainer(container);
  
   // >>> Если это страница ЭПИЗОДА — грузим ТОЛЬКО рейтинг серии TMDb и выходим
  if (episodeInfo?.isEpisode) {
    fetchTmdbEpisodeRating(episodeInfo.tvId, episodeInfo.season, episodeInfo.episode, container);
    return;
  }
  
  // >>> Если это страница СЕЗОНА — грузим ТОЛЬКО рейтинг сезона TMDb и выходим
   if (episodeInfo?.isSeason) {
	fetchTmdbSeasonRating(episodeInfo.tvId, episodeInfo.season, container);
	return;
  }

  // дальше — ваш существующий код загрузки рейтингов
  fetchMDBList(type, tmdbId, container);

  if (currentImdbId) {
    fetchRTCertified(currentImdbId, certified => {
      if (certified) {
        const img = container.querySelector('img[data-source="tomatoes"]');
        if (img) img.src = LOGO.tomatoes_certified;
      }
    });
    fetchRTAudienceCertified(currentImdbId, positive => {
      if (positive) {
        const img = container.querySelector('img[data-source="audience"]');
        if (img) img.src = LOGO.rotten_ver;
      }
    });
    fetchMCMustSee(currentImdbId, mustSee => {
      if (mustSee) {
        const img = container.querySelector('img[data-source="metacritic"]');
        if (img) img.src = LOGO.metacriticms;
      }
    });
    fetchAllocineRatings(currentImdbId, container);
    fetchDoubanRating(currentImdbId, container, type);
  }
}


// === TMDb Episode Rating ===
function fetchTmdbEpisodeRating(tvId, season, episode, container) {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'api_key') {
    console.warn('[TMDb] API key is not set');
    return;
  }

  const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}`;

  GM_xmlhttpRequest({
    method: 'GET',
    url,
    onload(res) {
      if (res.status !== 200) {
        console.warn('[TMDb] episode status:', res.status);
        return;
      }
      let data;
      try { data = JSON.parse(res.responseText); }
      catch (e) {
        console.error('[TMDb] JSON parse error:', e);
        return;
      }

      const avg  = Number(data.vote_average);
      const cnt  = Number(data.vote_count);

      // Нет голосов — ничего не рисуем, чтобы встроенные звезды не скрылись
      if (!Number.isFinite(avg) || avg <= 0 || !Number.isFinite(cnt) || cnt <= 0) return;

      const valueText = avg.toFixed(1); // формат "7.8"
      const img = document.createElement('img');
      img.src = LOGO.tmdb;
      img.alt = 'TMDb';
      img.dataset.source = 'tmdb';
      img.title = `TMDb (Episode): ${valueText} • ${cnt} votes`;
      img.style.cssText = 'height:1.5em; margin-right:4px; vertical-align:middle;';
      container.appendChild(img);

      const span = document.createElement('span');
      span.textContent = valueText;
      span.style.cssText = 'margin-right:8px; font-size:1em; vertical-align:middle;';
      container.appendChild(span);
    },
    onerror(err) {
      console.error('[TMDb] episode request error:', err);
    }
  });
}

// === TMDb Season Rating ===
function fetchTmdbSeasonRating(tvId, season, container) {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'api_key') {
    console.warn('[TMDb] API key is not set');
    return;
  }

  const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${season}?api_key=${TMDB_API_KEY}`;

  GM_xmlhttpRequest({
    method: 'GET',
    url,
    onload(res) {
      if (res.status !== 200) {
        console.warn('[TMDb] season status:', res.status);
        return;
      }
      let data;
      try { data = JSON.parse(res.responseText); }
      catch (e) {
        console.error('[TMDb] JSON parse error:', e);
        return;
      }

      const avg = Number(data.vote_average);
      const cnt = Number(data.vote_count);

      // Нет голосов — ничего не рисуем, чтобы встроенные звезды не скрылись
      if (!Number.isFinite(avg) || avg <= 0 || !Number.isFinite(cnt) || cnt <= 0) return;

      const valueText = avg.toFixed(1);
      const img = document.createElement('img');
      img.src = LOGO.tmdb;
      img.alt = 'TMDb';
      img.dataset.source = 'tmdb';
      img.title = `TMDb (Season): ${valueText} • ${cnt} votes`;
      img.style.cssText = 'height:1.5em; margin-right:4px; vertical-align:middle;';
      container.appendChild(img);

      const span = document.createElement('span');
      span.textContent = valueText;
      span.style.cssText = 'margin-right:8px; font-size:1em; vertical-align:middle;';
      container.appendChild(span);
    },
    onerror(err) {
      console.error('[TMDb] season request error:', err);
    }
  });
}



  // === MDBList ===
  function fetchMDBList(type, tmdbId, container) {
    GM_xmlhttpRequest({
      method: 'GET',
      url: `https://api.mdblist.com/tmdb/${type}/${tmdbId}?apikey=${MDBLIST_API_KEY}`,
      onload(res) {
        if (res.status !== 200) return console.warn('MDBList status:', res.status);
        let data;
        try { data = JSON.parse(res.responseText); }
        catch (e) { return console.error('MDBList JSON parse error:', e); }

        container.dataset.originalTitle = data.original_title || data.title || '';
        container.dataset.year          = data.year || '';

        if (Array.isArray(data.ratings)) {
          data.ratings.forEach(r => {
            if (r.value == null) return;
            let key = r.source.toLowerCase().replace(/\s+/g, '_');
            if (key === 'tomatoes') key = r.value < 60 ? 'tomatoes_rotten' : 'tomatoes';
            else if (key.includes('popcorn')) key = r.value < 60 ? 'audience_rotten' : 'audience';
            else if (key.includes('metacritic') && !key.includes('user')) key = 'metacritic';
            else if (key.includes('metacritic') && key.includes('user')) key = 'metacriticus';
            else if (key.includes('roger_ebert')) key = 'rogerebert';
            else if (key.includes('trakt')) key = 'trakt';
            else if (key.includes('letterboxd')) key = 'letterboxd';
            else if (key.includes('myanimelist')) key = 'myanimelist';

            const logoUrl = LOGO[key];
            if (!logoUrl) return;

            const img = document.createElement('img');
            img.src = logoUrl;
            img.alt = r.source;
            img.title = `${r.source}: ${r.value}`;
            img.dataset.source = key;
            img.style.cssText = 'height:1.5em; margin-right:4px; vertical-align:middle;';
            container.appendChild(img);

            const span = document.createElement('span');
            span.textContent = r.value;
            span.style.cssText = 'margin-right:8px; font-size:1em; vertical-align:middle;';
            container.appendChild(span);
          });
        }

        if (currentImdbId) {
          fetchAniListRating(currentImdbId, container);
        }

        const title = container.dataset.originalTitle;
        const year  = parseInt(container.dataset.year, 10);
        if (title && year) {
          fetchKinopoiskRating(title, year, type, container);
        }
      }
    });
  }

  // === Kinopoisk ===
  function fetchKinopoiskRating(title, year, type, container) {
    const url = `https://kinopoiskapiunofficial.tech/api/v2.2/films?keyword=${encodeURIComponent(title)}&yearFrom=${year}&yearTo=${year}`;
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      headers: {
        'X-API-KEY': KINOPOISK_API_KEY,
        'Content-Type': 'application/json'
      },
      onload(res) {
        if (res.status !== 200) return console.warn('KP status:', res.status);
        let data;
        try { data = JSON.parse(res.responseText); }
        catch (e) { return console.error('KP JSON parse error:', e); }

        const list = data.items || data.films || [];
        if (!list.length) return console.warn('KP no items for', title);

        const desired = type === 'show' ? 'TV_SERIES' : 'FILM';
        const item = list.find(i => i.type === desired) || list[0];
        if (item.ratingKinopoisk == null) return;

        const img = document.createElement('img');
        img.src = LOGO.kinopoisk;
        img.alt = 'Kinopoisk';
        img.title = `Kinopoisk: ${item.ratingKinopoisk}`;
        img.dataset.source = 'kinopoisk';
        img.style.cssText = 'height:1.5em; margin-right:4px; vertical-align:middle;';
        container.appendChild(img);

        const span = document.createElement('span');
        span.textContent = item.ratingKinopoisk;
        span.style.cssText = 'margin-right:8px; font-size:1em; vertical-align:middle;';
        container.appendChild(span);
      }
    });
  }

  // === AniList integration ===
  function getAnilistId(imdbId, cb) {
    const sparql = `
      SELECT ?anilist WHERE {
        ?item wdt:P345 "${imdbId}" .
        ?item wdt:P8729 ?anilist .
      } LIMIT 1`;
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql),
      onload(res) {
        if (res.status !== 200) return cb(null);
        let json;
        try { json = JSON.parse(res.responseText); }
        catch { return cb(null); }
        const b = json.results.bindings;
        cb(b.length && b[0].anilist?.value ? b[0].anilist.value : null);
      },
      onerror: () => cb(null)
    });
  }

  function fetchAniListRating(imdbId, container) {
    getAnilistId(imdbId, id => {
      if (id) {
        queryAniListById(id, container);
      } else {
        const title = container.dataset.originalTitle;
        const year  = parseInt(container.dataset.year, 10);
        if (title && year) queryAniListBySearch(title, year, container);
      }
    });
  }

  function queryAniListById(id, container) {
    const query = `
      query($id:Int){
        Media(id:$id,type:ANIME){
          id meanScore
        }
      }`;
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://graphql.anilist.co',
      headers: {'Content-Type':'application/json'},
      data: JSON.stringify({ query, variables: { id: parseInt(id, 10) } }),
      onload(res) {
        if (res.status !== 200) return;
        let json;
        try { json = JSON.parse(res.responseText); }
        catch { return; }
        const m = json.data?.Media;
        if (m?.meanScore > 0) appendAniList(container, m.id, m.meanScore);
      }
    });
  }

  function queryAniListBySearch(title, year, container) {
    const query = `
      query($search:String,$startDate:FuzzyDateInt,$endDate:FuzzyDateInt){
        Media(
          search:$search,
          type:ANIME,
          startDate_greater:$startDate,
          startDate_lesser:$endDate
        ){
          id meanScore title { romaji english native } startDate { year }
        }
      }`;
    const vars = {
      search:    title,
      startDate: parseInt(`${year}0101`, 10),
      endDate:   parseInt(`${year+1}0101`, 10)
    };
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://graphql.anilist.co',
      headers: {'Content-Type':'application/json'},
      data: JSON.stringify({ query, variables: vars }),
      onload(res) {
        if (res.status !== 200) return;
        let json;
        try { json = JSON.parse(res.responseText); }
        catch { return; }
        const m = json.data?.Media;
        if (m?.meanScore > 0 && m.startDate?.year === year) {
          const norm = s => s.toLowerCase().trim();
          const t0 = norm(title);
          const titles = [m.title.romaji, m.title.english, m.title.native]
            .filter(Boolean).map(norm);
          if (titles.includes(t0)) appendAniList(container, m.id, m.meanScore);
        }
      }
    });
  }

  function appendAniList(container, mediaId, score) {
    const img = document.createElement('img');
    img.src = LOGO.anilist;
    img.alt = 'AniList';
    img.title = `AniList: ${score}`;
    img.dataset.source = 'anilist';
    img.style.cssText = 'height:1.5em; margin-right:4px; vertical-align:middle;';
    container.appendChild(img);

    const span = document.createElement('span');
    span.textContent = score;
    span.style.cssText = 'margin-right:8px; font-size:1em; vertical-align:middle;';
    container.appendChild(span);
  }

  // === Rotten Tomatoes certified critics ===
  function fetchRTCertified(imdbId, cb) {
    const sparql = `
      SELECT ?rtid WHERE {
        ?item wdt:P345 "${imdbId}" .
        ?item wdt:P1258 ?rtid .
      } LIMIT 1`;
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql),
      onload(res) {
        if (res.status !== 200) return cb(false);
        let json;
        try { json = JSON.parse(res.responseText); } catch { return cb(false); }
        const b = json.results.bindings;
        if (!b.length || !b[0].rtid.value) return cb(false);
        const id = b[0].rtid.value;
        const rtUrl = id.startsWith('http') ? id : 'https://www.rottentomatoes.com/' + id;
        GM_xmlhttpRequest({
          method: 'GET',
          url: rtUrl,
          onload(r) {
            if (r.status !== 200) return cb(false);
            const m = r.responseText.match(/<script\s+id="media-scorecard-json"[^>]*>([\s\S]*?)<\/script>/);
            if (!m) return cb(false);
            let obj;
            try { obj = JSON.parse(m[1]); } catch { return cb(false); }
            cb(!!(obj.criticsScore && obj.criticsScore.certified));
          },
          onerror: () => cb(false)
        });
      },
      onerror: () => cb(false)
    });
  }

  // === Rotten Tomatoes positive audience ===
  function fetchRTAudienceCertified(imdbId, cb) {
    const sparql = `
      SELECT ?rtid WHERE {
        ?item wdt:P345 "${imdbId}" .
        ?item wdt:P1258 ?rtid .
      } LIMIT 1`;
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql),
      onload(res) {
        if (res.status !== 200) return cb(false);
        let json;
        try { json = JSON.parse(res.responseText); } catch { return cb(false); }
        const b = json.results.bindings;
        if (!b.length || !b[0].rtid.value) return cb(false);
        const id = b[0].rtid.value;
        const rtUrl = id.startsWith('http') ? id : 'https://www.rottentomatoes.com/' + id;
        GM_xmlhttpRequest({
          method: 'GET',
          url: rtUrl,
          onload(r) {
            if (r.status !== 200) return cb(false);
            const m = r.responseText.match(/<script\s+id="media-scorecard-json"[^>]*>([\s\S]*?)<\/script>/);
            if (!m) return cb(false);
            const jsonStr = m[1];
            cb(jsonStr.includes('POSITIVE","certified":true'));
          },
          onerror: () => cb(false)
        });
      },
      onerror: () => cb(false)
    });
  }

  // === Metacritic must-see ===
  function fetchMCMustSee(imdbId, cb) {
    GM_xmlhttpRequest({
      method: 'GET',
      url: `https://www.imdb.com/title/${imdbId}/criticreviews`,
      onload(res) {
        const doc = new DOMParser().parseFromString(res.responseText, 'text/html');
        const row = doc.querySelector('[data-testid="critic-reviews-title"]');
        if (!row) return cb(false);
        const ch   = Array.from(row.children);
        const crit = parseInt(ch[0]?.textContent.trim(), 10) || 0;
        const cnt  = parseInt(ch[1]?.children[1]?.textContent.trim().split(' ')[0], 10) || 0;
        cb(crit > 80 && cnt > 14);
      },
      onerror: () => cb(false)
    });
  }

  // === AlloCiné Integration ===
  function getAllocineID(imdbId, cb) {
    const sparql = `
      SELECT ?film ?serie WHERE {
        ?item wdt:P345 "${imdbId}" .
        OPTIONAL { ?item wdt:P1265 ?film. }
        OPTIONAL { ?item wdt:P1267 ?serie. }
      } LIMIT 1`;
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql),
      onload(res) {
        if (res.status !== 200) return cb(null, null);
        let json;
        try { json = JSON.parse(res.responseText); } catch { return cb(null, null); }
        const b = json.results.bindings[0] || {};
        const filmId  = b.film?.value;
        const serieId = b.serie?.value;
        if (filmId)  return cb(filmId, true);
        if (serieId) return cb(serieId, false);
        cb(null, null);
      }
    });
  }

  function fetchAllocineRatings(imdbId, container) {
    getAllocineID(imdbId, (id, isFilm) => {
      if (!id) return;
      const path = isFilm
        ? `film/fichefilm_gen_cfilm=${id}`
        : `series/ficheserie_gen_cserie=${id}`;
      const url = `https://www.allocine.fr/${path}.html`;
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        onload(res) {
          if (res.status !== 200) return;
          const doc   = new DOMParser().parseFromString(res.responseText, 'text/html');
          const notes = doc.querySelectorAll('.stareval-note');
          if (!notes.length) return;

          // Критики
          const critVal = Math.round(parseFloat(notes[0].textContent.trim().replace(',', '.')) * 20);
          if (!isNaN(critVal)) {
            const imgCrit = document.createElement('img');
            imgCrit.src = LOGO.allocine_crit;
            imgCrit.alt = 'AlloCiné Crit';
            imgCrit.style.cssText = 'height:1.5em; margin-right:4px; vertical-align:middle;';
            container.appendChild(imgCrit);

            const spanCrit = document.createElement('span');
            spanCrit.textContent = critVal;
            spanCrit.style.cssText = 'margin-right:8px; font-size:1em; vertical-align:middle;';
            container.appendChild(spanCrit);
          }

          // Пользователи
          if (notes[1]) {
            const userVal = Math.round(parseFloat(notes[1].textContent.trim().replace(',', '.')) * 20);
            if (!isNaN(userVal)) {
              const imgUser = document.createElement('img');
              imgUser.src = LOGO.allocine_user;
              imgUser.alt = 'AlloCiné User';
              imgUser.style.cssText = 'height:1.5em; margin-right:4px; vertical-align:middle;';
              container.appendChild(imgUser);

              const spanUser = document.createElement('span');
              spanUser.textContent = userVal;
              spanUser.style.cssText = 'margin-right:8px; font-size:1em; vertical-align:middle;';
              container.appendChild(spanUser);
            }
          }
        }
      });
    });
  }

  // === Douban Integration ===
// 0. JSON-предиктивный поиск по запросу (IMDb ID или оригинальное название)
async function getDoubanID0_1(query) {
  try {
    const res = await fetch(`https://movie.douban.com/j/subject_suggest?q=${encodeURIComponent(query)}`);
    if (!res.ok) return "00000000";
    const list = await res.json();
    if (!list.length || !list[0].url) return "00000000";
    const m = list[0].url.match(/subject\/(\d+)/);
    return m ? m[1] : "00000000";
  } catch {
    return "00000000";
  }
}

// 0.2 HTML-поиск по той же строке
async function getDoubanID0_2(query) {
  try {
    const res = await fetch(`https://movie.douban.com/subject_search?search_text=${encodeURIComponent(query)}`);
    if (!res.ok) return "00000000";
    const html = await res.text();
    const m = html.match(/href="https:\/\/movie\.douban\.com\/subject\/(\d+)\//);
    return m ? m[1] : "00000000";
  } catch {
    return "00000000";
  }
}

// 1. Парсинг первой ссылки из HTML-поиска
async function getDoubanID1(query) {
  try {
    const res = await fetch(`https://movie.douban.com/subject_search?search_text=${encodeURIComponent(query)}`);
    if (!res.ok) return "00000000";
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const link = doc.querySelector('.subject-item .title a');
    if (!link) return "00000000";
    const m = link.href.match(/subject\/(\d+)/);
    return m ? m[1] : "00000000";
  } catch {
    return "00000000";
  }
}

// 2. Wikidata P4529
async function getDoubanID2(query) {
  const sparql = `
    SELECT ?douban WHERE {
      ?item wdt:P345 "${query}" .
      ?item wdt:P4529 ?douban .
    } LIMIT 1`;
  try {
    const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql);
    const res = await fetch(url);
    if (!res.ok) return "00000000";
    const json = await res.json();
    const b = json.results.bindings;
    if (b.length && b[0].douban?.value) {
      const parts = b[0].douban.value.split('/');
      return parts[parts.length-1];
    }
    return "00000000";
  } catch {
    return "00000000";
  }
}

// 3. Google site-search
async function getDoubanID3(query) {
  try {
    const res = await fetch(`https://www.google.com/search?q=site:movie.douban.com/subject+${encodeURIComponent(query)}`);
    if (!res.ok) return "00000000";
    const html = await res.text();
    const m = html.match(/movie\.douban\.com\/subject\/(\d+)\//);
    return m ? m[1] : "00000000";
  } catch {
    return "00000000";
  }
}

// Основная функция
async function fetchDoubanRating(imdbId, container, type) {
  // Для сериалов ищем по оригинальному названию, иначе — по IMDb ID
  const query = (type === 'show' && container.dataset.originalTitle)
    ? container.dataset.originalTitle
    : imdbId;

  // последовательно пробуем все методы
  let id = await getDoubanID0_1(query);
  if (id === "00000000") id = await getDoubanID0_2(query);
  if (id === "00000000") id = await getDoubanID1(query);
  if (id === "00000000") id = await getDoubanID2(query);
  if (id === "00000000") id = await getDoubanID3(query);
  if (id === "00000000") return;  // не нашли ни одного

  const url = `https://movie.douban.com/subject/${id}`;
  GM_xmlhttpRequest({
    method: "GET",
    url,
    headers: {
      "Referer": "https://movie.douban.com/",
      "User-Agent": navigator.userAgent
    },
    onload(res) {
      if (res.status !== 200) return;
      const doc = new DOMParser().parseFromString(res.responseText, 'text/html');
      const el = doc.querySelector('.rating_num');
      if (!el) return;
      const raw = el.textContent.trim();
      if (!raw || isNaN(raw)) return;
      const score = Math.round(parseFloat(raw) * 10);

      // вставляем иконку
      const img = document.createElement('img');
      img.src = LOGO.douban;
      img.alt = 'Douban';
      img.title = `Douban: ${score}`;
      img.dataset.source = 'douban';
      img.style.cssText = 'height:1.5em; margin-right:4px; vertical-align:middle;';
      container.appendChild(img);

      // вставляем цифру
      const span = document.createElement('span');
      span.textContent = score;
      span.style.cssText = 'margin-right:8px; font-size:1em; vertical-align:middle;';
      container.appendChild(span);
    }
  });
}

})();
