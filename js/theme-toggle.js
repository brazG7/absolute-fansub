/**
 * ABSOLUTE FANSUB - SISTEMA DE TEMAS
 * Permite alternar entre tema claro e escuro
 */

(function() {
    'use strict';

    const THEME_KEY = 'absolute_theme';
    const THEMES = {
        DARK: 'dark',
        LIGHT: 'light'
    };

    // ==================== GERENCIAMENTO DE TEMA ====================

    /**
     * Obtém tema atual (padrão: escuro)
     */
    function getCurrentTheme() {
        return localStorage.getItem(THEME_KEY) || THEMES.DARK;
    }

    /**
     * Define tema
     */
    function setTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
    }

    /**
     * Alterna tema
     */
    function toggleTheme() {
        const current = getCurrentTheme();
        const newTheme = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        setTheme(newTheme);
        
        if (window.AbsoluteUtils) {
            const message = newTheme === THEMES.DARK ? '🌙 Tema escuro ativado' : '☀️ Tema claro ativado';
            window.AbsoluteUtils.showNotification(message, 'info');
        }
    }

    /**
     * Aplica tema ao documento
     */
    function applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === THEMES.LIGHT) {
            // Tema Claro
            root.style.setProperty('--bg-primary', '#f5f5f5');
            root.style.setProperty('--bg-secondary', '#ffffff');
            root.style.setProperty('--bg-tertiary', '#e8e8e8');
            root.style.setProperty('--text-primary', '#1a1a1a');
            root.style.setProperty('--text-secondary', '#4a4a4a');
            root.style.setProperty('--text-muted', '#6a6a6a');
            root.style.setProperty('--border-color', '#d0d0d0');
            root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)');
            root.style.setProperty('--accent', '#1997d3');
            root.style.setProperty('--accent-dark', '#1687bb');
            
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
        } else {
            // Tema Escuro (original)
            root.style.setProperty('--bg-primary', '#092635');
            root.style.setProperty('--bg-secondary', '#051720');
            root.style.setProperty('--bg-tertiary', '#08202c');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#e0e0e0');
            root.style.setProperty('--text-muted', '#9b9b9b');
            root.style.setProperty('--border-color', '#214556');
            root.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.3)');
            root.style.setProperty('--accent', '#1997d3');
            root.style.setProperty('--accent-dark', '#1687bb');
            
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
        }

        // Atualiza meta theme-color para PWA
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme === THEMES.LIGHT ? '#f5f5f5' : '#1997d3';
        }

        // Atualiza ícone do botão
        updateThemeButton(theme);
    }

    /**
     * Atualiza ícone do botão de tema
     */
    function updateThemeButton(theme) {
        const button = document.getElementById('theme-toggle-btn');
        if (!button) return;

        const icon = button.querySelector('svg');
        if (!icon) return;

        if (theme === THEMES.LIGHT) {
            // Ícone de lua (para ativar tema escuro)
            icon.innerHTML = `
                <path d="M480-140q-141.67 0-240.83-99.17Q140-338.33 140-480q0-135.31 92.12-232.42 92.11-97.12 223.88-104.5-24.62 28.3-38.81 64.34Q403-716.54 403-676.54q0 102.31 71.62 173.92Q546.23-431 648.54-431q40 0 76.04-14.19 36.04-14.19 64.34-38.81-7.38 131.77-104.5 223.88Q587.31-168 452-168H480Zm0-60q88 0 158-48.5t102-126.5q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116.67 81.67 198.33Q363.33-200 480-200Zm-4-297Z"/>
            `;
        } else {
            // Ícone de sol (para ativar tema claro)
            icon.innerHTML = `
                <path d="M480-284.62q81.08 0 138.23-57.15T675.38-480q0-81.08-57.15-138.23T480-675.38q-81.08 0-138.23 57.15T284.62-480q0 81.08 57.15 138.23T480-284.62Zm0 60q-106.62 0-181-74.38-74.38-74.38-74.38-181 0-106.62 74.38-181Q373.38-736 480-736q106.62 0 181 74.38 74.38 74.38 74.38 181 0 106.62-74.38 181Q586.62-224.62 480-224.62ZM210-450H70v-60h140v60Zm680 0H750v-60h140v60ZM450-750v-140h60v140h-60Zm0 680v-140h60v140h-60ZM266.23-651.38l-99.61-99.85 42.76-42.15 99.85 99.61-42.15 42.77Zm494.15 494.15-99.61-99.85 42.77-42.15 99.84 99.85-43 42.15Zm-99.85-494.15-42.15-42.77 99.85-99.61 42.15 42.76-99.85 99.62ZM157.23-157.23l42.77-43 99.85 99.85-42.77 42.76-99.85-99.61ZM480-480Z"/>
            `;
        }
    }

    /**
     * Cria botão de alternância de tema
     */
    function createThemeToggleButton() {
        // Verifica se já existe
        if (document.getElementById('theme-toggle-btn')) return;

        const button = document.createElement('button');
        button.id = 'theme-toggle-btn';
        button.className = 'theme-toggle-button';
        button.title = 'Alternar tema';
        button.setAttribute('aria-label', 'Alternar tema');
        
        const currentTheme = getCurrentTheme();
        const svgPath = currentTheme === THEMES.LIGHT 
            ? '<path d="M480-140q-141.67 0-240.83-99.17Q140-338.33 140-480q0-135.31 92.12-232.42 92.11-97.12 223.88-104.5-24.62 28.3-38.81 64.34Q403-716.54 403-676.54q0 102.31 71.62 173.92Q546.23-431 648.54-431q40 0 76.04-14.19 36.04-14.19 64.34-38.81-7.38 131.77-104.5 223.88Q587.31-168 452-168H480Zm0-60q88 0 158-48.5t102-126.5q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116.67 81.67 198.33Q363.33-200 480-200Zm-4-297Z"/>'
            : '<path d="M480-284.62q81.08 0 138.23-57.15T675.38-480q0-81.08-57.15-138.23T480-675.38q-81.08 0-138.23 57.15T284.62-480q0 81.08 57.15 138.23T480-284.62Zm0 60q-106.62 0-181-74.38-74.38-74.38-74.38-181 0-106.62 74.38-181Q373.38-736 480-736q106.62 0 181 74.38 74.38 74.38 74.38 181 0 106.62-74.38 181Q586.62-224.62 480-224.62ZM210-450H70v-60h140v60Zm680 0H750v-60h140v60ZM450-750v-140h60v140h-60Zm0 680v-140h60v140h-60ZM266.23-651.38l-99.61-99.85 42.76-42.15 99.85 99.61-42.15 42.77Zm494.15 494.15-99.61-99.85 42.77-42.15 99.84 99.85-43 42.15Zm-99.85-494.15-42.15-42.77 99.85-99.61 42.15 42.76-99.85 99.62ZM157.23-157.23l42.77-43 99.85 99.85-42.77 42.76-99.85-99.61ZM480-480Z"/>';

        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                ${svgPath}
            </svg>
        `;

        button.addEventListener('click', toggleTheme);

        // Adiciona ao navbar
        const navbar = document.querySelector('.navbar-container');
        if (navbar) {
            navbar.appendChild(button);
        }
    }

    /**
     * Detecta preferência do sistema
     */
    function detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return THEMES.DARK;
        }
        return THEMES.LIGHT;
    }

    /**
     * Inicializa tema baseado em preferência salva ou do sistema
     */
    function initTheme() {
        let theme = getCurrentTheme();
        
        // Se não há preferência salva, usa a do sistema
        if (!localStorage.getItem(THEME_KEY)) {
            theme = detectSystemTheme();
        }
        
        applyTheme(theme);
        createThemeToggleButton();
        
        // Escuta mudanças na preferência do sistema
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Só aplica se usuário não tiver preferência manual
                if (!localStorage.getItem(THEME_KEY)) {
                    const newTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
                    applyTheme(newTheme);
                }
            });
        }
    }

    // ==================== ATALHO DE TECLADO ====================

    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Shift + D para alternar tema
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            toggleTheme();
        }
    });

    // ==================== INICIALIZAÇÃO ====================

    // Aplica tema o mais cedo possível para evitar flash
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

    // Exporta funções globais
    window.AbsoluteTheme = {
        toggle: toggleTheme,
        set: setTheme,
        get: getCurrentTheme,
        THEMES: THEMES
    };

    // Torna a função disponível para utils.js
    window.initTheme = initTheme;

})();
