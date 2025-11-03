import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { LandClass, type LandClassMapping } from '@/types/masterData';
import { getAllLandCategories, getAllDistricts, getCirclesByDistrict, getMouzasByDistrictAndCircle, getVillagesByDistrictAndCircle } from '@/services/locationService';
import * as masterDataService from '@/services/masterDataService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Unlink, X, Check } from 'lucide-react';

export default function LandClassMapping() {
  const [landClasses, setLandClasses] = useState<LandClass[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());

  const [districts, setDistricts] = useState<any[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [mouzas, setMouzas] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCircle, setSelectedCircle] = useState<string>('');
  const [selectedMouza, setSelectedMouza] = useState<string>('');
  const [selectedVillage, setSelectedVillage] = useState<string>('');

  const [mappings, setMappings] = useState<LandClassMapping[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const { toast } = useToast();

  const [isAddLandClassDialogOpen, setIsAddLandClassDialogOpen] = useState(false);
  const [newLandClassCode, setNewLandClassCode] = useState('');
  const [newLandClassName, setNewLandClassName] = useState('');
  const [newLandCategoryGenId, setNewLandCategoryGenId] = useState('');
  const [newLandClassDescription, setNewLandClassDescription] = useState('');
  const [newLandClassBaseRate, setNewLandClassBaseRate] = useState<number | string>('');
  const [newLandClassReason, setNewLandClassReason] = useState('');
  const [newLandCategoryName, setNewLandCategoryName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        const [classes, dists] = await Promise.all([getAllLandCategories(), getAllDistricts()]);
        setLandClasses(classes);
        setDistricts(dists);
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to load initial data', variant: 'destructive' });
      } finally {
        setLoading(false); // Set loading to false after fetching (or on error)
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  useEffect(() => {
    (async () => {
      if (!selectedDistrict) { setCircles([]); setMouzas([]); setVillages([]); return; }
      const cs = await getCirclesByDistrict(selectedDistrict);
      setCircles(cs);
      setSelectedCircle('');
      setMouzas([]);
      setVillages([]);
    })();
  }, [selectedDistrict]);

  useEffect(() => {
    (async () => {
      if (!selectedDistrict || !selectedCircle) { setMouzas([]); setVillages([]); return; }
      const mz = await getMouzasByDistrictAndCircle(selectedDistrict, selectedCircle);
      setMouzas(mz);
      setSelectedMouza('');
      setVillages([]);
    })();
  }, [selectedCircle]);

  useEffect(() => {
    (async () => {
      if (!selectedDistrict || !selectedCircle || !selectedMouza) { setVillages([]); return; }
      const v = await getVillagesByDistrictAndCircle(selectedDistrict, selectedCircle);
      setVillages(v);
      setSelectedVillage('');
    })();
  }, [selectedMouza]);

  useEffect(() => { loadMappings(); }, [selectedDistrict, selectedCircle, selectedMouza, selectedVillage]);

  const loadMappings = async () => {
    try {
      const res = await masterDataService.fetchLandClassMappings(selectedDistrict || undefined, selectedCircle || undefined, selectedMouza || undefined, selectedVillage || undefined);
      setMappings(res);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load mappings', variant: 'destructive' });
    }
  };

  const toggleClassSelection = (id: string) => {
    setSelectedClassIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const mapSelected = async () => {
    if (selectedClassIds.size === 0) {
      toast({ title: 'No selection', description: 'Select at least one land class to map' });
      return;
    }
    if (!selectedDistrict && !selectedCircle && !selectedMouza && !selectedVillage) {
      toast({ title: 'Target required', description: 'Select at least one administrative unit' });
      return;
    }
    try {
      for (const id of Array.from(selectedClassIds)) {
        const lc = landClasses.find(c => (c.id as string) === id);
        if (!lc) continue;
        await masterDataService.createLandClassMapping({
          landClassCode: lc.code,
          districtCode: selectedDistrict || undefined,
          circleCode: selectedCircle || undefined,
          mouzaCode: selectedMouza || undefined,
          villageCode: selectedVillage || undefined
        });
      }
      toast({ title: 'Mapped', description: 'Selected classes mapped successfully' });
      await loadMappings();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to map selected classes', variant: 'destructive' });
    }
  };

  const unmap = async (mapping: LandClassMapping) => {
    try {
      const lc = landClasses.find(c => c.code === mapping.landClassCode);
      const landCategoryGenId = lc?.id as string;
      await masterDataService.deleteLandClassMapping(
        landCategoryGenId,
        mapping.districtCode,
        mapping.circleCode,
        mapping.mouzaCode,
        mapping.villageCode
      );
      toast({ title: 'Unmapped', description: 'Mapping removed successfully' });
      await loadMappings();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to remove mapping', variant: 'destructive' });
    }
  };

  const addNewLandClass = async () => {
    if (!newLandClassCode || !newLandClassName || !newLandCategoryGenId || !newLandClassReason) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    try {
      await masterDataService.createLandClass({
        code: newLandClassCode,
        name: newLandClassName,
        landCategoryGenId: parseInt(newLandCategoryGenId), // Convert to number
        landCategoryName: newLandCategoryName,
        description: newLandClassDescription,
        baseRate: typeof newLandClassBaseRate === 'number' ? newLandClassBaseRate : parseFloat(newLandClassBaseRate),
        reasonForRequest: newLandClassReason,
        isActive: true,
      });
      toast({ title: 'Success', description: 'Land Class added successfully.' });
      setIsAddLandClassDialogOpen(false);
      setNewLandClassCode('');
      setNewLandClassName('');
      setNewLandCategoryGenId('');
      setNewLandClassDescription('');
      setNewLandClassBaseRate('');
      setNewLandClassReason('');
      await loadMappings(); // Refresh the list of land classes
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to add land class.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Land Class Mapping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">District</label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                <SelectContent>
                  {districts.map(d => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Circle</label>
              <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                <SelectTrigger><SelectValue placeholder="Select circle" /></SelectTrigger>
                <SelectContent>
                  {circles.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Mouza</label>
              <Select value={selectedMouza} onValueChange={setSelectedMouza}>
                <SelectTrigger><SelectValue placeholder="Select mouza" /></SelectTrigger>
                <SelectContent>
                  {mouzas.map(m => <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Village</label>
              <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                <SelectTrigger><SelectValue placeholder="Select village" /></SelectTrigger>
                <SelectContent>
                  {villages.map(v => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Select Land Classes (Bulk)</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {landClasses.map(lc => (
                  <TableRow key={lc.id as string}>
                    <TableCell className="w-12">
                      <Checkbox checked={selectedClassIds.has(lc.id as string)} onCheckedChange={() => toggleClassSelection(lc.id as string)} />
                    </TableCell>
                    <TableCell>{lc.code}</TableCell>
                    <TableCell>{lc.name}</TableCell>
                    <TableCell>{lc.landCategoryName || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-3">
              <Button onClick={mapSelected}>Map Selected</Button>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={() => setIsAddLandClassDialogOpen(true)}>Add New Land Class</Button>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Existing Mappings</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Code</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Circle</TableHead>
                  <TableHead>Mouza</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((m, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{m.landClassCode}</TableCell>
                    <TableCell>{m.districtCode || '-'}</TableCell>
                    <TableCell>{m.circleCode || '-'}</TableCell>
                    <TableCell>{m.mouzaCode || '-'}</TableCell>
                    <TableCell>{m.villageCode || '-'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => unmap(m)}
                        className="flex items-center gap-2"
                        title="Unmap Land Class"
                      >
                        <Unlink className="h-4 w-4" />
                        Unmap
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddLandClassDialogOpen} onOpenChange={setIsAddLandClassDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Land Class Management</DialogTitle>
            <DialogDescription>
              Fill in the details for the new land class.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="landClassCode" className="text-right">
                Land Class Code
              </Label>
              <Input
                id="landClassCode"
                value={newLandClassCode}
                onChange={(e) => setNewLandClassCode(e.target.value)}
                className="col-span-3"
                placeholder="Enter class code (e.g., A, B, C1)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="landClassName" className="text-right">
                Land Class Name
              </Label>
              <Input
                id="landClassName"
                value={newLandClassName}
                onChange={(e) => setNewLandClassName(e.target.value)}
                className="col-span-3"
                placeholder="Enter class name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={newLandCategoryGenId} onValueChange={(value) => {
                setNewLandCategoryGenId(value);
                const selectedLandClass = landClasses.find(lc => lc.id === value);
                setNewLandCategoryName(selectedLandClass ? selectedLandClass.name : '');
              }}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {landClasses.map(lc => (
                    <SelectItem key={lc.id as string} value={lc.id as string}>
                      {lc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newLandClassDescription}
                onChange={(e) => setNewLandClassDescription(e.target.value)}
                className="col-span-3"
                placeholder="Enter detailed description of the land class"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="baseRate" className="text-right">
                Base Rate (₹/sq ft)
              </Label>
              <Input
                id="baseRate"
                type="number"
                value={newLandClassBaseRate}
                onChange={(e) => setNewLandClassBaseRate(e.target.value)}
                className="col-span-3"
                placeholder="Enter base rate per square foot"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reasonForRequest" className="text-right">
                Reason for Request
              </Label>
              <Input
                id="reasonForRequest"
                value={newLandClassReason}
                onChange={(e) => setNewLandClassReason(e.target.value)}
                className="col-span-3"
                placeholder="Please provide a reason for this request..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddLandClassDialogOpen(false)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={addNewLandClass}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}