export interface DistrictDetails {
  name: string;
  lat: number;
  lng: number;
  areaType: string;
  localBody: string;
  ward: string;
  guidelineLocation: string;
  circle?: string;
  village?: string;
  mouza?: string;
}

export const assamDistrictDetails: DistrictDetails[] = [
  {
    name: "Baksa",
    lat: 26.7025,
    lng: 91.4597,
    areaType: "Rural",
    localBody: "Mushalpur Town Committee",
    ward: "Ward No. 1",
    guidelineLocation: "Mushalpur Market"
  },
  {
    name: "Barpeta",
    lat: 26.3216,
    lng: 91.0064,
    areaType: "Urban",
    localBody: "Barpeta Municipal Board",
    ward: "Ward No. 2",
    guidelineLocation: "Barpeta Bazar"
  },
  {
    name: "Bajali",
    lat: 26.4921,
    lng: 91.1809,
    areaType: "Semi-Urban",
    localBody: "Pathsala Municipal Board",
    ward: "Ward No. 3",
    guidelineLocation: "Pathsala Market"
  },
  {
    name: "Biswanath",
    lat: 26.7184,
    lng: 93.1476,
    areaType: "Semi-Urban",
    localBody: "Biswanath Chariali Municipal Board",
    ward: "Ward No. 2",
    guidelineLocation: "Main Bazar"
  },
  {
    name: "Bongaigaon",
    lat: 26.4826,
    lng: 90.5610,
    areaType: "Urban",
    localBody: "Bongaigaon Municipal Board",
    ward: "Ward No. 5",
    guidelineLocation: "Chapaguri Road"
  },
  {
    name: "Cachar",
    lat: 24.8333,
    lng: 92.7789,
    areaType: "Urban",
    localBody: "Silchar Municipal Board",
    ward: "Ward No. 6",
    guidelineLocation: "Central Road"
  },
  {
    name: "Charaideo",
    lat: 27.0150,
    lng: 95.0150,
    areaType: "Rural",
    localBody: "Sonari Town Committee",
    ward: "Ward No. 1",
    guidelineLocation: "Sonari Market"
  },
  {
    name: "Chirang",
    lat: 26.5000,
    lng: 90.7167,
    areaType: "Rural",
    localBody: "Kajalgaon Town Committee",
    ward: "Ward No. 1",
    guidelineLocation: "Kajalgaon Market"
  },
  {
    name: "Darrang",
    lat: 26.4510,
    lng: 92.0302,
    areaType: "Semi-Urban",
    localBody: "Mangaldai Municipal Board",
    ward: "Ward No. 4",
    guidelineLocation: "Mangaldai Bazar"
  },
  {
    name: "Dhemaji",
    lat: 27.4865,
    lng: 94.5869,
    areaType: "Rural",
    localBody: "Dhemaji Town Committee",
    ward: "Ward No. 2",
    guidelineLocation: "Dhemaji Market"
  },
  {
    name: "Dhubri",
    lat: 26.0213,
    lng: 89.9856,
    areaType: "Urban",
    localBody: "Dhubri Municipal Board",
    ward: "Ward No. 2",
    guidelineLocation: "N.S. Road"
  },
  {
    name: "Dibrugarh",
    lat: 27.4728,
    lng: 94.9120,
    areaType: "Urban",
    localBody: "Dibrugarh Municipal Board",
    ward: "Ward No. 5",
    guidelineLocation: "Chowkidinghee"
  },
  {
    name: "Dima Hasao",
    lat: 25.1700,
    lng: 93.0167,
    areaType: "Rural",
    localBody: "Haflong Town Committee",
    ward: "Ward No. 1",
    guidelineLocation: "Haflong Market"
  },
  {
    name: "Goalpara",
    lat: 26.1767,
    lng: 90.6250,
    areaType: "Semi-Urban",
    localBody: "Goalpara Municipal Board",
    ward: "Ward No. 4",
    guidelineLocation: "Bapujinagar"
  },
  {
    name: "Golaghat",
    lat: 26.5170,
    lng: 93.9630,
    areaType: "Urban",
    localBody: "Golaghat Municipal Board",
    ward: "Ward No. 3",
    guidelineLocation: "Golaghat Market"
  },
  {
    name: "Hailakandi",
    lat: 24.6839,
    lng: 92.5663,
    areaType: "Semi-Urban",
    localBody: "Hailakandi Municipal Board",
    ward: "Ward No. 3",
    guidelineLocation: "Lala Road"
  },
  {
    name: "Hojai",
    lat: 26.0015,
    lng: 92.8565,
    areaType: "Urban",
    localBody: "Hojai Municipal Board",
    ward: "Ward No. 5",
    guidelineLocation: "Railway Station Road"
  },
  {
    name: "Jorhat",
    lat: 26.7500,
    lng: 94.2167,
    areaType: "Urban",
    localBody: "Jorhat Municipal Board",
    ward: "Ward No. 6",
    guidelineLocation: "Gar-Ali"
  },
  {
    name: "Kamrup",
    lat: 26.1158,
    lng: 91.7086,
    areaType: "Semi-Urban",
    localBody: "Rangia Municipal Board",
    ward: "Ward No. 3",
    guidelineLocation: "Rangia Bazar"
  },
  {
    name: "Kamrup Metropolitan",
    lat: 26.1445,
    lng: 91.7362,
    areaType: "Urban",
    localBody: "Guwahati Municipal Corporation",
    ward: "Ward No. 31",
    guidelineLocation: "GS Road Guwahati"
  },
  {
    name: "Karbi Anglong",
    lat: 26.0000,
    lng: 93.5000,
    areaType: "Rural",
    localBody: "Diphu Municipal Board",
    ward: "Ward No. 3",
    guidelineLocation: "Diphu Bazar"
  },
  {
    name: "Karimganj",
    lat: 24.8649,
    lng: 92.3592,
    areaType: "Urban",
    localBody: "Karimganj Municipal Board",
    ward: "Ward No. 2",
    guidelineLocation: "Station Road"
  },
  {
    name: "Kokrajhar",
    lat: 26.4000,
    lng: 90.2700,
    areaType: "Semi-Urban",
    localBody: "Kokrajhar Municipal Board",
    ward: "Ward No. 4",
    guidelineLocation: "Kokrajhar Market"
  },
  {
    name: "Lakhimpur",
    lat: 27.2333,
    lng: 94.1000,
    areaType: "Rural",
    localBody: "North Lakhimpur Municipal Board",
    ward: "Ward No. 2",
    guidelineLocation: "North Lakhimpur Market"
  },
  {
    name: "Majuli",
    lat: 27.0020,
    lng: 94.2250,
    areaType: "Rural",
    localBody: "Majuli Development Authority",
    ward: "Ward No. 1",
    guidelineLocation: "Garamur Market"
  },
  {
    name: "Morigaon",
    lat: 26.2496,
    lng: 92.3411,
    areaType: "Rural",
    localBody: "Morigaon Municipal Board",
    ward: "Ward No. 1",
    guidelineLocation: "Morigaon Main Market"
  },
  {
    name: "Nagaon",
    lat: 26.3500,
    lng: 92.6833,
    areaType: "Urban",
    localBody: "Nagaon Municipal Board",
    ward: "Ward No. 5",
    guidelineLocation: "Nagaon Market"
  },
  {
    name: "Nalbari",
    lat: 26.4500,
    lng: 91.4333,
    areaType: "Semi-Urban",
    localBody: "Nalbari Municipal Board",
    ward: "Ward No. 3",
    guidelineLocation: "Nalbari Bazar"
  },
  {
    name: "Sivasagar",
    lat: 26.9833,
    lng: 94.6333,
    areaType: "Urban",
    localBody: "Sivasagar Municipal Board",
    ward: "Ward No. 2",
    guidelineLocation: "Sivasagar Market"
  },
  {
    name: "Sonitpur",
    lat: 26.7000,
    lng: 92.8000,
    areaType: "Semi-Urban",
    localBody: "Tezpur Municipal Board",
    ward: "Ward No. 4",
    guidelineLocation: "Tezpur Bazar"
  },
  {
    name: "South Salmara Mankachar",
    lat: 25.5533,
    lng: 89.8667,
    areaType: "Rural",
    localBody: "Hatsingimari Town Committee",
    ward: "Ward No. 1",
    guidelineLocation: "Hatsingimari Market"
  },
  {
    name: "Tamulpur",
    lat: 26.7000,
    lng: 91.5000,
    areaType: "Rural",
    localBody: "Tamulpur Town Committee",
    ward: "Ward No. 1",
    guidelineLocation: "Tamulpur Market"
  },
  {
    name: "Tinsukia",
    lat: 27.5000,
    lng: 95.3500,
    areaType: "Urban",
    localBody: "Tinsukia Municipal Board",
    ward: "Ward No. 3",
    guidelineLocation: "Tinsukia Bazar"
  },
  {
    name: "Udalguri",
    lat: 26.7500,
    lng: 92.1000,
    areaType: "Semi-Urban",
    localBody: "Udalguri Municipal Board",
    ward: "Ward No. 2",
    guidelineLocation: "Udalguri Market"
  },
  {
    name: "Darrang",
    lat: 26.4500,
    lng: 92.0300,
    areaType: "Semi-Urban",
    localBody: "Mangaldai Municipal Board",
    ward: "Ward No. 4",
    guidelineLocation: "Mangaldai Bazar"
  },
  {
    name: "Dhemaji",
    lat: 27.4865,
    lng: 94.5869,
    areaType: "Rural",
    localBody: "Dhemaji Town Committee",
    ward: "Ward No. 2",
    guidelineLocation: "Dhemaji Market"
  },
  {
    name: "Dibrugarh",
    lat: 27.4728,
    lng: 94.9120,
    areaType: "Urban",
    localBody: "Dibrugarh Municipal Board",
    ward: "Ward No. 5",
    guidelineLocation: "Chowkidinghee"
  },
  {
    name: "Golaghat",
    lat: 26.5170,
    lng: 93.9630,
    areaType: "Urban",
    localBody: "Golaghat Municipal Board",
    ward: "Ward No. 3",
    guidelineLocation: "Golaghat Market"
  },
  {
    name: "Jorhat",
    lat: 26.7500,
    lng: 94.2167,
    areaType: "Urban",
    localBody: "Jorhat Municipal Board",
    ward: "Ward No. 6",
    guidelineLocation: "Gar-Ali"
  },
  {
    name: "Lakhimpur",
    lat: 27.2333,
    lng: 94.1000,
    areaType: "Rural",
    localBody: "North Lakhimpur Municipal Board",
    ward: "Ward No. 2",
    guidelineLocation: "North Lakhimpur Market"
  },
  {
    name: "Nagaon",
    lat: 26.3500,
    lng: 92.6833,
    areaType: "Urban",
    localBody: "Nagaon Municipal Board",
    ward: "Ward No. 5",
    guidelineLocation: "Nagaon Market"
  },
  {
    name: "Nalbari",
    lat: 26.4500,
    lng: 91.4333,
    areaType: "Semi-Urban",
    localBody: "Nalbari Municipal Board",
    ward: "Ward No. 3",
    guidelineLocation: "Nalbari Bazar"
  },
  {
    name: "Sivasagar",
    lat: 26.9833,
    lng: 94.6333,
    areaType: "Urban",
    localBody: "Sivasagar Municipal Board",
    ward: "Ward No. 2",
    guidelineLocation: "Sivasagar Market"
  },
  {
    name: "Sonitpur",
    lat: 26.7000,
    lng: 92.8000,
    areaType: "Semi-Urban",
    localBody: "Tezpur Municipal Board",
    ward: "Ward No. 4",
    guidelineLocation: "Tezpur Bazar"
  }
  
];

export const findDistrictDetails = (districtName: string): DistrictDetails | undefined => {
  return assamDistrictDetails.find(district => 
    district.name.toLowerCase() === districtName.toLowerCase()
  );
};
