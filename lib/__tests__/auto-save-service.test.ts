import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AutoSaveService, OfflineQueueManager } from '../auto-save-service'
import { DashboardLayout } from '@/prisma/generated/prisma'

describe('AutoSaveService', () => {
    let mockSaveFunction: ReturnType<typeof vi.fn>
    let service: AutoSaveService
    let mockLayout: DashboardLayout

    beforeEach(() => {
        mockSaveFunction = vi.fn()
        mockLayout = {
            desktop: [],
            mobile: [],
            userId: 'test-user',
            id: 'test-id',
            version: 1,
            checksum: null,
            deviceId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        vi.clearAllMocks()
    })

    afterEach(() => {
        if (service) {
            service.dispose()
        }
    })

    describe('Basic Functionality', () => {
        it('should trigger save after debounce period', async () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, { debounceMs: 100 })

            service.trigger(mockLayout, 'normal')
            expect(mockSaveFunction).not.toHaveBeenCalled()

            await new Promise(resolve => setTimeout(resolve, 150))
            expect(mockSaveFunction).toHaveBeenCalledTimes(1)
        })

        it('should debounce rapid triggers', async () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, { debounceMs: 100 })

            service.trigger(mockLayout, 'normal')
            service.trigger(mockLayout, 'normal')
            service.trigger(mockLayout, 'normal')

            await new Promise(resolve => setTimeout(resolve, 150))
            expect(mockSaveFunction).toHaveBeenCalledTimes(1)
        })

        it('should execute high priority saves immediately', async () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, { debounceMs: 1000 })

            const startTime = Date.now()
            service.trigger(mockLayout, 'high')

            await new Promise(resolve => setTimeout(resolve, 200))
            const duration = Date.now() - startTime

            expect(duration).toBeLessThan(500)
            expect(mockSaveFunction).toHaveBeenCalledTimes(1)
        })

        it('should prevent concurrent saves', async () => {
            let resolveSave: ((value: { success: boolean; error?: string }) => void) | undefined
            const slowSaveFunction = vi.fn(() =>
                new Promise<{ success: boolean; error?: string }>(resolve => {
                    resolveSave = resolve
                })
            )

            service = new AutoSaveService(slowSaveFunction, { debounceMs: 10 })
            service.trigger(mockLayout, 'high')
            service.trigger(mockLayout, 'high')

            await new Promise(resolve => setTimeout(resolve, 50))
            expect(slowSaveFunction).toHaveBeenCalledTimes(1)

            resolveSave?.({ success: true })
            await new Promise(resolve => setTimeout(resolve, 50))
        })
    })

    describe('Retry Logic', () => {
        it('should retry on network errors', async () => {
            mockSaveFunction
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({ success: true })

            service = new AutoSaveService(mockSaveFunction, {
                debounceMs: 10,
                maxRetries: 5,
                retryBaseDelay: 50,
            })

            await service.flush()
            await new Promise(resolve => setTimeout(resolve, 500))

            expect(mockSaveFunction).toHaveBeenCalledTimes(3)
        })

        it('should respect max retries limit', async () => {
            mockSaveFunction.mockRejectedValue(new Error('Persistent error'))

            service = new AutoSaveService(mockSaveFunction, {
                debounceMs: 10,
                maxRetries: 3,
                retryBaseDelay: 50,
            })

            const onError = vi.fn()
            service.on('onError', onError)

            await service.flush()
            await new Promise(resolve => setTimeout(resolve, 1000))

            expect(mockSaveFunction).toHaveBeenCalledTimes(4) // Initial + 3 retries
            expect(onError).toHaveBeenCalledTimes(1)
        })

        it('should use exponential backoff', async () => {
            const timestamps: number[] = []
            mockSaveFunction = vi.fn(() => {
                timestamps.push(Date.now())
                return Promise.reject(new Error('Network error'))
            })

            service = new AutoSaveService(mockSaveFunction, {
                debounceMs: 10,
                maxRetries: 4,
                retryBaseDelay: 100,
                retryMaxDelay: 10000,
            })

            await service.flush()
            await new Promise(resolve => setTimeout(resolve, 3000))

            const delays = timestamps.slice(1).map((t, i) => t - timestamps[i])
            console.log('Delays between retries:', delays)

            for (let i = 1; i < delays.length; i++) {
                expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1])
            }
        })

        it('should not retry non-retryable errors', async () => {
            mockSaveFunction.mockRejectedValue(new Error('Validation failed'))

            service = new AutoSaveService(mockSaveFunction, {
                debounceMs: 10,
                maxRetries: 5,
                retryBaseDelay: 50,
            })

            const onError = vi.fn()
            service.on('onError', onError)

            await service.flush()
            await new Promise(resolve => setTimeout(resolve, 100))

            expect(mockSaveFunction).toHaveBeenCalledTimes(1)
            expect(onError).toHaveBeenCalledTimes(1)
        })
    })

    describe('Event Handlers', () => {
        it('should emit onStart event', async () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, { debounceMs: 10 })

            const onStart = vi.fn()
            service.on('onStart', onStart)

            service.trigger(mockLayout, 'normal')
            await service.flush()

            expect(onStart).toHaveBeenCalledTimes(1)
        })

        it('should emit onSuccess event with duration', async () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, { debounceMs: 10 })

            const onSuccess = vi.fn()
            service.on('onSuccess', onSuccess)

            service.trigger(mockLayout, 'normal')
            await service.flush()

            expect(onSuccess).toHaveBeenCalledTimes(1)
            expect(onSuccess).toHaveBeenCalledWith(
                expect.objectContaining({ layout: mockLayout }),
                expect.any(Number)
            )
        })

        it('should emit onError event on failure', async () => {
            const error = new Error('Save failed')
            mockSaveFunction.mockRejectedValue(error)

            service = new AutoSaveService(mockSaveFunction, {
                debounceMs: 10,
                maxRetries: 0,
            })

            const onError = vi.fn()
            service.on('onError', onError)

            service.trigger(mockLayout, 'normal')
            await service.flush()
            await new Promise(resolve => setTimeout(resolve, 50))

            expect(onError).toHaveBeenCalledTimes(1)
            expect(onError).toHaveBeenCalledWith(
                expect.objectContaining({ layout: mockLayout }),
                error
            )
        })

        it('should emit onRetry event', async () => {
            mockSaveFunction
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({ success: true })

            service = new AutoSaveService(mockSaveFunction, {
                debounceMs: 10,
                maxRetries: 3,
                retryBaseDelay: 50,
            })

            const onRetry = vi.fn()
            service.on('onRetry', onRetry)

            service.trigger(mockLayout, 'normal')
            await service.flush()
            await new Promise(resolve => setTimeout(resolve, 200))

            expect(onRetry).toHaveBeenCalledTimes(1)
        })
    })

    describe('Offline Support', () => {
        it('should enqueue saves when offline', async () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, {
                debounceMs: 10,
                enableOfflineSupport: true,
            })

            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false,
            })

            const onOffline = vi.fn()
            service.on('onOffline', onOffline)

            service.trigger(mockLayout, 'normal')
            await new Promise(resolve => setTimeout(resolve, 50))

            expect(onOffline).toHaveBeenCalled()
            expect(mockSaveFunction).not.toHaveBeenCalled()

            const queue = OfflineQueueManager.getInstance()
            const queued = await queue.getAll()
            expect(queued.length).toBeGreaterThan(0)

            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: true,
            })
        })

        it('should process offline queue when connection restored', async () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, {
                debounceMs: 10,
                enableOfflineSupport: true,
            })

            OfflineQueueManager.getInstance().enqueue({
                layout: mockLayout,
                timestamp: Date.now(),
                retryCount: 0,
                priority: 'normal',
            })

            const onlineEvent = new Event('online')
            window.dispatchEvent(onlineEvent)

            await new Promise(resolve => setTimeout(resolve, 100))

            expect(mockSaveFunction).toHaveBeenCalled()
        })
    })

    describe('Utility Methods', () => {
        it('should correctly report pending saves', () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, { debounceMs: 100 })

            service.trigger(mockLayout, 'normal')
            expect(service.hasPendingSave()).toBe(true)

            vi.advanceTimersByTime(150)
            expect(service.hasPendingSave()).toBe(false)
        })

        it('should cancel pending saves', () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, { debounceMs: 100 })

            service.trigger(mockLayout, 'normal')
            expect(service.hasPendingSave()).toBe(true)

            service.cancelPendingSave()
            expect(service.hasPendingSave()).toBe(false)
        })

        it('should flush pending saves immediately', async () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, { debounceMs: 1000 })

            service.trigger(mockLayout, 'normal')
            expect(service.hasPendingSave()).toBe(true)

            await service.flush()

            expect(mockSaveFunction).toHaveBeenCalledTimes(1)
            expect(service.hasPendingSave()).toBe(false)
        })

        it('should track save history', async () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, { debounceMs: 10 })

            service.trigger(mockLayout, 'normal')
            await service.flush()
            await new Promise(resolve => setTimeout(resolve, 50))

            const history = service.getSaveHistory()
            expect(history.size).toBeGreaterThan(0)
        })

        it('should limit save history size', async () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, { debounceMs: 10 })

            for (let i = 0; i < 150; i++) {
                const layout = { ...mockLayout }
                service.trigger(layout, 'normal')
                await service.flush()
                await new Promise(resolve => setTimeout(resolve, 10))
            }

            const history = service.getSaveHistory()
            expect(history.size).toBeLessThanOrEqual(100)
        })
    })

    describe('Edge Cases', () => {
        it('should handle disposed service', () => {
            mockSaveFunction.mockResolvedValue({ success: true })
            service = new AutoSaveService(mockSaveFunction, { debounceMs: 10 })

            service.dispose()

            service.trigger(mockLayout, 'normal')
            expect(mockSaveFunction).not.toHaveBeenCalled()
        })

        it('should handle null save function result', async () => {
            mockSaveFunction.mockResolvedValue(null)
            service = new AutoSaveService(mockSaveFunction, {
                debounceMs: 10,
                maxRetries: 2,
            })

            service.trigger(mockLayout, 'normal')
            await service.flush()
            await new Promise(resolve => setTimeout(resolve, 100))

            expect(mockSaveFunction).toHaveBeenCalledTimes(3)
        })

        it('should handle malformed response', async () => {
            mockSaveFunction.mockResolvedValue({ success: false, error: 'Unknown error' })
            service = new AutoSaveService(mockSaveFunction, {
                debounceMs: 10,
                maxRetries: 2,
            })

            const onError = vi.fn()
            service.on('onError', onError)

            service.trigger(mockLayout, 'normal')
            await service.flush()
            await new Promise(resolve => setTimeout(resolve, 100))

            expect(onError).toHaveBeenCalled()
        })

        it('should handle concurrent disposal', async () => {
            let resolveSave: (value: unknown) => void
            mockSaveFunction = vi.fn(() => 
                new Promise(resolve => {
                    resolveSave = resolve
                })
            )

            service = new AutoSaveService(mockSaveFunction, { debounceMs: 10 })
            service.trigger(mockLayout, 'high')

            await new Promise(resolve => setTimeout(resolve, 50))
            service.dispose()

            resolveSave!(undefined)
            await new Promise(resolve => setTimeout(resolve, 50))
        })
    })
})

