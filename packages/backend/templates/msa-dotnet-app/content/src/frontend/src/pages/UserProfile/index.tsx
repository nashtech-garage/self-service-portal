import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Card } from 'primereact/card';
import { mapUserTypeToRole } from '@utils/userType';

const UserProfile: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.userProfile);

    return (
        <div className="p-4">
            <Card title="User Profile" className="w-9">
                <div className="flex flex-column gap-3">
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-user" style={{ fontSize: '1.5rem' }}></i>
                        <span className="font-bold">Username:</span>
                        <span>{user ? user.username : ""}</span>
                    </div>
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-id-card" style={{ fontSize: '1.5rem' }}></i>
                        <span className="font-bold">Role:</span>
                        <span>
                            {user ? mapUserTypeToRole(user.userType) : ""}
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default UserProfile; 