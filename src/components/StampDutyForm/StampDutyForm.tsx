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
    // Auto-calculate agreementValue if not set
    let currentAgreementValue = agreementValue;
    if (!currentAgreementValue || currentAgreementValue === 0) {
      if (!marketValue) {
        alert('Please enter market value.');
        return;
      }
      currentAgreementValue = marketValue;
      setAgreementValue(currentAgreementValue);
    }

    const missingGender = selectedInstruments.some((id) => !instrumentGenders[id]);
    if (selectedInstruments.length === 0 || !marketValue || missingGender) {
      alert('Please select at least one instrument and choose a gender for each.');
      return;
    }

    const currentBaseValue = Math.max(marketValue, currentAgreementValue);
    setBaseValue(currentBaseValue);

    const payload = selectedInstruments.map((id) => ({
      instrumentId: id,
      selectedOption: instrumentGenders[id],
    }));

    try {
      setLoading(true);
      setError(null);

      // Fetch from backend
      const res = await jurisdictionApi.post('/jurisdictionInfo/selections', payload);
      const results: SelectionResponse[] = res.data;

      setSelectionResults(results);

      const totalDuty = results.reduce((sum, r) => sum + (r.dutyValue || 0), 0);
      setStampDuty(totalDuty);

      // Calculate additional fees (based on Assam rules: no standard surcharge/cess for fixed; registration 8.5% capped)
      const surcharge = 0; // No surcharge for fixed duties; adjust if value-based
      setSurcharge(surcharge);

      const cess = 0; // No cess mentioned
      setCess(cess);

      const registrationFees = Math.min(currentAgreementValue * 0.085, 10000);
      setRegistrationFees(registrationFees);

      const totalAdditionalFees = surcharge + cess + registrationFees;
      setTotalFees(totalAdditionalFees);

      const totalPayableAmount = currentAgreementValue + totalDuty + totalAdditionalFees;
      setTotalPayable(totalPayableAmount);
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
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-maroon-700 mb-4">
        Assam Stamp Duty Calculator
      </h2>
      <p className="text-gray-600 mb-4 text-sm">
        Select one or more instruments below. If an instrument has sub-types, checkboxes will appear.
      </p>

      {/* Instrument Checkboxes (Multi Select Behavior) */}
      <div className="mb-6 max-h-96 overflow-y-auto border border-gray-200 rounded-md p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {instruments.map((inst) => (
            <label
              key={inst.id}
              className={`flex items-start p-3 rounded cursor-pointer border ${
                selectedInstruments.includes(inst.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedInstruments.includes(inst.id)}
                onChange={() => handleInstrumentChange(inst.id)}
                className="mt-1 h-4 w-4 accent-blue-600"
              />
              <span className="ml-3 text-sm">
                <strong>{inst.id}.</strong> {inst.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Gender Selection for each selected instrument */}
      {selectedInstruments.map((id) => {
        const instrument = instruments.find((inst) => inst.id === id);
        if (!instrument) return null;

        return (
          <div key={id} className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Options for {instrument.name} (ID: {id})
            </h3>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Select Gender for {id}:
              </label>
              <div className="flex flex-wrap gap-4">
                {genderOptions.map((g) => (
                  <label key={g} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`gender-${id}`}
                      checked={instrumentGenders[id] === g}
                      onChange={() => handleInstrumentGenderChange(id, g)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Market & Consideration Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div>
          <label htmlFor="marketValue" className="block text-gray-700 font-medium mb-1">
            Market Value (₹):
          </label>
          <input
            id="marketValue"
            type="text"
            value={marketValue || ''}
            onChange={handleNumericInput}
            placeholder="e.g. 1000000"
            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label htmlFor="agreementValue" className="block text-gray-700 font-medium mb-1 relative">
            Consideration Value (₹):
            <span className="ml-2 cursor-help text-gray-500" title="Enter the deed's stated consideration (sale price). If not entered, it will auto-set to Market Value. Duty uses the higher of this or Market Value.">ℹ️</span>
          </label>
          <input
            id="agreementValue"
            type="text"
            value={agreementValue || ''}
            onChange={handleNumericInput}
            placeholder="e.g. 950000 (auto-sets to Market Value if blank)"
            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center">
        <button
          onClick={calculateStampDuty}
          disabled={selectedInstruments.length === 0 || !marketValue || selectedInstruments.some(id => !instrumentGenders[id]) || loading}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            selectedInstruments.length > 0 && marketValue && !selectedInstruments.some(id => !instrumentGenders[id]) && !loading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 cursor-not-allowed text-gray-500'
          }`}
        >
          {loading ? 'Calculating...' : 'Calculate Stamp Duty'}
        </button>
      </div>

      {/* Results Display */}
      {selectionResults && (
        <div className="mt-8 bg-blue-50 p-5 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Duty Results</h3>
          <ul className="text-sm text-gray-800 space-y-2">
            {selectionResults.map((r) => (
              <li key={r.id}>
                {r.instrumentName} — {r.selectedOption}: ₹{Math.round(r.dutyValue || 0)}
              </li>
            ))}
          </ul>
          {baseValue !== null && (
            <div className="mt-3 font-semibold text-sm text-gray-600">
              Base used for duty: ₹{baseValue.toLocaleString()} ({baseValue === marketValue ? 'Market Value' : 'Agreement Value'})
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="font-semibold">Total Stamp Duty: ₹{Math.round(stampDuty || 0).toLocaleString()}</div>
            <div>Surcharge: ₹{Math.round(surcharge || 0).toLocaleString()}</div>
            <div>Cess: ₹{Math.round(cess || 0).toLocaleString()}</div>
            <div>Registration Fees: ₹{Math.round(registrationFees || 0).toLocaleString()}</div>
          </div>
          {totalPayable !== null && (
            <div className="mt-3 font-bold text-lg text-blue-800">
              Total Payable: ₹{Math.round(totalPayable || 0).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StampDutyForm;