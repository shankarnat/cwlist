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
    
    // Add event listener to New button as backup
    const newButton = document.getElementById('newButton');
    if (newButton) {
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('New button clicked via event listener');
            showNewModal();
        });
    }
    
    // Add event listener to Save button as backup
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Save button clicked via event listener');
            saveLens();
        });
    }
    
    // Add event listener to header Clone button as backup
    const headerCloneBtn = document.getElementById('headerCloneBtn');
    if (headerCloneBtn) {
        headerCloneBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Header clone button clicked via event listener');
            showCloneModal();
        });
    }
    
    // Add ESC key listener for modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const newModal = document.getElementById('newModal');
            const loadingModal = document.getElementById('loadingModal');
            
            if (newModal && newModal.style.display === 'block') {
                hideNewModal();
            } else if (loadingModal && loadingModal.style.display === 'block') {
                hideLoadingModal();
            }
        }
    });
    
    // Check if floating actions element exists
    const floatingActions = document.getElementById('floatingActions');
    console.log('Floating actions element found:', !!floatingActions);
    
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
    updatePendingBadge();
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
    console.log('toggleSelect called with id:', id);
    if (selectedIds[id]) {
        delete selectedIds[id];
        console.log('Deselected:', id);
    } else {
        selectedIds[id] = true;
        console.log('Selected:', id);
    }
    console.log('Current selectedIds:', selectedIds);
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
    const headerCloneBtn = document.getElementById('headerCloneBtn');
    
    console.log('updateCloneButton called, count:', count, 'selectedIds:', selectedIds);
    
    // Update floating actions (bottom clone button)
    if (floatingActions) {
        if (count > 0) {
            floatingActions.style.display = 'flex';
            const selectedCountSpan = floatingActions.querySelector('.selected-count');
            if (selectedCountSpan) {
                selectedCountSpan.textContent = `${count} selected`;
            }
            console.log('Showing floating actions');
        } else {
            floatingActions.style.display = 'none';
            console.log('Hiding floating actions');
        }
    } else {
        console.error('floatingActions element not found');
    }
    
    // Update header clone button
    if (headerCloneBtn) {
        headerCloneBtn.disabled = count === 0;
        console.log('Header clone button disabled:', count === 0);
    } else {
        console.error('headerCloneBtn element not found');
    }
}

// Show new lens modal
function showNewModal() {
    console.log('showNewModal function called');
    const modal = document.getElementById('newModal');
    console.log('Modal element:', modal);
    
    if (modal) {
        console.log('Setting modal display to block');
        modal.style.display = 'block';
        
        // Also ensure the modal is visible by removing any conflicting styles
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        
        // Set default modal title and button text for new lens
        const modalTitle = document.querySelector('.modal-header__title');
        const saveButton = document.getElementById('saveButton');
        
        if (modalTitle) {
            modalTitle.textContent = 'New Content Lens';
        } else {
            console.error('Modal title element not found');
        }
        
        if (saveButton) {
            saveButton.textContent = 'Save';
            console.log('Save button found and text set to Save');
        } else {
            console.error('Save button element not found');
        }
        
        // Focus on the first input field and verify form elements
        setTimeout(() => {
            const nameInput = document.getElementById('lensName');
            const descInput = document.getElementById('lensDesc');
            const statusSelect = document.getElementById('lensStatus');
            
            console.log('Form elements check:', {
                nameInput: !!nameInput,
                descInput: !!descInput,
                statusSelect: !!statusSelect
            });
            
            if (nameInput) {
                nameInput.focus();
            } else {
                console.error('lensName input not found');
            }
        }, 100);
    } else {
        console.error('Modal element with id "newModal" not found');
    }
}

