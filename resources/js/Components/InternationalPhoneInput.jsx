import { useState, useEffect, useRef } from 'react';
import { isValidPhoneNumber, validatePhoneNumberLength, AsYouType, parsePhoneNumber } from 'libphonenumber-js';

export const COUNTRY_LIST = [
    { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', placeholder: '917 123 4567', minDigits: 10, maxDigits: 10 },
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', placeholder: '202 555 0123', minDigits: 10, maxDigits: 10 },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', placeholder: '416 555 0123', minDigits: 10, maxDigits: 10 },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456', minDigits: 10, maxDigits: 10 },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', placeholder: '412 345 678', minDigits: 9, maxDigits: 9 },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', placeholder: '90 1234 5678', minDigits: 10, maxDigits: 10 },
    { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', placeholder: '10 1234 5678', minDigits: 9, maxDigits: 10 },
    { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', placeholder: '8123 4567', minDigits: 8, maxDigits: 8 },
    { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567', minDigits: 9, maxDigits: 9 },
    { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', placeholder: '50 123 4567', minDigits: 9, maxDigits: 9 },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', placeholder: '151 12345678', minDigits: 10, maxDigits: 11 },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78', minDigits: 9, maxDigits: 9 },
    { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', placeholder: '312 345 6789', minDigits: 9, maxDigits: 10 },
    { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', placeholder: '612 34 56 78', minDigits: 9, maxDigits: 9 },
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', placeholder: '98123 45678', minDigits: 10, maxDigits: 10 },
    { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', placeholder: '138 1234 5678', minDigits: 11, maxDigits: 11 },
    { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', placeholder: '21 123 4567', minDigits: 8, maxDigits: 10 },
    { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', placeholder: '3312 3456', minDigits: 8, maxDigits: 8 },
    { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', placeholder: '9123 4567', minDigits: 8, maxDigits: 8 },
    { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', placeholder: '12 345 6789', minDigits: 9, maxDigits: 10 },
    { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', placeholder: '812 3456 7890', minDigits: 9, maxDigits: 12 },
    { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', placeholder: '81 234 5678', minDigits: 9, maxDigits: 9 },
    { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', placeholder: '91 234 5678', minDigits: 9, maxDigits: 10 },
    { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', placeholder: '9123 4567', minDigits: 8, maxDigits: 8 },
    { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼', placeholder: '912 345 678', minDigits: 9, maxDigits: 9 },
    { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', placeholder: '11 98765 4321', minDigits: 10, maxDigits: 11 },
    { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', placeholder: '55 1234 5678', minDigits: 10, maxDigits: 10 },
];

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
    const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
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

    // Start each country search fresh and place the cursor directly in the
    // search field when the calling-code list opens.
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
                error: isExplicitTouched ? 'Contact number is required.' : '',
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
                error = 'Contact number is incomplete for the selected country.';
            } else if (lengthValidation === 'TOO_LONG' || nationalSignificantDigits.length > countryObj.maxDigits) {
                isValid = false;
                error = `Contact number exceeds the ${countryObj.maxDigits}-digit limit for ${countryObj.name}.`;
            } else {
                // Check full phone number validity
                if (isValidPhoneNumber(e164, countryCode) || isValidPhoneNumber(e164)) {
                    isValid = true;
                    error = '';
                } else {
                    isValid = false;
                    error = 'Please enter a valid mobile number for the selected country.';
                }
            }
        } catch {
            isValid = nationalSignificantDigits.length >= countryObj.minDigits && nationalSignificantDigits.length <= countryObj.maxDigits;
            error = isValid ? '' : 'Please enter a valid mobile number for the selected country.';
        }

        return {
            e164,
            formatted,
            isValid,
            error,
        };
    };

    // The registration form may already know the user's country (for example,
    // an international donor selecting "United States"). Keep its dial code
    // and phone validation in sync instead of leaving the control on PH +63.
    useEffect(() => {
        const countryObj = COUNTRY_LIST.find((country) => country.code === defaultCountry) || COUNTRY_LIST[0];
        if (countryObj.code === selectedCountry) return;

        setSelectedCountry(countryObj.code);
        const digits = localNumber.replace(/\D/g, '');
        const result = computeValidation(digits, countryObj, touched);
        setLocalNumber(result.formatted);
        setErrorMsg(digits ? result.error : '');

        if (digits) {
            onChange?.(result.e164, result.isValid, {
                localNumber: result.formatted,
                isValid: result.isValid,
                errorMessage: result.error,
                country: countryObj.code,
                dialCode: countryObj.dialCode,
            });
        }
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
                const countryObj = COUNTRY_LIST.find((c) => c.code === parsed.country) || COUNTRY_LIST[0];
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
        const res = computeValidation(rawDigits, activeCountryObj, touched);

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
        setErrorMsg(res.error || (!rawDigits ? 'Contact number is required.' : ''));
        onBlur?.(e, res.isValid, res.error);
    };

    const dynamicPlaceholder = placeholder || activeCountryObj.placeholder || 'Enter contact number';
    const dynamicMaxLength = (activeCountryObj.maxDigits || 10) + 7; // extra space for separators

    const hasError = touched && !!errorMsg;

    return (
        <div className="w-full">
            <div
                ref={containerRef}
                className={`relative mt-1 flex items-stretch rounded-[0.7rem] border transition ${
                    hasError
                        ? 'border-red-500 ring-1 ring-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500'
                        : 'border-[#2563EB] focus-within:border-[#22C55E] focus-within:ring-2 focus-within:ring-[#22C55E]'
                } bg-white ${
                    disabled ? 'cursor-not-allowed opacity-50 bg-[#2563EB]/5' : ''
                } ${className}`}
            >
                {/* Country Selector Trigger Button */}
                <button
                    type="button"
                    id={`${id}_country_btn`}
                    aria-label="Country dial code"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 shrink-0 bg-transparent border-0 border-r border-[#2563EB] text-[#2563EB] font-semibold text-xs py-2 pl-3 pr-2.5 outline-none focus:outline-none cursor-pointer disabled:cursor-not-allowed select-none rounded-l-[0.65rem] hover:bg-[#2563EB]/5 transition"
                >
                    <span className="text-sm leading-none select-none">{activeCountryObj.flag}</span>
                    <span className="font-bold">{activeCountryObj.dialCode}</span>
                    <svg
                        className={`w-3 h-3 text-[#2563EB] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                {/* Searchable, scrollable country-code list shared by registration forms. */}
                {isOpen && (
                    <div
                        role="listbox"
                        tabIndex={-1}
                        aria-label="Select Country"
                        className="absolute top-[calc(100%+4px)] left-0 z-50 w-72 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-xl border border-[#2563EB]/20 bg-white shadow-2xl focus:outline-none"
                    >
                        <div className="border-b border-[#2563EB]/15 bg-white p-2">
                            <label className="sr-only" htmlFor={`${id}_country_search`}>Search country</label>
                            <div className="flex items-center gap-2 rounded-lg border border-[#2563EB]/25 px-2.5 py-1.5 focus-within:border-[#22C55E] focus-within:ring-1 focus-within:ring-[#22C55E]">
                                <svg className="h-3.5 w-3.5 shrink-0 text-[#2563EB]/70" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true">
                                    <circle cx="8.5" cy="8.5" r="5" strokeWidth="1.8" />
                                    <path d="m12.2 12.2 4 4" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                                <input
                                    ref={countrySearchRef}
                                    id={`${id}_country_search`}
                                    type="search"
                                    value={countrySearch}
                                    onChange={(event) => setCountrySearch(event.target.value)}
                                    placeholder="Search country..."
                                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs font-semibold text-[#2563EB] outline-none placeholder:text-[#2563EB]/60"
                                />
                            </div>
                        </div>
                        <div className="max-h-52 overflow-y-auto py-1 overscroll-contain">
                            {filteredCountries.map((c) => {
                                const isSelected = c.code === selectedCountry;
                                return (
                                    <button
                                        key={c.code}
                                        ref={isSelected ? selectedItemRef : null}
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => handleCountrySelect(c.code)}
                                        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2 text-left text-xs transition select-none ${
                                            isSelected
                                                ? 'bg-[#22C55E] text-white font-bold'
                                                : 'text-[#2563EB] hover:bg-[#2563EB]/10 font-semibold'
                                        }`}
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                            <span className="text-base leading-none shrink-0">{c.flag}</span>
                                            <span className="shrink-0 text-[10px] font-extrabold">{c.code}</span>
                                            <span className="truncate">{c.name}</span>
                                        </div>
                                        <span className={`shrink-0 font-bold text-xs ${isSelected ? 'text-white' : 'text-[#2563EB]/70'}`}>
                                            {c.dialCode}
                                        </span>
                                    </button>
                                );
                            })}
                            {filteredCountries.length === 0 && (
                                <p className="px-3.5 py-3 text-xs font-semibold text-[#2563EB]/70">No countries found.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Phone Number Input */}
                <input
                    ref={inputRef}
                    id={id}
                    type="tel"
                    value={localNumber}
                    onChange={handleNumberChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder={dynamicPlaceholder}
                    maxLength={dynamicMaxLength}
                    required
                    className="flex-1 min-w-0 bg-transparent border-0 text-[#2563EB] font-semibold text-xs py-2 px-3 outline-none focus:outline-none focus:ring-0 placeholder:text-[#2563EB]/60 disabled:cursor-not-allowed rounded-r-[0.65rem]"
                />
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
