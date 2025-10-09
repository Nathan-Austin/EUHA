
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the privacy policy for the EU Hot Sauce Awards.',
};

const PrivacyPage = () => {
  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero title="Privacy Policy" />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        <SectionContainer>
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur max-w-4xl mx-auto">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-amber-200 mb-4">PRIVACY NOTICE</h2>
                <p className="text-white/75 leading-relaxed mb-4">
                  Last updated October 27, 2022
                </p>
                <p className="text-white/75 leading-relaxed mb-4">
                  This privacy notice for Chili Punk Berlin ('Company', 'we', 'us', or 'our'), describes how and why we might collect, store, use, and/or share ('process') your information when you use our services ('Services'), such as when you:
                </p>
                <ul className="list-disc list-inside text-white/75 leading-relaxed mb-4 space-y-2">
                  <li>Visit our website at https://heatawards.eu, or any website of ours that links to this privacy notice</li>
                  <li>Engage with us in other related ways, including any sales, marketing, or events</li>
                </ul>
                <p className="text-white/75 leading-relaxed">
                  Questions or concerns? Reading this privacy notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at heataward@gmail.com.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-amber-200 mb-4">SUMMARY OF KEY POINTS</h2>
                <p className="text-white/75 leading-relaxed mb-4">
                  This summary provides key points from our privacy notice, but you can find out more details about any of these topics by clicking through to the relevant section.
                </p>
                <div className="space-y-3 text-white/75 leading-relaxed">
                  <p><strong className="text-white">What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with Chili Punk Berlin and the Services, the choices you make, and the products and features you use.</p>
                  <p><strong className="text-white">Do we process any sensitive personal information?</strong> We do not process sensitive personal information.</p>
                  <p><strong className="text-white">Do we receive any information from third parties?</strong> We do not receive any information from third parties.</p>
                  <p><strong className="text-white">How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so.</p>
                  <p><strong className="text-white">In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties.</p>
                  <p><strong className="text-white">How do we keep your information safe?</strong> We have organisational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.</p>
                  <p><strong className="text-white">What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.</p>
                  <p><strong className="text-white">How do you exercise your rights?</strong> The easiest way to exercise your rights is by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-amber-200 mb-4">TABLE OF CONTENTS</h2>
                <ol className="list-decimal list-inside text-white/75 leading-relaxed space-y-2">
                  <li>WHAT INFORMATION DO WE COLLECT?</li>
                  <li>HOW DO WE PROCESS YOUR INFORMATION?</li>
                  <li>WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</li>
                  <li>WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</li>
                  <li>HOW LONG DO WE KEEP YOUR INFORMATION?</li>
                  <li>HOW DO WE KEEP YOUR INFORMATION SAFE?</li>
                  <li>DO WE COLLECT INFORMATION FROM MINORS?</li>
                  <li>WHAT ARE YOUR PRIVACY RIGHTS?</li>
                  <li>CONTROLS FOR DO-NOT-TRACK FEATURES</li>
                  <li>DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</li>
                  <li>DO WE MAKE UPDATES TO THIS NOTICE?</li>
                  <li>HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</li>
                  <li>HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</li>
                </ol>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">1. WHAT INFORMATION DO WE COLLECT?</h2>
                <h3 className="text-base font-semibold text-white mb-2">Personal information you disclose to us</h3>
                <p className="text-white/75 leading-relaxed mb-3">
                  <em>In Short:</em> We collect personal information that you provide to us.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  <strong className="text-white">Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
                </p>
                <ul className="list-disc list-inside text-white/75 leading-relaxed mb-3 space-y-1">
                  <li>names</li>
                  <li>phone numbers</li>
                  <li>email addresses</li>
                  <li>mailing addresses</li>
                  <li>billing addresses</li>
                </ul>
                <p className="text-white/75 leading-relaxed mb-3">
                  <strong className="text-white">Sensitive Information.</strong> We do not process sensitive information.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  <strong className="text-white">Payment Data.</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number, and the security code associated with your payment instrument. All payment data is stored by Stripe and Paypal. You may find their privacy notice link(s) here: <a href="https://stripe.com/en-gb-de/privacy" className="text-amber-300 hover:text-amber-200 underline">https://stripe.com/en-gb-de/privacy</a> and <a href="https://www.paypal.com/en/webapps/mpp/ua/privacy-full" className="text-amber-300 hover:text-amber-200 underline">https://www.paypal.com/en/webapps/mpp/ua/privacy-full</a>.
                </p>
                <p className="text-white/75 leading-relaxed">
                  All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
                <p className="text-white/75 leading-relaxed mb-3">
                  <em>In Short:</em> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
                </p>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li><strong className="text-white">To deliver and facilitate delivery of services to the user.</strong> We may process your information to provide you with the requested service.</li>
                  <li><strong className="text-white">To save or protect an individual's vital interest.</strong> We may process your information when necessary to save or protect an individual's vital interest, such as to prevent harm.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</h2>
                <p className="text-white/75 leading-relaxed mb-3">
                  <em>In Short:</em> We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e. legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfil our contractual obligations, to protect your rights, or to fulfil our legitimate business interests.
                </p>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">If you are located in the EU or UK, this section applies to you.</h3>
                <p className="text-white/75 leading-relaxed mb-3">
                  The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:
                </p>
                <ul className="list-disc list-inside text-white/75 leading-relaxed mb-3 space-y-2">
                  <li><strong className="text-white">Consent.</strong> We may process your information if you have given us permission (i.e. consent) to use your personal information for a specific purpose. You can withdraw your consent at any time.</li>
                  <li><strong className="text-white">Performance of a Contract.</strong> We may process your personal information when we believe it is necessary to fulfil our contractual obligations to you, including providing our Services or at your request prior to entering into a contract with you.</li>
                  <li><strong className="text-white">Legal Obligations.</strong> We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.</li>
                  <li><strong className="text-white">Vital Interests.</strong> We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.</li>
                </ul>
                <p className="text-white/75 leading-relaxed mb-4">
                  In legal terms, we are generally the 'data controller' under European data protection laws of the personal information described in this privacy notice, since we determine the means and/or purposes of the data processing we perform.
                </p>

                <h3 className="text-base font-semibold text-white mb-2 mt-4">If you are located in Canada, this section applies to you.</h3>
                <p className="text-white/75 leading-relaxed mb-3">
                  We may process your information if you have given us specific permission (i.e. express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (i.e. implied consent). You can withdraw your consent at any time.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  In some exceptional cases, we may be legally permitted under applicable law to process your information without your consent, including, for example:
                </p>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-1">
                  <li>If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way</li>
                  <li>For investigations and fraud detection and prevention</li>
                  <li>For business transactions provided certain conditions are met</li>
                  <li>If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim</li>
                  <li>For identifying injured, ill, or deceased persons and communicating with next of kin</li>
                  <li>If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse</li>
                  <li>If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province</li>
                  <li>If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records</li>
                  <li>If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced</li>
                  <li>If the collection is solely for journalistic, artistic, or literary purposes</li>
                  <li>If the information is publicly available and is specified by the regulations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
                <p className="text-white/75 leading-relaxed mb-3">
                  <em>In Short:</em> We may share information in specific situations described in this section and/or with the following third parties.
                </p>
                <p className="text-white/75 leading-relaxed">
                  We may need to share your personal information in the following situations:
                </p>
                <ul className="list-disc list-inside text-white/75 leading-relaxed space-y-2">
                  <li><strong className="text-white">Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">5. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
                <p className="text-white/75 leading-relaxed mb-3">
                  <em>In Short:</em> We keep your information for as long as necessary to fulfil the purposes outlined in this privacy notice unless otherwise required by law.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than 6 months.
                </p>
                <p className="text-white/75 leading-relaxed">
                  When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymise such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">6. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
                <p className="text-white/75 leading-relaxed mb-3">
                  <em>In Short:</em> We aim to protect your personal information through a system of organisational and technical security measures.
                </p>
                <p className="text-white/75 leading-relaxed">
                  We have implemented appropriate and reasonable technical and organisational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">7. DO WE COLLECT INFORMATION FROM MINORS?</h2>
                <p className="text-white/75 leading-relaxed mb-3">
                  <em>In Short:</em> We do not knowingly collect data from or market to children under 18 years of age.
                </p>
                <p className="text-white/75 leading-relaxed">
                  We do not knowingly solicit data from or market to children under 18 years of age. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at heataward@gmail.com.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">8. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
                <p className="text-white/75 leading-relaxed mb-3">
                  <em>In Short:</em> In some regions, such as the European Economic Area (EEA), United Kingdom (UK), and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  In some regions (like the EEA, UK, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  We will consider and act upon any request in accordance with applicable data protection laws.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your local data protection supervisory authority. You can find their contact details here: <a href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm" className="text-amber-300 hover:text-amber-200 underline">https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm</a>.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  If you are located in Switzerland, the contact details for the data protection authorities are available here: <a href="https://www.edoeb.admin.ch/edoeb/en/home.html" className="text-amber-300 hover:text-amber-200 underline">https://www.edoeb.admin.ch/edoeb/en/home.html</a>.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  <strong className="text-white">Withdrawing your consent:</strong> If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  <strong className="text-white">Opting out of marketing and promotional communications:</strong> You can unsubscribe from our marketing and promotional communications at any time by clicking on the unsubscribe link in the emails that we send, replying 'STOP' or 'UNSUBSCRIBE' to the SMS messages that we send, or by contacting us. You will then be removed from the marketing lists. However, we may still communicate with you — for example, to send you service-related messages that are necessary for the administration and use of your account, to respond to service requests, or for other non-marketing purposes.
                </p>
                <p className="text-white/75 leading-relaxed">
                  If you have questions or comments about your privacy rights, you may email us at heataward@gmail.com.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">9. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
                <p className="text-white/75 leading-relaxed">
                  Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ('DNT') feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage no uniform technology standard for recognising and implementing DNT signals has been finalised. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this privacy notice.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">10. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
                <p className="text-white/75 leading-relaxed mb-3">
                  <em>In Short:</em> Yes, if you are a resident of California, you are granted specific rights regarding access to your personal information.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  California Civil Code Section 1798.83, also known as the 'Shine The Light' law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year.
                </p>
                <p className="text-white/75 leading-relaxed mb-3">
                  If you are under 18 years of age, reside in California, and have a registered account with Services, you have the right to request removal of unwanted data that you publicly post on the Services. To request removal of such data, please contact us using the contact information provided below and include the email address associated with your account and a statement that you reside in California.
                </p>
                <p className="text-white/75 leading-relaxed mb-4">
                  Chili Punk Berlin has not disclosed or sold any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. Chili Punk Berlin will not sell personal information in the future belonging to website visitors, users, and other consumers.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">11. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
                <p className="text-white/75 leading-relaxed mb-3">
                  <em>In Short:</em> Yes, we will update this notice as necessary to stay compliant with relevant laws.
                </p>
                <p className="text-white/75 leading-relaxed">
                  We may update this privacy notice from time to time. The updated version will be indicated by an updated 'Revised' date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
                <p className="text-white/75 leading-relaxed mb-3">
                  If you have questions or comments about this notice, you may email us at heataward@gmail.com or by post to:
                </p>
                <div className="text-white/75 leading-relaxed mb-4">
                  <p>Chili Punk Berlin</p>
                  <p>Hobrecht Str 78</p>
                  <p>Berlin, Berlin 12043</p>
                  <p>Germany</p>
                </div>
                <p className="text-white/75 leading-relaxed">
                  If you are a resident in the European Economic Area, the 'data controller' of your personal information is Chili Punk Berlin. Chili Punk Berlin has appointed Neil Long to be its representative in the EEA. You can contact them directly regarding the processing of your information by Chili Punk Berlin, by email at heataward@gmail.com, by phone at 017621391410, or by post to:
                </p>
                <div className="text-white/75 leading-relaxed mt-3">
                  <p>Hobrecht Str 78</p>
                  <p>Berlin, Neukolin 12043</p>
                  <p>Germany</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-200 mb-3">13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
                <p className="text-white/75 leading-relaxed">
                  Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, change that information, or delete it. To request to review, update, or delete your personal information, please contact us at heataward@gmail.com.
                </p>
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>
    </div>
  );
};

export default PrivacyPage;
