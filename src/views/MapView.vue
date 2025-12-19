<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useReports } from '../composables/useReports';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack/vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const { mapReports, loading, error, fetchMapReports } = useReports();
const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;

const initMap = () => {
  if (!mapContainer.value) return;

  // Default to Jakarta coordinates if no reports or geolocation pending
  const initialLat = -6.2088;
  const initialLng = 106.8456;

  map = L.map(mapContainer.value).setView([initialLat, initialLng], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Fix icons
  const DefaultIcon = L.icon({
      iconUrl,
      iconRetinaUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });
  L.Marker.prototype.options.icon = DefaultIcon;
};

const addMarkers = () => {
  if (!map || !mapReports.value.length) return;

  const markers = L.featureGroup();

  mapReports.value.forEach(report => {
    if (report.latitude && report.longitude) {
      const marker = L.marker([report.latitude, report.longitude])
        .bindPopup(`
          <div class="min-w-[200px]">
             <h3 class="font-bold text-lg">${report.fishReference?.name || 'Unknown Fish'}</h3>
             <p class="text-sm text-gray-600 mb-2">Reported by: ${report.user?.name || 'Anonymous'}</p>
             <img src="${report.photoUrl}" onerror="this.src='/placeholder.png'" class="w-full h-32 object-cover rounded mb-2" />
             <p class="text-sm font-semibold status-${report.status.toLowerCase()}">${report.status}</p>
          </div>
        `);
      markers.addLayer(marker);
    }
  });

  markers.addTo(map!);
  if (markers.getLayers().length > 0) {
      map.fitBounds(markers.getBounds(), { padding: [50, 50] });
  }
};

onMounted(async () => {
  await fetchMapReports();
  initMap();
  addMarkers();
});
</script>

<template>
  <div class="h-[calc(100vh-64px)] w-full relative"> 
    <!-- Full height minus header assumption, or just h-full if container is set -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center z-[1000] bg-white bg-opacity-75">
        <span class="text-lg font-semibold">Loading Map Data...</span>
    </div>
    <div ref="mapContainer" class="h-full w-full z-0"></div>
    <div v-if="error" class="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-100 text-red-700 px-4 py-2 rounded shadow">
        {{ error }}
    </div>
  </div>
</template>

<style scoped>
/* Custom status colors for popup */
:deep(.status-pending) { color: #d97706; }
:deep(.status-approved) { color: #16a34a; }
:deep(.status-rejected) { color: #dc2626; }
:deep(.status-solved) { color: #2563eb; }
</style>