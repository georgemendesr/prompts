// Gerenciamento de letras
const letrasManager = {
    init() {
        // Inicializar listeners
        document.getElementById('add-letra-btn').addEventListener('click', () => this.openLetraModal());
        document.getElementById('letra-form').addEventListener('submit', (e) => this.saveLetra(e));
        
        // Busca
        document.getElementById('letras-search').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.searchLetras();
        });
    },
    
    async loadLetras(filters = {}) {
        const letras = await db.getLetras(filters);
        const letrasGrid = document.getElementById('letras-grid');
        letrasGrid.innerHTML = '';
        
        if (letras.length === 0) {
            letrasGrid.innerHTML = '<div class="empty-state">Nenhuma letra encontrada. Adicione uma nova letra para começar.</div>';
            return;
        }
        
        // Ordenar por favoritos primeiro
        letras.sort((a, b) => {
            if (a.favorito && !b.favorito) return -1;
            if (!a.favorito && b.favorito) return 1;
            return 0;
        });
        
        letras.forEach(letra => {
            const letraCard = document.createElement('div');
            letraCard.className = `letra-card ${letra.favorito ? 'favorite' : ''}`;
            letraCard.setAttribute('data-id', letra.id);
            
            const tagsHtml = letra.tags && letra.tags.length > 0
                ? letra.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
                : '';
            
            letraCard.innerHTML = `
                <div class="letra-header">
                    <h3 class="letra-title">${letra.titulo}</h3>
                    <div class="letra-artist">${letra.artista || 'Artista desconhecido'}</div>
                </div>
                <div class="letra-content">${letra.letra}</div>
                <div class="letra-footer">
                    <div class="letra-tags">${tagsHtml}</div>
                    <div class="letra-actions">
                        <button class="letra-action letra-favorite ${letra.favorito ? 'active' : ''}" data-id="${letra.id}">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="letra-action letra-edit" data-id="${letra.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="letra-action letra-delete" data-id="${letra.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            letraCard.addEventListener('click', (e) => {
                // Verificar se o clique foi em um botão
                if (!e.target.closest('.letra-action')) {
                    this.viewLetra(letra.id);
                }
            });
            
            letrasGrid.appendChild(letraCard);
        });
        
        // Adicionar event listeners
        document.querySelectorAll('.letra-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleFavorite(e.currentTarget.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.letra-edit').forEach(btn => {
            btn.addEventListener('click', (e) => this.editLetra(e.currentTarget.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.letra-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteLetra(e.currentTarget.getAttribute('data-id')));
        });
    },
    
    async viewLetra(id) {
        const letras = await db.getLetras();
        const letra = letras.find(l => l.id === id);
        
        if (letra) {
            // Criar modal para visualização
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>${letra.titulo}</h2>
                    <h3>${letra.artista || 'Artista desconhecido'}</h3>
                    <div class="letra-full-content">
                        <pre>${letra.letra}</pre>
                    </div>
                    <div class="form-actions">
                        <button class="btn btn-primary copy-letra-btn">Copiar Letra</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Mostrar modal
            modal.style.display = 'block';
            
            // Adicionar listener para fechar modal
            const closeBtn = modal.querySelector('.close');
            closeBtn.onclick = () => {
                modal.remove();
            };
            
            // Copiar letra
            const copyBtn = modal.querySelector('.copy-letra-btn');
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(letra.letra)
                    .then(() => {
                        viewManager.showNotification('Letra copiada para a área de transferência!');
                    })
                    .catch(err => {
                        console.error('Erro ao copiar: ', err);
                        viewManager.showNotification('Erro ao copiar letra', true);
                    });
            };
            
            // Fechar modal ao clicar fora
            window.onclick = (event) => {
                if (event.target === modal) {
                    modal.remove();
                }
            };
        }
    },
    
    async toggleFavorite(id) {
        try {
            const letras = await db.getLetras();
            const letra = letras.find(l => l.id === id);
            
            if (letra) {
                const updated = await db.updateLetra(id, { favorito: !letra.favorito });
                
                // Atualizar UI
                const btn = document.querySelector(`.letra-favorite[data-id="${id}"]`);
                const card = document.querySelector(`.letra-card[data-id="${id}"]`);
                
                if (updated.favorito) {
                    btn.classList.add('active');
                    card.classList.add('favorite');
                } else {
                    btn.classList.remove('active');
                    card.classList.remove('favorite');
                }
                
                viewManager.showNotification(`Letra ${updated.favorito ? 'adicionada aos' : 'removida dos'} favoritos!`);
            }
        } catch (error) {
            console.error('Erro ao atualizar favorito:', error);
            viewManager.showNotification('Erro ao atualizar favorito', true);
        }
    },
    
    async editLetra(id) {
        const letras = await db.getLetras();
        const letra = letras.find(l => l.id === id);
        
        if (letra) {
            this.openLetraModal(letra);
        }
    },
    
    async deleteLetra(id) {
        if (confirm('Tem certeza que deseja excluir esta letra?')) {
            try {
                await db.deleteLetra(id);
                
                // Remover da UI
                const card = document.querySelector(`.letra-card[data-id="${id}"]`);
                if (card) card.remove();
                
                viewManager.showNotification('Letra excluída com sucesso!');
                
                // Recarregar letras
                this.loadLetras();
            } catch (error) {
                console.error('Erro ao excluir letra:', error);
                viewManager.showNotification('Erro ao excluir letra', true);
            }
        }
    },
    
    async searchLetras() {
        const searchTerm = document.getElementById('letras-search').value.trim();
        
        if (searchTerm === '') {
            // Restaurar visualização normal
            this.loadLetras();
            return;
        }
        
        const filters = {
            search: searchTerm
        };
        
        this.loadLetras(filters);
    },
    
    openLetraModal(letra = null) {
        const modal = document.getElementById('letra-modal');
        const modalTitle = document.getElementById('letra-modal-title');
        const form = document.getElementById('letra-form');
        
        // Limpar formulário
        form.reset();
        
        if (letra) {
            // Edição
            modalTitle.textContent = 'Editar Letra';
            document.getElementById('letra-id').value = letra.id;
            document.getElementById('letra-titulo').value = letra.titulo;
            document.getElementById('letra-artista').value = letra.artista || '';
            document.getElementById('letra-texto').value = letra.letra;
            document.getElementById('letra-tags').value = letra.tags ? letra.tags.join(', ') : '';
            document.getElementById('letra-favorito').checked = letra.favorito;
        } else {
            // Nova letra
            modalTitle.textContent = 'Nova Letra';
            document.getElementById('letra-id').value = '';
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
    
    async saveLetra(e) {
        e.preventDefault();
        
        const id = document.getElementById('letra-id').value;
        const titulo = document.getElementById('letra-titulo').value;
        const artista = document.getElementById('letra-artista').value;
        const letra = document.getElementById('letra-texto').value;
        const tagsInput = document.getElementById('letra-tags').value;
        const favorito = document.getElementById('letra-favorito').checked;
        
        // Validar campos obrigatórios
        if (!titulo || !letra) {
            viewManager.showNotification('Preencha os campos obrigatórios', true);
            return;
        }
        
        // Processar tags
        const tags = tagsInput.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');
        
        try {
            const letraData = {
                titulo,
                artista,
                letra,
                tags,
                favorito
            };
            
            if (id) {
                // Atualizar letra existente
                await db.updateLetra(id, letraData);
                viewManager.showNotification('Letra atualizada com sucesso!');
            } else {
                // Criar nova letra
                await db.addLetra(letraData);
                viewManager.showNotification('Letra criada com sucesso!');
            }
            
            // Fechar modal
            document.getElementById('letra-modal').style.display = 'none';
            
            // Recarregar letras
            this.loadLetras();
        } catch (error) {
            console.error('Erro ao salvar letra:', error);
            viewManager.showNotification('Erro ao salvar letra', true);
        }
    }
};