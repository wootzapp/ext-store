const personalIdentificationPatterns = {
ssn: {
    type: "Social Security Number (SSN)",
    pattern: XRegExp('\\b(?:(?:SSN|Social Security Number)[:#\\s]*)?(?!Slot[:#\\s]*)(?!000|666|9\\d{2})\\d{3}[-](?!00)\\d{2}[-](?!0000)\\d{4}\\b(?!\\s*(password|user|account))', 'i')
	
  },
  driversLicense: {
    type: "Driver's License Number",
    pattern: XRegExp('\\b(?:Driver(?:\'s License|DL)?\\s?(Number)?)?[:#\\s]*[A-Z]{1,2}\\d{6,8}\\b(?!\\s*(password|user|licensee|license))', 'i')
    
  },
  passportNumber: {
    type: "Passport Number",
    pattern: XRegExp('\\b(?:Passport(?:\\sNumber)?)?[:#\\s]*[A-Z]{1}\\d{7,8}\\b(?!\\s*(password|pass|user))', 'i')
    
  },
  email: {
    type: "Email Address",
    pattern: XRegExp('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b(?!\\s*(password|user))', 'i')
    
  },
  phoneNumber: {
    type: "Phone Number",
    pattern: XRegExp('\\b(?:\\+?\\d{1,3})?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b(?!\\s*(password|user|extension|pin))', 'i')
    
  },

taxID: {
    type: "Tax ID Number",
    pattern: XRegExp('\\b(?:(?:TIN|Tax ID|Taxpayer Identification Number)[:#\\s]*)?(?!Slot[:#\\s]*)(?!00)\\d{2}-\\d{7}\\b(?!\\s*(password|user|tax))', 'i')
},

  
credentials: {
  type: "Username and Password",
  pattern: XRegExp('\\b(?:username|user)[:\\s]+([A-Za-z0-9._%+-]+)\\s*(?:password|pass)[:\\s]+([A-Za-z0-9!@#$%^&*()_+-=]{6,})\\b', 'i')
  
}
};
