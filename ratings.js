(function() {
    'use strict';

    const API_KEY = 'api_key';

    const LOGO_URLS = {
        imdb:            'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/IMDb.png',
        tmdb:            'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/TMDB.png',
        tomatoes:        'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Rotten_Tomatoes.png',
        tomatoes_rotten: 'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Rotten_Tomatoes_rotten.png',
        audience:        'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Rotten_Tomatoes_positive_audience.png',
        audience_rotten: 'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Rotten_Tomatoes_negative_audience.png',
        metacritic:      'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Metacritic.png',
        metacriticus:    'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/mus2.png',
        trakt:           'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Trakt.png',
        letterboxd:      'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/letterboxd.png',
        rogerebert:      'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/Roger_Ebert.png',
        kinopoisk:       'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/kinopoisk.png',
        myanimelist:     'https://cdn.jsdelivr.net/gh/Druidblack/jellyfin_ratings@main/logo/mal.png'
    };

    // Основная функция сканирования и обработки ссылок
    function scanAndProcessLinks() {
        // Скрываем содержимое оригинальных рейтингов (звёздного и критических)
        // путем установки прозрачного цвета и нулевого размера шрифта
        document.querySelectorAll(
            'div.starRatingContainer.mediaInfoItem,' +
            'div.mediaInfoItem.mediaInfoCriticRating.mediaInfoCriticRatingFresh,' +
            'div.mediaInfoItem.mediaInfoCriticRating.mediaInfoCriticRatingRotten'
        ).forEach(el => {
            el.style.color = 'transparent';
            el.style.fontSize = '0';
        });

        // Обрабатываем все новые TMDB-ссылки
        document.querySelectorAll('a.emby-button[href*="themoviedb.org/"]').forEach(link => {
            if (link._mdblistProcessed) return;
            link._mdblistProcessed = true;
            processLink(link);
        });
    }

    function processLink(link) {
        const m = link.href.match(/themoviedb\.org\/(movie|tv)\/(\d+)/);
        if (!m) return;
        const type   = m[1] === 'tv' ? 'show' : 'movie';
        const tmdbId = m[2];

        // Вставить контейнер после officialRating или длительности
        const officialEls = document.querySelectorAll('div.mediaInfoItem.mediaInfoText.mediaInfoOfficialRating');
        if (officialEls.length) {
            officialEls.forEach(el => insertContainer(el, type, tmdbId));
        } else {
            document.querySelectorAll('div.mediaInfoItem').forEach(el => {
                if (/^\d+\s*(?:h(?:ours?)?)?\s*\d*\s*m(?:inutes?)?$/i.test(el.textContent.trim())) {
                    insertContainer(el, type, tmdbId);
                }
            });
        }
    }

    function insertContainer(target, type, tmdbId) {
        const next = target.nextElementSibling;
        if (next && next.classList.contains('mdblist-rating-container')) {
            next.remove();
        }
        const container = document.createElement('div');
        container.className = 'mdblist-rating-container';
        container.style.cssText = 'display:inline-flex; align-items:center; margin-left:6px;';
        target.insertAdjacentElement('afterend', container);
        fetchRatings(type, tmdbId, container);
    }

    function fetchRatings(type, tmdbId, container) {
        const url = `https://api.mdblist.com/tmdb/${type}/${tmdbId}?apikey=${API_KEY}`;
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data.ratings)) return;

                data.ratings.forEach(r => {
                    if (r.value == null) return;
                    let key = r.source.toLowerCase().replace(/\s+/g,'_');
                    if (key === 'tomatoes') {
                        key = r.value < 60 ? 'tomatoes_rotten' : 'tomatoes';
                    } else if (key.includes('popcorn')) {
                        key = r.value < 60 ? 'audience_rotten' : 'audience';
                    } else if (key.includes('metacritic') && key.includes('user')) {
                        key = 'metacriticus';
                    } else if (key.includes('roger_ebert')) {
                        key = 'rogerebert';
                    } else if (key.includes('myanimelist')) {
                        key = 'myanimelist';
                    }

                    const logoUrl = LOGO_URLS[key];
                    if (logoUrl) {
                        const img = document.createElement('img');
                        img.src = logoUrl;
                        img.alt = r.source;
                        img.title = `${r.source}: ${r.value}`;
                        img.style.height = '1.5em';
                        img.style.marginRight = '4px';
                        img.style.verticalAlign = 'middle';
                        container.appendChild(img);
                    }

                    const span = document.createElement('span');
                    span.textContent = logoUrl ? `${r.value}` : `${r.source}: ${r.value}`;
                    span.style.marginRight = '8px';
                    span.style.fontSize = '1em';
                    span.style.verticalAlign = 'middle';
                    container.appendChild(span);
                });
            })
            .catch(err => console.error('MDBList fetch error:', err));
    }

    // Запуск сканирования каждые секунду
    setInterval(scanAndProcessLinks, 1000);
    scanAndProcessLinks();
})();