import { useEffect, useState } from 'react';

import {
  getAllDistricts,
  getCirclesByDistrict,
  getMouzasByDistrictAndCircle,
  getLotsByDistrictAndCircleAndMouza,
  getVillagesByDistrictAndCircleAndMouzaAndLot,
} from '@/services/locationService';

import {
  getParameterDetailsAll,
  getSubParameterDetailsAllByParameterCode,
  type Parameter,
  type SubParameter,
} from '@/services/parameterService';

import { getAllLandCategoriesByMouza, fetchLandClassMappings } from '@/services/masterDataService';

import type { District, Circle, Mouza, Village, Lot, LandClass } from '@/types/masterData';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Home, Layers, Ruler, Search, CheckCircle2, XCircle, RotateCcw, Calculator } from 'lucide-react';

// Extended Types
interface MouzaExtended extends Mouza {
  basePriceMouza?: number;
}

interface VillageExtended extends Village {
  basePriceVillage?: number;
  landUseFactor?: number;
  landCategory?: string;
}

interface TableRowData {
  slNo: number;
  plotNo: string;
  mouzaBase: number;
  lotFactor: number;
  landUseMultiplier: number;
  selections: Record<string, SubParameter | null>;
  status: 'pending' | 'approved' | 'rejected';
  calculatedValue?: number;
}

