import { useRef, useEffect } from 'react'
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
  const selectedIdRef = useRef<string | null>(selectedId)

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    if (!containerRef.current) return

    const graph = forceGraph()(containerRef.current)
    graphRef.current = graph

    graph
      .nodeRelSize(8)
      .linkColor(() => '#cbd5e1')
      .linkDirectionalArrowLength(6)
      .linkDirectionalArrowRelPos(1)
      .onNodeClick((node: { id: string }) => {
        onSelect(node.id === selectedIdRef.current ? null : node.id)
      })
      .nodeCanvasObject((node, ctx) => {
        const nodeObj = node as { id?: string; name?: string; x?: number; y?: number }
        const label = nodeObj.name || ''
        const fontSize = 12
        const isSelected = nodeObj.id === selectedIdRef.current

        ctx.font = `${fontSize}px sans-serif`
        ctx.fillStyle = isSelected ? '#2563eb' : '#94a3b8'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, nodeObj.x || 0, (nodeObj.y || 0) + 14)

        ctx.beginPath()
        ctx.arc(nodeObj.x || 0, nodeObj.y || 0, 6, 0, 2 * Math.PI)
        ctx.fillStyle = isSelected ? '#2563eb' : '#94a3b8'
        ctx.fill()
      })

    return () => {
      graph.pauseAnimation()
    }
  }, [])

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current || !graphRef.current) return

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        graphRef.current.width(width)
        graphRef.current.height(height)
      }
    })
    ro.observe(containerRef.current)

    return () => ro.disconnect()
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

  // Highlight selected node
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.refresh?.()
    }
  }, [selectedId])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#f8fafc' }}
    />
  )
}