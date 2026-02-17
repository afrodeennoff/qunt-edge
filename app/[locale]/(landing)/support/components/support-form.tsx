import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useI18n } from "@/locales/client";
import { useCallback, useEffect, useState } from "react";
import { sendSupportEmail } from "../../actions/send-support-email";
import { UIMessage } from "@ai-sdk/react";
import { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useUserStore } from "@/store/user-store";
import { createClient } from "@/lib/supabase";


export default function SupportForm({ summary, locale, messages, setMessages, sendMessage }: {
    summary: string,
    locale: 'en' | 'fr',
    messages: UIMessage[],
    setMessages: (messages: UIMessage[]) => void,
    sendMessage: (message: { text: string; files?: FileList; metadata?: unknown; messageId?: string } | { files: FileList; metadata?: unknown; messageId?: string }) => Promise<void>
}) {
    const t = useI18n()
    const [isContactFormOpen, setIsContactFormOpen] = useState(true)
    const [isSendingEmail, setIsSendingEmail] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [additionalInfo, setAdditionalInfo] = useState('')
    const supabase = createClient()

    useEffect(() => {
        const fetchUser = async () => {
            if (supabase) {
                const { data, error } = await supabase.auth.getUser()
                if (error) {
                    console.error('Error getting user:', error)
                    return
                }
                setName(data.user.user_metadata.full_name || '')
                setEmail(data.user.email || '')
            }
        }
        fetchUser()
    }, [supabase])

    const handleSendEmail = useCallback(async () => {
        if (isSendingEmail) return

        setIsSendingEmail(true)
        try {
            const contactInfo = { name, email, additionalInfo, locale }
            const result = await sendSupportEmail({
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.parts.filter(part => part.type === 'text').map(part => part.text).join('')
                })),
                summary,
                contactInfo,
            })
            if (result.success) {
                toast.success(t('support.emailSent'), {
                    description: t('success'),
                    duration: 5000,
                })
                // Add confirmation message using sendMessage
                setMessages([
                    ...messages,
                    {
                        id: Date.now().toString(),
                        role: 'assistant',
                        parts: [{
                            type: 'text',
                            text: t('support.emailConfirmation', { name: contactInfo.name, email: contactInfo.email })
                        }]
                    }
                ])
                setIsContactFormOpen(false)
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            console.error('Error sending email:', error)
            toast.error(t('support.emailError'), {
                description: t('error'),
                duration: 5000,
            })
        } finally {
            setIsSendingEmail(false)
        }
    }, [isSendingEmail, messages, setMessages, t, name, email, additionalInfo, locale, summary])

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSendEmail()
    }

    return (
        <Dialog open={isContactFormOpen} onOpenChange={setIsContactFormOpen}>
            <DialogContent className="enterprise-shell border-white/15 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-zinc-50">{t('support.contactInformation')}</DialogTitle>
                    <DialogDescription>
                        {t('support.contactInformationDescription')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="summary">{t('support.form.summary')}</Label>
                        <Textarea
                            id="summary"
                            value={summary}
                            readOnly
                            required
                            className="border-white/15 bg-black/35 text-zinc-100"
                        />
                    </div>
                    <div>
                        <Label htmlFor="name">{t('support.form.name')}</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="border-white/15 bg-black/35 text-zinc-100"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">{t('support.form.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border-white/15 bg-black/35 text-zinc-100"
                        />
                    </div>
                    <div>
                        <Label htmlFor="additionalInfo">{t('support.form.additionalInfo')}</Label>
                        <Textarea
                            id="additionalInfo"
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            placeholder={t('support.form.additionalInfoPlaceholder')}
                            className="border-white/15 bg-black/35 text-zinc-100"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => {
                            setIsContactFormOpen(false);
                            sendMessage(
                                {
                                    text: t('support.form.cancel'),
                                },
                            );
                        }} className="border-white/20 bg-transparent text-zinc-200 hover:bg-white/10">
                            {t('support.form.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSendingEmail} className="bg-white text-black hover:bg-zinc-200">
                            {isSendingEmail ? t('support.form.sending') : t('support.form.submit')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )

}
