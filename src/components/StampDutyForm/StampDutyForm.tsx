import { useState, useEffect } from 'react';

interface StampDutyFormProps {
  initialMarketValue?: number;
}

type SubInstrument = {
  id: string;
  description: string;
};

type MainInstrument = {
  serial: string;
  description: string;
  hasSub: boolean;
  subInstruments?: SubInstrument[];
};

// Full instrument list (from your data)
const instruments: MainInstrument[] = [
  { serial: "1", description: "Acknowledgement", hasSub: false },
  { serial: "2", description: "Administrative Bond", hasSub: false },
  { serial: "3", description: "Adoption Deed", hasSub: false },
  { serial: "4", description: "Affidavit including affirmation or declaration", hasSub: false },
  {
    serial: "5",
    description: "Agreement or memorandum of an Agreement",
    hasSub: true,
    subInstruments: [
      { id: "5(a)", description: "Agreement for conveyance" },
      { id: "5(b)", description: "Development Agreement" },
      { id: "5(c)", description: "Other Agreement" }
    ]
  },
  {
    serial: "6",
    description: "Agreement relating to deposit of title-deeds, pawn or pledge",
    hasSub: true,
    subInstruments: [
      { id: "6(a)(i)", description: "Loan ≤ ₹1000, repayable on demand or >3 months" },
      { id: "6(a)(ii)", description: "Loan > ₹1000 and ≤ ₹10,000" },
      { id: "6(a)(iii)", description: "For every ₹10,000 or part thereof in excess of ₹10,000" },
      { id: "6(b)", description: "Repayable within 3 months" }
    ]
  },
  { serial: "7", description: "Appointment in execution of a power", hasSub: false },
  {
    serial: "8",
    description: "Appraisement or Valuation",
    hasSub: true,
    subInstruments: [
      { id: "8(a)", description: "Amount ≤ ₹1000" },
      { id: "8(b)", description: "Any other case" }
    ]
  },
  { serial: "9", description: "Apprenticeship Deed", hasSub: false },
  {
    serial: "10",
    description: "Article of Association of a company",
    hasSub: true,
    subInstruments: [
      { id: "10(a)", description: "Nominal share capital ≤ ₹2,500" },
      { id: "10(b)", description: "Nominal share capital > ₹2,500" }
    ]
  },
  { serial: "11", description: "Articles of Clerkship, or contract...", hasSub: false },
  {
    serial: "12",
    description: "Award",
    hasSub: true,
    subInstruments: [
      { id: "12(a)", description: "Value ≤ ₹1,000" },
      { id: "12(b)", description: "Value > ₹1,000" }
    ]
  },
  { serial: "13", description: "Bill of Exchange where payable otherwise than on demand", hasSub: false },
  { serial: "14", description: "Bill of Lading (including a through bill of lading)", hasSub: false },
  { serial: "15", description: "Bond", hasSub: false },
  { serial: "16", description: "Bottomry Bond", hasSub: false },
  { serial: "17", description: "Cancellation", hasSub: false },
  { serial: "18", description: "Certificate of Sale", hasSub: false },
  { serial: "19", description: "Certificate or other document evidencing the right or title", hasSub: false },
  { serial: "20", description: "Charter-Party", hasSub: false },
  { serial: "22", description: "Composition Deed", hasSub: false },
  { serial: "23", description: "Sale (Conveyance)", hasSub: false },
  { serial: "24", description: "Certified Copy", hasSub: false },
  { serial: "25", description: "Counterpart or a duplicate of any instrument", hasSub: false },
  {
    serial: "26", 
    description: "Customs Bond",
    hasSub: true,
    subInstruments: [
      { id: "26(a)", description: "Amount ≤ ₹1,000" },
      { id: "26(b)", description: "Any other case" }
    ]
  },
  {
    serial: "27",
    description: "Debenture",
    hasSub: true,
    subInstruments: [
      { id: "27(a)", description: "By endorsement, value ≤ ₹1000 + slab" },
      { id: "27(b)", description: "By delivery, value ≤ ₹1000 + slab" }
    ]
  },
  { serial: "28", description: "Delivery-Order in respect of Goods", hasSub: false },
  { serial: "29", description: "Divorce", hasSub: false },
  {
    serial: "30",
    description: "Entry as an Advocate, Vakil or Attorney...",
    hasSub: true,
    subInstruments: [
      { id: "30(a)", description: "Advocate or Vakil" },
      { id: "30(b)", description: "Attorney" }
    ]
  },
  { serial: "31", description: "Exchange of property", hasSub: false },
  {
    serial: "32",
    description: "Further Charge",
    hasSub: true,
    subInstruments: [
      { id: "32(a)", description: "Original mortgage with possession" },
      { id: "32(b)", description: "Original mortgage without possession" },
      { id: "32(b)(i)", description: "Possession given in further charge" },
      { id: "32(b)(ii)", description: "Possession not given" }
    ]
  },
  { serial: "33", description: "Gift", hasSub: false },
  { serial: "34", description: "Indemnity Bond", hasSub: false },
  {
    serial: "35",
    description: "Lease, including an under-lease or sub-lease...",
    hasSub: true,
    subInstruments: [
      { id: "35(a)", description: "Rent fixed, no premium" },
      { id: "35(a)(i)", description: "Term < 1 year" },
      { id: "35(a)(ii)", description: "1 ≤ Term ≤ 5 years" },
      { id: "35(a)(iii)", description: "5 < Term ≤ 10 years" },
      { id: "35(a)(iv)", description: "10 < Term ≤ 20 years" },
      { id: "35(a)(v)", description: "20 < Term ≤ 30 years" },
      { id: "35(a)(vi)", description: "30 < Term ≤ 100 years" },
      { id: "35(a)(vii)", description: "Term > 100 years or perpetuity" },
      { id: "35(a)(viii)", description: "No definite term" },
      { id: "35(b)", description: "Premium only, no rent" },
      { id: "35(c)", description: "Premium + rent" },
      { id: "35(d)", description: "Revisions as per 2025 Notification" }
    ]
  },
  { serial: "36", description: "Letter of Allotment of Shares", hasSub: false },
  { serial: "37", description: "Letter of Credit", hasSub: false },
  { serial: "38", description: "Letter of License", hasSub: false },
  { serial: "39", description: "Memorandum of Association of a Company", hasSub: false },
  {
    serial: "40",
    description: "Mortgage",
    hasSub: true,
    subInstruments: [
      { id: "40(a)", description: "With possession" },
      { id: "40(b)", description: "Without possession (Equitable)" }
    ]
  },
  {
    serial: "41",
    description: "Mortgage of a Crop",
    hasSub: true,
    subInstruments: [
      { id: "41(a)", description: "Repayable ≤ 3 months" },
      { id: "41(b)", description: "Repayable > 3 and ≤ 18 months" }
    ]
  },
  { serial: "42", description: "Notarial Act", hasSub: false },
  { serial: "43", description: "Note or Memorandum", hasSub: false },
  { serial: "44", description: "Note of protest by the Master of a ship", hasSub: false },
  { serial: "45", description: "Partition", hasSub: false },
  {
    serial: "46",
    description: "Partnership",
    hasSub: true,
    subInstruments: [
      { id: "46(A)", description: "Partnership" },
      { id: "46(B)", description: "Dissolution of Partnership" }
    ]
  },
  {
    serial: "47",
    description: "Policy of Insurance",
    hasSub: true,
    subInstruments: [
      { id: "47A(1)(i)", description: "Sea Insurance (premium ≤ 1/8%)" },
      { id: "47A(1)(ii)", description: "Sea Insurance (other)" },
      { id: "47A(2)(iii)", description: "Time-based Sea Insurance" },
      { id: "47B(1)(i)", description: "Fire/Property Insurance ≤ ₹5,000" },
      { id: "47B(1)(ii)", description: "Fire/Property Insurance > ₹5,000" },
      { id: "47B(2)", description: "Renewal receipt" },
      { id: "47C(a)", description: "Railway accident (single journey)" },
      { id: "47C(b)", description: "Other accident/sickness insurance" },
      { id: "47CC", description: "Insurance by way of indemnity" },
      { id: "47E(i)", description: "Life insurance ≤ ₹250" },
      { id: "47E(ii)", description: "Life insurance ₹250–500" },
      { id: "47E(iii)", description: "Life insurance > ₹500" },
      { id: "47F", description: "Re-insurance" }
    ]
  },
  {
    serial: "48",
    description: "Power of Attorney",
    hasSub: true,
    subInstruments: [
      { id: "48(a)", description: "Special Power of Attorney" },
      { id: "48(b)", description: "General Power of Attorney" }
    ]
  },
  {
    serial: "49",
    description: "Promissory Note",
    hasSub: true,
    subInstruments: [
      { id: "49(a)(i)", description: "Payable on demand, ≤ ₹1000" },
      { id: "49(a)(ii)", description: "Other demand note" },
      { id: "49(b)", description: "Payable otherwise than on demand" }
    ]
  },
  { serial: "50", description: "Protest of bill or Note", hasSub: false },
  { serial: "51", description: "Protest by the master of Ship", hasSub: false },
  { serial: "52", description: "Proxy", hasSub: false },
  { serial: "53", description: "Receipt", hasSub: false },
  { serial: "54", description: "Reconveyance", hasSub: false },
  { serial: "55", description: "Release Relinquishment of right", hasSub: false },
  { serial: "56", description: "Respondentia Bond", hasSub: false },
  { serial: "57", description: "Security Bond", hasSub: false },
  { serial: "58", description: "Settlement Instrument (including deed of dower), Revocation", hasSub: false },
  { serial: "59", description: "Share Warrants", hasSub: false },
  { serial: "60", description: "Shipping Order", hasSub: false },
  { serial: "61", description: "Surrender of Lease", hasSub: false },
  {
    serial: "62",
    description: "Transfer",
    hasSub: true,
    subInstruments: [
      { id: "62(a)", description: "Shares in company" },
      { id: "62(b)", description: "Debentures" },
      { id: "62(c)", description: "Interest secured by bond/mortgage" },
      { id: "62(d)", description: "Property under Administrator Generals Act" },
      { id: "62(e)", description: "Trust-property without consideration" }
    ]
  },
  { serial: "63", description: "Transfer of Lease", hasSub: false },
  {
    serial: "64",
    description: "Trust",
    hasSub: true,
    subInstruments: [
      { id: "64A", description: "Declaration of trust (not Will)" },
      { id: "64B", description: "Revocation of trust (not Will)" }
    ]
  },
  { serial: "65", description: "Warrant for Goods", hasSub: false }
];

