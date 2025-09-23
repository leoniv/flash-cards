# Hoare `partition` procedure

This method with some tweaks is good enough in practice.

Take `pivot = A[(lIxd + rIdx) / 2]` (here is place for tweaks).
Iterate `A` with `i` from left to right
and `j` from right to left. When meet `A[i] > pivot` and `A[j] < pivot` do
`swap(A, i, j)` and move `i++`, `j--`. Do it until `i < j` then return `j`

<details>

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

