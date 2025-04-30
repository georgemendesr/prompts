// Arquivo principal da aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar módulos
    promptsManager.init();
    
    // Configurar navegação entre abas
    setupNavigation();
    
    // Configurar busca
    setupSearch();
});

// Configurar navegação
function setupNavigation() {
    const navLinks = document.querySelectorAll('.menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover classe active de todos os links
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            
            // Adicionar classe active ao link clicado
            this.parentElement.classList.add('active');
            
            // Carregar a visão selecionada
            const view = this.dataset.view;
            loadView(view);
        });
    });
}

// Carregar visão
function loadView(view) {
    // Limpar área de conteúdo
    const contentTitle = document.getElementById('content-title');
    const contentArea = document.getElementById('content-area');
    
    // Carregar visão apropriada
    switch (view) {
        case 'prompts':
            contentTitle.textContent = 'Categoria';
            // Recarregar seções/categorias
            promptsManager.loadSections();
            break;
        case 'estrutura':
            contentTitle.textContent = 'Estrutura';
            contentArea.innerHTML = '<p class="empty-message">Funcionalidade em desenvolvimento</p>';
            break;
        case 'workspace':
            contentTitle.textContent = 'Workspace';
            contentArea.innerHTML = '<p class="empty-message">Funcionalidade em desenvolvimento</p>';
            break;
        default:
            contentTitle.textContent = 'Categoria';
            promptsManager.loadSections();
    }
}

// Configurar busca
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('input', function() {
        // Implementar busca
        console.log('Busca:', this.value);
    });
}

// Fechar modais quando clicar fora deles
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
