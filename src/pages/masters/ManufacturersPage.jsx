import React from 'react';
import { Factory } from 'lucide-react';
import MasterTable from '../../components/masters/MasterTable';

const ManufacturersPage = () => {
    return (
        <MasterTable
            title="Manufacturers"
            subtitle="Manage product manufacturers"
            type="manufacturers"
            icon={Factory}
            createPermission="masters:create"
            editPermission="masters:edit"
            deletePermission="masters:delete"
        />
    );
};

export default ManufacturersPage;
