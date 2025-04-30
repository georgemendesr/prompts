// Configuração do Supabase
const SUPABASE_URL = 'https://mjvexybbyepwzpxnnadt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdmV4eWJieWVwd3pweG5uYWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDM1MjUsImV4cCI6MjA2MTUxOTUyNX0.lRmaZxVWxFbohknZSUrkbbo3EMT7jUdrHg_va8SwstM';

// Inicializar cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Funções para interagir com o banco de dados
const db = {
    // Seções
    async getSecoes() {
        const { data, error } = await supabase
            .from('secoes')
            .select('*')
            .order('ordem');
            
        if (error) {
            console.error('Erro ao buscar seções:', error);
            return [];
        }
        
        return data || [];
    },
    
    // Categorias
    async getCategorias(secaoId) {
        const query = supabase
            .from('categorias')
            .select('*')
            .order('ordem');
            
        if (secaoId) {
            query.eq('secao_id', secaoId);
        }
        
        const { data, error } = await query;
            
        if (error) {
            console.error('Erro ao buscar categorias:', error);
            return [];
        }
        
        return data || [];
    },
    
    async addCategoria(categoria) {
        const { data, error } = await supabase
            .from('categorias')
            .insert([categoria])
            .select();
            
        if (error) {
            console.error('Erro ao adicionar categoria:', error);
            throw error;
        }
        
        return data[0];
    },
    
    // Subcategorias
    async getSubcategorias(categoriaId) {
        const query = supabase
            .from('subcategorias')
            .select('*')
            .order('ordem');
            
        if (categoriaId) {
            query.eq('categoria_id', categoriaId);
        }
        
        const { data, error } = await query;
            
        if (error) {
            console.error('Erro ao buscar subcategorias:', error);
            return [];
        }
        
        return data || [];
    },
    
    async addSubcategoria(subcategoria) {
        const { data, error } = await supabase
            .from('subcategorias')
            .insert([subcategoria])
            .select();
            
        if (error) {
            console.error('Erro ao adicionar subcategoria:', error);
            throw error;
        }
        
        return data[0];
    },
    
    // Prompts
    async getPrompts(filters = {}) {
        let query = supabase
            .from('prompts')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (filters.secaoId) {
            query = query.eq('secao_id', filters.secaoId);
        }
        
        if (filters.categoriaId) {
            query = query.eq('categoria_id', filters.categoriaId);
        }
        
        if (filters.subcategoriaId) {
            query = query.eq('subcategoria_id', filters.subcategoriaId);
        }
        
        if (filters.favorito) {
            query = query.eq('favorito', true);
        }
        
        if (filters.search) {
            query = query.ilike('texto', `%${filters.search}%`);
        }
        
        const { data, error } = await query;
            
        if (error) {
            console.error('Erro ao buscar prompts:', error);
            return [];
        }
        
        return data || [];
    },
    
    async addPrompt(prompt) {
        const { data, error } = await supabase
            .from('prompts')
            .insert([prompt])
            .select();
            
        if (error) {
            console.error('Erro ao adicionar prompt:', error);
            throw error;
        }
        
        return data[0];
    },
    
    async updatePrompt(id, updates) {
        const { data, error } = await supabase
            .from('prompts')
            .update(updates)
            .eq('id', id)
            .select();
            
        if (error) {
            console.error('Erro ao atualizar prompt:', error);
            throw error;
        }
        
        return data[0];
    },
    
    async deletePrompt(id) {
        const { error } = await supabase
            .from('prompts')
            .delete()
            .eq('id', id);
            
        if (error) {
            console.error('Erro ao excluir prompt:', error);
            throw error;
        }
        
        return true;
    },
    
    // Letras
    async getLetras(filters = {}) {
        let query = supabase
            .from('letras')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (filters.favorito) {
            query = query.eq('favorito', true);
        }
        
        if (filters.search) {
            query = query.or(`titulo.ilike.%${filters.search}%,artista.ilike.%${filters.search}%,letra.ilike.%${filters.search}%`);
        }
        
        const { data, error } = await query;
            
        if (error) {
            console.error('Erro ao buscar letras:', error);
            return [];
        }
        
        return data || [];
    },
    
    async addLetra(letra) {
        const { data, error } = await supabase
            .from('letras')
            .insert([letra])
            .select();
            
        if (error) {
            console.error('Erro ao adicionar letra:', error);
            throw error;
        }
        
        return data[0];
    },
    
    async updateLetra(id, updates) {
        const { data, error } = await supabase
            .from('letras')
            .update(updates)
            .eq('id', id)
            .select();
            
        if (error) {
            console.error('Erro ao atualizar letra:', error);
            throw error;
        }
        
        return data[0];
    },
    
    async deleteLetra(id) {
        const { error } = await supabase
            .from('letras')
            .delete()
            .eq('id', id);
            
        if (error) {
            console.error('Erro ao excluir letra:', error);
            throw error;
        }
        
        return true;
    },
    
    // Workspace
    async getWorkspaceNotes() {
        const { data, error } = await supabase
            .from('workspace')
            .select('*')
            .order('pinned', { ascending: false })
            .order('updated_at', { ascending: false });
            
        if (error) {
            console.error('Erro ao buscar notas do workspace:', error);
            return [];
        }
        
        return data || [];
    },
    
    async addWorkspaceNote(note) {
        const { data, error } = await supabase
            .from('workspace')
            .insert([note])
            .select();
            
        if (error) {
            console.error('Erro ao adicionar nota ao workspace:', error);
            throw error;
        }
        
        return data[0];
    },
    
    async updateWorkspaceNote(id, updates) {
        const { data, error } = await supabase
            .from('workspace')
            .update({
                ...updates,
                updated_at: new Date()
            })
            .eq('id', id)
            .select();
            
        if (error) {
            console.error('Erro ao atualizar nota do workspace:', error);
            throw error;
        }
        
        return data[0];
    },
    
    async deleteWorkspaceNote(id) {
        const { error } = await supabase
            .from('workspace')
            .delete()
            .eq('id', id);
            
        if (error) {
            console.error('Erro ao excluir nota do workspace:', error);
            throw error;
        }
        
        return true;
    }
};