import React, { useState } from 'react';
import { Plus, Trash2, User, Mail, Phone, MapPin, Building2, Landmark, Info, X, Briefcase, Globe, CreditCard, Hash, BadgeCheck, DollarSign, Wallet } from 'lucide-react';
import styles from '../../pages/MasterModules.module.css';
import { showToast } from '../common/Toast';

const GST_TREATMENTS = [
    { value: 'registered_business_regular', label: 'Registered Business - Regular' },
    { value: 'registered_business_composition', label: 'Registered Business - Composition' },
    { value: 'unregistered_business', label: 'Unregistered Business' },
    { value: 'consumer', label: 'Consumer' },
    { value: 'overseas', label: 'Overseas' }
];

// GST number field is only relevant when supplier is a registered business
const GST_NUMBER_REQUIRED_TREATMENTS = [
    'registered_business_regular',
    'registered_business_composition',
];

const INDIAN_STATES = [
    'Jammu and Kashmir [01]', 'Himachal Pradesh [02]', 'Punjab [03]', 'Chandigarh [04]',
    'Uttarakhand [05]', 'Haryana [06]', 'Delhi [07]', 'Rajasthan [08]', 'Uttar Pradesh [09]',
    'Bihar [10]', 'Sikkim [11]', 'Arunachal Pradesh [12]', 'Nagaland [13]', 'Manipur [14]',
    'Mizoram [15]', 'Tripura [16]', 'Meghalaya [17]', 'Assam [18]', 'West Bengal [19]',
    'Jharkhand [20]', 'Odisha [21]', 'Chhattisgarh [22]', 'Madhya Pradesh [23]',
    'Gujarat [24]', 'Dadra and Nagar Haveli and Daman and Diu [26]', 'Maharashtra [27]',
    'Karnataka [29]', 'Goa [30]', 'Lakshadweep [31]', 'Kerala [32]', 'Tamil Nadu [33]',
    'Puducherry [34]', 'Andaman and Nicobar Islands [35]', 'Telangana [36]',
    'Andhra Pradesh [37]', 'Ladakh [38]', 'Other Territory [97]'
];

const TDS_CATEGORIES = [
    "194C - Contractors (Ind/HUF) [1%]",
    "194C - Contractors (Others) [2%]",
    "194J - Professional Services [10%]",
    "194J - Technical Services [2%]",
    "194H - Commission/Brokerage [5%]",
    "194H - Commission/Brokerage (Reduced) [3.75%]",
    "194-I - Rent on Plant & Machinery [2%]",
    "194-I - Rent on Land & Building [10%]",
    "194Q - Purchase of Goods [0.1%]",
    "194A - Dividend [10%]",
    "194A - Dividend (Reduced) [7.5%]",
    "194A - Interest (Non-Securities) [10%]",
    "194A - Interest (Non-Securities) (Reduced) [7.5%]"
];

const SALUTATIONS = ['Mr.', 'Ms.', 'Mrs.', 'Dr.'];

const DataPoint = ({ icon: Icon, label, value, isFullWidth = false }) => (
    <div className={`${styles.viewDataPoint} ${isFullWidth ? styles.viewFullWidth : ''}`}>
        <div className={styles.dataIcon}><Icon size={16} /></div>
        <div className={styles.dataContent}>
            <span className={styles.dataLabel}>{label}</span>
            <span className={isFullWidth ? '' : styles.dataValue}>
                {value || <span className={styles.emptyValue}>Not Provided</span>}
            </span>
        </div>
    </div>
);

