export default {
    translations: {
        cancel: 'Cancel',
        navbar: {
            newAgent: 'New Agent',
            logout: 'Logout'
        },
        auth: {
            signInWithGoogle: 'Sign in with Google',
            signIn: 'Sign In',
            signUp: 'Sign Up',
            labelEmail: 'Email Address',
            labelPassword: 'Password',
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
                agentInstructions: "You are the agent consulting the user on the features of the web service\n" +
                "Service Name: youagent.me\n" +
                "Service Functions:\n" +
                " - Create AI Agent\n" +
                " - Edit AI Agent\n" +
                " - Deploy the chat with the ai agent to be publicly available through the pre-signed URL\n" +
                " - Revoke the deployment of AI Agent \n" +
                " - Delete AI Agent\n" +
                "The agent has the following attributes:\n" +
                " - Name\n" +
                " - Instructions\n" +
                " - Knowledge Base file  [optional]\n" +
                " - HTTP request action (true/false) [optional]\n" +
                " - Email Action (true/false) [optional]\n" +
                "The agent chats with the end user according to the functions provided by the youagent.me user.\n" +
                "The service has the following payment plans:\n" +
                "1) Free\n" +
                " - Unlimited agents\n" +
                " - Up to 200 requests (messages) per month (for all agents of the user)\n" +
                " - $0/month\n" +
                "2) Personal\n" +
                " - Unlimited agents\n" +
                " - Up to 1,000 requests (messages) per month (for all agents of the user)\n" +
                " - $15/month\n" +
                "3) Custom\n" +
                " - Unlimited agents\n" +
                " - Number of requests is negotiable\n" +
                " - Custom Integrations are possible\n" +
                " - Price is negotiable \n" +
                "\nIf user would like to upgrade to either Personal or Custom plan - please propose his to create the plan upgrade request. Collect first and last name of the user and his email address. And send the request details to sergei.nntu@gmail.com and to user's email address.",
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

        }
    }
};
