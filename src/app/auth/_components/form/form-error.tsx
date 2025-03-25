interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) => (
  <p className="text-xs text-red-500 min-h-[1.0rem]">{message ?? " "}</p>
);
