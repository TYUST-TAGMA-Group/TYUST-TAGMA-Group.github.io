// Reloading the page (F5) normally restores the browser's remembered
// scroll position rather than starting at the top; forcing this keeps
// every refresh landing back at the top of the page instead.
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'awards', 'experience', 'publications'];


// Bootstrap's own IntersectionObserver-based ScrollSpy (5.2.x) turned out to
// never update the active nav link on this page (confirmed: section
// positions correctly shift as the page scrolls, but the highlighted link
// stayed frozen on the first one regardless of scroll position). Rather than
// fight that, this does the same job directly: on scroll, find the last
// section whose top has passed the fixed-nav offset and mark its nav link.
function initScrollSpy() {
    const navLinks = Array.from(document.querySelectorAll('#navbarResponsive .nav-link[href^="#"]'));
    const sections = navLinks
        .map(link => document.getElementById(link.getAttribute('href').slice(1)))
        .filter(Boolean);
    if (sections.length === 0) return;

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

window.addEventListener('DOMContentLoaded', event => {

    // Section heights change once async content (fetched below) finishes
    // rendering, which shifts every subsequent section's offsetTop — so the
    // scrollspy is (re)initialized only after that content has loaded.
    let refreshScrollSpy = null;

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

    Promise.allSettled([configLoaded, ...sectionsLoaded]).then(() => {
        refreshScrollSpy = initScrollSpy();
        if (refreshScrollSpy) refreshScrollSpy();
    });

});
