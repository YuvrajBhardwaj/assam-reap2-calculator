import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const GuidelineRatesPage = () => {
  const contentRef = useRef(null);

  const downloadPDF = () => {
    const input = contentRef.current;
    html2canvas(input, { scale: 3, logging: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // Width of A4 page in mm
        const pageHeight = 297; // Height of A4 page in mm
        const imgHeight = Math.floor((canvas.height * imgWidth) / canvas.width);
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save("guideline_rates.pdf");
      });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <Card ref={contentRef} className="shadow-lg mb-8">
        <CardHeader className="bg-primary text-white rounded-t-lg">
          <CardTitle className="text-xl md:text-2xl">Guideline Rate Details 2024–2025</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plot (Sqm) */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg font-semibold">Plot (Per Sqm)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <table className="w-full table-auto border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left text-gray-700">
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Rate (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2">Residential</td>
                      <td className="px-4 py-2 font-medium">₹60,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Commercial</td>
                      <td className="px-4 py-2 font-medium">₹90,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Industrial</td>
                      <td className="px-4 py-2 font-medium">₹60,000</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Building Residential (Sqm) */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg font-semibold">Building Residential (Per Sqm)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <table className="w-full table-auto border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left text-gray-700">
                      <th className="px-4 py-2 font-medium">Structure Type</th>
                      <th className="px-4 py-2 font-medium">Rate (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2">RCC</td>
                      <td className="px-4 py-2 font-medium">₹73,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">RBC</td>
                      <td className="px-4 py-2 font-medium">₹67,200</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Tin Shade</td>
                      <td className="px-4 py-2 font-medium">₹65,600</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Kaccha Kabelu</td>
                      <td className="px-4 py-2 font-medium">₹64,000</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Building Commercial (Sqm) */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg font-semibold">Building Commercial (Per Sqm)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <table className="w-full table-auto border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left text-gray-700">
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Rate (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2">Shop</td>
                      <td className="px-4 py-2 font-medium">₹1,44,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Office</td>
                      <td className="px-4 py-2 font-medium">₹1,20,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Godown</td>
                      <td className="px-4 py-2 font-medium">₹1,20,000</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Building Multistoried (Sqm) */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg font-semibold">Building Multistoried (Per Sqm)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <table className="w-full table-auto border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left text-gray-700">
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Rate (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2">Residential</td>
                      <td className="px-4 py-2 font-medium">₹60,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Commercial</td>
                      <td className="px-4 py-2 font-medium">₹1,20,000</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Agricultural Land (Hectare) */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg font-semibold">Agricultural Land (Per Hectare)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <table className="w-full table-auto border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left text-gray-700">
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Rate (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2">Irrigated</td>
                      <td className="px-4 py-2 font-medium">₹60,00,00,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Un Irrigated</td>
                      <td className="px-4 py-2 font-medium">₹60,00,00,000</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Agricultural Plot (Sqm) */}
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg font-semibold">Agricultural Plot (Per Sqm)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <table className="w-full table-auto border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left text-gray-700">
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Rate (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2">Sub Clause Wise Residential</td>
                      <td className="px-4 py-2 font-medium">₹60,000</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">Sub Clause Wise Commercial</td>
                      <td className="px-4 py-2 font-medium">₹90,000</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Optional Action Button */}
      <div className="mt-8 flex justify-center">
        <Button variant="outline" className="rounded-md px-6 py-2" onClick={downloadPDF}>
          Download as PDF
        </Button>
      </div>
    </div>
  );
};

export default GuidelineRatesPage;