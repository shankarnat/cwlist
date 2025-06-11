// Content Lens Manager Application
let lenses = [];
let pendingLenses = [];
let selectedIds = {};
let nextId = 4;

// Sample data with proper timestamps
const initialData = [
    {
        id: 'L-00001',
        name: 'Marketing Lens',
        status: 'Published',
        desc: 'Marketing content analysis',
        lastRefreshed: new Date(Date.now() - 3600000).toLocaleString() // 1 hour ago
    },
    {
        id: 'L-00002',
        name: 'HR Lens',
        status: 'Draft',
        desc: 'HR documentation review',
        lastRefreshed: new Date(Date.now() - 172800000).toLocaleString() // 2 days ago
    },
    {
        id: 'L-00003',
        name: 'Finance Lens',
        status: 'Published',
        desc: 'Financial data insights',
        lastRefreshed: new Date().toLocaleString() // Now
    }
];

// API base URL - will work both locally and on Heroku
const API_BASE = window.location.origin + '/api';

// Initialize the application
async function init() {
    // Load initial data immediately for demo purposes
    loadInitialData();
    
    document.getElementById('searchInput').addEventListener('input', renderTable);
    
    // Check if we're in an iframe and send ready message
    if (window.parent !== window) {
        window.parent.postMessage({ type: 'contentLensReady' }, '*');
    }
}

// Update record count
function updateRecordCount() {
    const totalCount = lenses.length;
    const recordCountElement = document.querySelector('.record-count');
    if (recordCountElement) {
        recordCountElement.textContent = `${totalCount} items • Updated a few seconds ago`;
    }
}

// Load lenses from API
async function loadLenses() {
    try {
        const response = await fetch(`${API_BASE}/lenses`);
        if (!response.ok) throw new Error('Failed to load lenses');
        
        const data = await response.json();
        lenses = data.map(lens => ({
            id: lens.id,
            name: lens.name,
            status: lens.status,
            desc: lens.description,
            lastRefreshed: new Date(lens.lastRefreshed).toLocaleString()
        }));
        
        renderTable();
    } catch (error) {
        console.error('Error loading lenses:', error);
        // Use initial sample data as fallback
        loadInitialData();
    }
}

function loadInitialData() {
    lenses = [...initialData];
    renderTable();
    updateRecordCount();
}

// Render the table
function renderTable() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filtered = lenses.filter(lens => 
        lens.id.toLowerCase().includes(search) || 
        lens.name.toLowerCase().includes(search) || 
        lens.status.toLowerCase().includes(search)
    );
    
    const tbody = document.getElementById('tableBody');
    const noData = document.getElementById('noData');
    tbody.innerHTML = '';
    
    if (filtered.length === 0) {
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    filtered.forEach((lens, index) => {
        const isSelected = selectedIds[lens.id];
        const tr = document.createElement('tr');
        if (isSelected) {
            tr.classList.add('selected-row');
        }
        
        tr.innerHTML = `
            <td class="table-cell-checkbox">
                <div class="checkbox-wrapper">
                    <input type="checkbox" class="checkbox" id="chk${lens.id}" ${isSelected ? 'checked' : ''} onchange="toggleSelect('${lens.id}')" />
                    <label for="chk${lens.id}" class="checkbox-label"></label>
                </div>
            </td>
            <td class="table-cell-actions">
                <div class="action-menu">
                    <button class="action-button" title="More actions">
                        <svg viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                </div>
            </td>
            <td><a href="javascript:void(0)" class="lens-link" onclick="openLens('${lens.name}')">${lens.name}</a></td>
            <td>${lens.id}</td>
            <td>
                <span class="status-badge ${lens.status === 'Published' ? 'status-published' : 'status-draft'}">${lens.status}</span>
            </td>
            <td>${lens.lastRefreshed}</td>
            <td class="table-cell-actions"></td>
        `;
        tbody.appendChild(tr);
    });
    
    updateCloneButton();
    updateSelectAllCheckbox();
}

// Toggle select all checkboxes
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    selectedIds = {};
    
    if (selectAll) {
        // Select all visible lenses
        const search = document.getElementById('searchInput').value.toLowerCase();
        const filtered = lenses.filter(lens => 
            lens.id.toLowerCase().includes(search) || 
            lens.name.toLowerCase().includes(search) || 
            lens.status.toLowerCase().includes(search)
        );
        
        filtered.forEach(lens => {
            selectedIds[lens.id] = true;
        });
    }
    
    renderTable(); // Re-render to update checkbox states
}

