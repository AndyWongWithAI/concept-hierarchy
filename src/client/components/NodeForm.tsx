import { useState, useEffect } from 'react'
import { Concept } from '../../types'

interface Props {
  concept: Concept | null
  concepts: Concept[]
  onSave: (data: { name: string; parentId?: string; attrs: Record<string, unknown> }) => void
  onClose: () => void
}

export default function NodeForm({ concept, concepts, onSave, onClose }: Props) {
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState<string | undefined>(undefined)
  const [attrKey, setAttrKey] = useState('')
  const [attrValue, setAttrValue] = useState('')
  const [attrs, setAttrs] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (concept) {
      setName(concept.name)
      setParentId(concept.parentId || undefined)
      setAttrs(concept.ownAttrs || {})
    }
  }, [concept])

  const handleAddAttr = () => {
    if (attrKey && attrValue) {
      setAttrs(prev => ({ ...prev, [attrKey]: attrValue }))
      setAttrKey('')
      setAttrValue('')
    }
  }

  const handleRemoveAttr = (key: string) => {
    setAttrs(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name) {
      onSave({ name, parentId, attrs })
    }
  }

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
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 24,
        width: 400,
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3 style={{ marginBottom: 16 }}>{concept ? '编辑节点' : '新建节点'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>名称</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>父节点</label>
            <select
              value={parentId || ''}
              onChange={e => setParentId(e.target.value || undefined)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6 }}
            >
              <option value="">无</option>
              {concepts.filter(c => c.id !== concept?.id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>属性</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                placeholder="键"
                value={attrKey}
                onChange={e => setAttrKey(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
              <input
                placeholder="值"
                value={attrValue}
                onChange={e => setAttrValue(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6 }}
              />
              <button type="button" onClick={handleAddAttr} style={{ padding: '8px 16px', background: '#e2e8f0', borderRadius: 6 }}>+</button>
            </div>
            {Object.entries(attrs).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span>{key}: {String(value)}</span>
                <button type="button" onClick={() => handleRemoveAttr(key)} style={{ color: '#ef4444' }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ flex: 1, padding: '10px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              保存
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer' }}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}