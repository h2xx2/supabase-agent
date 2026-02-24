import dayjs from 'dayjs';
import dayEn from 'dayjs/locale/en';
import dayRu from 'dayjs/locale/ru';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { en, ru } from './translations';

function defLng(): 'ru' | 'en' {
    const l = localStorage.getItem('i18nextLng') ?? 'ru';

    if (['ru', 'en'].includes(l)) {
        return l as 'ru' | 'en';
    }

    return 'ru';
}

i18n.on('languageChanged', (lng: string) => {
    if (lng === 'ru') {
        return dayjs.locale(dayRu);
    }

    if (lng === 'en') {
        return dayjs.locale(dayEn);
    }

    return undefined;
});

i18n.use(LanguageDetector).init({
    resources: { ru, en },
    lng: defLng(),
    fallbackLng: 'en',
    load: 'languageOnly',
    nsSeparator: false,
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
        formatSeparator: ',',
    },
    react: {
        useSuspense: true,
    },
});

export { i18n };
