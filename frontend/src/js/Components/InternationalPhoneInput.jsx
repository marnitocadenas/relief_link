import { useState, useEffect, useRef } from 'react';
import { isValidPhoneNumber, isPossiblePhoneNumber, validatePhoneNumberLength, AsYouType, parsePhoneNumber } from 'libphonenumber-js';
import { COUNTRY_LIST, findCountry } from './countries';

export { COUNTRY_LIST, findCountry };

export default function InternationalPhoneInput({
    id = 'contact_number',
    value = '',
    onChange,
    onBlur,
    disabled = false,
    placeholder,
    className = '',
    defaultCountry = 'PH',
    showError = true,
}) {
    // Resolve initial country
    const initialCountryObj = findCountry(defaultCountry) || COUNTRY_LIST[0];
    const [selectedCountry, setSelectedCountry] = useState(initialCountryObj.code);
    const [localNumber, setLocalNumber] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [touched, setTouched] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const containerRef = useRef(null);
    const selectedItemRef = useRef(null);
    const inputRef = useRef(null);
    const countrySearchRef = useRef(null);

    const activeCountryObj = COUNTRY_LIST.find((c) => c.code === selectedCountry) || COUNTRY_LIST[0];
    const filteredCountries = COUNTRY_LIST.filter((country) => {
        const search = countrySearch.trim().toLowerCase();
        return !search
            || country.name.toLowerCase().includes(search)
            || country.code.toLowerCase().includes(search)
            || country.dialCode.includes(search);
    });

    // Close dropdown on outside click or Escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    useEffect(() => {
        if (disabled) setIsOpen(false);
    }, [disabled]);

    // Start each country search fresh and place cursor directly in search
    useEffect(() => {
        if (isOpen) {
            setCountrySearch('');
            requestAnimationFrame(() => {
                countrySearchRef.current?.focus();
                selectedItemRef.current?.scrollIntoView({ block: 'nearest' });
            });
        }
    }, [isOpen]);

    // Validate and format digits for a given country
    const computeValidation = (digits, countryObj, isExplicitTouched = touched) => {
        const countryCode = countryObj.code;
        const dialCode = countryObj.dialCode;

        if (!digits) {
            return {
                e164: '',
                formatted: '',
                isValid: false,
                error: isExplicitTouched ? 'Contact Number is required.' : '',
            };
        }

        // Limit digits based on country config (allow +1 digit if starting with 0 trunk prefix)
        const hasLeadingZero = digits.startsWith('0');
        const allowedMaxDigits = hasLeadingZero ? countryObj.maxDigits + 1 : countryObj.maxDigits;
        const boundedDigits = digits.slice(0, allowedMaxDigits);

        // Strip leading zero for international E.164 representation
        const nationalSignificantDigits = hasLeadingZero ? boundedDigits.slice(1) : boundedDigits;
        const e164 = `${dialCode}${nationalSignificantDigits}`;

        // Format as you type
        const asYouType = new AsYouType(countryCode);
        const formatted = asYouType.input(boundedDigits);

        // Validate length and full structure
        let isValid = false;
        let error = '';

        try {
            const lengthValidation = validatePhoneNumberLength(boundedDigits, countryCode);
            if (lengthValidation === 'TOO_SHORT' || nationalSignificantDigits.length < countryObj.minDigits) {
                isValid = false;
                error = 'Please enter a valid contact number for the selected Country / Region.';
            } else if (lengthValidation === 'TOO_LONG' || nationalSignificantDigits.length > countryObj.maxDigits) {
                isValid = false;
                error = 'Please enter a valid contact number for the selected Country / Region.';
            } else {
                // Check full phone number validity
                if (
                    isValidPhoneNumber(e164, countryCode) ||
                    isValidPhoneNumber(e164) ||
                    (isPossiblePhoneNumber(e164, countryCode) && nationalSignificantDigits.length >= countryObj.minDigits && nationalSignificantDigits.length <= countryObj.maxDigits) ||
                    (isPossiblePhoneNumber(e164) && nationalSignificantDigits.length >= countryObj.minDigits && nationalSignificantDigits.length <= countryObj.maxDigits)
                ) {
                    isValid = true;
                    error = '';
                } else {
                    isValid = false;
                    error = 'Please enter a valid contact number for the selected Country / Region.';
                }
            }
        } catch {
            isValid = nationalSignificantDigits.length >= countryObj.minDigits && nationalSignificantDigits.length <= countryObj.maxDigits;
            error = isValid ? '' : 'Please enter a valid contact number for the selected Country / Region.';
        }

        return {
            e164,
            formatted,
            isValid,
            error,
        };
    };

    // When defaultCountry prop changes (e.g. user selects a different country from CountrySelect),
    // update phone calling code dynamically and revalidate.
    useEffect(() => {
        const countryObj = findCountry(defaultCountry) || COUNTRY_LIST[0];
        if (countryObj.code === selectedCountry) return;

        setSelectedCountry(countryObj.code);
        const digits = localNumber.replace(/\D/g, '');
        const result = computeValidation(digits, countryObj, touched || digits.length > 0);
        setLocalNumber(result.formatted);
        setErrorMsg(digits ? result.error : '');

        onChange?.(result.e164, result.isValid, {
            localNumber: result.formatted,
            isValid: result.isValid,
            errorMessage: result.error,
            country: countryObj.code,
            dialCode: countryObj.dialCode,
        });
    }, [defaultCountry]);

    // Initialize or parse external value
    useEffect(() => {
        if (!value) {
            setLocalNumber('');
            setErrorMsg('');
            return;
        }

        // Try parsing E.164 value
        try {
            const parsed = parsePhoneNumber(value);
            if (parsed && parsed.country) {
                setSelectedCountry(parsed.country);
                const countryObj = findCountry(parsed.country) || COUNTRY_LIST[0];
                const res = computeValidation(parsed.nationalNumber, countryObj, false);
                setLocalNumber(res.formatted || parsed.nationalNumber);
                setErrorMsg(res.error);
                return;
            }
        } catch {
            // fallback
        }

        const matched = COUNTRY_LIST.find((c) => value.startsWith(c.dialCode));
        if (matched) {
            setSelectedCountry(matched.code);
            const raw = value.slice(matched.dialCode.length).replace(/\D/g, '');
            const res = computeValidation(raw, matched, false);
            setLocalNumber(res.formatted || raw);
            setErrorMsg(res.error);
        } else {
            const raw = value.replace(/\D/g, '');
            const res = computeValidation(raw, activeCountryObj, false);
            setLocalNumber(res.formatted || raw);
            setErrorMsg(res.error);
        }
    }, []);

    const handleCountrySelect = (newCode) => {
        setSelectedCountry(newCode);
        setIsOpen(false);
        setCountrySearch('');
        const countryObj = COUNTRY_LIST.find((c) => c.code === newCode) || COUNTRY_LIST[0];

        // Re-validate and re-format existing digits for the newly selected country
        const rawDigits = localNumber.replace(/\D/g, '');
        const res = computeValidation(rawDigits, countryObj, true);
        setLocalNumber(res.formatted);
        setErrorMsg(rawDigits ? res.error : '');
        onChange?.(res.e164, res.isValid, {
            localNumber: res.formatted,
            isValid: res.isValid,
            errorMessage: res.error,
            country: newCode,
            dialCode: countryObj.dialCode,
        });

        // Focus the input back
        inputRef.current?.focus();
    };

    const handleNumberChange = (e) => {
        const raw = e.target.value;
        const rawDigits = raw.replace(/\D/g, '');
        const res = computeValidation(rawDigits, activeCountryObj, true);

        setLocalNumber(res.formatted);
        setErrorMsg(res.error);
        onChange?.(res.e164, res.isValid, {
            localNumber: res.formatted,
            isValid: res.isValid,
            errorMessage: res.error,
            country: selectedCountry,
            dialCode: activeCountryObj.dialCode,
        });
    };

    const handleBlur = (e) => {
        setTouched(true);
        const rawDigits = localNumber.replace(/\D/g, '');
        const res = computeValidation(rawDigits, activeCountryObj, true);
        setErrorMsg(res.error || (!rawDigits ? 'Contact Number is required.' : ''));
        onBlur?.(e, res.isValid, res.error);
    };

    const dynamicPlaceholder = placeholder || activeCountryObj.placeholder || 'Enter contact number';
    const dynamicMaxLength = (activeCountryObj.maxDigits || 10) + 6; // appropriate dynamic max length based on national digits + separators

    const hasError = touched && !!errorMsg;

    return (
        <div className="w-full">
            <div ref={containerRef} className="relative w-full">
                <div
                    className={`international-phone-control flex w-full ${className} ${
                        disabled
                            ? 'international-phone-control-disabled cursor-not-allowed'
                            : hasError
                                ? 'international-phone-control-error'
                                : ''
                    }`}
                >
                    {/* Calling Code Badge */}
                    <div
                        className={`flex min-h-[2.75rem] items-center gap-1.5 border-r border-[#DBE3F0] px-3 py-2 select-none shrink-0 text-xs font-bold ${
                            disabled ? 'bg-gray-100 text-[#2563EB]/50' : 'bg-[#2563EB]/5 text-[#2563EB]'
                        }`}
                        title={`${activeCountryObj.name} (${activeCountryObj.dialCode})`}
                    >
                        <span>{activeCountryObj.flag || '🌐'}</span>
                        <span>{activeCountryObj.dialCode}</span>
                    </div>

                    {/* Phone Number Input */}
                    <input
                        ref={inputRef}
                        id={id}
                        type="tel"
                        value={localNumber}
                        onChange={handleNumberChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        placeholder={disabled ? 'Select Country / Region first' : dynamicPlaceholder}
                        maxLength={dynamicMaxLength}
                        required
                        className="min-h-[2.75rem] min-w-0 w-full flex-1 border-0 bg-transparent px-3 py-[0.65rem] text-xs font-semibold text-[#1E293B] placeholder-[#94A3B8] outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-gray-50/50"
                    />
                </div>
            </div>

            {/* Inline validation message */}
            {showError && hasError && (
                <p className="mt-1 text-[11px] font-semibold text-red-600 flex items-center gap-1 animate-fadeIn">
                    <svg className="w-3.5 h-3.5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span>{errorMsg}</span>
                </p>
            )}
        </div>
    );
}
