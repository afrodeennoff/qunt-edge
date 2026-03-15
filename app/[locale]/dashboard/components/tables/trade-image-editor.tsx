"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";
import { useHashUpload } from "@/hooks/use-hash-upload";
import { toast } from "sonner";
import { useI18n } from "@/locales/client";
import { useUserStore } from "@/store/user-store";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { useDashboardActions } from "@/context/data-provider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { withSupabaseImageTransform } from "@/lib/supabase-storage";
import { ensureOwnedImagePath, extractTradeImagePath } from "@/lib/trade-image-path";

const supabase = createClient();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 10; // Maximum number of images allowed
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

interface TradeWithImages {
  id: string;
  images?: string[];
  imageBase64?: string | null;
  imageBase64Second?: string | null;
}

type ImageUpdatePayload = {
  images: string[];
  imageBase64: string | null;
  imageBase64Second: string | null;
};

const buildImageUpdatePayload = (images: string[]): ImageUpdatePayload => ({
  images,
  imageBase64: images[0] ?? null,
  imageBase64Second: images[1] ?? null,
});

const isNonEmptyString = (
  value: string | null | undefined,
): value is string => Boolean(value);

const getCurrentImageList = (
  images?: string[],
  imageBase64?: string | null,
  imageBase64Second?: string | null,
): string[] => {
  if (images && images.length > 0) {
    return [...images];
  }

  return [imageBase64, imageBase64Second].filter(isNonEmptyString);
};

interface TradeImageEditorProps {
  trade: TradeWithImages;
  tradeIds: string[];
}

