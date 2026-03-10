import React from 'react';
import { Layers } from 'lucide-react';
import MasterTable from '../../components/masters/MasterTable';

const MaterialTypesPage = () => {
    return (
        <MasterTable
            title="Material Types"
            subtitle="Manage product material types"
            type="material_types"
            icon={Layers}
            createPermission="masters:create"
            editPermission="masters:edit"
            deletePermission="masters:delete"
        />
    );
};

export default MaterialTypesPage;
