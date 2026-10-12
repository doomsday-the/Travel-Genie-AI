export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}
