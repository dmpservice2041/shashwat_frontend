import React from 'react';
import { Warehouse } from 'lucide-react';
import MasterTable from '../../components/masters/MasterTable';

const WarehousesPage = () => {
    return (
        <MasterTable
            title="Warehouses"
            subtitle="Manage storage locations and facilities"
            type="warehouses"
            icon={Warehouse}
            createPermission="masters:create"
            editPermission="masters:edit"
            deletePermission="masters:delete"
        />
    );
};

export default WarehousesPage;
