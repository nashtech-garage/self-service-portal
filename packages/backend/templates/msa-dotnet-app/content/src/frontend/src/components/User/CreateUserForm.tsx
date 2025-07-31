import { Calendar } from 'primereact/calendar';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import BaseModal from '@/components/common/BaseModal/BaseModal';
import PasswordDisplayModal from './PasswordDisplayModal';
import useCreateUserForm from '@/hooks/useCreateUserForm';
import 'primeflex/primeflex.css';
import '@css/CreateUser.scss';
import '@css/RadioButton.scss'
import type { UserFormData } from '@/entities/user';
import type { GenderOption } from '@/entities/common';
import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import InputWrapper from '@/components/common/InputWrapper';
import SelectDropdown from '@components/common/SelectDropdown';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

interface CreateUserFormProps {
  onSubmit: (userData: UserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CreateUserFormRef {
  showPasswordDisplay: (password: string) => void;
}

const genderOptions: GenderOption[] = [
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' }
];

const CreateUserForm = forwardRef<CreateUserFormRef, CreateUserFormProps>(({ onSubmit, onCancel, isLoading = false }, ref) => {
  const dobCalendarRef = useRef<any>(null);
  const joinedDateCalendarRef = useRef<any>(null);
  const [isFormComplete, setIsFormComplete] = useState(false);

  const {
    errors,
    showConfirmModal,
    showPasswordModal,
    generatedPassword,
    userTypes,
    register,
    handleInputChange,
    handleSubmit,
    handleConfirmSubmit,
    setShowConfirmModal,
    setShowPasswordModal,
    showPasswordDisplay,
    control,
    userData
  } = useCreateUserForm(onSubmit);

  useImperativeHandle(ref, () => ({
    showPasswordDisplay
  }));

  useEffect(() => {
    const { firstName, lastName, dateOfBirth, gender, joinedDate, userType } = userData;
    const allFieldsFilled = firstName &&
      lastName &&
      dateOfBirth &&
      gender &&
      joinedDate &&
      userType;

    setIsFormComplete(!!allFieldsFilled);
  }, [userData]);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="create-user-form mt-2 flex flex-column gap-2"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="First Name"
          error={errors.firstName?.message}
          htmlFor="firstName"
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <InputText
            id="firstName"
            {...register('firstName', {
              onChange: (e) => {
                if (e.target.value.length <= 50) {
                  handleInputChange('firstName', e.target.value);
                }
              }
            })}
            className={classNames('h-2rem w-full', { 'p-invalid': errors.firstName })}
            disabled={isLoading}
            maxLength={50}
          />
        </InputWrapper>

        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="Last Name"
          error={errors.lastName?.message}
          htmlFor="lastName"
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <InputText
            id="lastName"
            {...register('lastName', {
              onChange: (e) => {
                if (e.target.value.length <= 50) {
                  handleInputChange('lastName', e.target.value);
                }
              }
            })}
            className={classNames('h-2rem w-full', { 'p-invalid': errors.lastName })}
            disabled={isLoading}
            maxLength={50}
          />
        </InputWrapper>

        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="Date of Birth"
          error={errors.dateOfBirth?.message}
          htmlFor="dateOfBirth"
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <IconField iconPosition="right">
                <Calendar
                  ref={dobCalendarRef}
                  id={field.name}
                  inputId={`input-${field.name}`}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  dateFormat="dd/mm/yy"
                  className={classNames("h-2rem custom-calendar w-full", { "p-invalid": errors.dateOfBirth })}
                  disabled={isLoading}
                  showOnFocus={true}
                />
                <InputIcon className="pi pi-calendar"></InputIcon>
              </IconField>
            )}
          />
        </InputWrapper>

        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="Gender"
          error={errors.gender?.message}
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <div className="gender-options flex align-items-center flex-wrap">
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <>
                  {genderOptions.map((option) => (
                    <div className="gender-option flex align-items-center mr-3 mb-1" key={option.value}>
                      <RadioButton
                        inputId={`gender-${option.value}`}
                        name={field.name}
                        value={option.value}
                        onChange={(e) => field.onChange(e.value)}
                        checked={field.value === option.value}
                        disabled={isLoading}
                        className={classNames({ 'p-invalid': errors.gender })}
                      />
                      <label htmlFor={`gender-${option.value}`} className={`gender-label ml-2 ${option.value === 'Female' ? 'text-red-600' : 'text-yellow-900'}`}>{option.label}</label>
                    </div>
                  ))}
                </>
              )}
            />
          </div>
        </InputWrapper>

        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="Joined Date"
          error={errors.joinedDate?.message}
          htmlFor="joinedDate"
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <Controller
            name="joinedDate"
            control={control}
            render={({ field }) => (
              <IconField iconPosition="right">
                <Calendar
                  ref={joinedDateCalendarRef}
                  id={field.name}
                  inputId={`input-${field.name}`}
                  value={field.value}
                  onChange={(e) => field.onChange(e.value)}
                  dateFormat="dd/mm/yy"
                  className={classNames("h-2rem custom-calendar w-full", { "p-invalid": errors.joinedDate })}
                  disabled={isLoading}
                  showOnFocus={true}
                />
                <InputIcon className="pi pi-calendar"></InputIcon>
              </IconField>
            )}
          />
        </InputWrapper>

        <InputWrapper
          wrapperClassName="gap-2 flex flex-column lg:flex-row "
          title="Type"
          error={errors.userType?.message}
          htmlFor="userType"
          labelClassName="align-self-start"
          inputClassName="w-full lg:w-full"
        >
          <Controller
            name="userType"
            control={control}
            render={({ field }) => (
              <SelectDropdown
                id={field.name}
                value={field.value}
                options={userTypes}
                onChange={(e) => field.onChange(e.value)}
                optionLabel="name"
                placeholder="Select a type"
                error={!!errors.userType}
                disabled={isLoading}
              />
            )}
          />
        </InputWrapper>

        <div className="button-group flex justify-content-end mt-2">
          <Button
            type="submit"
            label="Save"
            severity="danger"
            disabled={!isFormComplete}
            className="mr-2 h-2rem w-5rem px-3"
          />
          <Button
            type="button"
            label="Cancel"
            className="p-button-outlined h-2rem bg-white text-color-secondary border-gray-300 w-5rem px-3"
            onClick={onCancel}
            disabled={isLoading}
          />
        </div>
      </form>

      <BaseModal
        visible={showConfirmModal}
        title="Confirm"
        content={
          <p>Are you sure you want to create this user?</p>
        }
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        confirmText="Save"
        cancelText="Cancel"
        showCancel={true}
      />

      <PasswordDisplayModal
        visible={showPasswordModal}
        password={generatedPassword}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
});

export default CreateUserForm;
