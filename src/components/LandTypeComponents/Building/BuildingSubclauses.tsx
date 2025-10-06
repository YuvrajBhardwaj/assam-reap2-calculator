import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

interface BuildingSubclausesProps {
  selectedSubclauses: string[];
  handleSubclauseChange: (value: string) => void;
  buildingSubtype: string;
}

const BuildingSubclauses = ({
  selectedSubclauses,
  handleSubclauseChange,
  buildingSubtype,
}: BuildingSubclausesProps) => {
  const getSubclauses = () => {
    switch (buildingSubtype) {
      case "independent-building":
        return [
          {
            id: "paved-road",
            label: "Whether property is situated on other paved road",
          },
          {
            id: "corner-plot",
            label: "Whether Plot Is A Corner Plot",
          },
          {
            id: "legal-colony",
            label:
              "Whether Plot Is Situated In Legal Colony And Its Reservation As Ews Is Approved By Competent Authority And Allotee'S Name Is Listed In Collector'S Published List",
          },
          {
            id: "gandi-basti",
            label:
              "Whether Plot Is Situated In Gandi Basti Declared By Competent Authority And Plot Area Is Upto 35 Sqm",
          },
          {
            id: "national-highway",
            label: "Whether Plot Is Situated On National Highway Or Its Bypass",
          },
          {
            id: "state-highway",
            label: "Whether Plot Is Situated On State Highway Or Its Bypass",
          },
        ];
      case "multistorey":
        return [
          {
            id: "legal-colony",
            label:
              "Whether Plot Is Situated In Legal Colony And Its Reservation As Ews Is Approved By Competent Authority And Allotee'S Name Is Listed In Collector'S Published List",
          },
        ];
      default:
        return [];
    }
  };

  const subclauses = getSubclauses();

  return (
    <Card className="border-maroon-200 shadow-md">
      <CardHeader className="bg-maroon-50 border-b border-maroon-100">
        <div className="flex items-center gap-2">
          <CardTitle className="text-maroon-700 text-xl">Subclauses</CardTitle>
          <div className="relative ml-1 cursor-pointer group">
            <Info className="h-4 w-4 text-maroon-500" />
            <div className="absolute left-0 -top-1 w-64 p-2 bg-white border border-maroon-100 rounded shadow-md hidden group-hover:block z-10 text-xs">
              Select applicable subclauses for this building type
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          {subclauses.map((subclause) => (
            <div key={subclause.id} className="flex items-center p-3 bg-white rounded-md border border-gray-200 hover:bg-maroon-50 hover:border-maroon-200 transition-colors">
              <Checkbox
                id={subclause.id}
                checked={selectedSubclauses.includes(subclause.id)}
                onCheckedChange={() => handleSubclauseChange(subclause.id)}
                className="text-maroon-600"
              />
              <Label htmlFor={subclause.id} className="ml-2">
                {subclause.label}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingSubclauses;
