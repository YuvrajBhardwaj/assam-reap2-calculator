import { useState, useEffect } from 'react';
import { ApiService } from '@/services/adminService';

// Added optional prop for prefilled market value
interface StampDutyFormProps {
  initialMarketValue?: number;
}

const StampDutyForm = ({ initialMarketValue }: StampDutyFormProps = {}) => {
  // State variables
  const [agreementType, setAgreementType] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [agreementValue, setAgreementValue] = useState<number>(0);
  const [marketValue, setMarketValue] = useState<number>(0);
  const [stampDuty, setStampDuty] = useState<number | null>(null);
  const [surcharge, setSurcharge] = useState<number | null>(null);
  const [cess, setCess] = useState<number | null>(null);
  const [registrationFees, setRegistrationFees] = useState<number | null>(null);
  const [totalFees, setTotalFees] = useState<number | null>(null);

  // Prefill market value from props when provided
  useEffect(() => {
    if (typeof initialMarketValue === 'number' && !isNaN(initialMarketValue)) {
      setMarketValue(initialMarketValue);
    }
  }, [initialMarketValue]);

  // Agreement types
  const agreementTypes = [
    'Sale Deed',
    'Conveyance Deed',
    'Mortgage Deed (With Possession)',
    'Mortgage Deed (Without Possession)',
    'Lease Deed',
    'Gift Deed',
    'Exchange Deed',
    'Partition Deed',
  ];

  // Gender options
  const genders = ['Male', 'Female', 'Other'];

  // Calculate stamp duty and other fees
  const calculateStampDuty = () => {
    if (!agreementValue || !marketValue) return;

    let baseStampDuty = 0;
    let surchargeRate = 0;
    let cessRate = 0;
    let registrationFeeRate = 0;

    switch (agreementType) {
      case 'Sale Deed':
        baseStampDuty = marketValue * 0.05; // 5%
        surchargeRate = 0.02; // 2%
        cessRate = 0.01; // 1%
        registrationFeeRate = 0.005; // 0.5%
        break;
      case 'Conveyance Deed':
        baseStampDuty = marketValue * 0.04; // 4%
        surchargeRate = 0.015; // 1.5%
        cessRate = 0.008; // 0.8%
        registrationFeeRate = 0.003; // 0.3%
        break;
      default:
        baseStampDuty = marketValue * 0.03; // Default 3%
        surchargeRate = 0.01; // 1%
        cessRate = 0.005; // 0.5%
        registrationFeeRate = 0.002; // 0.2%
    }

    const calculatedStampDuty = baseStampDuty;
    const calculatedSurcharge = agreementValue * surchargeRate;
    const calculatedCess = agreementValue * cessRate;
    const calculatedRegistrationFees = agreementValue * registrationFeeRate;
    const calculatedTotalFees =
      calculatedStampDuty +
      calculatedSurcharge +
      calculatedCess +
      calculatedRegistrationFees;

    setStampDuty(calculatedStampDuty);
    setSurcharge(calculatedSurcharge);
    setCess(calculatedCess);
    setRegistrationFees(calculatedRegistrationFees);
    setTotalFees(calculatedTotalFees);
  };

  // Numeric input handler (kept as in original component)
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numeric = Number(String(value).replace(/[^0-9.]/g, '')) || 0;
    if (id === 'marketValue') setMarketValue(numeric);
    if (id === 'agreementValue') setAgreementValue(numeric);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-maroon-700 mb-4">Assam Stamp Duty Calculator</h2>
      <p className="text-gray-600 mb-6 text-sm">
        Calculations are based on current Assam stamp duty rates. Please consult a legal professional for exact figures.
      </p>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Agreement Type */}
        <div>
          <label htmlFor="agreementType" className="block text-gray-700 font-medium mb-1">Choose Agreement Type:</label>
          <select
            id="agreementType"
            value={agreementType}
            onChange={(e) => setAgreementType(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select type</option>
            {agreementTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-gray-700 font-medium mb-1">Choose Gender:</label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select gender</option>
            {genders.map((genderOption) => (
              <option key={genderOption} value={genderOption}>
                {genderOption}
              </option>
            ))}
          </select>
        </div>

        {/* Market Value */}
        <div>
          <label htmlFor="marketValue" className="block text-gray-700 font-medium mb-1">Enter Market Value:</label>
          <input
            id="marketValue"
            type="text"
            value={marketValue}
            onChange={handleNumericInput}
            placeholder="Enter or auto-fetch value"
            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-500 mt-1">Can be entered manually or fetched from Property Valuation tab.</p>
        </div>

        {/* Consideration Price */}
        <div>
          <label htmlFor="agreementValue" className="block text-gray-700 font-medium mb-1">Enter Consideration Price:</label>
          <input
            id="agreementValue"
            type="text"
            value={agreementValue}
            onChange={handleNumericInput}
            placeholder="Enter consideration price"
            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <br />
      {/* Calculate Button */}
      <div className="flex justify-center">
        <button
          onClick={calculateStampDuty}
          disabled={!agreementType || !gender || !agreementValue || !marketValue}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${agreementType && gender && agreementValue && marketValue
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 cursor-not-allowed text-gray-500'
            }`}
        >
          Calculate
        </button>
      </div>

      {/* Estimated Charges Table */}
      {stampDuty !== null && (
        <div className="mt-8 bg-blue-50 p-5 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estimated Charges</h3>
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm text-gray-600 uppercase border-b">
                <th className="py-2 px-4">Charge</th>
                <th className="py-2 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              <tr>
                <td className="py-3 px-4 font-medium">Stamp Duty</td>
                <td className="py-3 px-4 text-right">₹{stampDuty.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Surcharge</td>
                <td className="py-3 px-4 text-right">₹{surcharge?.toLocaleString() ?? 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Cess</td>
                <td className="py-3 px-4 text-right">₹{cess?.toLocaleString() ?? 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Registration Fees</td>
                <td className="py-3 px-4 text-right">₹{registrationFees?.toLocaleString() ?? 'N/A'}</td>
              </tr>
              <tr className="font-bold text-base bg-blue-100">
                <td className="py-3 px-4">Total Fees</td>
                <td className="py-3 px-4 text-right">₹{totalFees?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StampDutyForm;