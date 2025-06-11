// Content Lens Manager Application
let lenses = [];
let pendingLenses = [];
let selectedIds = {};
let nextId = 4;

// API base URL - will work both locally and on Heroku
const API_BASE = window.location.origin + '/api';

// Initialize the application
async function init() {
    await loadLenses();
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
        // Show error message to user
        showError('Failed to load lenses. Please try again.');
    }
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
    
    filtered.forEach((lens) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="table-cell-checkbox">
                <div class="checkbox-wrapper">
                    <input type="checkbox" class="checkbox" id="chk${lens.id}" onchange="toggleSelect('${lens.id}')" />
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
}

// Toggle select all checkboxes
function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    const checkboxes = document.querySelectorAll('#tableBody input[type="checkbox"]');
    selectedIds = {};
    
    checkboxes.forEach(cb => {
        cb.checked = selectAll;
        const id = cb.id.replace('chk', '');
        if (selectAll) selectedIds[id] = true;
    });
    
    updateCloneButton();
}

// Toggle individual selection
function toggleSelect(id) {
    const cb = document.getElementById('chk' + id);
    if (cb.checked) {
        selectedIds[id] = true;
    } else {
        delete selectedIds[id];
    }
    updateCloneButton();
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
    
    // Update record count
    updateRecordCount();
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

// Save new lens
async function saveLens() {
    const name = document.getElementById('lensName').value.trim();
    if (!name) {
        document.getElementById('nameError').style.display = 'block';
        return;
    }
    
    const description = document.getElementById('lensDesc').value;
    const status = document.getElementById('lensStatus').value;
    
    try {
        const response = await fetch(`${API_BASE}/lenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, status })
        });
        
        if (!response.ok) throw new Error('Failed to save lens');
        
        const newLens = await response.json();
        pendingLenses.push({
            id: newLens.id,
            name: newLens.name,
            status: newLens.status,
            desc: newLens.description,
            lastRefreshed: new Date(newLens.lastRefreshed).toLocaleString()
        });
        
        updatePendingBadge();
        hideNewModal();
    } catch (error) {
        console.error('Error saving lens:', error);
        showError('Failed to save lens. Please try again.');
    }
}

// Clone selected lenses
async function cloneLenses() {
    const lensIds = Object.keys(selectedIds);
    
    try {
        const response = await fetch(`${API_BASE}/lenses/clone`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ lensIds })
        });
        
        if (!response.ok) throw new Error('Failed to clone lenses');
        
        const clonedLenses = await response.json();
        clonedLenses.forEach(lens => {
            pendingLenses.push({
                id: lens.id,
                name: lens.name,
                status: lens.status,
                desc: lens.description,
                lastRefreshed: new Date(lens.lastRefreshed).toLocaleString()
            });
        });
        
        selectedIds = {};
        updatePendingBadge();
        renderTable();
    } catch (error) {
        console.error('Error cloning lenses:', error);
        showError('Failed to clone lenses. Please try again.');
    }
}

// Refresh lenses
function refreshLenses() {
    if (pendingLenses.length > 0) {
        lenses = lenses.concat(pendingLenses);
        pendingLenses = [];
        updatePendingBadge();
        renderTable();
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

// Show error message
function showError(message) {
    // You can implement a toast notification here
    alert(message);
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