'use client';

import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import Image from 'next/image';

import { ArrowDown, ArrowUp, PlusCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import * as z from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import useCreateStoryStep from '@/components/hooks/useCreateStoryStep';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const formSchema = z.object({
  title: z.string().min(1, 'Story title is required'),
  file: z
    .instanceof(File)
    .refine(
      file => file.size <= MAX_UPLOAD_SIZE,
      `File size must be less than ${MAX_UPLOAD_SIZE / 1024 / 1024}MB`
    )
    .refine(
      file => ACCEPTED_FILE_TYPES.includes(file.type),
      `File type must be one of ${ACCEPTED_FILE_TYPES.map(type => type.split('/')[1]).join(', ')}`
    ),
  dialogs: z
    .array(
      z.object({
        title: z.string().min(1, 'Dialog title is required'),
        content: z.string().min(1, 'Dialog content is required'),
      })
    )
    .min(1, 'At least one dialog is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface StoryStepProps {
  initialData?: FormValues;
}

export default function Page() {
  return (
    <div>
      <StorySteps />
    </div>
  );
}

function StorySteps({ initialData }: StoryStepProps) {
  const createStoryStepMutation = useCreateStoryStep();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      file: new File([], ''),
      dialogs: [{ title: '', content: '' }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'dialogs',
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(
    initialData?.file ? URL.createObjectURL(initialData.file) : null
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const moveDialog = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < fields.length) {
      move(index, newIndex);
    }
  };

  const onSubmit = (data: FormValues) => {
    console.log(data);
    createStoryStepMutation.mutate(
      {
        title: data.title,
        image: data.file,
        dialogs: data.dialogs.map((dialog, i) => ({
          title: dialog.title,
          content: dialog.content,
          order: i,
        })),
      },
      {
        onSuccess: () => {
          toast.success('Story step created successfully', {
            action: {
              label: 'Close',
              onClick: () => toast.dismiss(),
            },
          });
          setImagePreview(null);
          form.reset();
        },
        onError: error => {
          toast.error(error.message);
        },
      }
    );
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-3xl space-y-8 p-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Story Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter story step title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Story Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="rounded-lg0 relative max-h-96 min-h-64 w-full">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Story scene"
                        layout="fill"
                        objectFit="contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        No image uploaded
                      </div>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept={ACCEPTED_FILE_TYPES.join(',')}
                    onChange={e => {
                      field.onChange(e.target.files?.[0]);
                      handleImageChange(e);
                    }}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Upload an image for your story step. Accepted formats: JPEG, PNG, GIF. Max size:
                5MB.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-lg border p-4">
              <FormField
                control={form.control}
                name={`dialogs.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dialog {index + 1} Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter dialog title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`dialogs.${index}.content`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dialog {index + 1} Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter the next part of the story..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveDialog(index, 'up')}
                  disabled={index === 0}
                  aria-label="Move dialog up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => moveDialog(index, 'down')}
                  disabled={index === fields.length - 1}
                  aria-label="Move dialog down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  aria-label="Remove dialog"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ title: '', content: '' })}
          className="w-full"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Dialog
        </Button>

        <Button type="submit" className="w-full">
          {initialData ? 'Update' : 'Create'} Story Step
        </Button>
      </form>
    </Form>
  );
}