// Hide new lens modal
function hideNewModal() {
    const modal = document.getElementById('newModal');
    modal.style.display = 'none';
    
    // Clear form fields
    document.getElementById('lensName').value = '';
    document.getElementById('lensDesc').value = '';
    document.getElementById('lensStatus').value = 'Draft';
    document.getElementById('nameError').style.display = 'none';
    
    // Update modal title back to default
    document.querySelector('.modal-header__title').textContent = 'New Content Lens';
    document.getElementById('saveButton').textContent = 'Save';
    
    // Clear clone data if it exists
    if (window.cloneData) {
        window.cloneData = null;
        console.log('Clone data cleared');
    }
}

// Generate next sequential ID
function generateNextId() {
    const id = `L-${String(nextId).padStart(5, '0')}`;
    nextId++;
    return id;
}

// Save new lens or clone
async function saveLens() {
    console.log('saveLens function called');
    
    const nameElement = document.getElementById('lensName');
    const descElement = document.getElementById('lensDesc');
    const statusElement = document.getElementById('lensStatus');
    
    console.log('Form elements found:', {
        name: !!nameElement,
        desc: !!descElement,
        status: !!statusElement
    });
    
    if (!nameElement || !descElement || !statusElement) {
        console.error('One or more form elements not found');
        showError('Form elements not found. Please try again.');
        return;
    }
    
    const name = nameElement.value.trim();
    console.log('Lens name entered:', name);
    
    if (!name) {
        console.log('Name validation failed');
        document.getElementById('nameError').style.display = 'block';
        return;
    }
    
    const description = descElement.value;
    const userSelectedStatus = statusElement.value;
    
    console.log('Form data:', { name, description, userSelectedStatus });
    
    // Check if this is a clone operation
    if (window.cloneData) {
        console.log('Clone operation detected:', window.cloneData);
        handleCloneOperation(name, description, userSelectedStatus);
    } else {
        console.log('New lens operation');
        handleNewLensOperation(name, description, userSelectedStatus);
    }
}

// Handle new lens creation
function handleNewLensOperation(name, description, userSelectedStatus) {
    // Create new lens with sequential ID - always start with Draft
    const newLens = {
        id: generateNextId(),
        name: name,
        status: 'Draft', // Always start with Draft when saved
        originalStatus: userSelectedStatus, // Store the user's intended status
        desc: description,
        lastRefreshed: new Date().toLocaleString()
    };
    
    console.log('New lens created:', newLens);
    
    // Add directly to main lenses array (immediately visible)
    lenses.push(newLens);
    console.log('Lens added to array. Total lenses:', lenses.length);
    
    renderTable();
    updateRecordCount();
    hideNewModal();
    
    // Show success message
    showSuccessMessage(`"${name}" created with Draft status. Click Refresh to publish it.`);
}

// Handle clone operation
function handleCloneOperation(name, description, userSelectedStatus) {
    const { totalCount, allSelectedIds } = window.cloneData;
    
    if (totalCount === 1) {
        // Single clone with custom name
        const clonedLens = {
            id: generateNextId(),
            name: name,
            status: 'Draft', // Always start with Draft
            originalStatus: userSelectedStatus, // Store user's intended status
            desc: description,
            lastRefreshed: new Date().toLocaleString()
        };
        
        lenses.push(clonedLens);
        console.log('Single lens cloned with custom name:', clonedLens);
        
        showSuccessMessage(`"${name}" cloned with Draft status. Click Refresh to publish it.`);
    } else {
        // Multiple clones - use the entered name as base for all
        allSelectedIds.forEach((id, index) => {
            const originalLens = lenses.find(lens => lens.id === id);
            if (originalLens) {
                const cloneName = totalCount > 1 ? `${name} ${index + 1}` : name;
                const clonedLens = {
                    id: generateNextId(),
                    name: cloneName,
                    status: 'Draft', // Always start with Draft
                    originalStatus: userSelectedStatus, // Store user's intended status
                    desc: description,
                    lastRefreshed: new Date().toLocaleString()
                };
                
                lenses.push(clonedLens);
            }
        });
        
        console.log(`${totalCount} lenses cloned with base name: ${name}`);
        showSuccessMessage(`${totalCount} lenses cloned with Draft status. Click Refresh to publish them.`);
    }
    
    // Clear clone data and selection
    window.cloneData = null;
    selectedIds = {};
    
    renderTable();
    updateRecordCount();
    hideNewModal();
}

