import { Concept } from '../../../types'

interface Props {
  concept: Concept | undefined
  concepts: Concept[]
  onOpenEntityList: () => void
  onDelete: (id: string) => void
}

export default function ConceptPanel({ concept, concepts, onOpenEntityList, onDelete }: Props) {
  if (!concept) {
    return (
      <div className="w-[280px] shrink-0 border-l border-white/[0.06] flex items-center justify-center text-white/30 text-sm">
        点击节点查看属性
      </div>
    )
  }

  const parentName = concept.parentId
    ? concepts.find(c => c.id === concept.parentId)?.name
    : null

  return (
    <div className="w-[280px] shrink-0 border-l border-white/[0.06] p-6 overflow-auto">
      <h2 className="text-2xl font-bold tracking-tight mb-4">{concept.name}</h2>

      {parentName && (
        <div className="mb-6">
          <div className="text-xs text-white/40 mb-1 uppercase tracking-widest">父节点</div>
          <div className="text-blue-400 text-sm">{parentName}</div>
        </div>
      )}

      <div className="mb-6">
        <div className="text-xs text-white/40 mb-2 uppercase tracking-widest">继承属性</div>
        {Object.keys(concept.inheritedAttrs || {}).length === 0 ? (
          <div className="text-white/30 text-sm">无</div>
        ) : (
          <div className="flex flex-col gap-1">
            {Object.entries(concept.inheritedAttrs).map(([key, info]) => (
              <div
                key={key}
                className="text-sm py-1 border-b border-dashed border-white/[0.15]"
              >
                <span className="text-white/50">{key}: </span>
                <span className="text-white/60">{(info as { value: unknown }).value as string}</span>
                <span className="text-white/30 text-xs"> (来自 {(info as { from: string }).from})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="text-xs text-white/40 mb-2 uppercase tracking-widest">自身属性</div>
        {Object.keys(concept.ownAttrs || {}).length === 0 ? (
          <div className="text-white/30 text-sm">无</div>
        ) : (
          <div className="flex flex-col gap-1">
            {Object.entries(concept.ownAttrs).map(([key, value]) => (
              <div
                key={key}
                className="text-sm text-white py-1 border-b border-white/[0.12]"
              >
                {key}: {value as string}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onOpenEntityList}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-white/90 hover:shadow-lg hover:shadow-white/20 transition-all duration-300"
        >
          编辑实体
        </button>
        <button
          onClick={() => onDelete(concept.id)}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium border border-red-400/40 text-red-400 hover:bg-red-400/10 hover:border-red-400/60 transition-all duration-300"
        >
          删除
        </button>
      </div>
    </div>
  )
}
