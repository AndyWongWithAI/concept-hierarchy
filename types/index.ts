export interface Concept {
  id: string
  name: string
  parentId: string | null
  attrs: Record<string, unknown>
  inheritedAttrs: Record<string, unknown>
  ownAttrs: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface GraphNode {
  id: string
  name: string
  val: number
}

export interface GraphLink {
  source: string
  target: string
}