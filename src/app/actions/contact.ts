'use server';

import { sendContactEmail } from '@/lib/email';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export async function submitContactFormAction(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    const parsed = contactSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const res = await sendContactEmail(
      parsed.data.name,
      parsed.data.email,
      parsed.data.subject,
      parsed.data.message
    );

    if (!res.success) {
      return { success: false, error: 'Failed to send email. Please try again.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
