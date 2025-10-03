import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, FileText, Download } from "lucide-react";

const PublicLandNotifications = () => {
  const notifications = [
    {
      id: 1,
      title: "Updated Guideline Rates for Property Valuation - 2024",
      date: "2024-01-15",
      type: "Guideline Update",
      status: "Active",
      description: "New guideline rates for property valuation effective from January 2024."
    },
    {
      id: 2,
      title: "Land Acquisition Notice - Kamrup District",
      date: "2024-01-10",
      type: "Land Acquisition",
      status: "Active", 
      description: "Public notice for land acquisition in Kamrup district for development project."
    },
    {
      id: 3,
      title: "Stamp Duty Revision Notification",
      date: "2023-12-20",
      type: "Stamp Duty",
      status: "Active",
      description: "Revision in stamp duty rates for various property transactions."
    },
    {
      id: 4,
      title: "Digital Registration Process Implementation",
      date: "2023-12-01",
      type: "Process Update",
      status: "Implemented",
      description: "Implementation of digital registration process across all sub-registrar offices."
    },
    {
      id: 5,
      title: "Holiday Schedule - Registration Offices",
      date: "2023-11-15",
      type: "Schedule",
      status: "Active",
      description: "Official holiday schedule for all registration offices in Assam."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Implemented":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Guideline Update":
        return "bg-primary text-primary-foreground";
      case "Land Acquisition":
        return "bg-destructive text-destructive-foreground";
      case "Stamp Duty":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-primary text-center">
              Public/Land Notifications
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              Latest notifications and updates from Directorate of Registration and Stamps Revenue
            </p>
          </CardHeader>
        </Card>

        <div className="max-w-6xl mx-auto space-y-6">
          {notifications.map((notification) => (
            <Card key={notification.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {notification.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          {notification.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(notification.date).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-6xl mx-auto mt-8">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              For more information or clarifications, please contact our office during working hours.
            </p>
            <Button className="mt-4">
              Contact Us
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default PublicLandNotifications;