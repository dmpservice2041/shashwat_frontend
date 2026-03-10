import React from 'react';
import { Receipt } from 'lucide-react';
import MasterTable from '../../components/masters/MasterTable';

const TaxCodesPage = () => {
    return (
        <MasterTable
            title="GST Tax Codes"
            subtitle="Manage tax codes, HSN rates, and percentages"
            type="gst_tax_codes"
            icon={Receipt}
            createPermission="masters:create"
            editPermission="masters:edit"
            deletePermission="masters:delete"
        />
    );
};

export default TaxCodesPage;
