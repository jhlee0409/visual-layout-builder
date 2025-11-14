/**
 * Union-Find (Disjoint Set Union) 자료구조
 *
 * 컴포넌트 연결 그룹을 효율적으로 관리
 * - find(): 그룹 대표(root) 찾기 (Path Compression)
 * - union(): 두 그룹 병합 (Union by Rank)
 * - getGroups(): 모든 연결 그룹 반환
 *
 * 시간 복잡도: O(α(n)) - 거의 상수 시간 (α는 Ackermann 함수의 역함수)
 */
export class UnionFind<T = string> {
  private parent: Map<T, T>
  private rank: Map<T, number>

  constructor(elements: T[]) {
    this.parent = new Map()
    this.rank = new Map()

    // 초기화: 각 요소가 자기 자신을 부모로
    elements.forEach((elem) => {
      this.parent.set(elem, elem)
      this.rank.set(elem, 0)
    })
  }

  /**
   * Find: 그룹의 대표(root) 찾기 (Path Compression 최적화)
   */
  find(x: T): T {
    if (!this.parent.has(x)) {
      this.parent.set(x, x)
      this.rank.set(x, 0)
    }

    const parent = this.parent.get(x)!
    if (parent !== x) {
      // Path Compression: 경로 압축으로 최적화
      this.parent.set(x, this.find(parent))
    }

    return this.parent.get(x)!
  }

  /**
   * Union: 두 그룹 병합 (Union by Rank 최적화)
   */
  union(x: T, y: T): void {
    const rootX = this.find(x)
    const rootY = this.find(y)

    if (rootX === rootY) return // 이미 같은 그룹

    // Union by Rank: 높이가 낮은 트리를 높은 트리에 붙임
    const rankX = this.rank.get(rootX) || 0
    const rankY = this.rank.get(rootY) || 0

    if (rankX < rankY) {
      this.parent.set(rootX, rootY)
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX)
    } else {
      this.parent.set(rootY, rootX)
      this.rank.set(rootX, rankX + 1)
    }
  }

  /**
   * 같은 그룹에 속하는지 확인
   */
  isConnected(x: T, y: T): boolean {
    return this.find(x) === this.find(y)
  }

  /**
   * 모든 연결 그룹 반환
   * @returns Map<root, Set<members>>
   */
  getGroups(): Map<T, Set<T>> {
    const groups = new Map<T, Set<T>>()

    this.parent.forEach((_, elem) => {
      const root = this.find(elem)
      if (!groups.has(root)) {
        groups.set(root, new Set())
      }
      groups.get(root)!.add(elem)
    })

    return groups
  }

  /**
   * 특정 요소가 속한 그룹의 모든 멤버 반환
   */
  getGroupMembers(x: T): Set<T> {
    const root = this.find(x)
    const members = new Set<T>()

    this.parent.forEach((_, elem) => {
      if (this.find(elem) === root) {
        members.add(elem)
      }
    })

    return members
  }

  /**
   * 모든 요소 목록 반환
   */
  getAllElements(): T[] {
    return Array.from(this.parent.keys())
  }
}

/**
 * Edge 목록으로부터 연결 그룹 계산
 *
 * @example
 * const elements = ["c-1", "c-2", "c-3"]
 * const edges = [
 *   { source: "c-1", target: "c-2" },
 *   { source: "c-2", target: "c-3" }
 * ]
 * const groups = calculateConnectedGroups(elements, edges)
 * // → Map { "c-1" => Set(["c-1", "c-2", "c-3"]) }
 */
export function calculateConnectedGroups<T>(
  elements: T[],
  edges: Array<{ source: T; target: T }>
): Map<T, Set<T>> {
  const uf = new UnionFind(elements)

  // 모든 edge에 대해 union 수행
  edges.forEach(({ source, target }) => {
    uf.union(source, target)
  })

  return uf.getGroups()
}

/**
 * 특정 요소가 속한 그룹의 모든 멤버 반환 (헬퍼 함수)
 */
export function getConnectedGroup<T>(
  element: T,
  allElements: T[],
  edges: Array<{ source: T; target: T }>
): T[] {
  const uf = new UnionFind(allElements)

  edges.forEach(({ source, target }) => {
    uf.union(source, target)
  })

  return Array.from(uf.getGroupMembers(element))
}
