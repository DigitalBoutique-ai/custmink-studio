"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronRight, CloudUpload, Shirt, Sparkles, WandSparkles } from "lucide-react";
import { toast } from "sonner";

import { useProducts } from "@/components/techpack/product-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/types/techpack";

const types = ["T-Shirt", "Hoodie", "Polo", "Sweatshirt", "Jacket", "Tank", "Jogger", "Jersey"];

/**
 * Two-step AI create wizard, ported from the prototype.
 *
 * Creation still happens client-side (see `product-store.tsx`); Phase 5 swaps
 * the generate step for a real `ai_jobs` run behind review-before-apply.
 */
export function CreateTechPackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { createProduct } = useProducts();
  const [step, setStep] = useState(1);
  const [type, setType] = useState("Hoodie");
  const [name, setName] = useState("Untitled tech pack");

  const changeOpen = (next: boolean) => {
    if (!next) setStep(1);
    onOpenChange(next);
  };

  const create = () => {
    const product: Product = {
      id: `product-${Date.now()}`,
      name,
      code: `CI-${type.slice(0, 3).toUpperCase()}-${Math.floor(2400 + Math.random() * 400)}`,
      category: `${type}s`,
      season: "FW 2027",
      status: "Draft",
      progress: 18,
      color: "#8faee8",
      updated: "Just now",
    };
    createProduct(product);
    changeOpen(false);
    toast.success("New tech pack created");
    router.push(`/products/${product.id}/overview`);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="create-dialog">
        <DialogHeader>
          <div className="dialog-icon">
            <WandSparkles />
          </div>
          <DialogTitle>Generate a tech pack with AI</DialogTitle>
          <DialogDescription>
            Start with a product type, then describe what you want to make.
          </DialogDescription>
        </DialogHeader>
        <div className="wizard-progress">
          <span>Step {step} of 2</span>
          <Progress value={step * 50} />
        </div>
        {step === 1 ? (
          <div>
            <label className="field-label">What are you designing?</label>
            <div className="type-grid">
              {types.map((item) => (
                <button
                  className={type === item ? "type-card selected" : "type-card"}
                  key={item}
                  onClick={() => setType(item)}
                >
                  <Shirt />
                  <span>{item}</span>
                  {type === item && <Check />}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="prompt-step">
            <label className="field-label">
              Product name
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="field-label">
              Describe the design
              <Textarea
                defaultValue={`A premium oversized ${type.toLowerCase()} with a structured silhouette, clean construction, heavyweight organic cotton, and tonal branding.`}
              />
            </label>
            <div className="upload-drop">
              <CloudUpload />
              <strong>Upload a reference image</strong>
              <span>JPG, PNG, PDF, or AI up to 20 MB</span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => (step === 1 ? changeOpen(false) : setStep(1))}>
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button onClick={() => (step === 1 ? setStep(2) : create())}>
            {step === 1 ? (
              <>
                Continue <ChevronRight />
              </>
            ) : (
              <>
                <Sparkles /> Generate tech pack
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
