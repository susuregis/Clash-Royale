// Função para gerenciar a navegação entre as páginas
document.addEventListener('DOMContentLoaded', function() {
    // Obter todos os botões de navegação
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const nextButtons = document.querySelectorAll('.next-btn');
    
    // Função para mudar de página
    function navigateToPage(pageId) {
        // Esconder todas as páginas
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Mostrar a página selecionada
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Atualizar botões de navegação
            navButtons.forEach(btn => {
                if (btn.dataset.page === pageId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Role para o topo
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
    
    // Adicionar evento de clique aos botões de navegação
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pageId = this.dataset.page;
            navigateToPage(pageId);
        });
    });
    
    // Adicionar evento para botões de próximo
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextPageId = this.dataset.next;
            navigateToPage(nextPageId);
        });
    });
    
    // Adicionar evento para botões de anterior
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevPageId = this.dataset.prev;
            navigateToPage(prevPageId);
        });
    });
    
    // Verificar a URL para navegação direta ou usar página padrão
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    
    if (pageParam && document.getElementById(pageParam)) {
        navigateToPage(pageParam);
    } else {
        // Começar na primeira página por padrão
        navigateToPage('page1');
    }
    
    // Atualizar URL quando a página muda
    function updateURL(pageId) {
        const url = new URL(window.location);
        url.searchParams.set('page', pageId);
        window.history.pushState({}, '', url);
    }
});

// Verificar tamanho da tela e ajustar rolagem da navbar para centralizar o botão ativo
function centerActiveNavButton() {
    const activeButton = document.querySelector('.nav-btn.active');
    if (activeButton) {
        const navContainer = document.querySelector('.nav-container');
        const buttonOffset = activeButton.offsetLeft;
        const containerWidth = navContainer.offsetWidth;
        const buttonWidth = activeButton.offsetWidth;
        
        // Centralizar o botão ativo na barra de navegação
        navContainer.scrollLeft = buttonOffset - (containerWidth / 2) + (buttonWidth / 2);
    }
}

window.addEventListener('resize', centerActiveNavButton);
document.addEventListener('DOMContentLoaded', centerActiveNavButton);
