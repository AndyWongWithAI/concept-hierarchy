import { useState, useEffect, useCallback } from 'react'
import { Concept } from '../../../types'

interface Props {
  concept: Concept | null
  concepts: Concept[]
  onSave: (data: { name: string; parentId?: string; attrs: Record<string, unknown> }) => void
  onClose: () => void
  mode: 'create' | 'edit-node' | 'edit-attrs'
}

const inputClass =
  'w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder-white/30 outline-none transition-colors duration-200 focus:border-white/30 hover:border-white/[0.15]'

const labelClass = 'block text-xs text-white/40 mb-1.5 uppercase tracking-widest'

export default function NodeForm({ concept, concepts, onSave, onClose, mode }: Props) {
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState<string | undefined>(undefined)
  const [attrKey, setAttrKey] = useState('')
  const [attrValue, setAttrValue] = useState('')
  const [attrs, setAttrs] = useState<Record<string, unknown>>({})
  const [originalAttrs, setOriginalAttrs] = useState<Record<string, unknown>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = mode !== 'create'
  const isAttrsOnly = mode === 'edit-attrs'

  // Reset form when concept changes
  useEffect(() => {
    if (concept) {
      setName(concept.name)
      setParentId(concept.parentId || undefined)
      setAttrs(concept.ownAttrs || {})
      setOriginalAttrs(concept.ownAttrs || {})
    } else {
      setName('')
      setParentId(undefined)
      setAttrs({})
      setOriginalAttrs({})
    }
    setAttrKey('')
    setAttrValue('')
  }, [concept])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleAddAttr = useCallback(() => {
    if (attrKey.trim() && attrValue.trim()) {
      setAttrs(prev => ({ ...prev, [attrKey.trim()]: attrValue.trim() }))
      setAttrKey('')
      setAttrValue('')
    }
  }, [attrKey, attrValue])

  const handleRemoveAttr = (key: string) => {
    setAttrs(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isAttrsOnly || name.trim()) {
      setIsSubmitting(true)
      try {
        await onSave({ name: name.trim() || undefined, parentId, attrs })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const canAddAttr = attrKey.trim() && attrValue.trim()

  // Check if attrs have been modified
  const attrsChanged = JSON.stringify(attrs) !== JSON.stringify(originalAttrs)

  // For attrs-only mode: save only when attrs actually changed
  // For other modes: save when name is filled
  const canSubmit = isAttrsOnly ? attrsChanged : name.trim()

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[80vh] overflow-auto rounded-2xl border border-white/[0.12] bg-[#0a0a0a]/95 backdrop-blur-xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold tracking-tight mb-4">
          {mode === 'create' ? '新建节点' : mode === 'edit-attrs' ? '编辑属性' : '编辑节点'}
        </h3>
        <form onSubmit={handleSubmit}>
          {!isAttrsOnly && (
            <>
              <div className="mb-4">
                <label className={labelClass}>名称 *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="输入节点名称"
                  className={inputClass}
                />
              </div>

              <div className="mb-4">
                <label className={labelClass}>父节点</label>
                <select
                  value={parentId || ''}
                  onChange={e => setParentId(e.target.value || undefined)}
                  className={inputClass}
                >
                  <option value="">无</option>
                  {concepts.filter(c => c.id !== concept?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {(isEditing || isAttrsOnly) && (
            <div className="mb-4">
              <label className={labelClass}>属性</label>
              <div className="max-h-[100px] overflow-auto mb-2">
                {Object.keys(attrs).length === 0 ? (
                  <div className="text-white/30 text-sm py-1">暂无属性</div>
                ) : (
                  Object.entries(attrs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between py-1 border-b border-white/[0.06] text-sm text-white/70"
                    >
                      <span>{key}: {value as string}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttr(key)}
                        className="text-red-400 hover:text-red-300 px-2"
                      >×</button>
                    </div>
                  ))
                )}
              </div>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  placeholder="键"
                  value={attrKey}
                  onChange={e => setAttrKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), canAddAttr && handleAddAttr())}
                  className={inputClass}
                />
                <input
                  placeholder="值"
                  value={attrValue}
                  onChange={e => setAttrValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), canAddAttr && handleAddAttr())}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleAddAttr}
                  disabled={!canAddAttr}
                  className={
                    canAddAttr
                      ? 'px-4 py-2 rounded-lg bg-white/[0.06] text-white hover:bg-white/10 transition-colors duration-200 text-sm'
                      : 'px-4 py-2 rounded-lg bg-white/[0.02] text-white/30 cursor-not-allowed text-sm'
                  }
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={
                canSubmit && !isSubmitting
                  ? 'px-4 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 transition-all duration-300'
                  : 'px-4 py-2.5 rounded-lg bg-white/30 text-white/60 text-sm font-medium cursor-not-allowed'
              }
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-white/20 text-white/70 text-sm font-medium hover:bg-white/5 hover:border-white/30 transition-all duration-300"
            >
              取消
            </button>
          </div>
          <div className="mt-3 text-xs text-white/30 text-center">
            Enter 提交 · Esc 取消
          </div>
        </form>
      </div>
    </div>
  )
}
