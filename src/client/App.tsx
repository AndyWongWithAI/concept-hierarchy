import { useState, useEffect, useCallback } from 'react'
import { Concept } from '../../types'
import ConceptGraph from './components/ConceptGraph'
import ConceptPanel from './components/ConceptPanel'
import NodeForm from './components/NodeForm'
import EntityListModal from './components/EntityListModal'

function App() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showEntityList, setShowEntityList] = useState(false)
  const [editingConcept, setEditingConcept] = useState<Concept | null>(null)
  const [formMode, setFormMode] = useState<'create' | 'edit-node' | 'edit-attrs'>('create')
  const [resetKey, setResetKey] = useState(0)

  // Entity edit states - stored at App level so they persist when NodeForm overlays
  const [entityEditStates, setEntityEditStates] = useState<Record<string, { name: string; parentId: string | undefined }>>({})

  const fetchConcepts = useCallback(async () => {
    const res = await fetch('/api/concepts')
    const data = await res.json()
    setConcepts(data)
  }, [])

  useEffect(() => { fetchConcepts() }, [fetchConcepts])

  const handleCreate = () => {
    setEditingConcept(null)
    setFormMode('create')
    setShowForm(true)
  }

  const handleOpenEntityList = () => {
    // Initialize edit states from current concepts
    const initial: Record<string, { name: string; parentId: string | undefined }> = {}
    concepts.forEach(c => {
      initial[c.id] = { name: c.name, parentId: c.parentId || undefined }
    })
    setEntityEditStates(initial)
    setShowEntityList(true)
  }

  const handleSaveEntity = async (id: string, data: { name: string; parentId?: string }) => {
    await fetch(`/api/concepts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    fetchConcepts()
  }

  const handleEditAttrs = (concept: Concept) => {
    setEditingConcept(concept)
    setFormMode('edit-attrs')
    setShowForm(true)
  }

  const handleEditNode = (concept: Concept) => {
    setEditingConcept(concept)
    setFormMode('edit-node')
    setShowForm(true)
  }

  const handleSave = async (data: { name: string; parentId?: string; attrs: Record<string, unknown> }) => {
    if (editingConcept) {
      await fetch(`/api/concepts/${editingConcept.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } else {
      await fetch('/api/concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    }
    setShowForm(false)

    // If entity list is open, don't fetch (to preserve local edits)
    // Just update the specific concept in App state for graph refresh
    if (showEntityList && editingConcept) {
      setConcepts(prev => prev.map(c =>
        c.id === editingConcept.id
          ? { ...c, attrs: data.attrs, ownAttrs: data.attrs, updatedAt: new Date().toISOString() }
          : c
      ))
    } else {
      fetchConcepts()
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/concepts/${id}`, { method: 'DELETE' })
    setSelectedId(null)
    fetchConcepts()
  }

  const handleHome = () => {
    setResetKey(k => k + 1)
    // Clear selection so Home shows all nodes
    setSelectedId(null)
  }

  const selectedConcept = concepts.find(c => c.id === selectedId)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <ConceptGraph
          key={resetKey}
          concepts={concepts}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <div style={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', gap: 12 }}>
          <button
            onClick={handleHome}
            style={{
              padding: '12px 24px',
              background: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            Home
          </button>
          <button
            onClick={handleCreate}
            style={{
              padding: '12px 24px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16
            }}
          >
            + 新建节点
          </button>
        </div>
      </div>
      <ConceptPanel
        concept={selectedConcept}
        concepts={concepts}
        onOpenEntityList={handleOpenEntityList}
        onDelete={handleDelete}
      />
      {showForm && (
        <NodeForm
          concept={editingConcept}
          concepts={concepts}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
          mode={formMode}
        />
      )}
      {showEntityList && (
        <EntityListModal
          concepts={concepts}
          selectedId={selectedId}
          onSave={handleSaveEntity}
          onEditAttrs={handleEditAttrs}
          onClose={() => setShowEntityList(false)}
          initStates={entityEditStates}
        />
      )}
    </div>
  )
}

export default App