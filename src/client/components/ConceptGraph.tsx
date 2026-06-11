import { useRef, useEffect } from 'react'
import forceGraph from 'force-graph'
import { Concept } from '../../../types'

interface Props {
  concepts: Concept[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

const COLOR_NODE = 'rgba(255, 255, 255, 0.45)'
const COLOR_NODE_SELECTED = '#60a5fa'
const COLOR_LINK = 'rgba(255, 255, 255, 0.12)'

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
      .backgroundColor('#0a0a0a')
      .nodeRelSize(8)
      .linkColor(() => COLOR_LINK)
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
        const color = isSelected ? COLOR_NODE_SELECTED : COLOR_NODE

        ctx.font = `${fontSize}px Inter, ui-sans-serif, system-ui, sans-serif`
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, nodeObj.x || 0, (nodeObj.y || 0) + 16)

        ctx.beginPath()
        ctx.arc(nodeObj.x || 0, nodeObj.y || 0, 6, 0, 2 * Math.PI)
        ctx.fillStyle = color
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
      className="w-full h-full"
    />
  )
}
