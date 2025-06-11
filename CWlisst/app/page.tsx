'use client'

import React, { useState, useEffect, useCallback } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { Lens, CloneData } from '@/types/lens'
import { v4 as uuidv4 } from 'uuid'

const initialData: Lens[] = [
  {
    id: 'LENS001',
    name: 'Marketing Lens',
    status: 'Published',
    desc: 'Marketing content analysis and insights',
    lastRefreshed: new Date().toLocaleString()
  },
  {
    id: 'LENS002',
    name: 'HR Lens',
    status: 'Draft',
    desc: 'HR documentation and policy analysis',
    lastRefreshed: new Date().toLocaleString()
  },
  {
    id: 'LENS003',
    name: 'Finance Lens',
    status: 'Published',
    desc: 'Financial data and reporting insights',
    lastRefreshed: new Date().toLocaleString()
  }
]

export default function ContentLensManager() {
  const [lenses, setLenses] = useState<Lens[]>(initialData)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})
  const [showNewModal, setShowNewModal] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [loadingLensName, setLoadingLensName] = useState('')
  const [cloneData, setCloneData] = useState<CloneData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Draft' as 'Draft' | 'Published'
  })
  const [nameError, setNameError] = useState(false)

  const filteredLenses = lenses.filter(lens => 
    lens.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lens.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lens.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedCount = Object.keys(selectedIds).filter(id => selectedIds[id]).length
  const draftCount = lenses.filter(lens => lens.status === 'Draft').length

  const generateNextId = (): string => {
    const existingNumbers = lenses
      .map(lens => lens.id.match(/LENS(\d+)/))
      .filter(match => match)
      .map(match => parseInt(match![1], 10))
    
    const maxNumber = Math.max(0, ...existingNumbers)
    return `LENS${String(maxNumber + 1).padStart(3, '0')}`
  }

  const updateRecordCount = useCallback(() => {
    // This would typically update a record count display
  }, [lenses.length])

  useEffect(() => {
    updateRecordCount()
  }, [lenses, updateRecordCount])

  const handleSelectAll = () => {
    if (selectedCount === filteredLenses.length) {
      setSelectedIds({})
    } else {
      const newSelected: Record<string, boolean> = {}
      filteredLenses.forEach(lens => {
        newSelected[lens.id] = true
      })
      setSelectedIds(newSelected)
    }
  }

  const handleSelectLens = (id: string) => {
    console.log('handleSelectLens called with:', id);
    setSelectedIds(prev => {
      const newSelected = prev[id] ? 
        (() => {
          const temp = { ...prev };
          delete temp[id];
          console.log('DESELECTED:', id, 'Remaining:', Object.keys(temp));
          return temp;
        })() :
        (() => {
          const temp = { ...prev, [id]: true };
          console.log('SELECTED:', id, 'Total selected:', Object.keys(temp));
          return temp;
        })();
      
      return newSelected;
    });
  }

  const handleOpenLens = (name: string) => {
    console.log('Opening lens:', name)
    setLoadingLensName(name)
    setShowLoadingModal(true)
    
    setTimeout(() => {
      setShowLoadingModal(false)
      // Simulate navigation or iframe message
      if (typeof window !== 'undefined' && window.parent !== window) {
        window.parent.postMessage({
          type: 'openLens',
          lensName: name
        }, '*')
      }
    }, 2000)
  }

  const handleNewLens = () => {
    setFormData({ name: '', description: '', status: 'Draft' })
    setCloneData(null)
    setNameError(false)
    setShowNewModal(true)
  }

  const handleClone = () => {
    const selectedLensIds = Object.keys(selectedIds).filter(id => selectedIds[id])
    console.log('Clone button clicked. Selected IDs:', selectedLensIds)
    
    if (selectedLensIds.length === 0) {
      console.log('No items selected for cloning')
      return
    }

    const firstLens = lenses.find(lens => lens.id === selectedLensIds[0])
    if (!firstLens) {
      console.log('First selected lens not found')
      return
    }

    const baseName = selectedLensIds.length > 1 ? 'Multiple Lenses' : firstLens.name
    const cloneFormData = {
      name: `${baseName} (Copy)`,
      description: firstLens.desc,
      status: firstLens.status
    }
    
    console.log('Setting up clone modal with data:', cloneFormData)
    
    setFormData(cloneFormData)
    
    setCloneData({
      originalLens: firstLens,
      totalCount: selectedLensIds.length,
      allSelectedIds: selectedLensIds
    })
    
    setNameError(false)
    setShowNewModal(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      setNameError(true)
      return
    }

    if (cloneData) {
      // Handle clone operation
      if (cloneData.totalCount === 1) {
        const newLens: Lens = {
          id: generateNextId(),
          name: formData.name,
          status: 'Draft',
          originalStatus: formData.status,
          desc: formData.description,
          lastRefreshed: new Date().toLocaleString()
        }
        setLenses(prev => [...prev, newLens])
      } else {
        // Multiple clones
        cloneData.allSelectedIds.forEach((_id: string, index: number) => {
          const cloneName = `${formData.name} ${index + 1}`
          const newLens: Lens = {
            id: generateNextId(),
            name: cloneName,
            status: 'Draft',
            originalStatus: formData.status,
            desc: formData.description,
            lastRefreshed: new Date().toLocaleString()
          }
          setLenses(prev => [...prev, newLens])
        })
      }
      setSelectedIds({})
    } else {
      // Handle new lens
      const newLens: Lens = {
        id: generateNextId(),
        name: formData.name,
        status: 'Draft',
        originalStatus: formData.status,
        desc: formData.description,
        lastRefreshed: new Date().toLocaleString()
      }
      setLenses(prev => [...prev, newLens])
    }

    setShowNewModal(false)
    setCloneData(null)
  }

  const handleRefresh = () => {
    console.log('Refresh button clicked');
    setLenses(prev => prev.map(lens => {
      if (lens.status === 'Draft') {
        console.log(`Publishing lens: ${lens.name} from Draft to Published`);
        return { 
          ...lens, 
          status: 'Published' as 'Draft' | 'Published',
          lastRefreshed: new Date().toLocaleString(),
          originalStatus: undefined 
        };
      }
      return {
        ...lens,
        lastRefreshed: new Date().toLocaleString()
      };
    }));
  }

  const handleCloseModal = () => {
    setShowNewModal(false)
    setCloneData(null)
    setFormData({ name: '', description: '', status: 'Draft' })
    setNameError(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showNewModal) {
        handleCloseModal()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showNewModal])

  return (
    <div className="app-container">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header__row">
          <div className="page-header__col-title">
            <div className="page-header__title-wrapper">
              <div className="object-icon">
                <span className="icon-text">CL</span>
              </div>
              <div className="page-header__name-title">
                <h1 className="page-header__title">Content Lenses [UPDATED]</h1>
                <div className="page-header__info">
                  <span className="record-count">{lenses.length} items • Updated {new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="page-header__controls">
            <button 
              className="btn btn-neutral" 
              onClick={() => {
                console.log('Refresh button clicked in header');
                handleRefresh();
              }}
              style={{ position: 'relative' }}
            >
              <svg className="btn-icon" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh
              {draftCount > 0 && (
                <span className="pending-badge">{draftCount}</span>
              )}
            </button>
            <button 
              className={`btn btn-neutral ${selectedCount === 0 ? 'btn-disabled' : ''}`}
              onClick={() => {
                console.log('CLONE BUTTON CLICKED - Selected count:', selectedCount);
                handleClone();
              }}
              disabled={selectedCount === 0}
              title={selectedCount === 0 ? 'Select items to clone' : `Clone ${selectedCount} selected item${selectedCount > 1 ? 's' : ''}`}
            >
              Clone {selectedCount > 0 && `(${selectedCount})`}
            </button>
            <button className="btn btn-brand" onClick={handleNewLens}>
              <svg className="btn-icon" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New
            </button>
          </div>
        </div>
      </header>

      {/* List View */}
      <main className="list-view-container">
        {/* Controls */}
        <div className="list-view-controls">
          <div className="list-view-controls__left">
            <button className="view-selector__button">
              <svg className="view-selector__icon" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              All Content Lenses
              <svg className="view-selector__icon" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="list-view-controls__center">
            <div className="search-box">
              <svg className="search-box__icon" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                className="search-box__input"
                placeholder="Search this list..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="list-view-controls__right">
            <button className="btn-icon-border" title="List settings">
              <svg viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          {filteredLenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__content">
                <div className="empty-state__title">No items to display</div>
                <div className="empty-state__message">
                  {searchTerm ? 'No items match your search criteria.' : 'There are no items to display.'}
                </div>
              </div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="table-cell-checkbox">
                    <button 
                      className={`select-btn ${selectedCount === filteredLenses.length && filteredLenses.length > 0 ? 'selected' : ''}`}
                      onClick={() => {
                        console.log('SELECT ALL CLICKED');
                        handleSelectAll();
                      }}
                    >
                      {selectedCount === filteredLenses.length && filteredLenses.length > 0 ? '☑' : '☐'}
                    </button>
                  </th>
                  <th className="table-cell-actions"></th>
                  <th className="sortable">
                    <a href="#" className="sort-link">
                      Lens Name
                      <svg className="sort-icon" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </th>
                  <th>Lens ID</th>
                  <th>Status</th>
                  <th>Last Refreshed</th>
                  <th className="table-cell-actions"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLenses.map((lens) => (
                  <tr 
                    key={lens.id} 
                    className={selectedIds[lens.id] ? 'selected-row' : ''}
                  >
                    <td className="table-cell-checkbox">
                      <button 
                        className={`select-btn ${selectedIds[lens.id] ? 'selected' : ''}`}
                        onClick={() => {
                          console.log('ROW SELECT CLICKED FOR:', lens.id);
                          handleSelectLens(lens.id);
                        }}
                      >
                        {selectedIds[lens.id] ? '☑' : '☐'}
                      </button>
                    </td>
                    <td className="table-cell-actions">
                      <div className="action-menu">
                        <button className="action-button" title="More actions">
                          <svg viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td>
                      <button 
                        className="lens-link" 
                        onClick={() => handleOpenLens(lens.name)}
                        style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        {lens.name}
                      </button>
                    </td>
                    <td>{lens.id}</td>
                    <td>
                      <span className={`status-badge ${lens.status === 'Published' ? 'status-published' : 'status-draft'}`}>
                        {lens.status}
                      </span>
                    </td>
                    <td>{lens.lastRefreshed}</td>
                    <td className="table-cell-actions"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* New/Clone Modal */}
      {showNewModal && (
        <div className="modal">
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
          <div className="modal-dialog">
            <div className="modal-content">
              <header className="modal-header">
                <h2 className="modal-header__title">
                  {cloneData 
                    ? (cloneData.totalCount > 1 ? `Clone ${cloneData.totalCount} Content Lenses` : 'Clone Content Lens')
                    : 'New Content Lens'
                  }
                </h2>
                <button className="modal-header__close" onClick={handleCloseModal}>
                  <svg viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </header>
              <div className="modal-body">
                <div className="form-element">
                  <label className="form-element__label">
                    Name <span className="required">*</span>
                  </label>
                  <div className="form-element__control">
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                        setNameError(false)
                      }}
                      autoFocus
                    />
                  </div>
                  {nameError && (
                    <div className="form-element__help">Name is required</div>
                  )}
                </div>
                <div className="form-element">
                  <label className="form-element__label">Description</label>
                  <div className="form-element__control">
                    <textarea
                      className="textarea"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-element">
                  <label className="form-element__label">Status</label>
                  <div className="form-element__control">
                    <div className="select-wrapper">
                      <select
                        className="select"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Draft' | 'Published' }))}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button className="btn btn-neutral" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button className="btn btn-brand" onClick={handleSave}>
                  {cloneData ? 'Clone' : 'Save'}
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="modal">
          <div className="modal-backdrop" onClick={() => setShowLoadingModal(false)}></div>
          <div className="modal-dialog modal-small">
            <div className="modal-content">
              <header className="modal-header">
                <h2 className="modal-header__title">Content Lens</h2>
                <button className="modal-header__close" onClick={() => setShowLoadingModal(false)}>
                  <svg viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </header>
              <div className="spinner-container">
                <div className="spinner">
                  <span className="spinner__dot-a"></span>
                  <span className="spinner__dot-b"></span>
                </div>
                <div className="spinner-text">Loading &quot;{loadingLensName}&quot;...</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}