const StampDutyForm = ({ initialMarketValue }: StampDutyFormProps = {}) => {
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [selectedSubInstrument, setSelectedSubInstrument] = useState<string>('');
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [agreementValue, setAgreementValue] = useState<number>(0);
  const [marketValue, setMarketValue] = useState<number>(0);
  const [stampDuty, setStampDuty] = useState<number | null>(null);
  const [surcharge, setSurcharge] = useState<number | null>(null);
  const [cess, setCess] = useState<number | null>(null);
  const [registrationFees, setRegistrationFees] = useState<number | null>(null);
  const [totalFees, setTotalFees] = useState<number | null>(null);

  useEffect(() => {
    if (typeof initialMarketValue === 'number' && !isNaN(initialMarketValue)) {
      setMarketValue(initialMarketValue);
    }
  }, [initialMarketValue]);

  const genderOptions = ['Male', 'Female', 'Joint'];

  const handleGenderChange = (gender: string) => {
    setSelectedGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numeric = Number(value.replace(/[^0-9.]/g, '')) || 0;
    if (id === 'marketValue') setMarketValue(numeric);
    if (id === 'agreementValue') setAgreementValue(numeric);
  };

  const handleInstrumentChange = (serial: string) => {
    if (selectedInstrument === serial) {
      setSelectedInstrument(null);
      setSelectedSubInstrument('');
    } else {
      setSelectedInstrument(serial);
      setSelectedSubInstrument('');
    }
  };

  const calculateStampDuty = () => {
    if (!selectedInstrument || selectedGenders.length === 0 || !agreementValue || !marketValue) return;
    alert(`Selected Instrument: ${selectedInstrument}\nSub-type: ${selectedSubInstrument || 'None'}\nGenders: ${selectedGenders.join(', ')}\nMarket: ₹${marketValue}, Consideration: ₹${agreementValue}`);
  };

  const currentInstrument = instruments.find(inst => inst.serial === selectedInstrument);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-maroon-700 mb-4">
        Assam Stamp Duty Calculator
      </h2>
      <p className="text-gray-600 mb-4 text-sm">
        Select one instrument below. If it has sub-types, a dropdown will appear.
      </p>

      {/* Instrument Checkboxes (Single Select Behavior) */}
      <div className="mb-6 max-h-96 overflow-y-auto border border-gray-200 rounded-md p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {instruments.map((inst) => (
            <label
              key={inst.serial}
              className={`flex items-start p-3 rounded cursor-pointer border ${
                selectedInstrument === inst.serial
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedInstrument === inst.serial}
                onChange={() => handleInstrumentChange(inst.serial)}
                className="mt-1 h-4 w-4 accent-blue-600"
              />
              <span className="ml-3 text-sm">
                <strong>{inst.serial}.</strong> {inst.description}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sub-Instrument Dropdown (if applicable) */}
      {currentInstrument?.hasSub && currentInstrument.subInstruments && (
        <div className="mb-6">
          <label htmlFor="subInstrument" className="block text-gray-700 font-medium mb-1">
            Select Sub-type:
          </label>
          <select
            id="subInstrument"
            value={selectedSubInstrument}
            onChange={(e) => setSelectedSubInstrument(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Choose sub-type</option>
            {currentInstrument.subInstruments.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.id}: {sub.description}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Gender */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1">Select Gender:</label>
        <div className="flex flex-wrap gap-4">
          {genderOptions.map((g) => (
            <label key={g} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGenders.includes(g)}
                onChange={() => handleGenderChange(g)}
                className="h-4 w-4 accent-blue-600"
              />
              <span>{g}</span>
            </label>
          ))}
        </div>
      </div>

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
          <label htmlFor="agreementValue" className="block text-gray-700 font-medium mb-1">
            Consideration Value (₹):
          </label>
          <input
            id="agreementValue"
            type="text"
            value={agreementValue || ''}
            onChange={handleNumericInput}
            placeholder="e.g. 950000"
            className="border border-gray-300 px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-center">
        <button
          onClick={calculateStampDuty}
          disabled={!selectedInstrument || selectedGenders.length === 0 || !agreementValue || !marketValue}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            selectedInstrument && selectedGenders.length > 0 && agreementValue && marketValue
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 cursor-not-allowed text-gray-500'
          }`}
        >
          Calculate
        </button>
      </div>

      {/* Results Placeholder */}
      {stampDuty !== null && (
        <div className="mt-8 bg-blue-50 p-5 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estimated Charges</h3>
          <p>Full calculation logic can be added using selected instrument ID and sub-type.</p>
        </div>
      )}
    </div>
  );
};

export default StampDutyForm;