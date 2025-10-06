'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
// import { DistrictDetails, findDistrictDetails } from './building-types/plot';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { findDistrictDetails } from './building-types/plot';

// Fix default marker icons
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ASSAM_BOUNDS: L.LatLngBoundsLiteral = [
  [24.1, 89.7], // Southwest
  [28.2, 96.0], // Northeast
];
const ASSAM_CENTER: L.LatLngTuple = [26.2006, 92.9376];
const DEFAULT_ZOOM = 7;

interface LeafletMapComponentProps {
  initialLocation?: string | null;
  markerLocations?: any[];
  onMarkerClick?: (location: any) => void;
  selectedDistrict?: any | null;
  searchText?: string; // Added for external search trigger
  searchType?: string; // Added for external search trigger
  resetMapTrigger?: number; // triggers map reset
  // NEW: custom point selection support
  onMapClick?: (lat: number, lng: number) => void;
  selectedCoordinates?: { lat: number; lng: number } | null;
}

const LeafletMapComponent = ({
  initialLocation,
  markerLocations = [],
  onMarkerClick,
  selectedDistrict,
  searchText: propSearchText, // Renamed to avoid conflict with state
  searchType,
  resetMapTrigger,
  // NEW props
  onMapClick,
  selectedCoordinates,
}: LeafletMapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null); // Ref to keep track of the search marker
  // NEW: a marker for the user selected point
  const selectedPointMarkerRef = useRef<L.Marker | null>(null);

  // keep references to layers
  const layersRef = useRef({
    base: { osm: null as L.TileLayer | null, satellite: null as L.TileLayer | null },
    overlays: {
      admin: null as L.GeoJSON<any> | null,
      roads: null as L.TileLayer | null,
      markers: null as L.LayerGroup | null,
      mask: null as L.Polygon | null,
    },
    adminBounds: null as L.LatLngBounds | null,
  });

  // UI control states (SAMPADA-like)
  const [basemap, setBasemap] = useState<'osm' | 'satellite'>('osm');
  const [adminVisible, setAdminVisible] = useState(true);
  const [adminOpacity, setAdminOpacity] = useState(1);
  const [roadsVisible, setRoadsVisible] = useState(false);
  const [roadsOpacity, setRoadsOpacity] = useState(0.6);
  const [markersVisible, setMarkersVisible] = useState(true); // pre-enable markers
  const [coords, setCoords] = useState<[number, number] | null>(null);
  // Hide the control panel initially so users can explore the map
  const [showPanel, setShowPanel] = useState(false);

  // track previous selected district to avoid repeated re-centering
  const prevSelectedRef = useRef<string | null>(null);

  // Custom Icons
  const blueMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const redMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    const mapInstance = L.map(mapRef.current, {
      center: ASSAM_CENTER,
      zoom: DEFAULT_ZOOM,
      // Allow full-world view; mask will hide outside Assam
      minZoom: 2,
      maxZoom: 18,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Allow selecting custom point on map
    mapInstance.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (onMapClick) onMapClick(lat, lng);
      // Drop or move a marker at the selected point
      if (selectedPointMarkerRef.current) {
        mapInstance.removeLayer(selectedPointMarkerRef.current);
        selectedPointMarkerRef.current = null;
      }
      selectedPointMarkerRef.current = L.marker([lat, lng])
        .addTo(mapInstance)
        .bindPopup('Selected Location')
        .openPopup();
    });

    // basemaps
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    });
    const satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google',
    });

    osm.addTo(mapInstance);
    layersRef.current.base.osm = osm;
    layersRef.current.base.satellite = satellite;

    // Optional roads overlay (placeholder)
    const roads = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenTopoMap contributors',
      opacity: 0.6,
    });
    layersRef.current.overlays.roads = roads;

    // Load Assam boundary geojson (admin boundaries)
    fetch('/assam.geojson')
      .then((res) => res.json())
      .then((geojson) => {
        const adminLayer = L.geoJSON(geojson, {
          style: () => ({ color: '#dc2626', weight: 2, fillOpacity: 0 }),
          onEachFeature: (feature, layer) => {
            const dName = feature.properties?.DISTRICT || feature.properties?.district || 'District';
            layer.bindTooltip(dName, { sticky: true });
            layer.on('click', () => {
              const details = findDistrictDetails(dName);
              if (details) {
                mapInstance.flyTo([details.lat, details.lng], 17, { animate: true, duration: 0.75 });
                if (onMarkerClick) onMarkerClick(details);
                toast({ title: 'District Selected', description: dName });
              }
            });
          },
        });
        if (adminVisible) adminLayer.addTo(mapInstance);
        layersRef.current.overlays.admin = adminLayer;
        layersRef.current.adminBounds = adminLayer.getBounds();

        // Create a large rectangle covering the world, with Assam cut out (mask outside)
        const worldRect: L.LatLngTuple[] = [
          [85, -180],
          [85, 180],
          [-85, 180],
          [-85, -180],
          [85, -180],
        ];

        // Collect all outer boundaries from all features
        let assamHoles: L.LatLngTuple[][] = [];
        if (geojson.features && geojson.features.length > 0) {
          geojson.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
              assamHoles.push(
                feature.geometry.coordinates[0]
                  .map((coord: number[]) => [coord[1], coord[0]] as L.LatLngTuple)
                  .reverse()
              );
            } else if (feature.geometry.type === 'MultiPolygon') {
              feature.geometry.coordinates.forEach((polygon: any) => {
                if (Array.isArray(polygon) && Array.isArray(polygon[0])) {
                  assamHoles.push(
                    (polygon[0] as number[][])
                      .map((coord: number[]) => [coord[1], coord[0]] as L.LatLngTuple)
                      .reverse()
                  );
                }
              });
            }
          });
        }

        if (assamHoles.length > 0) {
          const mask = L.polygon([worldRect, ...assamHoles], {
            color: 'transparent',
            fillColor: 'white',
            fillOpacity: 1,
            stroke: false,
            interactive: false,
            pane: 'overlayPane',
          });
          mask.addTo(mapInstance);
          layersRef.current.overlays.mask = mask;
        }

        // Fit to Assam bounds on initial load for a good overview
        mapInstance.fitBounds(layersRef.current.adminBounds!);
      })
      .catch((error) => {
        console.error('Error loading Assam GeoJSON:', error);
      });

    // Set initial center coordinates and update only on moveend/zoomend
    const updateCenterCoords = () => {
      const c = mapInstance.getCenter();
      setCoords([c.lat, c.lng]);
    };
    updateCenterCoords();
    mapInstance.on('moveend zoomend', updateCenterCoords);

    setMap(mapInstance);
    return () => {
      mapInstance.off('moveend zoomend', updateCenterCoords);
      mapInstance.remove();
    };
  }, []);

  // Sync selectedCoordinates from parent into a marker on the map
  useEffect(() => {
    if (!map) return;
    if (selectedPointMarkerRef.current) {
      map.removeLayer(selectedPointMarkerRef.current);
      selectedPointMarkerRef.current = null;
    }
    if (selectedCoordinates) {
      selectedPointMarkerRef.current = L.marker([selectedCoordinates.lat, selectedCoordinates.lng])
        .addTo(map)
        .bindPopup('Selected Location');
    }
  }, [map, selectedCoordinates]);

  // Update Markers Layer (without changing view unless selection changes)
  useEffect(() => {
    if (!map) return;

    // Remove previous markers layer group if exists
    const existing = layersRef.current.overlays.markers;
    if (existing) {
      existing.clearLayers();
      if (map.hasLayer(existing)) map.removeLayer(existing);
    }

    // Add/update district markers into a LayerGroup
    const group = L.layerGroup();
    if (markerLocations.length > 0) {
      markerLocations.forEach((location) => {
        const isSelected = selectedDistrict?.name === location.name;
        const marker = L.marker([location.lat, location.lng], {
          icon: isSelected ? blueMarkerIcon : redMarkerIcon,
        } as L.MarkerOptions)
          .on('click', () => {
            if (onMarkerClick) {
              onMarkerClick(location);
            }
          })
          .bindPopup(`<b>${location.name}</b><br>${location.areaType}`)
          .bindTooltip(location.name, { sticky: true });
        marker.addTo(group);
      });
    }
    layersRef.current.overlays.markers = group;
    if (markersVisible) group.addTo(map);

    // Do not change view here; handled by separate effect when selection changes
  }, [map, markerLocations, selectedDistrict, onMarkerClick, markersVisible]);

  // When selected district changes, pan to it once without changing user's zoom level
  useEffect(() => {
    if (!map || !selectedDistrict) return;
    const prev = prevSelectedRef.current;
    if (prev === selectedDistrict.name) return;
    prevSelectedRef.current = selectedDistrict.name;
    // Zoom in to level 18 on selection while keeping interactions enabled
    map.flyTo([selectedDistrict.lat, selectedDistrict.lng], 18, { animate: true, duration: 0.75 });
  }, [map, selectedDistrict]);

  // Respond to basemap switch
  useEffect(() => {
    if (!map) return;
    const { osm, satellite } = layersRef.current.base;
    if (!osm || !satellite) return;
    if (basemap === 'osm') {
      if (!map.hasLayer(osm)) osm.addTo(map);
      if (map.hasLayer(satellite)) map.removeLayer(satellite);
    } else {
      if (!map.hasLayer(satellite)) satellite.addTo(map);
      if (map.hasLayer(osm)) map.removeLayer(osm);
    }
  }, [map, basemap]);

  // Respond to admin visibility/opacity
  useEffect(() => {
    if (!map) return;
    const admin = layersRef.current.overlays.admin;
    if (!admin) return;
    if (adminVisible) {
      if (!map.hasLayer(admin)) admin.addTo(map);
    } else if (map.hasLayer(admin)) {
      map.removeLayer(admin);
    }
    admin.setStyle({ opacity: adminOpacity, color: '#dc2626', weight: 2, fillOpacity: 0 });
  }, [map, adminVisible, adminOpacity]);

  // Ensure map interactions remain enabled after selection
  useEffect(() => {
    if (!map) return;
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
  }, [map, selectedDistrict]);

  // Respond to roads overlay
  useEffect(() => {
    if (!map) return;
    const roads = layersRef.current.overlays.roads;
    if (!roads) return;
    roads.setOpacity(roadsOpacity);
    if (roadsVisible) {
      if (!map.hasLayer(roads)) roads.addTo(map);
    } else if (map.hasLayer(roads)) {
      map.removeLayer(roads);
    }
  }, [map, roadsVisible, roadsOpacity]);

  // Trigger search when searchText prop changes from parent
  useEffect(() => {
    if (propSearchText && (searchType === 'By Address' || searchType === 'Free Text') && map) {
      handleSearch(propSearchText);
    }
  }, [propSearchText, searchType, map]);

  // Handle external reset trigger
  useEffect(() => {
    if (!map || resetMapTrigger === undefined) return;
    // Reset map view to Assam overview
    const bounds = layersRef.current.adminBounds || L.latLngBounds(ASSAM_BOUNDS);
    map.fitBounds(bounds);
    // Remove any search marker and selection text
    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }
    // Clear selected point marker
    if (selectedPointMarkerRef.current) {
      map.removeLayer(selectedPointMarkerRef.current);
      selectedPointMarkerRef.current = null;
    }
    setSelectedLocation(null);
    // Optionally reset overlays to defaults
    setBasemap('osm');
    setAdminVisible(true);
    setRoadsVisible(false);
    setMarkersVisible(true);
  }, [resetMapTrigger, map]);

  // Handle Search (drops a static marker at result)
  const handleSearch = (textToSearch: string) => {
    const currentSearchText = textToSearch;
    if (!currentSearchText.trim() || !map) return;

    // Remove previous search-specific marker if it exists
    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }

    const searchQuery = `${currentSearchText}, Assam, India`;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) throw new Error('No results');

        const loc = data[0];
        const lat = parseFloat(loc.lat);
        const lon = parseFloat(loc.lon);

        if (
          lat < ASSAM_BOUNDS[0][0] ||
          lat > ASSAM_BOUNDS[1][0] ||
          lon < ASSAM_BOUNDS[0][1] ||
          lon > ASSAM_BOUNDS[1][1]
        ) {
          throw new Error('Location outside Assam');
        }

        map.setView([lat, lon], 12);
        // Add a marker for the searched location (static at result point)
        const newSearchMarker = L.marker([lat, lon], { icon: redMarkerIcon })
          .addTo(map)
          .bindPopup(`<b>Searched:</b><br>${loc.display_name}`)
          .openPopup();
        searchMarkerRef.current = newSearchMarker; // Store reference to the new search marker
        setSelectedLocation(loc.display_name);

        toast({ title: 'Location Found', description: loc.display_name });
      })
      .catch((error) => {
        toast({
          title: 'Location Not Found',
          description:
            (error as any).message === 'Location outside Assam'
              ? 'The location is outside Assam state boundaries.'
              : 'We couldn’t find that location in Assam. Please try another search.',
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="relative h-full w-full">
      {/* Hamburger toggle button */}
      <div className="absolute top-4 right-4 z-[10000]">
        <Button
          size="icon"
          aria-label={showPanel ? 'Hide map controls' : 'Show map controls'}
          variant="secondary"
          className="rounded-full shadow border border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-800"
          onClick={() => setShowPanel((s) => !s)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Map */}
      <div ref={mapRef} className="h-full w-full rounded-lg" />

      {/* Floating layer control panel (SAMPADA-like) */}
      {showPanel && (
        <div className="absolute top-4 right-4 z-[9999] w-72 max-h-[70vh]">
          <div className="bg-slate-900/95 text-slate-100 rounded-xl shadow-2xl border border-slate-700 backdrop-blur-md overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <Accordion type="multiple" defaultValue={['basemap', 'admin', 'markers']}>
                <AccordionItem value="basemap">
                  <AccordionTrigger className="uppercase tracking-wide text-xs text-slate-200">
                    Basemap
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[11px] uppercase tracking-wider text-slate-300">Satellite</span>
                      <Switch checked={basemap === 'satellite'} onCheckedChange={(v) => setBasemap(v ? 'satellite' : 'osm')} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="admin">
                  <AccordionTrigger className="uppercase tracking-wide text-xs text-slate-200">
                    Admin
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-slate-300">Boundary</span>
                        <Switch checked={adminVisible} onCheckedChange={setAdminVisible} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="uppercase tracking-wider">Opacity</span>
                          <span>{Math.round(adminOpacity * 100)}%</span>
                        </div>
                        <Slider value={[adminOpacity * 100]} onValueChange={(v) => setAdminOpacity((v?.[0] || 0) / 100)} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="roads">
                  <AccordionTrigger className="uppercase tracking-wide text-xs text-slate-200">
                    Roads
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wider text-slate-300">Show Roads</span>
                        <Switch checked={roadsVisible} onCheckedChange={setRoadsVisible} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="uppercase tracking-wider">Opacity</span>
                          <span>{Math.round(roadsOpacity * 100)}%</span>
                        </div>
                        <Slider value={[roadsOpacity * 100]} onValueChange={(v) => setRoadsOpacity((v?.[0] || 0) / 100)} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="markers">
                  <AccordionTrigger className="uppercase tracking-wide text-xs text-slate-200">
                    Markers
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[11px] uppercase tracking-wider text-slate-300">Show Markers</span>
                      <Switch checked={markersVisible} onCheckedChange={setMarkersVisible} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                {/* Future groups can go here */}
              </Accordion>
            </div>
          </div>
        </div>
      )}

      {selectedLocation && (
        <div className="absolute bottom-8 left-2 z-[9000] bg-slate-900/85 text-slate-100 border border-slate-700 p-2 rounded-md shadow-md text-[11px]">
          <strong className="font-semibold tracking-wide uppercase text-[10px] text-slate-300">Selected:</strong>{' '}
          <span className="text-slate-100">{selectedLocation}</span>
        </div>
      )}
      {/* Coordinates box (center coords) */}
      {coords && (
        <div className="absolute bottom-2 left-2 z-[9000] bg-slate-900/85 text-slate-100 border border-slate-700 px-2 py-1 rounded-md shadow text-[11px] font-mono">
          {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
        </div>
      )}
      {/* Selected point coordinates */}
      {selectedCoordinates && (
        <div className="absolute bottom-14 left-2 z-[9000] bg-slate-900/85 text-slate-100 border border-slate-700 px-2 py-1 rounded-md shadow text-[11px] font-mono">
          Selected: {selectedCoordinates.lat.toFixed(5)}, {selectedCoordinates.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
};

export default LeafletMapComponent;
