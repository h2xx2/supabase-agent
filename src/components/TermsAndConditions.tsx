import * as React from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useTranslation } from "react-i18next";

const TermsAndConditions: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Typography variant="h4" sx={{fontWeight: 'bold'}} gutterBottom>
                { t("termsAndConditions.title") }
            </Typography>

            <Typography variant="body1">
                <strong>{ t("termsAndConditions.serviceTitle") }</strong> { t("termsAndConditions.serviceName") }
            </Typography>
            <Typography variant="body1">
                <strong>{ t("termsAndConditions.providerTitle") }</strong> { t("termsAndConditions.providerName") }
            </Typography>
            <Typography variant="body1">
                <strong>{ t("termsAndConditions.addressTitle") }</strong> { t("termsAndConditions.addressDetails") }
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    fontStyle: 'italic',
                    mt: 2
                }}>
                { t("termsAndConditions.lastUpdated") }
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.introductionTitle") }
            </Typography>
            <Typography variant="body1" >
                { t("termsAndConditions.introductionTextWelcome") } <strong>{ t("termsAndConditions.introductionTextName") }</strong> { t ("termsAndConditions.introductionText")} <strong>{ t("termsAndConditions.introductionTextAdress") }</strong> { t("termsAndConditions.introductionText2") }
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.descriptionTitle") }
            </Typography>
            <Typography variant="body1" >
                { t("termsAndConditions.descriptionIntro") }
                <ul>
                    <li>{ t("termsAndConditions.descriptionList1") }</li>
                    <li>{ t("termsAndConditions.descriptionList2") }</li>
                    <li>{ t("termsAndConditions.descriptionList3") }</li>
                </ul>
                { t("termsAndConditions.descriptionAfterList") }
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.eligibilityTitle") }
            </Typography>
            <Typography variant="body1" >
                { t("termsAndConditions.eligibilityIntro") }
                <ul>
                    <li>{ t("termsAndConditions.eligibilityList1") }</li>
                    <li>{ t("termsAndConditions.eligibilityList2") }</li>
                    <li>{ t("termsAndConditions.eligibilityList3") }</li>
                </ul>
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.userResponsibilitiesTitle") }
            </Typography>
            <Typography variant="body1" >
                { t("termsAndConditions.userResponsibilitiesIntro") }
                <ul>
                    <li>{ t("termsAndConditions.userResponsibilitiesList1") }</li>
                    <li>{ t("termsAndConditions.userResponsibilitiesList2") }</li>
                    <li>{ t("termsAndConditions.userResponsibilitiesList3") }</li>
                    <li>{ t("termsAndConditions.userResponsibilitiesList4") }</li>
                </ul>
                { t("termsAndConditions.userResponsibilitiesAfterList") }
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.intellectualPropertyTitle") }
            </Typography>
            <Typography variant="body1" >
                { t("termsAndConditions.intellectualPropertyText") }
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.serviceAvailabilityTitle") }
            </Typography>
            <Typography variant="body1" >
                { t("termsAndConditions.serviceAvailabilityText") }
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.limitationLiabilityTitle") }
            </Typography>
            <Typography variant="body1" >
                { t("termsAndConditions.limitationLiabilityIntro") }
                <ul>
                    <li>{ t("termsAndConditions.limitationLiabilityList1") }</li>
                    <li>
                        { t("termsAndConditions.limitationLiabilityIntro2") }
                        <ul>
                            <li>{ t("termsAndConditions.limitationLiabilitySubList1") }</li>
                            <li>{ t("termsAndConditions.limitationLiabilitySubList2") }</li>
                            <li>{ t("termsAndConditions.limitationLiabilitySubList3") }</li>
                            <li>{ t("termsAndConditions.limitationLiabilitySubList4") }</li>
                        </ul>
                    </li>
                    <li>{ t("termsAndConditions.limitationLiabilityAfterList") }</li>
                </ul>
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.indemnificationTitle") }
            </Typography>
            <Typography variant="body1" >
                { t("termsAndConditions.indemnificationIntro") }
                <ul>
                    <li>{ t("termsAndConditions.indemnificationList1") }</li>
                    <li>{ t("termsAndConditions.indemnificationList2") }</li>
                    <li>{ t("termsAndConditions.indemnificationList3") }</li>
                </ul>
            </Typography>
                
            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.thirdPartyServicesTitle") }
            </Typography>
            <Typography variant="body1" >
            { t("termsAndConditions.thirdPartyServicesText") }            
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.dataPrivacyTitle") }
            </Typography>
            <Typography variant="body1" sx={{whiteSpace: 'pre-line'}} >
                { t("termsAndConditions.dataPrivacyText") }
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.modificationsTitle") }
            </Typography>
            <Typography variant="body1" sx={{whiteSpace: 'pre-line'}}>
                { t("termsAndConditions.modificationsText") }
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.governingLawTitle") }
            </Typography>
            <Typography variant="body1" >
                { t("termsAndConditions.governingLawText") }
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.terminationTitle") }
            </Typography>
            <Typography variant="body1" sx={{whiteSpace: 'pre-line'}} >
                { t("termsAndConditions.terminationText") }
            </Typography>

            <Divider sx={{ mt: 3, mb: 3 }}/>

            <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                { t("termsAndConditions.contactTitle") }
            </Typography>
            <Typography variant="body1" sx={{whiteSpace: 'pre-line'}}>
                { t("termsAndConditions.contactText1") }<br />
                <strong>{ t("termsAndConditions.contactText2") }</strong><br />
                { t("termsAndConditions.contactText3") }<br />
                <a href="mailto:support@2lemetry.io">support@2lemetry.io</a>
            </Typography>
        </>
    );
}

export default TermsAndConditions;
