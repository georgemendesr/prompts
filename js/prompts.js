// Gerenciamento de prompts
const promptsManager = {
    activeSecao: null,
    activeCategoria: null,
    activeSubcategoria: null,
    
    init() {
        // Inicializar listeners
        document.getElementById('add-prompt-btn').addEventListener('click', () => this.openPromptModal());
        document.getElementById('prompt-form').addEventListener('submit', (e) => this.savePrompt(e));
        document.getElementById('prompt-secao').addEventListener('change', () => this.updateCategoriaOptions());
        document.getElementById('prompt-categoria').addEventListener('change', () => this.updateSubcategoriaOptions());
        
        // Importação
        document.getElementById('import-text-btn').addEventListener('click', () => this.toggleImportMethod('text'));
        document.getElementById('import-json-btn').addEventListener('click', () => this.toggleImportMethod('json'));
        document.getElementById('import-secao').addEventListener('change', () => this.updateImportCategoriaOptions());
        document.getElementById('import-categoria').addEventListener('change', () => this.updateImportSubcategoriaOptions());
        document.getElementById('import-btn').addEventListener('click', () => this.importPrompts());
        
        // Busca
        document.getElementById('search-input').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.searchPrompts();
        });
        
        // Subcategoria
        document.getElementById('subcategory-select').addEventListener('change', () => {
            this.activeSubcategoria = document.getElementById('subcategory-select').value;
            this.loadPrompts();
        });
    },
    
    async loadSecoes() {
        const secoes = await db.getSecoes();
        const secoesMenu = document.getElementById('secoes-menu');
        secoesMenu.innerHTML = '';
        
        secoes.forEach(secao => {
            const menuItem = document.createElement('a');
            menuItem.href = `#${secao.nome.toLowerCase()}`;
            menuItem.className = 'menu-item';
            menuItem.setAttribute('data-secao', secao.nome);
            menuItem.innerHTML = `
                <i class="fas ${this.getSecaoIcon(secao.nome)}"></i>
                <span>${secao.nome}</span>
            `;
            
            menuItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadPromptsForSecao(secao.nome);
            });
            
            secoesMenu.appendChild(menuItem);
        });
    },
    
    getSecaoIcon(secaoNome) {
        switch(secaoNome.toLowerCase()) {
            case 'música':
                return 'fa-music';
            case 'texto':
                return 'fa-brain';
            case 'imagem':
                return 'fa-image';
            default:
                return 'fa-file-alt';
        }
    },
    
    async loadPromptsForSecao(secaoNome) {
        const secoes = await db.getSecoes();
        const secao = secoes.find(s => s.nome === secaoNome);
        
        if (secao) {
            this.activeSecao = secao;
            this.activeCategoria = null;
            this.activeSubcategoria = null;
            
            // Atualizar título
            document.getElementById('secao-titulo').textContent = secao.nome;
            
            // Carregar categorias
            await this.loadCategorias();
            
            // Carregar prompts
            await this.loadPrompts();
            
            // Atualizar menu ativo
            document.querySelectorAll('[data-secao]').forEach(item => {
                if (item.getAttribute('data-secao') === secaoNome) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Mostrar view de prompts
            viewManager.showView('prompts');
        }
    },
    
    async loadCategorias() {
        if (!this.activeSecao) return;
        
        const categorias = await db.getCategorias(this.activeSecao.id);
        const categoryTabs = document.getElementById('category-tabs');
        categoryTabs.innerHTML = '';
        
        // Adicionar tab "Todos"
        const allTab = document.createElement('div');
        allTab.className = `category-tab ${!this.activeCategoria ? 'active' : ''}`;
        allTab.textContent = 'Todos';
        allTab.addEventListener('click', () => {
            this.activeCategoria = null;
            this.activeSubcategoria = null;
            this.updateCategoryTabs();
            this.updateSubcategorySelect();
            this.loadPrompts();
        });
        categoryTabs.appendChild(allTab);
        
        // Adicionar tabs para cada categoria
        categorias.forEach(categoria => {
            const tab = document.createElement('div');
            tab.className = `category-tab ${this.activeCategoria && this.activeCategoria.id === categoria.id ? 'active' : ''}`;
            tab.textContent = categoria.nome;
            tab.addEventListener('click', () => {
                this.activeCategoria = categoria;
                this.activeSubcategoria = null;
                this.updateCategoryTabs();
                this.updateSubcategorySelect();
                this.loadPrompts();
            });
            categoryTabs.appendChild(tab);
        });
        
        // Atualizar select de subcategorias
        this.updateSubcategorySelect();
    },
    
    updateCategoryTabs() {
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        if (!this.activeCategoria) {
            document.querySelector('.category-tab').classList.add('active');
        } else {
            const tabs = document.querySelectorAll('.category-tab');
            for (let i = 1; i < tabs.length; i++) {
                if (tabs[i].textContent === this.activeCategoria.nome) {
                    tabs[i].classList.add('active');
                    break;
                }
            }
        }
    },
    
    async updateSubcategorySelect() {
        const select = document.getElementById('subcategory-select');
        select.innerHTML = '<option value="">Todas as subcategorias</option>';
        
        if (this.activeCategoria) {
            const subcategorias = await db.getSubcategorias(this.activeCategoria.id);
            
            subcategorias.forEach(subcategoria => {
                const option = document.createElement('option');
                option.value = subcategoria.id;
                option.textContent = subcategoria.nome;
                select.appendChild(option);
            });
        }
    },
    
    async loadPrompts() {
        const filters = {
            secaoId: this.activeSecao ? this.activeSecao.id : null,
            categoriaId: this.activeCategoria ? this.activeCategoria.id : null,
            subcategoriaId: this.activeSubcategoria || null
        };
        
        const prompts = await db.getPrompts(filters);
        const promptsList = document.getElementById('prompts-list');
        promptsList.innerHTML = '';
        
        if (prompts.length === 0) {
            promptsList.innerHTML = '<div class="empty-state">Nenhum prompt encontrado. Adicione um novo prompt ou altere os filtros.</div>';
            return;
        }
        
        // Ordenar por favoritos primeiro
        prompts.sort((a, b) => {
            if (a.favorito && !b.favorito) return -1;
            if (!a.favorito && b.favorito) return 1;
            return 0;
        });
        
        prompts.forEach(prompt => {
            const promptCard = document.createElement('div');
            promptCard.className = `prompt-card ${prompt.favorito ? 'favorite' : ''}`;
            promptCard.setAttribute('data-id', prompt.id);
            
            const tagsHtml = prompt.tags && prompt.tags.length > 0
                ? prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
                : '';
            
            promptCard.innerHTML = `
                <div class="prompt-content">
                    <div class="prompt-text">${prompt.texto}</div>
                    <div class="prompt-tags">${tagsHtml}</div>
                </div>
                <div class="prompt-actions">
                    <button class="prompt-action-btn btn-copy" data-id="${prompt.id}">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                    ${this.activeSecao && this.activeSecao.nome.toLowerCase() === 'música' ? `
                    <button class="prompt-action-btn btn
// Gerenciamento de prompts
const promptsManager = {
    activeSecao: null,
    activeCategoria: null,
    activeSubcategoria: null,
    
    init() {
        // Inicializar listeners
        document.getElementById('add-prompt-btn').addEventListener('click', () => this.openPromptModal());
        document.getElementById('prompt-form').addEventListener('submit', (e) => this.savePrompt(e));
        document.getElementById('prompt-secao').addEventListener('change', () => this.updateCategoriaOptions());
        document.getElementById('prompt-categoria').addEventListener('change', () => this.updateSubcategoriaOptions());
        
        // Importação
        document.getElementById('import-text-btn').addEventListener('click', () => this.toggleImportMethod('text'));
        document.getElementById('import-json-btn').addEventListener('click', () => this.toggleImportMethod('json'));
        document.getElementById('import-secao').addEventListener('change', () => this.updateImportCategoriaOptions());
        document.getElementById('import-categoria').addEventListener('change', () => this.updateImportSubcategoriaOptions());
        document.getElementById('import-btn').addEventListener('click', () => this.importPrompts());
        
        // Busca
        document.getElementById('search-input').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.searchPrompts();
        });
        
        // Subcategoria
        document.getElementById('subcategory-select').addEventListener('change', () => {
            this.activeSubcategoria = document.getElementById('subcategory-select').value;
            this.loadPrompts();
        });
    },
    
    async loadSecoes() {
        const secoes = await db.getSecoes();
        const secoesMenu = document.getElementById('secoes-menu');
        secoesMenu.innerHTML = '';
        
        secoes.forEach(secao => {
            const menuItem = document.createElement('a');
            menuItem.href = `#${secao.nome.toLowerCase()}`;
            menuItem.className = 'menu-item';
            menuItem.setAttribute('data-secao', secao.nome);
            menuItem.innerHTML = `
                <i class="fas ${this.getSecaoIcon(secao.nome)}"></i>
                <span>${secao.nome}</span>
            `;
            
            menuItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadPromptsForSecao(secao.nome);
            });
            
            secoesMenu.appendChild(menuItem);
        });
    },
    
    getSecaoIcon(secaoNome) {
        switch(secaoNome.toLowerCase()) {
            case 'música':
                return 'fa-music';
            case 'texto':
                return 'fa-brain';
            case 'imagem':
                return 'fa-image';
            default:
                return 'fa-file-alt';
        }
    },
    
    async loadPromptsForSecao(secaoNome) {
        const secoes = await db.getSecoes();
        const secao = secoes.find(s => s.nome === secaoNome);
        
        if (secao) {
            this.activeSecao = secao;
            this.activeCategoria = null;
            this.activeSubcategoria = null;
            
            // Atualizar título
            document.getElementById('secao-titulo').textContent = secao.nome;
            
            // Carregar categorias
            await this.loadCategorias();
            
            // Carregar prompts
            await this.loadPrompts();
            
            // Atualizar menu ativo
            document.querySelectorAll('[data-secao]').forEach(item => {
                if (item.getAttribute('data-secao') === secaoNome) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // Mostrar view de prompts
            viewManager.showView('prompts');
        }
    },
    
    async loadCategorias() {
        if (!this.activeSecao) return;
        
        const categorias = await db.getCategorias(this.activeSecao.id);
        const categoryTabs = document.getElementById('category-tabs');
        categoryTabs.innerHTML = '';
        
        // Adicionar tab "Todos"
        const allTab = document.createElement('div');
        allTab.className = `category-tab ${!this.activeCategoria ? 'active' : ''}`;
        allTab.textContent = 'Todos';
        allTab.addEventListener('click', () => {
            this.activeCategoria = null;
            this.activeSubcategoria = null;
            this.updateCategoryTabs();
            this.updateSubcategorySelect();
            this.loadPrompts();
        });
        categoryTabs.appendChild(allTab);
        
        // Adicionar tabs para cada categoria
        categorias.forEach(categoria => {
            const tab = document.createElement('div');
            tab.className = `category-tab ${this.activeCategoria && this.activeCategoria.id === categoria.id ? 'active' : ''}`;
            tab.textContent = categoria.nome;
            tab.addEventListener('click', () => {
                this.activeCategoria = categoria;
                this.activeSubcategoria = null;
                this.updateCategoryTabs();
                this.updateSubcategorySelect();
                this.loadPrompts();
            });
            categoryTabs.appendChild(tab);
        });
        
        // Atualizar select de subcategorias
        this.updateSubcategorySelect();
    },
    
    updateCategoryTabs() {
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        if (!this.activeCategoria) {
            document.querySelector('.category-tab').classList.add('active');
        } else {
            const tabs = document.querySelectorAll('.category-tab');
            for (let i = 1; i < tabs.length; i++) {
                if (tabs[i].textContent === this.activeCategoria.nome) {
                    tabs[i].classList.add('active');
                    break;
                }
            }
        }
    },
    
    async updateSubcategorySelect() {
        const select = document.getElementById('subcategory-select');
        select.innerHTML = '<option value="">Todas as subcategorias</option>';
        
        if (this.activeCategoria) {
            const subcategorias = await db.getSubcategorias(this.activeCategoria.id);
            
            subcategorias.forEach(subcategoria => {
                const option = document.createElement('option');
                option.value = subcategoria.id;
                option.textContent = subcategoria.nome;
                select.appendChild(option);
            });
        }
    },
    
    async loadPrompts() {
        const filters = {
            secaoId: this.activeSecao ? this.activeSecao.id : null,
            categoriaId: this.activeCategoria ? this.activeCategoria.id : null,
            subcategoriaId: this.activeSubcategoria || null
        };
        
        const prompts = await db.getPrompts(filters);
        const promptsList = document.getElementById('prompts-list');
        promptsList.innerHTML = '';
        
        if (prompts.length === 0) {
            promptsList.innerHTML = '<div class="empty-state">Nenhum prompt encontrado. Adicione um novo prompt ou altere os filtros.</div>';
            return;
        }
        
        // Ordenar por favoritos primeiro
        prompts.sort((a, b) => {
            if (a.favorito && !b.favorito) return -1;
            if (!a.favorito && b.favorito) return 1;
            return 0;
        });
        
        prompts.forEach(prompt => {
            const promptCard = document.createElement('div');
            promptCard.className = `prompt-card ${prompt.favorito ? 'favorite' : ''}`;
            promptCard.setAttribute('data-id', prompt.id);
            
            const tagsHtml = prompt.tags && prompt.tags.length > 0
                ? prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
                : '';
            
            promptCard.innerHTML = `
                <div class="prompt-content">
                    <div class="prompt-text">${prompt.texto}</div>
                    <div class="prompt-tags">${tagsHtml}</div>
                </div>
                <div class="prompt-actions">
                    <button class="prompt-action-btn btn-copy" data-id="${prompt.id}">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                    ${this.activeSecao && this.activeSecao.nome.toLowerCase() === 'música' ? `
                    <button class="prompt-action-btn btn-male" data-id="${prompt.id}">
                        <i class="fas fa-male"></i> Voz Masculina
                    </button>
                    <button class="prompt-action-btn btn-female" data-id="${prompt.id}">
                        <i class="fas fa-female"></i> Voz Feminina
                    </button>
                    ` : ''}
                    <button class="prompt-action-btn btn-favorite ${prompt.favorito ? 'active' : ''}" data-id="${prompt.id}">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="prompt-action-btn btn-edit" data-id="${prompt.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="prompt-action-btn btn-delete" data-id="${prompt.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            promptsList.appendChild(promptCard);
        });
        
        // Adicionar event listeners
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => this.copyPrompt(e.currentTarget.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.btn-male, .btn-female').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const isMale = e.currentTarget.classList.contains('btn-male');
                this.copyPromptWithVoice(id, isMale);
            });
        });
        
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleFavorite(e.currentTarget.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => this.editPrompt(e.currentTarget.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.deletePrompt(e.currentTarget.getAttribute('data-id')));
        });
    },
    
    async copyPrompt(id) {
        const prompts = await db.getPrompts({ id });
        if (prompts.length > 0) {
            navigator.clipboard.writeText(prompts[0].texto)
                .then(() => {
                    viewManager.showNotification('Prompt copiado para a área de transferência!');
                })
                .catch(err => {
                    console.error('Erro ao copiar: ', err);
                    viewManager.showNotification('Erro ao copiar prompt', true);
                });
        }
    },
    
    async copyPromptWithVoice(id, isMale) {
        const prompts = await db.getPrompts({ id });
        if (prompts.length > 0) {
            const voicePrefix = isMale ? "[VOZ MASCULINA] " : "[VOZ FEMININA] ";
            navigator.clipboard.writeText(voicePrefix + prompts[0].texto)
                .then(() => {
                    viewManager.showNotification(`Prompt com voz ${isMale ? 'masculina' : 'feminina'} copiado!`);
                })
                .catch(err => {
                    console.error('Erro ao copiar: ', err);
                    viewManager.showNotification('Erro ao copiar prompt', true);
                });
        }
    },
    
    async toggleFavorite(id) {
        try {
            const prompts = await db.getPrompts({ id });
            if (prompts.length > 0) {
                const prompt = prompts[0];
                const updated = await db.updatePrompt(id, { favorito: !prompt.favorito });
                
                // Atualizar UI
                const btn = document.querySelector(`.btn-favorite[data-id="${id}"]`);
                const card = document.querySelector(`.prompt-card[data-id="${id}"]`);
                
                if (updated.favorito) {
                    btn.classList.add('active');
                    card.classList.add('favorite');
                } else {
                    btn.classList.remove('active');
                    card.classList.remove('favorite');
                }
                
                viewManager.showNotification(`Prompt ${updated.favorito ? 'adicionado aos' : 'removido dos'} favoritos!`);
            }
        } catch (error) {
            console.error('Erro ao atualizar favorito:', error);
            viewManager.showNotification('Erro ao atualizar favorito', true);
        }
    },
    
    async editPrompt(id) {
        const prompts = await db.getPrompts({ id });
        if (prompts.length > 0) {
            const prompt = prompts[0];
            this.openPromptModal(prompt);
        }
    },
    
    async deletePrompt(id) {
        if (confirm('Tem certeza que deseja excluir este prompt?')) {
            try {
                await db.deletePrompt(id);
                
                // Remover da UI
                const card = document.querySelector(`.prompt-card[data-id="${id}"]`);
                if (card) card.remove();
                
                viewManager.showNotification('Prompt excluído com sucesso!');
            } catch (error) {
                console.error('Erro ao excluir prompt:', error);
                viewManager.showNotification('Erro ao excluir prompt', true);
            }
        }
    },
    
    async searchPrompts() {
        const searchTerm = document.getElementById('search-input').value.trim();
        
        if (searchTerm === '') {
            // Restaurar visualização normal
            this.loadPrompts();
            return;
        }
        
        const filters = {
            secaoId: this.activeSecao ? this.activeSecao.id : null,
            search: searchTerm
        };
        
        const prompts = await db.getPrompts(filters);
        const promptsList = document.getElementById('prompts-list');
        promptsList.innerHTML = '';
        
        if (prompts.length === 0) {
            promptsList.innerHTML = `<div class="empty-state">Nenhum resultado encontrado para "${searchTerm}".</div>`;
            return;
        }
        
        // Mostrar resultados
        prompts.forEach(prompt => {
            const promptCard = document.createElement('div');
            promptCard.className = `prompt-card ${prompt.favorito ? 'favorite' : ''}`;
            promptCard.setAttribute('data-id', prompt.id);
            
            const tagsHtml = prompt.tags && prompt.tags.length > 0
                ? prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
                : '';
            
            // Destacar termo de busca
            let highlightedText = prompt.texto;
            if (searchTerm) {
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                highlightedText = prompt.texto.replace(regex, '<mark>$1</mark>');
            }
            
            promptCard.innerHTML = `
                <div class="prompt-content">
                    <div class="prompt-text">${highlightedText}</div>
                    <div class="prompt-tags">${tagsHtml}</div>
                </div>
                <div class="prompt-actions">
                    <button class="prompt-action-btn btn-copy" data-id="${prompt.id}">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                    ${this.activeSecao && this.activeSecao.nome.toLowerCase() === 'música' ? `
                    <button class="prompt-action-btn btn-male" data-id="${prompt.id}">
                        <i class="fas fa-male"></i> Voz Masculina
                    </button>
                    <button class="prompt-action-btn btn-female" data-id="${prompt.id}">
                        <i class="fas fa-female"></i> Voz Feminina
                    </button>
                    ` : ''}
                    <button class="prompt-action-btn btn-favorite ${prompt.favorito ? 'active' : ''}" data-id="${prompt.id}">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="prompt-action-btn btn-edit" data-id="${prompt.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="prompt-action-btn btn-delete" data-id="${prompt.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            promptsList.appendChild(promptCard);
        });
        
        // Adicionar event listeners
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => this.copyPrompt(e.currentTarget.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.btn-male, .btn-female').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const isMale = e.currentTarget.classList.contains('btn-male');
                this.copyPromptWithVoice(id, isMale);
            });
        });
        
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleFavorite(e.currentTarget.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => this.editPrompt(e.currentTarget.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.deletePrompt(e.currentTarget.getAttribute('data-id')));
        });
    },
    
    async openPromptModal(prompt = null) {
        const modal = document.getElementById('prompt-modal');
        const modalTitle = document.getElementById('prompt-modal-title');
        const form = document.getElementById('prompt-form');
        
        // Limpar formulário
        form.reset();
        
        // Carregar seções
        await this.loadSecoesForForm();
        
        if (prompt) {
            // Edição
            modalTitle.textContent = 'Editar Prompt';
            document.getElementById('prompt-id').value = prompt.id;
            document.getElementById('prompt-secao').value = prompt.secao_id;
            await this.updateCategoriaOptions();
            document.getElementById('prompt-categoria').value = prompt.categoria_id;
            await this.updateSubcategoriaOptions();
            document.getElementById('prompt-subcategoria').value = prompt.subcategoria_id || '';
            document.getElementById('prompt-texto').value = prompt.texto;
            document.getElementById('prompt-tags').value = prompt.tags ? prompt.tags.join(', ') : '';
            document.getElementById('prompt-favorito').checked = prompt.favorito;
        } else {
            // Novo prompt
            modalTitle.textContent = 'Novo Prompt';
            document.getElementById('prompt-id').value = '';
            
            // Pré-selecionar seção atual
            if (this.activeSecao) {
                document.getElementById('prompt-secao').value = this.activeSecao.id;
                await this.updateCategoriaOptions();
                
                // Pré-selecionar categoria atual
                if (this.activeCategoria) {
                    document.getElementById('prompt-categoria').value = this.activeCategoria.id;
                    await this.updateSubcategoriaOptions();
                    
                    // Pré-selecionar subcategoria atual
                    if (this.activeSubcategoria) {
                        document.getElementById('prompt-subcategoria').value = this.activeSubcategoria;
                    }
                }
            }
        }
        
        // Mostrar modal
        modal.style.display = 'block';
        
        // Adicionar listener para fechar modal
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
        
        // Fechar modal ao clicar fora
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    },
    
    async loadSecoesForForm() {
        const secoes = await db.getSecoes();
        const secaoSelect = document.getElementById('prompt-secao');
        secaoSelect.innerHTML = '<option value="">Selecione uma seção</option>';
        
        secoes.forEach(secao => {
            const option = document.createElement('option');
            option.value = secao.id;
            option.textContent = secao.nome;
            secaoSelect.appendChild(option);
        });
    },
    
    async updateCategoriaOptions() {
        const secaoId = document.getElementById('prompt-secao').value;
        const categoriaSelect = document.getElementById('prompt-categoria');
        categoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>';
        
        if (secaoId) {
            const categorias = await db.getCategorias(secaoId);
            
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                categoriaSelect.appendChild(option);
            });
        }
        
        // Limpar subcategorias
        document.getElementById('prompt-subcategoria').innerHTML = '<option value="">Selecione uma subcategoria</option>';
    },
    
    async updateSubcategoriaOptions() {
        const categoriaId = document.getElementById('prompt-categoria').value;
        const subcategoriaSelect = document.getElementById('prompt-subcategoria');
        subcategoriaSelect.innerHTML = '<option value="">Selecione uma subcategoria</option>';
        
        if (categoriaId) {
            const subcategorias = await db.getSubcategorias(categoriaId);
            
            subcategorias.forEach(subcategoria => {
                const option = document.createElement('option');
                option.value = subcategoria.id;
                option.textContent = subcategoria.nome;
                subcategoriaSelect.appendChild(option);
            });
        }
    },
    
    async savePrompt(e) {
        e.preventDefault();
        
        const id = document.getElementById('prompt-id').value;
        const secaoId = document.getElementById('prompt-secao').value;
        const categoriaId = document.getElementById('prompt-categoria').value;
        const subcategoriaId = document.getElementById('prompt-subcategoria').value || null;
        const texto = document.getElementById('prompt-texto').value;
        const tagsInput = document.getElementById('prompt-tags').value;
        const favorito = document.getElementById('prompt-favorito').checked;
        
        // Validar campos obrigatórios
        if (!secaoId || !categoriaId || !texto) {
            viewManager.showNotification('Preencha os campos obrigatórios', true);
            return;
        }
        
        // Processar tags
        const tags = tagsInput.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');
        
        try {
            const promptData = {
                secao_id: secaoId,
                categoria_id: categoriaId,
                subcategoria_id: subcategoriaId,
                texto,
                tags,
                favorito
            };
            
            if (id) {
                // Atualizar prompt existente
                await db.updatePrompt(id, promptData);
                viewManager.showNotification('Prompt atualizado com sucesso!');
            } else {
                // Criar novo prompt
                await db.addPrompt(promptData);
                viewManager.showNotification('Prompt criado com sucesso!');
            }
            
            // Fechar modal
            document.getElementById('prompt-modal').style.display = 'none';
            
            // Recarregar prompts
            this.loadPrompts();
        } catch (error) {
            console.error('Erro ao salvar prompt:', error);
            viewManager.showNotification('Erro ao salvar prompt', true);
        }
    },
    
    // Funções para importação
    async setupImportForm() {
        // Carregar seções
        const secoes = await db.getSecoes();
        const secaoSelect = document.getElementById('import-secao');
        secaoSelect.innerHTML = '<option value="">Selecione uma seção</option>';
        
        secoes.forEach(secao => {
            const option = document.createElement('option');
            option.value = secao.id;
            option.textContent = secao.nome;
            secaoSelect.appendChild(option);
        });
    },
    
    async updateImportCategoriaOptions() {
        const secaoId = document.getElementById('import-secao').value;
        const categoriaSelect = document.getElementById('import-categoria');
        categoriaSelect.innerHTML = '<option value="">Selecione uma categoria</option>';
        
        if (secaoId) {
            const categorias = await db.getCategorias(secaoId);
            
            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nome;
                categoriaSelect.appendChild(option);
            });
        }
        
        // Limpar subcategorias
        document.getElementById('import-subcategoria').innerHTML = '<option value="">Selecione uma subcategoria</option>';
    },
    
    async updateImportSubcategoriaOptions() {
        const categoriaId = document.getElementById('import-categoria').value;
        const subcategoriaSelect = document.getElementById('import-subcategoria');
        subcategoriaSelect.innerHTML = '<option value="">Selecione uma subcategoria</option>';
        
        if (categoriaId) {
            const subcategorias = await db.getSubcategorias(categoriaId);
            
            subcategorias.forEach(subcategoria => {
                const option = document.createElement('option');
                option.value = subcategoria.id;
                option.textContent = subcategoria.nome;
                subcategoriaSelect.appendChild(option);
            });
        }
    },
    
    toggleImportMethod(method) {
        document.getElementById('import-text-btn').classList.toggle('active', method === 'text');
        document.getElementById('import-json-btn').classList.toggle('active', method === 'json');
        
        document.getElementById('import-text-container').classList.toggle('active', method === 'text');
        document.getElementById('import-json-container').classList.toggle('active', method === 'json');
    },
    
    async importPrompts() {
        const secaoId = document.getElementById('import-secao').value;
        const categoriaId = document.getElementById('import-categoria').value;
        const subcategoriaId = document.getElementById('import-subcategoria').value || null;
        
        // Validar campos obrigatórios
        if (!secaoId || !categoriaId) {
            viewManager.showNotification('Selecione uma seção e categoria', true);
            return;
        }
        
        // Verificar método de importação
        const isTextActive = document.getElementById('import-text-container').classList.contains('active');
        
        try {
            let prompts = [];
            
            if (isTextActive) {
                // Importar de texto
                const text = document.getElementById('import-text').value.trim();
                if (!text) {
                    viewManager.showNotification('Digite os prompts para importar', true);
                    return;
                }
                
                // Processar linhas
                const lines = text.split('\n').filter(line => line.trim() !== '');
                
                prompts = lines.map(line => {
                    // Extrair tags (formato: texto #tag1 #tag2)
                    const tags = [];
                    const processedLine = line.replace(/#(\w+)/g, (match, tag) => {
                        tags.push(tag);
                        return '';
                    }).trim();
                    
                    return {
                        secao_id: secaoId,
                        categoria_id: categoriaId,
                        subcategoria_id: subcategoriaId,
                        texto: processedLine,
                        tags,
                        favorito: false
                    };
                });
            } else {
                // Importar de JSON
                const fileInput = document.getElementById('import-file');
                if (!fileInput.files || fileInput.files.length === 0) {
                    viewManager.showNotification('Selecione um arquivo JSON', true);
                    return;
                }
                
                const file = fileInput.files[0];
                const text = await file.text();
                
                try {
                    const data = JSON.parse(text);
                    
                    if (Array.isArray(data)) {
                        prompts = data.map(item => ({
                            secao_id: secaoId,
                            categoria_id: categoriaId,
                            subcategoria_id: subcategoriaId,
                            texto: item.texto || item.text || item.prompt || item,
                            tags: item.tags || [],
                            favorito: item.favorito || false
                        }));
                    } else {
                        viewManager.showNotification('Formato JSON inválido', true);
                        return;
                    }
                } catch (e) {
                    viewManager.showNotification('Erro ao processar JSON', true);
                    return;
                }
            }
            
            // Importar prompts
            if (prompts.length === 0) {
                viewManager.showNotification('Nenhum prompt para importar', true);
                return;
            }
            
            // Confirmar importação
            if (!confirm(`Deseja importar ${prompts.length} prompts?`)) {
                return;
            }
            
            // Inserir prompts
            let importados = 0;
            for (const prompt of prompts) {
                try {
                    await db.addPrompt(prompt);
                    importados++;
                } catch (e) {
                    console.error('Erro ao importar prompt:', e);
                }
            }
            
            viewManager.showNotification(`${importados} prompts importados com sucesso!`);
            
            // Limpar formulário
            document.getElementById('import-text').value = '';
            document.getElementById('import-file').value = '';
        } catch (error) {
            console.error('Erro na importação:', error);
            viewManager.showNotification('Erro ao importar prompts', true);
        }
    }
};