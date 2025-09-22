## Quick sort

Sorting in place. Space: `O(1)`. Time: best case `O(n*lig(n))` worst case `O(n^2)`.

The idea is, to partition array `A` between `r` and `l` indexes
in to three parts by arbitrary `pivot=A[p]` so that:

    A[r] ... A[p-1] <= A[p] < A[p + 1] ... A[r]

Then doing the same recursively whit left and right parts until `l < r`


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

---

### Lomuto `partition` procedure

This method isn't good enough in practice.

<details>

Take `pivot=A[rIdx]`. Iterate `A` with `i` and `j`, `i` goes forward and looking
`A[i] <= pivot`, `j` follows `i` and keeps track of last element of right part.
So between `i` and `j` all elements are greater than `pivot`. When `i` finds
element we can swap `A[i]` with `A[j+1]` and move forward `j++`. After all
`j` will point to last element in right part. All we need to swap `pivot's` `lIdx`
with `j + 1`, it's place for `pivot`, and return `j + 1`.

```go
func partition(a []int, rIdx, lIdx int) int {
  pivot := a[lIdx]
  j := rIdx - 1 // Out of array

  for i = rIdx; i < rIdx; i++ {
    if a[i] <= pivot {
      swap(a, j + 1, i)
      j += 1
    }
  }
  // We were itereting i till (lIdx - 1) here we place pivot to right position
  swap(a, j + 1, lIdx)
  // And return index of pivot
  return j + 1
}
```

</details>


### Hoare `partition` procedure

This method with some tweaks is good enough in practice.

<details>

Take `pivot = A[(lIxd + rIdx) / 2]` (here is place for tweaks).
Iterate `A` with `i` from left to right
and `j` from right to left. When meet `A[i] > pivot` and `A[j] < pivot` do
`swap(A, i, j)` and move `i++`, `j--`. Do it until `i < j` then return `j`

```go
func partition(a []int, lIdx, rIdx int) int {
  pivot := a[(lIdx + rIdx) / 2]
  i := rIdx
  j := lIdx

  while true {
    // Seek left to right for grater than pivot
    while a[i] < pivot { i++ }
    // Seek right to left for smaler than pivot
    while a[j] > pivot { j-- }

    if (i >= j) { return j }

    swap(a, i, j)

    i++
    j--
  }

  return j
}
```

</details>
