## Quick sort

Sorting in place. Space: `O(1)`. Time: best case `O(n*lig(n))` worst case `O(n^2)`.

The idea is, to partition array `A` between `r` and `l` indexes
in to three parts by arbitrary `pivot=A[p]` so that:

```sh
A[r] ... A[p-1] <= A[p] < A[p + 1] ... A[r]
```

Then doing the same recursively whit left and right parts until `l < r`

Here are two `partition` procedure:
- [hoare](sorting/hoare-partition.md)
- [lomuto](sorting/lomuto-partition.md)


<details>

```go
func qsort(in: []int, lIdx, rIdx int) {
  if lIdx < rIdx {
    pivotIdx := partion(in, lIdx, rIdx)

    qsort(lIdx, pivotIdx - 1)
    qsort(in, pivotIdx + 1, rIdx)
  }
}
```

</details>

