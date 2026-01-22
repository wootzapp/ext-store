// Multi-language dictionaries for sensitive field detection
// Supporting internationalization and regional variations

window.FIELD_DICTIONARIES = {
  // English
  en: {
    email: ['email', 'e-mail', 'electronic mail', 'mail address', 'email address'],
    password: ['password', 'passcode', 'pass', 'pwd', 'secret', 'pin', 'auth code'],
    phone: ['phone', 'telephone', 'mobile', 'cell', 'contact number', 'phone number'],
    address: ['address', 'street', 'residence', 'location', 'home address'],
    name: ['name', 'full name', 'first name', 'last name', 'given name', 'family name'],
    dateOfBirth: ['date of birth', 'birth date', 'birthday', 'dob'],
    creditCard: ['credit card', 'card number', 'payment method', 'cc'],
    ssn: ['social security', 'ssn', 'tax id', 'national id']
  },

  // Spanish
  es: {
    email: ['correo', 'email', 'correo electrónico', 'dirección de correo'],
    password: ['contraseña', 'clave', 'password', 'código', 'pin'],
    phone: ['teléfono', 'móvil', 'celular', 'número de teléfono'],
    address: ['dirección', 'domicilio', 'residencia', 'ubicación'],
    name: ['nombre', 'nombre completo', 'primer nombre', 'apellido'],
    dateOfBirth: ['fecha de nacimiento', 'cumpleaños', 'nacimiento'],
    creditCard: ['tarjeta de crédito', 'número de tarjeta', 'método de pago'],
    ssn: ['seguridad social', 'identificación nacional', 'cédula']
  },

  // French
  fr: {
    email: ['email', 'courriel', 'adresse email', 'courrier électronique'],
    password: ['mot de passe', 'code', 'password', 'secret', 'pin'],
    phone: ['téléphone', 'mobile', 'numéro de téléphone', 'portable'],
    address: ['adresse', 'domicile', 'résidence', 'localisation'],
    name: ['nom', 'nom complet', 'prénom', 'nom de famille'],
    dateOfBirth: ['date de naissance', 'anniversaire', 'naissance'],
    creditCard: ['carte de crédit', 'numéro de carte', 'méthode de paiement'],
    ssn: ['sécurité sociale', 'identification nationale', 'numéro national']
  },

  // German
  de: {
    email: ['email', 'e-mail', 'elektronische post', 'mail-adresse'],
    password: ['passwort', 'kennwort', 'code', 'pin', 'geheim'],
    phone: ['telefon', 'handy', 'mobiltelefon', 'telefonnummer'],
    address: ['adresse', 'anschrift', 'wohnort', 'standort'],
    name: ['name', 'vollständiger name', 'vorname', 'nachname'],
    dateOfBirth: ['geburtsdatum', 'geburtstag', 'datum der geburt'],
    creditCard: ['kreditkarte', 'kartennummer', 'zahlungsmethode'],
    ssn: ['sozialversicherung', 'nationale identifikation', 'personalausweis']
  },

  // Italian
  it: {
    email: ['email', 'posta elettronica', 'indirizzo email', 'mail'],
    password: ['password', 'parola chiave', 'codice', 'pin', 'segreto'],
    phone: ['telefono', 'cellulare', 'mobile', 'numero di telefono'],
    address: ['indirizzo', 'domicilio', 'residenza', 'posizione'],
    name: ['nome', 'nome completo', 'primo nome', 'cognome'],
    dateOfBirth: ['data di nascita', 'compleanno', 'nascita'],
    creditCard: ['carta di credito', 'numero carta', 'metodo di pagamento'],
    ssn: ['codice fiscale', 'identificazione nazionale', 'carta identità']
  },

  // Portuguese
  pt: {
    email: ['email', 'correio eletrônico', 'endereço de email', 'mail'],
    password: ['senha', 'palavra-passe', 'código', 'pin', 'segredo'],
    phone: ['telefone', 'celular', 'móvel', 'número de telefone'],
    address: ['endereço', 'morada', 'residência', 'localização'],
    name: ['nome', 'nome completo', 'primeiro nome', 'sobrenome'],
    dateOfBirth: ['data de nascimento', 'aniversário', 'nascimento'],
    creditCard: ['cartão de crédito', 'número do cartão', 'método de pagamento'],
    ssn: ['cpf', 'identificação nacional', 'documento']
  },

  // Russian
  ru: {
    email: ['email', 'электронная почта', 'адрес электронной почты', 'почта'],
    password: ['пароль', 'код', 'пин', 'секрет', 'ключ'],
    phone: ['телефон', 'мобильный', 'номер телефона', 'сотовый'],
    address: ['адрес', 'местоположение', 'проживание', 'место'],
    name: ['имя', 'полное имя', 'фамилия', 'отчество'],
    dateOfBirth: ['дата рождения', 'день рождения', 'рождение'],
    creditCard: ['кредитная карта', 'номер карты', 'способ оплаты'],
    ssn: ['снилс', 'паспорт', 'национальный идентификатор']
  },

  // Chinese Simplified
  zh: {
    email: ['邮箱', '电子邮件', '邮件地址', '电邮'],
    password: ['密码', '口令', '暗码', '秘钥'],
    phone: ['电话', '手机', '联系电话', '电话号码'],
    address: ['地址', '住址', '居住地', '位置'],
    name: ['姓名', '全名', '名字', '姓氏'],
    dateOfBirth: ['出生日期', '生日', '出生年月'],
    creditCard: ['信用卡', '卡号', '支付方式'],
    ssn: ['身份证', '社会保障号', '国民身份证']
  },

  // Japanese
  ja: {
    email: ['メール', 'Eメール', '電子メール', 'メールアドレス'],
    password: ['パスワード', '暗証番号', 'PIN', '秘密鍵'],
    phone: ['電話', '携帯', '電話番号', 'TEL'],
    address: ['住所', '所在地', '居住地', 'アドレス'],
    name: ['名前', '氏名', '姓名', 'フルネーム'],
    dateOfBirth: ['生年月日', '誕生日', '生まれた日'],
    creditCard: ['クレジットカード', 'カード番号', '支払い方法'],
    ssn: ['マイナンバー', '社会保障番号', '身分証明書']
  },

  // Arabic
  ar: {
    email: ['البريد الإلكتروني', 'إيميل', 'عنوان البريد', 'الإيميل'],
    password: ['كلمة المرور', 'الرقم السري', 'كود', 'سر'],
    phone: ['الهاتف', 'الجوال', 'رقم الهاتف', 'موبايل'],
    address: ['العنوان', 'السكن', 'الموقع', 'المنزل'],
    name: ['الاسم', 'الاسم الكامل', 'الاسم الأول', 'اللقب'],
    dateOfBirth: ['تاريخ الميلاد', 'عيد الميلاد', 'الولادة'],
    creditCard: ['بطاقة ائتمان', 'رقم البطاقة', 'طريقة الدفع'],
    ssn: ['الهوية الوطنية', 'رقم الهوية', 'البطاقة الشخصية']
  },

  // Hindi
  hi: {
    email: ['ईमेल', 'इलेक्ट्रॉनिक मेल', 'मेल पता', 'डाक'],
    password: ['पासवर्ड', 'गुप्त कोड', 'पिन', 'रहस्य'],
    phone: ['फोन', 'मोबाइल', 'टेलीफोन', 'संपर्क नंबर'],
    address: ['पता', 'घर का पता', 'निवास', 'स्थान'],
    name: ['नाम', 'पूरा नाम', 'पहला नाम', 'अंतिम नाम'],
    dateOfBirth: ['जन्म तिथि', 'जन्मदिन', 'जन्म'],
    creditCard: ['क्रेडिट कार्ड', 'कार्ड नंबर', 'भुगतान विधि'],
    ssn: ['आधार', 'राष्ट्रीय पहचान', 'पहचान संख्या']
  }
};

