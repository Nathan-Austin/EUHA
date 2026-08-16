
import type { Metadata } from 'next';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Read the cookie policy for the European Hot Sauce Awards.',
};

const CookiesPage = () => {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cookie Policy' }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,56px)] uppercase leading-[0.95] text-white">
            Cookie <span className="bg-[#F5C518] px-2 text-black">policy</span>.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="border-[3px] border-black bg-white p-8 md:p-12">
            <div className="space-y-8">
              <div>
                <p className="text-black/75 leading-relaxed mb-4">
                  This Cookie Policy was last updated on October 27, 2022 and applies to citizens and legal permanent residents of the European Economic Area and Switzerland.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">1. Introduction</h2>
                <p className="text-black/75 leading-relaxed">
                  Our website, <a href="https://heatawards.eu" className="text-black underline font-semibold hover:opacity-70">https://heatawards.eu</a> (hereinafter: "the website") uses cookies and other related technologies (for convenience all technologies are referred to as "cookies"). Cookies are also placed by third parties we have engaged. In the document below we inform you about the use of cookies on our website.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">2. What are cookies?</h2>
                <p className="text-black/75 leading-relaxed">
                  A cookie is a small simple file that is sent along with pages of this website and stored by your browser on the hard drive of your computer or another device. The information stored therein may be returned to our servers or to the servers of the relevant third parties during a subsequent visit.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">3. What are scripts?</h2>
                <p className="text-black/75 leading-relaxed">
                  A script is a piece of program code that is used to make our website function properly and interactively. This code is executed on our server or on your device.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">4. What is a web beacon?</h2>
                <p className="text-black/75 leading-relaxed">
                  A web beacon (or a pixel tag) is a small, invisible piece of text or image on a website that is used to monitor traffic on a website. In order to do this, various data about you is stored using web beacons.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">5. Cookies</h2>

                <h3 className="text-base font-bold text-black mb-2 mt-4">5.1 Technical or functional cookies</h3>
                <p className="text-black/75 leading-relaxed">
                  Some cookies ensure that certain parts of the website work properly and that your user preferences remain known. By placing functional cookies, we make it easier for you to visit our website. This way, you do not need to repeatedly enter the same information when visiting our website and, for example, the items remain in your shopping cart until you have paid. We may place these cookies without your consent.
                </p>

                <h3 className="text-base font-bold text-black mb-2 mt-4">5.2 Statistics cookies</h3>
                <p className="text-black/75 leading-relaxed">
                  We use statistics cookies to optimize the website experience for our users. With these statistics cookies we get insights in the usage of our website. We ask your permission to place statistics cookies.
                </p>

                <h3 className="text-base font-bold text-black mb-2 mt-4">5.3 Marketing/Tracking cookies</h3>
                <p className="text-black/75 leading-relaxed">
                  Marketing/Tracking cookies are cookies or any other form of local storage, used to create user profiles to display advertising or to track the user on this website or across several websites for similar marketing purposes.
                </p>

                <h3 className="text-base font-bold text-black mb-2 mt-4">5.4 Social media</h3>
                <p className="text-black/75 leading-relaxed">
                  On our website, we have included content from Facebook and Instagram to promote web pages (e.g. "like", "pin") or share (e.g. "tweet") on social networks like Facebook and Instagram. This content is embedded with code derived from Facebook and Instagram and places cookies. This content might store and process certain information for personalized advertising.
                </p>
                <p className="text-black/75 leading-relaxed mt-3">
                  Please read the privacy statement of these social networks (which can change regularly) to read what they do with your (personal) data which they process using these cookies. The data that is retrieved is anonymized as much as possible. Facebook and Instagram are located in the United States.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">6. Placed cookies</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-black mb-2">WooCommerce</h3>
                    <p className="text-black/75">Functional</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black mb-2">PHP</h3>
                    <p className="text-black/75">Functional</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black mb-2">PayPal</h3>
                    <p className="text-black/75">Functional</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black mb-2">Jetpack</h3>
                    <p className="text-black/75">Statistics</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black mb-2">WordPress</h3>
                    <p className="text-black/75">Functional</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black mb-2">Stripe</h3>
                    <p className="text-black/75">Functional</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black mb-2">MailChimp</h3>
                    <p className="text-black/75">Marketing, Statistics</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black mb-2">Automattic</h3>
                    <p className="text-black/75">Statistics</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black mb-2">Facebook</h3>
                    <p className="text-black/75">Marketing, Functional</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black mb-2">Complianz</h3>
                    <p className="text-black/75">Functional</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black mb-2">Wistia</h3>
                    <p className="text-black/75">Statistics</p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-black mb-2">Miscellaneous</h3>
                    <p className="text-black/75">Purpose pending investigation</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">7. Consent</h2>
                <p className="text-black/75 leading-relaxed mb-4">
                  When you visit our website for the first time, we will show you a pop-up with an explanation about cookies. As soon as you click on "Save preferences", you consent to us using the categories of cookies and plug-ins you selected in the pop-up, as described in this Cookie Policy. You can disable the use of cookies via your browser, but please note that our website may no longer work properly.
                </p>

                <h3 className="text-base font-bold text-black mb-2 mt-4">7.1 Manage your consent settings</h3>
                <div className="space-y-2 text-black/75">
                  <p><strong className="text-black">Functional:</strong> Always active</p>
                  <p><strong className="text-black">Statistics:</strong> Statistics</p>
                  <p><strong className="text-black">Marketing:</strong> Marketing</p>
                </div>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">8. Enabling/disabling and deleting cookies</h2>
                <p className="text-black/75 leading-relaxed mb-3">
                  You can use your internet browser to automatically or manually delete cookies. You can also specify that certain cookies may not be placed. Another option is to change the settings of your internet browser so that you receive a message each time a cookie is placed. For more information about these options, please refer to the instructions in the Help section of your browser.
                </p>
                <p className="text-black/75 leading-relaxed">
                  Please note that our website may not work properly if all cookies are disabled. If you do delete the cookies in your browser, they will be placed again after your consent when you visit our website again.
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">9. Your rights with respect to personal data</h2>
                <p className="text-black/75 leading-relaxed mb-3">
                  You have the following rights with respect to your personal data:
                </p>
                <ul className="list-disc list-inside text-black/75 leading-relaxed space-y-2">
                  <li>You have the right to know why your personal data is needed, what will happen to it, and how long it will be retained for.</li>
                  <li>Right of access: You have the right to access your personal data that is known to us.</li>
                  <li>Right to rectification: you have the right to supplement, correct, have deleted or blocked your personal data whenever you wish.</li>
                  <li>If you give us your consent to process your data, you have the right to revoke that consent and to have your personal data deleted.</li>
                  <li>Right to transfer your data: you have the right to request all your personal data from the controller and transfer it in its entirety to another controller.</li>
                  <li>Right to object: you may object to the processing of your data. We comply with this, unless there are justified grounds for processing.</li>
                </ul>
                <p className="text-black/75 leading-relaxed mt-3">
                  To exercise these rights, please contact us. Please refer to the contact details at the bottom of this Cookie Policy. If you have a complaint about how we handle your data, we would like to hear from you, but you also have the right to submit a complaint to the supervisory authority (the Data Protection Authority).
                </p>
              </div>

              <div>
                <h2 className="font-[family-name:var(--font-archivo-black)] text-xl uppercase tracking-[0.03em] border-b-2 border-black pb-2 mb-3">10. Contact details</h2>
                <p className="text-black/75 leading-relaxed mb-3">
                  For questions and/or comments about our Cookie Policy and this statement, please contact us by using the following contact details:
                </p>
                <div className="text-black/75 leading-relaxed mb-4">
                  <p>Chili Punk Berlin</p>
                  <p>Ossastr 21A</p>
                  <p>12045 Berlin</p>
                  <p>Germany</p>
                  <p>Website: <a href="https://heatawards.eu" className="text-black underline font-semibold hover:opacity-70">https://heatawards.eu</a></p>
                  <p>Email: <a href="mailto:chilipunkberlin@gmail.com" className="text-black underline font-semibold hover:opacity-70">chilipunkberlin@gmail.com</a></p>
                  <p>Phone number: 017621391410</p>
                </div>
                <p className="text-black/75 leading-relaxed italic">
                  This Cookie Policy was synchronized with cookiedatabase.org on January 16, 2025.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
};

export default CookiesPage;
