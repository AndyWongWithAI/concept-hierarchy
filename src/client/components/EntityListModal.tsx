import { useState, useEffect } from 'react'
import { Concept } from '../../types'

interface Props {
  concepts: Concept[]
  selectedId: string | null
  onSave: (id: string, data: { name: string; parentId?: string }) => void
  onEditAttrs: (concept: Concept) => void
  onClose: () => void
  initStates?: EditState
}

interface EditState {
  [id: string]: {
    name: string
    parentId: string | undefined
    isDirty: boolean
  }
}

export default function EntityListModal({ concepts, selectedId, onSave, onEditAttrs, onClose, initStates }: Props & { initStates?: EditState }) {
  // Initialize from initStates if provided, otherwise from concepts (only on mount)
  const [editStates, setEditStates] = useState<EditState>(() => {
    if (initStates) return initStates
    const initial: EditState = {}
    concepts.forEach(c => {
      initial[c.id] = {
        name: c.name,
        parentId: c.parentId || undefined,
        isDirty: false
      }
    })
    return initial
  })
  const [isSavingAll, setIsSavingAll] = useState(false)

  // Update edit states when initStates changes (from parent)
  useEffect(() => {
    if (initStates) {
      setEditStates(prev => {
        // Don't replace if there are dirty edits - user might lose work
        const hasDirty = Object.values(prev).some(s => s.isDirty)
        if (hasDirty) {
          return prev
        }
        // Only update if the new initStates has different values and no dirty edits
        const hasChanges = Object.keys(initStates).some(id => initStates[id].name !== prev[id]?.name || initStates[id].parentId !== prev[id]?.parentId)
        if (hasChanges) {
          return initStates
        }
        return prev
      })
    }
  }, [initStates])

  const updateField = (id: string, field: 'name' | 'parentId', value: string | undefined) => {
    setEditStates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
        isDirty: true
      }
    }))
  }

  const saveAll = async () => {
    setIsSavingAll(true)
    const dirtyIds = Object.keys(editStates).filter(id => editStates[id].isDirty)
    await Promise.all(dirtyIds.map(async id => {
      const state = editStates[id]
      if (state && state.name.trim()) {
        await onSave(id, { name: state.name.trim(), parentId: state.parentId })
      }
    }))
    setEditStates(prev => {
      const next = { ...prev }
      dirtyIds.forEach(id => {
        next[id] = { ...next[id], isDirty: false }
      })
      return next
    })
    setIsSavingAll(false)
  }

  const hasDirty = Object.values(editStates).some(s => s.isDirty)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      boxSizing: 'border-box',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 700,
        maxHeight: '80vh',
        overflow: 'auto',
        boxSizing: 'border-box'
      }}>
        <h3 style={{ marginBottom: 16 }}>编辑实体</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '2px solid #e2e8f0', fontSize: 12, color: '#64748b', fontWeight: 500 }}>
            <div style={{ width: 150 }}>名称</div>
            <div style={{ flex: 1 }}>父节点</div>
            <div style={{ width: 80 }}></div>
          </div>
          {concepts.map(concept => {
            const state = editStates[concept.id]
            const isSelected = concept.id === selectedId

            if (!state) return null

            return (
              <div
                key={concept.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: isSelected ? '#eff6ff' : 'white'
                }}
              >
                <input
                  value={state.name}
                  onChange={e => updateField(concept.id, 'name', e.target.value)}
                  style={{ width: 150, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }}
                />
                <select
                  value={state.parentId || ''}
                  onChange={e => updateField(concept.id, 'parentId', e.target.value || undefined)}
                  style={{ flex: 1, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14 }}
                >
                  <option value="">无</option>
                  {concepts.filter(c => c.id !== concept.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => onEditAttrs(concept)}
                  style={{
                    width: 80,
                    padding: '6px 10px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  编辑属性
                </button>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button
            onClick={saveAll}
            disabled={!hasDirty || isSavingAll}
            style={{
              flex: 2,
              padding: '10px 16px',
              background: hasDirty && !isSavingAll ? '#2563eb' : '#93c5fd',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: hasDirty && !isSavingAll ? 'pointer' : 'not-allowed',
              fontSize: 14
            }}
          >
            {isSavingAll ? '保存中...' : '保存全部'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}