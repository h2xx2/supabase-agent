export default {
    translations: {
        cancel: 'Cancel',
        password: 'Password',
        navbar: {
            newAgent: 'New Agent',
            logout: 'Logout'
        },
        auth: {
            signInWithGoogle: 'Sign in with Google',
            signIn: 'Sign In',
            signUp: 'Sign Up',
            labelEmail: 'Email Address',
            labelRememberMe: 'Remember Me',
            labelFirstName: 'First Name',
            labelLastName: 'Last Name',
            notHaveAccount: "Don't have an account? Sign Up",
            haveAccount: "Already have an account? Sign In"
        },
        changePassword: {
            changePassword: 'Change Password',
            change: 'Change',
            labelCurrentPassword: 'Current Password',
            labelNewPassword: 'New Password',
            labelConfirmPassword: 'Confirm Password'
        },
        chatWidget: {
            send: 'Send',
            online: 'Online',
            offline: 'Offline',
            typeMessage:'Type a message'
        },
        createAgent: {
            addNewAgent: 'Add New Agent',
            template: 'Template',
            generalSettings: 'General Settings',
            knowledgeBase: 'Knowledge Base (Optional)',
            uploadFile: 'Upload a file (PDF or TXT) to create a knowledge base for the agent.',
            add: 'Add',
            labelName: 'Name',
            helperTextName: 'Use only letters, numbers, _ or -',
            labelInstructions: 'Instructions',
            helperTextInstructions: 'Minimum length 40 characters',
            labelHttpAction: 'Enable HTTP Action',
            labelEmailAction: 'Enable Email Action',
            customAgent: 'Custom Agent',
            translatorAgent: {
                blueprintName: 'Translator',
                agentName: 'German Translator',
                agentInstructions: 'Translate all incoming messages to German. Do not ask users any questions. Just respond with the translated sentence.'
            },
            personalAssistant: {
                blueprintName: 'Personal Assistant',
                agentName: 'Personal Assistant of John Doe',
                agentInstructions: 'You are the personal assistant of John Doe, the CEO of JD Inc. JD Inc. performs the Software Development with the following technologies: \n' +
                ' - Web Development (React, Angular, NodeJS) \n' +
                ' - Cloud Computing (AWS) \n' +
                ' - iOS/Android Software Development \n' +
                ' - AI / LLM \n' +
                'John Doe is available for the scheduled meetings on the following days: \n' +
                ' - Wednesday 10:00 - 14:00 \n' +
                ' - Friday 11:00 - 15:00 \n\n' +
                '- If the user will ask for the guidance regarding what JD Inc. does - provide him the necessary answers. \n' +
                '- If the user will ask the preliminary feasibility of the project - ask the project details and say that John Doe will contact him back. In the meantime send the email to john.doe@example.com with the provided project details.\n' +
                '- If the user will ask to schedule the meeting with John Doe - request the following information from user: \n' +
                '  - email \n' +
                '  - first and last name \n' +
                '  - topic of the discussion \n' +
                '  - desired day and time (verify it according to John Doe availability) \n' +
                'Once the information above is provided - send the meeting invitation to john.doe@example.com.'
            },
            salesAgent: {
                blueprintName: 'Sales Agent',
                agentName: 'Smartphones Sales Agent',
                agentInstructions: 'You are a sales agent guiding the user over the available smartphones in the shop. The info about the available smartphones is stored in the knowledge base attached.\n\n' +
                'Be polite, introduce yourself first.\n\n' +
                'Make sure the list of selected smartphones is included in the recommendations response.\n\n' +
                'Try to be proactive and always offer something out of the available options.\n\n' +
                'Once user has chosen the smartphone do the following:\n' +
                ' - Ask user for his first name, last name and email\n' +
                ' - Generate the text of the commercial offer\n' +
                ' - Send the commercial offer using the available email action to example@example.com and to user\'s email'
            },
            citiesAgent: {
                blueprintName: 'Cities Game',
                agentName: 'Cities Agent',
                agentInstructions: 'You are an agent to play in Cities with the user. User will write you the name of the city. You have to write back the name starting with the last letter of the city name user has provided. Then user have to do the same, and vice versa, until no more options left, or user surrenders.'
            },
            jokeAgent: {
                blueprintName: 'Joke Agent',
                agentName: 'Joke Agent',
                agentInstructions: 'You are an agent to tell a joke to the user. Whatever the user will say - try to make a corresponding joke. Do not ask for any clarification, just generate the best joke you can.'
            },
            baristaAgent: {
                blueprintName: 'Barista',
                agentName: 'Barista Agent',
                agentInstructions: 'Rules: \n\n' +
                ' - You are a coffee maker agent who is to take an order from customer and to submit send it over email in a human-readable format for further processing\n' +
                ' - The email address is example@example.com. You can send it using the action available for you as an agent.\n' +
                ' - Once the order is taken - please first send the email, then reply to user that the preparation of the coffee has been started\n\n' +
                'Coffee machine supports the following coffee types:\n' +
                ' - espresso\n' +
                ' - americano\n' +
                ' - latte\n' +
                ' - cappuccino\n\n' +
                'the cup size is: \n' +
                ' - 40 ml (for espresso only)\n' +
                ' - 150 ml\n' +
                ' - 250 ml\n' +
                ' - 350 ml\n\n' +
                'Sugar amount:\n' +
                ' - 0\n' +
                ' - 1 spoon\n' +
                ' - 2 spoons\n' +
                ' - 3 spoons',
            },
            helpAgent: {
                blueprintName: 'YouAgentMe Help',
                agentName: 'YouAgentMe Help Agent',
                agentInstructions: 'You are the agent consulting the user on the features of the web service\n' +
                'Service Name: youagent.me\n' +
                'Service Functions:\n' +
                ' - Create AI Agent\n' +
                ' - Edit AI Agent\n' +
                ' - Deploy the chat with the ai agent to be publicly available through the pre-signed URL\n' +
                ' - Revoke the deployment of AI Agent \n' +
                ' - Delete AI Agent\n' +
                'The agent has the following attributes:\n' +
                ' - Name\n' +
                ' - Instructions\n' +
                ' - Knowledge Base file  [optional]\n' +
                ' - HTTP request action (true/false) [optional]\n' +
                ' - Email Action (true/false) [optional]\n' +
                'The agent chats with the end user according to the functions provided by the youagent.me user.\n' +
                'The service has the following payment plans:\n' +
                '1) Free\n' +
                ' - Unlimited agents\n' +
                ' - Up to 200 requests (messages) per month (for all agents of the user)\n' +
                ' - $0/month\n' +
                '2) Personal\n' +
                ' - Unlimited agents\n' +
                ' - Up to 1,000 requests (messages) per month (for all agents of the user)\n' +
                ' - $15/month\n' +
                '3) Custom\n' +
                ' - Unlimited agents\n' +
                ' - Number of requests is negotiable\n' +
                ' - Custom Integrations are possible\n' +
                ' - Price is negotiable \n' +
                '\nIf user would like to upgrade to either Personal or Custom plan - please propose his to create the plan upgrade request. Collect first and last name of the user and his email address. And send the request details to sergei.nntu@gmail.com and to user\'s email address.',
            }
        },
        pricing: {
            freeTiers: {
                title: 'Free',
                desc1: 'Up to 5 agents',
                desc2: 'Up to 100 requests/month',
                buttonText: 'Your current plan',
            },
            personalTiers: {
                title: 'Personal',
                desc1: 'Unlimited agents',
                desc2: 'Up to 1,000 requests/month',
                buttonText: 'Contact Us',
            },
            customTiers: {
                title: 'Custom',
                desc1: 'Unlimited agents',
                desc2: 'Number of requests is negotiable',
                desc3: 'Price is negotiable',
                desc4: 'Extended Support',
                buttonText: 'Contact us',
            },
            pricing: 'Pricing',
            updateTo: 'Upgrade to {{plan}}', 
            perMonth: 'per month',
            requestingUpgrade: 'You are requesting an upgrade to the {{plan}} plan. Please provide the following details to proceed with your request.',
            labelEmail: 'Your Email',
            labelLimits: 'Desired Limits', 
            labelReasonComments: 'Reason/Comments',
            requestUpgrade: 'Request Upgrade', 

        },
        policy: {
            privacyPolicy: 'Privacy Policy',
            service: 'Service: ',
            serviceName: 'youagent.me',
            provider: 'Provider: ',
            providerName: 'Telemetry Balkan doo, Belgrade',
            address: 'Address: ',
            addressName:'11118, Cara Nikolaja II, 11, Belgrade, Serbia',
            lastUpdated: 'Last updated: ',
            lastUpdateData: 'September 4, 2025',
            introductionTitle: '1. Introduction',
            introductionText: 'This Privacy Policy explains how Telemetry Balkan doo, Belgrade (“we”, “us”, “our”) collects, uses, and protects your personal data when you use youagent.me (“the Service”). By accessing or using the Service, you agree to this Privacy Policy. We are committed to safeguarding your privacy and handling your information responsibly.',
            dataWeCollectTitle: '2. Data We Collect',
            infoProvide: 'a. Information You Provide',
            infoProvideList: ' - Account details (e.g., name, email address, password);\n' +
            ' - Content and instructions entered when configuring AI agents;\n' +
            ' - Payment information (if applicable);\n' +
            ' - Communications with us (e.g., support requests, feedback).',

            autoCollectedInfo: 'b. Automatically Collected Information',
            autoCollectedInfoList: ' - Device details (e.g., IP address, browser type, operating system)\n' +
            ' - Usage data (e.g., pages visited, interactions with AI agents)\n' +
            ' - Cookies and similar technologies for functionality and analytics\n',
            agentProcessedData: 'c. Data Processed by AI Agents',
            agentProcessedDataList: ' - Text inputs from you or your end users\n' +
            ' - Data processed through optional features such as email sending, HTTP requests, or knowledge base searches\n',
            howWeUseDataTitle: '3. How We Use Your Data',
            howWeUseDataText: 'We use your data to:\n' +
            ' - Provide, maintain, and improve the Service\n' +
            ' - Enable configuration and operation of AI agents\n' +
            ' - Communicate with you about your account or the Service\n' +
            ' - Analyze and monitor performance and troubleshoot issues\n' +
            ' - Comply with legal requirements and enforce our Terms and Conditions\n' +
            'We do not sell or rent your data to third parties.\n',
            legalGroundsTitle: '4. Legal Grounds for Processing',
            legalGroundsText: 'We process your data based on:\n' +
            ' - Providing and operating the Service you request\n' +
            ' - Our legitimate interest in improving and securing the Service\n' +
            ' - Fulfilling legal and contractual obligations\n' +
            ' - Your consent for optional features (such as cookies or marketing)\n',
            dataSharingTitle: '5. Data Sharing',
            dataSharingText: 'We may share your data only when necessary:\n' +
            ' - With trusted service providers who help us deliver the Service\n' +
            ' - For legal purposes, such as complying with a court order or investigation\n' +
            ' - In connection with a business transaction, such as a merger or acquisition\n' +
            'All third parties handling your data must comply with strict confidentiality and security obligations\n',
            dataRetentionTitle: '6. Data Retention',
            dataRetentionText: 'We store your data only as long as necessary to fulfill the purposes outlined in this Policy or as required by law.',
            securityTitle: '7. Security',
            securityText:  'We take appropriate technical and organizational measures to protect your data against loss, unauthorized access, and misuse. However, no security system is completely foolproof, and we cannot guarantee absolute protection.',
            userRightsTitle: '8. Your Choices and Rights',
            userRightsText:  'You have the right to:\n' +
            ' - Access and review the personal data we hold about you\n' +
            ' - Request corrections to inaccurate or incomplete data\n' +
            ' - Request deletion of your data, subject to legal or contractual requirements\n' +
            ' - Opt out of marketing communications\n' +
            ' - Manage cookies through your browser settings\n' +
            'To exercise these rights, contact us at sergei@2lemetry.io\n',
            cookiesTitle: '9. Cookies and Tracking',
            cookiesText: 'We use cookies and similar tools to enhance your experience, improve the Service, and understand user behavior. You can disable cookies in your browser, though this may affect functionality.',
            internationalTransfersTitle: '10. International Transfers',
            internationalTransfersText: 'If we transfer your data to other countries, we ensure that adequate safeguards are in place to protect your information.',
            childrensPrivacyTitle: '11. Children\'s Privacy',
            childrensPrivacyText: 'The Service is not designed for children under 18. We do not knowingly collect or process data from minors.',
            policyChangesTitle: '12. Changes to This Policy',
            policyChangesText: 'We may update this Privacy Policy at any time. Material changes will be posted here, and your continued use of the Service after changes are posted means you accept the updated Policy.',
            contactInfoTitle: '13. Contact Information',
            contactInfoText: 'For questions or concerns, please contact us at:\n' +
            'Telemetry Balkan doo\n' +
            '11118, Cara Nikolaja II, 11, Belgrade, Serbia',
        },
        settings: {
            labelFirstName: 'First Name',
            labelLastName: 'Last Name',
            labelDateOfBirth: 'Date of Birth (optional)',
            labelUsername: 'Username',
            titlePerMonth: 'Messages per month',
            titlePerYear: 'Messages per year',
            buttonSave: 'Save',
            placeHolderText: 'YYYY-MM-DD',
            
        },
        termsAndConditionAcceptanceDialog: {
            accept: 'Accept',
            decline: 'Decline',
        },
        termsAndConditions: {
            title: 'Terms And Conditions of Use',
            serviceTitle: 'Service:',
            serviceName: 'youagent.me',
            providerTitle: 'Provider:',
            providerName: 'Telemetry Balkan doo, Belgrade',
            addressTitle: 'Address:',
            addressDetails: '11118, Cara Nikolaja II, 11, Belgrade, Serbia',
            lastUpdated: 'Last updated: November 28, 2025',
            introductionTitle: '1. Introduction',
            introductionTextWelcome: 'Welcome to',
            introductionTextName: 'youagent.me',
            introductionTextAdress: 'Telemetry Balkan doo, Belgrade',
            introductionText: '("the Service"), an online platform provided by ',
            introductionText2: '("we", "us", "our"). By accessing or using the Service, you agree to these Terms and Conditions ("Terms"). If you do not agree, you must discontinue using the Service.',
            descriptionTitle: '2. Description of the Service',
            descriptionIntro: 'The Service allows users ("you", "your") to create and configure AI agents powered by large language models (LLMs). These agents may interact with end users based on your provided instructions and may optionally:',
            descriptionList1: 'Send emails',
            descriptionList2: 'Make HTTP requests',
            descriptionList3: 'Search over a knowledge base',
            descriptionAfterList: 'We provide tools and infrastructure for these functionalities but do not guarantee any specific outcomes or performance of the AI agents.',
            eligibilityTitle: '3. Eligibility',
            eligibilityIntro: 'By using the Service, you represent and warrant that you:',
            eligibilityList1: 'Are at least 18 years old (or the age of majority in your jurisdiction)',
            eligibilityList2: 'Have the authority to enter into these Terms',
            eligibilityList3: 'Will use the Service in compliance with applicable laws and regulations',
            userResponsibilitiesTitle: '4. User Responsibilities',
            userResponsibilitiesIntro: 'You are solely responsible for:',
            userResponsibilitiesList1: 'The instructions, data, and content you provide to the Service',
            userResponsibilitiesList2: 'Ensuring your use of the Service complies with all applicable laws, including privacy, data protection, and intellectual property laws',
            userResponsibilitiesList3: 'Any interactions or communications between your AI agents and third parties',
            userResponsibilitiesList4: 'Keeping your account credentials secure and confidential',
            userResponsibilitiesAfterList: 'You agree not to use the Service for any unlawful or harmful purpose, including but not limited to fraud, harassment, dissemination of harmful content, or violation of third-party rights.',
            intellectualPropertyTitle: '5. Intellectual Property',
            intellectualPropertyText: 'All rights, title, and interest in the Service and its components (software, interface, content, trademarks, etc.) remain the property of Telemetry Balkan doo or its licensors. You retain ownership of any data and content you provide, but you grant us a worldwide, non-exclusive, royalty-free license to use, host, and process your content solely for the purpose of operating and improving the Service.',
            serviceAvailabilityTitle: '6. Service Availability',
            serviceAvailabilityText: 'We strive to provide continuous and reliable access to the Service but do not guarantee uninterrupted availability. We may suspend or limit access for maintenance, security, or legal reasons without prior notice.',
            limitationLiabilityTitle: '7. Limitation of Liability',
            limitationLiabilityIntro: 'To the fullest extent permitted by law:',
            limitationLiabilityList1: 'The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, express or implied.',
            limitationLiabilityIntro2: 'We disclaim liability for any damages, direct or indirect, arising from:',
            limitationLiabilitySubList1: 'Use or inability to use the Service',
            limitationLiabilitySubList2: 'Errors, inaccuracies, or omissions in outputs generated by AI agents',
            limitationLiabilitySubList3: 'Unauthorized access, hacking, or breaches of security',
            limitationLiabilitySubList4: 'Third-party actions, integrations, or content',
            limitationLiabilityAfterList: 'In no event shall our aggregate liability exceed the total fees paid by you (if any) for the Service in the preceding three (3) months.',
            indemnificationTitle: '8. Indemnification',
            indemnificationIntro: 'You agree to indemnify, defend, and hold harmless Telemetry Balkan doo, its officers, directors, employees, and affiliates from any claims, damages, or expenses arising from:',
            indemnificationList1: 'your use of the Service;',
            indemnificationList2: 'your content;',
            indemnificationList3: 'your violation of these Terms.',
            thirdPartyServicesTitle: '9. Third-Party Services',
            thirdPartyServicesText: 'The Service may integrate with or link to third-party services (e.g., email providers, APIs). We are not responsible for the availability, content, or conduct of these third-party services.',
            dataPrivacyTitle: '10. Data Privacy',
            dataPrivacyText: 'We process personal data in accordance with our Privacy Policy. By using the Service, you consent to such processing and warrant that you have the necessary rights and permissions for all data you provide.',
            modificationsTitle: '11. Modifications to the Service and Terms',
            modificationsText: 'We may update or discontinue the Service at any time. We reserve the right to amend these Terms, and we will notify you of material changes by updating the "Last updated" date. Your continued use of the Service constitutes acceptance of the revised Terms.',
            governingLawTitle: '12. Governing Law and Jurisdiction',
            governingLawText: 'These Terms are governed by the laws of the Republic of Serbia. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Belgrade, Serbia.',
            terminationTitle: '13. Termination',
            terminationText: 'We may suspend or terminate your access to the Service if you violate these Terms or engage in harmful or unlawful activity. \n' +
            'Upon termination, your right to use the Service ceases immediately, and you remain liable for all obligations incurred prior to termination.',
            contactTitle: '14. Contact',
            contactText1: 'For questions or concerns about these Terms, please contact us at:',
            contactText2: 'Telemetry Balkan doo',
            contactText3: '11118, Cara Nikolaja II, 11, Belgrade, Serbia',
        }, 
    }
};
