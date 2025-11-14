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
 * Performance Note:
 * - For typical use cases (< 100 components), this function is fast (< 50ms)
 * - If called repeatedly with same links (e.g., in render loop), consider memoizing
 *   results using useMemo() or a caching layer
 * - Recalculating on every call is acceptable for one-time operations like
 *   prompt generation, but avoid in hot paths
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
 *
 * // For React components (if called repeatedly):
 * const groups = useMemo(() => calculateLinkGroups(links), [links])
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
 * @param validateId - If true, returns undefined for IDs not in any link (default: false)
 * @returns Array of component IDs in the same group, or undefined if not found (when validateId=true)
 *
 * Behavior:
 * - If component is in a link group: returns all component IDs in that group
 * - If validateId=false (default): returns [componentId] for components not in any link
 * - If validateId=true: returns undefined for components not in any link
 *
 * @example
 * // Component in a group
 * getComponentGroup("c1", [{source: "c1", target: "c2"}]) // ["c1", "c2"]
 *
 * // Component not in any link (default behavior)
 * getComponentGroup("c3", [{source: "c1", target: "c2"}]) // ["c3"]
 *
 * // Component not in any link (with validation)
 * getComponentGroup("c3", [{source: "c1", target: "c2"}], true) // undefined
 */
export function getComponentGroup(
  componentId: string,
  links: ComponentLink[],
  validateId = false
): string[] | undefined {
  const groups = calculateLinkGroups(links)

  for (const group of groups) {
    if (group.includes(componentId)) {
      return group
    }
  }

  // Component not in any group
  if (validateId) {
    return undefined // Return undefined to indicate component is not in any link
  }

  // Default behavior: return self as a single-member group
  return [componentId]
}

/**
 * Check if two components are linked (directly or transitively)
 *
 * @param componentId1 - First component ID
 * @param componentId2 - Second component ID
 * @param links - Array of component links
 * @returns True if components are in the same group, false if either component is not in any link
 */
export function areComponentsLinked(
  componentId1: string,
  componentId2: string,
  links: ComponentLink[]
): boolean {
  // Use validateId=true to check if component is actually in a link group
  const group = getComponentGroup(componentId1, links, true)

  // If component is not in any link, return false
  if (!group) {
    return false
  }

  return group.includes(componentId2)
}
