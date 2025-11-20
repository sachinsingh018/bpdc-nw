'use server';

import { z } from 'zod';

import { createUser, getUser } from '@/lib/db/queries';
// import { setCookie } from '@/lib/cookies'; // Import the setCookie function


import { signIn } from './auth';

import { createPremUser } from '@/lib/db/queries';  // Import your createPremUser function

const premUserFormSchema = z.object({
  fullName: z.string().min(1),
  emailAddress: z.string().email(),
  phoneNumber: z.string().optional(),
  paragraphInterest: z.string().optional(),
});

export interface CreatePremUserActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const createPremUserAction = async (
  _: CreatePremUserActionState,
  formData: FormData,
): Promise<CreatePremUserActionState> => {
  try {
    // Validate form data using the premUserFormSchema
    const validatedData = premUserFormSchema.parse({
      fullName: formData.get('fullName'),
      emailAddress: formData.get('emailAddress'),
      phoneNumber: formData.get('phoneNumber'),
      paragraphInterest: formData.get('paragraphInterest'),
    });

    // Call the createPremUser function to insert into the database
    await createPremUser(validatedData);

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};


const authFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = loginSchema.parse({
      // name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });


    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
  | 'idle'
  | 'in_progress'
  | 'success'
  | 'failed'
  | 'user_exists'
  | 'invalid_data';
  email?: string;
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });


    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    // await createUser(validatedData.email, validatedData.password);
    const linkedinInfo = formData.get('linkedin-info') as string | null;
    let linkedinData = 'Placeholder'; // Default or placeholder

    console.log('Initial LinkedIn Data:', linkedinData);

    if (linkedinInfo) {
      const cleanedUrl = linkedinInfo.trim();
      const isLinkedInProfileUrl = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+\/?$/.test(cleanedUrl);

      if (isLinkedInProfileUrl) {
        try {
          console.log('Fetching LinkedIn data for:', cleanedUrl);

          const proxycurlApiKey = process.env.PROXYCURL_API_KEY; // Store this in .env

          const response = await fetch(
            `https://nubela.co/proxycurl/api/v2/linkedin?url=${encodeURIComponent(cleanedUrl)}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${proxycurlApiKey}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch from Proxycurl: ${response.statusText}`);
          }

          const result = await response.json();
          linkedinData = JSON.stringify(result); // Or store as object
          console.log('LinkedIn Data (fetched):', linkedinData);
        } catch (error) {
          console.error('Error fetching LinkedIn data:', error);
          linkedinData = cleanedUrl;
        }
      } else {
        console.log('LinkedIn input is not a profile URL. Using raw input.');
        linkedinData = cleanedUrl;
      }
    }

    console.log('Calling createUser with LinkedIn Data:', linkedinData);

    // Wait for the creation to complete after LinkedIn data is fetched
    // await createUser(validatedData.email, validatedData.password, linkedinData);
    // await createUser(validatedData.name, validatedData.email, validatedData.password, linkedinData);

    await createUser({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      linkedinInfo: formData.get('linkedin-info')?.toString(), // ✅ maps 'About you'
      goals: formData.get('goals')?.toString(),
      profilemetrics: formData.get('profilemetrics')?.toString(),
      strengths: formData.get('strengths')?.toString(),
      interests: formData.get('interests')?.toString(),
      linkedinURL: formData.get('linkedinURL')?.toString(),
      FacebookURL: formData.get('FacebookURL')?.toString(),
      phone: formData.get('phone')?.toString(),
      referral_code: formData.get('referral_code')?.toString() || undefined, // ✅ Make referral_code optional
      createdAt: new Date(), // ✅ this line
    });

    // setCookie('messageLimit', '5');

    console.log('User creation completed.');

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success', email: validatedData.email };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RecruiterSignUpActionState {
  status:
  | 'idle'
  | 'in_progress'
  | 'success'
  | 'failed'
  | 'user_exists'
  | 'invalid_data';
  email?: string;
}

export const recruiterSignUp = async (
  _: RecruiterSignUpActionState,
  formData: FormData,
): Promise<RecruiterSignUpActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RecruiterSignUpActionState;
    }

    // Create recruiter user with basic data only, role set to "recruiter"
    await createUser({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      role: 'recruiter', // Set role to recruiter
      createdAt: new Date(),
    });

    console.log('Recruiter user creation completed.');

    // Sign in the recruiter after successful registration
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success', email: validatedData.email };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};
