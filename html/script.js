// ==================== STUDY AI 4.5 - SISTEMA DE REVISÃO ESPAÇADA COM DESEMPENHO POR QUESTÕES ====================

// Sistema principal
const StudySystem = {
    // Configurações
    config: {
        itemsPerPage: 9,
        currentPage: 1,
        currentTab: 'today',
        searchTerm: '',
        sortBy: 'next-review',
        performanceFilter: 'all' // all, good (>70%), medium (50-70%), poor (<50%)
    },

    // Dados do sistema
    data: {
        disciplines: [],
        studyHistory: [],
        questionHistory: [], // Novo: histórico de questões por task
        userSettings: {
            darkMode: false,
            notifications: true,
            dailyGoal: 5,
            reviewReminders: true,
            autoScheduleReviews: true // Novo: agenda revisões automaticamente
        }
    },

    // Inicialização
    async initialize() {
        console.log('🚀 STUDY AI 4.5 - Inicializando...');
        
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
            
            console.log('✅ Sistema inicializado com sucesso!');
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
                        
                        // Garantir que todas as tasks têm performance
                        if (discipline.tasks) {
                            discipline.tasks.forEach(task => {
                                if (!task.performance) {
                                    task.performance = {
                                        totalQuestions: 0,
                                        correctAnswers: 0,
                                        lastPractice: null,
                                        averageScore: 0
                                    };
                                }
                            });
                        }
                        
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
                        autoScheduleReviews: true
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
                averageScore: 0
            }
        }));
    },

    // Carregar disciplinas padrão
    async loadDefaultDisciplines() {
        console.log('📚 Carregando disciplinas padrão...');
        
        // Usar diretamente os dados embutidos
        this.data.disciplines = this.getEmbeddedDefaultDisciplines();
        this.saveDisciplines();
        console.log('✅ Disciplinas padrão carregadas');
    },

    // Dados padrão embutidos (fallback) - VERSÃO 4.5 COM PERFORMANCE
    getEmbeddedDefaultDisciplines() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return [
            {
                id: this.generateId(),
                name: 'Direito Civil - TJDFT 2022',
                color: '#1a237e',
                reviewCycle: 3,
                progress: 30,
                nextReview: tomorrow.toISOString(),
                lastReview: today.toISOString(),
                totalReviews: 2,
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
                            totalQuestions: 20,
                            correctAnswers: 18,
                            lastPractice: today.toISOString(),
                            averageScore: 90
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
                            totalQuestions: 15,
                            correctAnswers: 10,
                            lastPractice: today.toISOString(),
                            averageScore: 67
                        }
                    },
                    { 
                        id: this.generateId(), 
                        text: 'Pessoas Jurídicas', 
                        completed: false, 
                        priority: 'medium', 
                        createdAt: today.toISOString(),
                        performance: {
                            totalQuestions: 0,
                            correctAnswers: 0,
                            lastPractice: null,
                            averageScore: 0
                        }
                    }
                ]
            }
        ];
    },

    // Configurar event listeners
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

        // Busca
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.config.searchTerm = e.target.value.toLowerCase();
                this.config.currentPage = 1;
                this.renderDisciplines();
            });
        }

        // Filtro de desempenho (novo)
        const perfFilter = document.getElementById('performance-filter');
        if (perfFilter) {
            perfFilter.addEventListener('change', (e) => {
                this.config.performanceFilter = e.target.value;
                this.renderPerformanceDashboard();
            });
        }

        // Modo escuro
        const darkModeToggle = document.querySelector('[onclick="toggleDarkMode()"]');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
    },

    // Renderizar interface
    renderInterface() {
        this.renderDisciplines();
        this.renderTodayReviews();
        this.renderCalendar();
        this.updatePageInfo();
        this.renderPerformanceDashboard();
    },

    // Renderizar disciplinas
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
                    return d.progress >= 90 && avgScore >= 80;
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

    // Ordenar disciplinas
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
                    
                case 'priority':
                    return b.priority - a.priority;
                    
                default:
                    return 0;
            }
        });
    },

    // Criar card de disciplina VERSÃO 4.5 COM PERFORMANCE
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

        // Atualizar progresso da disciplina
        discipline.progress = progress;

        // Mostrar apenas 3 tasks no card
        const visibleTasks = discipline.tasks ? discipline.tasks.slice(0, 3) : [];
        const hasMoreTasks = discipline.tasks && discipline.tasks.length > 3;

        return `
            <div class="discipline-card fade-in" style="border-left-color: ${discipline.color};">
                <div class="discipline-header">
                    <h3 class="discipline-title" style="color: ${discipline.color};">${discipline.name}</h3>
                    <div class="discipline-meta">
                        <span class="review-badge ${reviewStatus}">${reviewStatusText}</span>
                        ${avgScore > 0 ? `
                            <span class="performance-badge ${this.getPerformanceClass(avgScore)}">
                                ${avgScore}%
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="discipline-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%; background: ${discipline.color};"></div>
                    </div>
                    <div class="progress-info">
                        <span>Progresso: ${progress}% (${completedTasks}/${totalTasks})</span>
                        <span>Desempenho: ${avgScore > 0 ? avgScore + '%' : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="discipline-details">
                    <div class="detail-item">
                        <span class="detail-label">Próxima Revisão:</span>
                        <span class="detail-value">${this.formatDate(nextReviewDate) || 'Não definida'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total de Questões:</span>
                        <span class="detail-value">${this.countTotalQuestions(discipline)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Média Geral:</span>
                        <span class="detail-value ${this.getPerformanceClass(avgScore)}">${avgScore > 0 ? avgScore + '%' : 'N/A'}</span>
                    </div>
                </div>
                
                <!-- TO-DO LIST COM PERFORMANCE -->
                <div class="todo-list-container">
                    <div class="todo-list">
                        ${discipline.tasks && discipline.tasks.length > 0 ? 
                            visibleTasks.map(task => `
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
                        
                        ${hasMoreTasks ? 
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
                    <button class="btn btn-primary btn-small" onclick="StudySystem.markAsReviewed('${discipline.id}')">
                        <i class="fas fa-check"></i> Revisar
                    </button>
                    <button class="btn btn-outline btn-small" onclick="StudySystem.editDiscipline('${discipline.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-success btn-small" onclick="StudySystem.scheduleReview('${discipline.id}')">
                        <i class="fas fa-calendar-plus"></i> Agendar
                    </button>
                </div>
            </div>
        `;
    },

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

    // Renderizar dashboard de desempenho
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
                    
                    return `
                        <div class="performance-item">
                            <div class="performance-header">
                                <div class="performance-title">
                                    <div class="discipline-dot-small" style="background: ${discipline.color};"></div>
                                    <span>${discipline.name}</span>
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
                                    <span>Revisão:</span>
                                    <span>${this.formatDate(discipline.nextReview?.split('T')[0]) || 'Não agendada'}</span>
                                </div>
                            </div>
                            
                            <div class="performance-actions">
                                <button class="btn-text btn-small" onclick="StudySystem.recordQuestions('${discipline.id}')">
                                    <i class="fas fa-plus-circle"></i> Registrar questões
                                </button>
                                ${avgScore < 60 && avgScore > 0 ? `
                                    <button class="btn-text btn-small btn-warning" onclick="StudySystem.scheduleExtraReview('${discipline.id}')">
                                        <i class="fas fa-exclamation-circle"></i> Revisar urgente
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
        
        // Renderizar disciplinas
        this.renderDisciplines();
    },

    // Adicionar disciplina
    async handleAddDiscipline(e) {
        e.preventDefault();
        
        const name = document.getElementById('discipline-name').value.trim();
        const color = document.getElementById('discipline-color').value;
        const reviewCycle = parseInt(document.getElementById('review-cycle').value);
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
        
        // Atualizar interface
        this.renderInterface();
        this.updateStatistics();
        
        this.showNotification(`Disciplina "${name}" adicionada com sucesso!`, 'success');
    },

    // Marcar como revisado - CORRIGIDO
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
                            averageScore: 0
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
            
            // Se auto-agendamento está ativo, recalcular próxima revisão
            if (this.data.userSettings.autoScheduleReviews) {
                const avgScore = this.calculateDisciplineAverage(discipline);
                // Se desempenho for ruim, agenda revisão mais cedo
                if (avgScore < 60) {
                    discipline.reviewCycle = Math.max(1, Math.floor(discipline.reviewCycle / 2));
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
        this.renderDisciplines();
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

    // Criar HTML para item de tarefa no gerenciador (atualizado com performance)
    createTaskItemHtml(disciplineId, task) {
        const performance = task.performance || {};
        const score = performance.averageScore || 0;
        
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
                    <span class="task-performance ${this.getPerformanceClass(score)}">
                        ${score}%
                    </span>
                </div>
                <div class="task-actions">
                    <select class="priority-select" onchange="StudySystem.updateTaskPriority('${disciplineId}', '${task.id}', this.value)">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Baixa</option>
                        <option value="medium" ${task.priority === 'medium' || !task.priority ? 'selected' : ''}>Média</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>Alta</option>
                    </select>
                    <button class="btn-icon" title="Registrar questões" onclick="StudySystem.quickRecord('${disciplineId}', '${task.id}')">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                    <button class="btn-icon" onclick="StudySystem.deleteTask('${disciplineId}', '${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    },

    // Registro rápido de questões para uma task específica
    async quickRecord(disciplineId, taskId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const task = discipline.tasks.find(t => t.id === taskId);
        if (!task) return;

        const total = prompt(`Quantas questões de "${task.text}" você resolveu?`, 
                            task.performance?.totalQuestions || 10);
        if (total === null) return;

        const totalNum = parseInt(total);
        if (isNaN(totalNum) || totalNum < 0) {
            this.showNotification('Número inválido', 'warning');
            return;
        }

        const correct = prompt(`Quantas você acertou? (de ${totalNum})`, 
                              task.performance?.correctAnswers || 0);
        if (correct === null) return;

        const correctNum = parseInt(correct);
        if (isNaN(correctNum) || correctNum < 0 || correctNum > totalNum) {
            this.showNotification('Número de acertos inválido', 'warning');
            return;
        }

        const today = new Date().toISOString();
        const averageScore = totalNum > 0 ? Math.round((correctNum / totalNum) * 100) : 0;

        if (!task.performance) {
            task.performance = {
                totalQuestions: 0,
                correctAnswers: 0,
                lastPractice: null,
                averageScore: 0
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

        // Marcar como concluído se teve prática
        if (totalNum > 0 && !task.completed) {
            task.completed = true;
            task.completedAt = today;
        }

        // Recalcular progresso da disciplina
        discipline.progress = this.calculateProgress(discipline.tasks);

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

        // Ajustar ciclo de revisão baseado no desempenho
        if (this.data.userSettings.autoScheduleReviews && averageScore < 60) {
            discipline.reviewCycle = Math.max(1, Math.floor(discipline.reviewCycle / 2));
            discipline.nextReview = this.calculateNextReview(discipline);
        }

        await this.saveData();
        
        // Atualizar interfaces
        this.renderDisciplines();
        this.updateStatistics();
        this.renderPerformanceDashboard();
        
        this.showNotification(`Desempenho registrado: ${averageScore}% em ${task.text}`, 'success');
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
                averageScore: 0
            }
        };

        discipline.tasks.push(newTask);
        discipline.progress = this.calculateProgress(discipline.tasks);
        
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
        
        await this.saveDisciplines();
        
        // Atualizar modal
        this.openTaskManager(disciplineId);
        this.showNotification('Tarefa removida!', 'warning');
    },

    // Editar disciplina
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
            discipline.reviewCycle = parseInt(document.getElementById('edit-cycle').value);
            this.data.userSettings.autoScheduleReviews = document.getElementById('edit-auto-schedule').checked;
            
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
                                averageScore: 0
                            };
                        }
                    });
                    discipline.progress = 0;
                }
                
                discipline.lastReview = null;
                discipline.totalReviews = 0;
                discipline.nextReview = this.getNextReviewDate(discipline.reviewCycle);
                
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

    // Atualizar estatísticas
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
        
        // Contar tópicos dominados (progresso >= 90% E desempenho >= 80%)
        const masteredCount = this.data.disciplines.filter(d => {
            const avgScore = this.calculateDisciplineAverage(d);
            return d.progress >= 90 && avgScore >= 80;
        }).length;
        
        document.getElementById('mastered-topics').textContent = masteredCount;
        
        // Calcular tempo de estudo (estimativa: 2 minutos por questão)
        const totalMinutes = stats.totalQuestions * 2;
        const hours = Math.floor(totalMinutes / 60);
        document.getElementById('study-time').textContent = `${hours}h`;
        
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
            this.renderDisciplines();
        }
    },

    prevPage() {
        if (this.config.currentPage > 1) {
            this.config.currentPage--;
            this.renderDisciplines();
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
        a.download = `study-ai-v4.5-backup-${new Date().toISOString().split('T')[0]}.json`;
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
                    autoScheduleReviews: true
                };
                
                // Garantir que todas as disciplinas têm progresso calculado
                this.data.disciplines.forEach(discipline => {
                    if (discipline.tasks) {
                        discipline.progress = this.calculateProgress(discipline.tasks);
                        
                        // Garantir que tasks têm performance
                        discipline.tasks.forEach(task => {
                            if (!task.performance) {
                                task.performance = {
                                    totalQuestions: 0,
                                    correctAnswers: 0,
                                    lastPractice: null,
                                    averageScore: 0
                                };
                            }
                        });
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
        StudySystem.renderDisciplines();
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
    
    // Adicionar CSS para animações e estilos da versão 4.5
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
    `;
    document.head.appendChild(style);
});