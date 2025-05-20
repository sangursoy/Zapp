import { useState, useCallback } from 'react';
import { z } from 'zod';

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
}

interface UseFormProps<T> {
  initialValues: T;
  validationSchema: z.ZodType<T>;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit
}: UseFormProps<T>) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {}
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: keyof T, value: any) => {
    try {
      validationSchema.shape[name].parse(value);
      return '';
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return 'Invalid value';
    }
  }, [validationSchema]);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value },
      errors: { ...prev.errors, [name]: validateField(name, value) }
    }));
  }, [validateField]);

  const handleBlur = useCallback((name: keyof T) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: true }
    }));
  }, []);

  const validateForm = useCallback(() => {
    try {
      validationSchema.parse(state.values);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.reduce((acc, curr) => {
          const path = curr.path[0] as keyof T;
          acc[path] = curr.message;
          return acc;
        }, {} as Record<keyof T, string>);
      }
      return {};
    }
  }, [state.values, validationSchema]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setState(prev => ({
        ...prev,
        errors,
        touched: Object.keys(prev.values).reduce((acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        }, {} as Record<keyof T, boolean>)
      }));
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(state.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [state.values, validateForm, onSubmit]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue: handleChange
  };
}