// Regional specific patterns
window.REGIONAL_PATTERNS = {
  // US specific
  US: {
    ssn: /^\d{3}-?\d{2}-?\d{4}$/,
    zipCode: /^\d{5}(-\d{4})?$/,
    phone: /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
    state: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']
  },

  // UK specific
  UK: {
    postCode: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
    phone: /^(\+44[-.\s]?)?(\d{4}[-.\s]?\d{6}|\d{5}[-.\s]?\d{5})$/,
    niNumber: /^[A-Z]{2}\d{6}[A-Z]$/i
  },

  // Canada specific
  CA: {
    postalCode: /^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/i,
    phone: /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
    sin: /^\d{3}[-.\s]?\d{3}[-.\s]?\d{3}$/
  },

  // Germany specific
  DE: {
    postCode: /^\d{5}$/,
    phone: /^(\+49[-.\s]?)?(\d{3,4}[-.\s]?\d{7,8})$/,
    taxId: /^\d{11}$/
  },

  // France specific
  FR: {
    postCode: /^\d{5}$/,
    phone: /^(\+33[-.\s]?)?(\d{2}[-.\s]?\d{2}[-.\s]?\d{2}[-.\s]?\d{2}[-.\s]?\d{2})$/,
    insee: /^[12]\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}\d{2}$/
  },

  // Japan specific
  JP: {
    postCode: /^\d{3}-?\d{4}$/,
    phone: /^(\+81[-.\s]?)?(\d{2,4}[-.\s]?\d{4}[-.\s]?\d{4})$/,
    myNumber: /^\d{4}[-.\s]?\d{4}[-.\s]?\d{4}$/
  },

  // India specific
  IN: {
    pinCode: /^\d{6}$/,
    phone: /^(\+91[-.\s]?)?[6-9]\d{9}$/,
    aadhaar: /^\d{4}[-.\s]?\d{4}[-.\s]?\d{4}$/,
    pan: /^[A-Z]{5}\d{4}[A-Z]$/i
  }
};

// Industry-specific sensitive field types
window.INDUSTRY_PATTERNS = {
  healthcare: {
    fields: ['medical record number', 'patient id', 'insurance id', 'diagnosis', 'medication'],
    sensitivity: 0.99
  },
  
  financial: {
    fields: ['account number', 'routing number', 'investment account', 'loan number', 'mortgage'],
    sensitivity: 0.95
  },
  
  education: {
    fields: ['student id', 'grade', 'transcript', 'education record', 'school'],
    sensitivity: 0.85
  },
  
  government: {
    fields: ['case number', 'permit number', 'license plate', 'voter id', 'tax return'],
    sensitivity: 0.90
  }
};
