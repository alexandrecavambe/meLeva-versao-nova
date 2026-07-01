document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.side-bottom-item a');

    function clearActive() {
        links.forEach(link => {
            const icon = link.querySelector('i');
            if (icon) icon.classList.remove('active');
        });
    }

    function setActiveByURL() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        clearActive();

        links.forEach(link => {
            const href = link.getAttribute('href');
            const icon = link.querySelector('i');

            const isCurrentPage = href === currentPage;
            const isHomePlaceholder = href === '#' && (currentPage === '' || currentPage === 'index.html');

            if (isCurrentPage || isHomePlaceholder) {
                icon.classList.add('active');
            }
        });
    }

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const icon = this.querySelector('i');

            // Links "#" ainda não têm página própria, então só atualiza o visual
            if (href === '#' || href === '') {
                e.preventDefault();
                clearActive();
                icon.classList.add('active');
            }
            // Links reais (ex: solicitar-v.html) navegam normalmente,
            // e o estado ativo é recalculado no load da nova página
        });
    });

    setActiveByURL();
});
