import os

filepath = 'app/[locale]/(authentication)/components/user-auth-form.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Make UserAuthForm simpler. It has multiple variants returned.
# Let's break out the "Verification sent" UI.
verification_ui_orig = '''if (verificationLinkSent) {
    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight">Check your email</h3>
            <p className="text-sm text-muted-foreground max-w-[300px]">
              We&apos;ve sent a secure login link to <span className="font-medium text-foreground">{email}</span>.
              Please check your inbox.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full pt-4">
            <Button
              className="w-full gap-2"
              onClick={openMailClient}
            >
              Open Mail App
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setVerificationLinkSent(false);
                setIsLoading(false);
              }}
            >
              Try another email
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-4">
            Didn&apos;t receive it? Check your spam folder or <button onClick={onSubmitEmail} className="underline hover:text-primary transition-colors">resend the link</button>.
          </p>
        </div>
      </div>
    );
  }'''

verification_ui_new = '''if (verificationLinkSent) {
    return <VerificationSentView
      email={email}
      onOpenMail={openMailClient}
      onReset={() => { setVerificationLinkSent(false); setIsLoading(false); }}
      onResend={onSubmitEmail}
      className={className}
    />;
  }'''

content = content.replace(verification_ui_orig, verification_ui_new)

# Add VerificationSentView component
view_component = '''
function VerificationSentView({ email, onOpenMail, onReset, onResend, className }: { email: string, onOpenMail: () => void, onReset: () => void, onResend: (e: any) => void, className?: string }) {
  return (
    <div className={cn("grid gap-6", className)}>
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">Check your email</h3>
          <p className="text-sm text-muted-foreground max-w-[300px]">
            We&apos;ve sent a secure login link to <span className="font-medium text-foreground">{email}</span>.
            Please check your inbox.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full pt-4">
          <Button
            className="w-full gap-2"
            onClick={onOpenMail}
          >
            Open Mail App
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onReset}
          >
            Try another email
          </Button>
        </div>
        <p className="text-xs text-muted-foreground pt-4">
          Didn&apos;t receive it? Check your spam folder or <button onClick={onResend} className="underline hover:text-primary transition-colors">resend the link</button>.
        </p>
      </div>
    </div>
  );
}

export function UserAuthForm({ className, variant = "login", ...props }: UserAuthFormProps) {
'''

content = content.replace('export function UserAuthForm({ className, variant = "login", ...props }: UserAuthFormProps) {', view_component)

with open(filepath, 'w') as f:
    f.write(content)
