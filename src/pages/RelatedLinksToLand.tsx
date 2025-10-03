import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ExternalLink, Globe, FileText, Users, Building, Gavel } from "lucide-react";

const RelatedLinksToLand = () => {
  const linkCategories = [
    {
      title: "Government Portals",
      icon: Globe,
      links: [
        {
          name: "Assam Land Revenue Portal",
          url: "https://landrevenue.assam.gov.in",
          description: "Official portal for land revenue services in Assam"
        },
        {
          name: "Dharitree Portal",
          url: "https://ilrms.assam.gov.in/dhar/index.php/Welcome/SelectLOC",
          description: "Online land records and mutation services"
        },
        {
          name: "e-Citizen Services Assam",
          url: "https://sewasetu.assam.gov.in/site/online/citizen",
          description: "Citizen services portal for various government services"
        }
      ]
    },
    {
      title: "Legal & Documentation",
      icon: Gavel,
      links: [
        {
          name: "Assam Registration Department",
          url: "https://igr.assam.gov.in/",
          description: "Document registration and stamp duty information"
        },
        {
          name: "Legal Metrology Assam",
          url: "https://legalmetrology.assam.gov.in",
          description: "Legal metrology and measurement standards"
        },
        {
          name: "Assam Gazette",
          url: "https://dpns.assam.gov.in/portlets/publication-of-assam-gazettes",
          description: "Official gazette notifications and legal documents"
        }
      ]
    },
    {
      title: "Revenue & Surveys",
      icon: FileText,
      links: [
        {
          name: "Directorate of Land Records & Surveys",
          url: "https://dlrs.assam.gov.in/",
          description: "Land survey records and cadastral mapping"
        },
        {
          name: "Survey of India - Assam",
          url: "https://surveyofindia.gov.in",
          description: "Topographical surveys and mapping services"
        },
        {
          name: "Revenue Circle Offices",
          url: "https://revenue.assam.gov.in",
          description: "Local revenue administration and services"
        }
      ]
    },
    {
      title: "Development Authorities",
      icon: Building,
      links: [
        {
          name: "Guwahati Development Authority",
          url: "https://gda.assam.gov.in",
          description: "Urban planning and development authority for Guwahati"
        },
        {
          name: "Assam Housing & Urban Development",
          url: "https://urban.assam.gov.in",
          description: "Housing and urban development corporation"
        },
        {
          name: "Assam Industrial Development Corporation",
          url: "https://aidc.co.in",
          description: "Industrial land development and allocation"
        }
      ]
    },
    {
      title: "Public Services",
      icon: Users,
      links: [
        {
          name: "Lok Seva Kendra",
          url: "https://lokseva.assam.gov.in",
          description: "Common service centers for citizen services"
        },
        {
          name: "RTI Online Assam",
          url: "https://rti.assam.gov.in",
          description: "Right to Information online application portal"
        },
        {
          name: "Assam Secretariat",
          url: "https://assam.gov.in",
          description: "Official website of Government of Assam"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-3xl text-primary text-center">
              Related Links to Land
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              Important links and resources related to land administration and services
            </p>
          </CardHeader>
        </Card>

        <div className="max-w-6xl mx-auto space-y-8">
          {linkCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-primary">
                  <category.icon className="h-6 w-6" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-1 gap-4">
                  {category.links.map((link, linkIndex) => (
                    <Card key={linkIndex} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{link.name}</h3>
                            <p className="text-muted-foreground text-sm mb-3">
                              {link.description}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {link.url}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(link.url, '_blank')}
                            className="flex items-center gap-2 shrink-0"
                          >
                            Visit Site
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-6xl mx-auto mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              If you cannot find the information you're looking for, please contact our support team.
            </p>
            <Button>
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default RelatedLinksToLand;