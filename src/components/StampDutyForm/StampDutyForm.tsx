// StampDutyForm.tsx
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchInstruments } from '../../services/stampDutyService';
import { jurisdictionApi } from '../../services/http';
import { Instrument, GenderOption, SelectionResponse } from '../../types/stampDuty';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StampDutyFormProps {
  initialMarketValue?: number;
  initialLocationData?: any;
}

const StampDutyForm: React.FC<StampDutyFormProps> = ({
  initialMarketValue,
  initialLocationData,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<number[]>([]);
  const [selectedSubInstruments, setSelectedSubInstruments] = useState<{
    [key: number]: string[];
  }>({});
  const [instrumentGenders, setInstrumentGenders] = useState<{
    [key: number]: GenderOption;
  }>({});
  const [agreementValue, setAgreementValue] = useState<number>(0);
  const [marketValue, setMarketValue] = useState<number>(initialMarketValue || 0);
  const [isMarketValuePrefilled, setIsMarketValuePrefilled] = useState<boolean>(!!initialMarketValue);

  useEffect(() => {
    if (initialMarketValue) {
      setMarketValue(initialMarketValue);
      setIsMarketValuePrefilled(true);
    }
  }, [initialMarketValue]);

  const [baseValue, setBaseValue] = useState<number | null>(null);
  const [stampDuty, setStampDuty] = useState<number | null>(null);
  const [surcharge, setSurcharge] = useState<number | null>(null);
  const [cess, setCess] = useState<number | null>(null);
  const [registrationFees, setRegistrationFees] = useState<number | null>(null);
  const [totalFees, setTotalFees] = useState<number | null>(null);
  const [totalPayable, setTotalPayable] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionResults, setSelectionResults] = useState<SelectionResponse[] | null>(null);

  const genderOptions: GenderOption[] = ['Male', 'Female', 'Joint'];

  // Helper function for Indian number formatting
  const formatIndianCurrency = (value: number | null): string => {
    if (value === null || isNaN(value)) return '0';
    return new Intl.NumberFormat('en-IN').format(Math.round(value));
  };

  // Load market value from props or location state
  useEffect(() => {
    const state = location.state as { initialMarketValue?: number } | undefined;
    if (state?.initialMarketValue) {
      setMarketValue(state.initialMarketValue);
      setAgreementValue(state.initialMarketValue);
    } else if (initialMarketValue) {
      setMarketValue(initialMarketValue);
      setAgreementValue(initialMarketValue);
    }
  }, [initialMarketValue, location.state]);

  // First pie data for duty breakdown
  const pieData = useMemo(() => {
    return {
      labels: ['Stamp Duty', 'Surcharge', 'Cess', 'Registration Fees'],
      datasets: [
        {
          data: [stampDuty || 0, surcharge || 0, cess || 0, registrationFees || 0],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [stampDuty, surcharge, cess, registrationFees]);

  // ✅ FIXED: Second pie shows Property Value vs Total Duty & Fees
  const totalPayablePieData = useMemo(() => {
    if (baseValue === null || totalPayable === null || baseValue <= 0 || totalPayable <= 0) {
      return null;
    }
    return {
      labels: ['Property Value', 'Stamp Duty & Fees'],
      datasets: [{
        data: [baseValue, totalPayable],
        backgroundColor: ['#E5E7EB', '#3B82F6'],
        borderWidth: 1,
      }],
    };
  }, [baseValue, totalPayable]);

  // Common tooltip callback for currency formatting
  const currencyTooltipCallback = (context: any) => {
    const value = context.parsed;
    return formatIndianCurrency(value);
  };

  // Pie chart options with interactive tooltips
  const pieOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            label += currencyTooltipCallback(context);
            return label;
          },
          afterLabel: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `(${percentage}%)`;
          }
        }
      },
      title: {
        display: true,
        text: 'Stamp Duty Breakdown',
        font: {
          size: 16,
          weight: 700,
        },
        color: '#374151'
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }), []);

  // ✅ FIXED: Updated title and logic for second pie
  const totalPayablePieOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) label += ': ';
            label += formatIndianCurrency(context.parsed);
            return label;
          },
          afterLabel: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `(${percentage}%)`;
          }
        }
      },
      title: {
        display: true,
        text: 'Property Value vs Duty & Fees',
        font: {
          size: 16,
          weight: 700,
        },
        color: '#374151'
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }), [baseValue, totalPayable, formatIndianCurrency]);

  useEffect(() => {
    const loadInstruments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchInstruments();
        setInstruments(data);
      } catch (e) {
        setError('Failed to load instruments from backend');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadInstruments();
  }, []);

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numeric = Number(value.replace(/[^0-9.]/g, '')) || 0;
    if (id === 'marketValue') setMarketValue(numeric);
    if (id === 'agreementValue') setAgreementValue(numeric);
  };

  const handleInstrumentChange = (id: number) => {
    setSelectedInstruments((prev) => {
      if (prev.includes(id)) {
        setSelectedSubInstruments((prevSub) => {
          const newSub = { ...prevSub };
          delete newSub[id];
          return newSub;
        });
        setInstrumentGenders((prevGenders) => {
          const newGenders = { ...prevGenders };
          delete newGenders[id];
          return newGenders;
        });
        return prev.filter((s) => s !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSubInstrumentChange = (instrumentSerial: string, subId: string) => {
    setSelectedSubInstruments((prev) => ({
      ...prev,
      [instrumentSerial]: prev[instrumentSerial]
        ? (prev[instrumentSerial].includes(subId)
            ? prev[instrumentSerial].filter((id) => id !== subId)
            : [...prev[instrumentSerial], subId])
        : [subId],
    }));
  };

  const handleInstrumentGenderChange = (id: number, gender: GenderOption) => {
    setInstrumentGenders((prev) => ({
      ...prev,
      [id]: gender,
    }));
  };

  const calculateStampDuty = async () => {
    const missingGender = selectedInstruments.some((id) => !instrumentGenders[id]);
    if (selectedInstruments.length === 0 || !marketValue || missingGender) {
      alert('Please select at least one instrument and choose a gender for each.');
      return;
    }
    const currentBaseValue = Math.max(marketValue, agreementValue);
    setBaseValue(currentBaseValue);
    const payload = selectedInstruments.map((id) => ({
      instrumentId: id,
      selectedOption: instrumentGenders[id],
    }));
    try {
      setLoading(true);
      setError(null);
      const res = await jurisdictionApi.post('/jurisdictionInfo/selections', payload);
      const results: SelectionResponse[] = res.data;
      setSelectionResults(results);
      const individualAmounts = results.map(r => Math.round(currentBaseValue * (r.dutyValue / 100)));
      const totalDutyAmount = individualAmounts.reduce((sum, amount) => sum + amount, 0);
      setStampDuty(totalDutyAmount);
      const surcharge = 0;
      setSurcharge(surcharge);
      const cess = 0;
      setCess(cess);
      const registrationFeesAmount = Math.min(currentBaseValue * 0.085, 10000);
      setRegistrationFees(registrationFeesAmount);
      const totalAdditionalFees = surcharge + cess + registrationFeesAmount;
      setTotalFees(totalAdditionalFees);
      const totalPayableAmount = totalDutyAmount + totalAdditionalFees;
      setTotalPayable(totalPayableAmount);
    } catch (e) {
      setError('Failed to calculate stamp duty. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveCalculation = () => {
    if (!selectionResults) {
      alert('No calculation to save. Please calculate first.');
      return;
    }
    const calcData = {
      marketValue,
      agreementValue,
      selectedInstruments,
      instrumentGenders,
      selectionResults,
      baseValue,
      stampDuty,
      surcharge,
      cess,
      registrationFees,
      totalFees,
      totalPayable,
    };
    localStorage.setItem('stampDutyCalculation', JSON.stringify(calcData));
    alert('Calculation saved successfully!');
  };

  const printBill = () => {
    window.print();
  };

  const resetForm = () => {
    setSelectedInstruments([]);
    setSelectedSubInstruments({});
    setInstrumentGenders({});
    setAgreementValue(0);
    setMarketValue(0);
    setBaseValue(null);
    setStampDuty(null);
    setSurcharge(null);
    setCess(null);
    setRegistrationFees(null);
    setTotalFees(null);
    setTotalPayable(null);
    setSelectionResults(null);
    setError(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading instruments...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Assam Stamp Duty Calculator
          </h2>
          <p className="text-gray-600 mb-6">
            Select one or more instruments below. If an instrument has sub-types, checkboxes will appear.
          </p>
          <div className="flex items-center mb-4">
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('navigate-to-tab', {
                    detail: { tab: 'valuation-calculator', locationData: initialLocationData },
                  })
                );
              }}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 w-full">
          {/* Left Column: Calculate Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="marketValue" className="block text-sm font-medium text-gray-700 mb-2">
                  Market Value (₹)
                </label>
                <input
                  id="marketValue"
                  type="text"
                  value={formatIndianCurrency(marketValue)}
                  onChange={handleNumericInput}
                  placeholder="e.g., 1,00,00,000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="agreementValue" className="block text-sm font-medium text-gray-700 mb-2 relative">
                  Consideration Value (₹)
                  <span className="ml-2 cursor-help text-gray-500" title="This value is the consideration amount for the instrument.">ℹ️</span>
                </label>
                <input
                  id="agreementValue"
                  type="text"
                  value={formatIndianCurrency(agreementValue)}
                  onChange={handleNumericInput}
                  placeholder="e.g., 1,00,00,000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Instruments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instruments.map((inst) => (
                  <label
                    key={inst.id}
                    className={`flex items-center p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                      selectedInstruments.includes(inst.id)
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedInstruments.includes(inst.id)}
                      onChange={() => handleInstrumentChange(inst.id)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      <strong>{inst.id}.</strong> {inst.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-6 space-y-6">
              {selectedInstruments.map((id) => {
                const instrument = instruments.find((inst) => inst.id === id);
                if (!instrument) return null;
                return (
                  <div key={id} className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Options for {instrument.name} (ID: {id})
                    </h3>
                    <div className="flex items-center space-x-6">
                      <label className="text-sm font-medium text-gray-700">Select Gender:</label>
                      <div className="flex space-x-8">
                        {genderOptions.map((g) => (
                          <label key={g} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`gender-${id}`}
                              checked={instrumentGenders[id] === g}
                              onChange={() => handleInstrumentGenderChange(id, g)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-900">{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={calculateStampDuty}
                disabled={selectedInstruments.length === 0 || !marketValue || selectedInstruments.some(id => !instrumentGenders[id]) || loading}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform ${
                  selectedInstruments.length > 0 && marketValue && !selectedInstruments.some(id => !instrumentGenders[id]) && !loading
                    ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {loading ? 'Calculating...' : 'Calculate Duty'}
              </button>
              <button
                type="button"
                onClick={saveCalculation}
                disabled={!selectionResults}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform ${
                  selectionResults
                    ? 'bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Save
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          {/* Right Column: Bill Generation */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 w-full">
            {selectionResults ? (
              <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full w-full">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold">Stamp Duty Calculation Bill</h3>
                    <p className="text-blue-100 mt-1">Generated on {new Date().toLocaleDateString('en-IN')}</p>
                  </div>
                  <button
                    onClick={printBill}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    🖨️ Print
                  </button>
                </div>
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Market Value:</span>
                      <span className="font-semibold text-gray-900">₹{formatIndianCurrency(marketValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Consideration Value:</span>
                      <span className="font-semibold text-gray-900">₹{formatIndianCurrency(agreementValue)}</span>
                    </div>
                    <div className="flex justify-between md:col-span-2">
                      <span className="font-medium text-gray-700">Final Amount Used:</span>
                      <span className="font-semibold text-blue-600">₹{formatIndianCurrency(baseValue)} (Higher of Market/Consideration)</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Instrument Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Instrument</th>
                          <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Option</th>
                          <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Rate (%)</th>
                          <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectionResults.map((r, index) => {
                          const individualAmount = Math.round((baseValue || 0) * (r.dutyValue / 100));
                          return (
                            <tr key={r.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{r.instrumentName}</td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{r.selectedOption}</td>
                              <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{r.dutyValue}%</td>
                              <td className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">₹{formatIndianCurrency(individualAmount)}</td>
                            </tr>
                          );
                        })}
                        <tr className="bg-blue-50 font-semibold">
                          <td colSpan={3} className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">Total Stamp Duty:</td>
                          <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">₹{formatIndianCurrency(stampDuty)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Fees & Charges</h4>
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                          <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={stampDuty ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">Stamp Duty</td>
                          <td className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">₹{formatIndianCurrency(stampDuty)}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">Surcharge</td>
                          <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">₹{formatIndianCurrency(surcharge)}</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">Cess</td>
                          <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">₹{formatIndianCurrency(cess)}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">Registration Fees</td>
                          <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">₹{formatIndianCurrency(registrationFees)}</td>
                        </tr>
                        <tr className="bg-blue-50 border-t-2 border-blue-200 font-bold">
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">Total Amount</td>
                          <td className="border border-gray-300 px-4 py-3 text-right text-sm text-blue-800">₹{formatIndianCurrency(totalPayable)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* ✅ Pie Charts - Now Fixed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {pieData && (
                      <div className="w-full">
                        <h5 className="text-md font-semibold text-gray-900 mb-2">Duty Breakdown</h5>
                        <div className="w-full h-64">
                          <Pie data={pieData} options={pieOptions} />
                        </div>
                      </div>
                    )}
                    {totalPayablePieData && (
                      <div className="w-full">
                        <h5 className="text-md font-semibold text-gray-900 mb-2">Property Value vs Duty & Fees</h5>
                        <div className="w-full h-64">
                          <Pie data={totalPayablePieData} options={totalPayablePieOptions} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    <p>* Calculations based on Assam Stamp Duty rules. Subject to change. Consult official sources for final verification.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 w-full">
                <div className="text-6xl mb-4">🧮</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Stamp Duty Calculator</h4>
                <p className="text-gray-600 mb-4">Enter values, select instruments, and calculate to see your bill here.</p>
                <div className="text-sm text-gray-500">
                  <p>Quick steps:</p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Input Market & Consideration Values</li>
                    <li>Select Instruments & Genders</li>
                    <li>Click Calculate Duty</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StampDutyForm;