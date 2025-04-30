// Gerenciamento de views
const viewManager = {
    activeView: 'dashboard',
    
    init() {
        // Inicializar listeners para navegação
        document.querySelectorAll('[data-view]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = element.getAttribute('data-view');
                this.showView(viewName);
            });
        });
        
        document.querySelectorAll('[data-secao]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const secaoNome = element.getAttribute('data-secao');
                this.showPromptsForSecao(secaoNome);
            });
        });
    },
    
    showView(viewName) {
        // Esconder todas as views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Mostrar a view selecionada
        const view = document.getElementById(`${viewName}-view`);
        if (view) {
            view.classList.add('active');
            this.activeView = viewName;
            
            // Atualizar menu ativo
            document.querySelectorAll('.menu-item').forEach(item => {
                if (item.getAttribute('data-view') === viewName) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Executar ação específica da view
            if (viewName === 'workspace') {
                workspaceManager.loadNotes();
            } else if (viewName === 'letras') {
                letrasManager.loadLetras();
            } else if (viewName === 'conversor') {
                conversorManager.init();
            } else if (viewName === 'importar') {
                promptsManager.setupImportForm();
            }
        }
    },
    
    showPromptsForSecao(secaoNome) {
        this.showView('prompts');
        promptsManager.loadPromptsForSecao(secaoNome);
    },
    
    showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notification-message');
        
        messageElement.textContent = message;
        notification.className = `notification ${isError ? 'error' : ''}`;
        
        // Mostrar notificação
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Esconder após alguns segundos
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
};