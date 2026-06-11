import { useState, useEffect, useCallback } from 'react'
// 直接指向源文件，绕过 design-system/components 的 re-export 链
// （那条链会拉进 next/link，dev 预打包时 process is not defined）
import { BackgroundGlow } from '../../../design-system/src/components/BackgroundGlow'
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
    <div className="relative flex h-screen overflow-hidden bg-bg text-white">
      <BackgroundGlow variant="minimal" />

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <ConceptGraph
            key={resetKey}
            concepts={concepts}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <div className="absolute bottom-6 right-6 flex gap-3">
            <button
              onClick={handleHome}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium border border-white/20 text-white/60 hover:bg-white/5 hover:border-white/30 hover:text-white transition-all duration-300"
            >
              Home
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 hover:scale-105 transition-all duration-300"
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
      </div>

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
