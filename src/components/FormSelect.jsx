import { forwardRef } from 'react';

const FormSelect = forwardRef(function FormSelect({ label, options, error, ...props }, ref) {
  return (
    <div>
      <label className="label" htmlFor={props.id || props.name}>{label}</label>
      <select ref={ref} className="input" defaultValue="" {...props}>
        <option value="" disabled className="bg-nest-950">Select an option</option>
        {options.map((option) => (
          <option className="bg-nest-950" key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="error">{error.message}</p>}
    </div>
  );
});

export default FormSelect;
