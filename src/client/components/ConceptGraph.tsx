import { useRef, useEffect, useCallback } from 'react'
import forceGraph from 'force-graph'
import { Concept } from '../../types'

interface Props {
  concepts: Concept[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export default function ConceptGraph({ concepts, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<ReturnType<typeof forceGraph>>()

  useEffect(() => {
    if (!containerRef.current) return

    const graph = forceGraph()(containerRef.current)
    graphRef.current = graph

    graph
      .nodeLabel('name')
      .nodeRelSize(8)
      .linkColor(() => '#cbd5e1')
      .onNodeClick((node: { id: string }) => {
        onSelect(node.id === selectedId ? null : node.id)
      })

    return () => {
      graph.pauseAnimation()
    }
  }, [])

  useEffect(() => {
    if (!graphRef.current) return

    const nodes = concepts.map(c => ({
      id: c.id,
      name: c.name
    }))

    const links = concepts
      .filter(c => c.parentId)
      .map(c => ({
        source: c.parentId!,
        target: c.id
      }))

    graphRef.current.graphData({ nodes, links })
  }, [concepts])

  useEffect(() => {
    if (!graphRef.current) return
    graphRef.current.nodeColor(node => (node as { id: string }).id === selectedId ? '#2563eb' : '#94a3b8')
  }, [selectedId])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#f8fafc' }}
    />
  )
}