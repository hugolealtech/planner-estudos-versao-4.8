// ==================== STUDY AI 4.7 - SISTEMA DE REVISÃO COM ANÁLISE GRANULAR + PESO POR DISCIPLINA ====================

// Sistema principal
const StudySystem = {
    // Configurações
    config: {
        itemsPerPage: 9,
        currentPage: 1,
        currentTab: 'today',
        searchTerm: '',
        sortBy: 'performance-granular', // Novo: ordenação por análise granular
        viewMode: 'cards', // Novo: modo de visualização
        performanceFilter: 'all'
    },

    // Dados do sistema
    data: {
        disciplines: [],
        studyHistory: [],
        questionHistory: [],
        userSettings: {
            darkMode: false,
            notifications: true,
            dailyGoal: 5,
            reviewReminders: true,
            autoScheduleReviews: true,
            showWeights: true, // Novo: mostrar pesos
            focusOnWeakTopics: true // Novo: foco em tópicos fracos
        }
    },

    // Inicialização
    async initialize() {
        console.log('🚀 STUDY AI 4.7 - Sistema com Análise Granular Inicializando...');
        
        try {
            // Garantir que data.disciplines existe
            if (!this.data.disciplines) {
                this.data.disciplines = [];
            }
            
            if (!this.data.questionHistory) {
                this.data.questionHistory = [];
            }
            
            // Carregar dados
            await this.loadData();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Renderizar interface
            this.renderInterface();
            
            // Atualizar estatísticas
            this.updateStatistics();
            
            // Renderizar dashboard de desempenho
            this.renderPerformanceDashboard();
            
            console.log('✅ Sistema 4.7 inicializado com sucesso!');
            console.log(`📊 ${this.data.disciplines.length} disciplinas carregadas`);
            
        } catch (error) {
            console.error('❌ Erro crítico na inicialização:', error);
            // Tentar recuperação
            this.data.disciplines = this.getEmbeddedDefaultDisciplines();
            this.renderInterface();
            this.updateStatistics();
            this.showNotification('Sistema inicializado com dados padrão', 'warning');
        }
    },

    // Carregar dados
    async loadData() {
        try {
            // Tentar carregar dados salvos
            const savedDisciplines = localStorage.getItem('studyAI_disciplines');
            const savedHistory = localStorage.getItem('studyAI_history');
            const savedQuestionHistory = localStorage.getItem('studyAI_questionHistory');
            const savedSettings = localStorage.getItem('studyAI_settings');
            
            // Carregar disciplinas
            if (savedDisciplines) {
                try {
                    this.data.disciplines = JSON.parse(savedDisciplines);
                    // Garantir que todas as disciplinas têm tasks
                    this.data.disciplines.forEach(discipline => {
                        if (!discipline.tasks) {
                            discipline.tasks = this.convertNotesToTasks(discipline.notes || '');
                            discipline.progress = this.calculateProgress(discipline.tasks);
                        }
                        
                        // Garantir peso padrão se não existir
                        if (!discipline.weight) {
                            discipline.weight = 10;
                        }
                        
                        // Garantir que todas as tasks têm performance
                        if (discipline.tasks) {
                            discipline.tasks.forEach(task => {
                                if (!task.performance) {
                                    task.performance = {
                                        totalQuestions: 0,
                                        correctAnswers: 0,
                                        lastPractice: null,
                                        averageScore: 0,
                                        priority: 'medium' // Novo: prioridade da task
                                    };
                                }
                                // Calcular prioridade do tópico se não existir
                                if (!task.priority) {
                                    task.priority = this.calculateTopicPriority(task);
                                }
                            });
                        }
                        
                        // Calcular análise granular
                        discipline.granularAnalysis = this.calculateGranularAnalysis(discipline);
                        
                        // Recalcular próxima revisão se necessário
                        if (!discipline.nextReview && this.data.userSettings.autoScheduleReviews) {
                            discipline.nextReview = this.calculateNextReview(discipline);
                        }
                    });
                    console.log('✅ Dados carregados do localStorage');
                } catch (e) {
                    console.warn('❌ Erro ao parsear dados, carregando padrão...');
                    await this.loadDefaultDisciplines();
                }
            } else {
                // Carregar disciplinas padrão
                await this.loadDefaultDisciplines();
            }
            
            // Carregar histórico
            if (savedHistory) {
                try {
                    this.data.studyHistory = JSON.parse(savedHistory);
                } catch (e) {
                    console.warn('Erro ao carregar histórico, inicializando vazio...');
                    this.data.studyHistory = [];
                }
            }
            
            // Carregar histórico de questões
            if (savedQuestionHistory) {
                try {
                    this.data.questionHistory = JSON.parse(savedQuestionHistory);
                } catch (e) {
                    console.warn('Erro ao carregar histórico de questões, inicializando vazio...');
                    this.data.questionHistory = [];
                }
            }
            
            // Carregar configurações
            if (savedSettings) {
                try {
                    this.data.userSettings = JSON.parse(savedSettings);
                } catch (e) {
                    console.warn('Erro ao carregar configurações, usando padrão...');
                    this.data.userSettings = {
                        darkMode: false,
                        notifications: true,
                        dailyGoal: 5,
                        reviewReminders: true,
                        autoScheduleReviews: true,
                        showWeights: true,
                        focusOnWeakTopics: true
                    };
                }
            }
            
            // Aplicar modo escuro
            if (this.data.userSettings.darkMode) {
                document.body.classList.add('dark-mode');
            }
            
        } catch (error) {
            console.error('Erro crítico ao carregar dados:', error);
            // Carregar dados padrão como fallback
            await this.loadDefaultDisciplines();
        }
    },

    // Converter notas antigas para tasks
    convertNotesToTasks(notes) {
        if (!notes) return [];
        
        const lines = notes.split('\n').filter(line => line.trim());
        return lines.map((line, index) => ({
            id: this.generateId(),
            text: line.trim(),
            completed: false,
            priority: 'medium',
            createdAt: new Date().toISOString(),
            performance: {
                totalQuestions: 0,
                correctAnswers: 0,
                lastPractice: null,
                averageScore: 0,
                priority: 'medium' // Novo campo
            }
        }));
    },

    // Carregar disciplinas padrão
    async loadDefaultDisciplines() {
        console.log('📚 Carregando disciplinas padrão 4.7...');
        
        // Usar diretamente os dados embutidos
        this.data.disciplines = this.getEmbeddedDefaultDisciplines();
        this.saveDisciplines();
        console.log('✅ Disciplinas padrão carregadas');
    },

    // Dados padrão embutidos - VERSÃO 4.7 COM PESOS E ANÁLISE GRANULAR
    getEmbeddedDefaultDisciplines() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return [
            {
                id: this.generateId(),
                name: 'Direito Civil - TJDFT 2022',
                color: '#1a237e',
                weight: 15, // Novo: peso da disciplina
                reviewCycle: 3,
                progress: 60,
                nextReview: tomorrow.toISOString(),
                lastReview: today.toISOString(),
                totalReviews: 5,
                createdAt: new Date().toISOString(),
                priority: 1,
                tasks: [
                    { 
                        id: this.generateId(), 
                        text: 'Lei de Introdução às Normas', 
                        completed: true, 
                        priority: 'high', 
                        createdAt: today.toISOString(), 
                        completedAt: today.toISOString(),
                        performance: {
                            totalQuestions: 25,
                            correctAnswers: 23,
                            lastPractice: today.toISOString(),
                            averageScore: 92,
                            priority: 'strong' // Novo: prioridade baseada em desempenho
                        }
                    },
                    { 
                        id: this.generateId(), 
                        text: 'Pessoas Naturais', 
                        completed: true, 
                        priority: 'high', 
                        createdAt: today.toISOString(), 
                        completedAt: today.toISOString(),
                        performance: {
                            totalQuestions: 20,
                            correctAnswers: 18,
                            lastPractice: today.toISOString(),
                            averageScore: 90,
                            priority: 'strong'
                        }
                    },
                    { 
                        id: this.generateId(), 
                        text: 'Obrigações', 
                        completed: true, 
                        priority: 'high', 
                        createdAt: today.toISOString(),
                        completedAt: today.toISOString(),
                        performance: {
                            totalQuestions: 30,
                            correctAnswers: 27,
                            lastPractice: today.toISOString(),
                            averageScore: 90,
                            priority: 'strong'
                        }
                    },
                    { 
                        id: this.generateId(), 
                        text: 'Contratos', 
                        completed: false, 
                        priority: 'critical', // Novo: prioridade crítica
                        createdAt: today.toISOString(),
                        performance: {
                            totalQuestions: 15,
                            correctAnswers: 6,
                            lastPractice: today.toISOString(),
                            averageScore: 40,
                            priority: 'weak'
                        }
                    },
                    { 
                        id: this.generateId(), 
                        text: 'Responsabilidade Civil', 
                        completed: false, 
                        priority: 'medium', 
                        createdAt: today.toISOString(),
                        performance: {
                            totalQuestions: 10,
                            correctAnswers: 5,
                            lastPractice: today.toISOString(),
                            averageScore: 50,
                            priority: 'weak'
                        }
                    }
                ]
            },
            {
                id: this.generateId(),
                name: 'Direito Constitucional',
                color: '#00c853',
                weight: 20, // Novo: peso alto
                reviewCycle: 2,
                progress: 40,
                nextReview: today.toISOString(),
                lastReview: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                totalReviews: 3,
                createdAt: new Date().toISOString(),
                priority: 2,
                tasks: [
                    { 
                        id: this.generateId(), 
                        text: 'Direitos Fundamentais', 
                        completed: true, 
                        priority: 'high', 
                        createdAt: today.toISOString(),
                        completedAt: today.toISOString(),
                        performance: {
                            totalQuestions: 20,
                            correctAnswers: 16,
                            lastPractice: today.toISOString(),
                            averageScore: 80,
                            priority: 'medium'
                        }
                    },
                    { 
                        id: this.generateId(), 
                        text: 'Controle de Constitucionalidade', 
                        completed: false, 
                        priority: 'critical',
                        createdAt: today.toISOString(),
                        performance: {
                            totalQuestions: 25,
                            correctAnswers: 10,
                            lastPractice: today.toISOString(),
                            averageScore: 40,
                            priority: 'weak'
                        }
                    }
                ]
            }
        ];
    },

    // Configurar event listeners - ATUALIZADO PARA 4.7
    setupEventListeners() {
        // Formulário de adição de disciplina
        const addForm = document.getElementById('add-discipline-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddDiscipline(e));
        }

        // Picker de cor
        const colorPicker = document.getElementById('discipline-color');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                document.getElementById('selected-color').textContent = e.target.value;
            });
        }

        // Slider de peso (novo)
        const weightSlider = document.getElementById('discipline-weight');
        if (weightSlider) {
            weightSlider.addEventListener('input', (e) => {
                document.getElementById('selected-weight').textContent = e.target.value;
            });
        }

        // Busca
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.config.searchTerm = e.target.value.toLowerCase();
                this.config.currentPage = 1;
                if (this.config.viewMode === 'table') {
                    this.renderDisciplinesTable();
                } else if (this.config.viewMode === 'weak-topics') {
                    this.renderWeakTopicsView();
                } else {
                    this.renderDisciplines();
                }
            });
        }

        // Filtro de desempenho
        const perfFilter = document.getElementById('performance-filter');
        if (perfFilter) {
            perfFilter.addEventListener('change', (e) => {
                this.config.performanceFilter = e.target.value;
                this.renderPerformanceDashboard();
            });
        }

        // Modos de visualização (novo)
        const viewModeButtons = document.querySelectorAll('.view-mode-btn');
        viewModeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.changeViewMode(mode);
            });
        });

        // Modo escuro
        const darkModeToggle = document.querySelector('[onclick="toggleDarkMode()"]');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
    },

    // Mudar modo de visualização (nova função)
    changeViewMode(mode) {
        this.config.viewMode = mode;
        this.config.currentPage = 1;
        
        // Atualizar botões ativos
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        // Renderizar conforme o modo
        if (mode === 'table') {
            this.renderDisciplinesTable();
        } else if (mode === 'weak-topics') {
            this.renderWeakTopicsView();
        } else {
            this.renderDisciplines();
        }
    },

    // Renderizar interface
    renderInterface() {
        if (this.config.viewMode === 'table') {
            this.renderDisciplinesTable();
        } else if (this.config.viewMode === 'weak-topics') {
            this.renderWeakTopicsView();
        } else {
            this.renderDisciplines();
        }
        
        this.renderTodayReviews();
        this.renderCalendar();
        this.updatePageInfo();
        this.renderPerformanceDashboard();
    },

    // Renderizar disciplinas em cards (modo padrão)
    renderDisciplines() {
        const container = document.getElementById('disciplines-container');
        if (!container) return;

        // Filtrar disciplinas
        let filteredDisciplines = this.filterDisciplines();
        
        // Ordenar disciplinas
        filteredDisciplines = this.sortDisciplinesArray(filteredDisciplines);
        
        // Paginação
        const start = (this.config.currentPage - 1) * this.config.itemsPerPage;
        const end = start + this.config.itemsPerPage;
        const pageDisciplines = filteredDisciplines.slice(start, end);

        // Gerar HTML
        container.innerHTML = pageDisciplines.map(discipline => this.createDisciplineCard(discipline)).join('');

        // Atualizar info da página
        const totalPages = Math.ceil(filteredDisciplines.length / this.config.itemsPerPage);
        document.getElementById('page-info').textContent = `Página ${this.config.currentPage} de ${totalPages}`;
    },

    // Renderizar tabela de disciplinas (nova função do 4.6)
   // Renderizar tabela de disciplinas (atualizada para versão 4.8)
    renderDisciplinesTable() {
        const container = document.getElementById('disciplines-container');
        if (!container) return;

        let filteredDisciplines = this.filterDisciplines();
        
        // Ordenar por peso e prioridade
        filteredDisciplines.sort((a, b) => {
            if (b.weight !== a.weight) {
                return b.weight - a.weight;
            }
            const aPriority = this.calculateDisciplinePriority(a);
            const bPriority = this.calculateDisciplinePriority(b);
            return bPriority - aPriority;
        });

        let html = `
            <div class="disciplines-table">
                <div class="table-header">
                    <div class="table-cell">Disciplina</div>
                    <div class="table-cell">Peso</div>
                    <div class="table-cell">Progresso</div>
                    <div class="table-cell">Desempenho</div>
                    <div class="table-cell">Tópicos Críticos</div>
                    <div class="table-cell">Ações</div>
                </div>
        `;

        filteredDisciplines.forEach(discipline => {
            const avgScore = this.calculateDisciplineAverage(discipline);
            const weakTopics = this.getWeakTopics(discipline);
            
            // Classes de prioridade
            let rowClass = '';
            if (discipline.weight >= 15) {
                rowClass = 'weight-high';
            } else if (weakTopics.length > 0 && discipline.weight >= 10) {
                rowClass = 'priority-high';
            } else if (weakTopics.length > 0) {
                rowClass = 'priority-medium';
            }

            // ID único para a linha para evitar conflitos de eventos
            const rowId = `discipline-row-${discipline.id}`;
            
            html += `
                <div class="table-row ${rowClass}" id="${rowId}" style="cursor: pointer;">
                    <div class="table-cell" onclick="event.stopPropagation();">
                        <div class="discipline-name-cell">
                            <div class="color-dot" style="background: ${discipline.color};"></div>
                            <strong>${discipline.name}</strong>
                        </div>
                    </div>
                    <div class="table-cell" onclick="event.stopPropagation();">
                        <span class="weight-badge weight-${discipline.weight >= 15 ? 'high' : discipline.weight >= 10 ? 'medium' : 'low'}">
                            ${discipline.weight}
                        </span>
                    </div>
                    <div class="table-cell" onclick="event.stopPropagation();">
                        <div class="progress-cell">
                            <div class="mini-progress-bar">
                                <div class="mini-progress-fill" style="width: ${discipline.progress}%; background: ${discipline.color};"></div>
                            </div>
                            <span>${discipline.progress}%</span>
                        </div>
                    </div>
                    <div class="table-cell" onclick="event.stopPropagation();">
                        <span class="performance-badge ${this.getPerformanceClass(avgScore)}">
                            ${avgScore}%
                        </span>
                    </div>
                    <div class="table-cell" onclick="event.stopPropagation();">
                        ${weakTopics.length > 0 ? 
                            `<div class="weak-topics-list">
                                ${weakTopics.slice(0, 2).map(topic => `
                                    <span class="weak-topic-tag">${topic.text}</span>
                                `).join('')}
                                ${weakTopics.length > 2 ? `<span class="more-topics">+${weakTopics.length - 2}</span>` : ''}
                            </div>` : 
                            '<span class="no-weak-topics">✓ Nenhum</span>'
                        }
                    </div>
                    <div class="table-cell" onclick="event.stopPropagation();">
                        <div class="table-actions">
                            ${weakTopics.length > 0 ? `
                                <button class="btn btn-warning btn-small" onclick="StudySystem.focusOnWeakTopics('${discipline.id}')">
                                    <i class="fas fa-bullseye"></i> Focar
                                </button>
                            ` : ''}
                            <button class="btn btn-outline btn-small" onclick="StudySystem.openTopicAnalysis('${discipline.id}')">
                                <i class="fas fa-chart-pie"></i> Análise
                            </button>
                            <button class="btn btn-danger btn-small" onclick="event.stopPropagation(); StudySystem.deleteDiscipline('${discipline.id}')" style="margin-top: 5px; width: 100%;">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;

        // Adicionar evento de clique para cada linha da tabela
        filteredDisciplines.forEach(discipline => {
            const rowElement = document.getElementById(`discipline-row-${discipline.id}`);
            if (rowElement) {
                rowElement.addEventListener('click', (e) => {
                    // Verificar se o clique foi em um elemento que deve impedir a abertura do card
                    if (!e.target.closest('.table-actions') && 
                        !e.target.closest('button') && 
                        !e.target.closest('input') && 
                        !e.target.closest('select')) {
                        this.openDisciplineCard(discipline.id);
                    }
                });
            }
        });

        document.getElementById('page-info').textContent = `Mostrando ${filteredDisciplines.length} disciplinas`;
    },

    // Nova função para abrir o card da disciplina (similar ao card view)
    openDisciplineCard(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const modal = document.getElementById('discipline-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        title.textContent = `Detalhes: ${discipline.name}`;
        
        // Criar um card similar ao modo de visualização de cards
        const completedTasks = discipline.tasks ? discipline.tasks.filter(t => t.completed).length : 0;
        const totalTasks = discipline.tasks ? discipline.tasks.length : 0;
        const avgScore = this.calculateDisciplineAverage(discipline);
        const weakTopics = this.getWeakTopics(discipline);
        const strongTopics = this.getStrongTopics(discipline);
        
        body.innerHTML = `
            <div class="discipline-card-modal" style="border-left-color: ${discipline.color};">
                <div class="discipline-header">
                    <div class="discipline-title-row">
                        <h3 class="discipline-title" style="color: ${discipline.color};">${discipline.name}</h3>
                        <div class="weight-display">
                            <span class="weight-label">Peso:</span>
                            <span class="weight-value ${discipline.weight >= 15 ? 'weight-high' : discipline.weight >= 10 ? 'weight-medium' : 'weight-low'}">
                                ${discipline.weight}
                            </span>
                        </div>
                    </div>
                    <div class="discipline-meta">
                        <span class="review-badge ${discipline.nextReview ? (new Date(discipline.nextReview).toISOString().split('T')[0] === new Date().toISOString().split('T')[0] ? 'today' : 'future') : 'future'}">
                            ${this.formatDate(discipline.nextReview)}
                        </span>
                        ${avgScore > 0 ? `
                            <span class="performance-badge ${this.getPerformanceClass(avgScore)}">
                                ${avgScore}%
                            </span>
                        ` : ''}
                        ${weakTopics.length > 0 ? `
                            <span class="warning-badge">
                                <i class="fas fa-exclamation-triangle"></i> ${weakTopics.length} tópico(s) crítico(s)
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="discipline-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${discipline.progress}%; background: ${discipline.color};"></div>
                    </div>
                    <div class="progress-info">
                        <span>Progresso: ${discipline.progress}%</span>
                        <span>Desempenho: ${avgScore > 0 ? avgScore + '%' : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="granular-analysis">
                    <div class="analysis-header">
                        <h4><i class="fas fa-search"></i> Análise por Tópico</h4>
                    </div>
                    
                    <div class="analysis-stats">
                        <div class="stat-item">
                            <div class="stat-number ${strongTopics.length > 0 ? 'stat-good' : ''}">${strongTopics.length}</div>
                            <div class="stat-label">Pontos Fortes</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number ${weakTopics.length === 0 ? 'stat-good' : 'stat-warning'}">${weakTopics.length}</div>
                            <div class="stat-label">Tópicos Críticos</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${this.calculateDisciplineAverage(discipline)}%</div>
                            <div class="stat-label">Média</div>
                        </div>
                    </div>
                    
                    ${weakTopics.length > 0 ? `
                        <div class="weak-topics-preview">
                            <div class="preview-header">
                                <span class="preview-title"><i class="fas fa-exclamation-circle"></i> Tópicos que precisam de atenção:</span>
                            </div>
                            <div class="preview-list">
                                ${weakTopics.slice(0, 3).map(topic => `
                                    <div class="preview-item">
                                        <span class="topic-name">${topic.text}</span>
                                        <span class="topic-score ${this.getPerformanceClass(topic.performance.averageScore)}">
                                            ${topic.performance.averageScore}%
                                        </span>
                                    </div>
                                `).join('')}
                                ${weakTopics.length > 3 ? `<div class="more-topics">+${weakTopics.length - 3} mais</div>` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="todo-list-container">
                    <div class="todo-list">
                        ${discipline.tasks && discipline.tasks.length > 0 ? 
                            discipline.tasks.slice(0, 5).map(task => `
                                <div class="todo-item" data-task-id="${task.id}">
                                    <input type="checkbox" 
                                        id="task-${task.id}" 
                                        ${task.completed ? 'checked' : ''}
                                        onchange="StudySystem.toggleTask('${discipline.id}', '${task.id}')">
                                    <label for="task-${task.id}" class="${task.completed ? 'completed' : ''}">
                                        <span class="todo-text">${task.text}</span>
                                        <span class="todo-performance">
                                            ${task.performance && task.performance.totalQuestions > 0 ? 
                                                `<span class="performance-score ${this.getPerformanceClass(task.performance.averageScore)}">
                                                    ${task.performance.averageScore}%
                                                </span>` : 
                                                `<span class="performance-score no-data">0%</span>`
                                            }
                                        </span>
                                    </label>
                                </div>
                            `).join('') : 
                            `<div class="no-tasks">Nenhuma tarefa definida</div>`
                        }
                    </div>
                    
                    <div class="todo-stats">
                        <span>${completedTasks} de ${totalTasks} concluídas</span>
                        <div class="todo-actions">
                            <button class="btn-text" onclick="StudySystem.openTaskManager('${discipline.id}')">
                                <i class="fas fa-tasks"></i> Gerenciar Tarefas
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions" style="margin-top: 20px; display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="StudySystem.markAsReviewed('${discipline.id}')">
                        <i class="fas fa-check"></i> Marcar como Revisado
                    </button>
                    <button class="btn btn-outline" onclick="StudySystem.recordQuestions('${discipline.id}')">
                        <i class="fas fa-chart-line"></i> Registrar Questões
                    </button>
                    ${weakTopics.length > 0 ? `
                        <button class="btn btn-warning" onclick="StudySystem.focusOnWeakTopics('${discipline.id}')">
                            <i class="fas fa-bullseye"></i> Focar nos Fracos
                        </button>
                    ` : ''}
                    <button class="btn btn-danger" onclick="StudySystem.deleteDiscipline('${discipline.id}')">
                        <i class="fas fa-trash"></i> Excluir Disciplina
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    },

    // Renderizar view de tópicos fracos (nova função do 4.6)
    renderWeakTopicsView() {
        const container = document.getElementById('disciplines-container');
        if (!container) return;

        let allWeakTopics = [];
        
        // Coletar todos os tópicos fracos
        this.data.disciplines.forEach(discipline => {
            const weakTopics = this.getWeakTopics(discipline);
            weakTopics.forEach(topic => {
                allWeakTopics.push({
                    disciplineId: discipline.id,
                    disciplineName: discipline.name,
                    disciplineColor: discipline.color,
                    disciplineWeight: discipline.weight,
                    ...topic
                });
            });
        });

        // Ordenar por peso da disciplina e desempenho
        allWeakTopics.sort((a, b) => {
            if (b.disciplineWeight !== a.disciplineWeight) {
                return b.disciplineWeight - a.disciplineWeight;
            }
            return a.performance.averageScore - b.performance.averageScore;
        });

        // Paginação
        const start = (this.config.currentPage - 1) * this.config.itemsPerPage;
        const end = start + this.config.itemsPerPage;
        const pageTopics = allWeakTopics.slice(start, end);

        let html = `
            <div class="weak-topics-view">
                <div class="view-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Tópicos Críticos para Revisão</h3>
                    <p class="view-subtitle">${allWeakTopics.length} tópicos precisando de atenção</p>
                </div>
        `;

        if (allWeakTopics.length === 0) {
            html += `
                <div class="no-weak-topics-message">
                    <i class="fas fa-check-circle"></i>
                    <h4>Excelente! Nenhum tópico crítico encontrado.</h4>
                    <p>Continue mantendo o bom desempenho em todos os tópicos.</p>
                </div>
            `;
        } else {
            pageTopics.forEach(topic => {
                const priorityClass = this.getTopicPriorityClass(topic.performance.averageScore, topic.disciplineWeight);
                
                html += `
                    <div class="weak-topic-card ${priorityClass}">
                        <div class="weak-topic-header">
                            <div class="topic-discipline">
                                <div class="discipline-dot" style="background: ${topic.disciplineColor};"></div>
                                <div>
                                    <div class="discipline-name">${topic.disciplineName}</div>
                                    <div class="weight-indicator">
                                        <span class="weight-badge">Peso: ${topic.disciplineWeight}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="topic-priority">
                                <span class="priority-badge ${this.getPerformanceClass(topic.performance.averageScore)}">
                                    ${topic.performance.averageScore}%
                                </span>
                            </div>
                        </div>
                        
                        <div class="weak-topic-content">
                            <h4 class="topic-title">${topic.text}</h4>
                            
                            <div class="topic-stats">
                                <div class="stat">
                                    <span class="stat-label">Questões:</span>
                                    <span class="stat-value">${topic.performance.totalQuestions}</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Acertos:</span>
                                    <span class="stat-value">${topic.performance.correctAnswers}</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Última prática:</span>
                                    <span class="stat-value">${this.formatDate(topic.performance.lastPractice?.split('T')[0]) || 'Nunca'}</span>
                                </div>
                            </div>
                            
                            <div class="topic-analysis">
                                <div class="analysis-result">
                                    <i class="fas fa-lightbulb"></i>
                                    <span>${this.getTopicRecommendation(topic.performance.averageScore, topic.disciplineWeight)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="weak-topic-actions">
                            <button class="btn btn-primary" onclick="StudySystem.practiceWeakTopic('${topic.disciplineId}', '${topic.id}')">
                                <i class="fas fa-dumbbell"></i> Praticar agora
                            </button>
                            <button class="btn btn-outline" onclick="StudySystem.scheduleTopicReview('${topic.disciplineId}', '${topic.id}')">
                                <i class="fas fa-calendar-plus"></i> Agendar revisão
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div>`;
        container.innerHTML = html;

        const totalPages = Math.ceil(allWeakTopics.length / this.config.itemsPerPage);
        document.getElementById('page-info').textContent = `Página ${this.config.currentPage} de ${totalPages} (${allWeakTopics.length} tópicos críticos)`;
    },

    // Filtrar disciplinas baseado na aba atual
    filterDisciplines() {
        const today = new Date().toISOString().split('T')[0];
        
        switch (this.config.currentTab) {
            case 'today':
                return this.data.disciplines.filter(d => 
                    d.nextReview && d.nextReview.split('T')[0] === today
                );
                
            case 'overdue':
                return this.data.disciplines.filter(d => 
                    d.nextReview && d.nextReview.split('T')[0] < today
                );
                
            case 'mastered':
                return this.data.disciplines.filter(d => {
                    const avgScore = this.calculateDisciplineAverage(d);
                    const weakTopics = this.getWeakTopics(d);
                    return d.progress >= 90 && avgScore >= 80 && weakTopics.length === 0;
                });
                
            case 'all':
            default:
                return this.data.disciplines.filter(d => 
                    !this.config.searchTerm || 
                    d.name.toLowerCase().includes(this.config.searchTerm) ||
                    (d.tasks && d.tasks.some(task => 
                        task.text.toLowerCase().includes(this.config.searchTerm)
                    ))
                );
        }
    },

    // Ordenar disciplinas - ATUALIZADO COM NOVAS OPÇÕES
    sortDisciplinesArray(disciplines) {
        return disciplines.sort((a, b) => {
            switch (this.config.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                    
                case 'next-review':
                    if (!a.nextReview) return 1;
                    if (!b.nextReview) return -1;
                    return new Date(a.nextReview) - new Date(b.nextReview);
                    
                case 'progress':
                    return b.progress - a.progress;
                    
                case 'performance':
                    return this.calculateDisciplineAverage(b) - this.calculateDisciplineAverage(a);
                    
                case 'weight': // Nova opção: ordenar por peso
                    return b.weight - a.weight;
                    
                case 'performance-granular': // Nova opção: ordenar por prioridade granular
                    const aPriority = this.calculateDisciplinePriority(a);
                    const bPriority = this.calculateDisciplinePriority(b);
                    return bPriority - aPriority;
                    
                case 'priority':
                    return b.priority - a.priority;
                    
                default:
                    return 0;
            }
        });
    },

    // Criar card de disciplina VERSÃO 4.7 COM ANÁLISE GRANULAR
    createDisciplineCard(discipline) {
        const today = new Date().toISOString().split('T')[0];
        const nextReviewDate = discipline.nextReview ? discipline.nextReview.split('T')[0] : null;
        
        let reviewStatus = 'future';
        if (nextReviewDate === today) reviewStatus = 'today';
        else if (nextReviewDate && nextReviewDate < today) reviewStatus = 'due';
        
        const reviewStatusText = {
            'today': 'Hoje',
            'due': 'Atrasada',
            'future': this.formatDate(nextReviewDate)
        }[reviewStatus];

        // Calcular progresso e desempenho
        const completedTasks = discipline.tasks ? discipline.tasks.filter(t => t.completed).length : 0;
        const totalTasks = discipline.tasks ? discipline.tasks.length : 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const avgScore = this.calculateDisciplineAverage(discipline);
        const weakTopics = this.getWeakTopics(discipline);
        const strongTopics = this.getStrongTopics(discipline);
        const analysis = discipline.granularAnalysis || this.calculateGranularAnalysis(discipline);

        // Verificar se é de alta prioridade (Gourmet)
        const isHighPriority = discipline.weight >= 15 || (discipline.weight >= 10 && weakTopics.length > 0);
        const cardClass = isHighPriority ? 'discipline-card gourmet fade-in' : 'discipline-card fade-in';

        return `
            <div class="${cardClass}" style="border-left-color: ${discipline.color}; ${isHighPriority ? 'border-width: 3px;' : ''}">
                ${isHighPriority ? `
                    <div class="gourmet-badge">
                        <i class="fas fa-crown"></i> ALTA PRIORIDADE
                    </div>
                ` : ''}
                
                <div class="discipline-header">
                    <div class="discipline-title-row">
                        <h3 class="discipline-title" style="color: ${discipline.color};">${discipline.name}</h3>
                        <div class="weight-display">
                            <span class="weight-label">Peso:</span>
                            <span class="weight-value ${discipline.weight >= 15 ? 'weight-high' : discipline.weight >= 10 ? 'weight-medium' : 'weight-low'}">
                                ${discipline.weight}
                            </span>
                        </div>
                    </div>
                    <div class="discipline-meta">
                        <span class="review-badge ${reviewStatus}">${reviewStatusText}</span>
                        ${avgScore > 0 ? `
                            <span class="performance-badge ${this.getPerformanceClass(avgScore)}">
                                ${avgScore}%
                            </span>
                        ` : ''}
                        ${weakTopics.length > 0 ? `
                            <span class="warning-badge">
                                <i class="fas fa-exclamation-triangle"></i> ${weakTopics.length} tópico(s) crítico(s)
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="discipline-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%; background: ${discipline.color};"></div>
                    </div>
                    <div class="progress-info">
                        <span>Progresso: ${progress}%</span>
                        <span>Desempenho: ${avgScore > 0 ? avgScore + '%' : 'N/A'}</span>
                    </div>
                </div>
                
                <!-- SEÇÃO DE ANÁLISE GRANULAR (NOVO) -->
                <div class="granular-analysis">
                    <div class="analysis-header">
                        <h4><i class="fas fa-search"></i> Análise por Tópico</h4>
                    </div>
                    
                    <div class="analysis-stats">
                        <div class="stat-item">
                            <div class="stat-number ${strongTopics.length > 0 ? 'stat-good' : ''}">${strongTopics.length}</div>
                            <div class="stat-label">Pontos Fortes</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number ${weakTopics.length === 0 ? 'stat-good' : 'stat-warning'}">${weakTopics.length}</div>
                            <div class="stat-label">Tópicos Críticos</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${analysis.averageScore || 0}%</div>
                            <div class="stat-label">Média Ponderada</div>
                        </div>
                    </div>
                    
                    ${weakTopics.length > 0 ? `
                        <div class="weak-topics-preview">
                            <div class="preview-header">
                                <span class="preview-title"><i class="fas fa-exclamation-circle"></i> Foque nestes tópicos:</span>
                                <button class="btn-text btn-small" onclick="StudySystem.openWeakTopics('${discipline.id}')">
                                    Ver todos
                                </button>
                            </div>
                            <div class="preview-list">
                                ${weakTopics.slice(0, 2).map(topic => `
                                    <div class="preview-item">
                                        <span class="topic-name">${topic.text}</span>
                                        <span class="topic-score ${this.getPerformanceClass(topic.performance.averageScore)}">
                                            ${topic.performance.averageScore}%
                                        </span>
                                    </div>
                                `).join('')}
                                ${weakTopics.length > 2 ? `<div class="more-topics">+${weakTopics.length - 2} mais</div>` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <!-- FIM DA SEÇÃO DE ANÁLISE GRANULAR -->
                
                <!-- TO-DO LIST COM PERFORMANCE (MANTIDO DA 4.5) -->
                <div class="todo-list-container">
                    <div class="todo-list">
                        ${discipline.tasks && discipline.tasks.length > 0 ? 
                            discipline.tasks.slice(0, 3).map(task => `
                                <div class="todo-item" data-task-id="${task.id}">
                                    <input type="checkbox" 
                                           id="task-${task.id}" 
                                           ${task.completed ? 'checked' : ''}
                                           onchange="StudySystem.toggleTask('${discipline.id}', '${task.id}')">
                                    <label for="task-${task.id}" class="${task.completed ? 'completed' : ''}">
                                        <span class="todo-text">${task.text}</span>
                                        <span class="todo-performance">
                                            ${task.performance && task.performance.totalQuestions > 0 ? 
                                                `<span class="performance-score ${this.getPerformanceClass(task.performance.averageScore)}">
                                                    ${task.performance.averageScore}%
                                                </span>` : 
                                                `<span class="performance-score no-data">0%</span>`
                                            }
                                        </span>
                                    </label>
                                </div>
                            `).join('') : 
                            `<div class="no-tasks">Nenhuma tarefa definida</div>`
                        }
                        
                        ${discipline.tasks && discipline.tasks.length > 3 ? 
                            `<div class="more-tasks">+${discipline.tasks.length - 3} tarefas restantes</div>` : 
                            ''
                        }
                    </div>
                    
                    <div class="todo-stats">
                        <span>${completedTasks} de ${totalTasks} concluídas</span>
                        <div class="todo-actions">
                            <button class="btn-text" onclick="StudySystem.openTaskManager('${discipline.id}')">
                                <i class="fas fa-tasks"></i> Tarefas
                            </button>
                            <button class="btn-text" onclick="StudySystem.recordQuestions('${discipline.id}')">
                                <i class="fas fa-chart-line"></i> Desempenho
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="discipline-actions">
                    ${weakTopics.length > 0 ? `
                        <button class="btn btn-warning btn-small" onclick="StudySystem.focusOnWeakTopics('${discipline.id}')">
                            <i class="fas fa-bullseye"></i> Focar nos fracos
                        </button>
                    ` : ''}
                    <button class="btn btn-primary btn-small" onclick="StudySystem.markAsReviewed('${discipline.id}')">
                        <i class="fas fa-check"></i> Revisar
                    </button>
                    <button class="btn btn-outline btn-small" onclick="StudySystem.openTopicAnalysis('${discipline.id}')">
                        <i class="fas fa-chart-pie"></i> Análise
                    </button>
                    <button class="btn btn-success btn-small" onclick="StudySystem.scheduleReview('${discipline.id}')">
                        <i class="fas fa-calendar-plus"></i> Agendar
                    </button>
                </div>
            </div>
        `;
    },

    // ===== NOVAS FUNÇÕES DA VERSÃO 4.6 =====

    // Calcular análise granular
    calculateGranularAnalysis(discipline) {
        if (!discipline.tasks || discipline.tasks.length === 0) {
            return {
                strongTopics: 0,
                weakTopics: 0,
                mediumTopics: 0,
                averageScore: 0,
                weightedAverage: 0,
                priorityScore: 0
            };
        }

        const weakTopics = this.getWeakTopics(discipline);
        const strongTopics = this.getStrongTopics(discipline);
        const mediumTopics = discipline.tasks.length - weakTopics.length - strongTopics.length;

        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        discipline.tasks.forEach(task => {
            if (task.performance && task.performance.totalQuestions > 0) {
                const taskWeight = this.calculateTaskWeight(task, discipline.weight);
                totalWeightedScore += (task.performance.averageScore || 0) * taskWeight;
                totalWeight += taskWeight;
            }
        });

        const weightedAverage = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
        const priorityScore = (discipline.weight * 10) + (weakTopics.length * 20) - (weightedAverage / 2);

        return {
            strongTopics: strongTopics.length,
            weakTopics: weakTopics.length,
            mediumTopics,
            averageScore: this.calculateDisciplineAverage(discipline),
            weightedAverage,
            priorityScore
        };
    },

    // Calcular peso da tarefa (nova função)
    calculateTaskWeight(task, disciplineWeight) {
        let baseWeight = 1;
        
        // Tarefas com baixo desempenho têm peso maior
        if (task.performance && task.performance.averageScore < 60) {
            baseWeight *= 2;
        }
        
        // Disciplinas com peso maior aumentam o peso das tarefas
        if (disciplineWeight >= 15) {
            baseWeight *= 1.5;
        } else if (disciplineWeight >= 10) {
            baseWeight *= 1.2;
        }
        
        return baseWeight;
    },

    // Calcular prioridade da disciplina (nova função)
    calculateDisciplinePriority(discipline) {
        const weakTopics = this.getWeakTopics(discipline);
        const avgScore = this.calculateDisciplineAverage(discipline);
        return (discipline.weight * 10) + (weakTopics.length * 20) - (avgScore / 2);
    },

    // Obter tópicos fracos (nova função)
    getWeakTopics(discipline) {
        if (!discipline.tasks) return [];
        return discipline.tasks.filter(task => 
            task.performance && 
            task.performance.totalQuestions > 0 && 
            task.performance.averageScore < 60
        );
    },

    // Obter tópicos fortes (nova função)
    getStrongTopics(discipline) {
        if (!discipline.tasks) return [];
        return discipline.tasks.filter(task => 
            task.performance && 
            task.performance.totalQuestions > 0 && 
            task.performance.averageScore >= 80
        );
    },

    // Calcular prioridade do tópico (nova função)
    calculateTopicPriority(task) {
        if (!task.performance || task.performance.totalQuestions === 0) {
            return 'unknown';
        }
        
        const score = task.performance.averageScore;
        if (score >= 80) return 'strong';
        if (score >= 60) return 'medium';
        if (score >= 40) return 'weak';
        return 'critical';
    },

    // Obter classe de prioridade para tópico (nova função)
    getTopicPriorityClass(score, weight) {
        if (score < 50 && weight >= 15) return 'priority-critical';
        if (score < 60 && weight >= 10) return 'priority-high';
        if (score < 70) return 'priority-medium';
        return 'priority-low';
    },

    // Obter recomendação para tópico (nova função)
    getTopicRecommendation(score, weight) {
        if (score < 50 && weight >= 15) {
            return 'CRÍTICO: Tópico essencial com desempenho muito baixo. Estude urgentemente!';
        }
        if (score < 60 && weight >= 10) {
            return 'ALTA PRIORIDADE: Tópico importante precisa de atenção imediata.';
        }
        if (score < 70) {
            return 'PRIORIDADE MÉDIA: Revisar e praticar mais questões.';
        }
        if (score < 80) {
            return 'PRIORIDADE BAIXA: Mantenha o ritmo com revisões espaçadas.';
        }
        return 'EXCELENTE: Continue com revisões espaçadas para manutenção.';
    },

    // Focar em tópicos fracos (nova função)
    async focusOnWeakTopics(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const weakTopics = this.getWeakTopics(discipline);
        
        if (weakTopics.length === 0) {
            this.showNotification(`"${discipline.name}" não tem tópicos críticos! Continue assim!`, 'success');
            return;
        }

        const modal = document.getElementById('discipline-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        title.textContent = `Plano de Estudo Focado: ${discipline.name}`;
        
        body.innerHTML = `
            <div class="focus-plan">
                <div class="plan-header">
                    <div class="plan-discipline">
                        <div class="color-dot-large" style="background: ${discipline.color};"></div>
                        <div>
                            <h3>${discipline.name}</h3>
                            <p class="plan-subtitle">Peso no edital: ${discipline.weight} | ${weakTopics.length} tópicos críticos</p>
                        </div>
                    </div>
                    <div class="plan-stats">
                        <div class="stat">
                            <span class="stat-label">Desempenho Atual:</span>
                            <span class="stat-value ${this.getPerformanceClass(this.calculateDisciplineAverage(discipline))}">
                                ${this.calculateDisciplineAverage(discipline)}%
                            </span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Meta:</span>
                            <span class="stat-value">70%+</span>
                        </div>
                    </div>
                </div>
                
                <div class="plan-content">
                    <h4><i class="fas fa-bullseye"></i> Tópicos para Foco Imediato</h4>
                    
                    ${weakTopics.map((topic, index) => `
                        <div class="focus-topic ${this.getTopicPriorityClass(topic.performance.averageScore, discipline.weight)}">
                            <div class="topic-header">
                                <span class="topic-number">${index + 1}</span>
                                <h5 class="topic-title">${topic.text}</h5>
                                <span class="topic-score ${this.getPerformanceClass(topic.performance.averageScore)}">
                                    ${topic.performance.averageScore}%
                                </span>
                            </div>
                            <div class="topic-details">
                                <div class="detail">
                                    <span class="detail-label">Questões praticadas:</span>
                                    <span class="detail-value">${topic.performance.totalQuestions}</span>
                                </div>
                                <div class="detail">
                                    <span class="detail-label">Taxa de acerto:</span>
                                    <span class="detail-value">${Math.round((topic.performance.correctAnswers / topic.performance.totalQuestions) * 100)}%</span>
                                </div>
                                <div class="detail">
                                    <span class="detail-label">Recomendação:</span>
                                    <span class="detail-value">${this.getTopicRecommendation(topic.performance.averageScore, discipline.weight)}</span>
                                </div>
                            </div>
                            <div class="topic-actions">
                                <button class="btn btn-primary btn-small" onclick="StudySystem.practiceWeakTopic('${disciplineId}', '${topic.id}')">
                                    <i class="fas fa-play-circle"></i> Praticar agora
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Fechar</button>
                    <button type="button" class="btn btn-primary" onclick="StudySystem.createStudySession('${disciplineId}', ${weakTopics.length})">
                        <i class="fas fa-play"></i> Iniciar Sessão de Estudo
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    },

    // Praticar tópico fraco (nova função)
    async practiceWeakTopic(disciplineId, taskId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const task = discipline.tasks.find(t => t.id === taskId);
        if (!task) return;

        const questions = prompt(`Quantas questões de "${task.text}" você vai praticar agora?\n\nDesempenho atual: ${task.performance.averageScore}%`, 10);
        if (questions === null) return;

        const questionCount = parseInt(questions);
        if (isNaN(questionCount) || questionCount < 1) {
            this.showNotification('Número inválido de questões', 'warning');
            return;
        }

        this.showNotification(`Inicie a prática de ${questionCount} questões em "${task.text}"`, 'info');
        
        setTimeout(() => {
            this.recordTopicPractice(disciplineId, taskId, questionCount);
        }, 100);
    },

    // Registrar prática de tópico (nova função)
    async recordTopicPractice(disciplineId, taskId, questionCount) {
        const correct = prompt(`Das ${questionCount} questões de prática, quantas você acertou?`, Math.floor(questionCount * 0.7));
        if (correct === null) return;

        const correctCount = parseInt(correct);
        if (isNaN(correctCount) || correctCount < 0 || correctCount > questionCount) {
            this.showNotification('Número de acertos inválido', 'warning');
            return;
        }

        await this.quickRecord(disciplineId, taskId, questionCount, correctCount);
    },

    // Abrir análise de tópicos (nova função)
    openTopicAnalysis(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const weakTopics = this.getWeakTopics(discipline);
        const strongTopics = this.getStrongTopics(discipline);

        const modal = document.getElementById('discipline-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        title.textContent = `Análise Granular: ${discipline.name}`;
        
        body.innerHTML = `
            <div class="topic-analysis-modal">
                <div class="analysis-overview">
                    <div class="overview-card">
                        <h4><i class="fas fa-weight-hanging"></i> Peso no Edital</h4>
                        <div class="overview-value ${discipline.weight >= 15 ? 'weight-high' : discipline.weight >= 10 ? 'weight-medium' : 'weight-low'}">
                            ${discipline.weight}
                        </div>
                        <p>${discipline.weight >= 15 ? 'Alta prioridade' : discipline.weight >= 10 ? 'Prioridade média' : 'Prioridade baixa'}</p>
                    </div>
                    <div class="overview-card">
                        <h4><i class="fas fa-chart-line"></i> Desempenho Médio</h4>
                        <div class="overview-value ${this.getPerformanceClass(this.calculateDisciplineAverage(discipline))}">
                            ${this.calculateDisciplineAverage(discipline)}%
                        </div>
                        <p>Média de todos os tópicos</p>
                    </div>
                    <div class="overview-card">
                        <h4><i class="fas fa-exclamation-triangle"></i> Tópicos Críticos</h4>
                        <div class="overview-value ${weakTopics.length > 0 ? 'stat-warning' : 'stat-good'}">
                            ${weakTopics.length}
                        </div>
                        <p>Desempenho abaixo de 60%</p>
                    </div>
                </div>
                
                <div class="analysis-sections">
                    ${weakTopics.length > 0 ? `
                        <div class="analysis-section critical">
                            <div class="section-header">
                                <h4><i class="fas fa-fire"></i> Tópicos Críticos (${weakTopics.length})</h4>
                                <span class="section-subtitle">Foco imediato necessário</span>
                            </div>
                            <div class="topics-list">
                                ${weakTopics.map(topic => `
                                    <div class="topic-analysis-item">
                                        <div class="topic-info">
                                            <h5>${topic.text}</h5>
                                            <div class="topic-stats-mini">
                                                <span>${topic.performance.totalQuestions} questões</span>
                                                <span>${topic.performance.correctAnswers} acertos</span>
                                                <span class="score-bad ${this.getPerformanceClass(topic.performance.averageScore)}">
                                                    ${topic.performance.averageScore}%
                                                </span>
                                            </div>
                                        </div>
                                        <div class="topic-actions-mini">
                                            <button class="btn btn-warning btn-small" onclick="StudySystem.practiceWeakTopic('${disciplineId}', '${topic.id}')">
                                                Praticar
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${strongTopics.length > 0 ? `
                        <div class="analysis-section strong">
                            <div class="section-header">
                                <h4><i class="fas fa-check-circle"></i> Pontos Fortes (${strongTopics.length})</h4>
                                <span class="section-subtitle">Continue mantendo!</span>
                            </div>
                            <div class="topics-list">
                                ${strongTopics.map(topic => `
                                    <div class="topic-analysis-item">
                                        <div class="topic-info">
                                            <h5>${topic.text}</h5>
                                            <div class="topic-stats-mini">
                                                <span>${topic.performance.totalQuestions} questões</span>
                                                <span class="score-good ${this.getPerformanceClass(topic.performance.averageScore)}">
                                                    ${topic.performance.averageScore}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="analysis-recommendations">
                    <h4><i class="fas fa-lightbulb"></i> Recomendações</h4>
                    <div class="recommendation-card">
                        <p><strong>${this.getStudyRecommendation(discipline)}</strong></p>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Fechar</button>
                    ${weakTopics.length > 0 ? `
                        <button type="button" class="btn btn-primary" onclick="StudySystem.focusOnWeakTopics('${disciplineId}')">
                            <i class="fas fa-bullseye"></i> Focar nos Tópicos Críticos
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    },

    // Obter recomendação de estudo (nova função)
    getStudyRecommendation(discipline) {
        const weakTopics = this.getWeakTopics(discipline);
        const avgScore = this.calculateDisciplineAverage(discipline);
        
        if (weakTopics.length === 0 && avgScore >= 80) {
            return `Excelente desempenho em ${discipline.name}! Continue com revisões espaçadas a cada ${discipline.reviewCycle} dias.`;
        }
        
        if (weakTopics.length === 0) {
            return `Bom desempenho geral. Foque em melhorar tópicos estáveis para atingir excelência.`;
        }
        
        if (discipline.weight >= 15) {
            return `ALTA PRIORIDADE: ${discipline.name} tem peso ${discipline.weight} no edital. Foque 80% do tempo nos ${weakTopics.length} tópicos críticos.`;
        }
        
        if (discipline.weight >= 10) {
            return `PRIORIDADE: ${discipline.name} tem peso ${discipline.weight}. Distribua: 60% em tópicos críticos, 40% em revisão geral.`;
        }
        
        return `Foque principalmente nos ${weakTopics.length} tópicos críticos. Use revisões espaçadas para tópicos já dominados.`;
    },

    // Criar sessão de estudo (nova função)
    async createStudySession(disciplineId, topicCount) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const today = new Date();
        
        // Registrar no histórico
        this.data.studyHistory.push({
            disciplineId,
            disciplineName: discipline.name,
            date: today.toISOString(),
            type: 'focused-session',
            topics: topicCount,
            duration: 60 // minutos estimados
        });
        
        await this.saveHistory();
        this.closeModal();
        
        this.showNotification(`Sessão de estudo focada iniciada para ${discipline.name} (${topicCount} tópicos)`, 'success');
    },

    // Agendar revisão de tópico específico (nova função)
    async scheduleTopicReview(disciplineId, taskId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const task = discipline.tasks.find(t => t.id === taskId);
        if (!task) return;

        const days = prompt(`Agendar revisão para "${task.text}" em quantos dias?`, 1);
        if (days === null) return;

        const daysNum = parseInt(days);
        if (isNaN(daysNum) || daysNum < 1) {
            this.showNotification('Número de dias inválido', 'warning');
            return;
        }

        // Criar uma revisão específica para este tópico
        this.showNotification(`Revisão agendada para "${task.text}" em ${daysNum} dias.`, 'info');
    },

    // ===== FUNÇÕES MANTIDAS DA VERSÃO 4.5 (COM PEQUENAS ATUALIZAÇÕES) =====

    // Contar total de questões
    countTotalQuestions(discipline) {
        if (!discipline.tasks) return 0;
        return discipline.tasks.reduce((total, task) => 
            total + (task.performance?.totalQuestions || 0), 0
        );
    },

    // Calcular média da disciplina
    calculateDisciplineAverage(discipline) {
        if (!discipline.tasks || discipline.tasks.length === 0) return 0;
        
        const tasksWithQuestions = discipline.tasks.filter(t => 
            t.performance && t.performance.totalQuestions > 0
        );
        
        if (tasksWithQuestions.length === 0) return 0;
        
        const totalScore = tasksWithQuestions.reduce((sum, task) => 
            sum + (task.performance.averageScore || 0), 0
        );
        
        return Math.round(totalScore / tasksWithQuestions.length);
    },

    // Obter classe CSS baseada no desempenho
    getPerformanceClass(score) {
        if (score >= 80) return 'performance-good';
        if (score >= 60) return 'performance-medium';
        if (score > 0) return 'performance-poor';
        return 'performance-none';
    },

    // Renderizar revisões de hoje
    renderTodayReviews() {
        const container = document.getElementById('today-reviews-list');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const todayReviews = this.data.disciplines.filter(d => 
            d.nextReview && d.nextReview.split('T')[0] === today
        );

        if (todayReviews.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray-600);">
                    <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 1rem; color: var(--success);"></i>
                    <p>Nenhuma revisão agendada para hoje!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = todayReviews.map(discipline => {
            const completedTasks = discipline.tasks ? discipline.tasks.filter(t => t.completed).length : 0;
            const totalTasks = discipline.tasks ? discipline.tasks.length : 0;
            const avgScore = this.calculateDisciplineAverage(discipline);
            
            return `
                <div class="review-item">
                    <div class="review-discipline">
                        <div class="discipline-dot" style="background: ${discipline.color};"></div>
                        <div class="review-info">
                            <div class="review-title">${discipline.name}</div>
                            <div class="review-stats">
                                <span class="review-progress">${completedTasks}/${totalTasks}</span>
                                <span class="review-performance ${this.getPerformanceClass(avgScore)}">${avgScore}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="review-actions">
                        <button class="btn btn-primary btn-small" onclick="StudySystem.markAsReviewed('${discipline.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Atualizar contador
        document.getElementById('today-reviews').textContent = todayReviews.length;
    },

    // Renderizar dashboard de desempenho (atualizado)
    renderPerformanceDashboard() {
        const container = document.getElementById('performance-dashboard');
        if (!container) return;

        // Calcular estatísticas gerais
        const stats = this.calculatePerformanceStats();
        
        // Filtrar disciplinas por desempenho
        let filteredDisciplines = [...this.data.disciplines];
        
        if (this.config.performanceFilter !== 'all') {
            filteredDisciplines = filteredDisciplines.filter(discipline => {
                const avgScore = this.calculateDisciplineAverage(discipline);
                switch (this.config.performanceFilter) {
                    case 'good': return avgScore >= 80;
                    case 'medium': return avgScore >= 60 && avgScore < 80;
                    case 'poor': return avgScore > 0 && avgScore < 60;
                    case 'no-data': return avgScore === 0;
                    default: return true;
                }
            });
        }

        // Ordenar por desempenho (pior primeiro)
        filteredDisciplines.sort((a, b) => 
            this.calculateDisciplineAverage(a) - this.calculateDisciplineAverage(b)
        );

        container.innerHTML = `
            <div class="performance-stats">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalQuestions}</div>
                    <div class="stat-label">Questões Respondidas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.averageScore}%</div>
                    <div class="stat-label">Média Geral</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.strongAreas}</div>
                    <div class="stat-label">Pontos Fortes (>80%)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.weakAreas}</div>
                    <div class="stat-label">Atenção (<60%)</div>
                </div>
            </div>
            
            <div class="performance-list">
                <h4>Análise por Disciplina</h4>
                ${filteredDisciplines.map(discipline => {
                    const avgScore = this.calculateDisciplineAverage(discipline);
                    const totalQuestions = this.countTotalQuestions(discipline);
                    const completion = discipline.progress || 0;
                    const weakTopics = this.getWeakTopics(discipline);
                    
                    return `
                        <div class="performance-item">
                            <div class="performance-header">
                                <div class="performance-title">
                                    <div class="discipline-dot-small" style="background: ${discipline.color};"></div>
                                    <span>${discipline.name}</span>
                                    <span class="weight-tag">Peso: ${discipline.weight}</span>
                                </div>
                                <div class="performance-score-badge ${this.getPerformanceClass(avgScore)}">
                                    ${avgScore > 0 ? avgScore + '%' : 'Sem dados'}
                                </div>
                            </div>
                            
                            <div class="performance-details">
                                <div class="progress-row">
                                    <span>Conclusão:</span>
                                    <div class="mini-progress-bar">
                                        <div class="mini-progress-fill" style="width: ${completion}%; background: ${discipline.color};"></div>
                                    </div>
                                    <span>${completion}%</span>
                                </div>
                                <div class="progress-row">
                                    <span>Questões:</span>
                                    <span>${totalQuestions} respondidas</span>
                                </div>
                                <div class="progress-row">
                                    <span>Tópicos críticos:</span>
                                    <span class="${weakTopics.length > 0 ? 'text-warning' : 'text-success'}">
                                        ${weakTopics.length}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="performance-actions">
                                <button class="btn-text btn-small" onclick="StudySystem.recordQuestions('${discipline.id}')">
                                    <i class="fas fa-plus-circle"></i> Registrar questões
                                </button>
                                <button class="btn-text btn-small" onclick="StudySystem.openTopicAnalysis('${discipline.id}')">
                                    <i class="fas fa-chart-pie"></i> Ver análise
                                </button>
                                ${weakTopics.length > 0 ? `
                                    <button class="btn-text btn-small btn-warning" onclick="StudySystem.focusOnWeakTopics('${discipline.id}')">
                                        <i class="fas fa-bullseye"></i> Focar nos fracos
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
                
                ${filteredDisciplines.length === 0 ? `
                    <div class="no-performance-data">
                        <i class="fas fa-chart-line"></i>
                        <p>Nenhuma disciplina encontrada com este filtro</p>
                    </div>
                ` : ''}
            </div>
        `;
    },

    // Calcular estatísticas de desempenho
    calculatePerformanceStats() {
        let totalQuestions = 0;
        let totalScore = 0;
        let disciplinesWithData = 0;
        let strongAreas = 0;
        let weakAreas = 0;

        this.data.disciplines.forEach(discipline => {
            const avgScore = this.calculateDisciplineAverage(discipline);
            const disciplineQuestions = this.countTotalQuestions(discipline);
            
            totalQuestions += disciplineQuestions;
            
            if (avgScore > 0) {
                totalScore += avgScore;
                disciplinesWithData++;
                
                if (avgScore >= 80) strongAreas++;
                if (avgScore < 60) weakAreas++;
            }
        });

        return {
            totalQuestions,
            averageScore: disciplinesWithData > 0 ? Math.round(totalScore / disciplinesWithData) : 0,
            strongAreas,
            weakAreas,
            disciplinesWithData
        };
    },

    // Renderizar calendário
    renderCalendar() {
        const container = document.getElementById('review-calendar');
        if (!container) return;

        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Criar array de dias
        const days = [];
        const startDay = firstDay.getDay();
        
        // Dias vazios no início
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        
        // Dias do mês
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(today.getFullYear(), today.getMonth(), i));
        }

        // Contar revisões por dia
        const reviewsByDay = {};
        this.data.disciplines.forEach(discipline => {
            if (discipline.nextReview) {
                const date = discipline.nextReview.split('T')[0];
                reviewsByDay[date] = (reviewsByDay[date] || 0) + 1;
            }
        });

        // Gerar HTML
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        let html = weekdays.map(day => `
            <div class="calendar-header">${day}</div>
        `).join('');

        html += days.map((date, index) => {
            if (!date) return '<div class="calendar-day"></div>';
            
            const dateStr = date.toISOString().split('T')[0];
            const todayStr = today.toISOString().split('T')[0];
            const reviewsCount = reviewsByDay[dateStr] || 0;
            
            let dayClass = 'calendar-day';
            if (dateStr === todayStr) dayClass += ' today';
            if (reviewsCount === 1) dayClass += ' has-review';
            if (reviewsCount > 1) dayClass += ' multiple-reviews';
            
            return `
                <div class="${dayClass}" title="${reviewsCount} revisão(s) em ${this.formatDate(dateStr)}">
                    ${date.getDate()}
                    ${reviewsCount > 0 ? `<span style="font-size: 0.7rem;">(${reviewsCount})</span>` : ''}
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    },

    // Mostrar aba
    showTab(tabName) {
        this.config.currentTab = tabName;
        this.config.currentPage = 1;
        
        // Atualizar tabs ativas
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        // Renderizar disciplinas conforme o modo de visualização
        if (this.config.viewMode === 'table') {
            this.renderDisciplinesTable();
        } else if (this.config.viewMode === 'weak-topics') {
            this.renderWeakTopicsView();
        } else {
            this.renderDisciplines();
        }
    },

    // Adicionar disciplina - ATUALIZADO COM PESO
    async handleAddDiscipline(e) {
        e.preventDefault();
        
        const name = document.getElementById('discipline-name').value.trim();
        const color = document.getElementById('discipline-color').value;
        const reviewCycle = parseInt(document.getElementById('review-cycle').value);
        const weight = parseInt(document.getElementById('discipline-weight').value) || 10; // Novo campo
        const notes = document.getElementById('discipline-notes').value.trim();
        
        if (!name) {
            alert('Por favor, insira um nome para a disciplina.');
            return;
        }

        // Converter notas para tasks iniciais
        const initialTasks = notes ? this.convertNotesToTasks(notes) : [];

        const newDiscipline = {
            id: this.generateId(),
            name,
            color,
            weight, // Novo campo
            reviewCycle,
            progress: 0,
            nextReview: this.getNextReviewDate(reviewCycle),
            lastReview: null,
            totalReviews: 0,
            createdAt: new Date().toISOString(),
            priority: this.data.disciplines.length + 1,
            tasks: initialTasks
        };

        this.data.disciplines.push(newDiscipline);
        await this.saveDisciplines();
        
        // Resetar formulário
        e.target.reset();
        document.getElementById('selected-color').textContent = '#1a237e';
        document.getElementById('selected-weight').textContent = '10'; // Resetar para padrão
        
        // Atualizar interface
        this.renderInterface();
        this.updateStatistics();
        
        this.showNotification(`Disciplina "${name}" (Peso: ${weight}) adicionada com sucesso!`, 'success');
    },

    // Marcar como revisado
    async markAsReviewed(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const today = new Date();
        
        // Atualizar disciplina
        discipline.lastReview = today.toISOString();
        discipline.nextReview = this.getNextReviewDate(discipline.reviewCycle);
        discipline.totalReviews++;
        
        // Adicionar ao histórico
        this.data.studyHistory.push({
            disciplineId,
            disciplineName: discipline.name,
            date: today.toISOString(),
            type: 'review',
            progress: discipline.progress,
            performance: this.calculateDisciplineAverage(discipline)
        });
        
        await this.saveData();
        
        // Atualizar interface
        this.renderInterface();
        this.updateStatistics();
        
        this.showNotification(`Revisão de "${discipline.name}" registrada! Próxima: ${this.formatDate(discipline.nextReview)}`, 'success');
    },

    // Agendar revisão manualmente
    async scheduleReview(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const days = prompt(`Agendar revisão para "${discipline.name}" em quantos dias?`, discipline.reviewCycle);
        if (days === null) return;

        const daysNum = parseInt(days);
        if (isNaN(daysNum) || daysNum < 1) {
            this.showNotification('Número de dias inválido', 'warning');
            return;
        }

        discipline.nextReview = this.getNextReviewDate(daysNum);
        await this.saveDisciplines();
        this.renderInterface();
        
        this.showNotification(`Revisão agendada para ${this.formatDate(discipline.nextReview)}!`, 'success');
    },

    // Agendar revisão extra para disciplinas com baixo desempenho
    async scheduleExtraReview(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        // Agenda para amanhã (revisão urgente)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        discipline.nextReview = tomorrow.toISOString();
        
        await this.saveDisciplines();
        this.renderInterface();
        
        this.showNotification(`Revisão urgente agendada para amanhã!`, 'warning');
    },

    // Calcular próxima revisão automaticamente
    calculateNextReview(discipline) {
        if (!discipline.lastReview) {
            return this.getNextReviewDate(discipline.reviewCycle);
        }
        
        const lastReview = new Date(discipline.lastReview);
        const nextDate = new Date(lastReview);
        nextDate.setDate(nextDate.getDate() + discipline.reviewCycle);
        
        return nextDate.toISOString();
    },

    // Registrar questões respondidas
    async recordQuestions(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const modal = document.getElementById('discipline-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        title.textContent = `Registrar Desempenho: ${discipline.name}`;
        
        body.innerHTML = `
            <div class="performance-recorder">
                <div class="recorder-instructions">
                    <p><i class="fas fa-info-circle"></i> Registre seu desempenho em questões para cada tópico. Isso ajuda a identificar pontos fortes e fracos.</p>
                </div>
                
                <div class="recorder-form">
                    ${discipline.tasks && discipline.tasks.length > 0 ? 
                        discipline.tasks.map(task => `
                            <div class="recorder-item">
                                <div class="recorder-task">
                                    <span class="task-name">${task.text}</span>
                                    <span class="task-current-score ${this.getPerformanceClass(task.performance?.averageScore || 0)}">
                                        ${task.performance?.averageScore || 0}%
                                    </span>
                                </div>
                                <div class="recorder-inputs">
                                    <div class="input-group">
                                        <label>Total de Questões:</label>
                                        <input type="number" 
                                               min="0" 
                                               value="${task.performance?.totalQuestions || 0}" 
                                               id="total-${task.id}"
                                               class="question-input">
                                    </div>
                                    <div class="input-group">
                                        <label>Acertos:</label>
                                        <input type="number" 
                                               min="0" 
                                               max="${task.performance?.totalQuestions || 100}" 
                                               value="${task.performance?.correctAnswers || 0}" 
                                               id="correct-${task.id}"
                                               class="question-input">
                                    </div>
                                </div>
                            </div>
                        `).join('') : 
                        '<div class="no-tasks-message">Nenhuma tarefa definida. Adicione tarefas primeiro.</div>'
                    }
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="StudySystem.savePerformance('${discipline.id}')">
                        Salvar Desempenho
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    },

    // Salvar desempenho registrado
    async savePerformance(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        const today = new Date().toISOString();
        let anyUpdated = false;

        discipline.tasks.forEach(task => {
            const totalInput = document.getElementById(`total-${task.id}`);
            const correctInput = document.getElementById(`correct-${task.id}`);
            
            if (totalInput && correctInput) {
                const total = parseInt(totalInput.value) || 0;
                const correct = parseInt(correctInput.value) || 0;
                
                if (total > 0 && correct <= total) {
                    const averageScore = total > 0 ? Math.round((correct / total) * 100) : 0;
                    
                    if (!task.performance) {
                        task.performance = {
                            totalQuestions: 0,
                            correctAnswers: 0,
                            lastPractice: null,
                            averageScore: 0,
                            priority: 'medium'
                        };
                    }
                    
                    // Atualizar com média ponderada
                    const oldTotal = task.performance.totalQuestions;
                    const oldCorrect = task.performance.correctAnswers;
                    
                    const newTotal = oldTotal + total;
                    const newCorrect = oldCorrect + correct;
                    
                    task.performance.totalQuestions = newTotal;
                    task.performance.correctAnswers = newCorrect;
                    task.performance.lastPractice = today;
                    task.performance.averageScore = newTotal > 0 ? 
                        Math.round((newCorrect / newTotal) * 100) : 0;
                    
                    // Calcular prioridade atualizada
                    task.priority = this.calculateTopicPriority(task);
                    
                    // Marcar como concluído se teve prática
                    if (total > 0 && !task.completed) {
                        task.completed = true;
                        task.completedAt = today;
                    }
                    
                    anyUpdated = true;
                    
                    // Registrar no histórico de questões
                    this.data.questionHistory.push({
                        disciplineId,
                        disciplineName: discipline.name,
                        taskId: task.id,
                        taskName: task.text,
                        date: today,
                        questionsTotal: total,
                        questionsCorrect: correct,
                        score: averageScore
                    });
                }
            }
        });

        if (anyUpdated) {
            // Recalcular progresso
            discipline.progress = this.calculateProgress(discipline.tasks);
            
            // Recalcular análise granular
            discipline.granularAnalysis = this.calculateGranularAnalysis(discipline);
            
            // Se auto-agendamento está ativo, recalcular próxima revisão
            if (this.data.userSettings.autoScheduleReviews) {
                const avgScore = this.calculateDisciplineAverage(discipline);
                const weakTopics = this.getWeakTopics(discipline);
                
                // Ajustar ciclo baseado no peso e desempenho
                if (discipline.weight >= 15 && weakTopics.length > 0) {
                    discipline.reviewCycle = Math.max(1, Math.floor(discipline.reviewCycle / 2));
                } else if (avgScore < 60) {
                    discipline.reviewCycle = Math.max(1, Math.floor(discipline.reviewCycle * 0.7));
                }
                
                discipline.nextReview = this.calculateNextReview(discipline);
            }
            
            await this.saveData();
            this.renderInterface();
            this.updateStatistics();
            this.closeModal();
            
            this.showNotification('Desempenho registrado com sucesso!', 'success');
        } else {
            this.showNotification('Nenhum dado válido para salvar', 'warning');
        }
    },

    // Alternar task
    async toggleTask(disciplineId, taskId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        const task = discipline.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        // Recalcular progresso
        discipline.progress = this.calculateProgress(discipline.tasks);
        
        await this.saveDisciplines();
        
        // Atualizar interface
        this.renderInterface();
        this.updateStatistics();
        
        const action = task.completed ? 'concluída' : 'pendente';
        this.showNotification(`Tarefa marcada como ${action}!`, 'success');
    },

    // Calcular progresso baseado em tasks
    calculateProgress(tasks) {
        if (!tasks || tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.completed).length;
        return Math.round((completed / tasks.length) * 100);
    },

    // Abrir gerenciador de tarefas
    openTaskManager(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const modal = document.getElementById('discipline-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        title.textContent = `Gerenciar Tarefas: ${discipline.name}`;
        
        body.innerHTML = `
            <div class="task-manager">
                <div class="task-manager-header">
                    <div>
                        <h4>Total: ${discipline.tasks ? discipline.tasks.length : 0} tarefas</h4>
                        <p class="manager-stats">
                            <span class="stat-item">Concluídas: ${discipline.tasks ? discipline.tasks.filter(t => t.completed).length : 0}</span>
                            <span class="stat-item">Média: ${this.calculateDisciplineAverage(discipline)}%</span>
                            <span class="stat-item">Peso: ${discipline.weight}</span>
                        </p>
                    </div>
                    <button class="btn btn-primary btn-small" onclick="StudySystem.addNewTask('${discipline.id}')">
                        <i class="fas fa-plus"></i> Nova Tarefa
                    </button>
                </div>
                
                <div class="task-list-container" id="task-list-${discipline.id}">
                    ${discipline.tasks && discipline.tasks.length > 0 ? 
                        discipline.tasks.map(task => this.createTaskItemHtml(discipline.id, task)).join('') :
                        '<div class="no-tasks-message">Nenhuma tarefa criada. Clique em "Nova Tarefa" para começar.</div>'
                    }
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Fechar</button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    },

    // Criar HTML para item de tarefa no gerenciador
    createTaskItemHtml(disciplineId, task) {
        const performance = task.performance || {};
        const score = performance.averageScore || 0;
        const priority = task.priority || this.calculateTopicPriority(task);
        
        return `
            <div class="task-manager-item" data-task-id="${task.id}">
                <div class="task-main">
                    <input type="checkbox" 
                           ${task.completed ? 'checked' : ''}
                           onchange="StudySystem.toggleTask('${disciplineId}', '${task.id}')">
                    <input type="text" 
                           class="task-text-input" 
                           value="${task.text}" 
                           onchange="StudySystem.updateTaskText('${disciplineId}', '${task.id}', this.value)">
                    <span class="task-priority-badge priority-${priority}">
                        ${priority === 'critical' ? 'CRÍTICO' : 
                          priority === 'weak' ? 'FRACO' : 
                          priority === 'medium' ? 'MÉDIO' : 'FORTE'}
                    </span>
                    <span class="task-performance ${this.getPerformanceClass(score)}">
                        ${score}%
                    </span>
                </div>
                <div class="task-actions">
                    <select class="priority-select" onchange="StudySystem.updateTaskPriority('${disciplineId}', '${task.id}', this.value)">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Baixa</option>
                        <option value="medium" ${task.priority === 'medium' || !task.priority ? 'selected' : ''}>Média</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Alta</option>
                        <option value="critical" ${task.priority === 'critical' ? 'selected' : ''}>Crítica</option>
                    </select>
                    <button class="btn-icon" title="Praticar tópico fraco" onclick="StudySystem.practiceWeakTopic('${disciplineId}', '${task.id}')">
                        <i class="fas fa-dumbbell"></i>
                    </button>
                    <button class="btn-icon" onclick="StudySystem.deleteTask('${disciplineId}', '${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    },

    // Registro rápido de questões para uma task específica
    async quickRecord(disciplineId, taskId, totalNum, correctNum) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const task = discipline.tasks.find(t => t.id === taskId);
        if (!task) return;

        const today = new Date().toISOString();
        const averageScore = totalNum > 0 ? Math.round((correctNum / totalNum) * 100) : 0;

        if (!task.performance) {
            task.performance = {
                totalQuestions: 0,
                correctAnswers: 0,
                lastPractice: null,
                averageScore: 0,
                priority: 'medium'
            };
        }

        // Atualizar com média ponderada
        const oldTotal = task.performance.totalQuestions;
        const oldCorrect = task.performance.correctAnswers;
        
        task.performance.totalQuestions = oldTotal + totalNum;
        task.performance.correctAnswers = oldCorrect + correctNum;
        task.performance.lastPractice = today;
        task.performance.averageScore = (oldTotal + totalNum) > 0 ? 
            Math.round(((oldCorrect + correctNum) / (oldTotal + totalNum)) * 100) : 0;

        // Atualizar prioridade
        task.priority = this.calculateTopicPriority(task);

        // Marcar como concluído se teve prática
        if (totalNum > 0 && !task.completed) {
            task.completed = true;
            task.completedAt = today;
        }

        // Recalcular progresso da disciplina
        discipline.progress = this.calculateProgress(discipline.tasks);

        // Recalcular análise granular
        discipline.granularAnalysis = this.calculateGranularAnalysis(discipline);

        // Registrar no histórico
        this.data.questionHistory.push({
            disciplineId,
            disciplineName: discipline.name,
            taskId: task.id,
            taskName: task.text,
            date: today,
            questionsTotal: totalNum,
            questionsCorrect: correctNum,
            score: averageScore
        });

        // Ajustar ciclo de revisão baseado no peso e desempenho
        if (this.data.userSettings.autoScheduleReviews) {
            if (discipline.weight >= 15 && averageScore < 60) {
                discipline.reviewCycle = Math.max(1, Math.floor(discipline.reviewCycle / 2));
            } else if (averageScore < 60) {
                discipline.reviewCycle = Math.max(1, Math.floor(discipline.reviewCycle * 0.7));
            }
            discipline.nextReview = this.calculateNextReview(discipline);
        }

        await this.saveData();
        
        // Atualizar interfaces
        this.renderInterface();
        this.updateStatistics();
        this.renderPerformanceDashboard();
        
        this.showNotification(`Desempenho registrado: ${averageScore}% em "${task.text}"`, 'success');
    },

    // Adicionar nova tarefa
    async addNewTask(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        if (!discipline.tasks) {
            discipline.tasks = [];
        }

        const newTask = {
            id: this.generateId(),
            text: 'Nova tarefa',
            completed: false,
            priority: 'medium',
            createdAt: new Date().toISOString(),
            performance: {
                totalQuestions: 0,
                correctAnswers: 0,
                lastPractice: null,
                averageScore: 0,
                priority: 'medium'
            }
        };

        discipline.tasks.push(newTask);
        discipline.progress = this.calculateProgress(discipline.tasks);
        discipline.granularAnalysis = this.calculateGranularAnalysis(discipline);
        
        await this.saveDisciplines();
        
        // Atualizar modal
        this.openTaskManager(disciplineId);
        this.showNotification('Nova tarefa adicionada!', 'success');
    },

    // Atualizar texto da tarefa
    async updateTaskText(disciplineId, taskId, newText) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        const task = discipline.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.text = newText.trim() || task.text;
        
        await this.saveDisciplines();
    },

    // Atualizar prioridade da tarefa
    async updateTaskPriority(disciplineId, taskId, priority) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        const task = discipline.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.priority = priority;
        
        await this.saveDisciplines();
    },

    // Deletar tarefa
    async deleteTask(disciplineId, taskId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        discipline.tasks = discipline.tasks.filter(t => t.id !== taskId);
        discipline.progress = this.calculateProgress(discipline.tasks);
        discipline.granularAnalysis = this.calculateGranularAnalysis(discipline);
        
        await this.saveDisciplines();
        
        // Atualizar modal
        this.openTaskManager(disciplineId);
        this.showNotification('Tarefa removida!', 'warning');
    },

    // Editar disciplina - ATUALIZADO COM PESO
    editDiscipline(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const modal = document.getElementById('discipline-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        title.textContent = `Editar: ${discipline.name}`;
        
        body.innerHTML = `
            <form id="edit-discipline-form" class="discipline-form">
                <div class="form-group">
                    <label for="edit-name">Nome da Disciplina</label>
                    <input type="text" id="edit-name" value="${discipline.name}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-color">Cor</label>
                    <div class="color-picker">
                        <input type="color" id="edit-color" value="${discipline.color}">
                        <span id="edit-selected-color">${discipline.color}</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-weight">Peso no Edital (1-20)</label>
                    <div class="weight-picker">
                        <input type="range" id="edit-weight" min="1" max="20" value="${discipline.weight || 10}">
                        <span id="edit-selected-weight">${discipline.weight || 10}</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-cycle">Ciclo de Revisão (dias)</label>
                    <select id="edit-cycle">
                        <option value="1" ${discipline.reviewCycle === 1 ? 'selected' : ''}>Diário</option>
                        <option value="2" ${discipline.reviewCycle === 2 ? 'selected' : ''}>A cada 2 dias</option>
                        <option value="3" ${discipline.reviewCycle === 3 ? 'selected' : ''}>A cada 3 dias</option>
                        <option value="7" ${discipline.reviewCycle === 7 ? 'selected' : ''}>Semanal</option>
                        <option value="14" ${discipline.reviewCycle === 14 ? 'selected' : ''}>Quinzenal</option>
                        <option value="30" ${discipline.reviewCycle === 30 ? 'selected' : ''}>Mensal</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-auto-schedule" ${this.data.userSettings.autoScheduleReviews ? 'checked' : ''}>
                        Ajustar automaticamente revisões baseado no desempenho
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-show-weights" ${this.data.userSettings.showWeights ? 'checked' : ''}>
                        Mostrar pesos das disciplinas
                    </label>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                </div>
            </form>
        `;
        
        modal.style.display = 'flex';
        
        // Configurar evento do formulário
        const form = document.getElementById('edit-discipline-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            discipline.name = document.getElementById('edit-name').value.trim();
            discipline.color = document.getElementById('edit-color').value;
            discipline.weight = parseInt(document.getElementById('edit-weight').value) || 10;
            discipline.reviewCycle = parseInt(document.getElementById('edit-cycle').value);
            this.data.userSettings.autoScheduleReviews = document.getElementById('edit-auto-schedule').checked;
            this.data.userSettings.showWeights = document.getElementById('edit-show-weights').checked;
            
            await this.saveData();
            this.renderInterface();
            this.updateStatistics();
            this.closeModal();
            
            this.showNotification(`Disciplina "${discipline.name}" atualizada!`, 'success');
        });
        
        // Atualizar cor ao mudar
        const colorInput = document.getElementById('edit-color');
        colorInput.addEventListener('input', (e) => {
            document.getElementById('edit-selected-color').textContent = e.target.value;
        });
        
        // Atualizar peso ao mudar
        const weightInput = document.getElementById('edit-weight');
        weightInput.addEventListener('input', (e) => {
            document.getElementById('edit-selected-weight').textContent = e.target.value;
        });
    },

    // Zerar disciplina
    resetDiscipline(disciplineId) {
        this.showConfirmModal(
            'Zerar Disciplina',
            'Tem certeza que deseja zerar o progresso desta disciplina? Todas as tarefas e desempenhos serão resetados.',
            async () => {
                const discipline = this.data.disciplines.find(d => d.id === disciplineId);
                if (!discipline) return;

                // Resetar todas as tasks
                if (discipline.tasks) {
                    discipline.tasks.forEach(task => {
                        task.completed = false;
                        task.completedAt = null;
                        if (task.performance) {
                            task.performance = {
                                totalQuestions: 0,
                                correctAnswers: 0,
                                lastPractice: null,
                                averageScore: 0,
                                priority: 'medium'
                            };
                        }
                        task.priority = this.calculateTopicPriority(task);
                    });
                    discipline.progress = 0;
                }
                
                discipline.lastReview = null;
                discipline.totalReviews = 0;
                discipline.nextReview = this.getNextReviewDate(discipline.reviewCycle);
                discipline.granularAnalysis = this.calculateGranularAnalysis(discipline);
                
                await this.saveDisciplines();
                this.renderInterface();
                this.updateStatistics();
                this.renderPerformanceDashboard();
                
                this.showNotification(`Progresso de "${discipline.name}" zerado!`, 'warning');
            }
        );
    },

    // Deletar disciplina
    deleteDiscipline(disciplineId) {
        this.showConfirmModal(
            'Excluir Disciplina',
            'Tem certeza que deseja excluir esta disciplina? Isso não pode ser desfeito.',
            async () => {
                const discipline = this.data.disciplines.find(d => d.id === disciplineId);
                if (!discipline) return;

                this.data.disciplines = this.data.disciplines.filter(d => d.id !== disciplineId);
                await this.saveDisciplines();
                this.renderInterface();
                this.updateStatistics();
                this.renderPerformanceDashboard();
                
                this.showNotification(`Disciplina "${discipline.name}" excluída!`, 'danger');
            }
        );
    },

    // Atualizar estatísticas - ATUALIZADO COM INFORMAÇÕES DE PESO
    updateStatistics() {
        // Calcular estatísticas baseadas em questões
        const stats = this.calculatePerformanceStats();
        
        const totalProgress = this.data.disciplines.length > 0
            ? Math.round(this.data.disciplines.reduce((sum, d) => sum + d.progress, 0) / this.data.disciplines.length)
            : 0;
        
        // Atualizar círculo de progresso
        const progressCircle = document.querySelector('.circle-progress');
        if (progressCircle) {
            const circumference = 2 * Math.PI * 50;
            const offset = circumference - (totalProgress / 100) * circumference;
            progressCircle.style.strokeDasharray = circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
        
        // Atualizar números
        document.getElementById('overall-progress').textContent = `${totalProgress}%`;
        document.getElementById('total-disciplines').textContent = this.data.disciplines.length;
        
        // Calcular média ponderada por peso
        let weightedProgress = 0;
        let totalWeight = 0;
        this.data.disciplines.forEach(d => {
            weightedProgress += d.progress * d.weight;
            totalWeight += d.weight;
        });
        const weightedAverage = totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;
        
        // Contar tópicos dominados (progresso >= 90% E desempenho >= 80%)
        const masteredCount = this.data.disciplines.filter(d => {
            const avgScore = this.calculateDisciplineAverage(d);
            const weakTopics = this.getWeakTopics(d);
            return d.progress >= 90 && avgScore >= 80 && weakTopics.length === 0;
        }).length;
        
        document.getElementById('mastered-topics').textContent = masteredCount;
        
        // Calcular tempo de estudo (estimativa: 2 minutos por questão)
        const totalMinutes = stats.totalQuestions * 2;
        const hours = Math.floor(totalMinutes / 60);
        document.getElementById('study-time').textContent = `${hours}h`;
        
        // Contar disciplinas de alta prioridade (peso >= 15 OU peso >= 10 com tópicos fracos)
        const highPriorityCount = this.data.disciplines.filter(d => 
            d.weight >= 15 || (d.weight >= 10 && this.getWeakTopics(d).length > 0)
        ).length;
        
        // Atualizar elemento se existir (pode adicionar no HTML depois)
        const highPriorityEl = document.getElementById('high-priority-count');
        if (highPriorityEl) {
            highPriorityEl.textContent = highPriorityCount;
        }
        
        // Calcular streak
        const streak = this.calculateStreak();
        document.getElementById('streak-days').textContent = streak;
    },

    // Calcular streak
    calculateStreak() {
        if (this.data.studyHistory.length === 0) return 0;
        
        const sortedHistory = [...this.data.studyHistory].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        let streak = 0;
        let currentDate = new Date();
        
        // Verificar se estudou hoje
        const today = currentDate.toISOString().split('T')[0];
        const studiedToday = sortedHistory.some(entry => 
            entry.date.split('T')[0] === today
        );
        
        if (!studiedToday) {
            // Verificar ontem
            currentDate.setDate(currentDate.getDate() - 1);
            const yesterday = currentDate.toISOString().split('T')[0];
            const studiedYesterday = sortedHistory.some(entry =>
                entry.date.split('T')[0] === yesterday
            );
            
            if (!studiedYesterday) return 0;
            streak = 1;
        } else {
            streak = 1;
        }
        
        // Contar dias consecutivos
        for (let i = 1; i < sortedHistory.length; i++) {
            const entryDate = new Date(sortedHistory[i].date);
            const expectedDate = new Date(currentDate);
            expectedDate.setDate(expectedDate.getDate() - 1);
            
            if (entryDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
                streak++;
                currentDate = expectedDate;
            } else {
                break;
            }
        }
        
        return streak;
    },

    // Navegação de página
    nextPage() {
        const filteredDisciplines = this.filterDisciplines();
        const totalPages = Math.ceil(filteredDisciplines.length / this.config.itemsPerPage);
        
        if (this.config.currentPage < totalPages) {
            this.config.currentPage++;
            if (this.config.viewMode === 'table') {
                this.renderDisciplinesTable();
            } else if (this.config.viewMode === 'weak-topics') {
                this.renderWeakTopicsView();
            } else {
                this.renderDisciplines();
            }
        }
    },

    prevPage() {
        if (this.config.currentPage > 1) {
            this.config.currentPage--;
            if (this.config.viewMode === 'table') {
                this.renderDisciplinesTable();
            } else if (this.config.viewMode === 'weak-topics') {
                this.renderWeakTopicsView();
            } else {
                this.renderDisciplines();
            }
        }
    },

    // Modo escuro
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        this.data.userSettings.darkMode = document.body.classList.contains('dark-mode');
        this.saveSettings();
        
        const button = document.querySelector('[onclick="toggleDarkMode()"]');
        
        if (this.data.userSettings.darkMode) {
            button.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        } else {
            button.innerHTML = '<i class="fas fa-moon"></i> Modo Escuro';
        }
    },

    // Resetar todo o progresso
    resetAllProgress() {
        this.showConfirmModal(
            'Resetar Todo o Progresso',
            'Tem certeza que deseja resetar TODO o progresso? Todos os dados serão perdidos.',
            async () => {
                localStorage.clear();
                this.data.questionHistory = [];
                await this.loadDefaultDisciplines();
                this.renderInterface();
                this.updateStatistics();
                this.renderPerformanceDashboard();
                
                this.showNotification('Todo o progresso foi resetado!', 'danger');
            }
        );
    },

    // Exportar dados
    exportData() {
        const data = {
            disciplines: this.data.disciplines,
            history: this.data.studyHistory,
            questionHistory: this.data.questionHistory,
            settings: this.data.userSettings,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `study-ai-v4.7-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.showNotification('Dados exportados com sucesso!', 'success');
    },

    // Importar dados
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                if (!data.disciplines || !Array.isArray(data.disciplines)) {
                    throw new Error('Arquivo inválido');
                }
                
                this.data.disciplines = data.disciplines;
                this.data.studyHistory = data.history || [];
                this.data.questionHistory = data.questionHistory || [];
                this.data.userSettings = data.settings || {
                    darkMode: false,
                    notifications: true,
                    dailyGoal: 5,
                    reviewReminders: true,
                    autoScheduleReviews: true,
                    showWeights: true,
                    focusOnWeakTopics: true
                };
                
                // Garantir que todas as disciplinas têm progresso calculado
                this.data.disciplines.forEach(discipline => {
                    if (discipline.tasks) {
                        discipline.progress = this.calculateProgress(discipline.tasks);
                        
                        // Garantir que tasks têm performance e peso
                        discipline.tasks.forEach(task => {
                            if (!task.performance) {
                                task.performance = {
                                    totalQuestions: 0,
                                    correctAnswers: 0,
                                    lastPractice: null,
                                    averageScore: 0,
                                    priority: 'medium'
                                };
                            }
                            if (!task.priority) {
                                task.priority = this.calculateTopicPriority(task);
                            }
                        });
                        
                        // Calcular análise granular
                        discipline.granularAnalysis = this.calculateGranularAnalysis(discipline);
                    }
                    
                    // Garantir peso padrão se não existir
                    if (!discipline.weight) {
                        discipline.weight = 10;
                    }
                    
                    // Recalcular próxima revisão se necessário
                    if (!discipline.nextReview) {
                        discipline.nextReview = this.calculateNextReview(discipline);
                    }
                });
                
                await this.saveData();
                this.renderInterface();
                this.updateStatistics();
                this.renderPerformanceDashboard();
                
                this.showNotification('Dados importados com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao importar dados:', error);
                this.showNotification('Erro ao importar dados. Arquivo inválido.', 'danger');
            }
        };
        
        input.click();
    },

    // Mostrar modal de confirmação
    showConfirmModal(title, message, callback) {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const button = document.getElementById('confirm-action-btn');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        // Configurar botão
        button.onclick = () => {
            callback();
            this.closeConfirmModal();
        };
        
        modal.style.display = 'flex';
    },

    // Fechar modal
    closeModal() {
        document.getElementById('discipline-modal').style.display = 'none';
    },

    closeConfirmModal() {
        document.getElementById('confirm-modal').style.display = 'none';
    },

    // Mostrar notificação
    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4caf50' : 
                        type === 'warning' ? '#ff9800' : 
                        type === 'danger' ? '#f44336' : '#2196f3'};
            color: white;
            border-radius: 8px;
            z-index: 3000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                 type === 'warning' ? 'exclamation-triangle' : 
                                 type === 'danger' ? 'times-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    },

    // ===== FUNÇÕES AUXILIARES =====

    // Gerar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Obter data da próxima revisão
    getNextReviewDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString();
    },

    // Formatar data
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Hoje';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Amanhã';
        } else {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
    },

    // Atualizar info da página
    updatePageInfo() {
        const filteredDisciplines = this.filterDisciplines();
        const totalPages = Math.ceil(filteredDisciplines.length / this.config.itemsPerPage);
        document.getElementById('page-info').textContent = `Página ${this.config.currentPage} de ${totalPages}`;
    },

    // Salvar dados
    async saveData() {
        await this.saveDisciplines();
        await this.saveHistory();
        await this.saveQuestionHistory();
        await this.saveSettings();
    },

    async saveDisciplines() {
        localStorage.setItem('studyAI_disciplines', JSON.stringify(this.data.disciplines));
    },

    async saveHistory() {
        localStorage.setItem('studyAI_history', JSON.stringify(this.data.studyHistory));
    },

    async saveQuestionHistory() {
        localStorage.setItem('studyAI_questionHistory', JSON.stringify(this.data.questionHistory));
    },

    async saveSettings() {
        localStorage.setItem('studyAI_settings', JSON.stringify(this.data.userSettings));
    }
};

// ===== FUNÇÕES GLOBAIS =====

// Funções para chamar do HTML
function showTab(tabName) {
    StudySystem.showTab(tabName);
}

function prevPage() {
    StudySystem.prevPage();
}

function nextPage() {
    StudySystem.nextPage();
}

function sortDisciplines() {
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        StudySystem.config.sortBy = sortSelect.value;
        if (StudySystem.config.viewMode === 'table') {
            StudySystem.renderDisciplinesTable();
        } else if (StudySystem.config.viewMode === 'weak-topics') {
            StudySystem.renderWeakTopicsView();
        } else {
            StudySystem.renderDisciplines();
        }
    }
}

function toggleDarkMode() {
    StudySystem.toggleDarkMode();
}

function closeModal() {
    StudySystem.closeModal();
}

function closeConfirmModal() {
    StudySystem.closeConfirmModal();
}

function exportData() {
    StudySystem.exportData();
}

function importData() {
    StudySystem.importData();
}

function resetAllProgress() {
    StudySystem.resetAllProgress();
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    StudySystem.initialize();
    
    // Adicionar CSS para animações e estilos da versão 4.7
    const style = document.createElement('style');
    style.textContent = `
        /* Animações */
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
            animation: fadeIn 0.3s ease;
        }
        
        /* Estilos para análise granular */
        .granular-analysis {
            background: var(--gray-50);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            border: 1px solid var(--gray-200);
        }
        
        .analysis-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .analysis-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .stat-item {
            text-align: center;
            padding: 0.5rem;
            background: white;
            border-radius: 6px;
            border: 1px solid var(--gray-200);
        }
        
        .stat-number {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.25rem;
        }
        
        .stat-good {
            color: var(--success);
        }
        
        .stat-warning {
            color: var(--warning);
        }
        
        .weak-topics-preview {
            background: #fff8e1;
            border-radius: 6px;
            padding: 0.75rem;
            border: 1px solid #ffecb3;
        }
        
        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .preview-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #ffecb3;
        }
        
        .preview-item:last-child {
            border-bottom: none;
        }
        
        .topic-name {
            flex: 1;
            font-size: 0.9rem;
        }
        
        .topic-score {
            font-weight: bold;
            font-size: 0.9rem;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            background: white;
        }
        
        /* Estilos para modo tabela */
        .disciplines-table {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid var(--gray-200);
        }
        
        .table-header {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 2fr 1fr;
            background: var(--primary-light);
            color: var(--primary-dark);
            font-weight: bold;
            padding: 1rem;
            border-bottom: 2px solid var(--primary);
        }
        
        .table-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 2fr 1fr;
            padding: 1rem;
            border-bottom: 1px solid var(--gray-200);
            transition: background 0.2s;
        }
        
        .table-row:hover {
            background: var(--gray-50);
        }
        
        .table-row.weight-high {
            background: #fff8e1;
            border-left: 4px solid var(--warning);
        }
        
        .table-row.priority-high {
            background: #ffebee;
            border-left: 4px solid var(--danger);
        }
        
        .table-row.priority-medium {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
        }
        
        .table-cell {
            display: flex;
            align-items: center;
            padding: 0.5rem;
        }
        
        .discipline-name-cell {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .color-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        
        .weight-badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .weight-high {
            background: #ffebee;
            color: #c62828;
        }
        
        .weight-medium {
            background: #fff8e1;
            color: #f57c00;
        }
        
        .weight-low {
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .progress-cell {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .mini-progress-bar {
            width: 60px;
            height: 8px;
            background: var(--gray-200);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .mini-progress-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        
        .weak-topics-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
        }
        
        .weak-topic-tag {
            background: #ffebee;
            color: #c62828;
            padding: 0.2rem 0.5rem;
            border-radius: 10px;
            font-size: 0.75rem;
        }
        
        .no-weak-topics {
            color: var(--success);
            font-size: 0.9rem;
        }
        
        .table-actions {
            display: flex;
            gap: 0.25rem;
        }
        
        /* Estilos para view de tópicos fracos */
        .weak-topics-view {
            padding: 1rem;
        }
        
        .view-header {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .weak-topic-card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-left: 4px solid var(--warning);
        }
        
        .weak-topic-card.priority-critical {
            border-left-color: #d32f2f;
            background: #ffebee;
        }
        
        .weak-topic-card.priority-high {
            border-left-color: #f57c00;
            background: #fff3e0;
        }
        
        .weak-topic-card.priority-medium {
            border-left-color: #ffa000;
            background: #fff8e1;
        }
        
        .weak-topic-card.priority-low {
            border-left-color: #689f38;
            background: #f1f8e9;
        }
        
        .weak-topic-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .topic-discipline {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .discipline-dot {
            width: 20px;
            height: 20px;
            border-radius: 50%;
        }
        
        .weight-indicator {
            margin-top: 0.25rem;
        }
        
        .topic-priority .priority-badge {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: bold;
            font-size: 1.1rem;
        }
        
        .weak-topic-content {
            margin-bottom: 1.5rem;
        }
        
        .topic-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
            padding: 1rem;
            background: var(--gray-50);
            border-radius: 6px;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-label {
            display: block;
            font-size: 0.9rem;
            color: var(--gray-600);
            margin-bottom: 0.25rem;
        }
        
        .stat-value {
            display: block;
            font-weight: bold;
            font-size: 1.1rem;
        }
        
        .topic-analysis {
            margin-top: 1rem;
            padding: 1rem;
            background: #e3f2fd;
            border-radius: 6px;
        }
        
        .analysis-result {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #1565c0;
        }
        
        .weak-topic-actions {
            display: flex;
            gap: 0.5rem;
            justify-content: flex-end;
        }
        
        .no-weak-topics-message {
            text-align: center;
            padding: 3rem;
            color: var(--gray-600);
        }
        
        .no-weak-topics-message i {
            font-size: 3rem;
            color: var(--success);
            margin-bottom: 1rem;
        }
        
        /* Badge gourmet */
        .gourmet-badge {
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #5D4037;
            padding: 0.5rem 1rem;
            border-radius: 0 8px 0 8px;
            position: absolute;
            top: 0;
            right: 0;
            font-weight: bold;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .discipline-card.gourmet {
            position: relative;
            padding-top: 2.5rem;
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
        }
        
        /* Weight display no card */
        .weight-display {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--gray-100);
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
        }
        
        .weight-label {
            font-size: 0.8rem;
            color: var(--gray-600);
        }
        
        .weight-value {
            font-weight: bold;
            font-size: 1rem;
        }
        
        .weight-high {
            color: #c62828;
        }
        
        .weight-medium {
            color: #f57c00;
        }
        
        .weight-low {
            color: #2e7d32;
        }
        
        /* Warning badge */
        .warning-badge {
            background: #fff3e0;
            color: #f57c00;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        /* Text utilities */
        .text-warning {
            color: var(--warning);
            font-weight: 600;
        }
        
        .text-success {
            color: var(--success);
            font-weight: 600;
        }
        
        .weight-tag {
            background: var(--gray-200);
            color: var(--gray-700);
            padding: 0.1rem 0.5rem;
            border-radius: 10px;
            font-size: 0.8rem;
            margin-left: 0.5rem;
        }
        
        /* Task priority badges */
        .task-priority-badge {
            padding: 0.2rem 0.5rem;
            border-radius: 8px;
            font-size: 0.7rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .priority-critical {
            background: #ffebee;
            color: #c62828;
        }
        
        .priority-weak {
            background: #fff3e0;
            color: #f57c00;
        }
        
        .priority-medium {
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .priority-strong {
            background: #e3f2fd;
            color: #1565c0;
        }
    `;
    document.head.appendChild(style);
});