export default {
    translations: {
        cancel: 'Cancel',
        password: 'Password',
        generalSettings: 'General Settings',
        knowledgeBase: 'Knowledge Base (Optional)',
        buttonSave: 'Save',
        buttonDelete: 'Delete',
        loginRequired: 'Please log in.',
        aliasCreationError: 'Error when creating an alias: {{message}}',
        nameInstructionsRequired: 'Name and instructions (min. 40 characters) are required',
        invalidAgentName: 'Invalid agent name',
        labelName: 'Name',
        helperTextName: 'Use only letters, numbers, _ or -',
        labelInstructions: 'Instructions',
        helperTextInstructions: 'Minimum length 40 characters',
        labelHttpAction: 'Enable HTTP Action',
        labelEmailAction: 'Enable Email Action',
        labelGenerationAction: 'Enable Generation Action',
        labelProcessingAction: 'Enable Processing Action',
        pHolderWriteMsg: 'Write a message or attach a file...',
        readySend: 'Ready to send',
        navbar: {
            newAgent: 'New Agent',
            logout: 'Logout'
        },
        auth: {
            signInWithGoogle: 'Sign in with Google',
            signIn: 'Sign In',
            signUp: 'Sign Up',
            didntReceiveEmail: "Didn't receive the email?",
            resendVerificationSeconds: 'Resend verification email ({{cooldownSeconds}}s)',
            resendVerification: 'Resend verification email',
            labelEmail: 'Email Address',
            labelRememberMe: 'Remember Me',
            labelFirstName: 'First Name',
            labelLastName: 'Last Name',
            failedGoogleSignIn: 'Failed to start Google sign-in',
            googleSignInFailed: 'Google sign-in failed',
            notHaveAccount: "Don't have an account? Sign Up",
            haveAccount: "Already have an account? Sign In",
            msgUnexpectedError: 'Unexpected error. Please try again later.',
            msgEmailNotConfirmed: 'Email not confirmed',
            msgErrFillFields: 'Please fill email, password, first name, and last name',
            msgErrNotConfirmedCheckEmail: 'Email not confirmed. Please check your email.',
            msgSignUpErr: 'Sign Up error',
            msgConfirmYourAccount: 'Please confirm your account via email. Sign in after confirmation',
            msgSignUpSuccessUserNotFound: 'Sign Up has succeeded, but user was not found',
            msgFillEmailAndPassword: 'Please fill email and password',
            msgErrIncorrectServerResponse: 'Incorrect server response',
            msgErrEnterEmailResendLink: 'Please enter an email to resend the verification link',
            msgVerificationEmailSent: 'Verification email sent to ',
            agentsTypography: 'Agents',
            namePublicAgent: 'YouAgentMe Wizard',
            descPublicAgent: 'Provides support and helps to create new agents (anonymous).',
            welcomeMsg: "👋 **Welcome! I’m YouAgentMe Wizard**\n\nI’m your personal guide to **youagent.me** — the agentic AI service that helps you instantly create powerful AI agents with exactly the functionality you need.\n\n✨ **What I can help you with:**\n- Build a custom **agentic AI** in minutes (no guesswork)  \n- Configure agent behavior, tools, and workflows  \n- Explain **youagent.me features** and best practices  \n- Guide you through using everything from the **Web UI**  \n- Handle support questions and troubleshooting  \n\nJust tell me **what you want your agent to do**, or ask any question about how youagent.me works — and I’ll take care of the rest.\n\n🚀 Let’s create your agent. What’s your goal today?",
            agents: {
                germanTranslator: {
                name: 'German Translator',
                desc: 'Translate all incoming messages to German. Do not ask any questions...'
                },
                frenchTranslator: {
                    name: 'French Translator',
                    desc: 'Translate all messages to French instantly.'
                },
                codeReviewer: {
                    name: 'Code Reviewer',
                    desc: 'Review code and suggest improvements.'
                },
                welcomeMsg: "Hello! I'm aurora. How can I help?",
                temporaryAgents: 'Temporary agents',
                selectAgent: 'Select an agent',
            },
            chat: {
                aLabelOpenChat: 'Open chat',
                ariaLabel: 'Chat with {{agentName}}',
                openAgents: 'Open agents',
                closeChat: 'Close chat'
            }
        },
        changePassword: {
            changePassword: 'Change Password',
            change: 'Change',
            labelCurrentPassword: 'Current Password',
            labelNewPassword: 'New Password',
            labelConfirmPassword: 'Confirm Password',
            fillPasswordFields: 'Please fill current password, new password and confirm password fields',
            passwordMismatch: 'New password and confirm password should be the same',
            changePasswordFailed: 'Could not change password'
        },
        chatWidget: {
            send: 'Send',
            online: 'Online',
            offline: 'Offline',
            typeMessage:'Type a message'
        },
        copyright: {
            copyright: 'Copyright © {{year}} Telemetry Balkan doo Belgrade.'
        },
        createAgent: {
            addNewAgent: 'Add New Agent',
            template: 'Template',
            generalSettings: 'General Settings',
            uploadFile: 'Upload a file (PDF or TXT) to create a knowledge base for the agent.',
            add: 'Add',
            customAgent: 'Custom Agent',
            translatorAgent: {
                blueprintName: 'Translator',
                agentName: 'German Translator'
            },
            personalAssistant: {
                blueprintName: 'Personal Assistant',
                agentName: 'Personal Assistant of John Doe'
            },
            salesAgent: {
                blueprintName: 'Sales Agent',
                agentName: 'Smartphones Sales Agent'
            },
            citiesAgent: {
                blueprintName: 'Cities Game',
                agentName: 'Cities Agent'
            },
            jokeAgent: {
                blueprintName: 'Joke Agent',
                agentName: 'Joke Agent'
            },
            baristaAgent: {
                blueprintName: 'Barista',
                agentName: 'Barista Agent'
            },
            helpAgent: {
                blueprintName: 'YouAgentMe Help',
                agentName: 'YouAgentMe Help Agent'
            },
            agentIdMissing: 'agentId not received in response',
            knowledgeBaseIdMissing: 'knowledgeBaseId not received in response',
            statusNotPrepared: 'Agent status did not become PREPARED',
            creationError: 'Error creating agent or knowledge base: {{message}}',
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
            priceFree: '$0',
            pricePersonal: '$15',
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
            placeHolderText: 'YYYY-MM-DD',
            fillFirstLastName: 'Please fill first name and last name',
            saveFailed: 'Failed to save settings. Please try again.',
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
        main: {
            welcomeMessageTitle: 'Welcome to YouAgent.me Agentic AI service.',
            welcomeMessageDescription: 'This tour will guide you through the agent creation process. Click next to continue.',
            newAgentButton: 'Press “New Agent” button in order to start the new agent creation.',
            blueprintSelect: 'Choose the blueprint to run the agent examples or proceed from scratch by going straight to the next step.',
            blueprintMenuList: 'This is a drop-down list of templates. Select one of them or select "custom agent" to create an agent from scratch.',
            nameInput: 'Insert your agent name. Use Letters and Digits only, avoid special symbols.',
            instructionsInput: 'Write the instructions to your agents how it must communicate with your users. Describe his duties in the same way as you would describe them to human.',
            actionsCheckboxes: 'If your agent needs to send emails or make HTTP requests, set the corresponding checkbox to True. If no - go to the next step.',
            kbSection: 'If your agent is to consult the user over the information from the document or table - please upload this document in the Knowledge base section. If no - go to the next step.',
            addAgentButton: 'Click Add to complete your Agent creation.',
            agentCard: 'Congratulations! Your first Agent is ready. Click Next to learn what you can do with it.',
            openChatButton: 'Click “Chat” button to instantly start chatting with your agent.',
            chatDialog: 'Write your first message to the agent and Click “Send button”.',
            chatClose: 'Chat as long as you like. Then press “Close” button to close the chat dialog.',
            deployButton: 'To make your agent publicly available press the Deploy button.',
            publicLink: 'Share the public link with your users. They can now also chat with your agent.',
            integrationScript: 'You can also copy and paste the integration script into your Website, to make the agent widget to be available for your visitors.',
            congratulations: 'Congratulations!',
            conclusionMessage:'You have learned the basics of AI Agents creation with YouAgent.me platform. Hope you enjoyed it! If you have any more questions - please feel free to contact our support.',
            buttonNext: 'Next',
            buttonClose: 'Close',
            buttonPrev: 'Prev'
        },
        app: {
            actions: 'Actions',
            agent: 'Agent', 
            yearRequestsCount: 'Yearly Requests Count:',
            monthRequestsCount: 'Month Requests Count:',
            downloadKnowledgeBase: 'Download Knowledge Base',
            knowledgeBaseFile: 'Knowledge Base File:',
            publicLink: 'Public Link:',
            buttonChat: 'Chat',
            buttonDeploy: 'Deploy',
            buttonRevoke: 'Revoke',
            buttonEdit: 'Edit',
            buttonCreateAlias: 'Create Alias',
            integrationScript: 'Integration Script',
            copyScript: 'Copy Script',
            noAgents: 'No Agents',
            editAgent: 'Edit Agent',
            fileMessage: '{{initialKnowledgeBaseFile}}. You can upload a new file to update or leave it as is.',
            confirmDeletion: 'Confirm Deletion',
            deleteAgentConfirm: 'Are you sure you want to delete the agent \"{{name}}\"? This action cannot be undone.',
            chatWith: 'Chat with {{name}}',
            msgErrFailedLoadAgent: 'Failed to load agents',
            initialKnowledgeBaseFile: 'Knowledge base file exists',
            cannotSelectNewFileWhileDeleting: 'You cannot select a new file when deleting the knowledge base.',
            errorUpdatingAgent: 'Error updating agent: {{message}}',
            knowledgeBasePdf: 'knowledge_base.pdf',
            couldntDownloadKbFile: 'Couldn\'t download knowledge base file',
            failedSendMsg: 'Error: Failed to send message',
            unsupportedFileType: 'Unsupported file type. Allowed: {{extensions}}',
            fileTooLarge: 'File too large. Maximum ~9.5 MB',
            publicInfo: 'Public URL: {{publicUrl}}\nAPK Key: {{apkKey}}\nCopy it and use it for access!',
            dispatchError: 'Error when dispatching the chat: {{message}}',
            revokeError: 'Error when revoke chat: {{message}}',
            deleteMissingData: 'Agent cannot be deleted: necessary data is missing',
            deleteError: 'Error deleting the agent: {{message}}',
            scriptCopied: 'The script has been copied to the clipboard!',
            scriptCopyError: 'Error when copying the script',
            labelDeleteKnowledgeBase: 'Delete knowledge base',
            kbDeleting: 'Selected knowledge base deleting. File selection is not possible.',
            kbUploadInfo: 'Upload a new file (PDF or TXT) to update the knowledge base. If no file is selected, the current knowledge base will remain unchanged.',

        },
        page: {
            AGENTS: "My Agents",
            SETTINGS: "Settings",
            PRIVACY_POLICY: "Privacy Policy",
            TERMS_AND_CONDITIONS: "Terms and Conditions",
            addAgents: 'Add Agents',
  }
    }
};
