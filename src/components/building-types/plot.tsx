import axios from "axios";
import { useEffect, useState } from "react";

export interface DistrictDetails {
  name: string;
  districtCode: string;
  lat: number;
  lng: number;
  areaType?: string;
  localBody?: string;
  ward?: string;
  guidelineLocation?: string;
  circle?: string;
  village?: string;
}

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

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
        const districtList: string[] = [];
        
        for (const feature of geoJson.features) {
          const name = feature.properties.district;
          if (name && (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon")) {
            districtCentroids[normalize(name)] = getCentroid(feature.geometry.coordinates);
            if (!districtList.includes(name)) {
              districtList.push(name);
            }
          }
        }

        let enriched: DistrictDetails[] = [];

        // Try to fetch backend district metadata
        try {
          const response = await axios.get("http://localhost:8081/masterData/getAllDistrictDetails", {
            timeout: 3000
          });
          const baseData = response.data?.data || [];

          // Merge backend data with coordinates
          enriched = baseData.map((dist: any) => {
            const key = normalize(dist.districtName);
            const geo = districtCentroids[key] || { lat: 0, lng: 0 };

            if (!districtCentroids[key]) {
              console.warn(`No GeoJSON match found for district: "${dist.districtName}"`);
            }

            return {
              name: dist.districtName,
              districtCode: dist.districtCode,
              lat: geo.lat,
              lng: geo.lng,
              areaType: "Urban",
              localBody: "",
              ward: "",
              guidelineLocation: "",
            };
          });
        } catch (apiError) {
          console.warn("Backend API not available, using GeoJSON data only:", apiError);
          
          // Fallback: Use GeoJSON data to create districts
          enriched = districtList.map((districtName, index) => {
            const key = normalize(districtName);
            const geo = districtCentroids[key] || { lat: 0, lng: 0 };

            return {
              name: districtName,
              districtCode: `DIST${String(index + 1).padStart(3, '0')}`,
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
