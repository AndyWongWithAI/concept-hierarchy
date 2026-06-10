import { FastifyInstance } from 'fastify'
import { prisma } from './db'

interface ConceptInput {
  name: string
  parentId?: string
  attrs?: Record<string, unknown>
}

interface ConceptUpdate {
  name?: string
  parentId?: string | null
  attrs?: Record<string, unknown>
}

export async function conceptRoutes(fastify: FastifyInstance) {
  // 获取所有概念（含继承属性计算）
  fastify.get('/api/concepts', async () => {
    const concepts = await prisma.concept.findMany()

    // 构建 ID -> 概念 map
    const conceptMap = new Map(concepts.map(c => [c.id, c]))

    return concepts.map(concept => {
      const inherited = getAncestorAttrs(concept, conceptMap)
      return {
        ...concept,
        attrs: JSON.parse(concept.attrs),
        inheritedAttrs: inherited.inherited,
        ownAttrs: inherited.own
      }
    })
  })

  // 创建概念
  fastify.post<{ Body: ConceptInput }>('/api/concepts', async (req) => {
    const { name, parentId, attrs = {} } = req.body
    const concept = await prisma.concept.create({
      data: {
        name,
        parentId: parentId || null,
        attrs: JSON.stringify(attrs)
      }
    })
    return concept
  })

  // 更新概念
  fastify.put<{ Params: { id: string }, Body: ConceptUpdate }>('/api/concepts/:id', async (req) => {
    const { id } = req.params
    const { name, parentId, attrs } = req.body
    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (parentId !== undefined) data.parentId = parentId
    if (attrs !== undefined) data.attrs = JSON.stringify(attrs)

    const concept = await prisma.concept.update({
      where: { id },
      data
    })
    return concept
  })

  // 删除概念
  fastify.delete<{ Params: { id: string } }>('/api/concepts/:id', async (req) => {
    const { id } = req.params
    await prisma.concept.delete({ where: { id } })
    return { success: true }
  })
}

function getAncestorAttrs(
  concept: { id: string; name: string; attrs: string; parentId: string | null },
  conceptMap: Map<string, { id: string; name: string; attrs: string; parentId: string | null }>
) {
  const ownAttrs = JSON.parse(concept.attrs)
  const inherited: Record<string, { value: unknown; from: string }> = {}

  // 遍历所有祖先节点（从父到祖）
  let currentParentId = concept.parentId
  while (currentParentId) {
    const parent = conceptMap.get(currentParentId)
    if (!parent) break
    const parentAttrs = JSON.parse(parent.attrs)
    Object.entries(parentAttrs).forEach(([key, value]) => {
      if (!inherited[key]) {
        inherited[key] = { value, from: parent.name }
      }
    })
    currentParentId = parent.parentId
  }

  return {
    inherited,
    own: ownAttrs
  }
}