// Gerenciamento do conversor de YouTube para MP3
const conversorManager = {
    history: [],
    
    init() {
        // Inicializar listeners
        document.getElementById('convert-btn').addEventListener('click', () => this.convertVideo());
        
        // Carregar histórico do localStorage
        this.loadHistory();
        this.renderHistory();
    },
    
    async convertVideo() {
        const url = document.getElementById('youtube-url').value.trim();
        
        if (!url) {
            viewManager.showNotification('Digite uma URL do YouTube', true);
            return;
        }
        
        // Validar URL do YouTube
        if (!this.isValidYouTubeUrl(url)) {
            viewManager.showNotification('URL do YouTube inválida', true);
            return;
        }
        
        // Mostrar loading
        const convertBtn = document.getElementById('convert-btn');
        const originalText = convertBtn.textContent;
        convertBtn.textContent = 'Convertendo...';
        convertBtn.disabled = true;
        
        try {
            // Extrair ID do vídeo
            const videoId = this.extractVideoId(url);
            
            // Obter informações do vídeo
            const videoInfo = await this.getVideoInfo(videoId);
            
            // Gerar URL de download
            const downloadUrl = this.generateDownloadUrl(videoId);
            
            // Mostrar resultado
            this.showConversionResult(videoInfo, downloadUrl);
            
            // Adicionar ao histórico
            this.addToHistory(videoInfo, downloadUrl);
            
            // Limpar campo de URL
            document.getElementById('youtube-url').value = '';
            
            viewManager.showNotification('Vídeo convertido com sucesso!');
        } catch (error) {
            console.error('Erro na conversão:', error);
            viewManager.showNotification('Erro ao converter vídeo', true);
        } finally {
            // Restaurar botão
            convertBtn.textContent = originalText;
            convertBtn.disabled = false;
        }
    },
    
    isValidYouTubeUrl(url) {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return regex.test(url);
    },
    
    extractVideoId(url) {
        let videoId = '';
        
        // youtube.com/watch?v=ID
        const watchRegex = /youtube\.com\/watch\?v=([^&]+)/;
        const watchMatch = url.match(watchRegex);
        
        // youtu.be/ID
        const shortRegex = /youtu\.be\/([^?]+)/;
        const shortMatch = url.match(shortRegex);
        
        if (watchMatch && watchMatch[1]) {
            videoId = watchMatch[1];
        } else if (shortMatch && shortMatch[1]) {
            videoId = shortMatch[1];
        }
        
        return videoId;
    },
    
    async getVideoInfo(videoId) {
        // Em um ambiente real, você faria uma chamada API para obter informações do vídeo
        // Aqui, vamos simular isso usando a API pública do YouTube
        
        // Nota: Em produção, você precisaria de uma chave de API do YouTube
        // e implementar uma chamada real para a API
        
        // Simulação para fins de demonstração
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Fazer uma requisição para obter o título do vídeo usando o oEmbed API
                fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
                    .then(response => response.json())
                    .then(data => {
                        resolve({
                            id: videoId,
                            title: data.title,
                            author: data.author_name,
                            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                        });
                    })
                    .catch(() => {
                        // Fallback se a API falhar
                        resolve({
                            id: videoId,
                            title: 'Vídeo do YouTube',
                            author: 'Autor desconhecido',
                            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                        });
                    });
            }, 1000);
        });
    },
    
    generateDownloadUrl(videoId) {
        // Em um ambiente real, você usaria um serviço de conversão real
        // Aqui, vamos usar um serviço público como exemplo
        
        // Nota: Este é apenas um exemplo e pode não funcionar em produção
        // Você precisaria implementar ou integrar com um serviço real
        
        return `https://www.y2mate.com/youtube/${videoId}`;
    },
    
    showConversionResult(videoInfo, downloadUrl) {
        const resultContainer = document.getElementById('conversion-result');
        resultContainer.innerHTML = `
            <div class="conversion-card">
                <div class="conversion-info">
                    <img src="${videoInfo.thumbnail}" alt="${videoInfo.title}" class="video-thumbnail">
                    <div class="video-details">
                        <h3>${videoInfo.title}</h3>
                        <p>${videoInfo.author}</p>
                    </div>
                </div>
                <div class="conversion-actions">
                    <a href="${downloadUrl}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-download"></i> Baixar MP3
                    </a>
                </div>
            </div>
        `;
        
        resultContainer.classList.add('active');
    },
    
    addToHistory(videoInfo, downloadUrl) {
        const historyItem = {
            id: videoInfo.id,
            title: videoInfo.title,
            author: videoInfo.author,
            thumbnail: videoInfo.thumbnail,
            downloadUrl: downloadUrl,
            timestamp: new Date().toISOString()
        };
        
        // Adicionar ao início do histórico
        this.history.unshift(historyItem);
        
        // Limitar tamanho do histórico
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
        }
        
        // Salvar no localStorage
        localStorage.setItem('conversorHistory', JSON.stringify(this.history));
        
        // Atualizar UI
        this.renderHistory();
    },
    
    loadHistory() {
        const savedHistory = localStorage.getItem('conversorHistory');
        if (savedHistory) {
            try {
                this.history = JSON.parse(savedHistory);
            } catch (e) {
                this.history = [];
            }
        }
    },
    
    renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="empty-state">Nenhuma conversão no histórico.</div>';
            return;
        }
        
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // Formatar data
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            historyItem.innerHTML = `
                <div class="history-info">
                    <div class="history-title">${item.title}</div>
                    <div class="history-url">${item.author} • ${formattedDate}</div>
                </div>
                <div class="history-actions">
                    <a href="${item.downloadUrl}" target="_blank" class="btn btn-sm btn-primary">
                        <i class="fas fa-download"></i>
                    </a>
                    <button class="btn btn-sm btn-outline remove-history" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
        
        // Adicionar event listeners
        document.querySelectorAll('.remove-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.removeFromHistory(id);
            });
        });
    },
    
    removeFromHistory(id) {
        this.history = this.history.filter(item => item.id !== id);
        
        // Salvar no localStorage
        localStorage.setItem('conversorHistory', JSON.stringify(this.history));
        
        // Atualizar UI
        this.renderHistory();
        
        viewManager.showNotification('Item removido do histórico!');
    }
};