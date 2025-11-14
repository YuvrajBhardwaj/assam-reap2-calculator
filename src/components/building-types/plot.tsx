import axios from "axios";
import { useEffect, useState } from "react";
import { MASTER_DATA_API_BASE_URL } from "../../services/http";

export interface DistrictDetails {
  name: string;
  districtCode?: string;
  lat: number;
  lng: number;
  areaType?: string;
  localBody?: string;
  ward?: string;
  guidelineLocation?: string;
  circle?: string;
  village?: string;
}

const CACHE_EXPIRY_MS = 5 * 60 * 1000;

// Compute centroid of a polygon or multipolygon
const getCentroid = (
  coordinates: number[][][] | number[][][][]
): { lat: number; lng: number } => {
  let latSum = 0;
  let lngSum = 0;
  let count = 0;

  // Normalize all coordinates into an array of rings (number[][])
  let allRings: number[][][] = [];

  // Polygon: coordinates is number[][][]
  if (typeof coordinates[0][0][0] === "number") {
    allRings = coordinates as number[][][];
  } else {
    // MultiPolygon: coordinates is number[][][][]
    allRings = (coordinates as number[][][][]).flat();
  }

  for (const ring of allRings) {
    // TypeScript knows ring is number[][]
    for (const coord of ring) {
      // coord is [lng, lat]
      const [lng, lat] = coord;
      latSum += lat;
      lngSum += lng;
      count++;
    }
  }

  return { lat: latSum / count, lng: lngSum / count };
};




// Normalize names for better matching
const normalize = (name: string) =>
  name
    .toLowerCase()
    .replace(/district|dist\./g, "") // Remove 'district' or 'dist.'
    .replace(/-/g, " ") // Replace hyphens with spaces
    .trim()
    .replace(/[^a-z0-9\s]/g, "") // Remove non-alphanumeric except spaces
    .replace(/\s+/g, " ");

export const useAssamDistrictDetails = () => {
  const [districts, setDistricts] = useState<DistrictDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const cachedData = localStorage.getItem("assamDistrictDetails");
        const cachedTimestamp = localStorage.getItem("assamDistrictCacheTime");
        const now = Date.now();

        if (cachedData && cachedTimestamp && now - Number(cachedTimestamp) < CACHE_EXPIRY_MS) {
          setDistricts(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Fetch local GeoJSON
        const geoRes = await fetch("/assam.geojson");
        const geoJson = await geoRes.json();

        // Map: normalized district name → centroid
        const districtCentroids: Record<string, { lat: number; lng: number }> = {};
        const geoJsonDistrictNames: string[] = [];

        for (const feature of geoJson.features) {
          const name = feature.properties.district;
          if (name && (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon")) {
            districtCentroids[normalize(name)] = getCentroid(feature.geometry.coordinates);
            if (!geoJsonDistrictNames.includes(name)) {
              geoJsonDistrictNames.push(name);
            }
          }
        }

        let enriched: DistrictDetails[] = [];
        const backendDistrictMap: Record<string, any> = {};

        // Try to fetch backend district metadata
        try {
          const response = await axios.get(`${MASTER_DATA_API_BASE_URL}/getAllDistrictDetails`, {
            timeout: 3000
          });
          const baseData = response.data?.data || [];

          baseData.forEach((dist: any) => {
            backendDistrictMap[normalize(dist.districtName)] = dist;
          });

          // Merge GeoJSON data with backend data, prioritizing backend districtCode
          geoJsonDistrictNames.forEach(districtName => {
            const normalizedName = normalize(districtName);
            const geo = districtCentroids[normalizedName] || { lat: 0, lng: 0 };
            const backendDist = backendDistrictMap[normalizedName];

            if (backendDist) {
              enriched.push({
                name: backendDist.districtName,
                districtCode: backendDist.districtCode,
                lat: geo.lat,
                lng: geo.lng,
                areaType: "Urban",
                localBody: "",
                ward: "",
                guidelineLocation: "",
              });
              delete backendDistrictMap[normalizedName]; // Mark as processed
            } else {
              enriched.push({
                name: districtName,
                districtCode: "", // No backend code available
                lat: geo.lat,
                lng: geo.lng,
                areaType: "Urban",
                localBody: "",
                ward: "",
                guidelineLocation: "",
              });
            }
          });

          // Add any remaining backend districts that were not in GeoJSON
          Object.values(backendDistrictMap).forEach((dist: any) => {
            const geo = districtCentroids[normalize(dist.districtName)] || { lat: 0, lng: 0 };
            enriched.push({
              name: dist.districtName,
              districtCode: dist.districtCode,
              lat: geo.lat,
              lng: geo.lng,
              areaType: "Urban",
              localBody: "",
              ward: "",
              guidelineLocation: "",
            });
          });

        } catch (apiError) {
          console.warn("Backend API not available, using GeoJSON data only:", apiError);
          
          // Fallback: Use GeoJSON data to create districts with undefined districtCode
          enriched = geoJsonDistrictNames.map((districtName) => {
            const key = normalize(districtName);
            const geo = districtCentroids[key] || { lat: 0, lng: 0 };

            return {
              name: districtName,
              districtCode: undefined,
              lat: geo.lat,
              lng: geo.lng,
              areaType: "Urban",
              localBody: "",
              ward: "",
              guidelineLocation: "",
            };
          });
        }

        localStorage.setItem("assamDistrictDetails", JSON.stringify(enriched));
        localStorage.setItem("assamDistrictCacheTime", now.toString());

        console.log(`Loaded ${enriched.length} districts:`, enriched);
        setDistricts(enriched);
      } catch (error) {
        console.error("Error fetching Assam district details:", error);
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, []);

  return { districts, loading };
};
