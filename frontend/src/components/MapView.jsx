import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'

L.Marker.prototype.options.icon = L.icon({ iconUrl: icon, shadowUrl: shadow, iconAnchor: [12, 41] })

export default function MapView({ places = [], center = [20, 78], zoom = 4 }) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: 360, width: '100%' }}>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      {places.map((p) => (
        <Marker key={p.id} position={[Number(p.latitude), Number(p.longitude)]}>
          <Popup>{p.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
