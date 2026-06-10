import { useState, useEffect, useCallback } from 'react'
import { Concept } from '../../types'
import ConceptGraph from './components/ConceptGraph'
import ConceptPanel from './components/ConceptPanel'
import NodeForm from './components/NodeForm'

function App() {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingConcept, setEditingConcept] = useState<Concept | null>(null)

  const fetchConcepts = useCallback(async () => {
    const res = await fetch('/api/concepts')
    const data = await res.json()
    setConcepts(data)
  }, [])

  useEffect(() => { fetchConcepts() }, [fetchConcepts])

  const handleCreate = () => {
    setEditingConcept(null)
    setShowForm(true)
  }

  const handleEdit = (concept: Concept) => {
    setEditingConcept(concept)
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
    fetchConcepts()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/concepts/${id}`, { method: 'DELETE' })
    setSelectedId(null)
    fetchConcepts()
  }

  const selectedConcept = concepts.find(c => c.id === selectedId)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <ConceptGraph
          concepts={concepts}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <button
          onClick={handleCreate}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
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
      <ConceptPanel
        concept={selectedConcept}
        concepts={concepts}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {showForm && (
        <NodeForm
          concept={editingConcept}
          concepts={concepts}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

export default App