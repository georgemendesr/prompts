// Gerenciador de prompts
const promptsManager = {
    currentSection: null,
    currentCategory: null,
    currentSubcategory: null,
    
    // Inicializar o módulo
    init: function() {
        this.bindEvents();
        this.loadSections();
    },
    
    // Vincular eventos
    bindEvents: function() {
        // Evento para nova categoria
        document.querySelector('.nova-categoria-btn')?.addEventListener('click', () => {
            this.showCategoryModal();
        });
        
        // Fechar modal
        document.querySelectorAll('.close-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
        
        // Salvar categoria
        document.getElementById('form-categoria')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });
    },
    
    // Carregar seções do banco de dados
    async loadSections() {
        try {
            const sections = await supabaseUtils.getSections();
            if (sections.length > 0) {
                this.setupSections(sections);
            } else {
                this.showMessage('Nenhuma seção encontrada');
            }
        } catch (error) {
            console.error('Erro ao carregar seções:', error);
            this.showMessage('Erro ao carregar seções');
        }
    },
    
    // Configurar seções na UI
    setupSections(sections) {
        // Implementar aqui - Exibir as seções na interface
        console.log('Seções carregadas:', sections);
        if (sections.length > 0) {
            this.loadCategories(sections[0].id);
        }
    },
    
    // Carregar categorias por seção
    async loadCategories(sectionId) {
        try {
            this.currentSection = sectionId;
            const categories = await supabaseUtils.getCategoriesBySection(sectionId);
            this.setupCategories(categories);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            this.showMessage('Erro ao carregar categorias');
        }
    },
    
    // Configurar categorias na UI
    setupCategories(categories) {
        // Implementar aqui - Exibir as categorias na interface
        console.log('Categorias carregadas:', categories);
        // Limpar as categorias anteriores
        const contentTitle = document.getElementById('content-title');
        contentTitle.textContent = 'Categoria';
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '';
        
        if (categories.length === 0) {
            contentArea.innerHTML = '<p class="empty-message">Nenhuma categoria encontrada</p>';
            return;
        }
        
        // Criar lista de categorias
        const categoryList = document.createElement('div');
        categoryList.className = 'category-list';
        
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.textContent = category.name;
            categoryItem.dataset.id = category.id;
            
            categoryItem.addEventListener('click', () => {
                this.loadSubcategories(category.id, category.name);
            });
            
            categoryList.appendChild(categoryItem);
        });
        
        contentArea.appendChild(categoryList);
    },
    
    // Carregar subcategorias por categoria
    async loadSubcategories(categoryId, categoryName) {
        try {
            this.currentCategory = categoryId;
            const subcategories = await supabaseUtils.getSubcategoriesByCategory(categoryId);
            this.setupSubcategories(subcategories, categoryName);
        } catch (error) {
            console.error('Erro ao carregar subcategorias:', error);
            this.showMessage('Erro ao carregar subcategorias');
        }
    },
    
    // Configurar subcategorias na UI
    setupSubcategories(subcategories, categoryName) {
        // Atualizar título
        const contentTitle = document.getElementById('content-title');
        contentTitle.textContent = categoryName || 'Categoria';
        
        // Mostrar cabeçalho de subcategorias
        const subcategoriasHeader = document.getElementById('subcategorias-header');
        subcategoriasHeader.style.display = 'block';
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '';
        
        if (subcategories.length === 0) {
            contentArea.innerHTML = '<p class="empty-message">Nenhuma subcategoria encontrada</p>';
            
            // Botão para adicionar subcategoria
            const addButton = document.createElement('button');
            addButton.className = 'add-subcategory-btn';
            addButton.textContent = 'Adicionar Subcategoria';
            addButton.addEventListener('click', () => {
                this.showSubcategoryModal();
            });
            
            contentArea.appendChild(addButton);
            return;
        }
        
        // Criar lista de subcategorias
        const subcategoryList = document.createElement('div');
        subcategoryList.className = 'subcategory-list';
        
        subcategories.forEach(subcategory => {
            const subcategoryItem = document.createElement('div');
            subcategoryItem.className = 'subcategory-item';
            subcategoryItem.textContent = subcategory.name;
            subcategoryItem.dataset.id = subcategory.id;
            
            subcategoryItem.addEventListener('click', () => {
                this.loadPrompts(subcategory.id, subcategory.name);
            });
            
            subcategoryList.appendChild(subcategoryItem);
        });
        
        contentArea.appendChild(subcategoryList);
        
        // Botão para adicionar subcategoria
        const addButton = document.createElement('button');
        addButton.className = 'add-subcategory-btn';
        addButton.textContent = 'Adicionar Subcategoria';
        addButton.addEventListener('click', () => {
            this.showSubcategoryModal();
        });
        
        contentArea.appendChild(addButton);
    },
    
    // Carregar prompts por subcategoria
    async loadPrompts(subcategoryId, subcategoryName) {
        try {
            this.currentSubcategory = subcategoryId;
            const prompts = await supabaseUtils.getPromptsBySubcategory(subcategoryId);
            this.setupPrompts(prompts, subcategoryName);
        } catch (error) {
            console.error('Erro ao carregar prompts:', error);
            this.showMessage('Erro ao carregar prompts');
        }
    },
    
    // Configurar prompts na UI
    setupPrompts(prompts, subcategoryName) {
        // Atualizar subtítulo
        const subcategoriasHeader = document.getElementById('subcategorias-header');
        subcategoriasHeader.innerHTML = `<h3>${subcategoryName || 'Subcategoria'}</h3>`;
        
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = '';
        
        if (prompts.length === 0) {
            contentArea.innerHTML = '<p class="empty-message">Nenhum prompt encontrado</p>';
            
            // Botão para adicionar prompt
            const addButton = document.createElement('button');
            addButton.className = 'add-prompt-btn';
            addButton.textContent = 'Adicionar Prompt';
            addButton.addEventListener('click', () => {
                this.showPromptModal();
            });
            
            contentArea.appendChild(addButton);
            return;
        }
        
        // Criar lista de prompts
        const promptList = document.createElement('div');
        promptList.className = 'prompt-list';
        
        prompts.forEach(prompt => {
            const promptItem = document.createElement('div');
            promptItem.className = 'prompt-item';
            
            const promptTitle = document.createElement('h3');
            promptTitle.textContent = prompt.title;
            
            const promptContent = document.createElement('div');
            promptContent.className = 'prompt-content';
            promptContent.textContent = prompt.content;
            
            const promptActions = document.createElement('div');
            promptActions.className = 'prompt-actions';
            
            const editButton = document.createElement('button');
            editButton.className = 'edit-btn';
            editButton.textContent = 'Editar';
            editButton.addEventListener('click', () => {
                this.editPrompt(prompt);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.textContent = 'Excluir';
            deleteButton.addEventListener('click', () => {
                this.deletePrompt(prompt.id);
            });
            
            promptActions.appendChild(editButton);
            promptActions.appendChild(deleteButton);
            
            promptItem.appendChild(promptTitle);
            promptItem.appendChild(promptContent);
            promptItem.appendChild(promptActions);
            
            promptList.appendChild(promptItem);
        });
        
        contentArea.appendChild(promptList);
        
        // Botão para adicionar prompt
        const addButton = document.createElement('button');
        addButton.className = 'add-prompt-btn';
        addButton.textContent = 'Adicionar Prompt';
        addButton.addEventListener('click', () => {
            this.showPromptModal();
        });
        
        contentArea.appendChild(addButton);
    },
    
    // Exibir modal de categoria
    showCategoryModal() {
        const modal = document.getElementById('modal-categoria');
        modal.style.display = 'block';
    },
    
    // Salvar categoria
    async saveCategory() {
        const nome = document.getElementById('categoria-nome').value;
        const secaoSelect = document.getElementById('categoria-secao');
        const secaoNome = secaoSelect.options[secaoSelect.selectedIndex].text;
        const secaoId = secaoSelect.value === 'musica' ? 1 : secaoSelect.value === 'imagem' ? 2 : 3;
        
        if (!nome) {
            alert('Por favor, insira um nome para a categoria');
            return;
        }
        
        const categoryData = {
            name: nome,
            section_id: secaoId
        };
        
        try {
            const newCategory = await supabaseUtils.addCategory(categoryData);
            if (newCategory) {
                document.getElementById('modal-categoria').style.display = 'none';
                document.getElementById('categoria-nome').value = '';
                
                // Recarregar categorias
                this.loadCategories(secaoId);
            }
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
            alert('Erro ao salvar categoria');
        }
    },
    
    // Exibir mensagem
    showMessage(message) {
        const contentArea = document.getElementById('content-area');
        contentArea.innerHTML = `<p class="empty-message">${message}</p>`;
    }
};
