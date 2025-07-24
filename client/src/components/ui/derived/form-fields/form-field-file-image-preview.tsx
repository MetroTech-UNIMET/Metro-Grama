import * as React from 'react';
import Dropzone from 'react-dropzone';
import { CropperRef, Cropper, CropperPreview, CropperPreviewRef } from 'react-advanced-cropper';
import { Trash } from 'lucide-react';
import 'react-advanced-cropper/dist/style.css';

import { cn } from '@/lib/utils/className';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useWatch, type FieldValues, type Path } from 'react-hook-form';

type LabelInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> & {
  label?: string;
  containerClassName?: string;
  labelClassName?: string;

  required?: boolean;
};

type OnChangeType = React.ChangeEventHandler<HTMLInputElement>;

export interface InputImageFieldProps<T extends FieldValues> extends LabelInputProps {
  name: Path<T>;
  showErrors?: boolean;
  showColorsState?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>, onChange: OnChangeType) => void;

  cropperProps?: React.ComponentProps<typeof Cropper>;
}

function FormInputImage<T extends FieldValues>({
  name,
  disabled,
  id,
  label,
  containerClassName,
  labelClassName,
  className,
  onChange: onChangeProps,
  showErrors = true,
  showColorsState = true,
  cropperProps,
  ...props
}: InputImageFieldProps<T>) {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [originalImageURL, setOriginalImageURL] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const value = useWatch({ name });

  React.useEffect(() => {
    if ((value as any) instanceof File) {
      const url = URL.createObjectURL(value);
      setImagePreview(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof value === 'string') {
      setImagePreview(value);
      if (!originalImageURL) {
        setOriginalImageURL(value);
      }
    } else {
      setImagePreview(null);
    }
  }, [value]);

  // const handleReset = (onChange: (...event: any[]) => void) => {
  //   if (originalImageURL) {
  //     onChange(originalImageURL);
  //   }
  // };

  return (
    <FormField
      name={name}
      disabled={disabled}
      render={({ field: { value, onChange: onChangeForm, onBlur, ...field }, fieldState }) => {
        const hasError = fieldState.invalid;

        function onChange(e: React.ChangeEvent<HTMLInputElement>, file: File | undefined) {
          onChangeProps ? onChangeProps(e, onChangeForm) : onChangeForm(file);
        }

        return (
          <FormItem className={containerClassName}>
            <FormLabel
              className={labelClassName}
              required={props.required}
              showColorsState={showColorsState}
            >
              {label}
            </FormLabel>

            <Dropzone
              onDrop={(acceptedFiles, _) => {
                if (!inputRef.current) return;
                const file = acceptedFiles[0];

                inputRef.current.files = createFileList(file);

                inputRef.current.dispatchEvent(
                  new Event('change', {
                    bubbles: true,
                    cancelable: true,
                  }),
                );
              }}
              multiple={false}
            >
              {({ getRootProps, getInputProps, isDragActive }) => (
                <div className="flex h-20 w-full items-center justify-around gap-4 rounded-lg bg-gray-50 px-6 py-3">
                  <div
                    {...getRootProps()}
                    className={cn(
                      'flex w-full cursor-pointer flex-row items-center justify-center gap-4 rounded-md border-2 border-dashed border-gray-300 py-2.5 text-sm dark:hover:border-gray-500',
                      {
                        'border-secondary-600 text-secondary-600': isDragActive,
                        'border-destructive bg-destructive/10 hover:bg-destructive/20': hasError,
                      },
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="42"
                      height="32"
                      viewBox="0 0 42 32"
                      fill="none"
                    >
                      <path
                        d="M31.5001 26.2858C30.7651 26.2858 30.1876 25.7201 30.1876 25.0001C30.1876 24.2801 30.7651 23.7144 31.5001 23.7144C35.8314 23.7144 39.3751 20.243 39.3751 16.0001C39.3751 11.7572 35.8314 8.28582 31.5001 8.28582H28.7439C28.2714 8.28582 27.8514 8.05439 27.6151 7.64296C25.9351 4.81439 22.9951 3.14296 19.7139 3.14296C14.6476 3.14296 10.5264 7.1801 10.5264 12.143C10.5264 12.863 9.94887 13.4287 9.21387 13.4287H7.90137C5.01387 13.4287 2.65137 15.743 2.65137 18.5715C2.65137 21.4001 5.01387 23.7144 7.90137 23.7144C8.63637 23.7144 9.21387 24.2801 9.21387 25.0001C9.21387 25.7201 8.63637 26.2858 7.90137 26.2858C3.57012 26.2858 0.0263672 22.8144 0.0263672 18.5715C0.0263672 14.3287 3.57012 10.8572 7.90137 10.8572H7.98012C8.63637 5.07153 13.6501 0.571533 19.7139 0.571533C23.6251 0.571533 27.3001 2.52582 29.4789 5.71439H31.5264C37.3276 5.71439 42.0264 10.3172 42.0264 16.0001C42.0264 21.683 37.3276 26.2858 31.5264 26.2858H31.5001Z"
                        fill="currentColor"
                      />
                      <path
                        d="M26.2501 21.7858C26.078 21.7879 25.9073 21.7546 25.7491 21.6882C25.5909 21.6218 25.4486 21.5236 25.3314 21.4001L19.6876 15.8715L14.0439 21.4001C13.5189 21.9144 12.7051 21.9144 12.1801 21.4001C11.6551 20.8858 11.6551 20.0887 12.1801 19.5744L18.7426 13.1458C19.2676 12.6315 20.0814 12.6315 20.6064 13.1458L27.1689 19.5744C27.6939 20.0887 27.6939 20.8858 27.1689 21.4001C26.9064 21.6572 26.5651 21.7858 26.2501 21.7858Z"
                        fill="currentColor"
                      />
                      <path
                        d="M19.6876 31.4287C18.9526 31.4287 18.3751 30.863 18.3751 30.143V14.7144C18.3751 13.9944 18.9526 13.4287 19.6876 13.4287C20.4226 13.4287 21.0001 13.9944 21.0001 14.7144V30.143C21.0001 30.863 20.4226 31.4287 19.6876 31.4287Z"
                        fill="currentColor"
                      />
                    </svg>

                    <p>Puede soltar aquí el archivo</p>

                    <FormControl>
                      <Input
                        {...field}
                        {...getInputProps()}
                        ref={inputRef}
                        onBlur={onBlur}
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          onChange(e, file);
                        }}
                      />
                    </FormControl>
                    {/* {value && value.map((file) => <div key={file.path}>{file.path}</div>)} */}
                  </div>

                  <div className="flex flex-row gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      colors="secondary"
                      onClick={() => inputRef.current?.click()}
                    >
                      Buscar archivo
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className={cn('text-gray-300', {
                        'text-success': !!imagePreview,
                      })}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        className="!size-6"
                        fill="none"
                      >
                        <path
                          d="M27 15C27 18.1826 25.7357 21.2348 23.4853 23.4853C21.2348 25.7357 18.1826 27 15 27C11.8174 27 8.76515 25.7357 6.51472 23.4853C4.26428 21.2348 3 18.1826 3 15C3 11.8174 4.26428 8.76515 6.51472 6.51472C8.76515 4.26428 11.8174 3 15 3C16.14 3 17.25 3.165 18.3 3.465L20.655 1.11C18.915 0.39 17.01 0 15 0C13.0302 0 11.0796 0.387987 9.25975 1.14181C7.43986 1.89563 5.78628 3.00052 4.3934 4.3934C1.58035 7.20644 0 11.0218 0 15C0 18.9782 1.58035 22.7936 4.3934 25.6066C5.78628 26.9995 7.43986 28.1044 9.25975 28.8582C11.0796 29.612 13.0302 30 15 30C18.9782 30 22.7936 28.4196 25.6066 25.6066C28.4196 22.7936 30 18.9782 30 15M8.865 12.12L6.75 14.25L13.5 21L28.5 6L26.385 3.87L13.5 16.755L8.865 12.12Z"
                          fill="currentColor"
                        />
                      </svg>
                    </Button>

                    <PreviewDialog
                      label={label}
                      imagePreview={imagePreview}
                      cropperProps={cropperProps}
                      inputElement={inputRef.current}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      className="text-gray-300"
                      onClick={(e) => {
                        e.preventDefault();
                        setImagePreview(null);
                        onChange(e as any, undefined);
                      }}
                    >
                      <Trash className="!size-6" />
                    </Button>
                  </div>
                </div>
              )}
            </Dropzone>

            {showErrors && <FormMessage className="mt-1">{fieldState.error?.message}</FormMessage>}
          </FormItem>
        );
      }}
    />
  );
}

FormInputImage.displayName = 'FormInputImage';

export { FormInputImage };

function createFileList(...files: File[]) {
  const list = new DataTransfer();
  files.forEach((file) => list.items.add(file));

  return list.files;
}

interface PreviewDialogProps {
  label?: string;
  imagePreview: string | null;
  cropperProps?: React.ComponentProps<typeof Cropper>;
  inputElement: HTMLInputElement | null;
}

function PreviewDialog({
  label,
  imagePreview,
  cropperProps = { stencilProps: {} },
  inputElement,
}: PreviewDialogProps) {
  const { stencilProps, ...cropperPropsRest } = cropperProps;

  const cropperRef = React.useRef<CropperRef>(null);
  const previewRef = React.useRef<CropperPreviewRef>(null);
  const resultRef = React.useRef<CropperPreviewRef>(null);

  const onUpdate = () => {
    previewRef.current?.refresh();
  };

  function onCrop() {
    if (!cropperRef.current || !inputElement || !resultRef.current) return;

    resultRef.current.update();
    const dataUrl = cropperRef.current.getCanvas()?.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], 'image.png', {
          type: 'image/png',
        });
        const url = URL.createObjectURL(file);
        console.log(url, dataUrl);

        inputElement.files = createFileList(file);

        inputElement.dispatchEvent(
          new Event('change', {
            bubbles: true,
            cancelable: true,
          }),
        );
      },
      undefined,
      1,
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" className="text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="29"
            height="32"
            viewBox="0 0 29 32"
            className="!size-6"
            fill="none"
          >
            <path
              d="M19.5 24C20.34 24 21 24.66 21 25.5C21 26.34 20.34 27 19.5 27C18.66 27 18 26.34 18 25.5C18 24.66 18.66 24 19.5 24ZM19.5 19.5C15.405 19.5 11.91 21.99 10.5 25.5C11.91 29.01 15.405 31.5 19.5 31.5C23.595 31.5 27.09 29.01 28.5 25.5C27.09 21.99 23.595 19.5 19.5 19.5ZM19.5 29.25C18.5054 29.25 17.5516 28.8549 16.8484 28.1516C16.1451 27.4484 15.75 26.4946 15.75 25.5C15.75 24.5054 16.1451 23.5516 16.8484 22.8484C17.5516 22.1451 18.5054 21.75 19.5 21.75C20.4946 21.75 21.4484 22.1451 22.1516 22.8484C22.8549 23.5516 23.25 24.5054 23.25 25.5C23.25 26.4946 22.8549 27.4484 22.1516 28.1516C21.4484 28.8549 20.4946 29.25 19.5 29.25ZM7.905 27H3V3H13.5V10.5H21V16.605C22.05 16.725 23.04 16.98 24 17.34V9L15 0H3C2.20435 0 1.44129 0.31607 0.87868 0.87868C0.31607 1.44129 0 2.20435 0 3V27C0 27.7956 0.31607 28.5587 0.87868 29.1213C1.44129 29.6839 2.20435 30 3 30H9.75C9 29.115 8.385 28.095 7.905 27Z"
              fill="currentColor"
            />
          </svg>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recorta tu imagen de {label}</DialogTitle>

          <DialogDescription>
            Ajusta tu imagen para que tenga el tamaño y la forma correcta.
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-row justify-between">
          <div>
            <p>Preview</p>
            <CropperPreview
              className="absolute h-12 w-12 rounded-full border border-secondary-600"
              ref={previewRef}
              cropper={cropperRef}
              // backgroundComponent={AdjustablePreviewBackground}
            />
          </div>

          <div>
            <p>Resultado</p>
            <CropperPreview
              className="absolute h-12 w-12 rounded-full border border-secondary-600"
              ref={resultRef}
              cropper={cropperRef}
            />
          </div>
        </section>

        <Cropper
          src={imagePreview}
          ref={cropperRef}
          stencilProps={{
            grid: true,
            ...stencilProps,
          }}
          {...cropperPropsRest}
          onUpdate={onUpdate}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            colors="secondary"
            className="mt-4"
            onClick={onCrop}
          >
            Recortar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
