// Reloading the page (F5) normally restores the browser's remembered
// scroll position rather than starting at the top; forcing this keeps
// every refresh landing back at the top of the page instead.
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const content_dir = 'contents/'
const config_file = 'config.yml'
const people_file = 'people.yml'
const news_file = 'news.yml'
const achievements_file = 'achievements.yml'
const section_names = ['home'];

function socialLinksHtml(p) {
    // These 4 icons are always inert for now (avatar click handles the
    // homepage jump) — "javascript:void(0)" so nothing navigates, unlike
    // plain "#" which jumps the page to the top. IMPORTANT: target="_blank"
    // must NOT be present when the href is the placeholder — some browsers
    // still pop a blank new tab for a javascript: href when target="_blank"
    // is set, even though the href itself does nothing.
    const PLACEHOLDER = 'javascript:void(0)';
    const links = p.links || {};

    function iconLink(href, iconClass, label) {
        const blank = href === PLACEHOLDER ? '' : ' target="_blank" rel="noopener"';
        return '<a href="' + href + '"' + blank + ' aria-label="' + label + '"><i class="bi ' + iconClass + '"></i></a>';
    }

    const emailHref = links.email ? 'mailto:' + links.email : PLACEHOLDER;
    const githubHref = links.github || PLACEHOLDER;
    const scholarHref = links.scholar || PLACEHOLDER;
    const items = [
        iconLink(PLACEHOLDER, 'bi-house-fill', 'Homepage'),
        iconLink(emailHref, 'bi-envelope-fill', 'Email'),
        iconLink(githubHref, 'bi-github', 'GitHub'),
        iconLink(scholarHref, 'bi-mortarboard-fill', 'Google Scholar')
    ];
    return '<div class="person-links">' + items.join('') + '</div>';
}

function personCardHtml(p) {
    const avatar = p.photo
        ? '<img src="' + p.photo + '" alt="' + p.name + '">'
        : '<i class="bi bi-person-fill"></i>';
    const caption = [p.title, p.subtitle, p.period, p.supervisor, p.research]
        .filter(Boolean)
        .join('<br>');
    // Clicking the avatar jumps to the homepage; the name stays plain text
    // (never underlined), and the icon row below is separate — email/github/
    // scholar icons are their own links, so avatar link + icon links don't nest.
    const avatarBlock = '<div class="person-avatar">' + avatar + '</div>';
    const avatarHtml = p.homepage
        ? '<a class="person-avatar-link" href="' + p.homepage + '" target="_blank" rel="noopener">' + avatarBlock + '</a>'
        : avatarBlock;
    const nameHtml = avatarHtml
        + '<div class="person-name">' + p.name + '</div>';
    return '<div class="person-card">'
        + nameHtml
        + '<div class="person-caption">' + caption + '</div>'
        + socialLinksHtml(p)
        + '</div>';
}

function peopleGroupHtml(role, members, lead) {
    const headingClass = 'people-role-heading' + (lead ? ' people-role-heading--lead' : '');
    let html = role ? '<div class="' + headingClass + '">' + role + '</div>' : '';
    if (!members || members.length === 0) {
        html += '<div class="people-empty">Coming soon</div>';
    } else {
        html += '<div class="people-grid">' + members.map(personCardHtml).join('') + '</div>';
    }
    return html;
}

