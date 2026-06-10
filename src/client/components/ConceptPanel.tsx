import { Concept } from '../../types'

interface Props {
  concept: Concept | undefined
  concepts: Concept[]
  onEdit: (concept: Concept) => void
  onDelete: (id: string) => void
}

export default function ConceptPanel({ concept, concepts, onEdit, onDelete }: Props) {
  if (!concept) {
    return (
      <div style={{
        width: 280,
        flexShrink: 0,
        borderLeft: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8'
      }}>
        点击节点查看属性
      </div>
    )
  }

  const parentName = concept.parentId
    ? concepts.find(c => c.id === concept.parentId)?.name
    : null

  return (
    <div style={{
      width: 280,
      flexShrink: 0,
      borderLeft: '1px solid #e2e8f0',
      padding: 24,
      overflow: 'auto'
    }}>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>{concept.name}</h2>

      {parentName && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ color: '#64748b', fontSize: 12 }}>父节点</span>
          <div style={{ color: '#2563eb' }}>{parentName}</div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>继承属性</div>
        {Object.keys(concept.inheritedAttrs || {}).length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: 14 }}>无</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.entries(concept.inheritedAttrs).map(([key, info]) => (
              <div key={key} style={{
                fontSize: 14,
                borderBottom: '1px dashed #cbd5e1',
                padding: '4px 0'
              }}>
                <span style={{ color: '#94a3b8' }}>{key}: </span>
                <span style={{ color: '#64748b' }}>{String((info as { value: unknown }).value)}</span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}> (来自 {(info as { from: string }).from})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>自身属性</div>
        {Object.keys(concept.ownAttrs || {}).length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: 14 }}>无</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.entries(concept.ownAttrs).map(([key, value]) => (
              <div key={key} style={{
                color: '#1e293b',
                fontSize: 14,
                borderBottom: '1px solid #e2e8f0',
                padding: '4px 0'
              }}>
                {key}: {String(value)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onEdit(concept)}
          style={{
            flex: 1,
            padding: '8px 16px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          编辑
        </button>
        <button
          onClick={() => onDelete(concept.id)}
          style={{
            flex: 1,
            padding: '8px 16px',
            background: 'white',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          删除
        </button>
      </div>
    </div>
  )
}