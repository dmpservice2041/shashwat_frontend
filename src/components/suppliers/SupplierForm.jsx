import React, { useState } from 'react';
import { Plus, Trash2, User, Mail, Phone, MapPin, Building2, Landmark, Info, X, Briefcase, Globe, CreditCard } from 'lucide-react';
import styles from '../../pages/MasterModules.module.css';
import { showToast } from '../common/Toast';

const GST_TREATMENTS = [
    { value: 'registered_business_regular', label: 'Registered Business - Regular' },
    { value: 'registered_business_composition', label: 'Registered Business - Composition' },
    { value: 'unregistered_business', label: 'Unregistered Business' },
    { value: 'consumer', label: 'Consumer' },
    { value: 'overseas', label: 'Overseas' }
];

const GST_STATE_CODES = [
    'Andaman and Nicobar Islands [35]', 'Andhra Pradesh [37]', 'Arunachal Pradesh [12]', 'Assam [18]', 'Bihar [10]',
    'Chandigarh [04]', 'Chhattisgarh [22]', 'Dadra and Nagar Haveli and Daman and Diu [26]', 'Delhi [07]', 'Goa [30]',
    'Gujarat [24]', 'Haryana [06]', 'Himachal Pradesh [02]', 'Jammu and Kashmir [01]', 'Jharkhand [20]',
    'Karnataka [29]', 'Kerala [32]', 'Ladakh [38]', 'Lakshadweep [31]', 'Madhya Pradesh [23]',
    'Maharashtra [27]', 'Manipur [14]', 'Meghalaya [17]', 'Mizoram [15]', 'Nagaland [13]',
    'Odisha [21]', 'Other Territory [97]', 'Puducherry [34]', 'Punjab [03]', 'Rajasthan [08]',
    'Sikkim [11]', 'Tamil Nadu [33]', 'Telangana [36]', 'Tripura [16]', 'Uttar Pradesh [09]',
    'Uttarakhand [05]', 'West Bengal [19]'
];

