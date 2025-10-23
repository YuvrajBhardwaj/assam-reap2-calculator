import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto ">
          <CardHeader>
            <CardTitle className="text-3xl  text-center">
              About Directorate of Registration and Stamps Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold  mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Directorate of Registration and Stamps Revenue, Government of Assam, is committed to 
                providing efficient and transparent property registration services. We facilitate property 
                valuation, stamp duty assessment, and maintain comprehensive land records for the state of Assam.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold  mb-4">Our Services</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Property Valuation</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional property assessment based on current market rates and government guidelines.
                  </p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Stamp Duty Calculation</h3>
                  <p className="text-sm text-muted-foreground">
                    Accurate computation of stamp duties for various property transactions.
                  </p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Document Registration</h3>
                  <p className="text-sm text-muted-foreground">
                    Secure and legal registration of property documents and deeds.
                  </p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Land Records</h3>
                  <p className="text-sm text-muted-foreground">
                    Maintenance and access to comprehensive land ownership records.
                  </p>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold  mb-4">Our Commitment</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to modernize property registration processes through digital transformation, 
                ensuring transparency, efficiency, and accessibility for all citizens of Assam. Our 
                dedicated team works towards simplified procedures and enhanced citizen services.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;