export default function PlotLookup() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [mouzas, setMouzas] = useState<MouzaExtended[]>([]);
  const [villages, setVillages] = useState<VillageExtended[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [plotNumbers, setPlotNumbers] = useState<string[]>([]);
  const [landCategories, setLandCategories] = useState<LandClass[]>([]);

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('');
  const [selectedMouza, setSelectedMouza] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedPlotNo, setSelectedPlotNo] = useState('');

  const [selectedMouzaDetails, setSelectedMouzaDetails] = useState<MouzaExtended | null>(null);
  const [selectedVillageDetails, setSelectedVillageDetails] = useState<VillageExtended | null>(null);

  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [subParameters, setSubParameters] = useState<Record<string, SubParameter[]>>({});
  const [tableRows, setTableRows] = useState<TableRowData[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [loadingParams, setLoadingParams] = useState(false);

  // Realistic Plot Numbers
  const generateRealisticPlotNumbers = (): string[] => {
    const plots: string[] = [];
    const prefixes = ['DAG-', 'KH-', 'RS-', 'CS-', 'BS-', 'SA-'];
    const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];

    for (let i = 0; i < 120; i++) {
      const rand = Math.random();
      if (rand < 0.35) plots.push(`DAG-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`);
      else if (rand < 0.6) plots.push(String(Math.floor(Math.random() * 9000) + 1000));
      else if (rand < 0.8) {
        const year = years[Math.floor(Math.random() * years.length)];
        plots.push(`RS-${year}/${Math.floor(Math.random() * 200) + 1}`);
      } else {
        plots.push(`${Math.floor(Math.random() * 900) + 100}/${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`);
      }
    }
    return [...new Set(plots)].sort(() => 0.5 - Math.random()).slice(0, 80);
  };

  const initialDemoPlots = [
    'DAG-0456', 'KH-7890', 'RS-2021/123', '5678', '234/09',
    'CS-2020/45', 'DAG-1123', '9876', 'RS-2023/89', '145/12'
  ];

  // Load Districts
  useEffect(() => {
    getAllDistricts().then(data => setDistricts(data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedMouza) {
      getAllLandCategoriesByMouza(selectedMouza).then(data => setLandCategories(data || [])).catch(console.error);
    } else {
      setLandCategories([]);
    }
  }, [selectedMouza]);

  // Cascading Effects
  useEffect(() => {
    if (selectedDistrict) {
      getCirclesByDistrict(selectedDistrict).then(setCircles).catch(() => setCircles([]));
    } else setCircles([]);
    resetLowerSelections();
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedDistrict && selectedCircle) {
      getMouzasByDistrictAndCircle(selectedDistrict, selectedCircle)
        .then(data => {
          setMouzas(data || []);
          const selected = data?.find(m => m.code === selectedMouza);
          setSelectedMouzaDetails(selected || null);
        })
        .catch(() => { setMouzas([]); setSelectedMouzaDetails(null); });
    } else {
      setMouzas([]); setSelectedMouzaDetails(null);
    }
    resetLowerSelectionsFromMouza();
  }, [selectedDistrict, selectedCircle]);

  useEffect(() => {
    if (selectedDistrict && selectedCircle && selectedMouza) {
      getLotsByDistrictAndCircleAndMouza(selectedDistrict, selectedCircle, selectedMouza)
        .then(setLots).catch(() => setLots([]));
    } else setLots([]);
    resetLowerSelectionsFromLot();
  }, [selectedDistrict, selectedCircle, selectedMouza]);

  useEffect(() => {
    if (selectedDistrict && selectedCircle && selectedMouza && selectedLotId) {
      const lot = lots.find(l => l.code === selectedLotId);
      if (lot) {
        getVillagesByDistrictAndCircleAndMouzaAndLot(selectedDistrict, selectedCircle, selectedMouza, lot.code)
          .then(data => {
            setVillages(data || []);
            const selected = data?.find(v => v.code === selectedVillage);
            setSelectedVillageDetails(selected || null);
          })
          .catch(() => { setVillages([]); setSelectedVillageDetails(null); });
      }
    } else {
      setVillages([]); setSelectedVillageDetails(null);
    }
    resetLowerSelectionsFromVillage();
  }, [selectedDistrict, selectedCircle, selectedMouza, selectedLotId, lots]);

  useEffect(() => {
    const isComplete = selectedDistrict && selectedCircle && selectedMouza && selectedLotId && selectedVillage;
    if (isComplete) {
      setPlotNumbers(generateRealisticPlotNumbers());
    } else if (!selectedDistrict && !selectedCircle && !selectedMouza && !selectedVillage && !selectedLotId) {
      setPlotNumbers(initialDemoPlots);
    } else {
      setPlotNumbers([]);
    }
    setSelectedPlotNo('');
  }, [selectedDistrict, selectedCircle, selectedMouza, selectedLotId, selectedVillage]);

  useEffect(() => {
    if (selectedMouza && mouzas.length > 0) {
      const mouza = mouzas.find(m => m.code === selectedMouza);
      setSelectedMouzaDetails(mouza || null);
    }
  }, [selectedMouza, mouzas]);

  useEffect(() => {
    if (selectedVillage && villages.length > 0) {
      const village = villages.find(v => v.code === selectedVillage);
      setSelectedVillageDetails(village || null);
    }
  }, [selectedVillage, villages]);

  const resetLowerSelections = () => {
    setSelectedCircle(''); setSelectedMouza(''); setSelectedLotId(''); setSelectedVillage(''); setSelectedPlotNo('');
  };
  const resetLowerSelectionsFromMouza = () => {
    setSelectedMouza(''); setSelectedLotId(''); setSelectedVillage(''); setSelectedPlotNo('');
  };
  const resetLowerSelectionsFromLot = () => {
    setSelectedLotId(''); setSelectedVillage(''); setSelectedPlotNo('');
  };
  const resetLowerSelectionsFromVillage = () => {
    setSelectedVillage(''); setSelectedPlotNo('');
  };

  // Fetch Parameters & Add Row
  const handleFetch = async () => {
    if (!selectedPlotNo) return alert('Please select Plot No / Daag No');

    setLoadingParams(true);
    try {
      let currentParams = parameters;
      if (currentParams.length === 0) {
        const res = await getParameterDetailsAll();
        currentParams = res.data || [];
        setParameters(currentParams);
      }

      const newSubParams = { ...subParameters };
      await Promise.all(
        currentParams.map(async (p) => {
          if (!newSubParams[p.parameterCode]) {
            const res = await getSubParameterDetailsAllByParameterCode(p.parameterCode);
            newSubParams[p.parameterCode] = res.data || [];
          }
        })
      );
      setSubParameters(newSubParams);

      const lotFactor = lots.find(l => l.code === selectedLotId)?.basePriceIncreaseLot || 0;
      let landUseMultiplier = 1;

      if (selectedVillageDetails?.landCategory && landCategories.length > 0) {
        const match = landCategories.find(c =>
          c.name?.toLowerCase() === selectedVillageDetails.landCategory!.toLowerCase()
        );
        if (match?.basePriceMouzaIncrease !== undefined) {
          landUseMultiplier = 1 + (match.basePriceMouzaIncrease / 100);
        }
      }

      const newRow: TableRowData = {
        slNo: tableRows.length + 1,
        plotNo: selectedPlotNo,
        mouzaBase: selectedMouzaDetails?.basePriceMouza || 0,
        lotFactor,
        landUseMultiplier,
        selections: {},
        status: 'pending'
      };

      setTableRows(prev => [...prev, newRow]);
      setShowTable(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load parameters');
    } finally {
      setLoadingParams(false);
    }
  };

  const handleClearForm = () => {
    setSelectedDistrict(''); setSelectedCircle(''); setSelectedMouza(''); setSelectedLotId(''); setSelectedVillage(''); setSelectedPlotNo('');
    setPlotNumbers([]); setSelectedMouzaDetails(null); setSelectedVillageDetails(null);
  };

  const handleResetTable = () => {
    setTableRows([]); setShowTable(false);
  };

  const handleApprove = (i: number) => setTableRows(prev => { const u = [...prev]; u[i].status = 'approved'; return u; });
  const handleReject = (i: number) => setTableRows(prev => { const u = [...prev]; u[i].status = 'rejected'; return u; });
  const handleApproveAll = () => setTableRows(prev => prev.map(r => ({ ...r, status: 'approved' })));
  const handleRejectAll = () => setTableRows(prev => prev.map(r => ({ ...r, status: 'rejected' })));

  const handleSelectionChange = (i: number, code: string, id: string) => {
    setTableRows(prev => {
      const updated = [...prev];
      const sub = subParameters[code]?.find(s => s.subParameterGenId.toString() === id) || null;
      updated[i].selections[code] = sub;
      return updated;
    });
  };

  const calculateParameterTotalPct = (row: TableRowData) =>
    Object.values(row.selections).reduce((sum, sp) => sum + (sp?.basePriceIncreaseSubParameter || 0), 0);

  const calculateFinalValue = (row: TableRowData): number => {
    if (!row.mouzaBase) return 0;
    const paramPct = calculateParameterTotalPct(row) / 100;
    const finalValue = row.mouzaBase * (1 + row.lotFactor / 100) * row.landUseMultiplier * (1 + paramPct);
    return Number(finalValue.toFixed(2));
  };

  const handleCalculateRow = (i: number) => {
    setTableRows(prev => {
      const updated = [...prev];
      updated[i].calculatedValue = calculateFinalValue(updated[i]);
      return updated;
    });
  };

  const handleCalculateAll = () => {
    setTableRows(prev => prev.map(row => ({ ...row, calculatedValue: calculateFinalValue(row) })));
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-full space-y-8">
      {/* Location Selection */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Search className="w-8 h-8 text-blue-700" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">Plot / Daag Valuation Lookup</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearForm} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Clear Form
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {[
              { label: "District", icon: MapPin, value: selectedDistrict, onChange: setSelectedDistrict, items: districts, disabled: false },
              { label: "Circle", icon: Layers, value: selectedCircle, onChange: setSelectedCircle, items: circles, disabled: !selectedDistrict },
              { label: "Mouza", icon: Home, value: selectedMouza, onChange: setSelectedMouza, items: mouzas, disabled: !selectedCircle },
              { label: "LOT", icon: Ruler, value: selectedLotId, onChange: setSelectedLotId, items: lots, disabled: !selectedMouza },
              { label: "Village", icon: Home, value: selectedVillage, onChange: setSelectedVillage, items: villages, disabled: !selectedLotId },
              { label: "Plot / Daag No", icon: MapPin, value: selectedPlotNo, onChange: setSelectedPlotNo, items: plotNumbers.map(p => ({ code: p, name: p })), disabled: !selectedVillage },
            ].map(({ label, icon: Icon, value, onChange, items, disabled }) => (
              <div key={label} className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Icon className="w-4 h-4" /> {label}
                </Label>
                <Select value={value} onValueChange={onChange} disabled={disabled || loadingParams}>
                  <SelectTrigger>
                    <SelectValue placeholder={disabled ? "Select above" : `Select ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {(items || []).map(item => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleFetch}
              disabled={!selectedPlotNo || loadingParams}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-12 py-6 text-lg rounded-xl shadow-lg"
            >
              {loadingParams ? 'Loading Parameters...' : 'Fetch Valuation Details'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Valuation Table - Fully Fixed & Responsive */}
      {showTable && parameters.length > 0 && (
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calculator className="w-8 h-8 text-emerald-600" />
                <CardTitle className="text-2xl font-bold">Land Valuation Calculation</CardTitle>
              </div>
              <Button variant="destructive" size="sm" onClick={handleResetTable} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reset Table
              </Button>
            </div>
          </CardHeader>
          {/* Replace the entire CardContent of the valuation table with this */}

<CardContent className="p-0">
  {/* Excel-Style Sticky Table */}
  <div className="overflow-auto max-h-screen">
    <div className="inline-block min-w-full align-middle">
      <Table className="min-w-full">
        <TableHeader className="sticky top-0 z-30 bg-gray-800">
          <TableRow className="bg-gray-800 hover:bg-gray-800">
            {/* Frozen Sl.No */}
            <TableHead className="sticky left-0 top-0 z-50 bg-gray-800 text-white font-semibold text-sm h-14 text-center whitespace-nowrap border-r border-gray-700">
              Sl.No
            </TableHead>
            {/* Frozen Plot No */}
            <TableHead className="sticky left-12 top-0 z-50 bg-gray-800 text-white font-semibold text-sm h-14 text-center whitespace-nowrap border-r border-gray-700 shadow-[8px_0_10px_-5px_rgba(0,0,0,0.4)]">
              Plot No
            </TableHead>

            <TableHead className="text-center text-white font-semibold text-sm h-14 whitespace-nowrap">Mouza Base</TableHead>
            <TableHead className="text-center text-white font-semibold text-sm h-14 whitespace-nowrap">Lot Factor</TableHead>
            <TableHead className="text-center text-white font-semibold text-sm h-14 whitespace-nowrap">Land Use</TableHead>
            {parameters.map(p => (
              <TableHead key={p.parameterCode} colSpan={2} className="text-center text-white font-semibold text-sm h-14 bg-gray-700 whitespace-nowrap">
                {p.parameterName}
              </TableHead>
            ))}
            <TableHead className="text-center text-white font-semibold text-sm h-14 whitespace-nowrap">Total %</TableHead>
            <TableHead className="text-center text-white font-semibold text-sm h-14 whitespace-nowrap">Final Value</TableHead>
            <TableHead className="text-center text-white font-semibold text-sm h-14 whitespace-nowrap">Calculate</TableHead>
            <TableHead className="text-center text-white font-semibold text-sm h-14 whitespace-nowrap">Action</TableHead>
          </TableRow>

          {/* Sub Header Row */}
          <TableRow className="bg-gray-100 sticky top-14 z-30">
            <TableHead className="sticky left-0 top-14 z-40 bg-gray-100 h-10 border-r border-gray-300"></TableHead>
            <TableHead className="sticky left-12 top-14 z-40 bg-gray-100 h-10 border-r border-gray-300 shadow-[8px_0_10px_-5px_rgba(0,0,0,0.1)]"></TableHead>
            <TableHead className="text-center text-xs text-gray-600 h-10">BDT/decimal</TableHead>
            <TableHead className="text-center text-xs text-gray-600 h-10">% increase</TableHead>
            <TableHead className="text-center text-xs text-gray-600 h-10">multiplier</TableHead>
            {parameters.map(() => (
              <>
                <TableHead className="text-center text-xs text-gray-700 h-10">Band</TableHead>
                <TableHead className="text-center text-xs text-gray-700 h-10">Weight %</TableHead>
              </>
            ))}
            <TableHead className="text-center text-xs text-gray-700 h-10">Param %</TableHead>
            <TableHead className="text-center text-xs text-gray-700 h-10">BDT/decimal</TableHead>
            <TableHead className="h-10"></TableHead>
            <TableHead className="h-10"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tableRows.map((row, i) => (
            <TableRow key={i} className={`hover:bg-gray-50 transition-colors ${row.status === 'approved' ? 'bg-green-50' : row.status === 'rejected' ? 'bg-red-50' : ''}`}>
              {/* Frozen Sl.No */}
              <TableCell className="sticky left-0 z-20 bg-white text-center font-medium whitespace-nowrap border-r border-gray-200 shadow-[8px_0_10px_-5px_rgba(0,0,0,0.1)]">
                {row.slNo}
              </TableCell>

              {/* Frozen Plot No - Always Visible */}
              <TableCell className="sticky left-12 z-20 bg-white text-center font-bold text-blue-700 whitespace-nowrap border-r border-gray-200 shadow-[8px_0_10px_-5px_rgba(0,0,0,0.15)]">
                {row.plotNo}
              </TableCell>

              {/* Scrollable Content */}
              <TableCell className="text-center font-semibold text-gray-800">
                {row.mouzaBase > 0 ? `₹${row.mouzaBase.toLocaleString()}` : '-'}
              </TableCell>
              <TableCell className="text-center font-medium text-emerald-600">
                {row.lotFactor > 0 ? `+${row.lotFactor}%` : '-'}
              </TableCell>
              <TableCell className="text-center font-medium text-blue-600">
                {row.landUseMultiplier > 1 ? `×${row.landUseMultiplier.toFixed(2)}` : '×1.00'}
              </TableCell>

              {parameters.map(p => (
                <>
                  <TableCell className="p-2">
                    <Select
                      value={row.selections[p.parameterCode]?.subParameterGenId?.toString() || ""}
                      onValueChange={(v) => handleSelectionChange(i, p.parameterCode, v)}
                      disabled={row.status !== 'pending'}
                    >
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {subParameters[p.parameterCode]?.map(sp => (
                          <SelectItem key={sp.subParameterGenId} value={sp.subParameterGenId.toString()}>
                            {sp.subParameterName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center text-sm font-medium">
                    {row.selections[p.parameterCode]?.basePriceIncreaseSubParameter?.toFixed(1) || "-"}%
                  </TableCell>
                </>
              ))}

              <TableCell className="text-center font-bold text-green-600">
                {calculateParameterTotalPct(row).toFixed(1)}%
              </TableCell>

              <TableCell className="text-center font-bold text-xl text-blue-700">
                {row.calculatedValue ? `₹${row.calculatedValue.toLocaleString()}` : '-'}
              </TableCell>

              <TableCell className="text-center">
                <Button size="sm" onClick={() => handleCalculateRow(i)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Calculator className="w-4 h-4" />
                </Button>
              </TableCell>

              {/* Action: Submit / Reject */}
              <TableCell className="text-center">
                {row.status === 'approved' ? (
                  <div className="text-green-600 font-bold flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-5 h-5" /> Submitted
                  </div>
                ) : row.status === 'rejected' ? (
                  <div className="text-red-600 font-bold flex items-center gap-2 justify-center">
                    <XCircle className="w-5 h-5" /> Rejected
                  </div>
                ) : (
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(i)}>
                      Submit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(i)}>
                      Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>

  {/* Bottom Action Buttons */}
  <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row justify-end gap-4">
    <Button size="lg" onClick={handleCalculateAll} className="bg-blue-600 hover:bg-blue-700">
      <Calculator className="w-5 h-5 mr-2" /> Calculate All
    </Button>
    <Button 
      size="lg" 
      onClick={handleApproveAll} 
      className="bg-green-600 hover:bg-green-700"
      disabled={tableRows.every(r => r.status === 'approved')}
    >
      Submit All
    </Button>
    <Button 
      size="lg" 
      variant="destructive" 
      onClick={handleRejectAll}
      disabled={tableRows.every(r => r.status === 'rejected')}
    >
      Reject All
    </Button>
  </div>
</CardContent>
        </Card>
      )}
    </div>
  );
}