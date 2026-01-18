/**
 * ABSOLUTE FANSUB - SISTEMA DE FAVORITOS
 * Permite usuários salvarem seus animes favoritos localmente
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'absolute_favorites';

    // ==================== GERENCIAMENTO DE FAVORITOS ====================

    /**
     * Obtém lista de favoritos do localStorage
     */
    function getFavorites() {
        try {
            const favorites = localStorage.getItem(STORAGE_KEY);
            return favorites ? JSON.parse(favorites) : [];
        } catch (e) {
            console.error('Erro ao carregar favoritos:', e);
            return [];
        }
    }

    /**
     * Salva lista de favoritos no localStorage
     */
    function saveFavorites(favorites) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
            return true;
        } catch (e) {
            console.error('Erro ao salvar favoritos:', e);
            return false;
        }
    }

    /**
     * Adiciona anime aos favoritos
     */
    function addFavorite(animeId) {
        const favorites = getFavorites();
        
        if (!favorites.includes(animeId)) {
            favorites.push(animeId);
            saveFavorites(favorites);
            updateFavoriteButton(animeId, true);
            
            if (window.AbsoluteUtils) {
                window.AbsoluteUtils.showNotification('Anime adicionado aos favoritos!', 'success');
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * Remove anime dos favoritos
     */
    function removeFavorite(animeId) {
        let favorites = getFavorites();
        favorites = favorites.filter(id => id !== animeId);
        saveFavorites(favorites);
        updateFavoriteButton(animeId, false);
        
        if (window.AbsoluteUtils) {
            window.AbsoluteUtils.showNotification('Anime removido dos favoritos', 'info');
        }
        
        return true;
    }

    /**
     * Verifica se anime está nos favoritos
     */
    function isFavorite(animeId) {
        const favorites = getFavorites();
        return favorites.includes(animeId);
    }

    /**
     * Atualiza visual do botão de favorito
     */
    function updateFavoriteButton(animeId, isFav) {
        const button = document.querySelector(`[data-anime-id="${animeId}"]`);
        if (!button) return;

        const icon = button.querySelector('svg path');
        if (icon) {
            if (isFav) {
                button.classList.add('is-favorite');
                icon.setAttribute('fill', '#ff4757');
            } else {
                button.classList.remove('is-favorite');
                icon.setAttribute('fill', '#FFFFFF');
            }
        }
    }

    // ==================== INTERFACE UI ====================

    /**
     * Cria botão de favorito para página de anime
     */
    function createFavoriteButton(animeId) {
        const isFav = isFavorite(animeId);
        
        const button = document.createElement('button');
        button.className = 'favorite-button action-button';
        button.setAttribute('data-anime-id', animeId);
        button.title = isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos';
        
        button.innerHTML = `
            <span>${isFav ? 'Remover dos favoritos' : 'Favoritar'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="${isFav ? '#ff4757' : '#FFFFFF'}" style="width: 18px;">
                <path d="m480-146.92-42.15-38.16q-103.77-94.23-172.04-163.11-68.27-68.89-108.04-120.46-39.77-51.58-56.77-94.43Q84-606.92 84-652.31q0-81.07 55.23-136.3 55.23-55.23 136.31-55.23 51.69 0 98.73 24.38Q421.31-795.08 480-743.08q57.92-51.23 105.35-75.61 47.42-24.39 99.11-24.39 81.08 0 136.31 55.23T876-651.54q0 45.39-17 88.23t-56.77 94.43q-39.77 51.57-108.23 120.65-68.46 69.07-171.85 163.31L480-146.92Z"/>
            </svg>
        `;

        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (isFavorite(animeId)) {
                removeFavorite(animeId);
            } else {
                addFavorite(animeId);
            }
        });

        return button;
    }

    /**
     * Adiciona botão de favorito à página de anime
     */
    function addFavoriteButtonToPage() {
        const params = new URLSearchParams(window.location.search);
        const animeId = parseInt(params.get('id'));
        
        if (!animeId) return;

        const container = document.querySelector('.share-comments-buttons');
        if (!container) return;

        // Verifica se já existe
        if (document.querySelector('.favorite-button')) return;

        const favoriteButtonContainer = document.createElement('div');
        favoriteButtonContainer.className = 'favorite-button-container';
        favoriteButtonContainer.appendChild(createFavoriteButton(animeId));

        container.insertBefore(favoriteButtonContainer, container.firstChild);
    }

    /**
     * Cria modal de favoritos
     */
    function createFavoritesModal() {
        const favorites = getFavorites();
        const modal = document.createElement('div');
        modal.id = 'favorites-modal';
        modal.className = 'favorites-modal';
        
        let favoritesHTML = '';
        
        if (favorites.length === 0) {
            favoritesHTML = '<p style="text-align: center; padding: 40px; color: #9b9b9b;">Você ainda não tem favoritos.</p>';
        } else {
            favoritesHTML = '<div class="favorites-grid">';
            
            favorites.forEach(id => {
                const anime = animes.find(a => a.id === id);
                if (!anime) return;
                
                favoritesHTML += `
                    <div class="favorite-card">
                        <div class="favorite-card-image">
                            <img src="${anime.imagem}" alt="${anime.titulo}">
                            <div class="favorite-card-overlay">
                                <a href="anime.html?id=${anime.id}" class="view-anime-btn">Ver Anime</a>
                            </div>
                        </div>
                        <div class="favorite-card-info">
                            <h3>${anime.titulo}</h3>
                            <p>${anime.episodiosTotal} episódios • ${anime.status}</p>
                            <button class="remove-favorite-btn" data-anime-id="${anime.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                                    <path d="M304.62-160q-26.85 0-45.74-18.88Q240-197.77 240-224.62V-720h-40v-60h180v-35.38h200V-780h180v60h-40v495.38q0 27.62-18.5 46.12Q683-160 655.38-160H304.62ZM660-720H300v495.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h343.07q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46V-720ZM392.31-280h59.99v-360h-59.99v360Zm115.38 0h60v-360h-60v360ZM300-720v508.08V-720Z"/>
                                </svg>
                                Remover
                            </button>
                        </div>
                    </div>
                `;
            });
            
            favoritesHTML += '</div>';
        }

        modal.innerHTML = `
            <div class="favorites-modal-content">
                <div class="favorites-modal-header">
                    <h2>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ff4757" style="vertical-align: middle;">
                            <path d="m480-146.92-42.15-38.16q-103.77-94.23-172.04-163.11-68.27-68.89-108.04-120.46-39.77-51.58-56.77-94.43Q84-606.92 84-652.31q0-81.07 55.23-136.3 55.23-55.23 136.31-55.23 51.69 0 98.73 24.38Q421.31-795.08 480-743.08q57.92-51.23 105.35-75.61 47.42-24.39 99.11-24.39 81.08 0 136.31 55.23T876-651.54q0 45.39-17 88.23t-56.77 94.43q-39.77 51.57-108.23 120.65-68.46 69.07-171.85 163.31L480-146.92Z"/>
                        </svg>
                        Meus Favoritos (${favorites.length})
                    </h2>
                    <button class="close-favorites-modal">&times;</button>
                </div>
                <div class="favorites-modal-body">
                    ${favoritesHTML}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.close-favorites-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        modal.querySelectorAll('.remove-favorite-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const animeId = parseInt(this.dataset.animeId);
                removeFavorite(animeId);
                modal.remove();
                showFavoritesModal(); // Reabre atualizado
            });
        });

        // Animação de entrada
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * Mostra modal de favoritos
     */
    function showFavoritesModal() {
        // Remove modal existente se houver
        const existing = document.getElementById('favorites-modal');
        if (existing) existing.remove();

        createFavoritesModal();
    }

    /**
     * Adiciona link de favoritos ao menu
     */
    function addFavoritesToMenu() {
        const nav = document.querySelector('.main-nav ul');
        if (!nav) return;

        // Verifica se já existe
        if (document.getElementById('favorites-link')) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#" id="favorites-link">
                <span class="svg-icon-header">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                        <path d="m480-146.92-42.15-38.16q-103.77-94.23-172.04-163.11-68.27-68.89-108.04-120.46-39.77-51.58-56.77-94.43Q84-606.92 84-652.31q0-81.07 55.23-136.3 55.23-55.23 136.31-55.23 51.69 0 98.73 24.38Q421.31-795.08 480-743.08q57.92-51.23 105.35-75.61 47.42-24.39 99.11-24.39 81.08 0 136.31 55.23T876-651.54q0 45.39-17 88.23t-56.77 94.43q-39.77 51.57-108.23 120.65-68.46 69.07-171.85 163.31L480-146.92Z"/>
                    </svg>
                </span>
                FAVORITOS
            </a>
        `;

        nav.appendChild(li);

        document.getElementById('favorites-link').addEventListener('click', function(e) {
            e.preventDefault();
            showFavoritesModal();
        });
    }

    // ==================== INICIALIZAÇÃO ====================

    document.addEventListener('DOMContentLoaded', () => {
        // Adiciona botão na página de anime
        if (window.location.pathname.includes('anime.html')) {
            addFavoriteButtonToPage();
        }

        // Adiciona ao menu
        setTimeout(addFavoritesToMenu, 500);
    });

    // Exporta funções globais
    window.AbsoluteFavorites = {
        add: addFavorite,
        remove: removeFavorite,
        isFavorite: isFavorite,
        getAll: getFavorites,
        showModal: showFavoritesModal
    };

})();
