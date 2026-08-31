"use client";

import { FileImage, Sparkles, Upload } from "lucide-react";

import { Garment } from "@/components/techpack/garment";
import { Button } from "@/components/ui/button";

export function ArtworkPanel() {
  return (
    <div className="section-stack">
      <section className="section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Artwork &amp; decoration</p>
            <h2>Placement map</h2>
            <p>Production-ready artwork details and print dimensions.</p>
          </div>
          <Button>
            <Upload /> Upload artwork
          </Button>
        </div>
        <div className="artwork-layout">
          <div className="artwork-stage">
            <Garment color="#8faee8" artworkSize={42} />
          </div>
          <div className="artwork-details">
            <span className="file-icon">
              <FileImage />
            </span>
            <h3>CUSTM Wordmark</h3>
            <p>custm-wordmark-vector.ai · 1.8 MB</p>
            <dl>
              <div>
                <dt>Placement</dt>
                <dd>Front chest</dd>
              </div>
              <div>
                <dt>Technique</dt>
                <dd>Screen print</dd>
              </div>
              <div>
                <dt>Dimensions</dt>
                <dd>28 × 6.5 cm</dd>
              </div>
              <div>
                <dt>Ink</dt>
                <dd>Soft-hand black</dd>
              </div>
            </dl>
            <Button variant="outline">
              <Sparkles /> Remove background
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