function newsCarouselHtml(items) {
    if (!items || items.length === 0) {
        return '<div class="people-empty">Coming soon</div>';
    }
    // Prev/next controls are a single pair of siblings of .carousel-inner
    // (standard Bootstrap structure) rather than living inside each sliding
    // .carousel-item, so their on-screen position stays put across slide
    // transitions instead of sliding/disappearing along with the slide.
    // Every slide (photo or text) renders its media at the same fixed
    // aspect-ratio box, so the image's position is identical slide to
    // slide - positionNewsCarouselControls() (in the fetch handler) measures
    // it once and pins these buttons to it.
    const slides = items.map((item, idx) => {
        const media = item.image
            ? '<img class="news-slide-img" src="' + item.image + '" alt="">'
            : '<div class="news-slide-img news-slide-img--placeholder"><i class="bi bi-newspaper"></i></div>';
        return '<div class="carousel-item' + (idx === 0 ? ' active' : '') + '">'
            + '<div class="news-slide">'
            + '<div class="news-slide-media">' + media + '</div>'
            + '<div class="news-slide-body">'
            + '<span class="news-date">' + item.date + '</span>'
            + '<p class="news-text">' + item.text + '</p>'
            + '</div>'
            + '</div>'
            + '</div>';
    }).join('');
    const indicators = items.map((item, idx) =>
        '<button type="button" data-bs-target="#newsCarousel" data-bs-slide-to="' + idx + '"'
        + (idx === 0 ? ' class="active" aria-current="true"' : '')
        + ' aria-label="Slide ' + (idx + 1) + '"></button>'
    ).join('');
    return '<div id="newsCarousel" class="carousel slide news-carousel">'
        + '<div class="carousel-inner">' + slides + '</div>'
        + (items.length > 1 ? (
            '<button class="carousel-control-prev" type="button" data-bs-target="#newsCarousel" data-bs-slide="prev">'
            + '<span class="carousel-control-prev-icon" aria-hidden="true"></span>'
            + '<span class="visually-hidden">Previous</span></button>'
            + '<button class="carousel-control-next" type="button" data-bs-target="#newsCarousel" data-bs-slide="next">'
            + '<span class="carousel-control-next-icon" aria-hidden="true"></span>'
            + '<span class="visually-hidden">Next</span></button>'
            + '<div class="carousel-indicators">' + indicators + '</div>'
        ) : '')
        + '</div>';
}

// Pins the prev/next buttons (siblings of .carousel-inner, so their
// position is unaffected by which slide is currently sliding through) to
// the vertical center of the news image, plus a small downward nudge.
// Every slide shares the same fixed aspect-ratio media box, so measuring
// whichever slide happens to be active is representative of all of them.
function positionNewsCarouselControls() {
    const carouselEl = document.getElementById('newsCarousel');
    if (!carouselEl) return;
    const media = carouselEl.querySelector('.carousel-item.active .news-slide-media');
    const prev = carouselEl.querySelector('.carousel-control-prev');
    const next = carouselEl.querySelector('.carousel-control-next');
    if (!media || !prev || !next) return;
    const carouselTop = carouselEl.getBoundingClientRect().top;
    const mediaBox = media.getBoundingClientRect();
    const centerY = (mediaBox.top - carouselTop) + mediaBox.height / 2 + 16; // +1rem nudge down
    prev.style.top = centerY + 'px';
    next.style.top = centerY + 'px';
}

// Reformats "2026.09" -> "[Sep 2026]", matching the bracketed-date style
// used on academic homepages like zw-zhang.github.io.
function bracketedDate(dateStr) {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = dateStr.split('.');
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const month = MONTHS[monthIdx] || parts[1];
    return '[' + month + ' ' + year + ']';
}

// Text-list view of the news items, paginated, with a year heading whenever
// the year changes within a page — same underlying data as the carousel,
// shown side-by-side with it instead of duplicating a huge unpaginated list.
// Page breaks are height-based rather than a fixed item count: each page
// holds as many items as fit within the carousel column's rendered height,
// so the two columns line up regardless of how long each news item's text is.
let newsPageState = { pages: [[]], page: 1 };

function newsListItemsHtml(items) {
    let html = '';
    let openList = '';
    let currentYear = null;
    items.forEach(it => {
        const year = it.date.split('.')[0];
        if (year !== currentYear) {
            if (openList) {
                html += '<ul class="news-list">' + openList + '</ul>';
                openList = '';
            }
            html += '<h5 class="news-list-year">' + year + '</h5>';
            currentYear = year;
        }
        openList += '<li><span class="news-list-date">' + bracketedDate(it.date) + '</span> ' + it.text + '</li>';
    });
    if (openList) html += '<ul class="news-list">' + openList + '</ul>';
    return html;
}

