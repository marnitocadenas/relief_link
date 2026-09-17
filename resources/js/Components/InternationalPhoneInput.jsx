import { useState, useEffect } from 'react';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

export const COUNTRY_LIST = [
    { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
    { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
    { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
    { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
    { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
    { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
    { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
    { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
    { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
    { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰' },
    { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼' },
    { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
];

export default function InternationalPhoneInput({
    id = 'contact_number',
    value = '',
    onChange,
    disabled = false,
    placeholder = 'Enter phone number',
    className = '',
    defaultCountry = 'PH',
}) {
    const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
    const [localNumber, setLocalNumber] = useState('');

    // Parse initial value if given in E.164
    useEffect(() => {
        if (!value) {
            setLocalNumber('');
            return;
        }

        try {
            const parsed = parsePhoneNumber(value);
            if (parsed && parsed.country) {
                setSelectedCountry(parsed.country);
                setLocalNumber(parsed.nationalNumber);
                return;
            }
        } catch {
            // fallback
        }

        // If simple value starts with a known country dial code
        const matched = COUNTRY_LIST.find((c) => value.startsWith(c.dialCode));
        if (matched) {
            setSelectedCountry(matched.code);
            setLocalNumber(value.slice(matched.dialCode.length).trim());
        } else {
            setLocalNumber(value);
        }
    }, []);

    const activeCountryObj = COUNTRY_LIST.find((c) => c.code === selectedCountry) || COUNTRY_LIST[0];

    const handleCountryChange = (e) => {
        const newCode = e.target.value;
        setSelectedCountry(newCode);
        const countryObj = COUNTRY_LIST.find((c) => c.code === newCode) || COUNTRY_LIST[0];
        updateValue(newCode, countryObj.dialCode, localNumber);
    };

    const handleNumberChange = (e) => {
        const raw = e.target.value;
        // Keep digits, spaces, dashes, parentheses
        const cleaned = raw.replace(/[^\d\s\-()]/g, '');
        setLocalNumber(cleaned);
        updateValue(selectedCountry, activeCountryObj.dialCode, cleaned);
    };

    const updateValue = (countryCode, dialCode, numberStr) => {
        const trimmedNumber = numberStr.trim();
        if (!trimmedNumber) {
            onChange?.('', false);
            return;
        }

        let e164 = '';
        let isValid = false;

        try {
            if (isValidPhoneNumber(trimmedNumber, countryCode)) {
                const parsed = parsePhoneNumber(trimmedNumber, countryCode);
                e164 = parsed.format('E.164');
                isValid = true;
            } else {
                // Construct fallback normalized string
                const digitsOnly = trimmedNumber.replace(/\D/g, '');
                // Handle leading zero in national number
                const stripped = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
                e164 = `${dialCode}${stripped}`;
                // Double check if valid
                isValid = isValidPhoneNumber(e164);
            }
        } catch {
            const digitsOnly = trimmedNumber.replace(/\D/g, '');
            const stripped = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
            e164 = `${dialCode}${stripped}`;
            isValid = digitsOnly.length >= 7 && digitsOnly.length <= 15;
        }

        onChange?.(e164, isValid);
    };

    return (
        <div
            className={`mt-1 flex items-stretch overflow-hidden rounded-[0.7rem] border border-[#2563EB] bg-white transition focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E] ${
                disabled ? 'cursor-not-allowed opacity-50 bg-[#2563EB]/5' : ''
            } ${className}`}
        >
            <select
                aria-label="Country dial code"
                value={selectedCountry}
                onChange={handleCountryChange}
                disabled={disabled}
                className="w-auto shrink-0 bg-transparent border-0 border-r border-[#2563EB] text-[#2563EB] font-semibold text-xs py-2 pl-2.5 pr-1 outline-none focus:outline-none focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
            >
                {COUNTRY_LIST.map((c) => (
                    <option key={c.code} value={c.code} className="text-[#2563EB] bg-white font-semibold">
                        {c.flag} {c.dialCode} ({c.code})
                    </option>
                ))}
            </select>

            <input
                id={id}
                type="tel"
                value={localNumber}
                onChange={handleNumberChange}
                disabled={disabled}
                placeholder={placeholder}
                maxLength={20}
                required
                className="flex-1 min-w-0 bg-transparent border-0 text-[#2563EB] font-semibold text-xs py-2 px-3 outline-none focus:outline-none focus:ring-0 placeholder:text-[#2563EB]/60 disabled:cursor-not-allowed"
            />
        </div>
    );
}
