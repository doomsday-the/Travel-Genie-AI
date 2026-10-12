export default function Pagination({ page, hasNext, hasPrev, onChange }) {
  return (
    <div>
      <button disabled={!hasPrev} onClick={() => onChange(page - 1)}>Prev</button>
      <span> Page {page} </span>
      <button disabled={!hasNext} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  )
}
