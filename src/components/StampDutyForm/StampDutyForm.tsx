import { useState, useEffect } from 'react';
import { fetchInstruments } from '../../services/stampDutyService';
import { jurisdictionApi } from '../../services/http'; // Assuming http service is in services/http.ts
import { Instrument, GenderOption, SelectionResponse } from '../../types/stampDuty';

interface StampDutyFormProps {
  initialMarketValue?: number;
}

function StampDutyForm({ initialMarketValue }: StampDutyFormProps) {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<number[]>([]);
  const [selectedSubInstruments, setSelectedSubInstruments] = useState<{
    [key: number]: string[];
  }>({});
  const [instrumentGenders, setInstrumentGenders] = useState<{
    [key: number]: GenderOption;
  }>({});
  const [agreementValue, setAgreementValue] = useState<number>(0);
  const [marketValue, setMarketValue] = useState<number>(0);
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

  useEffect(() => {
    if (typeof initialMarketValue === 'number' && !isNaN(initialMarketValue)) {
      setMarketValue(initialMarketValue);
    }
  }, [initialMarketValue]);

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numeric = Number(value.replace(/[^0-9.]/g, '')) || 0;
    if (id === 'marketValue') setMarketValue(numeric);
    if (id === 'agreementValue') setAgreementValue(numeric);
  };

  const handleInstrumentChange = (id: number) => {
    setSelectedInstruments((prev) => {
      if (prev.includes(id)) {
        // If instrument is deselected, remove its sub-instruments and genders
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

    // Base value is max(marketValue, agreementValue)
    const currentBaseValue = Math.max(marketValue, agreementValue);
    setBaseValue(currentBaseValue);

    const payload = selectedInstruments.map((id) => ({
      instrumentId: id,
      selectedOption: instrumentGenders[id],
    }));

    try {
      setLoading(true);
      setError(null);

      // Fetch rates from backend
      const res = await jurisdictionApi.post('/jurisdictionInfo/selections', payload);
      const results: SelectionResponse[] = res.data;

      setSelectionResults(results);

      // Calculate individual duty amounts and total stamp duty
      const individualAmounts = results.map(r => Math.round(currentBaseValue * (r.dutyValue / 100)));
      const totalDutyAmount = individualAmounts.reduce((sum, amount) => sum + amount, 0);
      setStampDuty(totalDutyAmount);

      // Calculate additional fees (based on Assam rules; adjust as needed from Excel data)
      const surcharge = 0;
      setSurcharge(surcharge);

      const cess = 0;
      setCess(cess);

      const registrationFeesAmount = Math.min(currentBaseValue * 0.085, 10000);
      setRegistrationFees(registrationFeesAmount);

      const totalAdditionalFees = surcharge + cess + registrationFeesAmount;
      setTotalFees(totalAdditionalFees);

      // Total payable: base value + stamp duty + additional fees
      const totalPayableAmount = currentBaseValue + totalDutyAmount + totalAdditionalFees;
      setTotalPayable(totalPayableAmount);  // set Total Payable = base value + stamp duty + additional fees
      setAgreementValue(totalPayableAmount);  // set Consideration Value as Total Payable
    } catch (e) {
      setError('Failed to calculate stamp duty. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading instruments...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Assam Stamp Duty Calculator
          </h2>
          <p className="text-gray-600 mb-6">
            Select one or more instruments below. If an instrument has sub-types, checkboxes will appear.
          </p>

          {/* Instrument Selection */}
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

          {/* Gender Selections */}
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

          {/* Value Inputs */}
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

          {/* Calculate Button */}
          <div className="flex justify-center">
            <button
              onClick={calculateStampDuty}
              disabled={selectedInstruments.length === 0 || !marketValue || selectedInstruments.some(id => !instrumentGenders[id]) || loading}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform ${
                selectedInstruments.length > 0 && marketValue && !selectedInstruments.some(id => !instrumentGenders[id]) && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading ? 'Calculating...' : 'Calculate Stamp Duty'}
            </button>
          </div>
        </div>

        {/* Results - Stamp Duty Bill */}
        {selectionResults && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
              <h3 className="text-2xl font-bold">Stamp Duty Calculation Bill</h3>
              <p className="text-blue-100 mt-1">Generated on {new Date().toLocaleDateString('en-IN')}</p>
            </div>

            {/* Property Details */}
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
                  <span className="font-medium text-gray-700">Base Value Used:</span>
                  <span className="font-semibold text-blue-600">₹{formatIndianCurrency(baseValue)} (Higher of Market/Consideration)</span>
                </div>
              </div>
            </div>

            {/* Instrument Breakdown */}
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

            {/* Fees Breakdown */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Fees & Charges</h4>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">Market Value (Base)</td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">₹{formatIndianCurrency(marketValue)}</td>
                    </tr>
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
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">Grand Total Payable</td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-sm text-blue-800">₹{formatIndianCurrency(totalPayable)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>* Calculations based on Assam Stamp Duty rules. Subject to change. Consult official sources for final verification.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StampDutyForm;