describe('OfflineQueueManager', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        OfflineQueueManager.getInstance().clear()
    })

    it('should enqueue and dequeue requests', async () => {
        const manager = OfflineQueueManager.getInstance()
        const request = {
            layout: { desktop: [], mobile: [], userId: 'test', id: 'test', version: 1, checksum: null, deviceId: null, createdAt: new Date(), updatedAt: new Date() },
            timestamp: Date.now(),
            retryCount: 0,
            priority: 'normal' as const,
        }

        await manager.enqueue(request)
        const all = await manager.getAll()

        expect(all).toHaveLength(1)
        expect(all[0]).toEqual(request)

        await manager.dequeue(request.timestamp)
        const afterDequeue = await manager.getAll()

        expect(afterDequeue).toHaveLength(0)
    })

    it('should limit queue size', async () => {
        const manager = OfflineQueueManager.getInstance()

        for (let i = 0; i < 15; i++) {
            await manager.enqueue({
                layout: { desktop: [], mobile: [], userId: 'test', id: 'test', version: 1, checksum: null, deviceId: null, createdAt: new Date(), updatedAt: new Date() },
                timestamp: Date.now() + i,
                retryCount: 0,
                priority: 'normal',
            })
        }

        const all = await manager.getAll()
        expect(all.length).toBeLessThanOrEqual(10)
    })

    it('should clear queue', async () => {
        const manager = OfflineQueueManager.getInstance()

        await manager.enqueue({
            layout: { desktop: [], mobile: [], userId: 'test', id: 'test', version: 1, checksum: null, deviceId: null, createdAt: new Date(), updatedAt: new Date() },
            timestamp: Date.now(),
            retryCount: 0,
            priority: 'normal',
        })

        await manager.clear()
        const all = await manager.getAll()

        expect(all).toHaveLength(0)
    })
})