// Toggle individual selection
function toggleSelect(id) {
    if (selectedIds[id]) {
        delete selectedIds[id];
    } else {
        selectedIds[id] = true;
    }
    updateCloneButton();
    updateSelectAllCheckbox();
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filtered = lenses.filter(lens => 
        lens.id.toLowerCase().includes(search) || 
        lens.name.toLowerCase().includes(search) || 
        lens.status.toLowerCase().includes(search)
    );
    
    const selectedCount = filtered.filter(lens => selectedIds[lens.id]).length;
    
    if (selectedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedCount === filtered.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

// Update clone button state
function updateCloneButton() {
    const count = Object.keys(selectedIds).length;
    const floatingActions = document.getElementById('floatingActions');
    
    if (count > 0) {
        floatingActions.style.display = 'flex';
        floatingActions.querySelector('.selected-count').textContent = `${count} selected`;
    } else {
        floatingActions.style.display = 'none';
    }
}

// Show new lens modal
function showNewModal() {
    document.getElementById('newModal').style.display = 'block';
}

// Hide new lens modal
function hideNewModal() {
    document.getElementById('newModal').style.display = 'none';
    document.getElementById('lensName').value = '';
    document.getElementById('lensDesc').value = '';
    document.getElementById('nameError').style.display = 'none';
}

// Generate next sequential ID
function generateNextId() {
    const id = `L-${String(nextId).padStart(5, '0')}`;
    nextId++;
    return id;
}

// Save new lens
async function saveLens() {
    const name = document.getElementById('lensName').value.trim();
    if (!name) {
        document.getElementById('nameError').style.display = 'block';
        return;
    }
    
    const description = document.getElementById('lensDesc').value;
    const status = document.getElementById('lensStatus').value;
    
    // Create new lens with sequential ID
    const newLens = {
        id: generateNextId(),
        name: name,
        status: status,
        desc: description,
        lastRefreshed: new Date().toLocaleString()
    };
    
    // Add to pending lenses (not visible until refresh)
    pendingLenses.push(newLens);
    updatePendingBadge();
    hideNewModal();
    
    // Show success message
    showSuccessMessage(`"${name}" created successfully. Click Refresh to see it in the list.`);
}

// Clone selected lenses
function cloneLenses() {
    const lensIds = Object.keys(selectedIds);
    
    if (lensIds.length === 0) {
        return;
    }
    
    // Create clones of selected lenses
    lensIds.forEach(id => {
        const originalLens = lenses.find(lens => lens.id === id);
        if (originalLens) {
            const clonedLens = {
                id: generateNextId(),
                name: `${originalLens.name} (Copy)`,
                status: originalLens.status,
                desc: originalLens.desc,
                lastRefreshed: new Date().toLocaleString()
            };
            pendingLenses.push(clonedLens);
        }
    });
    
    // Clear selection and update UI
    selectedIds = {};
    updatePendingBadge();
    renderTable();
    
    // Show success message
    const count = lensIds.length;
    showSuccessMessage(`${count} lens${count > 1 ? 'es' : ''} cloned successfully. Click Refresh to see them in the list.`);
}

// Refresh lenses - add all pending items to the main list
function refreshLenses() {
    if (pendingLenses.length > 0) {
        const count = pendingLenses.length;
        lenses = lenses.concat(pendingLenses);
        pendingLenses = [];
        updatePendingBadge();
        renderTable();
        updateRecordCount();
        
        // Show success message
        showSuccessMessage(`${count} new item${count > 1 ? 's' : ''} added to the list.`);
    }
}

// Update pending badge
function updatePendingBadge() {
    const badge = document.getElementById('pendingBadge');
    if (pendingLenses.length > 0) {
        badge.textContent = pendingLenses.length;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Open lens
function openLens(name) {
    document.getElementById('loadingModal').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('loadingModal').style.display = 'none';
        
        // Send message to parent if in iframe
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'openLens',
                lensName: name
            }, '*');
        } else {
            // Navigate directly if not in iframe
            window.location.href = `/lens/${encodeURIComponent(name)}`;
        }
    }, 2000);
}

// Show success message
function showSuccessMessage(message) {
    // Create a temporary success toast
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4bca81;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.style.opacity = '1', 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Show error message
function showError(message) {
    // Create a temporary error toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff5d64;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.style.opacity = '1', 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Listen for messages from parent window
window.addEventListener('message', (event) => {
    // Validate origin if needed
    if (event.data.type === 'refreshLenses') {
        loadLenses();
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}