// Renders successive candidate pages into an offscreen element (same width
// as the real list column) to measure their height against targetHeight,
// without ever flashing the measurement DOM on screen.
function computeNewsPages(sortedItems, targetHeight) {
    const listCol = document.querySelector('.news-list-col');
    const width = listCol ? listCol.getBoundingClientRect().width : 400;

    const measurer = document.createElement('div');
    measurer.style.cssText = 'position:absolute; visibility:hidden; pointer-events:none; left:-9999px; top:0; width:' + width + 'px;';
    const wrap = document.createElement('div');
    wrap.className = 'news-list-wrap';
    measurer.appendChild(wrap);
    document.body.appendChild(measurer);

    const pages = [];
    let currentPage = [];
    sortedItems.forEach(it => {
        const candidate = currentPage.concat([it]);
        wrap.innerHTML = newsListItemsHtml(candidate);
        if (wrap.offsetHeight <= targetHeight || currentPage.length === 0) {
            currentPage = candidate;
        } else {
            pages.push(currentPage);
            currentPage = [it];
        }
    });
    if (currentPage.length) pages.push(currentPage);
    if (pages.length === 0) pages.push([]);

    document.body.removeChild(measurer);
    return pages;
}

function renderNewsListPage() {
    const pages = newsPageState.pages;
    const totalPages = Math.max(1, pages.length);
    const page = Math.min(Math.max(1, newsPageState.page), totalPages);
    newsPageState.page = page;
    const pageItems = pages[page - 1] || [];

    document.getElementById('news-list-md').innerHTML = '<div class="news-list-wrap">' + newsListItemsHtml(pageItems) + '</div>';

    let pagerHtml = '';
    if (totalPages > 1) {
        pagerHtml = '<button class="news-page-nav" data-page="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + '>&lsaquo;</button>';
        for (let p = 1; p <= totalPages; p++) {
            pagerHtml += '<button class="news-page-btn' + (p === page ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
        }
        pagerHtml += '<button class="news-page-nav" data-page="' + (page + 1) + '"' + (page === totalPages ? ' disabled' : '') + '>&rsaquo;</button>';
    }
    document.getElementById('news-pagination').innerHTML = pagerHtml;
}

function initNewsPagination(items) {
    const sorted = [...(items || [])].sort((a, b) => b.date.localeCompare(a.date));
    const carouselEl = document.getElementById('news-md');
    const targetHeight = carouselEl ? carouselEl.offsetHeight : 400;
    newsPageState = { pages: computeNewsPages(sorted, targetHeight), page: 1 };
    renderNewsListPage();
    document.getElementById('news-pagination').addEventListener('click', event => {
        const btn = event.target.closest('[data-page]');
        if (!btn || btn.disabled) return;
        newsPageState.page = parseInt(btn.getAttribute('data-page'), 10);
        renderNewsListPage();
    });
}

function achievementsHtml(data) {
    const publications = (data && data.publications) || [];
    const patents = (data && data.patents) || [];

    function renderList(title, items) {
        let html = '<div class="people-role-heading">' + title + '</div>';
        if (items.length === 0) {
            html += '<div class="people-empty">Coming soon</div>';
        } else {
            const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
            html += '<ul class="news-list">' + sorted.map((it, idx) =>
                '<li class="' + (idx === 0 ? 'achievement-new' : '') + '">'
                + '<span class="news-list-date">' + bracketedDate(it.date) + '</span> '
                + it.text + '</li>'
            ).join('') + '</ul>';
        }
        return html;
    }

    return renderList('Publications', publications) + renderList('Patents', patents);
}

// Bootstrap's own IntersectionObserver-based ScrollSpy turned out unreliable
// for whole-page, tall-section layouts (confirmed on the personal site — see
// its scripts.js for the writeup); this direct scroll-position check is used
// here instead, for the same reason.
function initScrollSpy() {
    const navLinks = Array.from(document.querySelectorAll('#navbarResponsive .nav-link[href^="#"]'));
    const sections = navLinks
        .map(link => document.getElementById(link.getAttribute('href').slice(1)))
        .filter(Boolean);
    if (sections.length === 0) return null;

    const NAV_OFFSET = 90;

    function updateActive() {
        const scrollPos = window.scrollY + NAV_OFFSET;
        let activeIndex = 0;
        sections.forEach((section, i) => {
            if (section.offsetTop <= scrollPos) activeIndex = i;
        });
        navLinks.forEach((link, i) => {
            link.classList.toggle('active', i === activeIndex);
        });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
    return updateActive;
}

function alumniHtml(alumni) {
    let html = '<div class="people-role-heading">Alumni</div>';
    if (!alumni || alumni.length === 0) {
        html += '<div class="people-empty">No alumni yet</div>';
    } else {
        const rows = alumni.map(a =>
            '<tr><td>' + a.name + '</td><td>' + a.degree + '</td><td>' + a.year + '</td></tr>'
        ).join('');
        html += '<table class="alumni-table"><thead><tr><th>Name</th><th>Degree</th><th>Year</th></tr></thead>'
            + '<tbody>' + rows + '</tbody></table>';
    }
    return html;
}


window.addEventListener('DOMContentLoaded', event => {

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    const configLoaded = fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Team (structured yaml): Group Leader and Academic Advisors are each their
    // own section, stacked, with matching bold headings so neither reads as
    // "above" the other despite the vertical order.
    const peopleLoaded = fetch(content_dir + people_file)
        .then(response => response.text())
        .then(text => {
            const data = jsyaml.load(text);
            const groups = data.groups || [];

            let html = '';
            groups.forEach((group, idx) => {
                const isLeader = group.role === 'Group Leader';
                html += peopleGroupHtml(group.role, group.members, isLeader);
                if (idx === 0 && data.showAcademicAdvisors) {
                    html += peopleGroupHtml('Academic Advisors', data.academicAdvisors, true);
                }
            });
            html += alumniHtml(data.alumni);

            document.getElementById('people-md').innerHTML = html;
        })
        .catch(error => console.log(error));

    // News (structured yaml): auto-rotating photo carousel, plus a plain
    // text list grouped by year underneath (same data, two presentations).
    const newsLoaded = fetch(content_dir + news_file)
        .then(response => response.text())
        .then(text => {
            const data = jsyaml.load(text);
            document.getElementById('news-md').innerHTML = newsCarouselHtml(data.items);
            const carouselEl = document.getElementById('newsCarousel');
            if (carouselEl) {
                new bootstrap.Carousel(carouselEl, { interval: 4000, ride: 'carousel', pause: 'hover' });
                positionNewsCarouselControls();
                window.addEventListener('resize', positionNewsCarouselControls);
            }
            initNewsPagination(data.items);
        })
        .catch(error => console.log(error));

    // Achievements (structured yaml): publications / patents lists.
    const achievementsLoaded = fetch(content_dir + achievements_file)
        .then(response => response.text())
        .then(text => {
            const data = jsyaml.load(text);
            document.getElementById('achievements-md').innerHTML = achievementsHtml(data);
        })
        .catch(error => console.log(error));

    // Marked
    marked.use({ mangle: false, headerIds: false })
    const sectionsLoaded = section_names.map((name, idx) =>
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error))
    );

    // Section heights only settle once all async content above has actually
    // rendered, so the scrollspy is (re)initialized only after that.
    Promise.allSettled([configLoaded, peopleLoaded, newsLoaded, achievementsLoaded, ...sectionsLoaded]).then(() => {
        const refresh = initScrollSpy();
        if (refresh) refresh();
    });

});