const INDIAN_STATES = [
    'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
    'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal'
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

const SupplierForm = ({ initialData, onSubmit, onCancel, loading }) => {
    // Helper to format initial data from API structure to form structure
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
            payment_terms: data.payment_terms || '',
            tds_tax_id: data.tds_tax_id || '',
            currency: data.currency || 'INR',
            billing_address: data.billing_address || { address_line1: '', address_line2: '', city: '', state: '', country: 'India', postal_code: '' },
            shipping_address: data.shipping_address || { address_line1: '', address_line2: '', city: '', state: '', country: 'India', postal_code: '' },
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
            })) : [{ salutation: '', first_name: '', last_name: '', email: '', phone: '', mobile: '', department: '', designation: '' }],
            bank_accounts: data.bank_accounts?.length ? data.bank_accounts.map(b => ({
                id: b.id,
                account_name: b.account_name || '',
                account_number: b.account_number || '',
                bank_name: b.bank_name || '',
                ifsc_code: b.ifsc_code || '',
                branch: b.branch || ''
            })) : [{ account_name: '', account_number: '', bank_name: '', ifsc_code: '', branch: '' }]
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        setFormData(prev => ({
            ...prev,
            [type]: [...prev[type], emptyItem]
        }));
    };

    const removeItem = (type, index) => {
        setFormData(prev => {
            const updatedArray = prev[type].filter((_, i) => i !== index);
            return { ...prev, [type]: updatedArray.length ? updatedArray : [prev[type][0]] };
        });
    };

    const copyBillingToShipping = () => {
        setFormData(prev => ({
            ...prev,
            shipping_address: { ...prev.billing_address }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('SupplierForm: handleSubmit called', formData);

        // 1. Mandatory validations
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
        if (formData.pan && formData.pan.length !== 10) {
            showToast('PAN must be exactly 10 characters');
            return;
        }
        if (formData.gst_number && formData.gst_number.length !== 15) {
            showToast('GST Number must be exactly 15 characters');
            return;
        }
        if (parseFloat(formData.opening_balance) < 0) {
            showToast('Opening balance must be a positive number');
            return;
        }

        // Work on a copy to avoid mutating state directly during submission
        const submissionData = { ...formData };

        // 2. Handle Contacts
        const activeContacts = submissionData.contacts.filter(c =>
            c.first_name?.trim() || c.last_name?.trim() || c.email?.trim() || c.mobile?.trim() || c.department?.trim() || c.designation?.trim()
        );
        for (const c of activeContacts) {
            if (!c.first_name?.trim() || !c.last_name?.trim()) {
                showToast('First and Last Name are required for all added contacts');
                return;
            }
        }
        submissionData.contacts = activeContacts;

        // 3. Filter out empty bank accounts
        submissionData.bank_accounts = submissionData.bank_accounts.filter(b => b.account_name?.trim() || b.account_number?.trim());

        // 4. Handle Addresses
        if (!submissionData.billing_address?.address_line1?.trim()) {
            delete submissionData.billing_address;
        }
        if (!submissionData.shipping_address?.address_line1?.trim()) {
            delete submissionData.shipping_address;
        }

        // 5. Ensure numeric types
        if (submissionData.opening_balance !== undefined) {
            submissionData.opening_balance = parseFloat(submissionData.opening_balance) || 0;
        }

        // 6. Clean strings
        ['email', 'mobile', 'work_phone', 'gst_number', 'pan', 'remarks', 'company_name', 'salutation', 'first_name', 'last_name', 'source_of_supply', 'payment_terms', 'msme_number', 'tds_tax_id'].forEach(field => {
            if (submissionData[field] === '') {
                submissionData[field] = null;
            }
        });

        console.log('SupplierForm: validation passed, submitting data', submissionData);
        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Basic Information & Tax Row */}
            <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}><Building2 size={16} /> Basic & Tax Information</h3>
                </div>
                <div className={styles.grid4} style={{ marginBottom: '1rem' }}>
                    <div className={styles.formGroup}>
                        <label>Salutation</label>
                        <select name="salutation" value={formData.salutation} onChange={handleChange}>
                            <option value="">None</option>
                            {SALUTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>First Name</label>
                        <input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="e.g. Shashwat" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Last Name</label>
                        <input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Kumar" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Display Name *</label>
                        <div className={styles.inputWrapper}>
                            <User size={14} className={styles.inputIcon} />
                            <input name="display_name" className={styles.hasIcon} value={formData.display_name} onChange={handleChange} required placeholder="Shashwat Healthcare (SK)" />
                        </div>
                    </div>
                </div>

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Company Name</label>
                        <div className={styles.inputWrapper}>
                            <Briefcase size={14} className={styles.inputIcon} />
                            <input name="company_name" className={styles.hasIcon} value={formData.company_name} onChange={handleChange} placeholder="Legal Name" />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={14} className={styles.inputIcon} />
                            <input type="email" name="email" className={styles.hasIcon} value={formData.email} onChange={handleChange} placeholder="vendor@example.com" />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Mobile Number</label>
                        <div className={styles.inputWrapper}>
                            <Phone size={14} className={styles.inputIcon} />
                            <input name="mobile" className={styles.hasIcon} value={formData.mobile} onChange={handleChange} placeholder="9876543210" />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Work Phone</label>
                        <div className={styles.inputWrapper}>
                            <Phone size={14} className={styles.inputIcon} />
                            <input name="work_phone" className={styles.hasIcon} value={formData.work_phone} onChange={handleChange} placeholder="022-1234567" />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>GST Treatment *</label>
                        <select name="gst_treatment" value={formData.gst_treatment} onChange={handleChange} required>
                            <option value="">Select Treatment</option>
                            {GST_TREATMENTS.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>GST Number</label>
                        <input name="gst_number" value={formData.gst_number} onChange={handleChange} placeholder="15-digit GSTIN" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>PAN Card</label>
                        <input name="pan" value={formData.pan} onChange={handleChange} placeholder="ABCDE1234F" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Opening Balance</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon} style={{ fontSize: '13px', fontWeight: 'bold' }}>₹</span>
                            <input type="number" name="opening_balance" className={styles.hasIcon} value={formData.opening_balance} onChange={handleChange} />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Payment Terms</label>
                        <select name="payment_terms" value={formData.payment_terms} onChange={handleChange}>
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
                        <select name="source_of_supply" value={formData.source_of_supply} onChange={handleChange} required>
                            <option value="">Select State</option>
                            {GST_STATE_CODES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>MSME Number</label>
                        <input name="msme_number" value={formData.msme_number} onChange={handleChange} placeholder="UDYAM-MH-01-1234567" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>TDS Tax ID</label>
                        <select name="tds_tax_id" value={formData.tds_tax_id} onChange={handleChange}>
                            <option value="">Select TDS Category</option>
                            {TDS_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Address Row - Side by Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className={styles.formSection} style={{ marginBottom: 0 }}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}><MapPin size={16} /> Billing Address</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className={styles.formGroup}>
                            <label>Address Line 1</label>
                            <input value={formData.billing_address.address_line1} onChange={(e) => handleAddressChange('billing_address', 'address_line1', e.target.value)} placeholder="Building/Street" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Address Line 2</label>
                            <input value={formData.billing_address.address_line2} onChange={(e) => handleAddressChange('billing_address', 'address_line2', e.target.value)} placeholder="Area/Landmark" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className={styles.formGroup}>
                                <label>Country</label>
                                <input value={formData.billing_address.country} readOnly style={{ background: '#f5f5f5', cursor: 'not-allowed' }} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <select value={formData.billing_address.state} onChange={(e) => handleAddressChange('billing_address', 'state', e.target.value)}>
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className={styles.formGroup}>
                                <label>District</label>
                                <input value={formData.billing_address.city} onChange={(e) => handleAddressChange('billing_address', 'city', e.target.value)} placeholder="Enter District" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Postal Code</label>
                                <input value={formData.billing_address.postal_code} onChange={(e) => handleAddressChange('billing_address', 'postal_code', e.target.value)} placeholder="400001" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.formSection} style={{ marginBottom: 0 }}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}><Globe size={16} /> Shipping Address</h3>
                        <button type="button" onClick={copyBillingToShipping} className={styles.addBtnPremium} style={{ fontSize: '11px', padding: '0.2rem 0.5rem' }}>
                            Copy from Billing
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className={styles.formGroup}>
                            <label>Address Line 1</label>
                            <input value={formData.shipping_address.address_line1} onChange={(e) => handleAddressChange('shipping_address', 'address_line1', e.target.value)} placeholder="Warehouse/Unit" />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Address Line 2</label>
                            <input value={formData.shipping_address.address_line2} onChange={(e) => handleAddressChange('shipping_address', 'address_line2', e.target.value)} placeholder="Gate / Area" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className={styles.formGroup}>
                                <label>Country</label>
                                <input value={formData.shipping_address.country} readOnly style={{ background: '#f5f5f5', cursor: 'not-allowed' }} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <select value={formData.shipping_address.state} onChange={(e) => handleAddressChange('shipping_address', 'state', e.target.value)}>
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className={styles.formGroup}>
                                <label>District</label>
                                <input value={formData.shipping_address.city} onChange={(e) => handleAddressChange('shipping_address', 'city', e.target.value)} placeholder="Enter District" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Postal Code</label>
                                <input value={formData.shipping_address.postal_code} onChange={(e) => handleAddressChange('shipping_address', 'postal_code', e.target.value)} placeholder="400601" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contacts & Banks Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className={styles.formSection} style={{ marginBottom: 0 }}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}><User size={14} /> Contacts</h3>
                        <button type="button" onClick={() => addItem('contacts', { salutation: '', first_name: '', last_name: '', email: '', mobile: '', department: '', designation: '' })} className={styles.addBtnPremium}>
                            <Plus size={10} /> Add
                        </button>
                    </div>
                    <div className={styles.nestedList}>
                        {formData.contacts.map((contact, idx) => (
                            <div key={idx} className={styles.nestedCard}>
                                <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 1.2fr 1.2fr', gap: '0.65rem' }}>
                                    <select value={contact.salutation} onChange={(e) => handleNestedChange('contacts', idx, 'salutation', e.target.value)}>
                                        <option value="">None</option>
                                        {SALUTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <input placeholder="First Name" value={contact.first_name} onChange={(e) => handleNestedChange('contacts', idx, 'first_name', e.target.value)} />
                                    <input placeholder="Last Name" value={contact.last_name} onChange={(e) => handleNestedChange('contacts', idx, 'last_name', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                                    <input type="email" placeholder="Email" value={contact.email} onChange={(e) => handleNestedChange('contacts', idx, 'email', e.target.value)} />
                                    <input placeholder="Mobile" value={contact.mobile} onChange={(e) => handleNestedChange('contacts', idx, 'mobile', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                                    <input placeholder="Department" value={contact.department} onChange={(e) => handleNestedChange('contacts', idx, 'department', e.target.value)} />
                                    <input placeholder="Designation" value={contact.designation} onChange={(e) => handleNestedChange('contacts', idx, 'designation', e.target.value)} />
                                </div>
                                {formData.contacts.length > 1 && (
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
                        <button type="button" onClick={() => addItem('bank_accounts', { account_name: '', account_number: '', bank_name: '', ifsc_code: '', branch: '', upi_id: '' })} className={styles.addBtnPremium}>
                            <Plus size={10} /> Add
                        </button>
                    </div>
                    <div className={styles.nestedList}>
                        {formData.bank_accounts.map((bank, idx) => (
                            <div key={idx} className={styles.nestedCard}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                                    <input placeholder="Account Holder Name" value={bank.account_name} onChange={(e) => handleNestedChange('bank_accounts', idx, 'account_name', e.target.value)} />
                                    <input placeholder="Account Number" value={bank.account_number} onChange={(e) => handleNestedChange('bank_accounts', idx, 'account_number', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                                    <input placeholder="Bank Name" value={bank.bank_name} onChange={(e) => handleNestedChange('bank_accounts', idx, 'bank_name', e.target.value)} />
                                    <input placeholder="IFSC Code" value={bank.ifsc_code} onChange={(e) => handleNestedChange('bank_accounts', idx, 'ifsc_code', e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                                    <input placeholder="Branch" value={bank.branch} onChange={(e) => handleNestedChange('bank_accounts', idx, 'branch', e.target.value)} />
                                </div>
                                {formData.bank_accounts.length > 1 && (
                                    <button type="button" onClick={() => removeItem('bank_accounts', idx)} className={styles.removeCircleBtn}>
                                        <X size={10} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.formFooter}>
                <button type="button" onClick={onCancel} className="btn-secondary" style={{ border: '1px solid var(--neutral-200)', background: 'white', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '13px' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ minWidth: '120px', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '13px' }}>
                    {loading ? 'Processing...' : 'Save Supplier'}
                </button>
            </div>
        </form >
    );
};

export default SupplierForm;