export function TradeImageEditor({ trade, tradeIds }: TradeImageEditorProps) {
  const t = useI18n();
  const user = useUserStore((state) => state.user);
  const supabaseUser = useUserStore((state) => state.supabaseUser);
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [localImages, setLocalImages] = useState<{ imageBase64: string | null; imageBase64Second: string | null } | null>(null);
  const [resolvedImageUrls, setResolvedImageUrls] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const { getTradeImages, updateTrades } = useDashboardActions();

  // Use hash-based upload hook
  const uploadProps = useHashUpload({
    bucketName: "trade-images",
    path: supabaseUser?.id ? `${supabaseUser.id}/trades` : user?.auth_user_id ? `${user.auth_user_id}/trades` : "trades",
    allowedMimeTypes: ACCEPTED_IMAGE_TYPES,
    maxFileSize: MAX_FILE_SIZE,
    maxFiles: MAX_IMAGES,
  });

  const {
    errors: uploadErrors,
    isSuccess: uploadSuccess,
    setErrors: resetUploadErrors,
    setFiles: resetUploadFiles,
    uploadedPaths,
  } = uploadProps;

  const actorImagePrefix =
    supabaseUser?.id
      ? `${supabaseUser.id}/`
      : user?.auth_user_id
        ? `${user.auth_user_id}/`
        : null

  // Determine if we have images (either URLs or legacy base64 fields)
  // Source images from local state (fetched on demand) or from the trade object itself
  const resolvedImageBase64 = localImages?.imageBase64 || trade.imageBase64;
  const resolvedImageBase64Second = localImages?.imageBase64Second || trade.imageBase64Second;

  const imageArray: string[] =
    trade.images && trade.images.length > 0
      ? trade.images.filter((image): image is string => typeof image === "string" && image.length > 0)
      : [resolvedImageBase64, resolvedImageBase64Second].filter(
          (image): image is string => typeof image === "string" && image.length > 0,
        );

  useEffect(() => {
    let cancelled = false;

    const resolveImageUrls = async () => {
      if (imageArray.length === 0) {
        if (!cancelled) setResolvedImageUrls([]);
        return;
      }

      const urls = await Promise.all(
        imageArray.map(async (imageReference: string) => {
          const path = extractTradeImagePath(imageReference);
          if (!path) {
            return imageReference;
          }

          // Backward compatibility for old publicly stored image URLs.
          if (
            imageReference.startsWith("http") &&
            imageReference.includes("/storage/v1/object/public/trade-images/")
          ) {
            return imageReference;
          }

          const { data, error } = await supabase.storage
            .from("trade-images")
            .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

          if (error || !data?.signedUrl) {
            console.error("Failed to create signed URL for trade image:", error?.message);
            return imageReference;
          }

          return data.signedUrl;
        })
      );

      if (!cancelled) {
        setResolvedImageUrls(urls);
      }
    };

    void resolveImageUrls();

    return () => {
      cancelled = true;
    };
  }, [imageArray]);

  const displayImageArray =
    resolvedImageUrls.length === imageArray.length ? resolvedImageUrls : imageArray;

  const handleOpenGallery = useCallback(async () => {
    setIsOpen(true);
    // If we only have legacy fields and haven't loaded them yet, fetch them
    if (
      !trade.images?.length &&
      (trade.imageBase64 || trade.imageBase64Second) &&
      !localImages &&
      !isLoadingImages
    ) {
      setIsLoadingImages(true);
      try {
        const images = await getTradeImages(trade.id);
        if (images) {
          setLocalImages(images);
        }
      } catch (error) {
        console.error("Failed to load images:", error);
      } finally {
        setIsLoadingImages(false);
      }
    }
  }, [trade.id, trade.images, trade.imageBase64, trade.imageBase64Second, localImages, isLoadingImages, getTradeImages]);

  useEffect(() => {
    if (!uploadSuccess && uploadErrors.length === 0) {
      return;
    }

    const processUploadResult = async () => {
      if (uploadSuccess && uploadedPaths.length > 0) {
        const currentImages = getCurrentImageList(
          trade.images,
          trade.imageBase64,
          trade.imageBase64Second,
        );
        const updatedImages = [...currentImages, ...uploadedPaths];
        const update = buildImageUpdatePayload(updatedImages);

        await updateTrades(tradeIds, update);
        setUploadDialogOpen(false);
        toast.success(t("trade-table.imageUploadSuccess"));
        resetUploadFiles([]);
        resetUploadErrors([]);
        return;
      }

      if (uploadErrors.length > 0) {
        const errorMessage = uploadErrors[0].message;
        toast.error(t("trade-table.imageUploadError", { error: errorMessage }));
      }
    };

    void processUploadResult();
  }, [
    uploadSuccess,
    uploadedPaths,
    uploadErrors,
    trade.imageBase64,
    trade.imageBase64Second,
    trade.images,
    tradeIds,
    updateTrades,
    setUploadDialogOpen,
    resetUploadFiles,
    resetUploadErrors,
    t,
  ]);

  const handleRemoveImage = async (imageIndex: number) => {
    try {
      const currentImages = getCurrentImageList(
        trade.images,
        trade.imageBase64,
        trade.imageBase64Second,
      );

      const imageUrl = currentImages[imageIndex];

      // Update the images array by filtering out the removed image
      const newImages = currentImages.filter((_, index) => index !== imageIndex);
      const update = buildImageUpdatePayload(newImages);

      await updateTrades(tradeIds, update);

      // Remove the image from Supabase storage
      if (imageUrl) {
        // Extract the path from the full URL
        const path = extractTradeImagePath(imageUrl);
        if (path) {
          const ownedPath = ensureOwnedImagePath(path, actorImagePrefix);
          await supabase.storage.from("trade-images").remove([ownedPath]);
        }
      }

      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleRemoveAllImages = async () => {
    try {
      const update = buildImageUpdatePayload([]);
      await updateTrades(tradeIds, update);

      // Get all images to remove from both new and legacy fields
      const imagesToRemove: string[] = [];

      // From new images array
      if (trade.images && trade.images.length > 0) {
        trade.images.forEach((imageUrl: string) => {
          const path = extractTradeImagePath(imageUrl);
          if (path) imagesToRemove.push(path);
        });
      }

      // From legacy fields (in case they're not in the images array)
      if (trade.imageBase64) {
        const path = extractTradeImagePath(trade.imageBase64);
        if (path && !imagesToRemove.includes(path)) imagesToRemove.push(path);
      }
      if (trade.imageBase64Second) {
        const path = extractTradeImagePath(trade.imageBase64Second);
        if (path && !imagesToRemove.includes(path)) imagesToRemove.push(path);
      }

      if (imagesToRemove.length > 0) {
        const ownedPaths: string[] = [];
        const unauthorized: string[] = [];

        imagesToRemove.forEach((path) => {
          try {
            ownedPaths.push(ensureOwnedImagePath(path, actorImagePrefix));
          } catch {
            unauthorized.push(path);
          }
        });

        if (unauthorized.length > 0) {
          console.error("Blocked deletion of image paths outside actor prefix", {
            unauthorized,
          });
          toast.error("Failed to delete image");
          return;
        }

        if (ownedPaths.length > 0) {
          await supabase.storage.from("trade-images").remove(ownedPaths);
        }
      }
    } catch (error) {
      console.error("Error removing all images:", error);
    }
  };

  const handleUploadClick = () => {
    if (imageArray.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    setUploadDialogOpen(true);
  };

  // Reset upload state when dialog closes
  useEffect(() => {
    if (!uploadDialogOpen) {
      resetUploadFiles([]);
      resetUploadErrors([]);
    }
  }, [uploadDialogOpen, resetUploadFiles, resetUploadErrors]);

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    setScale(1); // Reset zoom when changing images
  };

  return (
    <>
      <div className="flex gap-2">
        {imageArray.length > 0 ? (
          <div className="relative group">
            <button
              onClick={handleOpenGallery}
              className="relative w-10 h-10 overflow-hidden rounded focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-ring"
              aria-label="View image"
            >
              {isLoadingImages ? (
                <div className="flex items-center justify-center w-full h-full bg-muted animate-pulse">
                  <ZoomIn className="h-4 w-4 text-muted-foreground animate-bounce" />
                </div>
              ) : (
                <>
                  <Image
                    src={
                      displayImageArray[0]
                        ? withSupabaseImageTransform(displayImageArray[0], {
                            width: 80,
                            height: 80,
                            quality: 75,
                          })
                        : "/icon.png"
                    }
                    alt="Trade image"
                    className="object-cover w-full h-full"
                    width={40}
                    height={40}
                  />
                  {imageArray.length > 1 && (
                    <span className="absolute bottom-1 right-1 bg-card/92 text-foreground text-xs px-1 rounded">
                      {imageArray.length}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Add second image button - only show when there's exactly one image */}
            {imageArray.length === 1 && (
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  {imageArray.length < MAX_IMAGES && (
                    <button
                      className="absolute -top-2 -left-2 h-5 w-5 bg-primary text-primary-foreground rounded-full hidden group-hover:flex items-center justify-center shadow-xs hover:bg-primary/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadClick();
                      }}
                    >
                      <Upload className="h-3 w-3" />
                    </button>
                  )}
                </HoverCardTrigger>
                <HoverCardContent side="top" align="center" className="text-xs">
                  Upload second image
                </HoverCardContent>
              </HoverCard>
            )}

            <HoverCard openDelay={300}>
              <HoverCardTrigger asChild>
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full hidden group-hover:flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors duration-200 touch-action-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  aria-label="Delete images"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              </HoverCardTrigger>
              <HoverCardContent side="top" align="center" className="text-xs">
                Delete Images
              </HoverCardContent>
            </HoverCard>
          </div>
        ) : (
          <button
            onClick={handleUploadClick}
            className="relative w-10 h-10 overflow-hidden rounded focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-ring bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Upload image"
          >
            <Upload className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
          </button>
        )}

        {imageArray.length > 0 && imageArray.length < 2 && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <button
                onClick={handleUploadClick}
                className="relative w-10 h-10 overflow-hidden rounded focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-ring bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Upload second image"
              >
                <Upload className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                <span className="absolute bottom-1 right-1 bg-primary/10 text-primary text-xs px-1 rounded">
                  +1
                </span>
              </button>
            </HoverCardTrigger>
            <HoverCardContent side="top" align="center" className="text-xs">
              Upload second image
            </HoverCardContent>
          </HoverCard>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Image Gallery</DialogTitle>
          </DialogHeader>

          <div className="relative h-[70vh] sm:h-[70vh] bg-muted/40 p-4 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 p-2 sm:p-4"
              >
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={3}
                  centerOnInit
                  limitToBounds
                  smooth
                  doubleClick={{
                    mode: "reset",
                  }}
                  onTransformed={(_, state) => {
                    setScale(state.scale);
                  }}
                >
                  {({ zoomIn, zoomOut }) => (
                    <>
                      <TransformComponent
                        wrapperClass="w-full! h-full!"
                        contentClass="w-full! h-full! flex items-center justify-center"
                      >
                        <div className="relative flex items-center justify-center w-full h-full">
                          <Image
                            src={displayImageArray[selectedImageIndex]}
                            alt="Trade image"
                            className="object-contain select-none"
                            fill
                            unoptimized
                            sizes="90vw"
                            style={{ margin: "auto" }}
                          />
                        </div>
                      </TransformComponent>

                      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-secondary/220 backdrop-blur-xs z-50">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-linear-to-r bg-card hover:bg-accent/70 shadow-lg border border-border ring-1 ring-border/60 h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => zoomOut()}
                          disabled={scale <= 0.5}
                        >
                          <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4 text-foreground" />
                        </Button>
                        <span className="min-w-10 sm:min-w-12 text-center text-xs sm:text-sm font-medium text-foreground">
                          {Math.round(scale * 100)}%
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-linear-to-r bg-card hover:bg-accent/70 shadow-lg border border-border ring-1 ring-border/60 h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => zoomIn()}
                          disabled={scale >= 3}
                        >
                          <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4 text-foreground" />
                        </Button>
                      </div>
                    </>
                  )}
                </TransformWrapper>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t p-4">
            <Carousel className="w-full">
              <CarouselContent className="w-full flex items-center justify-center gap-2">
                {displayImageArray.map((image: string, index: number) => (
                  <CarouselItem key={index} className="basis-auto">
                    <button
                      type="button"
                      className="relative aspect-square cursor-pointer"
                      onClick={() => handleThumbnailClick(index)}
                      aria-label={`Select image ${index + 1}`}
                      aria-pressed={selectedImageIndex === index}
                    >
                      <Image
                        src={withSupabaseImageTransform(image, {
                          width: 80,
                          height: 80,
                          quality: 75,
                        })}
                        alt={`Thumbnail ${index + 1}`}
                        width={40}
                        height={40}
                        className={cn(
                          "object-cover w-12 h-12 rounded-md transition-all",
                          selectedImageIndex === index
                            ? "ring-2 ring-primary"
                            : "hover:ring-2 hover:ring-primary/50",
                        )}
                      />
                    </button>
                  </CarouselItem>
                ))}
                {imageArray.length < MAX_IMAGES && (
                  <CarouselItem className="basis-auto">
                    <Button
                      size={"icon"}
                      variant={"secondary"}
                      onClick={handleUploadClick}
                      className={cn(
                        "w-full aspect-square rounded-md",
                        "border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50",
                        "transition-colors flex items-center justify-center",
                        "h-12 w-12",
                      )}
                    >
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </Button>
                  </CarouselItem>
                )}
              </CarouselContent>
              {imageArray.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Images</DialogTitle>
            <DialogDescription>
              Delete individual images or remove all at once. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {displayImageArray.map((imageUrl: string, index: number) => (
                <motion.div
                  key={imageUrl}
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, scale: 0.8 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="group relative flex items-center gap-4 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors duration-200"
                >
                  <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0 border border-border">
                    <Image
                      src={withSupabaseImageTransform(imageUrl, {
                        width: 192,
                        height: 192,
                        quality: 80,
                      })}
                      alt={`Trade image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">Image {index + 1}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {imageUrl.split("/").pop()?.substring(0, 40)}...
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleRemoveImage(index);
                      if (imageArray.length === 1) {
                        setShowDeleteConfirm(false);
                      }
                    }}
                    className="flex-shrink-0 h-9 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 touch-action-manipulation"
                    aria-label={`Delete image ${index + 1}`}
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                }}
              className="w-full sm:w-auto transition-colors duration-200"
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await handleRemoveAllImages();
                setShowDeleteConfirm(false);
                toast.success(t("trade-table.allImagesDeleted"));
              }}
              className="w-full sm:w-auto gap-2 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
              Delete All {imageArray.length} Images
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("trade-table.uploadImage")}</DialogTitle>
            <DialogDescription>
              {`Upload up to ${MAX_IMAGES - imageArray.length} more images (${imageArray.length}/${MAX_IMAGES} used)`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Dropzone {...uploadProps}>
              {uploadProps.files.length > 0 ? (
                <DropzoneContent />
              ) : (
                <DropzoneEmptyState />
              )}
            </Dropzone>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
