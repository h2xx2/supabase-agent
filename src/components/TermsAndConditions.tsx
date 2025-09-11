import * as React from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const TermsAndConditions: React.FC = () => {
    return (
        <>
            <Typography variant="h4" sx={{fontWeight: 'bold'}} gutterBottom>
                Terms And Conditions of Use
            </Typography>

            <Typography variant="body1">
                <strong>Service:</strong> youagent.me
            </Typography>
            <Typography variant="body1">
                <strong>Provider:</strong> Telemetry Balkan doo, Belgrade
            </Typography>
            <Typography variant="body1">
                <strong>Address:</strong> 11118, Cara Nikolaja II, 11, Belgrade, Serbia
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    fontStyle: 'italic',
                    mt: 2
                }}>
                Last updated: September 4, 2025
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                1. Introduction
            </Typography>
            <Typography variant="body1" >
                Welcome to <strong>youagent.me</strong> ("the Service"), an online platform provided by <strong>Telemetry Balkan doo, Belgrade</strong> ("we", "us", "our"). By accessing or using the Service, you agree to these Terms and Conditions ("Terms"). If you do not agree, you must discontinue using the Service.
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                2. Description of the Service
            </Typography>
            <Typography variant="body1" >
                The Service allows users ("you", "your") to create and configure AI agents powered by large language models (LLMs). These agents may interact with end users based on your provided instructions and may optionally:
                <ul>
                    <li>Send emails</li>
                    <li>Make HTTP requests</li>
                    <li>Search over a knowledge base</li>
                </ul>
                We provide tools and infrastructure for these functionalities but do not guarantee any specific outcomes or performance of the AI agents.
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                3. Eligibility
            </Typography>
            <Typography variant="body1" >
                By using the Service, you represent and warrant that you:
                <ul>
                    <li>Are at least 18 years old (or the age of majority in your jurisdiction);</li>
                    <li>Have the authority to enter into these Terms;</li>
                    <li>Will use the Service in compliance with applicable laws and regulations.</li>
                </ul>
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                4. User Responsibilities
            </Typography>
            <Typography variant="body1" >
                You are solely responsible for:
                <ul>
                    <li>The instructions, data, and content you provide to the Service;</li>
                    <li>Ensuring your use of the Service complies with all applicable laws, including privacy, data protection, and intellectual property laws;</li>
                    <li>Any interactions or communications between your AI agents and third parties;</li>
                    <li>Keeping your account credentials secure and confidential.</li>
                </ul>
                You agree not to use the Service for any unlawful or harmful purpose, including but not limited to fraud, harassment, dissemination of harmful content, or violation of third-party rights.
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                5. Intellectual Property
            </Typography>
            <Typography variant="body1" >
                All rights, title, and interest in the Service and its components (software, interface, content, trademarks, etc.) remain the property of Telemetry Balkan doo or its licensors. You retain ownership of any data and content you provide, but you grant us a worldwide, non-exclusive, royalty-free license to use, host, and process your content solely for the purpose of operating and improving the Service.
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                6. Service Availability
            </Typography>
            <Typography variant="body1" >
                We strive to provide continuous and reliable access to the Service but do not guarantee uninterrupted availability. We may suspend or limit access for maintenance, security, or legal reasons without prior notice.
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                7. Limitation of Liability
            </Typography>
            <Typography variant="body1" >
                To the fullest extent permitted by law:
                <ul>
                    <li>The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied.</li>
                    <li>
                        We disclaim liability for any damages, direct or indirect, arising from:
                        <ul>
                            <li>Use or inability to use the Service;</li>
                            <li>Errors, inaccuracies, or omissions in outputs generated by AI agents;</li>
                            <li>Unauthorized access, hacking, or breaches of security;</li>
                            <li>Third-party actions, integrations, or content.</li>
                        </ul>
                    </li>
                    <li>In no event shall our aggregate liability exceed the total fees paid by you (if any) for the Service in the preceding three (3) months.</li>
                </ul>
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                8. Indemnification
            </Typography>
            <Typography variant="body1" >
                You agree to indemnify, defend, and hold harmless Telemetry Balkan doo, its officers, directors, employees, and affiliates from any claims, damages, or expenses arising from your use of the Service, your content, or your violation of these Terms.
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                9. Third-Party Services
            </Typography>
            <Typography variant="body1" >
                The Service may integrate with or link to third-party services (e.g., email providers, APIs). We are not responsible for the availability, content, or conduct of these third-party services.
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                10. Data Privacy
            </Typography>
            <Typography variant="body1" >
                We process personal data in accordance with our Privacy Policy. By using the Service, you consent to such processing and warrant that you have the necessary rights and permissions for all data you provide.
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                11. Modifications to the Service and Terms
            </Typography>
            <Typography variant="body1" >
                We may update or discontinue the Service at any time. We reserve the right to amend these Terms, and we will notify you of material changes by updating the "Last updated" date. Your continued use of the Service constitutes acceptance of the revised Terms.
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                12. Governing Law and Jurisdiction
            </Typography>
            <Typography variant="body1" >
                These Terms are governed by the laws of the Republic of Serbia. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Belgrade, Serbia.
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                13. Termination
            </Typography>
            <Typography variant="body1" >
                We may suspend or terminate your access to the Service if you violate these Terms or engage in harmful or unlawful activity. Upon termination, your right to use the Service ceases immediately, and you remain liable for all obligations incurred prior to termination.
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                14. Contact
            </Typography>
            <Typography variant="body1">
                For questions or concerns about these Terms, please contact us at:<br />
                <strong>Telemetry Balkan doo</strong><br />
                11118, Cara Nikolaja II, 11, Belgrade, Serbia<br />
                <a href="mailto:sergei@2lemetry.io">sergei@2lemetry.io</a>
            </Typography>


        </>
    );
}

export default TermsAndConditions;
