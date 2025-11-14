/**
 * Graph Utilities
 *
 * Shared graph algorithms for component linking and relationship analysis.
 * Uses DFS (Depth-First Search) for connected component detection.
 */

/**
 * Component link representation
 */
export interface ComponentLink {
  source: string
  target: string
}

/**
 * Calculate connected component groups from links using DFS
 *
 * Time Complexity: O(V + E) where V = vertices, E = edges
 * Space Complexity: O(V + E) for adjacency list
 *
 * @param links - Array of component links
 * @returns Array of component ID groups (each group is fully connected)
 *
 * @example
 * const links = [
 *   { source: 'c1', target: 'c2' },
 *   { source: 'c2', target: 'c3' },
 *   { source: 'c4', target: 'c5' }
 * ]
 * const groups = calculateLinkGroups(links)
 * // Result: [['c1', 'c2', 'c3'], ['c4', 'c5']]
 */
export function calculateLinkGroups(links: ComponentLink[]): string[][] {
  if (links.length === 0) return []

  // Build adjacency list (undirected graph)
  const graph = new Map<string, Set<string>>()

  links.forEach(({ source, target }) => {
    if (!graph.has(source)) graph.set(source, new Set())
    if (!graph.has(target)) graph.set(target, new Set())
    graph.get(source)!.add(target)
    graph.get(target)!.add(source)
  })

  // Find connected components using DFS
  const visited = new Set<string>()
  const groups: string[][] = []

  function dfs(node: string, group: string[]) {
    visited.add(node)
    group.push(node)
    const neighbors = graph.get(node) || new Set()
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        dfs(neighbor, group)
      }
    })
  }

  graph.forEach((_, node) => {
    if (!visited.has(node)) {
      const group: string[] = []
      dfs(node, group)
      groups.push(group)
    }
  })

  return groups
}

/**
 * Validate component links for common issues
 *
 * @param links - Array of component links
 * @param validComponentIds - Set of valid component IDs
 * @returns Validation result with errors
 */
export function validateComponentLinks(
  links: ComponentLink[],
  validComponentIds: Set<string>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for orphaned references (links to non-existent components)
  links.forEach((link, index) => {
    if (!validComponentIds.has(link.source)) {
      errors.push(`Link ${index}: Source component "${link.source}" does not exist`)
    }
    if (!validComponentIds.has(link.target)) {
      errors.push(`Link ${index}: Target component "${link.target}" does not exist`)
    }
  })

  // Check for self-loops (should not happen but good to validate)
  links.forEach((link, index) => {
    if (link.source === link.target) {
      errors.push(`Link ${index}: Self-loop detected (${link.source} → ${link.source})`)
    }
  })

  // Check for duplicate links
  const linkSet = new Set<string>()
  links.forEach((link, index) => {
    const key1 = `${link.source}-${link.target}`
    const key2 = `${link.target}-${link.source}`
    if (linkSet.has(key1) || linkSet.has(key2)) {
      errors.push(`Link ${index}: Duplicate link (${link.source} ↔ ${link.target})`)
    }
    linkSet.add(key1)
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get the group that a component belongs to
 *
 * @param componentId - Component ID to search for
 * @param links - Array of component links
 * @returns Array of component IDs in the same group (including self)
 */
export function getComponentGroup(componentId: string, links: ComponentLink[]): string[] {
  const groups = calculateLinkGroups(links)

  for (const group of groups) {
    if (group.includes(componentId)) {
      return group
    }
  }

  // If not in any group, return only self
  return [componentId]
}

/**
 * Check if two components are linked (directly or transitively)
 *
 * @param componentId1 - First component ID
 * @param componentId2 - Second component ID
 * @param links - Array of component links
 * @returns True if components are in the same group
 */
export function areComponentsLinked(
  componentId1: string,
  componentId2: string,
  links: ComponentLink[]
): boolean {
  const group = getComponentGroup(componentId1, links)
  return group.includes(componentId2)
}
