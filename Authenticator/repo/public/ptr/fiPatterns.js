const fiPatterns = {

    visaCardNumber: {
        type: "Visa Card Number",
        pattern: XRegExp('\\b4\\d{3}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b'),
        description: "Matches 16-digit Visa card numbers starting with '4'.",
        tags: ["PCI DSS", "Credit Card", "Visa"]
    },
    mastercardNumber: {
        type: "Mastercard Number",
        pattern: XRegExp('\\b(?:5[1-5]\\d{2}|2[2-7]\\d{2})[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b'),
        description: "Matches Mastercard numbers starting with '51-55' or '22-27'.",
        tags: ["PCI DSS", "Credit Card", "Mastercard"]
    },
    amexNumber: {
        type: "American Express (AMEX) Number",
        pattern: XRegExp('\\b3[47]\\d{2}[-\\s]?\\d{6}[-\\s]?\\d{5}\\b'),
        description: "Matches 15-digit American Express card numbers starting with '34' or '37'.",
        tags: ["PCI DSS", "Credit Card", "AMEX"]
    },
    discoverCardNumber: {
        type: "Discover Card Number",
        pattern: XRegExp('\\b6(?:011|5\\d{2}|4[4-9]\\d{2}|22[1-9]\\d{2}|2[2-9]\\d{2})[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b'),
        description: "Matches Discover card numbers with various valid prefixes.",
        tags: ["PCI DSS", "Credit Card", "Discover"]
    },
    jcbCardNumber: {
        type: "JCB Card Number",
        pattern: XRegExp('\\b35\\d{2}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b'),
        description: "Matches JCB card numbers starting with '35'.",
        tags: ["PCI DSS", "Credit Card", "JCB"]
    },
    dinersClubCardNumber: {
        type: "Diners Club Card Number",
        pattern: XRegExp('\\b3(?:0[0-5]\\d{2}|[68]\\d{2})[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}\\b'),
        description: "Matches Diners Club card numbers with valid prefixes.",
        tags: ["PCI DSS", "Credit Card", "Diners Club"]
    },
    unionPayCardNumber: {
        type: "UnionPay Card Number",
        pattern: XRegExp('\\b62\\d{2}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{0,3}\\b'),
        description: "Matches UnionPay card numbers starting with '62'.",
        tags: ["PCI DSS", "Credit Card", "UnionPay"]
    },
    maestroCardNumber: {
        type: "Maestro Card Number",
        pattern: XRegExp('\\b(?:5[06-9]\\d{2}|6\\d{3})[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{0,3}\\b'),
        description: "Matches Maestro card numbers with specific prefixes.",
        tags: ["PCI DSS", "Credit Card", "Maestro"]
    },
    cvvCode: {
        type: "Card Verification Value (CVV/CVC)",
        pattern: XRegExp('\\b(?:cvv|cvc|card security code|card verification value)\\s*[:\\s]?\\s*\\d{3,4}\\b', 'i'),
        description: "Matches 3-4 digit CVV/CVC codes labeled appropriately.",
        tags: ["PCI DSS", "Credit Card", "Security Code"]
    },
    expirationDate: {
        type: "Expiration Date (MM/YY or MM/YYYY)",
        pattern: XRegExp('\\b(?:exp|expiry|expires|valid thru|valid until|expiration)\\s*[:\\s]?\\s*(0[1-9]|1[0-2])\\/(2[0-9]{2}|2[0-9]{3})\\b', 'i'),
        description: "Matches expiration dates in MM/YY or MM/YYYY format.",
        tags: ["PCI DSS", "Credit Card", "Expiration Date"]
    },
    track1Data: {
        type: "Track 1 Data",
        pattern: XRegExp('\\b%?B\\d{1,19}\\^[A-Z\\s\'-]{2,26}\\^\\d{4}[0-9A-Za-z]{0,79}\\?\\b'),
        description: "Matches magnetic stripe Track 1 data format.",
        tags: ["PCI DSS", "Track Data"]
    },
    track2Data: {
        type: "Track 2 Data",
        pattern: XRegExp('\\b;\\d{1,19}=\\d{4}\\d{3}[0-9]{0,79}\\?\\b'),
        description: "Matches magnetic stripe Track 2 data format.",
        tags: ["PCI DSS", "Track Data"]
    },
    pinCode: {
        type: "Personal Identification Number (PIN)",
        pattern: XRegExp('\\b(?:pin)\\s*[:#]?\\s*\\d{4,6}\\b', 'i'),
        description: "Matches 4-6 digit PIN values labeled as 'PIN'.",
        tags: ["PCI DSS", "PIN"]

    },
    email: {
        type: "Email Addresses and Account Identifiers",
        pattern: XRegExp('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', 'i'),
        description: "Matches standard email addresses.",
        tags: ["Contact", "Email"]
    },
    itin: {
        type: "Individual Taxpayer Identification Number (ITIN)",
        pattern: XRegExp('(?:individual[\\s-]*taxpayer|ITIN|individual[\\s-]*taxpayer[\\s-]*number)\\s*[:#]?\\s*9\\d{2}[\\s-]?\\d{2}[\\s-]?\\d{4}\\b(?!\\s*\\w)', 'i'),
        description: "Matches valid ITINs starting with '9', ensuring standard formats.",
        tags: ["Tax", "Identification", "ITIN"]
    },
    alienRegistrationNumber: {
        type: "Alien Registration Number",
        pattern: XRegExp('(?:alien[\\s-]*registration|A[\\s-]*number|alien[\\s-]*number|USCIS[\\s-]*number)\\s*[:#]?\\s*A?\\d{7,9}\\b(?!\\s*\\w)', 'i'),
        description: "Matches alien registration numbers, often starting with 'A'.",
        tags: ["Identification", "Alien Registration", "Immigration"]
    },
    tin: {
        type: "Tax Identification Number (TIN)",
        pattern: XRegExp('(?:tax[\\s-]*identification|TIN|tax[\\s-]*ID|tax[\\s-]*number)\\s*[:#]?\\s*(\\d{3}[\\s-]?\\d{2}[\\s-]?\\d{4})\\b(?!\\s*\\w)', 'i'),
        description: "Matches tax ID numbers following standard TIN formats.",
        tags: ["Tax", "Identification", "TIN"]
    },
    ein: {
        type: "Employer Identification Number (EIN)",
        pattern: XRegExp('(?:employer[\\s-]*identification|EIN|employer[\\s-]*ID|employer[\\s-]*number)\\s*[:#]?\\s*(\\d{2}[\\s-]?\\d{7})\\b(?!\\s*\\w)', 'i'),
        description: "Matches 9-digit EIN numbers with common labels.",
        tags: ["Tax", "Employer", "EIN"]
    },
    ptin: {
        type: "Preparer Tax Identification Number (PTIN)",
        pattern: XRegExp('(?:preparer[\\s-]*tax|PTIN|preparer[\\s-]*tax[\\s-]*ID|preparer[\\s-]*number)\\s*[:#]?\\s*P?\\d{8}\\b(?!\\s*\\w)', 'i'),
        description: "Matches PTINs, typically prefixed with 'P'.",
        tags: ["Tax", "Preparation", "PTIN"]
    },
    caf: {
        type: "Centralized Authorization File (CAF) Number",
        pattern: XRegExp('(?:centralized[\\s-]*authorization|CAF|central[\\s-]*authorization[\\s-]*file)\\s*[:#]?\\s*\\d{9}\\b(?!\\s*\\w)', 'i'),
        description: "Matches CAF numbers in common formats.",
        tags: ["Tax", "Authorization", "CAF"]
    },
    bankAccountNumber: {
        type: "Bank Account Number",
        pattern: XRegExp('(?:account[\\s-]*number|bank[\\s-]*account|acct[\\s-]*number|bank[\\s-]*acct|bank[\\s-]*no)\\s*[:#]?\\s*\\d{8,17}\\b(?!\\s*\\w)', 'i'),
        description: "Matches bank account numbers labeled with common account terms.",
        tags: ["Financial", "Bank", "Account Number"]
    },
    routingNumber: {
        type: "Routing Number",
        pattern: XRegExp('(?:routing[\\s-]*number|bank[\\s-]*routing|routing[\\s-]*no)\\s*[:#]?\\s*\\d{9}\\b(?!\\s*\\w)', 'i'),
        description: "Matches 9-digit routing numbers labeled as routing or bank numbers.",
        tags: ["Financial", "Bank", "Routing"]
    },
    loanAccountNumber: {
        type: "Loan Account Number",
        pattern: XRegExp('(?:loan[\\s-]*account|loan[\\s-]*number|loan[\\s-]*ID)\\s*[:#]?\\s*\\d{8,17}\\b(?!\\s*\\w)', 'i'),
        description: "Matches loan account numbers, typically 8-17 digits.",
        tags: ["Financial", "Loan", "Account Number"]
    },
    investmentAccountNumber: {
        type: "Investment Account Number",
        pattern: XRegExp('(?:investment[\\s-]*account|investment[\\s-]*number|investment[\\s-]*acct|investment[\\s-]*ID)\\s*[:#]?\\s*\\d{8,17}\\b(?!\\s*\\w)', 'i'),
        description: "Matches investment account numbers, usually labeled as 'investment'.",
        tags: ["Financial", "Investment", "Account Number"]
    },
    cpaLicenseNumber: {
        type: "CPA License Number",
        pattern: XRegExp('(?:CPA[\\s-]*license|CPA[\\s-]*number|CPA[\\s-]*ID|certified[\\s-]*public[\\s-]*accountant[\\s-]*number)\\s*[:#]?\\s*[A-Za-z0-9]{5,10}\\b(?!\\s*\\w)', 'i'),
        description: "Matches CPA license numbers, typically alphanumeric.",
        tags: ["Professional", "License", "CPA"]
    },
    eaNumber: {
        type: "Enrolled Agent (EA) Number",
        pattern: XRegExp('(?:enrolled[\\s-]*agent|EA[\\s-]*number|EA[\\s-]*ID)\\s*[:#]?\\s*[A-Za-z0-9]{5,10}\\b(?!\\s*\\w)', 'i'),
        description: "Matches EA numbers, typically alphanumeric.",
        tags: ["Professional", "License", "EA"]
    },
    taxPreparerCertificationNumber: {
        type: "Tax Preparer Certification Number",
        pattern: XRegExp('(?:tax[\\s-]*preparer|certification[\\s-]*number|preparer[\\s-]*certification[\\s-]*ID)\\s*[:#]?\\s*\\w{5,10}\\b(?!\\s*\\w)', 'i'),
        description: "Matches tax preparer certification numbers with common labels.",
        tags: ["Professional", "Certification", "Tax Preparation"]
    },
    businessLicenseNumber: {
        type: "Business License Number",
        pattern: XRegExp('(?:business[\\s-]*license|license[\\s-]*number|business[\\s-]*ID)\\s*[:#]?\\s*\\w{5,15}\\b(?!\\s*\\w)', 'i'),
        description: "Matches business license numbers, usually alphanumeric.",
        tags: ["Business", "License", "ID"]
    },
    registeredAgentInfo: {
        type: "Registered Agent Information",
        pattern: XRegExp('(?:registered[\\s-]*agent|agent[\\s-]*name|agent[\\s-]*info)\\s*[:#]?\\s*([A-Za-z\\s,]+)\\b(?!\\s*\\w)', 'i'),
        description: "Matches registered agent information typically consisting of names or titles.",
        tags: ["Business", "Agent", "Information"]
    },
    dunsNumber: {
        type: "D-U-N-S Number",
        pattern: XRegExp('(?:D[\\s-]*U[\\s-]*N[\\s-]*S|DUNS[\\s-]*number)\\s*[:#]?\\s*\\d{9}\\b(?!\\s*\\w)', 'i'),
        description: "Matches 9-digit D-U-N-S numbers labeled as DUNS or D-U-N-S.",
        tags: ["Business", "D-U-N-S", "ID"]
    }
};



