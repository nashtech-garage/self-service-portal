import React, { useState } from 'react';
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useToast } from '@/components/Toast/Toast';
import CustomModal from '../common/BaseModal/BaseModal';
import BaseButton from '../common/BaseButton/BaseButton';
import '@css/BaseModal.scss';
import '@css/CreateUser.scss';
import { useNavigate } from 'react-router-dom';

interface PasswordDisplayModalProps {
    visible: boolean;
    password: string;
    onClose: () => void;
}

const PasswordDisplayModal: React.FC<PasswordDisplayModalProps> = ({
    visible,
    password,
    onClose
}) => {
    const [copied, setCopied] = useState(false);
    const { showSuccess } = useToast();
    const navigate = useNavigate();

    const handleRedirectToUsers = () => {
        navigate('/users');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(password)
            .then(() => {
                setCopied(true);
                showSuccess('Password copied to clipboard');
                setTimeout(() => {
                    setCopied(false);
                    onClose(); // Đóng modal
                    handleRedirectToUsers(); // Chuyển hướng về trang users
                }, 1500);
            })
            .catch(err => {
                console.error('Failed to copy password: ', err);
            });
    };

    const handleClose = () => {
        onClose();
        handleRedirectToUsers();
    };

    const passwordContent = (
        <div className="p-fluid">
            <h3>Initial Password</h3>
            <p className="mb-3">Please copy and save this password. It will not be shown again.</p>
            <div className="p-inputgroup">
                <Password
                    value={password}
                    toggleMask
                    feedback={false}
                    inputStyle={{ width: '100%' }}
                    className="w-full"
                />
                <Button
                    label={copied ? "Copied" : "Copy"}
                    onClick={handleCopy}
                    severity={copied ? "success" : "danger"}
                    style={{ backgroundColor: copied ? undefined : '#dc3545', color: 'white' }}
                    className="password-copy-button"
                />
            </div>
            {copied && (
                <small className="p-success block text-right mt-1">Copied to clipboard!</small>
            )}
        </div>
    );

    return (
        <CustomModal
            visible={visible}
            title="User Created Successfully"
            content={passwordContent}
            onClose={handleClose}
            showCancel={false}
            onConfirm={handleClose}
            confirmText="OK"
        />
    );
};

export default PasswordDisplayModal; 