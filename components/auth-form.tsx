import Form from 'next/form';
import { Input } from './ui/input';
import { Label } from './ui/label';


export function AuthForm({
  action,
  children,
  defaultEmail = '',
  defaultName = '',
  showNameField = false, // NEW
  showLinkedInImport = false, // New prop to control LinkedIn import visibility
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  defaultName?: string;

  showLinkedInImport?: boolean; // Add this to handle the conditional display
  showNameField?: boolean; // NEW

}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">

      {showNameField && (
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="name"
            className="text-zinc-600 font-normal"
          >
            Full Name
          </Label>

          <Input
            id="name"
            name="name"
            className="bg-[hsl(0,0%,95%)] text-black border-[hsl(0,0%,90%)] placeholder:text-[hsl(0,0%,45%)] focus-visible:ring-[hsl(0,0%,98%)] text-md md:text-sm dark:bg-[hsl(0,0%,95%)] dark:text-black dark:border-[hsl(0,0%,90%)] dark:placeholder:text-[hsl(0,0%,45%)]"
            type="text"
            placeholder="Jerry Seinfeld"
            required
            defaultValue={defaultName}

          />
        </div>
      )}


      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-[hsl(0,0%,95%)] text-black border-[hsl(0,0%,90%)] placeholder:text-[hsl(0,0%,45%)] focus-visible:ring-[hsl(0,0%,98%)] text-md md:text-sm dark:bg-[hsl(0,0%,95%)] dark:text-black dark:border-[hsl(0,0%,90%)] dark:placeholder:text-[hsl(0,0%,45%)]"
          type="email"
          placeholder="jerry@networkqy.com"
          autoComplete="email"
          required
          autoFocus
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-[hsl(0,0%,95%)] text-black border-[hsl(0,0%,90%)] placeholder:text-[hsl(0,0%,45%)] focus-visible:ring-[hsl(0,0%,98%)] text-md md:text-sm dark:bg-[hsl(0,0%,95%)] dark:text-black dark:border-[hsl(0,0%,90%)] dark:placeholder:text-[hsl(0,0%,45%)]"
          type="password"
          required
        />
      </div>

      {/* Conditionally Render LinkedIn Data or Manual Info Section */}
      {showLinkedInImport && (
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="linkedin-info"
            className="text-zinc-600 font-normal"
          >
            Import LinkedIn Data or Enter Info Manually
          </Label>

          {/* Input to manually enter data */}
          <Input
            id="linkedin-info"
            name="linkedin-info"
            className="bg-[hsl(0,0%,95%)] text-black border-[hsl(0,0%,90%)] placeholder:text-[hsl(0,0%,45%)] focus-visible:ring-[hsl(0,0%,98%)] text-md md:text-sm dark:bg-[hsl(0,0%,95%)] dark:text-black dark:border-[hsl(0,0%,90%)] dark:placeholder:text-[hsl(0,0%,45%)]"
            type="text"
            placeholder="Enter your information manually or import from LinkedIn"
          />
        </div>
      )}

      {children}
    </Form>
  );
}
