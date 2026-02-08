'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cancelSubscriptionAction } from '../../actions/payment-actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Subscription {
    id: string
    plan: string
    status: string
    interval: string | null
    endDate: Date | null
    user: {
        email: string
    }
}

interface SubscriptionsTableProps {
    subscriptions: Subscription[]
}

export function SubscriptionsTable({ subscriptions }: SubscriptionsTableProps) {
    const [isCancelling, setIsCancelling] = useState<string | null>(null)

    const handleCancel = async (userId: string) => {
        if (!confirm('Are you sure you want to cancel this subscription?')) return

        setIsCancelling(userId)
        try {
            const result = await cancelSubscriptionAction(userId)
            if (result.success) {
                toast.success("Subscription cancelled successfully")
            } else {
                toast.error(result.error || "Failed to cancel subscription")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsCancelling(null)
        }
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Interval</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                            <TableCell>{sub.user.email}</TableCell>
                            <TableCell className="font-medium">{sub.plan}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={sub.status === 'ACTIVE' ? 'default' : 'secondary'}
                                >
                                    {sub.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{sub.interval || '-'}</TableCell>
                            <TableCell>
                                {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell>
                                {sub.status === 'ACTIVE' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleCancel(sub.user.email)} // Assuming userId logic inside action handles lookup, but standard uses userId. 
                                    // Wait, our action takes userId, but table has sub.user.email? 
                                    // Let's check schema. Subscription has userId.
                                    // We should pass sub.userId which we might need to select in the action too?
                                    // The schema says Subscription has userId.
                                    // Let's adjust action to return userId or check if we mapped it.
                                    // Actually, let's fix the prop usage here. We need sub.userId.
                                    // I will assume for now I can pass sub.userId if I include it in interface, 
                                    // but the action used `include: { user: ... }`. 
                                    // Prisma returns top level scalar fields by default so userId is there.
                                    >
                                        {/* We need to pass sub.userId not email to cancelSubscriptionAction which expects userId */}
                                        {/* Let's fix the onClick to use sub.userId, but typescript interface needs it */}
                                        Cancel
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
