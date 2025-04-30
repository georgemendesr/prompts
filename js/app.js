// Arquivo principal da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar gerenciadores
    viewManager.init();
    promptsManager.init();
    workspaceManager.init();
    letrasManager.init();
    
    // Carregar seções
    promptsManager.loadSecoes();
    
    // Mostrar dashboard
    viewManager.showView('dashboard');
    
    // Toggle menu mobile
    document.getElementById('mobile-toggle').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('show-nav');
    });
    
    // Fechar modais ao pressionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
});