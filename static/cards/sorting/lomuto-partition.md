# Lomuto `partition` procedure

This method isn't good enough in practice.

Take `pivot=A[rIdx]`. Iterate `A` with `i` and `j`, `i` goes forward and looking
`A[i] <= pivot`, `j` follows `i` and keeps track of last element of right part.
So between `i` and `j` all elements are greater than `pivot`. When `i` finds
element we can swap `A[i]` with `A[j+1]` and move forward `j++`. After all
`j` will point to last element in right part. All we need to swap `pivot's` `lIdx`
with `j + 1`, it's place for `pivot`, and return `j + 1`.

<details>

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
  // We were itereting i till
  // (lIdx - 1) here we place pivot
  // to right position
  swap(a, j + 1, lIdx)
  // And return index of pivot
  return j + 1
}
```

</details>

