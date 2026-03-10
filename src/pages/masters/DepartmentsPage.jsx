import React from 'react';
import { Building } from 'lucide-react';
import MasterTable from '../../components/masters/MasterTable';

const DepartmentsPage = () => {
    return (
        <MasterTable
            title="Departments"
            subtitle="Manage departments for product organization"
            type="departments"
            icon={Building}
            createPermission="masters:create"
            editPermission="masters:edit"
            deletePermission="masters:delete"
        />
    );
};

export default DepartmentsPage;
