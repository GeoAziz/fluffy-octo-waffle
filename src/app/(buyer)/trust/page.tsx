import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Gem, Award, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function TrustVerificationPage() {
  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      {/* Main Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">How Trust Badges Work</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Understand how Kenya Land Trust verifies properties and what each badge means for your purchase decision.
        </p>
      </div>

      <div className="space-y-8">
        {/* The Process */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              The Verification Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Seller Submissions</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Property owners submit listing details along with supporting documents: title deeds, survey plans, recent photographs, and property descriptions.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Document Review</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our team reviews all submitted documents for completeness and consistency. We check if documents match the property description and verify dates are current.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Badge Assignment</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on document quality and completeness, we assign a Gold, Silver, Bronze, or no badge rating. This reflects confidence in the submission.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold">Listing Goes Live</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your property is published with its verification badge, documents, and all details. Buyers can see exactly what documentation is available.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Understanding Trust Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              Each badge indicates the level of documentation and verification confidence for a property.
            </p>

            <div className="space-y-6">
              {/* Gold */}
              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Trophy className="h-8 w-8 text-amber-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      Gold Badge
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-normal">
                        Most Verified
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Property has all essential documents submitted and verified:
                    </p>
                    <ul className="text-sm mt-3 space-y-1 ml-4">
                      <li>✓ Complete and current title deed</li>
                      <li>✓ Approved survey plan with boundaries clearly marked</li>
                      <li>✓ Physical property photographs from multiple angles</li>
                      <li>✓ Detailed property description matching documents</li>
                      <li>✓ All documents cross-verified for consistency</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-3">
                      <strong>For buyers:</strong> Gold badges indicate seller has invested in thorough documentation. This generally suggests more reliable transactions, though independent legal review is still essential.
                    </p>
                  </div>
                </div>
              </div>

              {/* Silver */}
              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Gem className="h-8 w-8 text-gray-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      Silver Badge
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-normal">
                        Good Coverage
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Property has most key documents, but one or more areas need attention:
                    </p>
                    <ul className="text-sm mt-3 space-y-1 ml-4">
                      <li>✓ Title deed present but older or missing signatures</li>
                      <li>✓ Survey plan available but boundaries unclear</li>
                      <li>✓ Good photos but from limited angles</li>
                      <li>✓ Description mostly matches documents</li>
                      <li>⚠ Minor inconsistencies in document details</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-3">
                      <strong>For buyers:</strong> Silver badges suggest a straightforward property. You may want to request clarification on the missing documentation before proceeding.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bronze */}
              <div className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Award className="h-8 w-8 text-amber-700 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      Bronze Badge
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-normal">
                        Basic Documentation
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Property has minimal but verified documentation:
                    </p>
                    <ul className="text-sm mt-3 space-y-1 ml-4">
                      <li>⚠ Title deed present but with concerns (old, unclear)</li>
                      <li>⚠ Survey plan missing or outdated</li>
                      <li>⚠ Limited property photos</li>
                      <li>⚠ Some inconsistencies between documents</li>
                      <li>✓ Property details verified by seller</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-3">
                      <strong>For buyers:</strong> Bronze badges require extra due diligence. Consider hiring a surveyor and getting independent legal review before committing to a purchase.
                    </p>
                  </div>
                </div>
              </div>

              {/* No Badge */}
              <div className="border rounded-lg p-6 bg-muted/50">
                <div className="flex items-start gap-4">
                  <HelpCircle className="h-8 w-8 text-muted-foreground flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">No Badge</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Property submitted with minimal documentation or awaiting review:
                    </p>
                    <ul className="text-sm mt-3 space-y-1 ml-4">
                      <li>⚠ Incomplete documentation submitted</li>
                      <li>⚠ Documents under review</li>
                      <li>⚠ Missing key supporting materials</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-3">
                      <strong>For buyers:</strong> Contact the seller to request additional documentation before considering the property. Full due diligence is essential.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Disclaimers */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              Important Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">What Badges Do NOT Mean</h3>
              <ul className="space-y-2 ml-4">
                <li>🚫 Badges do NOT guarantee legal title to the property</li>
                <li>🚫 Badges do NOT replace independent verification</li>
                <li>🚫 Badges do NOT protect you from fraud or disputes</li>
                <li>🚫 Kenya Land Trust is not responsible for transaction disputes</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Your Responsibility</h3>
              <ul className="space-y-2 ml-4">
                <li>✓ Always verify location in person</li>
                <li>✓ Hire a surveyor to confirm boundaries</li>
                <li>✓ Engage a qualified lawyer for legal review</li>
                <li>✓ Verify title at the Land Registry</li>
                <li>✓ Carry out due diligence on the seller</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded border border-yellow-200 mt-4">
              <p className="font-semibold text-yellow-900">
                Kenya Land Trust is a marketplace platform, not a title guarantor. All property images, documents, and information are provided by sellers and are not independently verified for accuracy or authenticity. Badges reflect document completeness, not legal validity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Still Have Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions about a specific listing's verification badge or need help understanding documentation, please contact our support team.
            </p>
            <a href="/contact" className="text-primary font-medium hover:underline">
              Contact Support →
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
