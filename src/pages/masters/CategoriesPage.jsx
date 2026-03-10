import React from 'react';
import { Tags } from 'lucide-react';
import MasterTable from '../../components/masters/MasterTable';

const CategoriesPage = () => {
    return (
        <MasterTable
            title="Categories"
            subtitle="Manage product categories"
            type="categories"
            icon={Tags}
            createPermission="masters:create"
            editPermission="masters:edit"
            deletePermission="masters:delete"
        />
    );
};

export default CategoriesPage;
