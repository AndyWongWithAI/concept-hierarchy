import { useState, useEffect, useCallback } from 'react'
import { Concept } from '../../types'

interface Props {
  concept: Concept | null
  concepts: Concept[]
  onSave: (data: { name: string; parentId?: string; attrs: Record<string, unknown> }) => void
  onClose: () => void
  mode: 'create' | 'edit-node' | 'edit-attrs'
}

export default function NodeForm({ concept, concepts, onSave, onClose, mode }: Props) {
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState<string | undefined>(undefined)
  const [attrKey, setAttrKey] = useState('')
  const [attrValue, setAttrValue] = useState('')
  const [attrs, setAttrs] = useState<Record<string, unknown>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = mode !== 'create'
  const isAttrsOnly = mode === 'edit-attrs'

  // Reset form when concept changes
  useEffect(() => {
    if (concept) {
      setName(concept.name)
      setParentId(concept.parentId || undefined)
      setAttrs(concept.ownAttrs || {})
    } else {
      setName('')
      setParentId(undefined)
      setAttrs({})
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
    if (name.trim()) {
      setIsSubmitting(true)
      try {
        await onSave({ name: name.trim(), parentId, attrs })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const canAddAttr = attrKey.trim() && attrValue.trim()
  const canSubmit = isAttrsOnly ? true : name.trim()

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
      zIndex: 1100
    }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80vh',
        overflow: 'auto',
        boxSizing: 'border-box'
      }}>
        <h3 style={{ marginBottom: 16 }}>
          {mode === 'create' ? '新建节点' : mode === 'edit-attrs' ? '编辑属性' : '编辑节点'}
        </h3>
        <form onSubmit={handleSubmit}>
          {!isAttrsOnly && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>名称 *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="输入节点名称"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>父节点</label>
                <select
                  value={parentId || ''}
                  onChange={e => setParentId(e.target.value || undefined)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, boxSizing: 'border-box', outline: 'none' }}
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
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>属性</label>
              <div style={{ maxHeight: 100, overflow: 'auto', marginBottom: 8 }}>
                {Object.keys(attrs).length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: 13, padding: '4px 0' }}>暂无属性</div>
                ) : (
                  Object.entries(attrs).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span>{key}: {String(value)}</span>
                      <button type="button" onClick={() => handleRemoveAttr(key)} style={{ color: '#ef4444' }}>×</button>
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
                <input
                  placeholder="键"
                  value={attrKey}
                  onChange={e => setAttrKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), canAddAttr && handleAddAttr())}
                  style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', width: '100%' }}
                />
                <input
                  placeholder="值"
                  value={attrValue}
                  onChange={e => setAttrValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), canAddAttr && handleAddAttr())}
                  style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={handleAddAttr}
                  disabled={!canAddAttr}
                  style={{
                    padding: '8px 16px',
                    background: canAddAttr ? '#e2e8f0' : '#f1f5f9',
                    borderRadius: 6,
                    cursor: canAddAttr ? 'pointer' : 'not-allowed',
                    color: canAddAttr ? '#1e293b' : '#94a3b8'
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              style={{
                padding: '10px 16px',
                background: canSubmit && !isSubmitting ? '#2563eb' : '#93c5fd',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
                width: '100%'
              }}
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                cursor: 'pointer',
                width: '100%'
              }}
            >
              取消
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
            Enter 提交 · Esc 取消
          </div>
        </form>
      </div>
    </div>
  )
}