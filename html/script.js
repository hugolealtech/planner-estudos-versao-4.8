// ==================== HUGO JUIZ 5.0 - SISTEMA COMPLETO ====================

const StudySystem = {
    // Configurações
    config: {
        itemsPerPage: 9,
        currentPage: 1,
        currentTab: 'today',
        searchTerm: '',
        sortBy: 'performance-granular',
        viewMode: 'cards',
        performanceFilter: 'all',
        aiEnabled: true
    },

    // Dados
    data: {
        disciplines: [],
        studyHistory: [],
        questionHistory: [],
        aiRecommendations: [],
        userSettings: {
            darkMode: false,
            notifications: true,
            dailyGoal: 5,
            reviewReminders: true,
            autoScheduleReviews: true,
            showWeights: true,
            focusOnWeakTopics: true,
            adaptiveLearning: true,
            aiSuggestions: true
        }
    },

    // ===== INICIALIZAÇÃO =====
    initialize() {
        console.log('🚀 HUGO JUIZ 5.0 - Inicializando...');
        
        try {
            this.loadData();
            this.ensureVersion5Fields();
            this.setupEventListeners();
            this.renderInterface();
            this.updateStatistics();
            this.generateAIRecommendations();
            this.enhanceHTML();
            
            console.log('✅ Sistema inicializado com sucesso!');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.data.disciplines = this.getDefaultDisciplines();
            this.renderInterface();
            this.updateStatistics();
            this.showNotification('Sistema carregado com dados padrão', 'warning');
        }
    },

    // ===== FUNÇÕES DO ASSISTENTE AI =====

    openAIAssistant() {
        const modal = document.getElementById('ai-assistant-modal');
        const chat = document.getElementById('ai-chat');
        
        chat.innerHTML = '';
        this.addAIMessage(
            'assistant',
            '👋 Olá! Sou seu assistente AI de estudos. Posso ajudar você a:\n\n' +
            '📊 Analisar seu progresso\n' +
            '🎯 Sugerir tópicos prioritários\n' +
            '📅 Planejar estudos\n' +
            '💡 Dar dicas de aprendizado\n\n' +
            'Como posso ajudá-lo hoje?'
        );
        
        modal.style.display = 'flex';
        setTimeout(() => {
            document.getElementById('ai-message').focus();
        }, 100);
    },

    sendAIMessage() {
        const input = document.getElementById('ai-message');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addAIMessage('user', message);
        input.value = '';
        this.showAITypingIndicator();
        
        setTimeout(() => {
            this.processAIMessage(message);
        }, 800);
    },

    processAIMessage(message) {
        this.removeAITypingIndicator();
        const lowerMessage = message.toLowerCase();
        let response = '';

        if (lowerMessage.includes('progresso') || lowerMessage.includes('como estou')) {
            response = this.getProgressAnalysis();
        } 
        else if (lowerMessage.includes('prioridade') || lowerMessage.includes('oque estudar')) {
            response = this.getPriorityRecommendation();
        }
        else if (lowerMessage.includes('fraco') || lowerMessage.includes('dificuldade')) {
            response = this.getWeakAreasAnalysis();
        }
        else if (lowerMessage.includes('plano') || lowerMessage.includes('cronograma')) {
            response = this.getStudyPlan();
        }
        else {
            response = '🤖 Posso ajudar com:\n\n' +
                      '• Análise do seu progresso\n' +
                      '• Recomendações de prioridades\n' +
                      '• Dicas para melhorar revisões\n' +
                      '• Planejamento de estudos\n\n' +
                      'O que você gostaria de saber?';
        }
        
        this.addAIMessage('assistant', response);
    },

    getProgressAnalysis() {
        const total = this.data.disciplines.length;
        const mastered = this.data.disciplines.filter(d => 
            d.progress >= 90 && this.calculateDisciplineAverage(d) >= 80
        ).length;
        
        const weak = this.data.disciplines.filter(d => {
            const avg = this.calculateDisciplineAverage(d);
            return avg > 0 && avg < 60;
        }).length;
        
        const todayReviews = this.data.disciplines.filter(d => 
            d.nextReview && d.nextReview.split('T')[0] === new Date().toISOString().split('T')[0]
        ).length;

        let analysis = `📊 **Análise do Progresso:**\n\n`;
        analysis += `• Disciplinas: ${total}\n`;
        analysis += `• Dominadas: ${mastered}\n`;
        analysis += `• Revisões hoje: ${todayReviews}\n`;
        
        if (weak > 0) {
            analysis += `• Atenção: ${weak} disciplina(s)\n\n`;
            analysis += `🎯 **Foque em:**\n`;
            this.data.disciplines
                .filter(d => this.calculateDisciplineAverage(d) < 60)
                .slice(0, 2)
                .forEach(d => {
                    analysis += `   - ${d.name} (${this.calculateDisciplineAverage(d)}%)\n`;
                });
        } else {
            analysis += `\n✅ **Excelente!** Continue com as revisões.`;
        }
        
        return analysis;
    },

    getPriorityRecommendation() {
        const highPriority = this.data.disciplines
            .filter(d => {
                const avg = this.calculateDisciplineAverage(d);
                const weakTopics = this.getWeakTopics(d);
                return (d.weight >= 15 || weakTopics.length > 0) && avg < 80;
            })
            .sort((a, b) => {
                const priorityA = (a.weight * 2) + (100 - this.calculateDisciplineAverage(a));
                const priorityB = (b.weight * 2) + (100 - this.calculateDisciplineAverage(b));
                return priorityB - priorityA;
            })
            .slice(0, 3);

        if (highPriority.length === 0) {
            return '🎉 **Tudo em ordem!** Nenhuma prioridade crítica.\n\nContinue revisando normalmente.';
        }

        let recommendation = '🎯 **Prioridades para Hoje:**\n\n';
        
        highPriority.forEach((discipline, index) => {
            const avg = this.calculateDisciplineAverage(discipline);
            const weakTopics = this.getWeakTopics(discipline);
            
            recommendation += `${index + 1}. **${discipline.name}** (Peso: ${discipline.weight})\n`;
            recommendation += `   • Desempenho: ${avg}%\n`;
            recommendation += `   • Tópicos críticos: ${weakTopics.length}\n`;
            
            if (weakTopics.length > 0) {
                recommendation += `   • Foque em: ${weakTopics[0].text}\n`;
            }
            
            recommendation += `\n`;
        });

        recommendation += `⏰ **Sugestão:** 60-90 minutos para cada.`;

        return recommendation;
    },

    getWeakAreasAnalysis() {
        const weakDisciplines = this.data.disciplines
            .filter(d => {
                const avg = this.calculateDisciplineAverage(d);
                return avg > 0 && avg < 60;
            })
            .sort((a, b) => this.calculateDisciplineAverage(a) - this.calculateDisciplineAverage(b));

        if (weakDisciplines.length === 0) {
            return '🎉 **Excelente!** Nenhuma área fraca identificada.\n\nContinue mantendo o bom desempenho!';
        }

        let analysis = '⚠️ **Áreas que Precisam de Atenção:**\n\n';
        
        weakDisciplines.slice(0, 3).forEach((discipline, index) => {
            const avg = this.calculateDisciplineAverage(discipline);
            const weakTopics = this.getWeakTopics(discipline);
            
            analysis += `${index + 1}. **${discipline.name}** (${avg}%)\n`;
            analysis += `   • Peso no edital: ${discipline.weight}\n`;
            analysis += `   • Tópicos críticos: ${weakTopics.length}\n`;
            
            if (weakTopics.length > 0) {
                analysis += `   • Sugestão: Revise "${weakTopics[0].text}"\n`;
            }
            
            analysis += `\n`;
        });

        analysis += `📌 **Dica:** Dedique 30 minutos extras por dia a estas áreas.`;

        return analysis;
    },

    getStudyPlan() {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcomingReviews = this.data.disciplines
            .filter(d => d.nextReview && new Date(d.nextReview) <= nextWeek)
            .sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));

        let plan = '📅 **Plano de Estudos para a Semana:**\n\n';
        
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
            const dayStr = day.toISOString().split('T')[0];
            const dayName = days[day.getDay()];
            
            const dayReviews = upcomingReviews.filter(d => 
                d.nextReview.split('T')[0] === dayStr
            );
            
            if (dayReviews.length > 0) {
                plan += `${dayName} (${day.getDate()}/${day.getMonth() + 1}):\n`;
                dayReviews.forEach(review => {
                    const avg = this.calculateDisciplineAverage(review);
                    plan += `   • ${review.name} (${avg}%)\n`;
                });
                plan += `\n`;
            }
        }

        plan += `⏱️ **Tempo Sugerido:** 2-3 horas por dia\n`;
        plan += `🎯 **Foco:** Tópicos com menos de 70% de acerto`;

        return plan;
    },

    addAIMessage(sender, content) {
        const chat = document.getElementById('ai-chat');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${sender}`;
        messageDiv.textContent = content;
        
        chat.appendChild(messageDiv);
        chat.scrollTop = chat.scrollHeight;
    },

    showAITypingIndicator() {
        const chat = document.getElementById('ai-chat');
        const indicator = document.createElement('div');
        indicator.id = 'ai-typing-indicator';
        indicator.className = 'ai-message ai-message-assistant';
        indicator.textContent = '...';
        indicator.style.fontStyle = 'italic';
        indicator.style.color = 'var(--gray-500)';
        
        chat.appendChild(indicator);
        chat.scrollTop = chat.scrollHeight;
    },

    removeAITypingIndicator() {
        const indicator = document.getElementById('ai-typing-indicator');
        if (indicator) indicator.remove();
    },

    closeAIModal() {
        document.getElementById('ai-assistant-modal').style.display = 'none';
    },

    generateAIRecommendations() {
        try {
            const todayReviews = this.data.disciplines.filter(d => 
                d.nextReview && d.nextReview.split('T')[0] === new Date().toISOString().split('T')[0]
            ).length;

            const weakDisciplines = this.data.disciplines.filter(d => {
                const avg = this.calculateDisciplineAverage(d);
                return avg > 0 && avg < 60;
            }).length;

            let recommendation = '';
            
            if (todayReviews > 0) {
                recommendation = `Hoje: ${todayReviews} revisão${todayReviews > 1 ? 'ões' : ''}`;
            } else if (weakDisciplines > 0) {
                recommendation = `${weakDisciplines} disciplina${weakDisciplines > 1 ? 's' : ''} precisa${weakDisciplines > 1 ? 'm' : ''} atenção`;
            } else {
                recommendation = 'Tudo em dia! Continue revisando';
            }

            const container = document.getElementById('ai-recommendation');
            if (container) {
                container.innerHTML = `<i class="fas fa-lightbulb"></i><span>${recommendation}</span>`;
            }
        } catch (error) {
            console.warn('Não foi possível gerar recomendações AI:', error);
        }
    },

    generateStudyReport() {
        const report = this.createStudyReport();
        this.showNotification('Relatório gerado com sucesso!', 'success');
        console.log('📊 Relatório de Estudos:', report);
        // Em uma implementação real, aqui você enviaria para um servidor ou geraria PDF
        alert('Relatório gerado no console. Em produção, seria gerado um PDF.');
    },

    createStudyReport() {
        const report = {
            data: new Date().toISOString(),
            disciplinas: this.data.disciplines.length,
            revisoesHoje: this.data.disciplines.filter(d => 
                d.nextReview && d.nextReview.split('T')[0] === new Date().toISOString().split('T')[0]
            ).length,
            desempenhoGeral: this.calculateOverallAverage(),
            areasFracas: this.data.disciplines
                .filter(d => this.calculateDisciplineAverage(d) < 60)
                .map(d => ({
                    nome: d.name,
                    desempenho: this.calculateDisciplineAverage(d),
                    peso: d.weight
                })),
            areasFortes: this.data.disciplines
                .filter(d => this.calculateDisciplineAverage(d) >= 80)
                .map(d => ({
                    nome: d.name,
                    desempenho: this.calculateDisciplineAverage(d)
                })),
            consistencia: this.calculateStudyConsistency(),
            recomendacoes: this.data.aiRecommendations
        };
        
        return report;
    },

    // ===== FUNÇÕES BÁSICAS DO SISTEMA =====

    // Carregar dados
    loadData() {
        try {
            const savedDisciplines = localStorage.getItem('studyAI_disciplines');
            const savedHistory = localStorage.getItem('studyAI_history');
            const savedQuestionHistory = localStorage.getItem('studyAI_questionHistory');
            const savedSettings = localStorage.getItem('studyAI_settings');
            const savedAIRecommendations = localStorage.getItem('studyAI_aiRecommendations');
            
            if (savedDisciplines) {
                this.data.disciplines = JSON.parse(savedDisciplines);
            } else {
                this.data.disciplines = this.getDefaultDisciplines();
                this.saveDisciplines();
            }
            
            if (savedHistory) {
                this.data.studyHistory = JSON.parse(savedHistory);
            }
            
            if (savedQuestionHistory) {
                this.data.questionHistory = JSON.parse(savedQuestionHistory);
            }
            
            if (savedSettings) {
                this.data.userSettings = JSON.parse(savedSettings);
            }
            
            if (savedAIRecommendations) {
                this.data.aiRecommendations = JSON.parse(savedAIRecommendations);
            }
            
            if (this.data.userSettings.darkMode) {
                document.body.classList.add('dark-mode');
                this.updateDarkModeButton();
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            throw error;
        }
    },

    // Garantir campos da versão 5.0
    ensureVersion5Fields() {
        this.data.disciplines.forEach(discipline => {
            if (!discipline.confidenceLevel) discipline.confidenceLevel = 50;
            if (!discipline.retentionRate) discipline.retentionRate = 0;
            if (!discipline.learningCurve) discipline.learningCurve = 'medium';
            if (!discipline.lastPerformance) discipline.lastPerformance = 0;
            if (!discipline.intelligentAnalysis) {
                discipline.intelligentAnalysis = this.calculateIntelligentAnalysis(discipline);
            }
            
            if (discipline.tasks) {
                discipline.tasks.forEach(task => {
                    if (!task.confidenceScore) task.confidenceScore = 50;
                    if (!task.retentionScore) task.retentionScore = 0;
                    if (!task.lastReviewed) task.lastReviewed = null;
                });
            }
        });
        
        if (!this.data.userSettings.adaptiveLearning) {
            this.data.userSettings.adaptiveLearning = true;
        }
        if (!this.data.userSettings.aiSuggestions) {
            this.data.userSettings.aiSuggestions = true;
        }
    },

    // Calcular análise inteligente
    calculateIntelligentAnalysis(discipline) {
        const weakTopics = this.getWeakTopics(discipline);
        const avgScore = this.calculateDisciplineAverage(discipline);
        const weight = discipline.weight || 10;
        
        let priorityScore = (weight * 2) + (weakTopics.length * 15) + ((100 - avgScore) * 0.5);
        priorityScore = Math.min(100, priorityScore);

        let reviewUrgency = 'low';
        if (priorityScore >= 80) reviewUrgency = 'critical';
        else if (priorityScore >= 60) reviewUrgency = 'high';
        else if (priorityScore >= 40) reviewUrgency = 'medium';

        const estimatedMasteryDays = Math.ceil(
            ((100 - avgScore) * weight) / 10
        );

        const suggestedStudyTime = Math.min(180, Math.max(30, 
            (weakTopics.length * 15) + ((100 - avgScore) * 0.5)
        ));

        return {
            priorityScore: Math.round(priorityScore),
            reviewUrgency,
            estimatedMasteryDays,
            suggestedStudyTime: Math.round(suggestedStudyTime),
            confidenceTrend: 'stable',
            predictedImprovement: Math.round((100 - avgScore) * 0.2)
        };
    },

    // Disciplinas padrão
    getDefaultDisciplines() {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return [
            {
                id: this.generateId(),
                name: 'Direito Civil',
                color: '#1a237e',
                weight: 15,
                reviewCycle: 3,
                progress: 60,
                nextReview: tomorrow.toISOString(),
                lastReview: today.toISOString(),
                totalReviews: 5,
                createdAt: today.toISOString(),
                confidenceLevel: 70,
                retentionRate: 65,
                tasks: [
                    { 
                        id: this.generateId(), 
                        text: 'Lei de Introdução às Normas', 
                        completed: true,
                        confidenceScore: 80,
                        performance: { totalQuestions: 25, correctAnswers: 23, averageScore: 92 }
                    },
                    { 
                        id: this.generateId(), 
                        text: 'Pessoas Naturais', 
                        completed: true,
                        confidenceScore: 75,
                        performance: { totalQuestions: 20, correctAnswers: 18, averageScore: 90 }
                    }
                ]
            },
            {
                id: this.generateId(),
                name: 'Direito Constitucional',
                color: '#00c853',
                weight: 20,
                reviewCycle: 2,
                progress: 40,
                nextReview: today.toISOString(),
                lastReview: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                totalReviews: 3,
                createdAt: today.toISOString(),
                confidenceLevel: 45,
                retentionRate: 40,
                tasks: [
                    { 
                        id: this.generateId(), 
                        text: 'Direitos Fundamentais', 
                        completed: true,
                        confidenceScore: 50,
                        performance: { totalQuestions: 20, correctAnswers: 16, averageScore: 80 }
                    }
                ]
            }
        ];
    },

    // Configurar eventos
    setupEventListeners() {
        const addForm = document.getElementById('add-discipline-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.handleAddDiscipline(e));
        }

        const colorPicker = document.getElementById('discipline-color');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                document.getElementById('selected-color').textContent = e.target.value;
            });
        }

        const weightSlider = document.getElementById('discipline-weight');
        if (weightSlider) {
            weightSlider.addEventListener('input', (e) => {
                document.getElementById('selected-weight').textContent = e.target.value;
            });
        }

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.config.searchTerm = e.target.value.toLowerCase();
                this.config.currentPage = 1;
                this.renderInterface();
            });
        }

        const viewModeButtons = document.querySelectorAll('.view-mode-btn');
        viewModeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.closest('.view-mode-btn').dataset.mode;
                this.changeViewMode(mode);
            });
        });

        const aiInput = document.getElementById('ai-message');
        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendAIMessage();
                }
            });
        }

        const performanceFilter = document.getElementById('performance-filter');
        if (performanceFilter) {
            performanceFilter.addEventListener('change', (e) => {
                this.config.performanceFilter = e.target.value;
                this.renderPerformanceDashboard();
            });
        }
    },

    // Renderizar interface
    renderInterface() {
        if (this.config.viewMode === 'table') {
            this.renderDisciplinesTable();
        } else if (this.config.viewMode === 'weak-topics') {
            this.renderWeakTopicsView();
        } else if (this.config.viewMode === 'ai-plan') {
            this.renderAIPlanView();
        } else {
            this.renderDisciplines();
        }
        
        this.renderTodayReviews();
        this.renderCalendar();
        this.updatePageInfo();
        this.renderPerformanceDashboard();
    },

    // Mostrar aba
    showTab(tabName) {
        this.config.currentTab = tabName;
        this.config.currentPage = 1;
        
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        this.renderInterface();
    },

    // Mudar modo de visualização
    changeViewMode(mode) {
        this.config.viewMode = mode;
        this.config.currentPage = 1;
        
        document.querySelectorAll('.view-mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        this.renderInterface();
    },

    // ===== FUNÇÕES DE RENDERIZAÇÃO =====

    // Renderizar disciplinas em cards
    renderDisciplines() {
        const container = document.getElementById('disciplines-container');
        if (!container) return;

        let filtered = this.filterDisciplines();
        filtered = this.sortDisciplinesArray(filtered);
        
        const start = (this.config.currentPage - 1) * this.config.itemsPerPage;
        const end = start + this.config.itemsPerPage;
        const pageDisciplines = filtered.slice(start, end);

        container.innerHTML = pageDisciplines.map(d => this.createDisciplineCard(d)).join('');

        this.updatePagination(filtered.length);
    },

    // Criar card de disciplina atualizado
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

        const completedTasks = discipline.tasks ? discipline.tasks.filter(t => t.completed).length : 0;
        const totalTasks = discipline.tasks ? discipline.tasks.length : 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const avgScore = this.calculateDisciplineAverage(discipline);
        const weakTopics = this.getWeakTopics(discipline);
        const analysis = discipline.intelligentAnalysis || this.calculateIntelligentAnalysis(discipline);

        const isHighPriority = discipline.weight >= 15 || 
                              (discipline.weight >= 10 && weakTopics.length > 0) ||
                              analysis.reviewUrgency === 'critical' ||
                              analysis.reviewUrgency === 'high';
        
        const cardClass = isHighPriority ? 'discipline-card priority-high fade-in' : 'discipline-card fade-in';

        return `
            <div class="${cardClass}" style="border-left-color: ${discipline.color};">
                ${isHighPriority ? `
                    <div class="priority-badge-high">
                        <i class="fas fa-bullseye"></i> PRIORIDADE
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
                        <span class="confidence-badge" style="background: ${this.getConfidenceColor(discipline.confidenceLevel)}">
                            <i class="fas fa-brain"></i> ${discipline.confidenceLevel}%
                        </span>
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
                
                <div class="granular-analysis">
                    <div class="analysis-header">
                        <h4><i class="fas fa-search"></i> Análise por Tópico</h4>
                    </div>
                    
                    <div class="analysis-stats">
                        <div class="stat-item">
                            <div class="stat-number">${this.getStrongTopics(discipline).length}</div>
                            <div class="stat-label">Pontos Fortes</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number ${weakTopics.length === 0 ? 'stat-good' : 'stat-warning'}">${weakTopics.length}</div>
                            <div class="stat-label">Críticos</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${analysis.priorityScore || 0}</div>
                            <div class="stat-label">Prioridade</div>
                        </div>
                    </div>
                </div>
                
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
                            `<div class="no-tasks">Nenhuma tarefa</div>`
                        }
                    </div>
                    
                    <div class="todo-stats">
                        <span>${completedTasks} de ${totalTasks}</span>
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
                            <i class="fas fa-bullseye"></i> Focar
                        </button>
                    ` : ''}
                    <button class="btn btn-primary btn-small" onclick="StudySystem.markAsReviewed('${discipline.id}')">
                        <i class="fas fa-check"></i> Revisar
                    </button>
                    <button class="btn btn-outline btn-small" onclick="StudySystem.openTopicAnalysis('${discipline.id}')">
                        <i class="fas fa-chart-pie"></i> Análise
                    </button>
                </div>
            </div>
        `;
    },

    // Renderizar tabela de disciplinas
    renderDisciplinesTable() {
        const container = document.getElementById('disciplines-container');
        if (!container) return;

        let filtered = this.filterDisciplines();
        filtered = this.sortDisciplinesArray(filtered);
        
        const start = (this.config.currentPage - 1) * this.config.itemsPerPage;
        const end = start + this.config.itemsPerPage;
        const pageDisciplines = filtered.slice(start, end);

        container.innerHTML = `
            <table class="disciplines-table">
                <thead>
                    <tr>
                        <th>Disciplina</th>
                        <th>Peso</th>
                        <th>Progresso</th>
                        <th>Desempenho</th>
                        <th>Próxima Revisão</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageDisciplines.map(d => {
                        const avgScore = this.calculateDisciplineAverage(d);
                        const progress = d.tasks ? Math.round((d.tasks.filter(t => t.completed).length / d.tasks.length) * 100) : 0;
                        
                        return `
                            <tr>
                                <td>
                                    <div class="table-discipline">
                                        <div class="color-dot" style="background: ${d.color};"></div>
                                        <span>${d.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="weight-badge ${d.weight >= 15 ? 'high' : d.weight >= 10 ? 'medium' : 'low'}">
                                        ${d.weight}
                                    </span>
                                </td>
                                <td>
                                    <div class="progress-cell">
                                        <div class="progress-bar-small">
                                            <div class="progress-fill" style="width: ${progress}%; background: ${d.color};"></div>
                                        </div>
                                        <span>${progress}%</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="performance-badge ${this.getPerformanceClass(avgScore)}">
                                        ${avgScore > 0 ? avgScore + '%' : 'N/A'}
                                    </span>
                                </td>
                                <td>
                                    ${d.nextReview ? this.formatDate(d.nextReview.split('T')[0]) : 'N/A'}
                                </td>
                                <td>
                                    <div class="table-actions">
                                        <button class="btn-icon" onclick="StudySystem.markAsReviewed('${d.id}')" title="Revisar">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button class="btn-icon" onclick="StudySystem.editDiscipline('${d.id}')" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon" onclick="StudySystem.openTaskManager('${d.id}')" title="Tarefas">
                                            <i class="fas fa-tasks"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        this.updatePagination(filtered.length);
    },

    // Renderizar view de tópicos críticos
    renderWeakTopicsView() {
        const container = document.getElementById('disciplines-container');
        if (!container) return;

        const allWeakTopics = [];
        this.data.disciplines.forEach(discipline => {
            const weakTopics = this.getWeakTopics(discipline);
            weakTopics.forEach(topic => {
                allWeakTopics.push({
                    discipline,
                    topic,
                    priority: (discipline.weight * 2) + (100 - (topic.performance?.averageScore || 0))
                });
            });
        });

        allWeakTopics.sort((a, b) => b.priority - a.priority);
        
        const start = (this.config.currentPage - 1) * this.config.itemsPerPage;
        const end = start + this.config.itemsPerPage;
        const pageTopics = allWeakTopics.slice(start, end);

        if (pageTopics.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>Nenhum tópico crítico encontrado!</h3>
                    <p>Excelente trabalho! Continue revisando para manter esse nível.</p>
                </div>
            `;
        } else {
            container.innerHTML = pageTopics.map(item => `
                <div class="weak-topic-card">
                    <div class="weak-topic-header">
                        <div class="topic-discipline" style="color: ${item.discipline.color};">
                            <i class="fas fa-book"></i>
                            <span>${item.discipline.name}</span>
                            <span class="weight-badge">Peso: ${item.discipline.weight}</span>
                        </div>
                        <div class="topic-priority">
                            <span class="priority-badge">Prioridade: ${Math.round(item.priority)}</span>
                        </div>
                    </div>
                    
                    <div class="weak-topic-content">
                        <h4>${item.topic.text}</h4>
                        <div class="topic-stats">
                            <div class="stat">
                                <span class="stat-label">Desempenho:</span>
                                <span class="stat-value ${this.getPerformanceClass(item.topic.performance?.averageScore || 0)}">
                                    ${item.topic.performance?.averageScore || 0}%
                                </span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Questões:</span>
                                <span class="stat-value">${item.topic.performance?.totalQuestions || 0}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Acertos:</span>
                                <span class="stat-value">${item.topic.performance?.correctAnswers || 0}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="weak-topic-actions">
                        <button class="btn btn-warning btn-small" onclick="StudySystem.focusOnTopic('${item.discipline.id}', '${item.topic.id}')">
                            <i class="fas fa-bullseye"></i> Focar neste tópico
                        </button>
                        <button class="btn btn-outline btn-small" onclick="StudySystem.openTopicAnalysis('${item.discipline.id}')">
                            <i class="fas fa-chart-pie"></i> Ver análise completa
                        </button>
                    </div>
                </div>
            `).join('');
        }

        this.updatePagination(allWeakTopics.length);
    },

    // Renderizar view de plano AI
    renderAIPlanView() {
        const container = document.getElementById('disciplines-container');
        if (!container) return;

        const analysis = this.analyzeStudyPatterns();
        const recommendations = this.generateSimpleRecommendations(analysis);
        
        container.innerHTML = `
            <div class="ai-plan-container">
                <div class="ai-plan-header">
                    <h3><i class="fas fa-robot"></i> Plano de Estudos Inteligente</h3>
                    <p>Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                
                <div class="ai-plan-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-brain"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${analysis.averagePerformance}%</div>
                            <div class="stat-label">Média de Acertos</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${analysis.studyConsistency}%</div>
                            <div class="stat-label">Consistência</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${analysis.weakAreas.length}</div>
                            <div class="stat-label">Áreas Críticas</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number">${analysis.strongAreas.length}</div>
                            <div class="stat-label">Pontos Fortes</div>
                        </div>
                    </div>
                </div>
                
                <div class="ai-plan-recommendations">
                    <h4><i class="fas fa-lightbulb"></i> Recomendações</h4>
                    ${recommendations.map(rec => `
                        <div class="recommendation ${rec.type}">
                            <div class="recommendation-icon">
                                <i class="fas fa-${rec.type === 'critical' ? 'exclamation-triangle' : rec.type === 'consistency' ? 'calendar' : 'check-circle'}"></i>
                            </div>
                            <div class="recommendation-content">
                                <p>${rec.message}</p>
                                <button class="btn btn-small" onclick="StudySystem.followRecommendation('${rec.action}')">
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="ai-plan-focus">
                    <h4><i class="fas fa-bullseye"></i> Foco da Semana</h4>
                    <div class="focus-items">
                        ${this.getFocusAreas().map((area, index) => `
                            <div class="focus-item">
                                <div class="focus-rank">${index + 1}</div>
                                <div class="focus-content">
                                    <h5>${area.name}</h5>
                                    <p>Meta: Aumentar de ${area.currentScore}% para ${area.targetScore}%</p>
                                    <div class="focus-progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: ${area.currentScore}%;"></div>
                                        </div>
                                        <span>${area.currentScore}% → ${area.targetScore}%</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // Filtrar disciplinas
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
                return this.data.disciplines.filter(d => 
                    d.progress >= 90 && this.calculateDisciplineAverage(d) >= 80
                );
            case 'recommended':
                return this.data.disciplines.filter(d => 
                    d.intelligentAnalysis?.reviewUrgency === 'critical' ||
                    d.intelligentAnalysis?.reviewUrgency === 'high'
                );
            default:
                return this.data.disciplines.filter(d => 
                    !this.config.searchTerm || 
                    d.name.toLowerCase().includes(this.config.searchTerm)
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
                case 'weight':
                    return b.weight - a.weight;
                case 'performance-granular':
                    const aPriority = (a.weight * 2) + (100 - this.calculateDisciplineAverage(a));
                    const bPriority = (b.weight * 2) + (100 - this.calculateDisciplineAverage(b));
                    return bPriority - aPriority;
                default:
                    return 0;
            }
        });
    },

    // Atualizar paginação
    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.config.itemsPerPage);
        document.getElementById('page-info').textContent = `Página ${this.config.currentPage} de ${totalPages}`;
        
        const prevBtn = document.querySelector('.pagination button:first-child');
        const nextBtn = document.querySelector('.pagination button:last-child');
        
        if (prevBtn) prevBtn.disabled = this.config.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.config.currentPage === totalPages;
    },

    // Página anterior
    prevPage() {
        if (this.config.currentPage > 1) {
            this.config.currentPage--;
            this.renderInterface();
        }
    },

    // Próxima página
    nextPage() {
        const filtered = this.filterDisciplines();
        const totalPages = Math.ceil(filtered.length / this.config.itemsPerPage);
        
        if (this.config.currentPage < totalPages) {
            this.config.currentPage++;
            this.renderInterface();
        }
    },

    // Atualizar informações da página
    updatePageInfo() {
        const filtered = this.filterDisciplines();
        const totalPages = Math.ceil(filtered.length / this.config.itemsPerPage);
        document.getElementById('page-info').textContent = `Página ${this.config.currentPage} de ${totalPages}`;
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

        document.getElementById('today-reviews').textContent = todayReviews.length;
    },

    // Renderizar calendário
    renderCalendar() {
        const container = document.getElementById('review-calendar');
        if (!container) return;

        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const days = [];
        const startDay = firstDay.getDay();
        
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(today.getFullYear(), today.getMonth(), i));
        }

        const reviewsByDay = {};
        this.data.disciplines.forEach(discipline => {
            if (discipline.nextReview) {
                const date = discipline.nextReview.split('T')[0];
                reviewsByDay[date] = (reviewsByDay[date] || 0) + 1;
            }
        });

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

    // Renderizar dashboard de desempenho
    renderPerformanceDashboard() {
        const container = document.getElementById('performance-dashboard');
        if (!container) return;

        const stats = this.calculatePerformanceStats();
        const filteredDisciplines = this.getFilteredDisciplinesForDashboard();
        
        container.innerHTML = `
            <div class="performance-stats">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalQuestions}</div>
                    <div class="stat-label">Questões</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.averageScore}%</div>
                    <div class="stat-label">Média Geral</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.strongAreas}</div>
                    <div class="stat-label">Pontos Fortes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.weakAreas}</div>
                    <div class="stat-label">Atenção</div>
                </div>
            </div>
            
            <div class="performance-chart">
                <h4>Distribuição de Desempenho</h4>
                <div class="chart-bars">
                    ${this.createPerformanceBars(filteredDisciplines)}
                </div>
            </div>
        `;
    },

    getFilteredDisciplinesForDashboard() {
        return this.data.disciplines.filter(discipline => {
            const avgScore = this.calculateDisciplineAverage(discipline);
            
            switch (this.config.performanceFilter) {
                case 'good':
                    return avgScore >= 80;
                case 'medium':
                    return avgScore >= 60 && avgScore < 80;
                case 'poor':
                    return avgScore > 0 && avgScore < 60;
                case 'no-data':
                    return avgScore === 0;
                default:
                    return true;
            }
        });
    },

    createPerformanceBars(disciplines) {
        const bars = disciplines.map(discipline => {
            const avgScore = this.calculateDisciplineAverage(discipline);
            const barClass = this.getPerformanceClass(avgScore);
            
            return `
                <div class="chart-bar-item">
                    <div class="bar-label">
                        <div class="bar-color" style="background: ${discipline.color};"></div>
                        <span>${discipline.name}</span>
                    </div>
                    <div class="bar-container">
                        <div class="bar ${barClass}" style="width: ${avgScore}%;"></div>
                        <span class="bar-value">${avgScore}%</span>
                    </div>
                </div>
            `;
        }).join('');
        
        return bars || '<div class="no-data">Nenhum dado para exibir</div>';
    },

    // ===== FUNÇÕES DE CÁLCULO =====

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

    // Obter tópicos fracos
    getWeakTopics(discipline) {
        if (!discipline.tasks) return [];
        return discipline.tasks.filter(task => 
            task.performance && 
            task.performance.totalQuestions > 0 && 
            task.performance.averageScore < 60
        );
    },

    // Obter tópicos fortes
    getStrongTopics(discipline) {
        if (!discipline.tasks) return [];
        return discipline.tasks.filter(task => 
            task.performance && 
            task.performance.totalQuestions > 0 && 
            task.performance.averageScore >= 80
        );
    },

    // Obter classe de desempenho
    getPerformanceClass(score) {
        if (score >= 80) return 'performance-good';
        if (score >= 60) return 'performance-medium';
        if (score > 0) return 'performance-poor';
        return 'performance-none';
    },

    // Obter cor da confiança
    getConfidenceColor(confidence) {
        if (confidence >= 80) return '#4caf50';
        if (confidence >= 60) return '#8bc34a';
        if (confidence >= 40) return '#ffc107';
        if (confidence >= 20) return '#ff9800';
        return '#f44336';
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
            const disciplineQuestions = discipline.tasks ? 
                discipline.tasks.reduce((sum, task) => sum + (task.performance?.totalQuestions || 0), 0) : 0;
            
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

    // Calcular média geral
    calculateOverallAverage() {
        const scores = this.data.disciplines
            .map(d => this.calculateDisciplineAverage(d))
            .filter(s => s > 0);
        
        return scores.length > 0 
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;
    },

    // Calcular consistência de estudo
    calculateStudyConsistency() {
        if (this.data.studyHistory.length === 0) return 0;
        
        const studyDays = new Set(
            this.data.studyHistory
                .filter(s => s.date)
                .map(s => new Date(s.date).toDateString())
        ).size;
        
        const daysSinceStart = Math.max(1, 
            (new Date() - new Date(this.data.studyHistory[0]?.date || new Date())) 
            / (1000 * 60 * 60 * 24)
        );
        
        return Math.round((studyDays / daysSinceStart) * 100);
    },

    // Analisar padrões de estudo
    analyzeStudyPatterns() {
        const analysis = {
            totalStudyTime: 0,
            averagePerformance: this.calculateOverallAverage(),
            weakAreas: [],
            strongAreas: [],
            studyConsistency: this.calculateStudyConsistency()
        };

        this.data.disciplines.forEach(discipline => {
            const avgScore = this.calculateDisciplineAverage(discipline);
            if (avgScore < 60) {
                analysis.weakAreas.push({
                    name: discipline.name,
                    score: avgScore,
                    weight: discipline.weight
                });
            } else if (avgScore >= 80) {
                analysis.strongAreas.push({
                    name: discipline.name,
                    score: avgScore
                });
            }
        });

        return analysis;
    },

    // Gerar recomendações simples
    generateSimpleRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.weakAreas.length > 0) {
            const critical = analysis.weakAreas.filter(a => a.score < 50 && a.weight >= 15);
            if (critical.length > 0) {
                recommendations.push({
                    type: 'critical',
                    message: `Foque em ${critical[0].name} (${critical[0].score}%)`,
                    action: 'focus_weak'
                });
            }
        }
        
        if (analysis.studyConsistency < 60) {
            recommendations.push({
                type: 'consistency',
                message: `Estude mais regularmente (${analysis.studyConsistency}% consistência)`,
                action: 'improve_consistency'
            });
        }
        
        if (analysis.averagePerformance >= 80) {
            recommendations.push({
                type: 'good',
                message: `Excelente desempenho! Continue assim.`,
                action: 'maintain'
            });
        }
        
        return recommendations;
    },

    // Obter áreas de foco
    getFocusAreas() {
        const focusAreas = this.data.disciplines
            .filter(d => {
                const avgScore = this.calculateDisciplineAverage(d);
                return avgScore > 0 && avgScore < 80;
            })
            .sort((a, b) => {
                const priorityA = (a.weight * 2) + (100 - this.calculateDisciplineAverage(a));
                const priorityB = (b.weight * 2) + (100 - this.calculateDisciplineAverage(b));
                return priorityB - priorityA;
            })
            .slice(0, 3)
            .map(d => ({
                name: d.name,
                currentScore: this.calculateDisciplineAverage(d),
                targetScore: Math.min(90, this.calculateDisciplineAverage(d) + 20),
                weight: d.weight
            }));
        
        return focusAreas;
    },

    // Atualizar estatísticas
    updateStatistics() {
        const totalProgress = this.data.disciplines.length > 0
            ? Math.round(this.data.disciplines.reduce((sum, d) => sum + d.progress, 0) / this.data.disciplines.length)
            : 0;
        
        const progressCircle = document.querySelector('.circle-progress');
        if (progressCircle) {
            const circumference = 2 * Math.PI * 50;
            const offset = circumference - (totalProgress / 100) * circumference;
            progressCircle.style.strokeDasharray = circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
        
        document.getElementById('overall-progress').textContent = `${totalProgress}%`;
        document.getElementById('total-disciplines').textContent = this.data.disciplines.length;
        
        const today = new Date().toISOString().split('T')[0];
        const todayReviews = this.data.disciplines.filter(d => 
            d.nextReview && d.nextReview.split('T')[0] === today
        ).length;
        document.getElementById('today-reviews').textContent = todayReviews;
        
        const masteredCount = this.data.disciplines.filter(d => 
            d.progress >= 90 && this.calculateDisciplineAverage(d) >= 80
        ).length;
        document.getElementById('mastered-topics').textContent = masteredCount;
        
        const highPriorityCount = this.data.disciplines.filter(d => 
            d.weight >= 15 || this.getWeakTopics(d).length > 0
        ).length;
        const highPriorityEl = document.getElementById('high-priority-count');
        if (highPriorityEl) {
            highPriorityEl.textContent = highPriorityCount;
        }
    },

    // ===== FUNÇÕES DE AÇÃO =====

    // Adicionar disciplina
    async handleAddDiscipline(e) {
        e.preventDefault();
        
        const name = document.getElementById('discipline-name').value.trim();
        const color = document.getElementById('discipline-color').value;
        const reviewCycle = parseInt(document.getElementById('review-cycle').value);
        const weight = parseInt(document.getElementById('discipline-weight').value) || 10;
        const notes = document.getElementById('discipline-notes').value.trim();
        
        if (!name) {
            this.showNotification('Por favor, insira um nome para a disciplina.', 'error');
            return;
        }

        const initialTasks = notes ? this.convertNotesToTasks(notes) : [];

        const newDiscipline = {
            id: this.generateId(),
            name,
            color,
            weight,
            reviewCycle,
            progress: 0,
            nextReview: this.getNextReviewDate(reviewCycle),
            lastReview: null,
            totalReviews: 0,
            confidenceLevel: 50,
            retentionRate: 0,
            learningCurve: 'medium',
            lastPerformance: 0,
            createdAt: new Date().toISOString(),
            tasks: initialTasks,
            intelligentAnalysis: null
        };

        newDiscipline.intelligentAnalysis = this.calculateIntelligentAnalysis(newDiscipline);

        this.data.disciplines.push(newDiscipline);
        await this.saveData();
        
        e.target.reset();
        document.getElementById('selected-color').textContent = '#1a237e';
        document.getElementById('selected-weight').textContent = '10';
        
        this.renderInterface();
        this.updateStatistics();
        
        this.showNotification(`Disciplina "${name}" adicionada!`, 'success');
    },

    // Converter notas para tarefas
    convertNotesToTasks(notes) {
        if (!notes) return [];
        
        const lines = notes.split('\n').filter(line => line.trim());
        return lines.map((line, index) => ({
            id: this.generateId(),
            text: line.trim(),
            completed: false,
            confidenceScore: 50,
            retentionScore: 0,
            lastReviewed: null,
            createdAt: new Date().toISOString()
        }));
    },

    // Marcar como revisado
    async markAsReviewed(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const today = new Date();
        
        discipline.lastReview = today.toISOString();
        discipline.nextReview = this.getNextReviewDate(discipline.reviewCycle);
        discipline.totalReviews++;
        discipline.confidenceLevel = Math.min(100, discipline.confidenceLevel + 5);
        
        this.data.studyHistory.push({
            disciplineId,
            disciplineName: discipline.name,
            date: today.toISOString(),
            type: 'review'
        });
        
        await this.saveData();
        this.renderInterface();
        this.updateStatistics();
        
        this.showNotification(`"${discipline.name}" revisada!`, 'success');
    },

    // Focar em tópicos fracos
    async focusOnWeakTopics(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const weakTopics = this.getWeakTopics(discipline);
        if (weakTopics.length === 0) {
            this.showNotification('Nenhum tópico fraco encontrado nesta disciplina.', 'info');
            return;
        }

        this.showNotification(`Focando em ${weakTopics.length} tópico(s) fraco(s) de ${discipline.name}`, 'success');
        
        // Marcar os tópicos fracos como prioritários
        weakTopics.forEach(topic => {
            topic.priority = 'high';
        });
        
        await this.saveData();
        this.renderInterface();
    },

    // Focar em tópico específico
    async focusOnTopic(disciplineId, topicId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        const topic = discipline.tasks.find(t => t.id === topicId);
        if (!topic) return;

        // Abrir modal de análise de tópico
        this.openTopicAnalysis(disciplineId, topicId);
    },

    // Abrir análise de tópico
    openTopicAnalysis(disciplineId, topicId = null) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const modal = document.getElementById('discipline-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        if (topicId) {
            const topic = discipline.tasks.find(t => t.id === topicId);
            if (!topic) return;
            
            title.textContent = `Análise: ${topic.text}`;
            body.innerHTML = this.createTopicAnalysisHTML(discipline, topic);
        } else {
            title.textContent = `Análise: ${discipline.name}`;
            body.innerHTML = this.createDisciplineAnalysisHTML(discipline);
        }
        
        modal.style.display = 'flex';
    },

    // Criar HTML de análise de disciplina
    createDisciplineAnalysisHTML(discipline) {
        const avgScore = this.calculateDisciplineAverage(discipline);
        const weakTopics = this.getWeakTopics(discipline);
        const strongTopics = this.getStrongTopics(discipline);
        const analysis = discipline.intelligentAnalysis || this.calculateIntelligentAnalysis(discipline);
        
        return `
            <div class="topic-analysis">
                <div class="analysis-overview">
                    <div class="overview-stat">
                        <div class="stat-number">${avgScore}%</div>
                        <div class="stat-label">Desempenho</div>
                    </div>
                    <div class="overview-stat">
                        <div class="stat-number">${discipline.confidenceLevel}%</div>
                        <div class="stat-label">Confiança</div>
                    </div>
                    <div class="overview-stat">
                        <div class="stat-number">${analysis.priorityScore}</div>
                        <div class="stat-label">Prioridade</div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Tópicos Críticos (${weakTopics.length})</h4>
                    ${weakTopics.length > 0 ? `
                        <ul class="topic-list">
                            ${weakTopics.map(topic => `
                                <li>
                                    <span class="topic-name">${topic.text}</span>
                                    <span class="topic-score ${this.getPerformanceClass(topic.performance.averageScore)}">
                                        ${topic.performance.averageScore}%
                                    </span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : '<p class="no-data">Nenhum tópico crítico</p>'}
                </div>
                
                <div class="analysis-section">
                    <h4><i class="fas fa-trophy"></i> Pontos Fortes (${strongTopics.length})</h4>
                    ${strongTopics.length > 0 ? `
                        <ul class="topic-list">
                            ${strongTopics.map(topic => `
                                <li>
                                    <span class="topic-name">${topic.text}</span>
                                    <span class="topic-score ${this.getPerformanceClass(topic.performance.averageScore)}">
                                        ${topic.performance.averageScore}%
                                    </span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : '<p class="no-data">Nenhum ponto forte identificado</p>'}
                </div>
                
                <div class="analysis-section">
                    <h4><i class="fas fa-lightbulb"></i> Recomendações</h4>
                    <ul class="recommendations-list">
                        ${weakTopics.length > 0 ? `
                            <li>Foque nos ${Math.min(2, weakTopics.length)} tópicos mais críticos</li>
                            <li>Revise a cada ${Math.max(1, Math.floor(discipline.reviewCycle / 2))} dias</li>
                        ` : `
                            <li>Continue revisando normalmente</li>
                            <li>Mantenha o ciclo de ${discipline.reviewCycle} dias</li>
                        `}
                        <li>Dedique aproximadamente ${analysis.suggestedStudyTime} minutos por sessão</li>
                    </ul>
                </div>
                
                <div class="analysis-actions">
                    <button class="btn btn-primary" onclick="StudySystem.markAsReviewed('${discipline.id}')">
                        <i class="fas fa-check"></i> Marcar como Revisada
                    </button>
                    <button class="btn btn-outline" onclick="StudySystem.openTaskManager('${discipline.id}')">
                        <i class="fas fa-tasks"></i> Gerenciar Tarefas
                    </button>
                </div>
            </div>
        `;
    },

    // Criar HTML de análise de tópico
    createTopicAnalysisHTML(discipline, topic) {
        const performance = topic.performance || { totalQuestions: 0, correctAnswers: 0, averageScore: 0 };
        const accuracy = performance.totalQuestions > 0 
            ? Math.round((performance.correctAnswers / performance.totalQuestions) * 100) 
            : 0;
        
        return `
            <div class="topic-detail-analysis">
                <div class="topic-header">
                    <h4>${topic.text}</h4>
                    <span class="discipline-badge" style="background: ${discipline.color};">${discipline.name}</span>
                </div>
                
                <div class="topic-stats-detailed">
                    <div class="stat-card">
                        <div class="stat-number">${accuracy}%</div>
                        <div class="stat-label">Acerto</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${performance.totalQuestions}</div>
                        <div class="stat-label">Questões</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${performance.correctAnswers}</div>
                        <div class="stat-label">Acertos</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${topic.confidenceScore}%</div>
                        <div class="stat-label">Confiança</div>
                    </div>
                </div>
                
                <div class="topic-recommendations">
                    <h5><i class="fas fa-lightbulb"></i> Como Melhorar</h5>
                    <ul>
                        ${accuracy < 60 ? `
                            <li>Revise os conceitos fundamentais deste tópico</li>
                            <li>Pratique mais questões sobre este assunto</li>
                            <li>Anote os erros cometidos e revise regularmente</li>
                        ` : accuracy < 80 ? `
                            <li>Consolide o conhecimento com mais exercícios</li>
                            <li>Revise os pontos de maior dificuldade</li>
                            <li>Faça resumos sobre o assunto</li>
                        ` : `
                            <li>Mantenha revisões periódicas</li>
                            <li>Aplique o conhecimento em questões complexas</li>
                            <li>Explore tópicos relacionados</li>
                        `}
                    </ul>
                </div>
                
                <div class="topic-actions">
                    <div class="confidence-adjuster">
                        <label>Ajustar nível de confiança:</label>
                        <div class="confidence-slider">
                            <input type="range" min="0" max="100" value="${topic.confidenceScore}" 
                                   onchange="StudySystem.updateTopicConfidence('${discipline.id}', '${topic.id}', this.value)">
                            <span class="confidence-value">${topic.confidenceScore}%</span>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="StudySystem.recordQuestionsForTopic('${discipline.id}', '${topic.id}')">
                            <i class="fas fa-plus-circle"></i> Registrar Questões
                        </button>
                        <button class="btn btn-outline" onclick="StudySystem.resetTopicProgress('${discipline.id}', '${topic.id}')">
                            <i class="fas fa-redo"></i> Reiniciar Progresso
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Registrar questões para tópico
    async recordQuestionsForTopic(disciplineId, topicId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        const topic = discipline.tasks.find(t => t.id === topicId);
        if (!topic) return;

        const totalQuestions = prompt(`Quantas questões sobre "${topic.text}" você fez?`, "10");
        if (!totalQuestions || isNaN(totalQuestions)) return;

        const correctAnswers = prompt(`Quantas acertou?`, Math.floor(totalQuestions * 0.7));
        if (!correctAnswers || isNaN(correctAnswers)) return;

        const total = parseInt(totalQuestions);
        const correct = parseInt(correctAnswers);
        const accuracy = Math.round((correct / total) * 100);

        if (!topic.performance) {
            topic.performance = { totalQuestions: 0, correctAnswers: 0, averageScore: 0 };
        }

        const oldTotal = topic.performance.totalQuestions;
        const oldCorrect = topic.performance.correctAnswers;
        
        const newTotal = oldTotal + total;
        const newCorrect = oldCorrect + correct;
        const newAverage = Math.round((newCorrect / newTotal) * 100);

        topic.performance = {
            totalQuestions: newTotal,
            correctAnswers: newCorrect,
            averageScore: newAverage
        };

        topic.confidenceScore = Math.min(100, Math.max(0, 
            topic.confidenceScore + (accuracy >= 80 ? 10 : accuracy >= 60 ? 5 : -5)
        ));

        this.data.questionHistory.push({
            disciplineId,
            disciplineName: discipline.name,
            topicId,
            topicText: topic.text,
            date: new Date().toISOString(),
            totalQuestions: total,
            correctAnswers: correct,
            accuracy
        });

        await this.saveData();
        this.renderInterface();
        this.updateStatistics();
        
        this.showNotification(`Questões registradas: ${correct}/${total} (${accuracy}%)`, 'success');
    },

    // Atualizar confiança do tópico
    async updateTopicConfidence(disciplineId, topicId, confidence) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        const topic = discipline.tasks.find(t => t.id === topicId);
        if (!topic) return;

        topic.confidenceScore = parseInt(confidence);
        
        await this.saveData();
        this.renderInterface();
    },

    // Reiniciar progresso do tópico
    async resetTopicProgress(disciplineId, topicId) {
        if (!confirm('Tem certeza que deseja reiniciar o progresso deste tópico?')) return;

        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        const topic = discipline.tasks.find(t => t.id === topicId);
        if (!topic) return;

        topic.performance = { totalQuestions: 0, correctAnswers: 0, averageScore: 0 };
        topic.confidenceScore = 50;
        
        await this.saveData();
        this.renderInterface();
        
        this.showNotification('Progresso do tópico reiniciado', 'success');
    },

    // Seguir recomendação
    async followRecommendation(action) {
        switch (action) {
            case 'focus_weak':
                const weakDisciplines = this.data.disciplines.filter(d => {
                    const avg = this.calculateDisciplineAverage(d);
                    return avg < 60;
                });
                
                if (weakDisciplines.length > 0) {
                    this.config.viewMode = 'weak-topics';
                    this.renderInterface();
                    this.showNotification('Visualizando tópicos críticos', 'success');
                }
                break;
                
            case 'improve_consistency':
                this.showNotification('Defina um horário fixo para estudos diários', 'info');
                break;
                
            case 'maintain':
                this.showNotification('Continue com a rotina atual', 'success');
                break;
        }
    },

    // Registrar questões
    async recordQuestions(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const totalQuestions = prompt(`Quantas questões sobre ${discipline.name} você fez?`, "20");
        if (!totalQuestions || isNaN(totalQuestions)) return;

        const correctAnswers = prompt(`Quantas acertou?`, Math.floor(totalQuestions * 0.7));
        if (!correctAnswers || isNaN(correctAnswers)) return;

        const total = parseInt(totalQuestions);
        const correct = parseInt(correctAnswers);
        const accuracy = Math.round((correct / total) * 100);

        this.data.questionHistory.push({
            disciplineId,
            disciplineName: discipline.name,
            date: new Date().toISOString(),
            totalQuestions: total,
            correctAnswers: correct,
            accuracy
        });

        await this.saveQuestionHistory();
        
        this.showNotification(`Questões registradas: ${correct}/${total} (${accuracy}%)`, 'success');
    },

    // Alternar tarefa
    async toggleTask(disciplineId, taskId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        const task = discipline.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        if (task.completed) {
            task.confidenceScore = Math.min(100, task.confidenceScore + 10);
        }
        
        discipline.progress = this.calculateProgress(discipline.tasks);
        
        await this.saveData();
        this.renderInterface();
        this.updateStatistics();
        
        this.showNotification(`Tarefa ${task.completed ? 'concluída' : 'pendente'}!`, 'success');
    },

    // Calcular progresso
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
        
        title.textContent = `Tarefas: ${discipline.name}`;
        
        body.innerHTML = `
            <div class="task-manager">
                <div class="task-manager-header">
                    <h4>Total: ${discipline.tasks ? discipline.tasks.length : 0} tarefas</h4>
                    <button class="btn btn-primary btn-small" onclick="StudySystem.addNewTask('${discipline.id}')">
                        <i class="fas fa-plus"></i> Nova Tarefa
                    </button>
                </div>
                
                <div class="task-list-manager">
                    ${discipline.tasks && discipline.tasks.length > 0 ? 
                        discipline.tasks.map(task => `
                            <div class="task-manager-item ${task.completed ? 'completed' : ''}">
                                <div class="task-checkbox">
                                    <input type="checkbox" id="manager-task-${task.id}" 
                                           ${task.completed ? 'checked' : ''}
                                           onchange="StudySystem.toggleTask('${discipline.id}', '${task.id}')">
                                </div>
                                <div class="task-content">
                                    <input type="text" value="${task.text}" 
                                           onchange="StudySystem.updateTaskText('${discipline.id}', '${task.id}', this.value)"
                                           class="task-input">
                                    <div class="task-meta">
                                        <span class="task-performance">
                                            ${task.performance && task.performance.totalQuestions > 0 ? 
                                                `${task.performance.averageScore}%` : 
                                                '0%'}
                                        </span>
                                        <span class="task-confidence">
                                            Confiança: ${task.confidenceScore}%
                                        </span>
                                    </div>
                                </div>
                                <div class="task-actions">
                                    <button class="btn-icon" onclick="StudySystem.updateTaskPriority('${discipline.id}', '${task.id}', 'high')" 
                                            ${task.priority === 'high' ? 'style="color: #ff4081;"' : ''}>
                                        <i class="fas fa-flag"></i>
                                    </button>
                                    <button class="btn-icon" onclick="StudySystem.deleteTask('${discipline.id}', '${task.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('') : 
                        '<div class="no-tasks">Nenhuma tarefa cadastrada</div>'
                    }
                </div>
                
                <div class="task-manager-actions">
                    <button class="btn btn-outline" onclick="closeModal()">
                        Fechar
                    </button>
                    <button class="btn btn-primary" onclick="StudySystem.addNewTask('${discipline.id}')">
                        <i class="fas fa-plus"></i> Adicionar Tarefa
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    },

    // Adicionar nova tarefa
    async addNewTask(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const taskText = prompt('Digite a descrição da nova tarefa:');
        if (!taskText || taskText.trim() === '') return;

        if (!discipline.tasks) discipline.tasks = [];

        const newTask = {
            id: this.generateId(),
            text: taskText.trim(),
            completed: false,
            confidenceScore: 50,
            retentionScore: 0,
            lastReviewed: null,
            createdAt: new Date().toISOString()
        };

        discipline.tasks.push(newTask);
        discipline.progress = this.calculateProgress(discipline.tasks);
        
        await this.saveData();
        this.openTaskManager(disciplineId);
        
        this.showNotification('Tarefa adicionada!', 'success');
    },

    // Atualizar texto da tarefa
    async updateTaskText(disciplineId, taskId, newText) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        const task = discipline.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.text = newText.trim();
        
        await this.saveData();
    },

    // Atualizar prioridade da tarefa
    async updateTaskPriority(disciplineId, taskId, priority) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        const task = discipline.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.priority = task.priority === priority ? null : priority;
        
        await this.saveData();
        this.openTaskManager(disciplineId);
    },

    // Excluir tarefa
    async deleteTask(disciplineId, taskId) {
        if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline || !discipline.tasks) return;

        discipline.tasks = discipline.tasks.filter(t => t.id !== taskId);
        discipline.progress = this.calculateProgress(discipline.tasks);
        
        await this.saveData();
        this.openTaskManager(disciplineId);
        
        this.showNotification('Tarefa excluída!', 'success');
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
                    <label for="edit-color">Cor de Identificação</label>
                    <div class="color-picker">
                        <input type="color" id="edit-color" value="${discipline.color}">
                        <span id="edit-selected-color">${discipline.color}</span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="edit-weight">Peso no Edital (1-20)</label>
                    <div class="weight-selector">
                        <input type="range" id="edit-weight" min="1" max="20" value="${discipline.weight}">
                        <div class="weight-display">
                            <span id="edit-selected-weight">${discipline.weight}</span>
                            <span class="weight-label">(1-20)</span>
                        </div>
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
                    <label for="edit-notes">Anotações</label>
                    <textarea id="edit-notes" rows="3">${discipline.notes || ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-danger" onclick="StudySystem.deleteDiscipline('${discipline.id}')">
                        <i class="fas fa-trash"></i> Excluir Disciplina
                    </button>
                    <button type="button" class="btn btn-outline" onclick="closeModal()">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Salvar Alterações
                    </button>
                </div>
            </form>
        `;
        
        modal.style.display = 'flex';
        
        const form = document.getElementById('edit-discipline-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveDisciplineChanges(disciplineId);
            });
        }
        
        const colorInput = document.getElementById('edit-color');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                document.getElementById('edit-selected-color').textContent = e.target.value;
            });
        }
        
        const weightInput = document.getElementById('edit-weight');
        if (weightInput) {
            weightInput.addEventListener('input', (e) => {
                document.getElementById('edit-selected-weight').textContent = e.target.value;
            });
        }
    },

    // Salvar alterações da disciplina
    async saveDisciplineChanges(disciplineId) {
        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        const name = document.getElementById('edit-name').value.trim();
        const color = document.getElementById('edit-color').value;
        const weight = parseInt(document.getElementById('edit-weight').value);
        const reviewCycle = parseInt(document.getElementById('edit-cycle').value);
        const notes = document.getElementById('edit-notes').value.trim();

        if (!name) {
            this.showNotification('O nome da disciplina é obrigatório.', 'error');
            return;
        }

        discipline.name = name;
        discipline.color = color;
        discipline.weight = weight;
        discipline.reviewCycle = reviewCycle;
        discipline.notes = notes;
        
        discipline.intelligentAnalysis = this.calculateIntelligentAnalysis(discipline);
        
        await this.saveData();
        this.renderInterface();
        this.updateStatistics();
        this.closeModal();
        
        this.showNotification('Disciplina atualizada!', 'success');
    },

    // Excluir disciplina
    async deleteDiscipline(disciplineId) {
        if (!confirm('Tem certeza que deseja excluir esta disciplina e todas as suas tarefas?')) return;

        this.data.disciplines = this.data.disciplines.filter(d => d.id !== disciplineId);
        
        await this.saveData();
        this.renderInterface();
        this.updateStatistics();
        this.closeModal();
        
        this.showNotification('Disciplina excluída!', 'success');
    },

    // Reiniciar disciplina
    async resetDiscipline(disciplineId) {
        if (!confirm('Tem certeza que deseja reiniciar o progresso desta disciplina?')) return;

        const discipline = this.data.disciplines.find(d => d.id === disciplineId);
        if (!discipline) return;

        discipline.progress = 0;
        discipline.totalReviews = 0;
        discipline.lastReview = null;
        discipline.nextReview = this.getNextReviewDate(discipline.reviewCycle);
        discipline.confidenceLevel = 50;
        
        if (discipline.tasks) {
            discipline.tasks.forEach(task => {
                task.completed = false;
                task.completedAt = null;
                task.confidenceScore = 50;
                if (task.performance) {
                    task.performance = { totalQuestions: 0, correctAnswers: 0, averageScore: 0 };
                }
            });
        }
        
        await this.saveData();
        this.renderInterface();
        this.updateStatistics();
        
        this.showNotification('Progresso da disciplina reiniciado!', 'success');
    },

    // ===== FUNÇÕES UTILITÁRIAS =====

    // Gerar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Obter próxima data de revisão
    getNextReviewDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString();
    },

    // Formatar data
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    },

    // Atualizar botão de modo escuro
    updateDarkModeButton() {
        const btn = document.querySelector('.btn-secondary');
        if (btn) {
            if (this.data.userSettings.darkMode) {
                btn.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
            } else {
                btn.innerHTML = '<i class="fas fa-moon"></i> Modo Escuro';
            }
        }
    },

    // Alternar modo escuro
    toggleDarkMode() {
        this.data.userSettings.darkMode = !this.data.userSettings.darkMode;
        document.body.classList.toggle('dark-mode', this.data.userSettings.darkMode);
        this.updateDarkModeButton();
        this.saveSettings();
        this.showNotification(`Modo ${this.data.userSettings.darkMode ? 'escuro' : 'claro'} ativado`, 'success');
    },

    // Exportar dados
    exportData() {
        const data = {
            disciplines: this.data.disciplines,
            studyHistory: this.data.studyHistory,
            questionHistory: this.data.questionHistory,
            userSettings: this.data.userSettings,
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `hugo-juiz-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
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

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    if (confirm('Isso substituirá todos os dados atuais. Continuar?')) {
                        this.data.disciplines = data.disciplines || [];
                        this.data.studyHistory = data.studyHistory || [];
                        this.data.questionHistory = data.questionHistory || [];
                        this.data.userSettings = { ...this.data.userSettings, ...(data.userSettings || {}) };
                        
                        await this.saveData();
                        this.renderInterface();
                        this.updateStatistics();
                        
                        this.showNotification('Dados importados com sucesso!', 'success');
                    }
                } catch (error) {
                    this.showNotification('Erro ao importar dados. Arquivo inválido.', 'error');
                    console.error('Erro na importação:', error);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    },

    // Resetar todo o progresso
    async resetAllProgress() {
        if (!confirm('Isso resetará TODO o seu progresso. Tem certeza?')) return;

        this.data.disciplines = this.getDefaultDisciplines();
        this.data.studyHistory = [];
        this.data.questionHistory = [];
        this.data.aiRecommendations = [];
        
        await this.saveData();
        this.renderInterface();
        this.updateStatistics();
        
        this.showNotification('Progresso resetado com sucesso!', 'success');
    },

    // Mostrar modal de confirmação
    showConfirmModal(title, message, confirmCallback) {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const btn = document.getElementById('confirm-action-btn');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        btn.onclick = () => {
            confirmCallback();
            this.closeConfirmModal();
        };
        
        modal.style.display = 'flex';
    },

    // Fechar modal
    closeModal() {
        document.getElementById('discipline-modal').style.display = 'none';
    },

    // Fechar modal de confirmação
    closeConfirmModal() {
        document.getElementById('confirm-modal').style.display = 'none';
    },

    // Mostrar notificação
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },

    // ===== FUNÇÕES DE SALVAMENTO =====

    async saveData() {
        await this.saveDisciplines();
        await this.saveHistory();
        await this.saveQuestionHistory();
        await this.saveSettings();
        await this.saveAIRecommendations();
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
    },

    async saveAIRecommendations() {
        localStorage.setItem('studyAI_aiRecommendations', JSON.stringify(this.data.aiRecommendations));
    },

    // ===== MELHORIAS HTML =====

    enhanceHTML() {
        this.addVersionBadge();
        this.addAIStyles();
    },

    addVersionBadge() {
        const logo = document.querySelector('.logo');
        if (logo && !logo.querySelector('.version-badge')) {
            const versionBadge = document.createElement('span');
            versionBadge.className = 'version-badge';
            versionBadge.textContent = 'v5.0';
            logo.appendChild(versionBadge);
        }
    },

    addAIStyles() {
        const existingStyles = document.querySelector('#ai-styles');
        if (existingStyles) return;

        const styles = `
            .version-badge {
                background: linear-gradient(45deg, #9c27b0, #673ab7);
                color: white;
                padding: 0.1rem 0.5rem;
                border-radius: 10px;
                font-size: 0.7rem;
                font-weight: bold;
                margin-left: 0.5rem;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .ai-recommendation {
                background: rgba(156, 39, 176, 0.1);
                border: 1px solid rgba(156, 39, 176, 0.2);
                border-radius: 8px;
                padding: 0.75rem;
                margin-top: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #9c27b0;
                font-size: 0.9rem;
                animation: slideIn 0.3s ease;
            }
            
            .confidence-badge {
                padding: 0.1rem 0.5rem;
                border-radius: 10px;
                font-size: 0.75rem;
                font-weight: 600;
                color: white;
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
            }
            
            .priority-badge-high {
                position: absolute;
                top: 10px;
                right: -25px;
                background: linear-gradient(45deg, #ff4081, #9c27b0);
                color: white;
                padding: 0.2rem 2rem;
                transform: rotate(45deg);
                font-size: 0.7rem;
                font-weight: bold;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                animation: priorityPulse 1.5s infinite;
            }
            
            @keyframes priorityPulse {
                0% { opacity: 0.8; }
                50% { opacity: 1; }
                100% { opacity: 0.8; }
            }
            
            .granular-analysis {
                background: var(--card-bg);
                border-radius: 8px;
                padding: 0.75rem;
                margin: 0.75rem 0;
                border: 1px solid var(--border-color);
            }
            
            .analysis-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.75rem;
                color: var(--text-secondary);
            }
            
            .analysis-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 0.5rem;
            }
            
            .stat-item {
                text-align: center;
                padding: 0.5rem;
                border-radius: 6px;
                background: var(--hover-bg);
            }
            
            .stat-number {
                font-size: 1.2rem;
                font-weight: bold;
                color: var(--primary);
            }
            
            .stat-label {
                font-size: 0.75rem;
                color: var(--text-secondary);
            }
            
            .stat-good {
                color: var(--success) !important;
            }
            
            .stat-warning {
                color: var(--warning) !important;
            }
            
            .fade-in {
                animation: fadeIn 0.5s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(-10px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .ai-modal .modal-content {
                max-width: 500px;
                max-height: 70vh;
                display: flex;
                flex-direction: column;
            }
            
            .ai-chat {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                min-height: 200px;
            }
            
            .ai-message {
                margin-bottom: 0.75rem;
                padding: 0.75rem;
                border-radius: 12px;
                max-width: 85%;
                word-wrap: break-word;
                white-space: pre-wrap;
            }
            
            .ai-message-user {
                background: var(--primary);
                color: white;
                margin-left: auto;
            }
            
            .ai-message-assistant {
                background: var(--hover-bg);
                color: var(--text-primary);
                border: 1px solid var(--border-color);
            }
            
            .ai-input {
                display: flex;
                gap: 0.5rem;
                padding: 1rem;
                border-top: 1px solid var(--border-color);
                background: var(--card-bg);
            }
            
            .ai-input input {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 1px solid var(--border-color);
                border-radius: 25px;
                background: var(--bg-color);
                color: var(--text-primary);
                outline: none;
            }
            
            .ai-input input:focus {
                border-color: var(--primary);
            }
            
            .weak-topic-card {
                background: var(--card-bg);
                border: 2px solid var(--warning);
                border-radius: 12px;
                padding: 1.25rem;
                margin-bottom: 1rem;
                animation: slideIn 0.3s ease;
            }
            
            .weak-topic-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .topic-discipline {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
            }
            
            .weight-badge {
                background: var(--primary);
                color: white;
                padding: 0.1rem 0.5rem;
                border-radius: 10px;
                font-size: 0.75rem;
            }
            
            .priority-badge {
                background: var(--warning);
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .topic-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin: 1rem 0;
            }
            
            .stat {
                text-align: center;
                padding: 0.75rem;
                border-radius: 8px;
                background: var(--hover-bg);
            }
            
            .stat-label {
                display: block;
                font-size: 0.8rem;
                color: var(--text-secondary);
                margin-bottom: 0.25rem;
            }
            
            .stat-value {
                font-size: 1.1rem;
                font-weight: bold;
            }
            
            .ai-plan-container {
                background: var(--card-bg);
                border-radius: 12px;
                padding: 1.5rem;
            }
            
            .ai-plan-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .ai-plan-stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }
            
            .stat-card {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                border-radius: 10px;
                background: var(--hover-bg);
            }
            
            .stat-icon {
                font-size: 1.5rem;
                color: var(--primary);
            }
            
            .stat-content {
                flex: 1;
            }
            
            .ai-plan-recommendations {
                margin-bottom: 2rem;
            }
            
            .recommendation {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                margin-bottom: 1rem;
                border-radius: 10px;
                background: var(--hover-bg);
            }
            
            .recommendation.critical {
                border-left: 4px solid var(--error);
            }
            
            .recommendation.consistency {
                border-left: 4px solid var(--warning);
            }
            
            .recommendation.good {
                border-left: 4px solid var(--success);
            }
            
            .recommendation-content {
                flex: 1;
            }
            
            .ai-plan-focus {
                background: rgba(156, 39, 176, 0.1);
                border-radius: 10px;
                padding: 1.5rem;
            }
            
            .focus-items {
                display: grid;
                gap: 1rem;
            }
            
            .focus-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: var(--card-bg);
                border-radius: 8px;
            }
            
            .focus-rank {
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--primary);
                color: white;
                border-radius: 50%;
                font-weight: bold;
            }
            
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                color: white;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                max-width: 350px;
                z-index: 1000;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .notification-success {
                background: linear-gradient(135deg, #4caf50, #2e7d32);
            }
            
            .notification-error {
                background: linear-gradient(135deg, #f44336, #c62828);
            }
            
            .notification-warning {
                background: linear-gradient(135deg, #ff9800, #ef6c00);
            }
            
            .notification-info {
                background: linear-gradient(135deg, #2196f3, #1565c0);
            }
            
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .notification button:hover {
                opacity: 1;
            }
            
            .dark-mode .ai-recommendation {
                background: rgba(156, 39, 176, 0.2);
                border-color: rgba(156, 39, 176, 0.3);
            }
            
            .dark-mode .ai-message-assistant {
                background: var(--card-bg);
                border-color: var(--border-color);
            }
            
            .dark-mode .weak-topic-card {
                background: var(--card-bg);
                border-color: var(--warning);
            }
            
            .dark-mode .ai-plan-focus {
                background: rgba(156, 39, 176, 0.15);
            }
        `;

        const style = document.createElement('style');
        style.id = 'ai-styles';
        style.textContent = styles;
        document.head.appendChild(style);
    }
};

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', () => {
    StudySystem.initialize();
});