const SupplierView = ({ data, onCancel }) => {
    const mainAddress = data.billing_address || {};
    const shipAddress = data.shipping_address || {};

    return (
        <div className={styles.viewDashboard}>
            {/* Premium Header */}
            <div className={styles.viewHeader}>
                <div className={styles.viewHeaderContent}>
                    <div className={styles.viewHeaderIcon}>
                        <Building2 size={32} />
                    </div>
                    <div className={styles.viewHeaderInfo}>
                        <h2>{data.display_name}</h2>
                        <p>{data.company_name || 'N/A'}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className={styles.viewBadge}>{data.gst_treatment?.replace(/_/g, ' ')}</div>
                    <div className={`${styles.viewBadge} ${data.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                        {data.status || 'Active'}
                    </div>
                </div>
            </div>

            <div className={styles.viewGrid}>
                {/* Contact Information Card */}
                <div className={styles.viewCardPremium}>
                    <div className={styles.viewCardHeader}>
                        <User size={18} /> Contact Information
                    </div>
                    <div className={styles.viewCardBody}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <DataPoint icon={User} label="Primary Contact" value={`${data.salutation || ''} ${data.first_name || ''} ${data.last_name || ''}`.trim()} />
                            <DataPoint icon={Mail} label="Email Address" value={data.email} />
                            <DataPoint icon={Phone} label="Mobile Number" value={data.mobile} />
                            <DataPoint icon={Briefcase} label="Work Phone" value={data.work_phone} />
                        </div>
                    </div>
                </div>

                {/* Tax & Financial Card */}
                <div className={styles.viewCardPremium}>
                    <div className={styles.viewCardHeader}>
                        <BadgeCheck size={18} /> Tax & Financial Details
                    </div>
                    <div className={styles.viewCardBody}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <DataPoint icon={Hash} label="GST Number" value={data.gst_number} />
                            <DataPoint icon={CreditCard} label="PAN Card" value={data.pan} />
                            <DataPoint icon={Wallet} label="Opening Balance" value={data.opening_balance ? `${data.currency || 'INR'} ${data.opening_balance}` : null} />
                            <DataPoint icon={DollarSign} label="Payment Terms" value={data.payment_terms} />
                            <DataPoint icon={Hash} label="MSME Number" value={data.msme_number} />
                            <DataPoint icon={BadgeCheck} label="DL No." value={data.dl_number} />
                            <DataPoint icon={Hash} label="CIN No." value={data.cin_no} />
                            <DataPoint icon={Info} label="TDS Tax ID" value={data.tds_tax_id} isFullWidth />
                        </div>
                    </div>
                </div>

                {/* Billing Address Card */}
                <div className={styles.viewCardPremium}>
                    <div className={styles.viewCardHeader}>
                        <MapPin size={18} /> Billing Address
                    </div>
                    <div className={styles.viewCardBody}>
                        <div className={styles.viewAddressGrid}>
                            <DataPoint icon={MapPin} label="Address" value={`${mainAddress.address_line1 || ''}\n${mainAddress.address_line2 || ''}`.trim()} isFullWidth />
                            <DataPoint icon={Globe} label="District" value={mainAddress.city} />
                            <DataPoint icon={Globe} label="State" value={mainAddress.state} />
                            <DataPoint icon={Globe} label="Postal Code" value={mainAddress.postal_code} />
                            <DataPoint icon={Globe} label="Country" value={mainAddress.country} />
                        </div>
                    </div>
                </div>

                {/* Shipping Address Card */}
                <div className={styles.viewCardPremium}>
                    <div className={styles.viewCardHeader}>
                        <Globe size={18} /> Shipping Address
                    </div>
                    <div className={styles.viewCardBody}>
                        <div className={styles.viewAddressGrid}>
                            <DataPoint icon={MapPin} label="Address" value={`${shipAddress.address_line1 || ''}\n${shipAddress.address_line2 || ''}`.trim()} isFullWidth />
                            <DataPoint icon={Globe} label="City" value={shipAddress.city} />
                            <DataPoint icon={Globe} label="State" value={shipAddress.state} />
                            <DataPoint icon={Globe} label="Postal Code" value={shipAddress.postal_code} />
                            <DataPoint icon={Globe} label="Country" value={shipAddress.country} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Contacts */}
            {data.contacts?.length > 0 && (
                <div className={styles.viewCardPremium}>
                    <div className={styles.viewCardHeader}>
                        <User size={18} /> Other Key Contacts
                    </div>
                    <div className={styles.viewCardBody}>
                        <div className={styles.viewNestedList}>
                            {data.contacts.map((contact, idx) => (
                                <div key={idx} className={styles.viewNestedItem}>
                                    <DataPoint icon={User} label="Name" value={`${contact.salutation || ''} ${contact.first_name || ''} ${contact.last_name || ''}`.trim()} />
                                    <DataPoint icon={Mail} label="Email" value={contact.email} />
                                    <DataPoint icon={Phone} label="Mobile" value={contact.mobile} />
                                    <DataPoint icon={Briefcase} label="Designation" value={contact.designation || contact.department} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Accounts */}
            {data.bank_accounts?.length > 0 && (
                <div className={styles.viewCardPremium}>
                    <div className={styles.viewCardHeader}>
                        <Landmark size={18} /> Bank Accounts
                    </div>
                    <div className={styles.viewCardBody}>
                        <div className={styles.viewNestedList}>
                            {data.bank_accounts.map((bank, idx) => (
                                <div key={idx} className={styles.viewNestedItem}>
                                    <DataPoint icon={User} label="Holder Name" value={bank.account_name} />
                                    <DataPoint icon={Hash} label="Account Number" value={bank.account_number} />
                                    <DataPoint icon={Landmark} label="Bank & Branch" value={`${bank.bank_name || ''} - ${bank.branch || ''}`.trim()} />
                                    <DataPoint icon={Info} label="IFSC Code" value={bank.ifsc_code} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Remarks Section */}
            {data.remarks && (
                <div className={styles.viewRemarksCard}>
                    <div className={styles.viewRemarksIcon}><Info size={24} /></div>
                    <div className={styles.viewRemarksContent}>
                        <h4>Remarks & Notes</h4>
                        <p>{data.remarks}</p>
                    </div>
                </div>
            )}

            <div className={styles.formFooter} style={{ marginTop: '0.5rem' }}>
                <button type="button" onClick={onCancel} className="btn-secondary" style={{ border: '1px solid var(--neutral-200)', background: 'white', borderRadius: '6px', padding: '0.5rem 1.5rem', fontWeight: 600 }}>
                    Close
                </button>
            </div>
        </div>
    );
};

const SupplierForm = ({ mode, initialData, onSubmit, onCancel, loading }) => {
    const isViewMode = mode === 'VIEW';
    const formatInitialData = (data) => {
        if (!data) return null;
        return {
            ...data,
            salutation: data.salutation || '',
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            work_phone: data.work_phone || '',
            source_of_supply: data.source_of_supply || '',
            msme_number: data.msme_number || '',
            dl_number: data.dl_number || '',
            cin_no: data.cin_no || '',
            payment_terms: data.payment_terms || '',
            tds_tax_id: data.tds_tax_id || '',
            currency: data.currency || 'INR',
            billing_address: data.billing_address ? {
                ...data.billing_address,
                state: INDIAN_STATES.find(s => s.startsWith(data.billing_address.state)) || data.billing_address.state || ''
            } : { address_line1: '', address_line2: '', city: '', state: '', country: 'India', postal_code: '' },
            shipping_address: data.shipping_address ? {
                ...data.shipping_address,
                state: INDIAN_STATES.find(s => s.startsWith(data.shipping_address.state)) || data.shipping_address.state || ''
            } : { address_line1: '', address_line2: '', city: '', state: '', country: 'India', postal_code: '' },
            contacts: data.contacts?.length ? data.contacts.map(c => ({
                id: c.id,
                salutation: c.salutation || '',
                first_name: c.first_name || '',
                last_name: c.last_name || '',
                email: c.email || '',
                phone: c.phone || '',
                mobile: c.mobile || '',
                department: c.department || '',
                designation: c.designation || ''
            })) : (isViewMode ? [] : [{ salutation: '', first_name: '', last_name: '', email: '', phone: '', mobile: '', department: '', designation: '' }]),
            bank_accounts: data.bank_accounts?.length ? data.bank_accounts.map(b => ({
                id: b.id,
                account_name: b.account_name || '',
                account_number: b.account_number || '',
                bank_name: b.bank_name || '',
                ifsc_code: b.ifsc_code || '',
                branch: b.branch || ''
            })) : (isViewMode ? [] : [{ account_name: '', account_number: '', bank_name: '', ifsc_code: '', branch: '' }])
        };
    };

    const [formData, setFormData] = useState(formatInitialData(initialData) || {
        salutation: '',
        first_name: '',
        last_name: '',
        display_name: '',
        company_name: '',
        email: '',
        work_phone: '',
        mobile: '',
        gst_treatment: 'consumer',
        gst_number: '',
        pan: '',
        source_of_supply: '',
        msme_number: '',
        dl_number: '',
        cin_no: '',
        payment_terms: '',
        tds_tax_id: '',
        opening_balance: 0,
        currency: 'INR',
        remarks: '',
        billing_address: { address_line1: '', address_line2: '', city: '', state: '', country: 'India', postal_code: '' },
        shipping_address: { address_line1: '', address_line2: '', city: '', state: '', country: 'India', postal_code: '' },
        contacts: [{ salutation: '', first_name: '', last_name: '', email: '', phone: '', mobile: '', department: '', designation: '' }],
        bank_accounts: [{ account_name: '', account_number: '', bank_name: '', ifsc_code: '', branch: '' }]
    });

    // Derived: should the GST number field be shown?
    const showGstNumber = GST_NUMBER_REQUIRED_TREATMENTS.includes(formData.gst_treatment);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Clear gst_number when switching to a treatment that doesn't need it
            if (name === 'gst_treatment' && !GST_NUMBER_REQUIRED_TREATMENTS.includes(value)) {
                updated.gst_number = '';
            }
            return updated;
        });
    };

    const handleAddressChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            [type]: { ...prev[type], [field]: value }
        }));
    };

    const handleNestedChange = (type, index, field, value) => {
        setFormData(prev => {
            const updatedArray = [...prev[type]];
            updatedArray[index] = { ...updatedArray[index], [field]: value };
            return { ...prev, [type]: updatedArray };
        });
    };

    const addItem = (type, emptyItem) => {
        setFormData(prev => ({ ...prev, [type]: [...prev[type], emptyItem] }));
    };

    const removeItem = (type, index) => {
        setFormData(prev => {
            const updatedArray = prev[type].filter((_, i) => i !== index);
            return { ...prev, [type]: updatedArray.length ? updatedArray : [prev[type][0]] };
        });
    };

    const copyBillingToShipping = () => {
        setFormData(prev => ({ ...prev, shipping_address: { ...prev.billing_address } }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('SupplierForm: handleSubmit called', formData);

        // --- STEP 1: Minimal Required Validations ---
        if (!formData.display_name?.trim()) {
            showToast('Display Name is required');
            return;
        }
        if (!formData.gst_treatment) {
            showToast('GST Treatment is required');
            return;
        }
        if (!formData.source_of_supply) {
            showToast('Source of Supply is required');
            return;
        }

        // --- STEP 2: Optional Conditional Validations ---
        if (formData.pan && formData.pan.length !== 10) {
            showToast('PAN must be exactly 10 characters');
            return;
        }

        if (showGstNumber && formData.gst_number && formData.gst_number.length !== 15) {
            showToast('GST Number must be exactly 15 characters');
            return;
        }

        if (formData.opening_balance && parseFloat(formData.opening_balance) < 0) {
            showToast('Opening balance must be a positive number');
            return;
        }

        // --- STEP 3: Payload Preparation ---
        const submissionData = { ...formData };

        // Contacts: Only send contacts if they contain first_name or email
        const activeContacts = submissionData.contacts.filter(c =>
            c.first_name?.trim() || c.email?.trim()
        );
        submissionData.contacts = activeContacts;

        // Bank accounts: Only validate if account number entered. Require bank_name and ifsc_code.
        const activeAccounts = [];
        for (const b of submissionData.bank_accounts) {
            if (b.account_number?.trim()) {
                if (!b.bank_name?.trim() || !b.ifsc_code?.trim()) {
                    showToast('Bank Name and IFSC Code are required if Account Number is provided');
                    return;
                }
                activeAccounts.push(b);
            }
        }
        submissionData.bank_accounts = activeAccounts;

        // Addresses: Only include if address_line1 exists. Strip state codes for backend.
        if (submissionData.billing_address?.address_line1?.trim()) {
            if (submissionData.billing_address.state) {
                submissionData.billing_address.state = submissionData.billing_address.state.split(' [')[0];
            }
        } else {
            delete submissionData.billing_address;
        }

        if (submissionData.shipping_address?.address_line1?.trim()) {
            if (submissionData.shipping_address.state) {
                submissionData.shipping_address.state = submissionData.shipping_address.state.split(' [')[0];
            }
        } else {
            delete submissionData.shipping_address;
        }

        // Numeric conversion
        submissionData.opening_balance = parseFloat(submissionData.opening_balance) || 0;

        // Clean empty strings to null for text fields
        ['email', 'mobile', 'work_phone', 'gst_number', 'pan', 'remarks', 'company_name',
            'salutation', 'first_name', 'last_name', 'source_of_supply', 'payment_terms',
            'msme_number', 'dl_number', 'cin_no', 'tds_tax_id'].forEach(field => {
                if (submissionData[field] === '') submissionData[field] = null;
            });


        // ── Accounting flags — always hardcoded for supplier API ──
        submissionData.is_vendor = true;
        submissionData.is_customer = false;
        submissionData.balance_type = 'debit';

        onSubmit(submissionData);
    };

    if (isViewMode) {
        return <SupplierView data={formData} onCancel={onCancel} />;
    }

    return (
        <form onSubmit={handleSubmit} className={isViewMode ? styles.viewMode : ''}>
            {/* Basic Information & Tax */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}><Building2 size={16} /> Basic & Tax Information</h3>
                </div>
                <div className={styles.grid4} style={{ marginBottom: isViewMode ? '0.5rem' : '1rem' }}>
                    <div className={styles.formGroup}>
                        <label>Salutation</label>
                        <select disabled={isViewMode} name="salutation" value={formData.salutation} onChange={handleChange}>
                            <option value="">None</option>
                            {SALUTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>First Name</label>
                        <input readOnly={isViewMode} name="first_name" value={formData.first_name} onChange={handleChange} placeholder="e.g. Shashwat" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Last Name</label>
                        <input readOnly={isViewMode} name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Kumar" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Display Name *</label>
                        <div className={styles.inputWrapper}>
                            <User size={14} className={styles.inputIcon} />
                            <input readOnly={isViewMode} name="display_name" className={styles.hasIcon} value={formData.display_name} onChange={handleChange} required placeholder="Shashwat Healthcare (SK)" />
                        </div>
                    </div>
                </div>

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Company Name</label>
                        <div className={styles.inputWrapper}>
                            <Briefcase size={14} className={styles.inputIcon} />
                            <input readOnly={isViewMode} name="company_name" className={styles.hasIcon} value={formData.company_name} onChange={handleChange} placeholder="Legal Name" />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={14} className={styles.inputIcon} />
                            <input readOnly={isViewMode} type="email" name="email" className={styles.hasIcon} value={formData.email} onChange={handleChange} placeholder="vendor@example.com" />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Mobile Number</label>
                        <div className={styles.inputWrapper}>
                            <Phone size={14} className={styles.inputIcon} />
                            <input readOnly={isViewMode} name="mobile" className={styles.hasIcon} value={formData.mobile} onChange={handleChange} placeholder="9876543210" />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Work Phone</label>
                        <div className={styles.inputWrapper}>
                            <Phone size={14} className={styles.inputIcon} />
                            <input readOnly={isViewMode} name="work_phone" className={styles.hasIcon} value={formData.work_phone} onChange={handleChange} placeholder="022-1234567" />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>GST Treatment *</label>
                        <select disabled={isViewMode} name="gst_treatment" value={formData.gst_treatment} onChange={handleChange} required>
                            <option value="">Select Treatment</option>
                            {GST_TREATMENTS.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* GST Number — only shown for registered business (regular or composition) */}
                    {showGstNumber && (
                        <div className={styles.formGroup}>
                            <label>GST Number</label>
                            <input
                                readOnly={isViewMode}
                                name="gst_number"
                                value={formData.gst_number}
                                onChange={handleChange}
                                placeholder="15-digit GSTIN"
                                maxLength={15}
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label>PAN Card</label>
                        <input readOnly={isViewMode} name="pan" value={formData.pan} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Opening Balance</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon} style={{ fontSize: '13px', fontWeight: 'bold' }}>₹</span>
                            <input readOnly={isViewMode} type="number" name="opening_balance" className={styles.hasIcon} value={formData.opening_balance} onChange={handleChange} />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Payment Terms</label>
                        <select disabled={isViewMode} name="payment_terms" value={formData.payment_terms} onChange={handleChange}>
                            <option value="">Select Terms</option>
                            <option value="Due on Receipt">Due on Receipt</option>
                            <option value="Net 15">Net 15</option>
                            <option value="Net 30">Net 30</option>
                            <option value="Net 45">Net 45</option>
                            <option value="Net 60">Net 60</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Source of Supply *</label>
                        <select disabled={isViewMode} name="source_of_supply" value={formData.source_of_supply} onChange={handleChange} required>
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>MSME Number</label>
                        <input readOnly={isViewMode} name="msme_number" value={formData.msme_number} onChange={handleChange} placeholder="UDYAM-MH-01-1234567" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>DL No.</label>
                        <input readOnly={isViewMode} name="dl_number" value={formData.dl_number} onChange={handleChange} placeholder="DL-123456789" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>CIN No.</label>
                        <input readOnly={isViewMode} name="cin_no" value={formData.cin_no} onChange={handleChange} placeholder="U12345MH2020PTC123456" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>TDS Tax ID</label>
                        <select disabled={isViewMode} name="tds_tax_id" value={formData.tds_tax_id} onChange={handleChange}>
                            <option value="">Select TDS Category</option>
                            {TDS_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Address Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className={styles.formSection} style={{ marginBottom: 0 }}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}><MapPin size={16} /> Billing Address</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isViewMode ? '0.25rem' : '0.75rem' }}>
                        <div className={styles.formGroup}>
                            <label>Address Line 1</label>
                            <input readOnly={isViewMode} value={formData.billing_address.address_line1} onChange={(e) => handleAddressChange('billing_address', 'address_line1', e.target.value)} placeholder="Building/Street" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Address Line 2</label>
                            <input readOnly={isViewMode} value={formData.billing_address.address_line2} onChange={(e) => handleAddressChange('billing_address', 'address_line2', e.target.value)} placeholder="Area/Landmark" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className={styles.formGroup}>
                                <label>Country</label>
                                <input value={formData.billing_address.country} readOnly style={{ background: '#f5f5f5', cursor: 'not-allowed' }} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <select disabled={isViewMode} value={formData.billing_address.state} onChange={(e) => handleAddressChange('billing_address', 'state', e.target.value)}>
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className={styles.formGroup}>
                                <label>District</label>
                                <input readOnly={isViewMode} value={formData.billing_address.city} onChange={(e) => handleAddressChange('billing_address', 'city', e.target.value)} placeholder="Enter District" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Postal Code</label>
                                <input readOnly={isViewMode} value={formData.billing_address.postal_code} onChange={(e) => handleAddressChange('billing_address', 'postal_code', e.target.value)} placeholder="400001" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.formSection} style={{ marginBottom: 0 }}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}><Globe size={16} /> Shipping Address</h3>
                        {!isViewMode && (
                            <button type="button" onClick={copyBillingToShipping} className={styles.addBtnPremium} style={{ fontSize: '11px', padding: '0.2rem 0.5rem' }}>
                                Copy from Billing
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: isViewMode ? '0.25rem' : '0.75rem' }}>
                        <div className={styles.formGroup}>
                            <label>Address Line 1</label>
                            <input readOnly={isViewMode} value={formData.shipping_address.address_line1} onChange={(e) => handleAddressChange('shipping_address', 'address_line1', e.target.value)} placeholder="Warehouse/Unit" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Address Line 2</label>
                            <input readOnly={isViewMode} value={formData.shipping_address.address_line2} onChange={(e) => handleAddressChange('shipping_address', 'address_line2', e.target.value)} placeholder="Gate / Area" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className={styles.formGroup}>
                                <label>Country</label>
                                <input value={formData.shipping_address.country} readOnly style={{ background: '#f5f5f5', cursor: 'not-allowed' }} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <select disabled={isViewMode} value={formData.shipping_address.state} onChange={(e) => handleAddressChange('shipping_address', 'state', e.target.value)}>
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className={styles.formGroup}>
                                <label>District</label>
                                <input readOnly={isViewMode} value={formData.shipping_address.city} onChange={(e) => handleAddressChange('shipping_address', 'city', e.target.value)} placeholder="Enter District" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Postal Code</label>
                                <input readOnly={isViewMode} value={formData.shipping_address.postal_code} onChange={(e) => handleAddressChange('shipping_address', 'postal_code', e.target.value)} placeholder="400601" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contacts & Banks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className={styles.formSection} style={{ marginBottom: 0 }}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}><User size={14} /> Contacts</h3>
                        {!isViewMode && (
                            <button type="button" onClick={() => addItem('contacts', { salutation: '', first_name: '', last_name: '', email: '', mobile: '', department: '', designation: '' })} className={styles.addBtnPremium}>
                                <Plus size={10} /> Add
                            </button>
                        )}
                    </div>
                    <div className={styles.nestedList}>
                        {formData.contacts.map((contact, idx) => (
                            <div key={idx} className={styles.nestedCard}>
                                <div style={{ display: 'grid', gridTemplateColumns: isViewMode ? '1fr 1.5fr 1.5fr' : '0.6fr 1.2fr 1.2fr', gap: '0.65rem' }}>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>Salutation</label>}
                                        <select disabled={isViewMode} value={contact.salutation} onChange={(e) => handleNestedChange('contacts', idx, 'salutation', e.target.value)}>
                                            <option value="">None</option>
                                            {SALUTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>First Name</label>}
                                        <input readOnly={isViewMode} placeholder="First Name" value={contact.first_name} onChange={(e) => handleNestedChange('contacts', idx, 'first_name', e.target.value)} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>Last Name</label>}
                                        <input readOnly={isViewMode} placeholder="Last Name" value={contact.last_name} onChange={(e) => handleNestedChange('contacts', idx, 'last_name', e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>Email</label>}
                                        <input readOnly={isViewMode} type="email" placeholder="Email" value={contact.email} onChange={(e) => handleNestedChange('contacts', idx, 'email', e.target.value)} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>Mobile</label>}
                                        <input readOnly={isViewMode} placeholder="Mobile" value={contact.mobile} onChange={(e) => handleNestedChange('contacts', idx, 'mobile', e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>Department</label>}
                                        <input readOnly={isViewMode} placeholder="Department" value={contact.department} onChange={(e) => handleNestedChange('contacts', idx, 'department', e.target.value)} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>Designation</label>}
                                        <input readOnly={isViewMode} placeholder="Designation" value={contact.designation} onChange={(e) => handleNestedChange('contacts', idx, 'designation', e.target.value)} />
                                    </div>
                                </div>
                                {formData.contacts.length > 1 && !isViewMode && (
                                    <button type="button" onClick={() => removeItem('contacts', idx)} className={styles.removeCircleBtn}>
                                        <X size={10} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.formSection} style={{ marginBottom: 0 }}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}><Landmark size={14} /> Bank Details</h3>
                        {!isViewMode && (
                            <button type="button" onClick={() => addItem('bank_accounts', { account_name: '', account_number: '', bank_name: '', ifsc_code: '', branch: '', upi_id: '' })} className={styles.addBtnPremium}>
                                <Plus size={10} /> Add
                            </button>
                        )}
                    </div>
                    <div className={styles.nestedList}>
                        {formData.bank_accounts.map((bank, idx) => (
                            <div key={idx} className={styles.nestedCard}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>Account Holder Name</label>}
                                        <input readOnly={isViewMode} placeholder="Account Holder Name" value={bank.account_name} onChange={(e) => handleNestedChange('bank_accounts', idx, 'account_name', e.target.value)} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>Account Number</label>}
                                        <input readOnly={isViewMode} placeholder="Account Number" value={bank.account_number} onChange={(e) => handleNestedChange('bank_accounts', idx, 'account_number', e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>Bank Name</label>}
                                        <input readOnly={isViewMode} placeholder="Bank Name" value={bank.bank_name} onChange={(e) => handleNestedChange('bank_accounts', idx, 'bank_name', e.target.value)} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>IFSC Code</label>}
                                        <input readOnly={isViewMode} placeholder="IFSC Code" value={bank.ifsc_code} onChange={(e) => handleNestedChange('bank_accounts', idx, 'ifsc_code', e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                                    <div className={styles.formGroup}>
                                        {isViewMode && <label>Branch</label>}
                                        <input readOnly={isViewMode} placeholder="Branch" value={bank.branch} onChange={(e) => handleNestedChange('bank_accounts', idx, 'branch', e.target.value)} />
                                    </div>
                                </div>
                                {formData.bank_accounts.length > 1 && !isViewMode && (
                                    <button type="button" onClick={() => removeItem('bank_accounts', idx)} className={styles.removeCircleBtn}>
                                        <X size={10} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Remarks Section */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}><Info size={16} /> Additional Information</h3>
                </div>
                <div className={styles.formGroup}>
                    <label>Remarks</label>
                    <textarea
                        readOnly={isViewMode}
                        name="remarks"
                        value={formData.remarks || ''}
                        onChange={handleChange}
                        placeholder="Any additional notes about this supplier..."
                        rows={3}
                        style={{ resize: isViewMode ? 'none' : 'vertical' }}
                    />
                </div>
            </div>

            <div className={styles.formFooter}>
                <button type="button" onClick={onCancel} className="btn-secondary" style={{ border: '1px solid var(--neutral-200)', background: 'white', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '13px' }}>
                    {isViewMode ? 'Close' : 'Cancel'}
                </button>
                {!isViewMode && (
                    <button type="submit" className="btn-primary" disabled={loading} style={{ minWidth: '120px', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '13px' }}>
                        {loading ? 'Processing...' : 'Save Supplier'}
                    </button>
                )}
            </div>
        </form>
    );
};

export default SupplierForm;