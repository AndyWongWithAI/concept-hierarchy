import { useState, useEffect } from 'react'
import { Concept } from '../../../types'

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

const inputClass =
  'px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white outline-none transition-colors duration-200 focus:border-white/30 hover:border-white/[0.15]'

export default function EntityListModal({ concepts, selectedId, onSave, onEditAttrs, onClose, initStates }: Props) {
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
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[80vh] overflow-auto rounded-2xl border border-white/[0.12] bg-[#0a0a0a]/95 backdrop-blur-xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold tracking-tight mb-4">编辑实体</h3>

        <div className="flex flex-col gap-2">
          <div className="flex gap-3 py-2 border-b-2 border-white/[0.12] text-xs text-white/40 uppercase tracking-widest">
            <div className="w-[150px]">名称</div>
            <div className="flex-1">父节点</div>
            <div className="w-[80px]"></div>
          </div>
          {concepts.map(concept => {
            const state = editStates[concept.id]
            const isSelected = concept.id === selectedId

            if (!state) return null

            return (
              <div
                key={concept.id}
                className={
                  isSelected
                    ? 'flex items-center gap-3 px-3 py-2 rounded-lg border-2 border-blue-400/40 bg-blue-400/[0.04]'
                    : 'flex items-center gap-3 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300'
                }
              >
                <input
                  value={state.name}
                  onChange={e => updateField(concept.id, 'name', e.target.value)}
                  className={`${inputClass} w-[150px]`}
                />
                <select
                  value={state.parentId || ''}
                  onChange={e => updateField(concept.id, 'parentId', e.target.value || undefined)}
                  className={`${inputClass} flex-1`}
                >
                  <option value="">无</option>
                  {concepts.filter(c => c.id !== concept.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => onEditAttrs(concept)}
                  className="w-[80px] px-2.5 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 transition-all duration-300"
                >
                  编辑属性
                </button>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={saveAll}
            disabled={!hasDirty || isSavingAll}
            className={
              hasDirty && !isSavingAll
                ? 'flex-[2] px-4 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 transition-all duration-300'
                : 'flex-[2] px-4 py-2.5 rounded-lg bg-white/30 text-white/60 text-sm font-medium cursor-not-allowed'
            }
          >
            {isSavingAll ? '保存中...' : '保存全部'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white/70 text-sm font-medium hover:bg-white/5 hover:border-white/30 transition-all duration-300"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
