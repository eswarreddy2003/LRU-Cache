class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
        this.lastAccessed = Date.now();
    }
}

class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.head = new Node(-1, -1);
        this.tail = new Node(-1, -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
    }

    get(key) {
        if (this.map.has(key)) {
            const node = this.map.get(key);
            this._remove(node);
            this._insert(node);
            node.lastAccessed = Date.now();
            this.hits++;
            this._logAction(`GET: Key ${key} found with value ${node.value}`, 'get');
            this._updateUI();
            return node.value;
        } else {
            this.misses++;
            this._logAction(`GET: Key ${key} not found`, 'get');
            this._updateUI();
            return -1;
        }
    }

    put(key, value) {
        if (this.map.has(key)) {
            this._remove(this.map.get(key));
            this._logAction(`PUT: Updated key ${key} to value ${value}`, 'put');
        } else {
            this._logAction(`PUT: Added new key ${key} with value ${value}`, 'put');
        }

        if (this.map.size >= this.capacity) {
            const lruNode = this.tail.prev;
            this._remove(lruNode);
            this.evictions++;
            this._logAction(`EVICT: Removed LRU key ${lruNode.key}`, 'evict');
        }

        const newNode = new Node(key, value);
        this._insert(newNode);
        this._updateUI();
    }

    clear() {
        this.map.clear();
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
        this._logAction('CACHE: Cleared all items', 'init');
        this._updateUI();
    }

    _insert(node) {
        this.map.set(node.key, node);
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }

    _remove(node) {
        this.map.delete(node.key);
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    _updateUI() {
        const cacheContainer = document.getElementById('cacheContainer');
        cacheContainer.innerHTML = '';

        // Update metadata displays
        document.getElementById('capacityDisplay').textContent = `Capacity: ${this.capacity}`;
        document.getElementById('sizeDisplay').textContent = `Items: ${this.map.size}`;
        
        const totalAccesses = this.hits + this.misses;
        const hitRate = totalAccesses > 0 ? Math.round((this.hits / totalAccesses) * 100) : 0;
        document.getElementById('hitRateDisplay').textContent = `Hit Rate: ${hitRate}%`;

        // Create cache item elements
        let current = this.head.next;
        while (current !== this.tail) {
            const cacheItem = document.createElement('div');
            cacheItem.className = 'cache-item';
            
            // Highlight recently accessed items
            const timeSinceAccess = Date.now() - current.lastAccessed;
            if (timeSinceAccess < 2000) {
                cacheItem.classList.add('recently-accessed');
            }

            const keyElement = document.createElement('span');
            keyElement.className = 'key';
            keyElement.textContent = current.key;

            const valueElement = document.createElement('span');
            valueElement.className = 'value';
            valueElement.textContent = current.value;

            cacheItem.appendChild(keyElement);
            cacheItem.appendChild(valueElement);
            cacheContainer.appendChild(cacheItem);

            current = current.next;
        }
    }

    _logAction(message, type) {
        const actionLog = document.getElementById('actionLog');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        actionLog.prepend(logEntry);
        
        // Limit log to 50 entries
        if (actionLog.children.length > 50) {
            actionLog.removeChild(actionLog.lastChild);
        }
    }
}

let cache = null;

function initializeCache() {
    const sizeInput = document.getElementById('cacheSize');
    const size = parseInt(sizeInput.value);
    
    if (isNaN(size) || size < 1 || size > 10) {
        showToast('Please enter a valid cache size (1-10)', 'error');
        sizeInput.focus();
        return;
    }
    
    cache = new LRUCache(size);
    cache._logAction(`INIT: Cache initialized with capacity ${size}`, 'init');
    cache._updateUI();
    showToast(`Cache initialized with capacity ${size}`, 'success');
}

function put() {
    if (!cache) {
        showToast('Please initialize the cache first', 'error');
        return;
    }
    
    const keyInput = document.getElementById('keyInput');
    const valueInput = document.getElementById('valueInput');
    const key = parseInt(keyInput.value);
    const value = parseInt(valueInput.value);
    
    if (isNaN(key)) {
        showToast('Please enter a valid key', 'error');
        keyInput.focus();
        return;
    }
    
    if (isNaN(value)) {
        showToast('Please enter a valid value', 'error');
        valueInput.focus();
        return;
    }
    
    cache.put(key, value);
    keyInput.value = '';
    valueInput.value = '';
    keyInput.focus();
}

function get() {
    if (!cache) {
        showToast('Please initialize the cache first', 'error');
        return;
    }
    
    const keyInput = document.getElementById('keyInput');
    const key = parseInt(keyInput.value);
    
    if (isNaN(key)) {
        showToast('Please enter a valid key', 'error');
        keyInput.focus();
        return;
    }
    
    const value = cache.get(key);
    if (value !== -1) {
        showToast(`Retrieved value: ${value} for key: ${key}`, 'success');
    }
    keyInput.value = '';
    keyInput.focus();
}

function clearCache() {
    if (!cache) {
        showToast('Cache not initialized', 'error');
        return;
    }
    
    cache.clear();
    showToast('Cache cleared', 'info');
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Accordion functionality
document.addEventListener('DOMContentLoaded', () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.fa-chevron-down');
            
            content.classList.toggle('active');
            icon.classList.toggle('rotate');
            
            if (content.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0';
            }
        });
    });
});

// Add toast styles dynamically
const toastStyles = document.createElement('style');
toastStyles.textContent = `
.toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1000;
}

.toast.show {
    opacity: 1;
}

.toast-success {
    background-color: var(--success);
}

.toast-error {
    background-color: var(--danger);
}

.toast-info {
    background-color: var(--accent);
}

.fa-chevron-down.rotate {
    transform: rotate(180deg);
}
`;
document.head.appendChild(toastStyles);