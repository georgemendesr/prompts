// Configuração do Supabase
const SUPABASE_URL = 'https://mjvexybbyepwzpxnnadt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdmV4eWJieWVwd3pweG5uYWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NDM1MjUsImV4cCI6MjA2MTUxOTUyNX0.lRmaZxVWxFbohknZSUrkbbo3EMT7jUdrHg_va8SwstM';

// Inicializar cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Funções de utilidade para o Supabase
const supabaseUtils = {
    // Obter todas as seções
    async getSections() {
        const { data, error } = await supabaseClient
            .from('sections')
            .select('*')
            .order('id');
        
        if (error) {
            console.error('Erro ao buscar seções:', error);
            return [];
        }
        return data || [];
    },
    
    // Obter categorias por seção
    async getCategoriesBySection(sectionId) {
        const { data, error } = await supabaseClient
            .from('categories')
            .select('*')
            .eq('section_id', sectionId)
            .order('name');
        
        if (error) {
            console.error('Erro ao buscar categorias:', error);
            return [];
        }
        return data || [];
    },
    
    // Obter subcategorias por categoria
    async getSubcategoriesByCategory(categoryId) {
        const { data, error } = await supabaseClient
            .from('subcategories')
            .select('*')
            .eq('category_id', categoryId)
            .order('name');
        
        if (error) {
            console.error('Erro ao buscar subcategorias:', error);
            return [];
        }
        return data || [];
    },
    
    // Obter prompts por subcategoria
    async getPromptsBySubcategory(subcategoryId) {
        const { data, error } = await supabaseClient
            .from('prompts')
            .select('*')
            .eq('subcategory_id', subcategoryId)
            .order('title');
        
        if (error) {
            console.error('Erro ao buscar prompts:', error);
            return [];
        }
        return data || [];
    },
    
    // Adicionar nova categoria
    async addCategory(categoryData) {
        const { data, error } = await supabaseClient
            .from('categories')
            .insert([categoryData])
            .select();
        
        if (error) {
            console.error('Erro ao adicionar categoria:', error);
            return null;
        }
        return data?.[0] || null;
    },
    
    // Adicionar nova subcategoria
    async addSubcategory(subcategoryData) {
        const { data, error } = await supabaseClient
            .from('subcategories')
            .insert([subcategoryData])
            .select();
        
        if (error) {
            console.error('Erro ao adicionar subcategoria:', error);
            return null;
        }
        return data?.[0] || null;
    },
    
    // Adicionar novo prompt
    async addPrompt(promptData) {
        const { data, error } = await supabaseClient
            .from('prompts')
            .insert([promptData])
            .select();
        
        if (error) {
            console.error('Erro ao adicionar prompt:', error);
            return null;
        }
        return data?.[0] || null;
    }
};
