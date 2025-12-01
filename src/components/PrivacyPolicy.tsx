import { Box, Typography } from '@mui/material';
import { useTranslation } from "react-i18next";

// @ts-ignore
const PrivacyPolicy = ({ deviceType }   ) => {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
        mt: deviceType === 'mobile' ? 2 : deviceType === 'tablet' ? 3 : 4,
            width: '100%',
            overflowX: 'hidden',
            textAlign: 'left',
    }}
>
    <Typography variant={deviceType === 'mobile' ? 'h6' : deviceType === 'tablet' ? 'h5' : 'h5'} sx={{ mb: 2 }}>   
    { t("policy.privacyPolicy") }
    </Typography>
    <Typography variant="body1" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>{ t("policy.service") }</strong> { t("policy.serviceName") }
    </Typography>
    <Typography variant="body1" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>{ t("policy.provider") }</strong> { t("policy.providerName") }
    </Typography>
    <Typography variant="body1" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>{ t("policy.address") }</strong> { t("policy.addressName") }
    </Typography>
    <Typography variant="body1" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 3 }}>
    <strong>{ t("policy.lastUpdated") }</strong> { t("policy.lastUpdateData") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.introductionTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2 }}>
    { t("policy.introductionText") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.dataWeCollectTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>{ t("policy.infoProvide") }</strong>
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1, pl: 2, whiteSpace: 'pre-line'}}>
    { t("policy.infoProvideList") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>{ t("policy.autoCollectedInfo") }</strong>
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1, pl: 2, whiteSpace: 'pre-line' }}>
    { t("policy.autoCollectedInfoList") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 1 }}>
    <strong>{ t("policy.agentProcessedData") }</strong>
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, pl: 2, whiteSpace: 'pre-line' }}>
    { t("policy.agentProcessedDataList") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
   { t("policy.howWeUseDataTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, whiteSpace: 'pre-line' }}>
   { t("policy.howWeUseDataText") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.legalGroundsTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, whiteSpace: 'pre-line' }}>
    { t("policy.legalGroundsText") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.dataSharingTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, whiteSpace: 'pre-line' }}>
    { t("policy.dataSharingText") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.dataRetentionTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, whiteSpace: 'pre-line' }}>
    { t("policy.dataRetentionText") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.securityTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, whiteSpace: 'pre-line' }}>
    { t("policy.securityText") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.userRightsTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, whiteSpace: 'pre-line' }}>
    { t("policy.userRightsText") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.cookiesTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, whiteSpace: 'pre-line' }}>
   { t("policy.cookiesText") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.internationalTransfersTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, whiteSpace: 'pre-line' }}>
    { t("policy.internationalTransfersText") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.childrensPrivacyTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, whiteSpace: 'pre-line' }}>
    { t("policy.childrensPrivacyText") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.policyChangesTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, whiteSpace: 'pre-line' }}>
    { t("policy.policyChangesText") }
    </Typography>

    <Typography variant="h6" sx={{ fontSize: deviceType === 'mobile' ? '1.1rem' : deviceType === 'tablet' ? '1.15rem' : '1.25rem', mb: 2 }}>
    { t("policy.contactInfoTitle") }
    </Typography>
    <Typography variant="body2" sx={{ fontSize: deviceType === 'mobile' ? '0.9rem' : deviceType === 'tablet' ? '0.95rem' : '1rem', mb: 2, whiteSpace: 'pre-line' }}>
    { t("policy.contactInfoText") }
    <a href="mailto:support@2lemetry.io">support@2lemetry.io</a>
    </Typography>
    </Box>
);
};

export default PrivacyPolicy;