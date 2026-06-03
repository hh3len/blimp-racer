export function insertLayout(activePage) {
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = `
        <a href="index.html" class="nav-logo">AMASS AIRSHIP // FLIGHT SIMULATOR </a>
        <div class="nav-links">
            <a href="/levels.html" class="${activePage === 'levels' ? 'active' : ''}">PLAY</a>
            <a href="/leaderboard.html" class="${activePage === 'leaderboard' ? 'active' : ''}">LEADERBOARD</a>
            <a href="/about.html" class="${activePage === 'about' ? 'active' : ''}">ABOUT</a>
        </div>
    `;

    document.body.prepend(nav);

    const footer = document.createElement('footer');
    footer.innerHTML = `
        <span>AIRSHIP FLIGHT SIMULATOR v0.11.60</span>
        <span>H. LING</span>
    `;
    document.body.append(footer);
}