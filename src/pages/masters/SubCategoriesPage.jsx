import React from 'react';
import { Columns } from 'lucide-react';
import MasterTable from '../../components/masters/MasterTable';

const SubCategoriesPage = () => {
    return (
        <MasterTable
            title="Sub Categories"
            subtitle="Manage product sub-categories"
            type="sub_categories"
            icon={Columns}
            createPermission="masters:create"
            editPermission="masters:edit"
            deletePermission="masters:delete"
        />
    );
};

export default SubCategoriesPage;
