// ContentLens.js - Upload this as a Static Resource named "ContentLensJS"
var lenses = [];
var pendingLenses = [];
var nextId = 4;
var selectedIds = {};

function init() {
    loadLenses();
    document.getElementById('searchInput').addEventListener('input', renderTable);
}

function loadLenses() {
    // Use Visualforce Remoting to get data from controller
    if (typeof Visualforce !== 'undefined' && Visualforce.remoting && Visualforce.remoting.Manager) {
        Visualforce.remoting.Manager.invokeAction(
            'ContentLensController.getLenses',
            function(result, event) {
                if (event.status) {
                    lenses = result.map(function(lens) {
                        return {
                            id: lens.id,
                            name: lens.name,
                            status: lens.status,
                            desc: lens.description,
                            lastRefreshed: new Date(lens.lastRefreshed).toLocaleString()
                        };
                    });
                    renderTable();
                } else {
                    console.error('Error loading lenses:', event.message);
                    // Fallback to mock data
                    loadMockData();
                }
            },
            {escape: true}
        );
    } else {
        // Fallback for development/testing
        loadMockData();
    }
}

function loadMockData() {
    lenses = [
        {id: 'L-00001', name: 'Marketing Lens', status: 'Published', desc: 'Marketing content', lastRefreshed: new Date(Date.now() - 86400000).toLocaleString()},
        {id: 'L-00002', name: 'HR Lens', status: 'Draft', desc: 'HR docs', lastRefreshed: new Date(Date.now() - 172800000).toLocaleString()},
        {id: 'L-00003', name: 'Finance Lens', status: 'Published', desc: 'Finance data', lastRefreshed: new Date().toLocaleString()}
    ];
    renderTable();
}

function renderTable() {
    var search = document.getElementById('searchInput').value.toLowerCase();
    var filtered = lenses.filter(function(lens) {
        return lens.id.toLowerCase().includes(search) || 
               lens.name.toLowerCase().includes(search) || 
               lens.status.toLowerCase().includes(search);
    });
    
    var tbody = document.getElementById('tableBody');
    var noData = document.getElementById('noData');
    tbody.innerHTML = '';
    
    if (filtered.length === 0) {
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    filtered.forEach(function(lens, index) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td><div class="slds-checkbox"><input type="checkbox" id="chk' + lens.id + '" onchange="toggleSelect(\'' + lens.id + '\')" /><label class="slds-checkbox__label" for="chk' + lens.id + '"><span class="slds-checkbox_faux"></span></label></div></td>' +
            '<td>' + (index + 1) + '</td>' +
            '<td>' + lens.id + '</td>' +
            '<td><a href="javascript:void(0)" onclick="openLens(\'' + lens.name + '\')">' + lens.name + '</a></td>' +
            '<td><span class="slds-badge ' + (lens.status === 'Published' ? 'slds-theme_success' : 'slds-theme_warning') + '">' + lens.status + '</span></td>' +
            '<td>' + lens.lastRefreshed + '</td>';
        tbody.appendChild(tr);
    });
    
    updateCloneButton();
}

function toggleSelectAll() {
    var selectAll = document.getElementById('selectAll').checked;
    var checkboxes = document.querySelectorAll('#tableBody input[type="checkbox"]');
    selectedIds = {};
    
    checkboxes.forEach(function(cb) {
        cb.checked = selectAll;
        var id = cb.id.replace('chk', '');
        if (selectAll) selectedIds[id] = true;
    });
    
    updateCloneButton();
}

function toggleSelect(id) {
    var cb = document.getElementById('chk' + id);
    if (cb.checked) {
        selectedIds[id] = true;
    } else {
        delete selectedIds[id];
    }
    updateCloneButton();
}

function updateCloneButton() {
    var count = Object.keys(selectedIds).length;
    document.getElementById('cloneBtn').disabled = count === 0;
}

function showNewModal() {
    document.getElementById('newModal').classList.add('slds-fade-in-open');
    document.getElementById('newBackdrop').classList.add('slds-backdrop_open');
}

