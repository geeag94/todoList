// Todo List Application with Post-it Style
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.currentColor = 'yellow';
        this.currentFont = 'noto';
        this.storageKey = 'todo-list-data';
        this.fontStorageKey = 'postit-font';
        
        this.init();
    }
    
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadFromStorage();
        this.loadFontPreference();
        this.render();
    }
    
    cacheDOM() {
        this.todoInput = document.getElementById('todo-input');
        this.todoDate = document.getElementById('todo-date');
        this.addBtn = document.getElementById('add-btn');
        this.todoList = document.getElementById('todo-list');
        this.emptyMessage = document.getElementById('empty-message');
        this.totalCount = document.getElementById('total-count');
        this.completedCount = document.getElementById('completed-count');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.colorBtns = document.querySelectorAll('.color-btn');
        this.fontSelect = document.getElementById('font-select');
    }
    
    bindEvents() {
        // Add todo
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Color picker buttons - event delegation for better reliability
        const colorOptions = document.querySelector('.color-options');
        if (colorOptions) {
            colorOptions.addEventListener('click', (e) => {
                const btn = e.target.closest('.color-btn');
                if (btn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const color = btn.dataset.color;
                    console.log('Color selected:', color);
                    this.setColor(color);
                }
            });
        }
        
        // Font selector
        if (this.fontSelect) {
            this.fontSelect.addEventListener('change', (e) => {
                this.setFont(e.target.value);
            });
        }
    }
    
    loadFontPreference() {
        try {
            const savedFont = localStorage.getItem(this.fontStorageKey);
            if (savedFont) {
                this.currentFont = savedFont;
                this.applyFont(savedFont);
                if (this.fontSelect) {
                    this.fontSelect.value = savedFont;
                }
            }
        } catch (e) {
            console.error('Failed to load font preference:', e);
        }
    }
    
    setFont(font) {
        console.log('Setting font to:', font);
        if (!font) return;
        
        this.currentFont = font;
        this.applyFont(font);
        
        // Save to localStorage
        try {
            localStorage.setItem(this.fontStorageKey, font);
        } catch (e) {
            console.error('Failed to save font preference:', e);
        }
    }
    
    applyFont(font) {
        const body = document.body;
        
        // Remove all font classes
        body.classList.remove('font-noto', 'font-pretendard', 'font-jua', 'font-handwriting');
        
        // Add selected font class
        body.classList.add(`font-${font}`);
        
        console.log('Applied font class:', `font-${font}`);
    }
    
    setColor(color) {
        console.log('Setting color to:', color);
        if (!color) return;
        
        this.currentColor = color;
        
        // Update active button - remove active from all, add to selected
        this.colorBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.color === color) {
                btn.classList.add('active');
            }
        });
        
        // Update input section background to match selected color
        const inputSection = document.querySelector('.input-section');
        if (inputSection) {
            const colorMap = {
                'red': 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
                'orange': 'linear-gradient(135deg, #ffa502 0%, #ffc048 100%)',
                'yellow': 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
                'green': 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)',
                'blue': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                'indigo': 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
                'purple': 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)'
            };
            inputSection.style.background = colorMap[color] || colorMap['yellow'];
        }
        
        console.log('Current color is now:', this.currentColor);
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.todos = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load from storage:', e);
            this.todos = [];
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
        } catch (e) {
            console.error('Failed to save to storage:', e);
        }
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    setColor(color) {
        this.currentColor = color;
        
        // Update active button
        this.colorBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        const dueDate = this.todoDate.value;
        
        if (!text) {
            this.todoInput.focus();
            return;
        }
        
        const todo = {
            id: this.generateId(),
            text: text,
            dueDate: dueDate,
            color: this.currentColor,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.saveToStorage();
        this.todoInput.value = '';
        this.todoDate.value = '';
        this.todoInput.focus();
        this.render();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToStorage();
        this.render();
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }
    
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }
    
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        
        this.totalCount.textContent = `총 ${total}개`;
        this.completedCount.textContent = `완료 ${completed}개`;
    }
    
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Show/hide empty message
        this.emptyMessage.classList.toggle('hidden', filteredTodos.length > 0);
        
        // Clear list
        this.todoList.innerHTML = '';
        
        // Render todos
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            const colorClass = todo.color || 'yellow';
            li.className = `todo-item ${colorClass} ${todo.completed ? 'completed' : ''}`;
            
            const dateHtml = todo.dueDate ? this.formatDate(todo.dueDate) : '';
            const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date().setHours(0,0,0,0);
            
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-content">
                    <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                    ${dateHtml ? `<span class="todo-date ${isOverdue ? 'overdue' : ''}">${dateHtml}</span>` : ''}
                </div>
                <button class="delete-btn">×</button>
            `;
            
            // Bind events
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
            
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
            
            this.todoList.appendChild(li);
        });
        
        this.updateStats();
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Reset time for comparison
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        
        if (dateOnly.getTime() === todayOnly.getTime()) {
            return '📅 오늘까지';
        } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
            return '📅 내일까지';
        } else {
            return '📅 ' + date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + '까지';
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
