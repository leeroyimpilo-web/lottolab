import type { Metadata } from "next";
import LottoLabPreview from "@/lottolab-ui/src/LottoLabPreview";
export const metadata: Metadata = { title: "LottoLab — UI-only preview", description: "Isolated LottoLab visual prototype using invented sample data." };
export default function UiPreviewPage(){ return <LottoLabPreview/>; }