// Show clone modal for selected lenses (header button version)
function showCloneModal() {
    const lensIds = Object.keys(selectedIds);
    
    if (lensIds.length === 0) {
        showError('Please select at least one lens to clone.');
        return;
    }
    
    // Always open modal for header clone button, regardless of count
    if (lensIds.length === 1) {
        // Single lens - open modal with prefilled data
        const lensId = lensIds[0];
        const originalLens = lenses.find(lens => lens.id === lensId);
        
        if (originalLens) {
            openCloneModalForLens(originalLens);
        }
    } else {
        // Multiple lenses - show modal for first lens as template
        const firstLensId = lensIds[0];
        const firstLens = lenses.find(lens => lens.id === firstLensId);
        
        if (firstLens) {
            // Update modal title to indicate multiple clones
            openCloneModalForLens(firstLens, lensIds.length);
        }
    }
}

// Open clone modal for a specific lens
function openCloneModalForLens(originalLens, totalCount = 1) {
    // Clear form first
    document.getElementById('lensName').value = '';
    document.getElementById('lensDesc').value = '';
    document.getElementById('lensStatus').value = 'Draft';
    document.getElementById('nameError').style.display = 'none';
    
    // Update modal title and button text
    const modalTitle = totalCount > 1 ? `Clone ${totalCount} Content Lenses` : 'Clone Content Lens';
    document.querySelector('.modal-header__title').textContent = modalTitle;
    document.getElementById('saveButton').textContent = 'Clone';
    
    // Store the original lens data and count for the save function
    window.cloneData = {
        originalLens: originalLens,
        totalCount: totalCount,
        allSelectedIds: Object.keys(selectedIds)
    };
    
    // Show modal first
    const modal = document.getElementById('newModal');
    modal.style.display = 'block';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';
    
    // Then prefill form with original data
    setTimeout(() => {
        const baseName = totalCount > 1 ? 'Multiple Lenses' : originalLens.name;
        document.getElementById('lensName').value = `${baseName} (Copy)`;
        document.getElementById('lensDesc').value = originalLens.desc;
        document.getElementById('lensStatus').value = originalLens.status;
        
        // Focus on name field for editing
        document.getElementById('lensName').focus();
        document.getElementById('lensName').select();
    }, 100);
}

// Clone selected lenses directly (for multiple selections)
function cloneLensesDirectly() {
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
                status: 'Draft', // Always start with Draft
                originalStatus: originalLens.status, // Store original status for refresh
                desc: originalLens.desc,
                lastRefreshed: new Date().toLocaleString()
            };
            lenses.push(clonedLens); // Add directly to main list
        }
    });
    
    // Clear selection and update UI
    selectedIds = {};
    renderTable();
    updateRecordCount();
    
    // Show success message
    const count = lensIds.length;
    showSuccessMessage(`${count} lens${count > 1 ? 'es' : ''} cloned with Draft status. Click Refresh to publish.`);
}

// Legacy function name for compatibility
function cloneLenses() {
    showCloneModal();
}

// Refresh lenses - add pending items and publish draft lenses
function refreshLenses() {
    let publishedCount = 0;
    let addedCount = 0;
    
    // Add pending lenses to main list
    if (pendingLenses.length > 0) {
        addedCount = pendingLenses.length;
        lenses = lenses.concat(pendingLenses);
        pendingLenses = [];
        updatePendingBadge();
    }
    
    // Update Draft lenses to Published (if they have originalStatus of Published)
    lenses.forEach(lens => {
        if (lens.status === 'Draft' && lens.originalStatus === 'Published') {
            lens.status = 'Published';
            lens.lastRefreshed = new Date().toLocaleString();
            publishedCount++;
        } else if (lens.status === 'Draft' && !lens.originalStatus) {
            // For lenses without originalStatus, also publish them on refresh
            lens.status = 'Published';
            lens.lastRefreshed = new Date().toLocaleString();
            publishedCount++;
        }
    });
    
    renderTable();
    updateRecordCount();
    
    // Show success message
    let message = '';
    if (addedCount > 0 && publishedCount > 0) {
        message = `${addedCount} new item${addedCount > 1 ? 's' : ''} added and ${publishedCount} item${publishedCount > 1 ? 's' : ''} published.`;
    } else if (addedCount > 0) {
        message = `${addedCount} new item${addedCount > 1 ? 's' : ''} added to the list.`;
    } else if (publishedCount > 0) {
        message = `${publishedCount} item${publishedCount > 1 ? 's' : ''} published.`;
    } else {
        message = 'All items are up to date.';
    }
    
    if (addedCount > 0 || publishedCount > 0) {
        showSuccessMessage(message);
    }
}

