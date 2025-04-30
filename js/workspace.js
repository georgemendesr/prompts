// Gerenciamento do workspace
const workspaceManager = {
    init() {
        // Inicializar listeners
        document.getElementById('add-note-btn').addEventListener('click', () => this.openNoteModal());
        document.getElementById('note-form').addEventListener('submit', (e) => this.saveNote(e));
    },
    
    async loadNotes() {
        const notes = await db.getWorkspaceNotes();
        const workspaceGrid = document.getElementById('workspace-grid');
        workspaceGrid.innerHTML = '';
        
        if (notes.length === 0) {
            workspaceGrid.innerHTML = '<div class="empty-state">Nenhuma nota encontrada. Adicione uma nova nota para começar.</div>';
            return;
        }
        
        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = `note-card ${note.pinned ? 'pinned' : ''}`;
            noteCard.setAttribute('data-id', note.id);
            
            // Formatar data
            const date = new Date(note.updated_at);
            const formattedDate = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            noteCard.innerHTML = `
                <div class="note-header">
                    <h3 class="note-title">${note.titulo}</h3>
                    <div class="note-actions">
                        <button class="note-action note-pin ${note.pinned ? 'active' : ''}" data-id="${note.id}">
                            <i class="fas ${note.pinned ? 'fa-thumbtack' : 'fa-thumbtack'}"></i>
                        </button>
                        <button class="note-action note-edit" data-id="${note.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="note-action note-delete" data-id="${note.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">${note.conteudo}</div>
                <div class="note-footer">
                    Atualizado em ${formattedDate}
                </div>
            `;
            
            workspaceGrid.appendChild(noteCard);
        });
        
        // Adicionar event listeners
        document.querySelectorAll('.note-pin').forEach(btn => {
            btn.addEventListener('click', (e) => this.togglePin(e.currentTarget.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.note-edit').forEach(btn => {
            btn.addEventListener('click', (e) => this.editNote(e.currentTarget.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.note-delete').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteNote(e.currentTarget.getAttribute('data-id')));
        });
    },
    
    async togglePin(id) {
        try {
            const notes = await db.getWorkspaceNotes();
            const note = notes.find(n => n.id === id);
            
            if (note) {
                const updated = await db.updateWorkspaceNote(id, { pinned: !note.pinned });
                
                // Atualizar UI
                const btn = document.querySelector(`.note-pin[data-id="${id}"]`);
                const card = document.querySelector(`.note-card[data-id="${id}"]`);
                
                if (updated.pinned) {
                    btn.classList.add('active');
                    card.classList.add('pinned');
                } else {
                    btn.classList.remove('active');
                    card.classList.remove('pinned');
                }
                
                // Recarregar para reordenar
                this.loadNotes();
                
                viewManager.showNotification(`Nota ${updated.pinned ? 'fixada' : 'desafixada'}!`);
            }
        } catch (error) {
            console.error('Erro ao atualizar nota:', error);
            viewManager.showNotification('Erro ao atualizar nota', true);
        }
    },
    
    async editNote(id) {
        const notes = await db.getWorkspaceNotes();
        const note = notes.find(n => n.id === id);
        
        if (note) {
            this.openNoteModal(note);
        }
    },
    
    async deleteNote(id) {
        if (confirm('Tem certeza que deseja excluir esta nota?')) {
            try {
                await db.deleteWorkspaceNote(id);
                
                // Remover da UI
                const card = document.querySelector(`.note-card[data-id="${id}"]`);
                if (card) card.remove();
                
                viewManager.showNotification('Nota excluída com sucesso!');
                
                // Recarregar notas
                this.loadNotes();
            } catch (error) {
                console.error('Erro ao excluir nota:', error);
                viewManager.showNotification('Erro ao excluir nota', true);
            }
        }
    },
    
    openNoteModal(note = null) {
        const modal = document.getElementById('note-modal');
        const modalTitle = document.getElementById('note-modal-title');
        const form = document.getElementById('note-form');
        
        // Limpar formulário
        form.reset();
        
        if (note) {
            // Edição
            modalTitle.textContent = 'Editar Nota';
            document.getElementById('note-id').value = note.id;
            document.getElementById('note-titulo').value = note.titulo;
            document.getElementById('note-conteudo').value = note.conteudo;
            document.getElementById('note-pinned').checked = note.pinned;
        } else {
            // Nova nota
            modalTitle.textContent = 'Nova Nota';
            document.getElementById('note-id').value = '';
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
    
    async saveNote(e) {
        e.preventDefault();
        
        const id = document.getElementById('note-id').value;
        const titulo = document.getElementById('note-titulo').value;
        const conteudo = document.getElementById('note-conteudo').value;
        const pinned = document.getElementById('note-pinned').checked;
        
        // Validar campos obrigatórios
        if (!titulo || !conteudo) {
            viewManager.showNotification('Preencha os campos obrigatórios', true);
            return;
        }
        
        try {
            const noteData = {
                titulo,
                conteudo,
                pinned
            };
            
            if (id) {
                // Atualizar nota existente
                await db.updateWorkspaceNote(id, noteData);
                viewManager.showNotification('Nota atualizada com sucesso!');
            } else {
                // Criar nova nota
                await db.addWorkspaceNote(noteData);
                viewManager.showNotification('Nota criada com sucesso!');
            }
            
            // Fechar modal
            document.getElementById('note-modal').style.display = 'none';
            
            // Recarregar notas
            this.loadNotes();
        } catch (error) {
            console.error('Erro ao salvar nota:', error);
            viewManager.showNotification('Erro ao salvar nota', true);
        }
    }
};