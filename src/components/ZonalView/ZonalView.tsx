import React, { useState, useEffect } from 'react';
import {
  getAllDistricts,
  getCirclesByDistrict,
  getMouzasByDistrictAndCircle,
  getZonalValues,
} from '@/services/locationService';

import type { District, Circle, Mouza } from '@/types/masterData';

/* ----------  Re-usable grid ---------- */
interface GridProps<T extends { name: string; code: string }> {
  items: T[];
  selected: string | null;
  onSelect: (item: T) => void;
  search: string;
}
const CardGrid = <T extends { name: string; code: string }>({
  items,
  selected,
  onSelect,
  search,
}: GridProps<T>) => {
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {filtered.map((i) => (
        <button
          key={i.code}
          onClick={() => onSelect(i)}
          className={`p-3 rounded shadow text-sm font-semibold text-white transition
                      ${selected === i.code ? 'bg-red-700' : 'bg-red-600 hover:scale-105'}`}
        >
          {i.name}
        </button>
      ))}
    </div>
  );
};

/* ----------  Main component ---------- */
const ZonalView: React.FC = () => {
  type Step = 0 | 1 | 2;
  const [step, setStep] = useState<Step>(0);
  const [search, setSearch] = useState('');

  const [districts, setDistricts] = useState<District[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [mouzas, setMouzas] = useState<Mouza[]>([]);

  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [selectedMouza, setSelectedMouza] = useState<Mouza | null>(null);

  // Update the type for zonalDetails to match the API response structure
  const [zonalDetails, setZonalDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  /* 1. districts */
  useEffect(() => {
    getAllDistricts().then(setDistricts);
  }, []);

  /* 2. circles */
  useEffect(() => {
    if (!selectedDistrict) return;
    setLoading(true);
    getCirclesByDistrict(selectedDistrict.code)
      .then(setCircles)
      .finally(() => setLoading(false));
  }, [selectedDistrict]);

  /* 3. mouzas */
  useEffect(() => {
    if (!selectedDistrict || !selectedCircle) return;
    setLoading(true);
    getMouzasByDistrictAndCircle(
      selectedDistrict.code,
      selectedCircle.code
    )
      .then(setMouzas)
      .finally(() => setLoading(false));
  }, [selectedDistrict, selectedCircle]);

  /* 4. zonal details (fetch from API) */
  useEffect(() => {
    if (!selectedDistrict || !selectedCircle || !selectedMouza) {
      setZonalDetails(null);
      return;
    }

    setLoading(true);
    getZonalValues(
      selectedDistrict.code,
      selectedCircle.code,
      selectedMouza.code
    )
      .then((data) => {
        // Assuming the API returns an array with one object, take the first one
        if (data && data.length > 0) {
          setZonalDetails(data[0]);
        } else {
          setZonalDetails(null);
        }
      })
      .catch((error) => {
        console.error('Error fetching zonal values:', error);
        setZonalDetails(null);
      })
      .finally(() => setLoading(false));
  }, [selectedMouza, selectedDistrict, selectedCircle]);

  /* ----------  Render helpers ---------- */
  const labels = ['District', 'Circle', 'Mouza'];

  const renderDistricts = () => (
    <>
      <h2 className="text-lg font-semibold mb-3">Select District</h2>
      <CardGrid
        items={districts}
        selected={selectedDistrict?.code || null}
        search={search}
        onSelect={(item) => {
          const d = districts.find(i => i.code === item.code)!;
          setSelectedDistrict(d);
          setSelectedCircle(null);
          setSelectedMouza(null);
          setSearch('');
          setStep(1);
        }}
      />
    </>
  );

  const renderCircles = () => (
    <>
      <button
        onClick={() => {
          setStep(0);
          setSearch('');
        }}
        className="mb-4 px-4 py-2 border rounded text-sm font-semibold"
      >
        ← Back to District
      </button>
      <h2 className="text-lg font-semibold mb-3">
        Circles in{' '}
        <span className="text-red-600">{selectedDistrict?.name}</span>
      </h2>
      {loading ? (
        <p className="text-sm text-gray-600">Loading circles…</p>
      ) : (
          <CardGrid
            items={circles}
            selected={selectedCircle?.code || null}
            search={search}
            onSelect={(item) => {
              const c = circles.find(i => i.code === item.code)!;
              setSelectedCircle(c);
              setSelectedMouza(null);
              setSearch('');
              setStep(2);
            }}
          />
      )}
    </>
  );

  const renderMouzas = () => (
    <>
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => {
            setStep(0);
            setSearch('');
          }}
          className="px-4 py-2 border rounded text-sm font-semibold"
        >
          ← District
        </button>
        <button
          onClick={() => {
            setStep(1);
            setSearch('');
          }}
          className="px-4 py-2 border rounded text-sm font-semibold"
        >
          ← Circles
        </button>
      </div>
      <h2 className="text-lg font-semibold mb-3">
        Mouzas in <span className="text-red-600">{selectedCircle?.name}</span>
      </h2>
      {loading ? (
        <p className="text-sm text-gray-600">Loading mouzas…</p>
      ) : (
          <CardGrid
            items={mouzas}
            selected={selectedMouza?.code || null}
            search={search}
            onSelect={(item) => {
              const m = mouzas.find(i => i.code === item.code)!;
              setSelectedMouza(m);
              setSearch('');
              // No need to set step here, as the useEffect for zonalDetails will trigger
            }}
          />
      )}
    </>
  );

  const renderZonal = () => {
    if (!zonalDetails) {
      return <p className="text-sm text-gray-600">Loading zonal details…</p>;
    }

    // Map API response keys to display names for Land Values
    const landValuesMap: { [key: string]: string } = {
      irrigatedPerSqmRate: 'Irrigated Land',
      unIrrigatedPerSqmRate: 'Unirrigated Land',
      // Add other land types as needed based on your API response
    };

    // Map API response keys to display names for Plot values
    const plotValuesMap: { [key: string]: string } = {
      plotResidentialPerSqmRate: 'Residential',
      plotCommercialPerSqmRate: 'Commercial',
      industrialPerSqmRate: 'Industrial',
      // Add other plot types as needed
    };

    // Map API response keys to display names for Building values
    const buildingValuesMap: { [key: string]: string } = {
      rccPerSqmRate: 'RCC',
      rbcPerSqmRate: 'RBC',
      tin_shadePerSqmRate: 'Tin Shade',
      kaccha_kabeluPerSqmRate: 'Kaccha Kabelu',
      // Add other building types as needed
    };

    return (
      <>
        <div className="mb-4 flex gap-3">
          <button
            onClick={() => {
              setSelectedMouza(null);
              setZonalDetails(null);
            }}
            className="px-4 py-2 border rounded text-sm font-semibold"
          >
            ← Mouzas
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">
          Zonal values for {selectedMouza?.name},
          {selectedCircle?.name}, {selectedDistrict?.name}
        </h2>

        {/* Land-value table */}
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Land Type
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold">
                  Value per Sqm
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(zonalDetails)
                .filter(([key]) => landValuesMap[key])
                .map(([key, val]) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{landValuesMap[key]}</td>
                    <td className="px-4 py-2 text-sm text-right">₹{String(val)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Full guideline details */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Guideline Location</h3>
          <table className="min-w-full border mb-4 text-sm">
            <tbody>
              <tr>
                <td className="px-3 py-2 border">District</td>
                <td className="px-3 py-2 border">{selectedDistrict?.name}</td>
                <td className="px-3 py-2 border">Area Type</td>
                <td className="px-3 py-2 border">Urban</td> {/* Assuming static for now */}
              </tr>
              <tr>
                <td className="px-3 py-2 border">Local Body</td>
                <td className="px-3 py-2 border">{selectedMouza?.name} Local Body</td> {/* Assuming based on mouza */}
                <td className="px-3 py-2 border">Ward</td>
                <td className="px-3 py-2 border">Ward 1</td> {/* Assuming static for now */}
              </tr>
              <tr>
                <td className="px-3 py-2 border">Guideline Location</td>
                <td className="px-3 py-2 border" colSpan={3}>
                  {selectedMouza?.name}, {selectedCircle?.name}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex flex-wrap gap-6">
            {/* Plot */}
            <div className="w-full sm:w-[calc(50%-0.75rem)]">
              <h4 className="bg-gray-100 px-3 py-1 font-semibold rounded-t">Plot (Sqm)</h4>
              <table className="min-w-full border text-sm">
                <tbody>
                  {Object.entries(zonalDetails)
                    .filter(([key]) => plotValuesMap[key])
                    .map(([key, val]) => (
                      <tr key={key}>
                        <td className="px-3 py-2 border">{plotValuesMap[key]}</td>
                        <td className="px-3 py-2 border">₹{String(val)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Building */}
            <div className="w-full sm:w-[calc(50%-0.75rem)]">
              <h4 className="bg-gray-100 px-3 py-1 font-semibold rounded-t">
                Building Residential (Sqm)
              </h4>
              <table className="min-w-full border text-sm">
                <tbody>
                  {Object.entries(zonalDetails)
                    .filter(([key]) => buildingValuesMap[key])
                    .map(([key, val]) => (
                      <tr key={key}>
                        <td className="px-3 py-2 border">{buildingValuesMap[key]}</td>
                        <td className="px-3 py-2 border">₹{String(val)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  };

  /* ----------  Main render ---------- */
  return (
    <div className="p-6 bg-red-50 min-h-screen">
      {/* Search */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">
          {selectedMouza && zonalDetails ? 'Zonal Values' : labels[step]}: {/* Update label */}
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${labels[step].toLowerCase()}…`}
          className="w-full max-w-md p-2 border rounded"
        />
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 mb-4">
        {labels.map((l, idx) => (
          <button
            key={l}
            disabled
            className={`px-4 py-1 rounded text-sm font-semibold
                        ${(!selectedMouza && step === idx) || (selectedMouza && idx === 2)
                          ? 'bg-red-700 text-white'
                          : 'bg-white border'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Content */}
      {!selectedMouza && step === 0 && renderDistricts()}
      {!selectedMouza && step === 1 && selectedDistrict && renderCircles()}
      {!selectedMouza && step === 2 && selectedCircle && renderMouzas()}
      {selectedMouza && zonalDetails && renderZonal()} {/* Only render zonal if data is available */}
      {selectedMouza && loading && <p className="text-sm text-gray-600">Loading zonal details…</p>}
    </div>
  );
};

export default ZonalView;