// Update pending badge
function updatePendingBadge() {
    const badge = document.getElementById('pendingBadge');
    const draftCount = lenses.filter(lens => lens.status === 'Draft').length;
    const pendingCount = pendingLenses.length;
    const totalPending = draftCount + pendingCount;
    
    if (totalPending > 0) {
        badge.textContent = totalPending;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Open lens
function openLens(name) {
    console.log('Opening lens:', name);
    
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        // Ensure modal is fully visible
        loadingModal.style.display = 'block';
        loadingModal.style.visibility = 'visible';
        loadingModal.style.opacity = '1';
        
        // Update the loading text to include the lens name
        const spinnerText = loadingModal.querySelector('.spinner-text');
        if (spinnerText) {
            spinnerText.textContent = `Loading "${name}"...`;
        }
        
        // Update modal title
        const modalTitle = loadingModal.querySelector('.modal-header__title');
        if (modalTitle) {
            modalTitle.textContent = 'Content Lens';
        }
        
        console.log('Loading modal displayed for:', name);
        
        // Add visual feedback to confirm modal is showing
        console.log('Modal display style:', loadingModal.style.display);
        console.log('Modal computed display:', window.getComputedStyle(loadingModal).display);
    } else {
        console.error('Loading modal not found');
        // Fallback alert if modal is not found
        alert(`Loading ${name}...`);
    }
    
    // Simulate loading time and then navigate
    setTimeout(() => {
        console.log('Loading complete, navigating...');
        
        if (loadingModal) {
            loadingModal.style.display = 'none';
            
            // Reset the loading text back to default
            const spinnerText = loadingModal.querySelector('.spinner-text');
            if (spinnerText) {
                spinnerText.textContent = 'Opening Content Lens...';
            }
        }
        
        // Send message to parent if in iframe
        if (window.parent !== window) {
            console.log('Sending message to parent iframe');
            window.parent.postMessage({
                type: 'openLens',
                lensName: name
            }, '*');
        } else {
            // Navigate directly if not in iframe
            console.log('Direct navigation (not in iframe)');
            window.location.href = `/lens/${encodeURIComponent(name)}`;
        }
    }, 2000);
}

// Hide loading modal
function hideLoadingModal() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        loadingModal.style.display = 'none';
        
        // Reset the loading text back to default
        const spinnerText = loadingModal.querySelector('.spinner-text');
        if (spinnerText) {
            spinnerText.textContent = 'Opening Content Lens...';
        }
        
        console.log('Loading modal manually closed');
    }
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

// Make functions globally available for onclick handlers
window.showNewModal = showNewModal;
window.hideNewModal = hideNewModal;
window.hideLoadingModal = hideLoadingModal;
window.saveLens = saveLens;
window.handleNewLensOperation = handleNewLensOperation;
window.handleCloneOperation = handleCloneOperation;
window.openCloneModalForLens = openCloneModalForLens;
window.toggleSelectAll = toggleSelectAll;
window.toggleSelect = toggleSelect;
window.cloneLenses = cloneLenses;
window.showCloneModal = showCloneModal;
window.cloneLensesDirectly = cloneLensesDirectly;
window.refreshLenses = refreshLenses;
window.openLens = openLens;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}