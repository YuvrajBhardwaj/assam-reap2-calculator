import React, { useRef, useEffect, useState } from "react";
import { loadModules } from "esri-loader";
import { toast } from "@/components/ui/use-toast";
import { DistrictDetails, useAssamDistrictDetails } from "./building-types/plot";
import type MapView from "@arcgis/core/views/MapView";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import type GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import type GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import type Point from "@arcgis/core/geometry/Point";
import type Graphic from "@arcgis/core/Graphic";

// Define Assam boundaries and center
const ASSAM_BOUNDS = {
  xmin: 89.7,
  ymin: 24.1,
  xmax: 96.0,
  ymax: 28.2
};
const ASSAM_CENTER = [92.9376, 26.2006];

interface ArcGISMapComponentProps {
  initialLocation?: string | null;
  markerLocations?: DistrictDetails[];
  onMarkerClick?: (location: DistrictDetails) => void; 
  selectedDistrict?: DistrictDetails | null;
  searchText?: string;
  searchType?: string;
}

const ArcGISMapComponent: React.FC<ArcGISMapComponentProps> = ({
  initialLocation,
  markerLocations,
  onMarkerClick,
  selectedDistrict,
  searchText,
  searchType,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const graphicLayerRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [districtGraphics, setDistrictGraphics] = useState<Graphic[]>([]);
  const [searchGraphic, setSearchGraphic] = useState<Graphic | null>(null);
  const { districts } = useAssamDistrictDetails();
  
  const markers = markerLocations || districts;

  useEffect(() => {
    let view: MapView;
    let graphicLayer: GraphicsLayer;
    let boundaryLayer: GeoJSONLayer;

    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/GeoJSONLayer",
        "esri/layers/GraphicsLayer",
        "esri/geometry/Point",
        "esri/Graphic",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/PopupTemplate",
        "esri/geometry/Extent",
      ],
      { css: true }
    )
      .then(([MapClass, MapViewClass, GeoJSONLayer, GraphicsLayer, PointClass, GraphicClass, SimpleMarkerSymbol, PopupTemplate, ExtentClass]) => {
        const map = new MapClass({
          basemap: "streets-navigation-vector"
        });

        // Add Assam boundary layer
        boundaryLayer = new GeoJSONLayer({
          url: "/assam.geojson",
          blendMode: "multiply",
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-fill",
              color: [0, 0, 0, 0],
              outline: {
                color: [35, 99, 235],
                width: 2
              },
          popupTemplate: {
            title: "Assam State Boundary",
            content: "All attributes: {*}"
          },
            },
          },
        });
        map.add(boundaryLayer);

        // Graphics layer for markers
        graphicLayer = new GraphicsLayer();
        map.add(graphicLayer);

        // Initialize map view
        view = new MapViewClass({
          container: mapRef.current!,
          map,
          center: ASSAM_CENTER,
          zoom: 7,


        });

        // Store references
        viewRef.current = view;
        graphicLayerRef.current = graphicLayer;
        (mapRef.current as any).__view = view;

        // Add district markers
        const addDistrictMarkers = () => {
          markers.forEach((location) => {
            const isSelected = selectedDistrict?.name === location.name;

            const point = new PointClass({
              longitude: location.lng,
              latitude: location.lat
            });

            const markerSymbol = new SimpleMarkerSymbol({
              color: isSelected ? [0, 122, 255] : [255, 69, 0],
              size: isSelected ? 12 : 10,
              outline: {
                color: [255, 255, 255],
                width: 2
              }
            });

            const graphic = new GraphicClass({
              geometry: point,
              symbol: markerSymbol,
              attributes: location,
              popupTemplate: new PopupTemplate({
                title: "{name}",
                content: `
                  <div>
                    <p><strong>Area Type:</strong> {areaType}</p>
                    <p><strong>Coordinates:</strong> {lat}, {lng}</p>
                    <p><strong>Local Body:</strong> {localBody}</p>
                  </div>
                `
              })
            });

            graphicLayer.add(graphic);
          });
        };

        addDistrictMarkers();
        setDistrictGraphics(graphicLayer.graphics.toArray());

        // Handle map clicks
        view.on("click", async (event) => {
          const response = await view.hitTest(event);
          const graphicHit = response.results.find(
            (result): result is __esri.MapViewGraphicHit =>
              result.type === "graphic" &&
              result.graphic.layer === graphicLayer
          );

          if (graphicHit?.graphic && graphicHit.graphic.attributes) {
            const attrs = graphicHit.graphic.attributes;
            const district: DistrictDetails = {
              name: attrs.name,
              districtCode: attrs.districtCode || '',
              lat: attrs.lat,
              lng: attrs.lng,
              areaType: attrs.areaType,
              localBody: attrs.localBody,
              ward: attrs.ward,
              guidelineLocation: attrs.guidelineLocation,
              circle: attrs.circle,
              village: attrs.village,
            };

            if (onMarkerClick) {
              onMarkerClick(district);
            }

            view.goTo({
              center: [district.lng, district.lat],
              zoom: 12
            });

            toast({
              title: "District Selected",
              description: `${district.name} district selected`,
            });
          }
        });

        // Handle search functionality
        if (searchText && (searchType === "By Address" || searchType === "Free Text")) {
          handleSearch(searchText, view, graphicLayer, PointClass, GraphicClass, SimpleMarkerSymbol);
        }

      })
      .catch((err) => {
        console.error("ArcGIS load error:", err);
        toast({
          title: "Map Load Error",
          description: err.message || "Failed to load the map",
          variant: "destructive",
        });
      });

    return () => {
      if (view) {
        view.destroy();
        viewRef.current = null;
        graphicLayerRef.current = null;
      }
    };
  }, []);

  // Handle marker updates when selectedDistrict changes
  useEffect(() => {
    if (!viewRef.current || !graphicLayerRef.current) return;

    loadModules(["esri/Graphic", "esri/symbols/SimpleMarkerSymbol", "esri/geometry/Point", "esri/PopupTemplate"])
      .then(([GraphicClass, SimpleMarkerSymbol, PointClass, PopupTemplate]) => {
        const view = viewRef.current!;
        const graphicLayer = graphicLayerRef.current!;

        // Clear existing district markers only
        const graphics = graphicLayer.graphics.toArray();
        graphics.forEach((graphic: any) => {
          if (graphic.attributes && graphic.attributes.name && graphic.attributes.lat) {
            graphicLayer.remove(graphic);
          }
        });

        // Re-add district markers
        markers.forEach((location) => {
          const isSelected = selectedDistrict?.name === location.name;

          const point = new PointClass({
            longitude: location.lng,
            latitude: location.lat
          });

          const markerSymbol = new SimpleMarkerSymbol({
            color: isSelected ? [0, 122, 255] : [255, 69, 0],
            size: isSelected ? 12 : 10,
            outline: {
              color: [255, 255, 255],
              width: 2
            }
          });

          const graphic = new GraphicClass({
            geometry: point,
            symbol: markerSymbol,
            attributes: location,
            popupTemplate: new PopupTemplate({
              title: "{name}",
              content: `
                <div>
                  <p><strong>Area Type:</strong> {areaType}</p>
                  <p><strong>Coordinates:</strong> {lat}, {lng}</p>
                  <p><strong>Local Body:</strong> {localBody}</p>
                </div>
              `
            })
          });

          graphicLayer.add(graphic);
        });

        if (selectedDistrict) {
          view.goTo({
            center: [selectedDistrict.lng, selectedDistrict.lat],
            zoom: 12
          });
        }
      });
  }, [selectedDistrict, markers]);

  // Handle search trigger
  useEffect(() => {
    if (searchText && (searchType === "By Address" || searchType === "Free Text")) {
      if (!viewRef.current || !graphicLayerRef.current) return;

      loadModules(["esri/geometry/Point", "esri/Graphic", "esri/symbols/SimpleMarkerSymbol"])
        .then(([PointClass, GraphicClass, SimpleMarkerSymbol]) => {
          handleSearch(searchText, viewRef.current!, graphicLayerRef.current!, PointClass, GraphicClass, SimpleMarkerSymbol);
        });
    }
  }, [searchText, searchType]);

  // Search function
  const handleSearch = (searchQuery: string, view: any, graphicLayer: any, PointClass: any, GraphicClass: any, SimpleMarkerSymbol: any) => {
    if (!searchQuery.trim()) return;

    // Remove previous search marker
    if (searchGraphic) {
      graphicLayer.remove(searchGraphic);
      setSearchGraphic(null);
    }

    const query = `${searchQuery}, Assam, India`;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) throw new Error('No results');

        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        // Check if location is within Assam bounds
        if (
          lat < ASSAM_BOUNDS.ymin ||
          lat > ASSAM_BOUNDS.ymax ||
          lon < ASSAM_BOUNDS.xmin ||
          lon > ASSAM_BOUNDS.xmax
        ) {
          throw new Error('Location outside Assam');
        }

        const point = new PointClass({
          longitude: lon,
          latitude: lat
        });

        const searchSymbol = new SimpleMarkerSymbol({
          color: [255, 0, 0],
          size: 14,
          outline: {
            color: [255, 255, 255],
            width: 3
          }
        });

        const newSearchGraphic = new GraphicClass({
          geometry: point,
          symbol: searchSymbol,
          attributes: {
            name: "Search Result",
            description: result.display_name
          }
        });

        graphicLayer.add(newSearchGraphic);
        setSearchGraphic(newSearchGraphic);
        setSelectedLocation(result.display_name);

        view.goTo({
          center: [lon, lat],
          zoom: 12
        });

        toast({
          title: 'Location Found',
          description: result.display_name,
        });
      })
      .catch((error) => {
        toast({
          title: 'Location Not Found',
          description:
            error.message === 'Location outside Assam'
              ? 'The location is outside Assam state boundaries.'
              : 'We couldn\'t find that location in Assam. Please try another search.',
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full rounded-lg" />
      {selectedLocation && (
        <div className="absolute bottom-2 left-2 z-30 bg-white p-2 rounded shadow-md text-xs">
          <strong>Selected:</strong> {selectedLocation}
        </div>
      )}
    </div>
  );
};

export default ArcGISMapComponent;
