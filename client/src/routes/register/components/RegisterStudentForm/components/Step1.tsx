import { FormInputField } from '@ui/derived/form-fields/form-field-input';
import { FormPhoneInputField } from '@ui/derived/form-fields/form-field-phone-input';

export function Step1() {
  return (
    <>
      <FormInputField name="name" label="Nombre" disabled maxLength={50} />
      <FormInputField name="lastName" label="Apellido" disabled maxLength={50} />
      <FormInputField name="email" label="Email" type="email" disabled />
      <FormInputField name="id_card" label="Carnet estudiantil" maxLength={11} />
      <FormPhoneInputField name="phone" label="Teléfono" className='bg-white' />
    </>
  );
}
