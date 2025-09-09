import { Box, Typography } from '@mui/material';

// @ts-ignore
const PrivacyPolicy = ({ deviceType }   ) => {
    return (
        <Box
            sx={{
        mt: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 3 : 4,
            width: '100%',
            overflowX: 'hidden',
            textAlign: 'left',
    }}
>
    <Typography
        variant={deviceType === 'mobile' ? 'h6' : deviceType === 'tablet' ? 'h5' : 'h5'}
    sx={{ mb: 2 }}
>
    Privacy Policy
    </Typography>
    <Typography variant="body1" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>Service:</strong> youagent.me
    </Typography>
    <Typography variant="body1" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>Provider:</strong> Telemetry Balkan doo, Belgrade
    </Typography>
    <Typography variant="body1" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>Address:</strong> 11118, Cara Nikolaja II, 11, Belgrade, Serbia
    </Typography>
    <Typography variant="body1" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 3 }}>
    <strong>Last updated:</strong> September 4, 2025
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    1. Introduction
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    This Privacy Policy explains how Telemetry Balkan doo, Belgrade (“we”, “us”, “our”) collects, uses, and protects your personal data when you use youagent.me (“the Service”). By accessing or using the Service, you agree to this Privacy Policy.
        We are committed to safeguarding your privacy and handling your information responsibly.
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    2. Data We Collect
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>a. Information You Provide</strong>
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1, pl: 2 }}>
    - Account details (e.g., name, email address, password)<br />
    - Content and instructions entered when configuring AI agents<br />
    - Payment information (if applicable)<br />
    - Communications with us (e.g., support requests, feedback)
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>b. Automatically Collected Information</strong>
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1, pl: 2 }}>
    - Device details (e.g., IP address, browser type, operating system)<br />
    - Usage data (e.g., pages visited, interactions with AI agents)<br />
    - Cookies and similar technologies for functionality and analytics
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>c. Data Processed by AI Agents</strong>
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, pl: 2 }}>
    - Text inputs from you or your end users<br />
    - Data processed through optional features such as email sending, HTTP requests, or knowledge base searches
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    3. How We Use Your Data
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    We use your data to:<br />
    - Provide, maintain, and improve the Service<br />
    - Enable configuration and operation of AI agents<br />
    - Communicate with you about your account or the Service<br />
    - Analyze and monitor performance and troubleshoot issues<br />
    - Comply with legal requirements and enforce our Terms and Conditions<br />
    We do not sell or rent your data to third parties.
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    4. Legal Grounds for Processing
                         </Typography>
                         <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    We process your data based on:<br />
    - Providing and operating the Service you request<br />
    - Our legitimate interest in improving and securing the Service<br />
    - Fulfilling legal and contractual obligations<br />
    - Your consent for optional features (such as cookies or marketing)
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    5. Data Sharing
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    We may share your data only when necessary:<br />
    - With trusted service providers who help us deliver the Service<br />
    - For legal purposes, such as complying with a court order or investigation<br />
    - In connection with a business transaction, such as a merger or acquisition<br />
    All third parties handling your data must comply with strict confidentiality and security obligations.
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    6. Data Retention
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    We store your data only as long as necessary to fulfill the purposes outlined in this Policy or as required by law.
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    7. Security
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    We take appropriate technical and organizational measures to protect your data against loss, unauthorized access, and misuse. However, no security system is completely foolproof, and we cannot guarantee absolute protection.
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    8. Your Choices and Rights
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    You have the right to:<br />
    - Access and review the personal data we hold about you<br />
    - Request corrections to inaccurate or incomplete data<br />
    - Request deletion of your data, subject to legal or contractual requirements<br />
    - Opt out of marketing communications<br />
    - Manage cookies through your browser settings<br />
    To exercise these rights, contact us at <a href="mailto:sergei@2lemetry.io">sergei@2lemetry.io</a>.
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    9. Cookies and Tracking
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    We use cookies and similar tools to enhance your experience, improve the Service, and understand user behavior. You can disable cookies in your browser, though this may affect functionality.
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    10. International Transfers
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    If we transfer your data to other countries, we ensure that adequate safeguards are in place to protect your information.
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    11. Children's Privacy
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    The Service is not designed for children under 18. We do not knowingly collect or process data from minors.
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    12. Changes to This Policy
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    We may update this Privacy Policy at any time. Material changes will be posted here, and your continued use of the Service after changes are posted means you accept the updated Policy.
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    13. Contact Information
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    For questions or concerns, please contact us at:<br />
    Telemetry Balkan doo<br />
    11118, Cara Nikolaja II, 11, Belgrade, Serbia<br />
    <a href="mailto:sergei@2lemetry.io">sergei@2lemetry.io</a>
    </Typography>
    </Box>
);
};

export default PrivacyPolicy;