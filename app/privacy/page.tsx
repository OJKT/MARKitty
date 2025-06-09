export const dynamic = 'force-static'

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground mb-4">
            This app does not collect or store personal data outside of authentication and usage analytics.
            We are committed to protecting your privacy and ensuring the security of your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Authentication information (managed securely by Supabase)</li>
            <li>Rubric data that you explicitly create and save</li>
            <li>Basic usage analytics to improve the service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Usage</h2>
          <p className="text-muted-foreground mb-4">
            Your data is used solely for providing and improving the MARKitty service.
            We do not sell or share your personal information with third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="text-muted-foreground">
            If you have any questions about our privacy practices, please contact us.
          </p>
        </section>
      </div>
    </main>
  )
} 