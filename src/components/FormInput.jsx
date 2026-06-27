import { forwardRef } from 'react';

const FormInput = forwardRef(function FormInput({ label, error, ...props }, ref) {
  return (
    <div>
      <label className="label" htmlFor={props.id || props.name}>{label}</label>
      <input ref={ref} className="input" {...props} />
      {error && <p className="error">{error.message}</p>}
    </div>
  );
});

export default FormInput;