function hideNewModal() {
    document.getElementById('newModal').classList.remove('slds-fade-in-open');
    document.getElementById('newBackdrop').classList.remove('slds-backdrop_open');
    document.getElementById('lensName').value = '';
    document.getElementById('lensDesc').value = '';
    document.getElementById('nameError').classList.add('slds-hide');
}

function saveLens() {
    var name = document.getElementById('lensName').value.trim();
    if (!name) {
        document.getElementById('nameError').classList.remove('slds-hide');
        return;
    }
    
    var desc = document.getElementById('lensDesc').value;
    var status = document.getElementById('lensStatus').value;
    
    if (typeof Visualforce !== 'undefined' && Visualforce.remoting && Visualforce.remoting.Manager) {
        Visualforce.remoting.Manager.invokeAction(
            'ContentLensController.saveLens',
            name, desc, status,
            function(result, event) {
                if (event.status) {
                    var newLens = {
                        id: result.id,
                        name: result.name,
                        status: result.status,
                        desc: result.description,
                        lastRefreshed: new Date(result.lastRefreshed).toLocaleString()
                    };
                    pendingLenses.push(newLens);
                    updatePendingBadge();
                    hideNewModal();
                } else {
                    console.error('Error saving lens:', event.message);
                    alert('Error saving lens. Please try again.');
                }
            },
            {escape: true}
        );
    } else {
        // Fallback for development/testing
        var newLens = {
            id: 'L-' + String(nextId++).padStart(5, '0'),
            name: name,
            status: status,
            desc: desc,
            lastRefreshed: new Date().toLocaleString()
        };
        pendingLenses.push(newLens);
        updatePendingBadge();
        hideNewModal();
    }
}

function cloneLenses() {
    var selectedLensIds = Object.keys(selectedIds);
    
    if (typeof Visualforce !== 'undefined' && Visualforce.remoting && Visualforce.remoting.Manager) {
        Visualforce.remoting.Manager.invokeAction(
            'ContentLensController.cloneLenses',
            selectedLensIds,
            function(result, event) {
                if (event.status) {
                    result.forEach(function(lens) {
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
                } else {
                    console.error('Error cloning lenses:', event.message);
                    alert('Error cloning lenses. Please try again.');
                }
            },
            {escape: true}
        );
    } else {
        // Fallback for development/testing
        selectedLensIds.forEach(function(id) {
            var original = lenses.find(function(l) { return l.id === id; });
            if (original) {
                pendingLenses.push({
                    id: 'L-' + String(nextId++).padStart(5, '0'),
                    name: original.name + ' (Copy)',
                    status: original.status,
                    desc: original.desc,
                    lastRefreshed: new Date().toLocaleString()
                });
            }
        });
        selectedIds = {};
        updatePendingBadge();
        renderTable();
    }
}

function refreshLenses() {
    if (pendingLenses.length > 0) {
        lenses = lenses.concat(pendingLenses);
        pendingLenses = [];
        updatePendingBadge();
        renderTable();
    }
}

function updatePendingBadge() {
    var badge = document.getElementById('pendingBadge');
    if (pendingLenses.length > 0) {
        badge.textContent = pendingLenses.length;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function openLens(name) {
    document.getElementById('loadingModal').classList.add('slds-fade-in-open');
    document.getElementById('loadingBackdrop').classList.add('slds-backdrop_open');
    
    // Handle navigation based on Salesforce context
    setTimeout(function() {
        document.getElementById('loadingModal').classList.remove('slds-fade-in-open');
        document.getElementById('loadingBackdrop').classList.remove('slds-backdrop_open');
        
        // If in Salesforce, use navigation methods
        if (typeof sforce !== 'undefined' && sforce.one) {
            // Lightning Experience navigation
            sforce.one.navigateToURL('/lightning/n/Content_Lens?lens=' + encodeURIComponent(name));
        } else if (window.parent && window.parent !== window) {
            // Classic - navigate parent window
            window.parent.location.href = '/apex/ContentLensDetail?lens=' + encodeURIComponent(name);
        } else {
            // Fallback
            window.location.href = '/apex/ContentLensDetail?lens=' + encodeURIComponent(name);
        }
    }, 2000);
}