import React from 'react';
import { Scale } from 'lucide-react';
import MasterTable from '../../components/masters/MasterTable';

const UnitsPage = () => {
    return (
        <MasterTable
            title="Units of Measure"
            subtitle="Manage product measurement units"
            type="units"
            icon={Scale}
            createPermission="masters:create"
            editPermission="masters:edit"
            deletePermission="masters:delete"
        />
    );
};

export default UnitsPage;