// ===== FUNÇÕES GLOBAIS (para chamadas do HTML) =====

function showTab(tabName) { StudySystem.showTab(tabName); }
function sortDisciplines() { 
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) StudySystem.config.sortBy = sortSelect.value;
    StudySystem.renderInterface();
}
function toggleDarkMode() { StudySystem.toggleDarkMode(); }
function closeModal() { StudySystem.closeModal(); }
function closeConfirmModal() { StudySystem.closeConfirmModal(); }
function exportData() { StudySystem.exportData(); }
function importData() { StudySystem.importData(); }
function resetAllProgress() { StudySystem.resetAllProgress(); }
function prevPage() { StudySystem.prevPage(); }
function nextPage() { StudySystem.nextPage(); }

// Função global para o botão de modo escuro do HTML
function toggleDarkMode() {
    StudySystem.toggleDarkMode();
}
// ===== FUNÇÕES PARA O GUIA DE PERGUNTAS =====

// Alternar visibilidade do guia
function toggleGuide() {
    const guideContent = document.getElementById('guide-content');
    const toggleBtn = document.querySelector('.guide-toggle i');
    
    guideContent.classList.toggle('collapsed');
    
    if (guideContent.classList.contains('collapsed')) {
        toggleBtn.classList.remove('fa-chevron-up');
        toggleBtn.classList.add('fa-chevron-down');
    } else {
        toggleBtn.classList.remove('fa-chevron-down');
        toggleBtn.classList.add('fa-chevron-up');
    }
}

// Usar pergunta do guia
function useQuestion(element) {
    const question = element.textContent;
    StudySystem.openAIAssistant();
    
    // Aguardar o modal abrir
    setTimeout(() => {
        const aiInput = document.getElementById('ai-message');
        if (aiInput) {
            aiInput.value = question;
            aiInput.focus();
        }
    }, 300);
}

// Usar exemplo prático
function useExample(element) {
    const exampleText = element.querySelector('p').textContent;
    StudySystem.openAIAssistant();
    
    // Remover aspas se houver
    const question = exampleText.replace(/^"|"$/g, '');
    
    // Aguardar o modal abrir
    setTimeout(() => {
        const aiInput = document.getElementById('ai-message');
        if (aiInput) {
            aiInput.value = question;
            aiInput.focus();
        }
    }, 300);
}

// Adicionar evento para abrir guia colapsado por padrão em telas pequenas
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth < 768) {
        const guideContent = document.getElementById('guide-content');
        const toggleBtn = document.querySelector('.guide-toggle i');
        
        if (guideContent && toggleBtn) {
            guideContent.classList.add('collapsed');
            toggleBtn.classList.remove('fa-chevron-up');
            toggleBtn.classList.add('fa-chevron-down');
        }
    }
});
